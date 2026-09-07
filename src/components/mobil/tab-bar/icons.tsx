/* Die vier Tab-Icons als Inline-SVG — Maße und Pfade 1:1 aus dem Prototyp
 * (`design-system/handoff/mobile/Mobil App.dc.html`), Handoff-README „Rahmen":
 * Stroke 1,7 round; Verlauf 2,2. Farbe über `currentColor`, damit aktiv/inaktiv
 * allein am Tab hängt. */

const STROKE = 1.7;

export function IconUebersicht() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth={STROKE} />
      <path d="M12 3.5A8.5 8.5 0 0 1 20.5 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function IconZuordnen() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="9" width="16" height="11" rx="2.5" stroke="currentColor" strokeWidth={STROKE} />
      <path d="M7 5.5h10" stroke="currentColor" strokeWidth={STROKE} strokeLinecap="round" />
      <path d="M9 14.5l2 2 4-4.5" stroke="currentColor" strokeWidth={STROKE} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconKarten() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3.5" y="6" width="17" height="12" rx="2.5" stroke="currentColor" strokeWidth={STROKE} />
      <path d="M3.5 10.5h17" stroke="currentColor" strokeWidth={STROKE} />
    </svg>
  );
}

export function IconVerlauf() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 18V11M10 18V6M16 18v-4M22 18V9" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}
