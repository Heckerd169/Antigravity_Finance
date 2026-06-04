# Architekten-Übergabe V1 → V2

> **Adressiert an:** den V2-Architekten-Chat
> **Vom:** V1-Architekten-Chat (Ende Sprint 10, V1 produktiv)
> **Datum:** 24. Mai 2026
> **Zweck:** Tacit knowledge aus zehn V1-Sprints, das nicht in den drei Bibel-Dokumenten steht.

## 1. Zweck dieser Übergabe

Diese Datei ist bewusst schlank gehalten. Die V2-Projektknowledge enthält neben dieser Übergabe die vollständige V1-Dokumentation: die Persona, das Design-Dokument in seiner aktuellen Fassung, die Schema-Zusammenfassung sowie sämtliche Sprint-Briefings, Sprint-Reviews und PM-Handovers. Diese Dokumente sind weiterhin in vollem Umfang gültig, da V2 dasselbe Datenmodell und denselben Tech-Stack verwendet. Was hier folgt, ist ausschließlich das, was zwischen den Zeilen der V1-Dokumentation steht und dem neuen Architekten nicht durch reines Lesen der Bibeln zugänglich wäre.

## 2. Was unverändert von V1 nach V2 übernommen wird

Das Supabase-Projekt bleibt dasselbe (`nflkobdfdhncrtjncpmq`, PostgreSQL 17.6). Das Datenmodell bleibt strukturell unverändert und wird nur additiv erweitert. Sämtliche zehn Tabellen, die siebzehn Trigger und die mittlerweile einundzwanzig App-RPCs aus V1 sind weiterhin live und korrekt. Der Test-User mit der UUID `179cd2c1-bbc2-4fd0-954b-8735eb90f370` bleibt der zentrale Referenz-User für alle Verifikationen. Der §4.6-Anker, also der Rückgabewert `2910,01` von `calculate_sparrate_for_month` für März 2026, gilt unverändert als Snapshot-Integritäts-Test bei jeder Migration, die die Sparrate-Logik berührt. Der Tech-Stack (Next.js-Frontend gegen Supabase, PostgREST-Aufrufe für RPCs, deutsche Oberflächen-Sprache, alle Geldbeträge in Euro mit zwei Nachkommastellen) bleibt identisch.

## 3. Wichtigste ungeschriebene Konventionen

Die folgenden Arbeitsregeln haben sich über zehn Sprints etabliert. Sie stehen nicht in der Schema-Doku, weil sie nicht die Datenstruktur betreffen, sondern den Architekten-Workflow.

**Der Architekt führt niemals selbst DDL- oder DML-Statements gegen Supabase aus.** Das Werkzeug erlaubt es technisch über die Service-Role, aber die Architekten-Disziplin besteht darin, SQL als ausführbare Code-Blöcke an den User zu liefern und das tatsächliche Apply dem User im Supabase SQL Editor zu überlassen. Read-only-Verifikationen über `pg_catalog`, `information_schema` und View-Reads sind ausdrücklich erlaubt und tatsächlich notwendig, weil sie das Vier-Augen-Prinzip nicht verletzen. Diese Regel ist nicht zufällig: Sie hat in V1 mindestens einmal einen Bug aufgedeckt, der sonst still in den Reports versteckt geblieben wäre. Der User hat in V1 eine einzige Ausnahme erwogen (Sandbox-Blöcke im BEGIN/ROLLBACK-Rahmen selbst auszuführen), sich aber jedes Mal für die strikte Variante entschieden.

**Jede Migrations-Lieferung folgt einem festen Drei-Schritt-Muster.** Erstens wird ein Sandbox-Block geliefert, der die geplanten Operationen in einem `BEGIN; ... ROLLBACK;`-Rahmen gegen den echten Test-User durchspielt, ohne zu persistieren. Zweitens, nach grünem Sandbox-Output, liefert der Architekt den eigentlichen Live-Block. Drittens folgt eine Post-Apply-Verifikation, die der User ausführt und deren Output zurückspielt. Der Architekt verifiziert das Ergebnis dann zusätzlich read-only via MCP, bevor der PM-Vollzugsbrief geschrieben wird. Diese Sequenz hat sich als robust gegen die meisten Klassen von Fehlern erwiesen.

