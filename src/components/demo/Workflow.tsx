"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  animate,
  m,
  useInView,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
  type AnimationPlaybackControls,
  type MotionValue,
} from "motion/react";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import { BookOpenIcon, CheckIcon, PauseIcon, PlayIcon, RotateCcwIcon } from "lucide-react";
import { cs } from "@/content/cs";
import { cn } from "@/lib/utils";
import { IsdocxIcon, PdfIcon } from "@/components/motifs/DocIcons";
import { LogoMark } from "@/components/motifs/LogoMark";
import { withPlaceholders } from "@/components/motifs/Placeholder";
import { SampleBadge } from "@/components/motifs/SampleBadge";
import { Stamp } from "@/components/motifs/Stamp";
import {
  END_TIME,
  FIELD_TIMES,
  LINE_TIMES,
  READY_TIME,
  STAMP_TIME,
  TRAVEL,
  cubicPoint,
  nodeStateAt,
  phaseAt,
  stageFor,
  timeForStage,
  type NodeState,
  type Point,
} from "./workflowTimeline";

/**
 * Workflow „Od PDF faktury do účetnictví“ ve stylu n8n (brief, část 6.3).
 * Uzly jsou položky `<ol>`, spoje a putující dokument jsou `aria-hidden`.
 * Jeden běh při vstupu do viewportu, pak se zastaví na výsledku.
 * Od 1024 px vodorovně se schodovitě posunutými uzly, pod tím svisle.
 */

type RunStatus = "idle" | "running" | "paused" | "finished";

// Geometrie desktopu v px: pevná výška uzlů, žádný layout shift.
const NODE_H = 272;
const STAGGER = 48;
const CONN_W = 56;
const PORT_Y = NODE_H / 2;

interface Geometry {
  width: number;
  height: number;
  p0: Point;
  p1: Point;
  p2: Point;
  p3: Point;
}

const DOWN: Geometry = {
  width: CONN_W,
  height: NODE_H + STAGGER,
  p0: { x: 0, y: PORT_Y },
  p1: { x: CONN_W / 2, y: PORT_Y },
  p2: { x: CONN_W / 2, y: PORT_Y + STAGGER },
  p3: { x: CONN_W, y: PORT_Y + STAGGER },
};

const UP: Geometry = {
  width: CONN_W,
  height: NODE_H + STAGGER,
  p0: { x: 0, y: PORT_Y + STAGGER },
  p1: { x: CONN_W / 2, y: PORT_Y + STAGGER },
  p2: { x: CONN_W / 2, y: PORT_Y },
  p3: { x: CONN_W, y: PORT_Y },
};

const VERTICAL: Geometry = {
  width: 16,
  height: 48,
  p0: { x: 8, y: 0 },
  p1: { x: 8, y: 24 },
  p2: { x: 8, y: 24 },
  p3: { x: 8, y: 48 },
};

function pathFor(g: Geometry): string {
  return `M${g.p0.x},${g.p0.y} C${g.p1.x},${g.p1.y} ${g.p2.x},${g.p2.y} ${g.p3.x},${g.p3.y}`;
}

