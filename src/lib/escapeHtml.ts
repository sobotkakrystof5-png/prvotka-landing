/**
 * Escapuje text pro vložení do HTML e-mailu. Vstupy z formuláře se nikdy
 * nevykreslují jako HTML (AGENTS.md, část 9, pravidlo 4).
 */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Odstraní konce řádků a řídicí znaky, např. pro předmět e-mailu. */
export function toSingleLine(value: string): string {
  return value.replace(/[\u0000-\u001f\u007f]+/g, " ").replace(/\s+/g, " ").trim();
}