**Jeder Architekten-Antwort steht der Befund vorne, dann die Lieferung.** Wenn ein MCP-Check eine Inkonsistenz mit dem Briefing aufdeckt, dann wird das in zwei bis vier Zeilen am Anfang ausgesprochen, bevor irgendein SQL geschrieben wird. Der PM verlässt sich darauf, dass Konflikte zwischen Briefing und Realität nicht stillschweigend ausgebügelt werden, sondern transparent als Befund kommuniziert. Wenn der Befund substantiell ist (etwa eine Spalte fehlt, die das Briefing voraussetzt), eskaliert der Architekt zurück zum PM und liefert erst nach Klärung.

**Idempotenz ist die Default-Anforderung an jedes Migration-SQL.** Konkret bedeutet das `CREATE OR REPLACE FUNCTION` statt `CREATE FUNCTION`, `ADD COLUMN IF NOT EXISTS` statt `ADD COLUMN`, `ON CONFLICT DO NOTHING` oder `DO UPDATE` bei Initial-Seeds, und Vor-Existenz-Checks via `DO $$ BEGIN IF NOT EXISTS ... END $$` für CHECK-Constraints. Re-Runs müssen gefahrlos möglich sein.

**Sandbox-Test-Blöcke und persistente Funktions-Definitionen werden niemals im selben SQL-Block ausgeliefert.** Diese Regel klingt trivial, ist aber wichtig: Wenn ein Sandbox-Block mit `ROLLBACK` endet und ein `CREATE OR REPLACE FUNCTION` davor steht, kann es passieren, dass der SQL Editor alles in einer Transaktion klammert und der Rollback auch die Funktion mitnimmt. Das ist in Sprint 5 einmal passiert. Seitdem werden Persistierungs-Blöcke und Test-Blöcke separat geliefert.

## 4. Pitfalls aus V1, die der V2-Architekt beim ersten Migration-Patch wissen sollte

Drei technische Stolperfallen haben uns in V1 jeweils einen Iterationszyklus gekostet und sollten dem V2-Architekten direkt geläufig sein.

Erstens: Das Pattern `INSERT ... ON CONFLICT (...) DO NOTHING RETURNING id INTO v_target` in PL/pgSQL befüllt `v_target` bei Conflict-Pfad inkonsistent. Das CTE-Pattern `WITH ins AS (INSERT ... ON CONFLICT ... RETURNING id) SELECT id INTO v_target FROM ins` ist die zuverlässige Variante. Dieser Bug hat in Sprint 8 dazu geführt, dass die Distiller-Pipeline scheinbar funktionierte, aber tatsächlich keine Auto-Absorptions erzeugte.

Zweitens: `CREATE OR REPLACE VIEW` in Postgres erlaubt das Hinzufügen neuer Spalten ausschließlich am Ende der Spaltenliste. Spalten in der Mitte einzufügen wirft `ERROR 42P16: cannot change name of view column`. In Sprint 9 ist dieser Fehler beim Erweitern von `fragments_with_status` aufgetreten. Wer eine View um zwei oder drei Spalten erweitert, hängt sie ans Ende, auch wenn die logische Position eine andere wäre.

Drittens: TEMP-Tabellen, die innerhalb eines Sandbox-Blocks erzeugt werden und auf die später als Rolle `authenticated` zugegriffen wird, brauchen einen expliziten `GRANT SELECT` oder `GRANT INSERT, SELECT` direkt nach dem `CREATE TEMP TABLE`. Ohne diesen Grant feuert die Rolle nach dem `SET LOCAL ROLE authenticated` ein `permission denied`. Diese Falle ist in V1 zweimal aufgetreten, ohne dass sie an einer Stelle dokumentiert war.

Ein viertes Phänomen ist erwähnenswert, ohne dass es ein konkreter Bug wäre: PostgREST grantet `EXECUTE` auf Funktionen per Default an `PUBLIC`, was `anon` einschließt. Bei `CREATE OR REPLACE FUNCTION` mit explizitem `GRANT EXECUTE TO authenticated` bleibt der `anon`-Grant trotzdem aktiv, was im `pg_proc`-Read auf den ersten Blick irritiert. Sicherheitskritisch ist das nicht, solange der RPC-Body als ersten Schritt `IF auth.uid() IS NULL THEN RAISE EXCEPTION` enthält. Diese Konvention hat sich in V1 durchgesetzt und sollte für V2 beibehalten werden.

## 5. Inhaltliche Befunde aus V1, die V2 verstehen muss

