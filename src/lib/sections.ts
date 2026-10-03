import { site } from "@/config/site";

/**
 * Pořadí sekcí landing page (brief, část 5, změna 2026-10-03): problém,
 * hned potom kalkulačka, pak řešení. Čísla „(01)“ až „(09)“ se
 * počítají z viditelných sekcí, takže skrytá případová studie nenechá díru.
 */
export const ALL_SECTIONS = [
  "uvod",
  "proc",
  "kalkulacka",
  "jak-to-funguje",
  "prinos",
  "na-miru",
  "pripadova-studie",
  "kdo-za-tim-stoji",
  "faq",
  "kontakt",
] as const;

export type SectionId = (typeof ALL_SECTIONS)[number];

export function isSectionVisible(id: SectionId): boolean {
  if (id === "pripadova-studie") return site.caseStudy !== null;
  return true;
}

export const visibleSections: SectionId[] = ALL_SECTIONS.filter(isSectionVisible);

/** Vrací číslo sekce ve tvaru „(02)“. */
export function sectionNumber(id: SectionId): string {
  const index = visibleSections.indexOf(id);
  return `(${String(index + 1).padStart(2, "0")})`;
}

/** Odkazy v navbaru (brief, část 5). */
export const NAV_SECTIONS = [
  "kalkulacka",
  "jak-to-funguje",
  "na-miru",
  "kdo-za-tim-stoji",
  "faq",
  "kontakt",
] as const satisfies readonly SectionId[];
