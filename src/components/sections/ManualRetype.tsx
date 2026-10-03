"use client";

import { useRef } from "react";
import { CheckIcon, TriangleAlertIcon } from "lucide-react";
import { cs } from "@/content/cs";
import { cn } from "@/lib/utils";
import { useOneShotTimeline } from "@/lib/useOneShotTimeline";
import { ReplayButton } from "@/components/motifs/ReplayButton";
import { SampleBadge } from "@/components/motifs/SampleBadge";

/**
 * Ukázka ručního přepisu v sekci Proč to řešit. Vlevo naskenovaná faktura,
 * vpravo formulář účetního programu, do kterého někdo údaje vypisuje znak
 * po znaku. U částky přehodí dvě číslice a doklad se uloží i s chybou.
 * Ukazuje problém, ne číslo. Běží jednou (do 5 s), pak klid.
 * Vizuální vrstva je `aria-hidden`, čtečka dostane jednu větu, co se stalo.
 */

const { retype } = cs.proc;

const START = 0.4;
const CHAR = 0.065;
const FIELD_PAUSE = 0.3;
const NOTE_DELAY = 0.35;

// Kdy se začne a kdy přestane psát každé pole.
const SCHEDULE = (() => {
  let cursor = START;
  return retype.fields.map((field) => {
    const start = cursor;
    const end = start + field.typed.length * CHAR;
    cursor = end + FIELD_PAUSE;
    return { start, end };
  });
})();

const TYPED_END = SCHEDULE[SCHEDULE.length - 1].end;
const END = TYPED_END + NOTE_DELAY;

// Které místo na faktuře účetní právě čte (zvýrazní se při psaní pole).
const SOURCE_FOR_FIELD: Record<string, string> = {
  Dodavatel: "Dodavatel",
  IČO: "IČO",
  "Číslo faktury": "heading",
  Celkem: "total",
};

function visibleChars(index: number, time: number): number {
  const { start } = SCHEDULE[index];
  const length = retype.fields[index].typed.length;
  if (time < start) return 0;
  return Math.min(length, Math.floor((time - start) / CHAR) + 1);
}

export function ManualRetype() {
  const rootRef = useRef<HTMLDivElement>(null);
  const { time, status, replay, reduce } = useOneShotTimeline(rootRef, END);

  const activeIndex = SCHEDULE.findIndex(({ start, end }) => time >= start && time < end + FIELD_PAUSE);
  const activeSource = activeIndex === -1 ? null : SOURCE_FOR_FIELD[retype.fields[activeIndex].label];
  const finished = time >= END;

  return (
    <div ref={rootRef} className="relative">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="type-label text-ink">{retype.label}</p>
        <SampleBadge />
      </div>

      <div aria-hidden="true" className="grid gap-5 sm:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] sm:items-start sm:gap-6">
        {/* Naskenovaná faktura */}
        <div className="relative rounded-sm border border-rule bg-sheet p-4 shadow-paper sm:mt-6 sm:-rotate-[1.5deg] sm:p-5">
          <p className="type-label">{retype.source}</p>
          <p
            className={cn(
              "mt-3 -mx-1 rounded-[2px] px-1 font-heading text-[1.2rem] leading-tight transition-colors duration-200",
              activeSource === "heading" && "bg-accent-soft",
            )}
          >
            {retype.invoice.heading}
          </p>
          <dl className="mt-3 flex flex-col gap-1 font-mono text-[0.78rem] tabular">
            {retype.invoice.lines.map(([label, value]) => (
              <div
                key={label}
                className={cn(
                  "-mx-1 flex justify-between gap-3 rounded-[2px] px-1 py-0.5 transition-colors duration-200",
                  activeSource === label && "bg-accent-soft",
                )}
              >
                <dt className="text-ink-muted">{label}</dt>
                <dd className="text-right text-ink">{value}</dd>
              </div>
            ))}
          </dl>
          <div
            className={cn(
              "-mx-1 mt-4 flex items-baseline justify-between gap-3 rounded-[2px] border-t border-rule px-1 pt-3 transition-colors duration-200",
              activeSource === "total" && "bg-accent-soft",
            )}
          >
            <span className="text-[0.8rem] text-ink-muted">{retype.invoice.total[0]}</span>
            <span className="font-mono text-[1rem] font-semibold whitespace-nowrap tabular">{retype.invoice.total[1]}</span>
          </div>
        </div>

        {/* Formulář účetního programu */}
        <div className="rounded-sm border border-field-border bg-paper">
          <p className="type-label border-b border-rule px-4 py-2.5">{retype.target}</p>
          <div className="flex flex-col gap-2.5 p-4">
            {retype.fields.map((field, index) => (
              <TypedField
                key={field.label}
                label={field.label}
                typed={field.typed}
                correct={"correct" in field ? field.correct : undefined}
                count={visibleChars(index, time)}
                active={index === activeIndex && status === "running"}
                flagged={finished}
              />
            ))}
          </div>
          <div className="flex min-h-[3.25rem] items-center gap-2 border-t border-rule px-4 py-3 text-[0.85rem]">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 text-ink-muted transition-opacity duration-300",
                finished ? "opacity-100" : "opacity-0",
              )}
            >
              <CheckIcon strokeWidth={2} className="size-4" />
              {retype.saved}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex min-h-9 flex-wrap items-center justify-between gap-3">
        <p
          aria-hidden="true"
          className={cn(
            "inline-flex items-center gap-2 text-[0.98rem] font-semibold text-warn-ink transition-opacity duration-300",
            finished ? "opacity-100" : "opacity-0",
          )}
        >
          <TriangleAlertIcon strokeWidth={2} className="size-4 shrink-0" />
          {retype.note}
        </p>
        {reduce ? null : (
          <ReplayButton onClick={replay} disabled={status !== "done"}>
            {retype.replay}
          </ReplayButton>
        )}
      </div>

      <p className="visually-hidden">{retype.screenReader}</p>
    </div>
  );
}

function TypedField({
  label,
  typed,
  correct,
  count,
  active,
  flagged,
}: {
  label: string;
  typed: string;
  correct?: string;
  count: number;
  active: boolean;
  flagged: boolean;
}) {
  const wrong = flagged && correct !== undefined && correct !== typed;
  const chars = typed.slice(0, count).split("");

  return (
    <div className="flex flex-col gap-1">
      <span className="text-[0.8rem] text-ink-muted">{label}</span>
      <span
        className={cn(
          "flex h-9 items-center overflow-hidden rounded-sm border bg-sheet px-2.5 font-mono text-[0.9rem] whitespace-pre text-ink tabular transition-colors duration-300",
          active ? "border-accent" : "border-field-border",
          wrong && "border-warn bg-warn-soft",
        )}
      >
        {chars.map((char, index) => (
          <span
            key={index}
            className={cn(wrong && correct?.[index] !== char && "font-semibold text-warn-ink underline decoration-warn underline-offset-2")}
          >
            {char}
          </span>
        ))}
        {active ? <span className="ml-px inline-block h-[1.1em] w-px bg-accent" /> : null}
      </span>
    </div>
  );
}
