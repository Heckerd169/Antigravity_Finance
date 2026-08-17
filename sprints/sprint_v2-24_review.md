# Sprint v2-24 — Review

> **Branch:** `sprint/v2-24-performance` · **Commits:** `0c089c3` (P1) · `cb0e6fa` (P2) ·
> `3e1692a` (P3) · `a6ff879` (P4) · `90246c2` (P5) · **Datum:** 17. August 2026
>
> **In einem Satz:** Ein Dashboard-Aufbau kostet statt **233** Netzrunden zu Supabase
> nur noch **~18** — ohne dass sich eine einzige Zahl bewegt hat.
>
> **Grundlage:** `V2/befunde_2026-08-16_performance.md` (Diagnose, alles gemessen) ·
> `sprints/sprint_v2-24_briefing.md` (Plan) · `sprints/sprint_v2-24_anker.md`
> (Anker-Protokoll vorher/nachher)

---

## 1. Was gebaut wurde

### Phase 1 — Die Middleware erzeugt keinen 504 mehr
**Absicht:** Der Ausfall vom 16.08.2026 (`504 MIDDLEWARE_INVOCATION_TIMEOUT`,
19:10:24 UTC) sollte strukturell unmöglich werden.

**Weg:** Drei Eingriffe. ① Der `profiles`-Abruf fällt weg — er kostete eine **eigene
Netzrunde auf jeder Anfrage der ganzen App** für eine Information, die `page.tsx` in
derselben `profiles`-Zeile ohnehin lädt. Der Onboarding-Wächter ist umgezogen, nicht
abgeschafft: Er sitzt als `redirect()` in `page.tsx` und `onboarding/page.tsx`, jeweils
**vor** jeder Ausgabe. ② Zeitlimit je Auth-Versuch über einen eigenen
`AbortController` (`createTimeoutFetch`). ③ `page.tsx` verlässt sich nicht mehr blind
auf die Middleware — dort stand siebenmal `user!.id`.

**Berührt:** `lib/supabase/middleware.ts` · `lib/supabase/fetch-retry.ts` ·
`app/page.tsx` · `app/onboarding/page.tsx`

### Phase 2 — Welle-Treiber und Vorjahr erst beim Anfassen
**Absicht:** `get_year_deviation_drivers` kostet gemessen **357 ms** — rund drei
Viertel der gesamten Rechenzeit eines Aufbaus — und wurde bei **jeder** Geste bezahlt,
auch wenn das Popup zu war.

**Weg:** `WelleData` trägt nur noch die Kurve. Was erst beim Anfassen gezeigt wird,
liegt in `WelleExtras` und kommt über eine **Server Action** nach — nicht über den
Browser-Client, weil `get_year_deviation_drivers` kein `p_user_id` nimmt, `auth.uid()`
selbst liest und ohne Session `28000` wirft (§6 Stolperfalle 4).

**Berührt:** `welle/loader.ts` · `welle/actions.ts` (neu) · `welle/index.tsx` ·
`welle/popup.tsx` · `welle/drivers.ts` · `welle/welle.types.ts` ·
`tests/e2e/welle-driver-states.spec.ts` (neu) · `playwright.config.ts`

### Phase 3 — Der Karten-Lader in einer Netzrunde statt 179
**Absicht:** 179 der 233 Netzrunden für gemessene **17 ms** Rechenarbeit.

**Weg:** Neue lesende RPC `get_cards_for_month(p_user_id, p_month)`. Sie **ruft**
`is_card_active_in_month`, `calculate_card_amount_for_month` und
`get_effective_plan_for_month` auf und baut sie nicht nach.

**Berührt:** `supabase/migrations/20260817_v2_24_p3_karten_buendel.sql` (neu) ·
`lib/rpc.ts` · `app/page.tsx` · `lib/supabase/types.ts`

### Phase 4 — Die Jahres-Reihe in einer Netzrunde statt 24
**Absicht:** 24 Einzelrunden für 12 Monate Ist + Plan, plus zwei redundante
Ring-Aufrufe für denselben Monat.

**Weg:** Neue lesende RPC `get_sparrate_series(p_user_id, p_year)`. Die **Kumulation
bleibt im Loader** — beide Sparrate-Funktionen runden einmal ganz am Ende über alles
(LL-25), eine Summierung in der RPC hätte eine zweite Rundungsstelle eingeführt. Der
Ring liest seinen Monatswert jetzt aus der Reihe.

