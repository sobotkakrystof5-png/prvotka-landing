"use client";

import { useEffect, useReducer } from "react";
import { AnimatePresence, m } from "motion/react";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import { ArrowRightIcon, CheckIcon, FileTextIcon, ImageIcon, TriangleAlertIcon } from "lucide-react";
import { cs } from "@/content/cs";
import { cn } from "@/lib/utils";
import { SampleBadge } from "@/components/motifs/SampleBadge";
import { Stamp } from "@/components/motifs/Stamp";

/**
 * Interaktivní demo „Přijde na stůl → Aplikace zpracuje → Odejde hotové“
 * (brief, část 6.3, princip převzatý z Alteno). Řízené jedním stavovým
 * automatem: idle → reading → checking → done | warning.
 * Stav se oznamuje přes `aria-live="polite"`. Při omezených animacích
 * se rovnou ukáže výsledek.
 */

type Phase = "idle" | "reading" | "checking" | "done" | "warning";

interface State {
  caseIndex: number | null;
  /** Počet hotových kroků. */
  step: number;
  phase: Phase;
}

type Action = { type: "select"; index: number; instant: boolean } | { type: "tick" };

const cases = cs.howItWorks.demo.cases;
const STEP_MS = 520;

function finalPhase(index: number): Phase {
  return cases[index].outcome === "warning" ? "warning" : "done";
}

function phaseForStep(index: number, step: number): Phase {
  return step >= cases[index].checkFrom ? "checking" : "reading";
}

function reducer(state: State, action: Action): State {
  if (action.type === "select") {
    const total = cases[action.index].steps.length;
    return action.instant
      ? { caseIndex: action.index, step: total, phase: finalPhase(action.index) }
      : { caseIndex: action.index, step: 0, phase: phaseForStep(action.index, 0) };
  }
  if (state.caseIndex === null || (state.phase !== "reading" && state.phase !== "checking")) return state;
  const next = state.step + 1;
  const total = cases[state.caseIndex].steps.length;
  if (next >= total) return { ...state, step: total, phase: finalPhase(state.caseIndex) };
  return { ...state, step: next, phase: phaseForStep(state.caseIndex, next) };
}

