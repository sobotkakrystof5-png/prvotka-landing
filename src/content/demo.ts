import { deepTypo } from "@/lib/typography";

/**
 * Texty dema (`/demo`, `/demo/app`). Stejná pravidla jako `cs.ts`: konkrétně, vykat,
 * bez pomlček jako spojky, neznámé jako viditelný `[PLACEHOLDER]`, nové texty projdou
 * skillem `humanize-text-cs`. Odděleno od `cs.ts`, aby texty webu a dema nesplývaly.
 */
const raw = {
  meta: {
    title: "Demo",
    description: "Vyzkoušejte Prvotku na čtyřech vlastních fakturách.",
  },
  header: {
    badge: "Demo",
    home: "Zpět na prvotka.cz",
  },
  gate: {
    margin: "(00)",
    marginName: "Demo",
    title: "Demo Prvotky",
    placeholder: "[FORMULÁŘ BRÁNY: fáze F1]",
  },
  workspace: {
    margin: "(01)",
    marginName: "Plocha",
    title: "Vaše faktury",
    greeting: "Dobrý den, vaše plocha je připravená.",
    placeholder: "[PLOCHA: fáze F2]",
  },
  disabled: {
    title: "Demo je teď vypnuté",
    text: "Pokud si chcete aplikaci vyzkoušet, napište mi přes kontaktní formulář a domluvíme ukázku.",
    back: "Na kontaktní formulář",
  },
} as const;

export const demoCs = deepTypo(raw);
