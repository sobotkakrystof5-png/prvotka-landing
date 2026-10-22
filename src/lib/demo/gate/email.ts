import { DISPOSABLE_DOMAINS } from "./disposableDomains";

/**
 * Sjednocení e-mailu pro pravidlo „demo jen jednou na e-mail“ (D-003, BRIEF bod 2).
 * Uložený a zobrazovaný e-mail zůstává, jak ho klient napsal. Sjednocená podoba slouží
 * jen k porovnání (`leads.email_normalized`).
 */

const GMAIL_DOMAINS: ReadonlySet<string> = new Set(["gmail.com", "googlemail.com"]);

/**
 * Malá písmena, ořez mezer, bez „+něco“ v místní části. U Gmailu a Googlemailu
 * navíc bez teček a s jednotnou doménou `gmail.com`.
 * Vrací `null`, když po úpravě nezbude platná místní část nebo doména.
 */
export function normalizeEmail(input: string): string | null {
  const email = input.trim().toLowerCase();
  const at = email.lastIndexOf("@");
  if (at <= 0 || at === email.length - 1) return null;

  let local = email.slice(0, at);
  let domain = email.slice(at + 1).replace(/\.+$/, "");
  if (!domain.includes(".")) return null;

  const plus = local.indexOf("+");
  if (plus !== -1) local = local.slice(0, plus);

  if (GMAIL_DOMAINS.has(domain)) {
    local = local.replaceAll(".", "");
    domain = "gmail.com";
  }

  return local.length > 0 ? `${local}@${domain}` : null;
}

/** Doména ze seznamu jednorázových schránek, nebo její subdoména. */
export function isDisposableDomain(domain: string): boolean {
  const labels = domain.trim().toLowerCase().replace(/\.+$/, "").split(".");
  for (let i = 0; i < labels.length - 1; i++) {
    if (DISPOSABLE_DOMAINS.has(labels.slice(i).join("."))) return true;
  }
  return false;
}

export function isDisposableEmail(email: string): boolean {
  const at = email.lastIndexOf("@");
  return at !== -1 && isDisposableDomain(email.slice(at + 1));
}