**Berührt:** `supabase/migrations/20260817_v2_24_p4_sparrate_reihe.sql` (neu) ·
`lib/rpc.ts` · `welle/loader.ts` · `welle/actions.ts` · `app/page.tsx` ·
`lib/supabase/types.ts`

### Phase 5 — Früher etwas zeigen, und Fehler enden nicht bei Vercel
**Absicht:** Es gab im ganzen Projekt kein `loading.tsx`, kein `error.tsx` und keine
Suspense-Grenze. Der Aufbau war alles-oder-nichts.

**Weg:** `loading.tsx` (absichtlich nur Fläche, kein erfundenes Skelett) und
`error.tsx` mit einer Handlung. Formensprache Zeichen für Zeichen von der
Anmeldeseite übernommen.

**Berührt:** `app/loading.tsx` + `.module.css` (neu) · `app/error.tsx` +
`.module.css` (neu)

---

## 2. Prüfstrecke

| Prüfung | Erwartet | Gemessen |
|---|---|---|
| `tsc --noEmit` | 0 | **0** ✅ |
| ESLint (kanonisch, `src`) | 0/0 | **0/0** ✅ |
| `pnpm build` | 0 | **0** ✅ · Route `/` **35,8 kB** (vorher 35,6) · First Load JS **187 kB** · geteilt **87,3 kB** unverändert |
| `pnpm test:visual` | steigt nur um eigene Tests | **113/113** ✅ (100 → 113, die dreizehn neuen) |
| `pnpm test:e2e` | vollständig grün | **122/122** ✅ inkl. Render-Smoke |

> **Zur Lint-Zahl, damit sie nicht als Widerspruch gelesen wird.** Der **kanonische**
> Aufruf aus dieser Fähigkeit prüft `src` und meldet **0/0**. `pnpm lint` (= `next
> lint`) prüft zusätzlich `tests/` und meldet **6** Fehler
> `@next/next/no-assign-module-variable` — einen je Wächter-Spec. Die sind der Bauart
> „echte Quelldatei transpilieren und ausführen" inhärent (`const module = { exports }`),
> **vorbestehend belegt** gegen den Ausgangsstand, und mein neuer Wächter ist der
> sechste aus demselben Grund. 5 → 6 ist also kein neuer Fehlertyp.

**Bundle:** Route `/` wächst um **0,2 kB** — das ist der Client-Anteil aus Phase 2
(Nachlade-Zustand der Welle). Das geteilte Bundle bleibt bei 87,3 kB.

**Empirische Nebenwirkung, die keine Prüfung verlangt hatte:** Die Prüfstrecke selbst
lief vorher **2,3–3,2 min** und läuft jetzt in **34,7 s**, und die
ECONNRESET-Wiederholungen im Render-Smoke-Log sind von **dutzenden auf null**
gefallen — alle hatten `is_card_active_in_month` als Ziel.

---

## 3. Anker vorher/nachher

**Vollständiges Protokoll: `sprints/sprint_v2-24_anker.md`.** Hier die Kurzfassung.

**Zwei Migrationen auf Produktion, beide nur neue lesende Funktionen. Erwartung: keine
Zahl bewegt sich.** Erfüllt.

| Anker | vorher | nachher |
|---|---|---|
| **A1** Ist-Sparrate, 12 Monate 2026 | Tabelle im Protokoll | **jede Zeile identisch** |
| **A1** Ist 2025 | 4.037,11 € in allen Monaten | **4.037,11 €**, unverändert |
| **A2** Plan-Sparrate, 12 Monate 2026 | Tabelle im Protokoll | **jede Zeile identisch** |
| **A3** Invariante 1 (Σ Ordner == Sparrate) | 0,00 € × 12 | **0,00 € × 12** |
| **A4** Invariante 2 (B2) | 0 von 12 verletzt | **0 von 12 verletzt** |
| **A5** Prüfsummen der 9 Rechenfunktionen | Tabelle im Protokoll | **9 identisch, 0 geändert** |

> **A5 ist der tragende Beleg dieses Sprints, nicht A1.** Dass die Sparrate gleich
> bleibt, wäre auch bei einem Nachbau möglich, der zufällig dasselbe liefert. Dass die
> **Funktionsrümpfe byte-identisch** sind, beweist, dass die beiden neuen Funktionen sie
> **aufrufen**. Hätte eine von ihnen die Prioritätskette nachgebildet, wäre der
> Split-Anteil ein zweites Mal angewandt worden (§6 Stolperfalle 11, der Fehler aus
> v2-13) — und **keine Zahl hätte falsch ausgesehen**.

