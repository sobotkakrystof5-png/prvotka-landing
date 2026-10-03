"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { animate } from "motion/react";
import type { SavingsPoint } from "@/lib/savings";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import { cs } from "@/content/cs";
import { cn } from "@/lib/utils";

/**
 * Graf nákladů na faktury v čase (vlastní SVG, brief 6.6). Dvě kumulativní
 * čáry, ruční přepis dnes a kontrola s aplikací, plocha mezi nimi je úspora.
 * Měsíc se vybírá myší, dotykem nebo šipkami a nad grafem se ukáže výkaz
 * pro ten měsíc. Při změně vstupů čáry plynule přejdou (při omezených
 * animacích hned) a osa Y se přepočítá jen při velké změně, takže je
 * vidět, že víc faktur znamená vyšší čáry.
 *
 * Cena a správa se přičítají k čáře „s aplikací“ jen při `showPrice`
 * (jinak by prozradily cenu). Pak je návratnost průsečík obou čar.
 */

// Šířka se měří ze skutečného kontejneru, aby popisky měly na mobilu čitelnou velikost.
const DEFAULT_W = 640;
const PAD = { top: 26, right: 16, bottom: 34, left: 68 };

interface Row {
  /** Ruční přepis dnes. */
  manual: number;
  /** S aplikací: kontrola (a při `showPrice` cena a správa). */
  app: number;
  /** Poplatek za doklad a kontrola, jen při srovnání. */
  perDocument: number | null;
}
interface Frame {
  rows: Row[];
  max: number;
}

function niceMax(value: number): number {
  if (value <= 0) return 1000;
  const exponent = Math.floor(Math.log10(value));
  const base = 10 ** exponent;
  for (const step of [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]) {
    if (step * base >= value) return step * base;
  }
  return 10 * base;
}

/** Krok mřížky: nejmenší „kulaté“ číslo, se kterým osa vyjde na nejvýš 4 dílky. */
function tickStep(max: number): number {
  const rough = max / 4;
  const base = 10 ** Math.floor(Math.log10(rough));
  for (const step of [1, 2, 2.5, 5, 10]) {
    if (step * base >= rough) return step * base;
  }
  return 10 * base;
}

const czk = new Intl.NumberFormat("cs-CZ", { maximumFractionDigits: 0 });
const short = new Intl.NumberFormat("cs-CZ", { maximumFractionDigits: 1 });
function axisLabel(value: number): string {
  if (value >= 1_000_000) return `${short.format(value / 1_000_000)} mil.`;
  if (value >= 1000) return `${short.format(value / 1000)} tis.`;
  return short.format(value);
}
/** Kč zaokrouhlené na stovky, stejně jako roční částky ve výkazu. */
function money(value: number): string {
  return `${czk.format(Math.round(value / 100) * 100)} Kč`;
}

function lerp(from: number, to: number, t: number): number {
  return from + (to - from) * t;
}
function lerpFrame(from: Frame, to: Frame, t: number): Frame {
  return {
    max: lerp(from.max, to.max, t),
    rows: to.rows.map((row, index) => {
      const start = from.rows[index] ?? row;
      return {
        manual: lerp(start.manual, row.manual, t),
        app: lerp(start.app, row.app, t),
        perDocument:
          row.perDocument === null ? null : lerp(start.perDocument ?? row.perDocument, row.perDocument, t),
      };
    }),
  };
}

/** Plynulý přechod mezi stavy grafu (350 ms), při omezených animacích hned. */
function useTweenedFrame(target: Frame, reduce: boolean): Frame {
  const [shown, setShown] = useState(target);
  const shownRef = useRef(target);

  useEffect(() => {
    const from = shownRef.current;
    if (from === target) return;
    const instant = reduce || from.rows.length !== target.rows.length;
    const controls = animate(0, 1, {
      duration: instant ? 0 : 0.35,
      ease: [0.2, 0.7, 0.2, 1],
      onUpdate: (t) => {
        const next = t >= 1 ? target : lerpFrame(from, target, t);
        shownRef.current = next;
        setShown(next);
      },
    });
    return () => controls.stop();
  }, [target, reduce]);

  return shown;
}

