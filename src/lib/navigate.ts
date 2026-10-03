/**
 * Plynulý posun na sekci a přesun fokusu (klient).
 * Respektuje `prefers-reduced-motion`. Vrací `false`, když sekce na stránce
 * není (např. na právních stránkách), a odkaz pak normálně přejde na úvod.
 */
export function scrollToSection(id: string, focusId?: string): boolean {
  const section = document.getElementById(id);
  if (!section) return false;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  section.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });

  const focusTarget = document.getElementById(focusId ?? `${id}-title`);
  focusTarget?.focus({ preventScroll: true });

  if (window.location.hash !== `#${id}`) {
    window.history.pushState(null, "", `#${id}`);
  }
  return true;
}

/** Klik s modifikátorem (nová karta, nové okno) necháváme prohlížeči. */
export function isModifiedClick(event: React.MouseEvent): boolean {
  return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;
}

/** Id prvního pole kontaktního formuláře. */
export const CONTACT_FIRST_FIELD_ID = "contact-name";