Drei semantische Klärungen aus V1 sind in der Schema-Doku zwar dokumentiert, aber so wichtig für das mentale Modell, dass sie hier nochmal zusammengefasst gehören.

**Die Trennung von `planned_amount` und `adjusted_amount`** modelliert zwei verschiedene User-Aktionen und ist nicht redundant. Eine Plan-Änderung ist eine strukturelle Entscheidung mit Forward-Inheritance auf alle Folgemonate, eine Monats-Anpassung wirkt ausschließlich in dem einen Monat. Die Sparraten-Treppe konsumiert nur den Plan, der Karten-Anzeige-Betrag konsumiert beides über die Prioritätskette Realität vor Anpassung vor Plan. Das Frontend hat in V1 anfangs nur die Anpassungs-Spalte geschrieben, ohne die Anzeige-Logik entsprechend zu trennen, was zu mehreren UI-Bugs geführt hat. Die Architektur war nie das Problem, sondern die Frontend-Konsumtion der Architektur.

**Die `INTERNAL_TRANSFER`-Markierung ist eine Anti-Aggregation.** Bewegungen zwischen eigenen Konten würden ohne diese Markierung doppelt in die Sparrate fließen oder fälschlich Karten zugeordnet werden. Die OQ-B-Daten-Invariante stellt sicher, dass ein Fragment mit `transfer_type = 'INTERNAL_TRANSFER'` niemals gleichzeitig in `card_fragment_links` liegt. Der Defense-in-Depth-Filter in `calculate_card_amount_for_month` schützt vor künftigem Drift.

**Hide ist UI-Concern, nicht Berechnungs-Concern.** Diese Regel ist das Ergebnis des Pre-Sprint-10-Audits und betrifft `cards.deleted_at`. Sparraten-RPCs aggregieren bewusst über hidden Karten, weil §2.1 Snapshot-Integrität verlangt, dass eine im Mai verborgene Karte die März-Sparrate nicht rückwirkend ändert. Nur UI-zentrische Surfaces filtern `WHERE deleted_at IS NULL`. Die Funktion `is_card_active_in_month` ist seit Pre-Sprint-10 strikt Frequenz/Range-Check ohne Hide-Concern. Wer das umkehrt, bricht die Snapshot-Integrität.

## 6. Test-User-State zum Übergabezeitpunkt

Der Test-User `179cd2c1-bbc2-4fd0-954b-8735eb90f370` ist im finalen V1-Zustand. Er hat acht aktive Karten: Miete, Strom, Netflix, Tanken und Steuerrückzahlung aus dem §4.6-Setup sowie Hobby und Auswärts Essen aus Pre-Sprint-7 und Nebenjob aus Pre-Sprint-8. Tanken und Netflix sind für März 2026 manuell als bezahlt markiert. Auswärts Essen hat zwei verlinkte Fragmente (Lieferando und Restaurant Da Pino) aus Pre-Sprint-7. Das `own_ibans`-Feld in `profiles` enthält die DKB- und die Cortal-IBAN. Zusätzlich existiert ein Aral-Fragment vom 22. Mai 2026, das während eines Frontend-Tests entstanden und unverlinkt ist; es hat keinen Einfluss auf den Anker und kann ignoriert werden. Der §4.6-Anker beträgt `2910,01` für März 2026 und sollte unverändert bleiben.

## 7. Offene Vormerkungen aus V1, die V2 abräumen kann

Mehrere Themen sind in V1 bewusst aus dem Scope geblieben und warten auf V2. Eine Cleanup-Edge-Function für `deleted_entities` ist seit Sprint 0 vorgemerkt; aktuell laufen Trash-Einträge nicht automatisch ab. Eine `get_cards_with_effective_plan_for_month`-Bulk-RPC könnte den n+1-Query-Druck reduzieren, falls die Sparraten-Treppe oder andere Bulk-Surfaces Latenz-Probleme zeigen. Eine `paired_fragment_id`-Verknüpfung für Cross-Account-Transfers ist im V1-Single-Side-Modus bewusst nicht implementiert worden, würde aber für eine Multi-Account-Reconciliation interessant. Eine IBAN-Format-Validierung in der Datenbank wurde an das Frontend delegiert; eine CHECK-Constraint mit Regex wäre additiv möglich. Ein UI-Pfad zum Wiedereinblenden hidden Karten ist bewusst V2-Vormerkung; der Server-Vertrag dafür existiert bereits in `toggle_card_hidden(card_id, false)`. Schließlich ist `card_monthly_states.closed_at` zwar als Lese-Filter in `toggle_card_manually_paid` aktiv, wird aber von keinem Schreib-Pfad gesetzt; eine UI für Monatsabschluss steht offen.

