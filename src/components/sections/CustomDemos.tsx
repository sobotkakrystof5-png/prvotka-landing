"use client";

import { useState } from "react";
import { AnimatePresence, m } from "motion/react";
import { ArrowRightIcon, CheckIcon, LockIcon, PlusIcon, RotateCcwIcon } from "lucide-react";
import { site } from "@/config/site";
import { cs } from "@/content/cs";
import { cn } from "@/lib/utils";

/**
 * Malé živé ukázky UI u bodů „Na míru“ (princip Chase AI: ukázka místo ikony).
 * Vše jsou ukázková data, panel nese štítek „Ukázka“.
 */

const items = cs.custom.items;
const swap = {
  initial: { opacity: 0, y: 4 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -4 },
  transition: { duration: 0.18 },
};

function Chip({
  active,
  onClick,
  children,
  disabled,
}: {
  active: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-pressed={disabled ? undefined : active}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex h-9 items-center rounded-sm border px-3 text-[0.86rem] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-default",
        active ? "border-accent bg-accent text-sheet" : "border-field-border bg-sheet text-ink hover:border-ink",
        disabled && "border-dashed bg-transparent font-normal",
      )}
    >
      {children}
    </button>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-dotted border-rule py-2 text-[0.88rem]">
      <span className="text-ink-muted">{label}</span>
      <span className="text-right font-mono text-[0.82rem] text-ink">{children}</span>
    </div>
  );
}

