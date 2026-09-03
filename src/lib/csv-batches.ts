/*
 * Blockbildung für den CSV-Import — Fehlerbehebung 03.09.2026.
 *
 * WARUM ES DAS GIBT
 * -----------------
 * `process_csv_import` läuft als EIN Statement. Die Rolle `authenticated` hat
 * `statement_timeout = 8s` (gemessen gegen `pg_roles`, 03.09.2026). Die Funktion
 * rechnet pro NEUER, nicht-interner Zeile gegen JEDE im Monat aktive Karte eine
 * Konfidenz — gemessen im Trockenlauf (LL-18) auf Produktion:
 *
 *     40 echte Zeilen aus 2023  →  3.714 ms  =  92,85 ms je Zeile
 *
 * Der Visa-Jahresexport vom 01.09.2026 enthält 2.535 Zeilen, davon 2.031 vor
 * 2025 und damit sämtlich neu (in der Datenbank lag kein Fragment vor dem
 * 02.01.2025). Hochgerechnet: ~188 s gegen ein Limit von 8 s — Faktor 23. Der
 * Import lief in den Timeout, die Transaktion rollte zurück, und der Nutzer sah
 * „Datei fehlerhaft". Nichts an der Datei war fehlerhaft; der Parser verarbeitet
 * sie in 4 ms vollständig.
 *
 * Das ist LL-29 in einer neuen Gestalt: nicht die Anzahl der Netzrunden, sondern
 * die Menge der Arbeit IN einer Runde ist über eine Grenze gewachsen, die
 * niemand im Blick hatte — und wie dort ist keine einzige Zahl falsch, die
 * Antwort kommt nur nie an. Und es ist LL-28: Die Import-Funktion wurde für
 * Monatsauszüge von ~30 Zeilen entworfen. Diese Annahme stand nirgends.
 *
 * DIE FALLE, DIE DIESE DATEI ÜBERHAUPT NÖTIG MACHT
 * ------------------------------------------------
 * Zeilen einfach in Blöcke zu schneiden wäre falsch. Der Parser-Vertrag ④
 * (`dkb-visa-csv.ts`) sagt: Die Laufnummer byte-identischer Zeilen hängt an der
 * Ordinalität des Batches. `process_csv_import` bildet sie mit
 *
 *     row_number() OVER (PARTITION BY date, amount, description ORDER BY ord)
 *
 * und hängt ab dem 2. Vorkommen `|#N` an den Hash. Diese Zählung läuft
 * ausschließlich INNERHALB von `p_rows`. Landen zwei byte-identische Zeilen in
 * verschiedenen Blöcken, bekommen BEIDE `occurrence_idx = 1`, also denselben
 * Hash — die zweite wird als Duplikat verworfen. Eine echte Zahlung ginge
 * verloren, ohne Fehlermeldung, und die Sparrate des Monats wäre still falsch.
 *
 * Deshalb schneidet `buildImportBatches` nie durch eine Gruppe byte-identischer
 * Zeilen hindurch. In der auslösenden Datei sind das 39 Gruppen mit 80 Zeilen,
 * größte Gruppe 3 Zeilen, größte Spannweite 7 Positionen — die Grenzen
 * verschieben sich also um höchstens ein paar Zeilen.
 *
 * WARUM DIE BLOCKBILDUNG REIN AUS DER DATEI FOLGT
 * -----------------------------------------------
 * Sie ist deterministisch: dieselbe Datei ergibt immer dieselben Blöcke. Das ist
 * keine Ästhetik, sondern die Bedingung dafür, dass ein abgebrochener Import
 * durch erneutes Einwerfen derselben Datei sauber fortgesetzt werden kann — die
 * bereits geschriebenen Zeilen erzeugen dann exakt dieselben Hashes und werden
 * als Duplikate übersprungen. Eine an der Laufzeit ausgerichtete („adaptive")
 * Blockgröße hätte diese Eigenschaft nicht.
 */

