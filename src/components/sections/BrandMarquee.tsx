"use client";

import { useState } from "react";
import Image from "next/image";
import { PauseIcon, PlayIcon } from "lucide-react";
import { site } from "@/config/site";
import { cs } from "@/content/cs";

/**
 * Pás log značek za produktem (Alteno, Vizeon, ZakazIQ). Jediná nekonečná animace
 * na stránce: pauza při najetí, fokusu i tlačítkem (WCAG 2.2.2), při
 * `prefers-reduced-motion` statický řádek. Druhá kopie je jen vizuální.
 */
export function BrandMarquee() {
  const [paused, setPaused] = useState(false);
  const { brands } = cs.about;

  const list = (copy: boolean) => (
    <ul aria-hidden={copy || undefined} className="flex shrink-0 items-stretch">
      {site.brands.map((brand) => {
        const logo = (
          <Image
            src={brand.logo.src}
            alt={brand.name}
            width={brand.logo.width}
            height={brand.logo.height}
            unoptimized
            className="block max-w-none"
          />
        );
        return (
          <li key={brand.name} className="flex items-center gap-6 border-r border-rule px-8 py-6 sm:px-12">
            {brand.url ? (
              <a
                href={brand.url}
                target="_blank"
                rel="noopener noreferrer"
                tabIndex={copy ? -1 : undefined}
                className="shrink-0 rounded-sm transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
              >
                {logo}
              </a>
            ) : (
              <span className="shrink-0">{logo}</span>
            )}
            <span className="max-w-[30ch] text-[0.88rem] leading-snug text-ink-muted">{brand.description}</span>
          </li>
        );
      })}
    </ul>
  );

  return (
    <div className="border-y border-rule">
      <div className="wrap flex items-center justify-between gap-4 pt-6">
        <h3 className="type-label text-ink">{brands.title}</h3>
        <button
          type="button"
          onClick={() => setPaused((value) => !value)}
          aria-pressed={paused}
          className="inline-flex size-9 items-center justify-center rounded-sm text-ink-muted transition-colors hover:bg-paper hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent motion-reduce:hidden"
        >
          {paused ? (
            <PlayIcon aria-hidden="true" strokeWidth={1.75} className="size-4" />
          ) : (
            <PauseIcon aria-hidden="true" strokeWidth={1.75} className="size-4" />
          )}
          <span className="visually-hidden">{brands.pause}</span>
        </button>
      </div>
      <div className="marquee overflow-hidden" data-paused={paused}>
        <div className="marquee-track" data-animate="true">
          {list(false)}
          <div className="contents motion-reduce:hidden">{list(true)}</div>
        </div>
      </div>
    </div>
  );
}