export function InvoiceDemo() {
  const { demo } = cs.howItWorks;
  const reduce = usePrefersReducedMotion();
  const [state, dispatch] = useReducer(reducer, { caseIndex: null, step: 0, phase: "idle" });

  const running = state.phase === "reading" || state.phase === "checking";
  useEffect(() => {
    if (!running) return;
    const timer = window.setTimeout(() => dispatch({ type: "tick" }), STEP_MS);
    return () => window.clearTimeout(timer);
  }, [running, state.step]);

  const current = state.caseIndex === null ? null : cases[state.caseIndex];
  const finished = state.phase === "done" || state.phase === "warning";

  const announcement =
    current === null
      ? ""
      : running
        ? demo.live.processing(current.title)
        : state.phase === "warning"
          ? demo.live.warning
          : current.outcome === "attachment"
            ? demo.live.attachment
            : demo.live.done;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <h3 className="type-h3">{demo.title}</h3>
        <SampleBadge>{demo.sampleNote}</SampleBadge>
      </div>

      <div className="grid overflow-hidden rounded-sm border border-rule bg-sheet shadow-paper lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1fr)_minmax(0,1.2fr)]">
        {/* 1. Přijde na stůl */}
        <Column title={demo.columns.input} number={1} className="border-b border-rule lg:border-r lg:border-b-0">
          <ul className="flex flex-col gap-1.5">
            {cases.map((item, index) => {
              const active = state.caseIndex === index;
              const Icon = item.id === "photo" ? ImageIcon : FileTextIcon;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    aria-pressed={active}
                    onClick={() => dispatch({ type: "select", index, instant: Boolean(reduce) })}
                    className={cn(
                      "group/case flex w-full items-start gap-3 rounded-sm border px-3 py-2.5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                      active
                        ? "border-accent bg-accent-soft/60"
                        : "border-transparent hover:border-rule hover:bg-paper",
                    )}
                  >
                    <Icon
                      aria-hidden="true"
                      strokeWidth={1.5}
                      className={cn("mt-0.5 size-[1.15rem] shrink-0", active ? "text-accent" : "text-ink-muted")}
                    />
                    <span className="min-w-0">
                      <span className="block text-[0.95rem] leading-snug font-semibold text-ink">{item.title}</span>
                      <span className="block text-[0.82rem] leading-snug text-ink-muted">{item.hint}</span>
                    </span>
                    <ArrowRightIcon
                      aria-hidden="true"
                      strokeWidth={1.5}
                      className={cn(
                        "mt-1 ml-auto size-4 shrink-0 transition-[opacity,transform] motion-reduce:transition-none",
                        active ? "text-accent opacity-100" : "-translate-x-1 opacity-0 group-hover/case:translate-x-0 group-hover/case:opacity-60",
                      )}
                    />
                  </button>
                </li>
              );
            })}
          </ul>
        </Column>

        {/* 2. Aplikace zpracuje */}
        <Column title={demo.columns.process} number={2} className="border-b border-rule bg-paper/60 lg:border-r lg:border-b-0">
          {current === null ? (
            <p className="max-w-[28ch] text-[0.98rem] leading-relaxed text-ink-muted">
              <span className="hidden lg:inline">{demo.idle}</span>
              <span className="lg:hidden">{demo.idleMobile}</span>
            </p>
          ) : (
            <div key={current.id}>
              <m.div
                className="mb-5 inline-flex max-w-full items-center gap-2 rounded-sm border border-rule bg-sheet px-2.5 py-1.5 font-mono text-[0.76rem] text-ink shadow-paper"
                initial={reduce ? false : { opacity: 0, x: -28 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, ease: [0.2, 0.7, 0.2, 1] }}
              >
                <FileTextIcon aria-hidden="true" strokeWidth={1.5} className="size-3.5 shrink-0 text-ink-muted" />
                <span className="truncate">{current.file}</span>
              </m.div>
              <ol className="flex flex-col">
                {current.steps.map((stepText, index) => {
                  const done = index < state.step;
                  const active = index === state.step && running;
                  const warn = state.phase === "warning" && index === current.steps.length - 1;
                  return (
                    <li
                      key={stepText}
                      className={cn(
                        "flex items-center gap-3 border-b border-dotted border-rule py-2 text-[0.9rem] transition-colors duration-200",
                        done || active ? "text-ink" : "text-ink-muted",
                      )}
                    >
                      <span
                        aria-hidden="true"
                        className={cn(
                          "inline-flex size-[1.1rem] shrink-0 items-center justify-center rounded-sm border transition-colors duration-200",
                          warn
                            ? "border-warn bg-warn-soft text-warn-ink"
                            : done
                              ? "border-accent bg-accent text-sheet"
                              : active
                                ? "border-accent"
                                : "border-rule",
                        )}
                      >
                        {warn ? (
                          <TriangleAlertIcon strokeWidth={2.25} className="size-3" />
                        ) : done ? (
                          <CheckIcon strokeWidth={2.5} className="size-3" />
                        ) : active ? (
                          <span className="size-1.5 bg-accent" />
                        ) : null}
                      </span>
                      {stepText}
                    </li>
                  );
                })}
              </ol>
            </div>
          )}
        </Column>

        {/* 3. Odejde hotové */}
        <Column title={demo.columns.output} number={3} className="min-h-[24rem]">
          <AnimatePresence mode="wait" initial={false}>
            {current === null || !finished ? (
              <m.p
                key="waiting"
                className="flex min-h-[10rem] items-center justify-center rounded-sm border border-dashed border-rule px-4 text-center text-[0.92rem] text-ink-muted"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
              >
                {demo.idleOutput}
              </m.p>
            ) : (
              <m.div
                key={current.id}
                initial={reduce ? false : { opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.32, ease: [0.2, 0.7, 0.2, 1] }}
                className="relative"
              >
                {state.phase === "warning" ? (
                  <p
                    role="alert"
                    className="mb-4 flex gap-2.5 rounded-sm border border-warn bg-warn-soft px-3 py-2.5 text-[0.9rem] leading-snug text-warn-ink"
                  >
                    <TriangleAlertIcon aria-hidden="true" strokeWidth={1.75} className="mt-0.5 size-4 shrink-0 text-warn" />
                    <span>
                      <span className="font-semibold">{demo.warning}</span> {demo.warningFix}
                    </span>
                  </p>
                ) : current.outcome === "attachment" ? (
                  <p className="mb-4 rounded-sm border border-rule bg-paper px-3 py-2.5 text-[0.9rem] leading-snug text-ink">
                    {demo.attachment}
                  </p>
                ) : null}

                <h4 className="type-label mb-2">{demo.fieldsTitle}</h4>
                <dl className="grid grid-cols-[auto_minmax(0,1fr)] font-mono text-[0.78rem]">
                  {current.fields.map(([label, value]) => {
                    const flagged = state.phase === "warning" && "flagged" in current && current.flagged === label;
                    return (
                      <div key={label} className="contents">
                        <dt
                          className={cn(
                            "border-b border-dotted border-rule py-1.5 pr-4 font-sans text-[0.82rem] text-ink-muted",
                            flagged && "text-warn-ink",
                          )}
                        >
                          {label}
                        </dt>
                        <dd
                          className={cn(
                            "truncate border-b border-dotted border-rule py-1.5 text-right text-ink",
                            flagged && "bg-warn-soft px-1.5 font-semibold text-warn-ink",
                          )}
                        >
                          {value}
                          {flagged && "itemsSum" in current ? (
                            <span className="block text-[0.72rem] font-normal">
                              {demo.flaggedNote(String(current.itemsSum))}
                            </span>
                          ) : null}
                        </dd>
                      </div>
                    );
                  })}
                </dl>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                  {state.phase === "warning" ? (
                    <span />
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-[0.9rem] font-semibold text-accent">
                      <CheckIcon aria-hidden="true" strokeWidth={2.25} className="size-4" />
                      {demo.ready}
                    </span>
                  )}
                  {state.phase === "warning" ? (
                    <Stamp tone="warn">{demo.stampWarn}</Stamp>
                  ) : current.outcome === "done" ? (
                    <Stamp>{demo.stampOk}</Stamp>
                  ) : null}
                </div>
              </m.div>
            )}
          </AnimatePresence>
        </Column>
      </div>

      <p aria-live="polite" className="visually-hidden">
        {announcement}
      </p>
    </div>
  );
}

function Column({
  title,
  number,
  className,
  children,
}: {
  title: string;
  number: number;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("p-5 sm:p-6", className)}>
      <p className="type-label mb-5 flex items-center gap-2 text-ink">
        <span className="text-ink-muted">{number}</span>
        {title}
      </p>
      {children}
    </div>
  );
}
