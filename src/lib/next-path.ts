/* Das Ziel nach dem Anmelden — und die eine Regel, die es prüft.
 *
 * ANLASS (07.09.2026, Nachzug zu v3-02): Wer am Handy `/mobil` aufruft, wird
 * ohne Anmeldung auf `/login` geleitet und landet danach auf `/` — dem
 * Dashboard für den Schreibtisch. Die mobile Ansicht sah der Nutzer nie,
 * obwohl sie deployt war. Die Middleware merkt sich das Ziel jetzt als
 * `?next=…`, und die Anmeldung führt dorthin zurück.
 *
 * WARUM EINE PRÜFUNG: Ein ungeprüfter `next`-Parameter ist ein offenes
 * Weiterleitungs-Ziel — `//evil.com` oder `https://…` schickte den Nutzer nach
 * dem Anmelden auf eine fremde Seite. Erlaubt ist deshalb ausschließlich ein
 * INTERNER Pfad: beginnt mit genau einem „/", enthält weder Protokoll noch
 * Rückstrich noch Leerraum, und ist nicht die Anmeldeseite selbst (sonst ein
 * Kreis). Alles andere wird zu `null`, und der Aufrufer nimmt `/`.
 *
 * Keine Importe — läuft in der Edge-Middleware, in der Server Action und im
 * Wächter `tests/e2e/login-ziel.spec.ts`, der die echte Datei transpiliert. */

export function safeNextPath(raw: string | null | undefined): string | null {
  if (typeof raw !== "string") return null;
  const s = raw.trim();
  if (s === "" || s.length > 512) return null;
  if (!s.startsWith("/")) return null;
  // protokoll-relativ („//evil.com") oder Rückstrich-Tricks („/\evil.com")
  if (s.startsWith("//") || s.includes("\\")) return null;
  if (s.includes("://")) return null;
  // Steuerzeichen und Leerraum haben in einem Pfad nichts zu suchen
  if (/[\s\u0000-\u001f\u007f]/.test(s)) return null;
  // nie zurück auf die Anmeldeseite — das wäre der Kreis, den die Middleware
  // ausdrücklich vermeidet
  if (/^\/login(\/|\?|#|$)/.test(s)) return null;
  return s;
}
