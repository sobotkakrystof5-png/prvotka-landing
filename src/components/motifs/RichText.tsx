import { Fragment } from "react";
import { Mark } from "./Mark";
import { withPlaceholders } from "./Placeholder";

/**
 * Text z `cs.ts` s jednoduchým značením: `*slovo*` se vykreslí jako `<Mark>`
 * (max 1–2 slova na sekci), `[PLACEHOLDER]` jako viditelný placeholder.
 * Interpunkce hned za zvýrazněním drží s ním na jednom řádku.
 */
const MARK = /(\*[^*]+\*)/g;
const IS_MARK = /^\*[^*]+\*$/;
const LEADING_PUNCTUATION = /^[,.;:!?…“)]+/;

export function RichText({ text }: { text: string }) {
  const parts = text.split(MARK);
  const nodes: React.ReactNode[] = [];

  for (let index = 0; index < parts.length; index += 1) {
    const part = parts[index];
    if (IS_MARK.test(part)) {
      const punctuation = parts[index + 1]?.match(LEADING_PUNCTUATION)?.[0] ?? "";
      if (punctuation) parts[index + 1] = parts[index + 1].slice(punctuation.length);
      nodes.push(
        <span key={index} className="whitespace-nowrap">
          <Mark>{part.slice(1, -1)}</Mark>
          {punctuation}
        </span>,
      );
    } else if (part) {
      nodes.push(<Fragment key={index}>{withPlaceholders(part)}</Fragment>);
    }
  }

  return <>{nodes}</>;
}

/** Stejný text bez značek, např. pro `aria-label` nebo metadata. */
export function plainText(text: string): string {
  return text.replace(/\*/g, "");
}