/** 1. Výstup pro váš program: přepínač programů mění štítek exportu. */
export function ProgramDemo() {
  const demo = items[0].demo as { label: string; exportLabel: string };
  const [program, setProgram] = useState(site.accountingPrograms[0] ?? "");
  return (
    <div>
      <p className="type-label mb-2.5">{demo.label}</p>
      <div className="flex flex-wrap gap-2">
        {site.accountingPrograms.map((name) => (
          <Chip key={name} active={program === name} onClick={() => setProgram(name)}>
            {name}
          </Chip>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-3 rounded-sm border border-rule bg-paper px-3 py-2.5 font-mono text-[0.82rem]">
        <span className="text-ink-muted">{demo.exportLabel}</span>
        <ArrowRightIcon aria-hidden="true" strokeWidth={1.5} className="size-4 text-ink-muted" />
        <AnimatePresence mode="wait" initial={false}>
          <m.span key={program} className="text-accent" {...swap}>
            ISDOC pro {program}
          </m.span>
        </AnimatePresence>
      </div>
    </div>
  );
}

/** 2. Mapování polí: stejná faktura, jiné nastavení pro jinou kancelář. */
export function MappingDemo() {
  const demo = items[1].demo as { label: string; offices: { name: string; rows: { field: string; value: string }[] }[] };
  const [office, setOffice] = useState(0);
  return (
    <div>
      <p className="type-label mb-2.5">{demo.label}</p>
      <div className="flex gap-2">
        {demo.offices.map((item, index) => (
          <Chip key={item.name} active={office === index} onClick={() => setOffice(index)}>
            {item.name}
          </Chip>
        ))}
      </div>
      <div className="mt-3">
        {demo.offices[office].rows.map((row) => (
          <Row key={row.field} label={row.field}>
            <AnimatePresence mode="wait" initial={false}>
              <m.span key={`${office}-${row.value}`} className="inline-flex items-center gap-2" {...swap}>
                <ArrowRightIcon aria-hidden="true" strokeWidth={1.5} className="size-3.5 text-ink-muted" />
                {row.value}
              </m.span>
            </AnimatePresence>
          </Row>
        ))}
      </div>
    </div>
  );
}

/** 3. Formáty: co přišlo a co s tím aplikace udělá. */
export function FormatsDemo() {
  const demo = items[2].demo as { label: string; formats: { name: string; result: string }[] };
  const [selected, setSelected] = useState(0);
  const format = demo.formats[selected];
  return (
    <div>
      <p className="type-label mb-2.5">{demo.label}</p>
      <div className="flex flex-wrap gap-2">
        {demo.formats.map((item, index) => (
          <Chip key={item.name} active={selected === index} onClick={() => setSelected(index)}>
            {item.name}
          </Chip>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-3 rounded-sm border border-rule bg-paper px-3 py-2.5 text-[0.9rem]">
        <span className="font-mono text-[0.82rem] text-ink">{format.name}</span>
        <ArrowRightIcon aria-hidden="true" strokeWidth={1.5} className="size-4 text-ink-muted" />
        <AnimatePresence mode="wait" initial={false}>
          <m.span key={format.result + selected} className="font-semibold text-accent" {...swap}>
            {format.result}
          </m.span>
        </AnimatePresence>
      </div>
    </div>
  );
}

/** 4. Přístup jen pro vaše lidi. */
export function AccessDemo() {
  const demo = items[3].demo as {
    label: string;
    insider: { who: string; result: string };
    outsider: { who: string; result: string };
  };
  const [who, setWho] = useState<"insider" | "outsider">("insider");
  const allowed = who === "insider";
  return (
    <div>
      <p className="type-label mb-2.5">{demo.label}</p>
      <div className="flex flex-wrap gap-2">
        <Chip active={allowed} onClick={() => setWho("insider")}>
          {demo.insider.who}
        </Chip>
        <Chip active={!allowed} onClick={() => setWho("outsider")}>
          {demo.outsider.who}
        </Chip>
      </div>
      <div
        className={cn(
          "mt-4 flex items-center gap-2.5 rounded-sm border px-3 py-2.5 text-[0.9rem] font-semibold transition-colors",
          allowed ? "border-rule bg-paper text-accent" : "border-ink/30 bg-paper-deep text-ink",
        )}
      >
        {allowed ? (
          <CheckIcon aria-hidden="true" strokeWidth={2.25} className="size-4" />
        ) : (
          <LockIcon aria-hidden="true" strokeWidth={1.75} className="size-4" />
        )}
        <AnimatePresence mode="wait" initial={false}>
          <m.span key={who} {...swap}>
            {allowed ? demo.insider.result : demo.outsider.result}
          </m.span>
        </AnimatePresence>
      </div>
    </div>
  );
}

/** 5. Žádný poplatek za doklad: faktur přibývá, poplatek zůstává nulový. */
export function FeeDemo() {
  const demo = items[4].demo as { invoices: string; add: string; reset: string; fee: string };
  const [count, setCount] = useState(200);
  const full = count >= 3000;
  const format = new Intl.NumberFormat("cs-CZ");
  return (
    <div>
      <Row label={demo.invoices}>
        <AnimatePresence mode="popLayout" initial={false}>
          <m.span key={count} className="inline-block tabular" {...swap}>
            {format.format(count)}
          </m.span>
        </AnimatePresence>
      </Row>
      <Row label={demo.fee}>
        <span className="font-semibold text-accent">0&nbsp;Kč</span>
      </Row>
      <div className="mt-4">
        <button
          type="button"
          onClick={() => setCount((value) => (value >= 3000 ? 200 : Math.min(3000, value + 100)))}
          className="inline-flex h-9 items-center gap-2 rounded-sm border border-field-border bg-sheet px-3 text-[0.86rem] font-semibold text-ink transition-colors hover:border-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          {full ? (
            <RotateCcwIcon aria-hidden="true" strokeWidth={1.75} className="size-4" />
          ) : (
            <PlusIcon aria-hidden="true" strokeWidth={1.75} className="size-4" />
          )}
          {full ? demo.reset : demo.add}
        </button>
      </div>
      <p aria-live="polite" className="visually-hidden">
        {`${demo.invoices}: ${format.format(count)}. ${demo.fee}: 0 Kč.`}
      </p>
    </div>
  );
}
