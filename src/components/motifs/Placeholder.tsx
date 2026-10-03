import { Fragment } from "react";
import { site } from "@/config/site";
import { BrandName } from "./LogoMark";

/**
 * Neznámý údaj ve tvaru `[PLACEHOLDER]` musí být na stránce vidět (brief, část 0).
 * `withPlaceholders` rozdělí text a každý placeholder obalí výrazným štítkem.
 * Název produktu (`site.name`) v textu nahradí logem (`BrandName`), i s
 * interpunkcí hned za ním, aby se tečka neodtrhla na další řádek.
 */
const SPLIT = /(\[[^\]]+\])/g;
const IS_PLACEHOLDER = /^\[[^\]]+\]$/;
const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const BRAND = new RegExp(`(${escapeRegExp(site.name)}[,.;:!?…]*)`, "g");

function withBrand(text: string): React.ReactNode {
  if (!text.includes(site.name)) return text;
  return text.split(BRAND).map((part, index) =>
    part.startsWith(site.name) ? (
      <span key={index} className="whitespace-nowrap">
        <BrandName />
        {part.slice(site.name.length)}
      </span>
    ) : (
      <Fragment key={index}>{part}</Fragment>
    ),
  );
}

export function Placeholder({ children }: { children: string }) {
  return <span className="placeholder-text">{children}</span>;
}

export function withPlaceholders(text: string): React.ReactNode {
  if (!text.includes("[")) return withBrand(text);
  return text.split(SPLIT).map((part, index) =>
    IS_PLACEHOLDER.test(part) ? (
      <Placeholder key={index}>{part}</Placeholder>
    ) : (
      <Fragment key={index}>{withBrand(part)}</Fragment>
    ),
  );
}
