# Doku-Patch 25.07.2026 — 2025er-Import + Einkommens-Historie

> **Quelle:** User-Auftrag 25.07.2026 („Du importierst noch die 2025er Daten …
> zur Steuerung der Anteile verwende den Screenshot" — Brutto-Tabelle Domi/Aline
> 01/2024–12/2026). **Anwendung:** Arbeits-Agent (PM-Rolle), LL-16-konform.

## P1 — CLAUDE.md, Header „Letzte Aktualisierung"

- **Anker:** Zeile `> **Letzte Aktualisierung:** 24. Juli 2026 (spät) …`
- **Patch:** `> **Letzte Aktualisierung:** 25. Juli 2026 · **Nach:** 2025er-Import + Einkommens-Historie (neue Sparrate-Anker)`

## P2 — CLAUDE.md, §10-Append-Eintrag ans Dateiende

Neuer Eintrag „### 2025er-Import + Einkommens-Historie · 25. Juli 2026" mit:
Import 964 Fragmente (Giro 642 / Cortal 58 / Visa 264; 200 INTERNAL_TRANSFER,
0 Duplikate, 0 Auto-Absorbs — Karten 2025 inaktiv), 14 ASSET_REALLOCATION
regelbasiert (7 Coinbase inkl. +4.000-Rückläufer über zweite Coinbase-IBAN +
1-€-Verifikations-Cent, 6 Visa↔Giro-Rückflüsse). Einkommens-Slots aus der
User-Brutto-Tabelle: ICH 2025-01 (90.000 / netto 4.037,11 = Durchschnitt der
12 echten Gehaltseingänge 48.445,31), PARTNER 2025-01 (63.097 / 2.981,08
pro-rata) + 2025-04 (69.113 / 3.265,33); **Korrektur** PARTNER-2026-Slot
63.200 → 69.113 (Alt-Onboarding-Wert widersprach der User-Tabelle).
**Neue Anker:** 2026-Monate 1.931,18 · Mai −86,77 · Juni 4.589,53
(Split 57,21 %); 2025 konstant 4.037,11 (keine aktiven Karten) →
Goldlinie/Vorjahres-Endwert 48.445,32. 2024-Zeilen der Tabelle bewusst NICHT
als Slots angelegt (sonst irreführende 2024-„Sparrate" als Goldlinie der
2025-Ansicht; für Splits ab 2025 nicht nötig). Offen: Karten-Rückdatierung
2025 (ohne sie = 2025-Sparrate = volles Netto; Kuratierung 2025 unmöglich,
da Karten dort inaktiv) — User-Entscheidung.
**Werkzeug-Lesson:** Mutations-Statements NIE im selben execute-Call wie eine
RAISE-Rollback-Verifikation bündeln — der RAISE rollt den GESAMTEN Call zurück
(Partner-Korrektur musste erneut ausgeführt werden; von der Nachher-Messung
selbst gefangen).

## P3 — V2/golive_import_ablaufplan.md, Status-Block

- **Anker:** `> **Offen:** 2025-Import (Dateien liegen parse-geprüft in \`import_data/\`, §0.1).`
- **Patch:** `> **2025-Import: AUSGEFÜHRT am 25.07.2026** — 964 Fragmente, Counter deckungsgleich mit §0.1-Prognose (642/58/264, Transfers 100/44/56), 14 AR-Markierungen, Einkommens-Historie 2025 + Partner-Brutto-Korrektur 2026 laut User-Tabelle. Neue Anker siehe CLAUDE.md-Eintrag 25.07.2026.`