## 8. Sprint-Historie V1 in der Kurzfassung

Sprint 0 und 1 haben die Datenbank-Grundlagen mit allen zehn Tabellen, der Sparraten-Formel und der ersten Distiller-Heuristik aufgebaut. Sprint 2 und 3 haben die Sparraten-Berechnung in RPC-Form gegossen und die Forward-Inheritance über Plan-Timeline und Income-Timeline etabliert. Sprint 4 hat die Karten-Komponenten-Anlage atomar gemacht durch die DEFERRED-Trigger-Auflösung. Sprint 5 hat die Header- und Timeline-Navigation gebaut, Sprint 6 war das harte Snapshot-Integritäts-Gate gegen den §4.6-Test-Case mit dem Ergebnis `2910,01`. Sprint 7 hat den BUDGET-Tap-Mechanismus eingeführt, inklusive einer Korrektur der Frontend-Anzeige-Logik, die fälschlich `planned_amount` als Vergleichsbasis nutzte. Sprint 8 hat die atomare Distiller-Pipeline `process_csv_import` für DKB-CSVs implementiert, inklusive eines V1-Bugs mit anschließendem V2-Fix per CTE-Pattern. Sprint 9 hat Cortal-Consors als zweites Bank-Format hinzugefügt und den `INTERNAL_TRANSFER`-Pfad für Cross-Account-Bewegungen eingeführt. Sprint 10 hat den Soft-Delete-UI-Pfad gebaut und im Audit den Snapshot-Integritäts-Bruch in den Sparrate-RPCs gefunden und gefixt. Diese chronologische Reihenfolge ist hilfreich, weil sie zeigt, dass die Architektur in jedem Sprint additiv gewachsen ist und keine Rückbau-Operationen nötig waren.

## 9. Empfohlene Lese-Reihenfolge für den V2-Architekten

Der neue Architekt sollte vor seinem ersten Auftrag in folgender Reihenfolge einlesen, was im V2-Projekt-Knowledge liegt. Zuerst die Persona, weil sie den Stil und die Rolle definiert. Anschließend diese Übergabe-Datei, weil sie das mentale Modell aufspannt und auf die wichtigen Stolperfallen vorbereitet. Dann die aktuelle Version des Design-Dokuments (V1 schloss mit v3 ab) und die Schema-Zusammenfassung in v3.1, beide als read-only-Wahrheits-Quellen. Die Sprint-Briefings, Sprint-Reviews und PM-Handovers sind selektiv heranzuziehen, wenn ein konkreter Sprint-Kontext für einen V2-Auftrag relevant wird.

## 10. Stil und Arbeitsregeln für V2

Der Architekten-Stil bleibt unverändert: deutsche Sprache, kompakte und präzise Formulierungen, Befunde am Anfang, Lieferung danach. SQL kommt als ausführbarer Code-Block für den User, nicht als MCP-Apply durch den Architekten. Tabellen werden Bullets vorgezogen, wo Vergleiche stehen. PM-Briefe werden als separate Markdown-Dateien geliefert, damit der User sie eins zu eins in den PM-Chat kopieren kann. Bei Unklarheiten im Briefing wird zurückgefragt, nicht geraten. Bei substantiellen Briefing-Diskrepanzen wird die Lieferung angehalten und ein Klärungsbrief an den PM verfasst. Bei jeder Migration, die die Sparrate-Logik berührt, wird der §4.6-Anker vor und nach dem Apply verifiziert.

Wenn V2 das Datenmodell additiv erweitert (etwa um Multi-User-Sharing, weitere Bank-Formate oder eine V1-Vormerkung aus Section 7), gelten die V1-Architektur-Prinzipien unverändert: Snapshot-Integrität ist nicht verhandelbar, Plan-Anpassungen sind append-only, Sparraten werden niemals persistiert sondern immer aus Quellen berechnet, und Lösch-Operationen haben einen definierten Pfad mit Rückgängig-Fenster.

---

*Architekten-Übergabe V1 → V2 · 24. Mai 2026 · Antigravity Finance*