**Zusätzliche Gleichwertigkeits-Belege über den Anker hinaus:**

| Prüfung | Ergebnis |
|---|---|
| `get_cards_for_month` gegen den alten Frontend-Weg, 24 Monate, Karte für Karte und Wert für Wert (`EXCEPT` in **beide** Richtungen) | **304 = 304, 0 Unterschied** |
| Monatsbereich-Vorfilter gleichwertig zum Aufruf ohne Vorfilter | **304 = 304, 0 Unterschied** |
| `get_sparrate_series` gegen die 24 Einzelaufrufe, 2024/25/26 | **36 = 36, 0 Unterschied** |
| `NULL` bleibt `NULL` (2024 hat keine Daten) | **12 von 12 erhalten** |
| Bereichsprüfung `get_sparrate_series(1800)` | wirft **22023** |

**Übungs-Datenbank:** nicht angefasst — nach ausdrücklicher Nutzer-Entscheidung
(Begründung in §5).

---

## 4. Selbst-Review gegen die Prüfschritte des Briefings

| # | Kriterium | erfüllt | Beleg |
|---|---|---|---|
| **S1** | Anker A1–A5 vor dem ersten Eingriff, dieselbe Sitzung | ✅ | `sprint_v2-24_anker.md`, Abschnitt „VORHER" |
| **S2** | Anker nach jeder Phase gegen S1 | ✅ | 0,00 € Bewegung; A5 nach P3 **und** nach P4 geprüft, je 9/0 |
| **S3** | Übungs-Datenbank-Anker 2.200,00 € | ⊘ | entfällt — Probe nach Nutzer-Entscheidung übersprungen (§5) |
| **S4** | Neue Funktionen Wert für Wert gegen die Einzelaufrufe | ✅ | 304=304 (P3) · 36=36 (P4), `EXCEPT` beidseitig |
| **S5** | Kartentyp-Probe FIXED_COST / INCOME / BUDGET | ✅ | Juli enthält alle drei; im 304=304-Vergleich enthalten |
| **S6** | Split-Probe: GEMEINSAM **mit** verknüpftem Fragment | ✅ | **5 solche Karten** im Juli, davon eine QUARTERLY — im Vergleich enthalten |
| **S7** | Anfragen je Aufbau von 233 auf ≤ 20 | ✅ | **~18** (218 Anfragen / 12 Aufbauten, Produktions-Log) |
| **S8** | Prüfstrecke grün | ✅ | §2 |
| **S9** | Middleware-Ausweichpfad erzeugt keinen 504 | 🟡 | Der Pfad ist gebaut und typgeprüft; **künstlich ausgelöst wurde er nicht** (§6) |
| **S10** | Optischer Render-Smoke | ✅ | 4 Render-Smoke-Tests grün, Bild unverändert |
| **S11** | **Browser-Smoke des Nutzers** | ⬜ | **steht aus** — Produktiv-Gate, §6 |

> **S5 und S6 waren als das Risiko des Sprints benannt** — und die Prüfdaten-Kontrolle
> nach LL-15 hat dabei etwas Nützliches gezeigt: Der Juli enthält **fünf**
> GEMEINSAM-Karten mit verknüpfter Zahlung. Der synthetische Bestand der
> Übungs-Datenbank enthält **keine einzige**. Der gefährlichste Fall wäre dort also
> gar nicht geprüft worden.

---

## 5. Architektur-Entscheidungen