export function Workflow() {
  const { workflow } = cs.howItWorks;
  const rootRef = useRef<HTMLDivElement>(null);
  const reduce = usePrefersReducedMotion();
  const inView = useInView(rootRef, { amount: 0.35 });

  const t = useMotionValue(-1);
  const [stage, setStage] = useState(0);
  const [status, setStatus] = useState<RunStatus>("idle");
  const statusRef = useRef<RunStatus>("idle");
  const controls = useRef<AnimationPlaybackControls | null>(null);

  const [hovered, setHovered] = useState<number | null>(null);
  const [selected, setSelected] = useState<number | null>(null);

  const updateStatus = useCallback((next: RunStatus) => {
    statusRef.current = next;
    setStatus(next);
  }, []);

  useMotionValueEvent(t, "change", (value) => setStage(stageFor(value)));

  const start = useCallback(() => {
    controls.current?.stop();
    t.set(0);
    updateStatus("running");
    controls.current = animate(t, END_TIME, {
      duration: END_TIME,
      ease: "linear",
      onComplete: () => updateStatus("finished"),
    });
  }, [t, updateStatus]);

  const pause = useCallback(() => {
    controls.current?.pause();
    updateStatus("paused");
  }, [updateStatus]);

  const resume = useCallback(() => {
    controls.current?.play();
    updateStatus("running");
  }, [updateStatus]);

  // Omezené animace: rovnou koncový stav se všemi uzly, spoji a popisy.
  useEffect(() => {
    if (!reduce) return;
    controls.current?.stop();
    // Stage se přepočítá sám přes useMotionValueEvent, ovládací tlačítka se při
    // omezených animacích nezobrazují, stačí tedy stav v refu.
    t.set(END_TIME);
    statusRef.current = "finished";
  }, [reduce, t]);

  // Spuštění při vstupu do viewportu. Po doběhnutí znovu při dalším vstupu.
  useEffect(() => {
    if (reduce || !inView) return;
    if (statusRef.current === "idle" || statusRef.current === "finished") start();
  }, [inView, reduce, start]);

  useEffect(() => () => controls.current?.stop(), []);

  const time = timeForStage(stage);
  const phase = phaseAt(time);
  const shown = hovered ?? selected;
  const detail = shown === null ? workflow.hint : workflow.nodes[shown].detail;

  const onNodeClick = (index: number) => {
    setSelected((current) => (current === index ? null : index));
    if (statusRef.current === "running") pause();
  };

  return (
    <div ref={rootRef} data-phase={phase} className="relative">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h3 className="type-label text-ink">{workflow.label}</h3>
        <SampleBadge />
      </div>

      <div className="ledger rounded-sm border border-rule bg-paper px-4 py-8 [--ledger-step:1.5rem] sm:px-6 lg:px-8 lg:pt-10 lg:pb-16">
        <ol className="flex flex-col gap-12 lg:grid lg:grid-cols-4 lg:gap-x-14 lg:gap-y-0">
          {workflow.nodes.map((node, index) => (
            <li
              key={node.key}
              className={cn("relative", index % 2 === 1 && "lg:mt-12")}
            >
              <NodeCard
                index={index}
                state={nodeStateAt(index, time)}
                time={time}
                isSelected={selected === index}
                onClick={() => onNodeClick(index)}
                onHover={(on) => setHovered(on ? index : null)}
              />
              {index < workflow.nodes.length - 1 ? (
                <>
                  <Connector
                    geometry={index % 2 === 0 ? DOWN : UP}
                    t={t}
                    range={TRAVEL[index]}
                    kind={index === 0 ? "pdf" : "isdocx"}
                    className={cn(
                      "absolute left-full hidden lg:block",
                      index % 2 === 0 ? "top-0" : "-top-12",
                    )}
                  />
                  <Connector
                    geometry={VERTICAL}
                    t={t}
                    range={TRAVEL[index]}
                    kind={index === 0 ? "pdf" : "isdocx"}
                    className="absolute top-full left-1/2 -translate-x-1/2 lg:hidden"
                  />
                </>
              ) : null}
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
        <p
          id="workflow-detail"
          aria-live="polite"
          className="min-h-[3.2em] max-w-[62ch] text-[0.98rem] leading-relaxed text-ink-muted"
        >
          {shown !== null ? (
            <span className="mr-2 font-mono text-[0.78rem] text-accent">{index2label(shown)}</span>
          ) : null}
          {detail}
        </p>
        {reduce ? null : (
          <div className="flex gap-2">
            {status === "running" ? (
              <ControlButton onClick={pause} icon={<PauseIcon />}>
                {workflow.controls.pause}
              </ControlButton>
            ) : status === "paused" ? (
              <ControlButton onClick={resume} icon={<PlayIcon />}>
                {workflow.controls.resume}
              </ControlButton>
            ) : null}
            <ControlButton onClick={start} icon={<RotateCcwIcon />} disabled={status === "idle"}>
              {workflow.controls.replay}
            </ControlButton>
          </div>
        )}
      </div>
    </div>
  );
}

function index2label(index: number): string {
  return `${index + 1}/4`;
}

function ControlButton({
  onClick,
  icon,
  children,
  disabled,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex h-9 items-center gap-2 rounded-sm border border-field-border bg-sheet px-3 text-sm font-semibold text-ink transition-colors hover:border-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-50 [&_svg]:size-4 [&_svg]:stroke-[1.75]"
    >
      <span aria-hidden="true">{icon}</span>
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */

function NodeCard({
  index,
  state,
  time,
  isSelected,
  onClick,
  onHover,
}: {
  index: number;
  state: NodeState;
  time: number;
  isSelected: boolean;
  onClick: () => void;
  onHover: (on: boolean) => void;
}) {
  const { workflow } = cs.howItWorks;
  const node = workflow.nodes[index];
  const statusLabel = workflow.status[state];

  const captionId = `workflow-node-${index}-caption`;

  // Vzor „roztažené tlačítko“: klikací je celá karta (::after přes kartu), ale
  // přístupné jméno tvoří jen viditelné číslo, název a stav (WCAG 2.5.3).
  return (
    <div
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      className={cn(
        "group/node relative flex w-full flex-col rounded-sm border bg-sheet text-left transition-[border-color,box-shadow] duration-300 has-[button:focus-visible]:outline-2 has-[button:focus-visible]:outline-offset-3 has-[button:focus-visible]:outline-accent lg:h-[272px]",
        state === "active" && "border-accent shadow-[0_0_0_1px_var(--accent),var(--paper-shadow)]",
        state === "done" && "border-ink/35 shadow-paper",
        state === "waiting" && "border-rule",
        isSelected && "outline-1 outline-offset-2 outline-accent/60 outline-dashed",
      )}
    >
      {/* Porty jako v n8n: vstup vlevo, výstup vpravo */}
      <span aria-hidden="true" className="absolute inset-0">
        {index > 0 ? <Port state={state} className="top-1/2 -left-[5px] hidden -translate-y-1/2 lg:block" /> : null}
        {index < 3 ? <Port state={state} className="top-1/2 -right-[5px] hidden -translate-y-1/2 lg:block" /> : null}
      </span>

      <button
        type="button"
        onClick={onClick}
        onFocus={() => onHover(true)}
        onBlur={() => onHover(false)}
        aria-pressed={isSelected}
        aria-controls="workflow-detail"
        aria-describedby={captionId}
        className="flex w-full items-center justify-between gap-2 border-b border-rule px-3.5 py-2.5 text-left outline-none after:absolute after:inset-0 after:content-['']"
      >
        <span className="flex min-w-0 items-center gap-2">
          <span className="font-mono text-[0.72rem] text-ink-muted">{index + 1}</span>
          <span className="truncate text-[0.95rem] font-semibold text-ink">
            {withPlaceholders(node.title)}
          </span>
        </span>
        <StatusChip state={state} label={statusLabel} />
      </button>

      <div className="relative flex flex-1 flex-col px-3.5 pt-3 pb-3">
        <NodeBody index={index} state={state} time={time} />
      </div>

      <p
        id={captionId}
        className="border-t border-dashed border-rule px-3.5 py-2.5 text-[0.82rem] leading-snug text-ink-muted"
      >
        {node.caption}
      </p>
    </div>
  );
}

function Port({ state, className }: { state: NodeState; className?: string }) {
  return (
    <span
      className={cn(
        "absolute size-2.5 rounded-full border transition-colors duration-300",
        state === "waiting" ? "border-rule bg-paper" : "border-accent bg-accent",
        className,
      )}
    />
  );
}

function StatusChip({ state, label }: { state: NodeState; label: string }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-sm px-1.5 py-0.5 font-mono text-[0.68rem] leading-none transition-colors duration-300",
        state === "waiting" && "text-ink-muted",
        state === "active" && "bg-accent text-sheet",
        state === "done" && "bg-accent-soft text-accent",
      )}
    >
      {state === "done" ? <CheckIcon aria-hidden="true" strokeWidth={2.5} className="size-3" /> : null}
      {state === "active" ? <span aria-hidden="true" className="size-1.5 bg-sheet xl:hidden" /> : null}
      {/* Na 1024–1279 px stačí ikona, název uzlu potřebuje místo. Stav je i v aria-label uzlu. */}
      <span className="lg:sr-only xl:not-sr-only">{label}</span>
    </span>
  );
}

const reveal = (on: boolean) => ({ opacity: on ? 1 : 0, x: on ? 0 : -4 });
const revealTransition = { duration: 0.28, ease: [0.2, 0.7, 0.2, 1] as const };

function NodeBody({ index, state, time }: { index: number; state: NodeState; time: number }) {
  const { workflow } = cs.howItWorks;
  const dim = state === "waiting" ? "[&_svg]:opacity-45" : "";

  if (index === 0) {
    const node = workflow.nodes[0];
    return (
      <span className={cn("flex flex-1 flex-col items-start gap-3 transition-opacity duration-300", dim)}>
        <PdfIcon className="size-14 text-ink" />
        <span className="font-mono text-[0.78rem] break-all text-ink">{"file" in node ? node.file : null}</span>
      </span>
    );
  }

  if (index === 1) {
    const node = workflow.nodes[1];
    const fields = "fields" in node ? node.fields : [];
    return (
      <span className="flex flex-1 flex-col">
        <span className={cn("mb-2 flex items-center gap-2 transition-opacity duration-300", dim)}>
          <LogoMark compact className="h-6 text-ink" />
          <span className="font-mono text-[0.7rem] text-ink-muted">{"engine" in node ? node.engine : null}</span>
        </span>
        <span className="flex flex-col">
          {fields.map((field, fieldIndex) => {
            const filled = time >= FIELD_TIMES[fieldIndex];
            return (
              <span
                key={field.label}
                className="grid h-[1.6rem] grid-cols-[auto_minmax(0,1fr)] items-center gap-2 border-b border-dotted border-rule text-[0.74rem]"
              >
                <span className="text-ink-muted">{field.label}</span>
                <m.span
                  className="truncate text-right font-mono text-[0.72rem] text-ink"
                  initial={false}
                  animate={reveal(filled)}
                  transition={revealTransition}
                >
                  {field.value}
                </m.span>
              </span>
            );
          })}
        </span>
        <span className="absolute top-2 right-2.5">
          <Stamp show={time >= STAMP_TIME} className="text-[0.62rem]">
            {"stamp" in node ? node.stamp : ""}
          </Stamp>
        </span>
      </span>
    );
  }

  if (index === 2) {
    const node = workflow.nodes[2];
    const lines = "lines" in node ? node.lines : [];
    return (
      <span className="flex flex-1 flex-col gap-2.5">
        <IsdocxIcon className={cn("size-12 transition-colors duration-300", state === "waiting" ? "text-ink-muted" : "text-accent")} />
        <span className="flex flex-col font-mono text-[0.68rem] leading-[1.15rem] text-ink">
          {lines.map((line, lineIndex) => (
            <m.span
              key={line}
              className="truncate whitespace-pre"
              initial={false}
              animate={reveal(time >= LINE_TIMES[lineIndex])}
              transition={revealTransition}
            >
              {line}
            </m.span>
          ))}
        </span>
      </span>
    );
  }

  const node = workflow.nodes[3];
  const ready = time >= READY_TIME;
  return (
    <span className={cn("flex flex-1 flex-col items-start gap-3 transition-opacity duration-300", dim)}>
      <BookOpenIcon aria-hidden="true" strokeWidth={1.5} className="size-11 text-ink" />
      <span className="font-mono text-[1rem] font-semibold tracking-[0.04em] text-ink">
        {"programs" in node ? node.programs : null}
      </span>
      <m.span
        className="inline-flex items-center gap-1.5 rounded-sm bg-accent-soft px-2 py-1 font-mono text-[0.72rem] text-accent"
        initial={false}
        animate={{ opacity: ready ? 1 : 0, y: ready ? 0 : 4 }}
        transition={revealTransition}
      >
        <CheckIcon aria-hidden="true" strokeWidth={2.5} className="size-3.5" />
        {"ready" in node ? node.ready : null}
      </m.span>
    </span>
  );
}

/* ------------------------------------------------------------------ */

function Connector({
  geometry,
  t,
  range,
  kind,
  className,
}: {
  geometry: Geometry;
  t: MotionValue<number>;
  range: readonly [number, number];
  kind: "pdf" | "isdocx";
  className?: string;
}) {
  const progress = useTransform(t, [range[0], range[1]], [0, 1], { clamp: true });
  const opacity = useTransform(progress, [0, 0.04, 0.96, 1], [0, 1, 1, 0]);
  const x = useTransform(progress, (p) => cubicPoint(geometry.p0, geometry.p1, geometry.p2, geometry.p3, p).x - 6);
  const y = useTransform(progress, (p) => cubicPoint(geometry.p0, geometry.p1, geometry.p2, geometry.p3, p).y - 7.5);
  const d = pathFor(geometry);

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width={geometry.width}
      height={geometry.height}
      viewBox={`0 0 ${geometry.width} ${geometry.height}`}
      className={cn("pointer-events-none overflow-visible", className)}
    >
      <path d={d} fill="none" stroke="var(--field-border)" strokeWidth={1.5} strokeDasharray="3 4" />
      <m.path
        d={d}
        fill="none"
        stroke="var(--accent)"
        strokeWidth={2}
        strokeLinecap="round"
        style={{ pathLength: progress }}
      />
      <m.g style={{ x, y, opacity }}>
        <path
          d="M1 0.75h7l3.25 3.25V14.25H1Z"
          fill={kind === "pdf" ? "var(--sheet)" : "var(--accent-soft)"}
          stroke={kind === "pdf" ? "var(--ink)" : "var(--accent)"}
          strokeWidth={1.25}
          strokeLinejoin="round"
        />
        <path d="M3.25 6.5h5.5M3.25 9h5.5M3.25 11.5h3.5" stroke={kind === "pdf" ? "var(--ink)" : "var(--accent)"} strokeWidth={0.9} />
      </m.g>
    </svg>
  );
}
