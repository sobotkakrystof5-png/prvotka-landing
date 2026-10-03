"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { SavingsPoint } from "@/lib/savings";
import { cs } from "@/content/cs";

/**
 * „Načrtnutý“ graf kumulativní úspory (vlastní SVG, brief 6.6).
 * Linka je jemně nepravidelná jako kreslená tužkou, ale deterministicky,
 * takže server i prohlížeč vykreslí totéž. Investice a návratnost se kreslí
 * jen při `showPrice` (jinak by prozradily cenu).
 */

// Šířka se měří ze skutečného kontejneru, aby popisky měly na mobilu čitelnou velikost.
const DEFAULT_W = 640;
const H = 280;
const PAD = { top: 18, right: 18, bottom: 34, left: 58 };

function niceMax(value: number): number {
  if (value <= 0) return 1000;
  const exponent = Math.floor(Math.log10(value));
  const base = 10 ** exponent;
  for (const step of [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]) {
    if (step * base >= value) return step * base;
  }
  return 10 * base;
}

function sketchPath(points: { x: number; y: number }[], seed: number, amplitude = 0.9): string {
  const wobbly = points.map((point, index) => ({
    x: point.x + Math.cos(index * 2.3 + seed) * amplitude * 0.5,
    y: point.y + Math.sin(index * 1.7 + seed * 1.3) * amplitude,
  }));
  if (wobbly.length < 2) return "";
  let d = `M${wobbly[0].x.toFixed(2)},${wobbly[0].y.toFixed(2)}`;
  for (let i = 0; i < wobbly.length - 1; i += 1) {
    const p0 = wobbly[i - 1] ?? wobbly[i];
    const p1 = wobbly[i];
    const p2 = wobbly[i + 1];
    const p3 = wobbly[i + 2] ?? p2;
    // Catmull-Rom → Bézier, plynulá křivka přes všechny body
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C${c1x.toFixed(2)},${c1y.toFixed(2)} ${c2x.toFixed(2)},${c2y.toFixed(2)} ${p2.x.toFixed(2)},${p2.y.toFixed(2)}`;
  }
  return d;
}

const short = new Intl.NumberFormat("cs-CZ", { maximumFractionDigits: 0 });
function axisLabel(value: number): string {
  if (value >= 1_000_000) return `${short.format(value / 1_000_000)} mil.`;
  if (value >= 1000) return `${short.format(value / 1000)} tis.`;
  return short.format(value);
}

export function SavingsChart({
  series,
  showInvestment,
  showPerDocument,
  paybackMonths,
  description,
}: {
  series: SavingsPoint[];
  showInvestment: boolean;
  showPerDocument: boolean;
  paybackMonths: number | null;
  description: string;
}) {
  const { chart } = cs.calculator;
  const horizon = series[series.length - 1]?.month ?? 1;
  const figureRef = useRef<HTMLElement>(null);
  const [W, setW] = useState(DEFAULT_W);

  useEffect(() => {
    const element = figureRef.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      setW(Math.max(280, Math.round(entry.contentRect.width)));
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const geometry = useMemo(() => {
    const values = series.flatMap((point) => [
      point.savings,
      showInvestment && point.investment !== null ? point.investment : 0,
      showPerDocument && point.perDocumentCost !== null ? point.perDocumentCost : 0,
    ]);
    const max = niceMax(Math.max(...values));
    const x = (month: number) => PAD.left + (month / horizon) * (W - PAD.left - PAD.right);
    const y = (value: number) => PAD.top + (1 - value / max) * (H - PAD.top - PAD.bottom);
    const toPoints = (pick: (point: SavingsPoint) => number | null) =>
      series.flatMap((point) => {
        const value = pick(point);
        return value === null ? [] : [{ x: x(point.month), y: y(value) }];
      });
    return {
      max,
      x,
      y,
      savings: toPoints((point) => point.savings),
      investment: toPoints((point) => point.investment),
      perDocument: toPoints((point) => point.perDocumentCost),
    };
  }, [series, horizon, showInvestment, showPerDocument, W]);

  const ticks = [0, 0.25, 0.5, 0.75, 1].map((ratio) => ratio * geometry.max);
  const monthStep = W < 480 ? 12 : 6;
  const monthTicks = Array.from({ length: Math.floor(horizon / monthStep) + 1 }, (_, index) => index * monthStep);
  const payback =
    showInvestment && paybackMonths !== null && paybackMonths <= horizon
      ? {
          x: geometry.x(paybackMonths),
          y: geometry.y((series[1]?.savings ?? 0) * paybackMonths),
        }
      : null;

  return (
    <figure ref={figureRef}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={description} className="h-auto w-full overflow-visible">
        {/* Účetní linkování jako mřížka */}
        {ticks.map((tick) => (
          <g key={tick}>
            <line
              x1={PAD.left}
              x2={W - PAD.right}
              y1={geometry.y(tick)}
              y2={geometry.y(tick)}
              stroke="var(--rule)"
              strokeWidth={tick === 0 ? 1.25 : 0.75}
            />
            <text
              x={PAD.left - 10}
              y={geometry.y(tick) + 4}
              textAnchor="end"
              fill="var(--ink-muted)"
              fontFamily="var(--font-jetbrains), monospace"
              fontSize="11"
            >
              {axisLabel(tick)}
            </text>
          </g>
        ))}
        {monthTicks.map((month) => (
          <text
            key={month}
            x={geometry.x(month)}
            y={H - PAD.bottom + 20}
            textAnchor="middle"
            fill="var(--ink-muted)"
            fontFamily="var(--font-jetbrains), monospace"
            fontSize="11"
          >
            {month}
          </text>
        ))}
        <text
          x={W - PAD.right}
          y={H - 2}
          textAnchor="end"
          fill="var(--ink-muted)"
          fontFamily="var(--font-manrope), sans-serif"
          fontSize="11"
        >
          {chart.axisMonths}
        </text>

        {showPerDocument && geometry.perDocument.length > 1 ? (
          <path
            d={sketchPath(geometry.perDocument, 3.1, 0.6)}
            fill="none"
            stroke="var(--ink-muted)"
            strokeWidth={1.5}
            strokeDasharray="2 5"
            strokeLinecap="round"
          />
        ) : null}

        {showInvestment && geometry.investment.length > 1 ? (
          <path
            d={sketchPath(geometry.investment, 1.7, 0.6)}
            fill="none"
            stroke="var(--ink)"
            strokeWidth={1.5}
            strokeDasharray="6 5"
            strokeLinecap="round"
          />
        ) : null}

        {/* Úspora: hlavní tah a jemný „druhý tah tužkou“ */}
        <path
          d={sketchPath(geometry.savings, 0.4, 1.4)}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={1}
          strokeOpacity={0.35}
          transform="translate(0.8 1.1)"
        />
        <path
          d={sketchPath(geometry.savings, 0.9)}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={2.25}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {payback ? (
          <g>
            <circle cx={payback.x} cy={payback.y} r={5} fill="var(--sheet)" stroke="var(--accent)" strokeWidth={2} />
            <text
              x={payback.x + 9}
              y={payback.y - 9}
              fill="var(--accent)"
              fontFamily="var(--font-jetbrains), monospace"
              fontSize="11"
            >
              {chart.payback}
            </text>
          </g>
        ) : null}
      </svg>

      <figcaption className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-[0.82rem] text-ink-muted">
        <span className="inline-flex items-center gap-2">
          <span aria-hidden="true" className="h-[2.5px] w-6 bg-accent" />
          {chart.savings}
        </span>
        {showInvestment ? (
          <span className="inline-flex items-center gap-2">
            <span aria-hidden="true" className="h-0 w-6 border-t-[1.5px] border-dashed border-ink" />
            {chart.investment}
          </span>
        ) : null}
        {showPerDocument ? (
          <span className="inline-flex items-center gap-2">
            <span aria-hidden="true" className="h-0 w-6 border-t-[1.5px] border-dotted border-ink-muted" />
            {chart.perDocument}
          </span>
        ) : null}
      </figcaption>
    </figure>
  );
}