function linePath(points: { x: number; y: number }[]): string {
  return points.map((point, index) => `${index === 0 ? "M" : "L"}${point.x.toFixed(2)},${point.y.toFixed(2)}`).join(" ");
}

export function SavingsChart({
  series,
  showInvestment,
  showPerDocument,
  paybackMonths,
}: {
  series: SavingsPoint[];
  showInvestment: boolean;
  showPerDocument: boolean;
  paybackMonths: number | null;
}) {
  const { chart } = cs.calculator;
  const reduce = usePrefersReducedMotion();
  const descriptionId = useId();
  const horizon = Math.max(1, series.length - 1);
  const figureRef = useRef<HTMLElement>(null);
  const [W, setW] = useState(DEFAULT_W);
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    const element = figureRef.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      setW(Math.max(280, Math.round(entry.contentRect.width)));
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const rows = useMemo<Row[]>(
    () =>
      series.map((point) => ({
        manual: point.manualCost,
        app: point.checkCost + (showInvestment && point.investment !== null ? point.investment : 0),
        perDocument:
          showPerDocument && point.perDocumentCost !== null ? point.perDocumentCost + point.checkCost : null,
      })),
    [series, showInvestment, showPerDocument],
  );

  // Osa Y s hysterezí: přepočítá se, až když čáry přetečou nebo klesnou pod třetinu.
  // Při menší změně zůstane, aby bylo vidět, jak čáry rostou a klesají.
  const peak = Math.max(...rows.flatMap((row) => [row.manual, row.app, row.perDocument ?? 0]));
  const [axisMax, setAxisMax] = useState(() => niceMax(peak * 1.05));
  const wantedMax = peak > axisMax || peak < axisMax * 0.35 ? niceMax(peak * 1.05) : axisMax;
  if (wantedMax !== axisMax) setAxisMax(wantedMax);

  const target = useMemo<Frame>(() => ({ rows, max: wantedMax }), [rows, wantedMax]);
  const shown = useTweenedFrame(target, reduce);

  const H = W < 480 ? 240 : 300;
  const plotW = W - PAD.left - PAD.right;
  const x = (month: number) => PAD.left + (month / horizon) * plotW;
  const y = (value: number) => PAD.top + (1 - value / shown.max) * (H - PAD.top - PAD.bottom);

  const month = active ?? horizon;
  const at = shown.rows[month] ?? shown.rows[shown.rows.length - 1];
  const exact = target.rows[month] ?? target.rows[target.rows.length - 1];
  const difference = at.manual - at.app;

  const manualPoints = shown.rows.map((row, index) => ({ x: x(index), y: y(row.manual) }));
  const appPoints = shown.rows.map((row, index) => ({ x: x(index), y: y(row.app) }));
  const perDocumentPoints = showPerDocument
    ? shown.rows.flatMap((row, index) => (row.perDocument === null ? [] : [{ x: x(index), y: y(row.perDocument) }]))
    : [];
  // Plocha úspory: mezi ručním přepisem a čárou s aplikací, jen kde je přepis dražší.
  const gapPath = `${linePath(manualPoints)} ${shown.rows
    .map((row, index) => `L${x(index).toFixed(2)},${y(Math.min(row.manual, row.app)).toFixed(2)}`)
    .reverse()
    .join(" ")} Z`;

  // Popisek „ušetříte“ uvnitř plochy, jen když se do ní vejde.
  const labelMonth = Math.round(horizon * 0.72);
  const labelRow = shown.rows[labelMonth];
  const labelGap = labelRow ? y(Math.min(labelRow.manual, labelRow.app)) - y(labelRow.manual) : 0;

  const ticksStep = tickStep(target.max);
  const ticks = Array.from({ length: Math.floor(target.max / ticksStep) + 1 }, (_, index) => index * ticksStep).filter(
    (tick) => tick <= shown.max * 1.001,
  );
  const monthStep = W < 480 ? 12 : 6;
  const monthTicks = Array.from({ length: Math.floor(horizon / monthStep) + 1 }, (_, index) => index * monthStep);

  const payback =
    showInvestment && paybackMonths !== null && paybackMonths <= horizon
      ? { x: x(paybackMonths), y: y((shown.rows[1]?.manual ?? 0) * paybackMonths) }
      : null;

  const last = target.rows[target.rows.length - 1];
  const description = chart.description(
    horizon,
    money(last.manual),
    money(last.app),
    money(Math.max(0, last.manual - last.app)),
  );
  const valueText = chart.valueText(
    month,
    money(exact.manual),
    money(exact.app),
    money(exact.manual - exact.app),
  );

  const monthFromPointer = (event: React.PointerEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const viewX = ((event.clientX - rect.left) / rect.width) * W;
    const value = Math.round(((viewX - PAD.left) / plotW) * horizon);
    return Math.min(horizon, Math.max(1, value));
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const step: Record<string, number> = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1, PageUp: 6, PageDown: -6 };
    let next: number | null = null;
    if (event.key in step) next = month + step[event.key];
    else if (event.key === "Home") next = 1;
    else if (event.key === "End") next = horizon;
    if (next === null) return;
    event.preventDefault();
    setActive(Math.min(horizon, Math.max(1, next)));
  };

  const textProps = {
    fill: "var(--ink-muted)",
    fontFamily: "var(--font-jetbrains), monospace",
    fontSize: 11,
  } as const;

  return (
    <figure ref={figureRef}>
      {/* Výkaz pro vybraný měsíc */}
      <div className="mb-4 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3" aria-hidden="true">
        <p className="col-span-full font-mono text-[0.78rem] text-ink">{chart.after(month)}</p>
        <Readout swatch="manual" label={chart.manual} value={money(at.manual)} />
        <Readout
          swatch="app"
          label={showInvestment ? chart.withAppPrice : chart.withApp}
          value={money(at.app)}
        />
        <Readout
          swatch="gap"
          label={showInvestment ? chart.difference : chart.saved}
          value={money(showInvestment ? difference : Math.max(0, difference))}
          strong
          className="col-span-2 sm:col-span-1"
        />
      </div>

      <div
        role="slider"
        tabIndex={0}
        aria-label={chart.sliderLabel}
        aria-valuemin={1}
        aria-valuemax={horizon}
        aria-valuenow={month}
        aria-valuetext={valueText}
        aria-describedby={descriptionId}
        onKeyDown={onKeyDown}
        onPointerDown={(event) => setActive(monthFromPointer(event))}
        onPointerMove={(event) => {
          if (event.pointerType === "mouse" || event.buttons > 0) setActive(monthFromPointer(event));
        }}
        onPointerLeave={(event) => {
          if (event.pointerType === "mouse") setActive(null);
        }}
        onBlur={() => setActive(null)}
        className="cursor-crosshair touch-pan-y rounded-sm outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
      >
        <svg viewBox={`0 0 ${W} ${H}`} aria-hidden="true" className="block h-auto w-full overflow-visible select-none">
          {/* Účetní linkování jako mřížka */}
          {ticks.map((tick) => (
            <g key={tick}>
              <line
                x1={PAD.left}
                x2={W - PAD.right}
                y1={y(tick)}
                y2={y(tick)}
                stroke="var(--rule)"
                strokeWidth={tick === 0 ? 1.25 : 0.75}
              />
              <text x={PAD.left - 10} y={y(tick) + 4} textAnchor="end" {...textProps}>
                {axisLabel(tick)}
              </text>
            </g>
          ))}
          <text x={PAD.left - 10} y={PAD.top - 14} textAnchor="end" {...textProps}>
            {chart.axisUnit}
          </text>
          {monthTicks.map((tick) => (
            <text key={tick} x={x(tick)} y={H - PAD.bottom + 20} textAnchor="middle" {...textProps}>
              {tick}
            </text>
          ))}
          <text
            x={W - PAD.right}
            y={H - 2}
            textAnchor="end"
            fill="var(--ink-muted)"
            fontFamily="var(--font-manrope), sans-serif"
            fontSize={11}
          >
            {chart.axisMonths}
          </text>

          <path d={gapPath} fill="var(--accent-soft)" />
          {labelGap > 22 ? (
            <text
              x={x(labelMonth)}
              y={y(labelRow.manual) + labelGap / 2 + 4}
              textAnchor="middle"
              fill="var(--accent-strong)"
              fontFamily="var(--font-manrope), sans-serif"
              fontSize={12}
              fontWeight={600}
            >
              {chart.gap}
            </text>
          ) : null}

          {perDocumentPoints.length > 1 ? (
            <path
              d={linePath(perDocumentPoints)}
              fill="none"
              stroke="var(--ink-muted)"
              strokeWidth={1.5}
              strokeDasharray="2 5"
              strokeLinecap="round"
            />
          ) : null}
          <path d={linePath(manualPoints)} fill="none" stroke="var(--ink)" strokeWidth={2} strokeLinejoin="round" />
          <path d={linePath(appPoints)} fill="none" stroke="var(--accent)" strokeWidth={2.5} strokeLinejoin="round" />

          {payback ? (
            <g>
              <circle cx={payback.x} cy={payback.y} r={5} fill="var(--sheet)" stroke="var(--accent)" strokeWidth={2} />
              <text x={payback.x + 9} y={payback.y - 9} {...textProps} fill="var(--accent)">
                {chart.payback}
              </text>
            </g>
          ) : null}

          {/* Vybraný měsíc */}
          {active !== null ? (
            <line
              x1={x(month)}
              x2={x(month)}
              y1={PAD.top}
              y2={H - PAD.bottom}
              stroke="var(--ink-muted)"
              strokeWidth={1}
              strokeDasharray="3 4"
            />
          ) : null}
          <circle cx={x(month)} cy={y(at.manual)} r={4.5} fill="var(--sheet)" stroke="var(--ink)" strokeWidth={2} />
          <circle cx={x(month)} cy={y(at.app)} r={4.5} fill="var(--sheet)" stroke="var(--accent)" strokeWidth={2} />
        </svg>
      </div>

      <figcaption className="mt-3 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 text-[0.82rem] text-ink-muted">
        <span id={descriptionId} className="sr-only">
          {description}
        </span>
        {showPerDocument ? (
          <span className="inline-flex items-center gap-2">
            <span aria-hidden="true" className="h-0 w-6 border-t-[1.5px] border-dotted border-ink-muted" />
            {chart.perDocument}
          </span>
        ) : null}
        <span aria-hidden="true">{chart.hint}</span>
      </figcaption>
    </figure>
  );
}

/** Jedna hodnota výkazu nad grafem, barevná značka odpovídá čáře v grafu. */
function Readout({
  swatch,
  label,
  value,
  strong,
  className,
}: {
  swatch: "manual" | "app" | "gap";
  label: string;
  value: string;
  strong?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="flex items-center gap-2 text-[0.8rem] leading-snug text-ink-muted">
        <span
          aria-hidden="true"
          className={cn(
            "shrink-0",
            swatch === "manual" && "h-[2px] w-5 bg-ink",
            swatch === "app" && "h-[2.5px] w-5 bg-accent",
            swatch === "gap" && "size-3 rounded-[2px] bg-accent-soft ring-1 ring-accent/40",
          )}
        />
        {label}
      </p>
      <p
        className={cn(
          "mt-1 font-mono whitespace-nowrap tabular",
          strong ? "text-[1.05rem] font-semibold text-accent-strong sm:text-[1.15rem]" : "text-[0.95rem] text-ink sm:text-[1.05rem]",
        )}
      >
        {value}
      </p>
    </div>
  );
}