**① Bündeln durch Aufrufen, nicht durch Nachbauen.** Echte Alternative war, die
Prioritätskette in den neuen Funktionen zu wiederholen — schneller, weil ein einziger
Query-Plan statt verschachtelter plpgsql-Aufrufe. Verworfen: `calculate_card_amount_for_month`
wendet den Split-Anteil genau einmal an, ein Nachbau hätte ihn verdoppelt, und das
Ergebnis (619 € statt 1.089 € bei „Miete") sieht plausibel aus. Der Preis der sicheren
Variante ist messbar klein: 7,99 ms für 34 Karten.

**② Die Kumulation der Welle bleibt im Frontend.** Alternative: `get_sparrate_series`
liefert die kumulierten Werte gleich mit. Verworfen wegen LL-25: Beide
Sparrate-Funktionen runden einmal am Ende über alles; eine Summierung in der RPC wäre
eine zweite Rundungsstelle und hätte den Anker bewegt.

**③ Übungs-Datenbank-Probe übersprungen — Nutzer-Entscheidung, 17.08.2026.**
Vorgelegt wurden beide Wege mit ihren Kosten. Ausschlaggebend: Die neuen Funktionen
sind `STABLE` (können strukturell nicht schreiben) und tragen **neue Namen** (können
nichts überschreiben); was die Probe zusätzlich gefunden hätte, ist praktisch nur
„läuft `CREATE FUNCTION` durch" — und das scheitert auf Produktion genauso folgenlos.
Umgekehrt fehlt dem synthetischen Bestand der gefährlichste Fall (siehe §4). Der Tausch
hätte außerdem ein fremdes, täglich benutztes Projekt pausiert.
**Das ist eine Abweichung vom Verfahren und steht hier als solche.**

**④ Die Middleware leitet bei unklarem Anmeldezustand auf `/login`.** Alternative:
durchlassen und die Seite entscheiden lassen. Verworfen — die Seite könnte es aus
demselben Grund nicht und würde hängen oder zurückverweisen. Eine Anfrage, deren
Anmeldung nicht feststellbar ist, darf das Dashboard nicht erreichen. Der unangenehme
Rand ist benannt: Eine **gültige** Sitzung landet bei nicht erreichbarem Auth-Dienst
trotzdem auf `/login`.

**⑤ Suspense-Grenzen bewusst NICHT gebaut**, obwohl im Plan. Ihre Begründung war „233
Anfragen blockieren die Anzeige"; nach P3/P4 sind es ~18 mit p50 32–118 ms. Eine
strukturelle Zerlegung von `page.tsx` in async Teilkomponenten wäre eine bewegliche
Stelle mehr für einen Gewinn, den die Messung nicht mehr hergibt.

**⑥ Der Ladezustand zeigt absichtlich nichts.** Ein Skelett wäre eine
Gestaltungsentscheidung, die die Design-Doku nicht trifft (§7 Regel 3).

---

## 6. Offene Punkte und Fragen

**① Der Browser-Smoke des Nutzers steht aus** (S11) — Produktiv-Gate, nicht ersetzbar.
Anzuklicken: eine Zahlung auf eine Karte ziehen (soll sich sofort anfühlen) · Monat
wechseln · über die Welle fahren (Tooltip kommt beim **ersten** Mal mit kurzer
Verzögerung, danach sofort) · Welle-Popup öffnen (Goldlinie da) · eine Karte antippen.

**② Zwei Wortlaute sind neue UI-Copy und brauchen die Freigabe für Design-Doku §12:**
- `"Treiber werden geladen"` — der dritte Zustand der Treiber-Zeile. Ohne ihn wären
  beide bestehenden Platzhalter während des Ladens eine **falsche Aussage**.
- Die Fehlerseite: `"Die Ansicht konnte nicht geladen werden"` · `"Deine Daten sind
  unberührt — es ist nur die Anzeige, die nicht zustande kam."` · `"Nochmal versuchen"`.

**③ In welcher Region laufen die Vercel-Funktionen?** Es gibt weder `vercel.json` noch
eine Einstellung in `next.config.mjs`. Liegen sie nicht in Europa, verteuert das jede
der verbleibenden ~18 Anfragen um rund 90 ms. **Nur im Vercel-Konto einsehbar.**

**④ Der Middleware-Ausweichpfad ist nicht künstlich ausgelöst worden** (S9 auf 🟡).
Er ist gebaut, typgeprüft und in zwei vollständigen Prüfläufen **nie angesprungen**
(0 Warnungen im Server-Log) — was zeigt, dass er nicht im Weg ist, aber nicht, dass er
im Ernstfall greift. Ein Wächter dafür bräuchte einen einspeisbaren Fehlerfall.

**⑤ Der RLS-Feinschliff bleibt offen** — `auth.uid()` wird in **elf** Policies pro
Zeile neu ausgewertet. Mechanisch behebbar (`(select auth.uid())`), verbilligt jede
verbleibende Anfrage. Bewusst nicht in diesem Sprint: Es sind Zugriffsregeln auf echte
Finanzdaten, und der Sprint trägt schon zwei Migrationen. Dazu zwei fehlende
Fremdschlüssel-Indizes (`card_planned_timeline.user_id`,
`fragments.suggested_card_id`).

**⑥ Die Datenbank-Instanz bleibt auf der kostenlosen Stufe** — Nutzer-Entscheidung.
Nach dem Umbau fallen statt ~56.000 Anfragen pro Tag grob 4.000 an; die Empfehlung war
„erst umbauen, dann messen".

---

## 7. Vorschläge für CLAUDE.md und Roadmap

**Alles hier ist Vorschlag und braucht die Freigabe des Nutzers.**

### Für CLAUDE.md

**① Neue Stolperfalle 18 — „Ein N+1 mit Datumsstempel".**
> Eine Aufwands-Entscheidung, die mit einer Datenmenge begründet ist, verfällt mit
> dieser Menge. `page.tsx` trug den Kommentar *„N+1-Pragmatik: bei <20 Karten in V1
> akzeptable Latenz"* — richtig, als er geschrieben wurde. Bei 77 Karten waren daraus
> **179 Netzrunden je Aufbau** geworden, und jede neue Karte kostete vier weitere.
> **Kein Wächter dieses Projekts fängt das:** Anker, Prüfsummen und Invarianten sind
> alle grün, weil jede Zahl richtig ist — sie kommt nur zu spät. **Wer eine
> Mengen-Annahme in einen Kommentar schreibt, schreibt die Zahl dazu und macht sie
> damit prüfbar.**

**② Neue Stolperfalle 19 — „Die Antwort ist winzig, der Weg ist teuer".**
> `is_card_active_in_month` braucht **0,089 ms** in der Datenbank und lag im
> Produktionsschnitt bei **899 ms** über die Leitung — Faktor ~10.000. Am 16.08.2026
> transportierten **55.881 Anfragen** insgesamt **0,4 MB** (Ø **8 Bytes** je Antwort).
> **Bei Trägheit zuerst die Zahl der Netzrunden zählen, nicht die Laufzeit der
> Abfragen optimieren.**

**③ Neuer Eintrag LL-28** — zu Stolperfalle 18.

**④ Neuer Eintrag LL-29** — zu Stolperfalle 19.

**⑤ Ergänzung zu §7 Regel 21 / §9:** Der Anker misst Richtigkeit, nicht
Geschwindigkeit. Ein zweiter, datenunabhängiger Wächter wäre **Anfragen je
Dashboard-Aufbau**, zählbar im Supabase-Log über `app_config` (genau ein Aufruf je
Aufbau). Heute: **~18**. Steigt die Zahl deutlich, ist ein N+1 zurück.

**⑥ Zwei Verfahrens-Fallen, die diese Sitzung Zeit gekostet haben:**
- **`pnpm build` nie bei laufendem dev-Server starten** — beide teilen `.next`.
  Symptom: `ERR_ABORTED` beim Navigieren und plötzlich die Anmeldeseite im
  Test-Abbild. Das sah nach einem Auth-Fehler aus und war ein zerschossenes `.next`.
  Zwei Prüfläufe so verloren.
- **Die Supabase-Edge-Logs haben Minuten Ingestion-Verzögerung.** Eine Zählung direkt
  nach dem Messlauf zeigte `get_sparrate_series` **gar nicht**; die zwölf Aufrufe
  erschienen erst später. Wer sofort zählt, zählt zu wenig und diagnostiziert einen
  Fehler, den es nicht gibt.

**⑦ Nebenfund, der eine Routine verdient:** `src/lib/supabase/types.ts` war **seit
v2-21 veraltet** — fünf RPCs fehlten (`af_normalize_text`, `af_word_in_text`,
`history_match`, `name_similarity_scoped`, `refresh_fragment_suggestions`). Der
Neu-Erzeugungs-Schritt aus §6 wurde damals übersprungen. Aufgefallen ist es nur, weil
`tsc` meine neue RPC nicht kannte. **Vorschlag:** Beim Neu-Erzeugen die
**Namensmengen** vorher/nachher vergleichen statt den Zeilen-Diff zu lesen — der Diff
war 288+/267− und praktisch unlesbar, der Mengenvergleich beantwortete die Frage in
einer Zeile („nichts verloren, sechs dazu").

### Für die Roadmap

**Performance kam dort bisher nicht vor** — null Treffer für „Performance",
„Ladezeit", „langsam", „Latenz", „Reaktion". **Vorschlag:** neues Paket
**„Die App reagiert sofort"** mit diesem Sprint als ✅ und zwei offenen Punkten:
`PF-1` RLS-Feinschliff plus die zwei Fremdschlüssel-Indizes · `PF-2`
Vercel-Funktionsregion prüfen und festnageln.