/** Das Minimum, das die Blockbildung von einer Zeile wissen muss. Bewusst
 *  strukturell statt `ParsedCsvRow`: Der Schlüssel muss dieselben drei Felder
 *  benutzen wie die `PARTITION BY`-Klausel der RPC — und nur die. */
type BatchableRow = {
  transaction_date: string;
  amount: number;
  description: string;
};

/**
 * Zeilen je Block. Aus der Messung hergeleitet, nicht geschätzt:
 * 92,85 ms je Zeile × 25 = ~2,3 s gegen ein Limit von 8 s — Reserve Faktor 3,4.
 *
 * Die Reserve ist nicht üppig, sondern nötig: Die kostenlose Datenbank-Instanz
 * gerät unter Dauerlast in die CPU-Drosselung (LL-29), und dann steigt die Zeit
 * je Zeile. Ein zu großer Block macht aus einer langsamen Antwort wieder einen
 * Totalausfall — ein zu kleiner kostet nur ein paar Netzrunden mehr, während die
 * eigentliche Arbeit gleich bleibt. Die Asymmetrie entscheidet.
 *
 * ⚠️ Die 92,85 ms sind der Stand vom 03.09.2026 bei 178 aktiven Karten. Sie
 * wachsen mit der Kartenzahl (die Funktion rechnet gegen jede aktive Karte).
 * Wer diesen Wert prüft, misst neu — die heutige Zahl steht hier, damit die
 * Annahme prüfbar bleibt und nicht bloß plausibel (LL-28).
 */
export const IMPORT_BATCH_SIZE = 25;

/** Schlüssel einer Gruppe byte-identischer Zeilen — dieselben drei Felder wie
 *  die `PARTITION BY`-Klausel in `process_csv_import`. Wer hier ein Feld
 *  ergänzt oder wegnimmt, ohne die RPC mitzuziehen, bricht die Hash-Bildung. */
function groupKey(row: BatchableRow): string {
  return `${row.transaction_date}|${row.amount}|${row.description}`;
}

/**
 * Zerlegt die geparsten Zeilen in aufeinanderfolgende Blöcke von höchstens
 * `maxSize` Zeilen — Dateireihenfolge bleibt erhalten, und eine Gruppe
 * byte-identischer Zeilen wird nie getrennt.
 *
 * Ein Block darf `maxSize` überschreiten, wenn eine einzelne Gruppe länger ist
 * als `maxSize`. Das ist die bewusste Wahl: Ein zu großer Block läuft
 * schlimmstenfalls in den Timeout und meldet das; eine getrennte Gruppe
 * verliert still eine Zahlung. Der laute Fehler ist der bessere.
 */
export function buildImportBatches<T extends BatchableRow>(
  rows: readonly T[],
  maxSize: number = IMPORT_BATCH_SIZE,
): T[][] {
  if (maxSize < 1) throw new Error("maxSize muss mindestens 1 sein");
  if (rows.length === 0) return [];

  // Letztes Vorkommen jeder Gruppe. Damit ist ab jeder Position bekannt, bis
  // wohin eine bereits begonnene Gruppe noch reicht.
  const lastIndexOfGroup = new Map<string, number>();
  for (let i = 0; i < rows.length; i += 1) {
    lastIndexOfGroup.set(groupKey(rows[i]), i);
  }

  const batches: T[][] = [];
  let start = 0;
  // Bis zu welchem Index eine der bisher gesehenen Gruppen noch reicht. Vor
  // diesem Index darf nicht geschnitten werden.
  let reach = -1;

  for (let i = 0; i < rows.length; i += 1) {
    const last = lastIndexOfGroup.get(groupKey(rows[i]));
    if (last !== undefined && last > reach) reach = last;

    const istGrenzeErlaubt = i >= reach;
    const istBlockVoll = i - start + 1 >= maxSize;
    const istLetzteZeile = i === rows.length - 1;

    if (istLetzteZeile || (istBlockVoll && istGrenzeErlaubt)) {
      batches.push(rows.slice(start, i + 1) as T[]);
      start = i + 1;
    }
  }

  return batches;
}
