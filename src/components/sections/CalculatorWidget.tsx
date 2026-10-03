"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { animate, m, useMotionValue, useTransform } from "motion/react";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import { site } from "@/config/site";
import { cs } from "@/content/cs";
import {
  DEFAULT_HORIZON_MONTHS,
  DEFAULT_INPUT,
  DEFAULT_PER_DOCUMENT_FEE,
  INPUT_LIMITS,
  computeSavings,
  type SavingsInput,
} from "@/lib/savings";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { withPlaceholders } from "@/components/motifs/Placeholder";
import { SavingsChart } from "./SavingsChart";

/**
 * Kalkulačka úspor (brief 6.6). Výpočet je čistá funkce v `src/lib/savings.ts`,
 * tady jen vstupy, plynulá změna čísel (max 300 ms) a graf.
 * Při `site.showPrice === false` žádná investice, návratnost ani srovnání
 * s poplatkem za doklad.
 */

const czk = new Intl.NumberFormat("cs-CZ", { maximumFractionDigits: 0 });
const oneDecimal = new Intl.NumberFormat("cs-CZ", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const plain = new Intl.NumberFormat("cs-CZ", { maximumFractionDigits: 1 });

type FieldKey = keyof SavingsInput;
/** Hlavní vstup je počet faktur, zbytek jsou předvyplněné předpoklady. */
const MAIN_FIELD: FieldKey = "invoicesPerMonth";
const ASSUMPTIONS: FieldKey[] = ["manualMinutes", "hourlyCost", "checkMinutes"];

export function CalculatorWidget() {
  const { calculator } = cs;
  const [input, setInput] = useState<SavingsInput>(DEFAULT_INPUT);
  const [compare, setCompare] = useState(false);
  const [perDocumentFee, setPerDocumentFee] = useState(DEFAULT_PER_DOCUMENT_FEE);

  const showPrice = site.showPrice;
  const result = useMemo(
    () =>
      computeSavings(input, {
        price: showPrice ? site.price : null,
        monthlyFee: site.monthlyFee,
        horizonMonths: DEFAULT_HORIZON_MONTHS,
        perDocumentFee: showPrice && compare ? perDocumentFee : null,
      }),
    [input, showPrice, compare, perDocumentFee],
  );

  const total = result.series[result.series.length - 1]?.savings ?? 0;
  // Pracovní dny: od deseti celé, pod deset na jedno desetinné místo.
  const workDaysCount =
    result.workDaysSavedPerYear >= 10
      ? Math.round(result.workDaysSavedPerYear)
      : Math.round(result.workDaysSavedPerYear * 10) / 10;
  const workDaysText = plain.format(workDaysCount);

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
      <div className="rounded-sm border border-rule bg-sheet p-5 shadow-paper sm:p-7 lg:col-span-5">
        <NumberSlider
          field={MAIN_FIELD}
          size="lg"
          value={input[MAIN_FIELD]}
          onChange={(value) => setInput((current) => ({ ...current, [MAIN_FIELD]: value }))}
        />

        <fieldset className="mt-8 border-t border-rule pt-6">
          <legend className="type-label float-left mb-5 w-full text-ink">{calculator.assumptions}</legend>
          <div className="clear-left flex flex-col gap-6">
            {ASSUMPTIONS.map((key) => (
              <NumberSlider
                key={key}
                field={key}
                value={input[key]}
                onChange={(value) => setInput((current) => ({ ...current, [key]: value }))}
              />
            ))}
          </div>
        </fieldset>

        {showPrice ? (
          <div className="mt-8 border-t border-rule pt-6">
            <label className="flex items-center gap-3 text-[0.95rem] font-semibold">
              <input
                type="checkbox"
                checked={compare}
                onChange={(event) => setCompare(event.target.checked)}
                className="size-5 accent-[var(--accent)]"
              />
              {calculator.perDocument.toggle}
            </label>
            {compare ? (
              <div className="mt-4">
                <NumberInput
                  id="per-document-fee"
                  label={calculator.perDocument.feeLabel}
                  unit="Kč"
                  value={perDocumentFee}
                  min={0.5}
                  max={50}
                  step={0.5}
                  onChange={setPerDocumentFee}
                />
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="lg:col-span-7">
        {/* Hlavní výsledek: kolik ročně, převedené na pracovní dny */}
        <div className="border-b border-rule pb-6">
          <p className="text-[0.95rem] text-ink-muted">{calculator.outputs.yearly}</p>
          <p className="mt-2 font-heading text-[clamp(3rem,6.5vw,5rem)] leading-none tracking-[-0.025em] whitespace-nowrap text-accent tabular">
            <AnimatedNumber value={result.savingsPerYear} format={(v) => `${czk.format(Math.round(v / 100) * 100)}\u00a0Kč`} />
          </p>
          <p className="mt-4 max-w-[46ch] font-heading text-[clamp(1.2rem,1.8vw,1.45rem)] leading-snug">
            {calculator.ledger.workDays(workDaysText, workDaysCount)}
          </p>
          <p className="mt-1 text-[0.85rem] text-ink-muted">{calculator.ledger.workDaysNote}</p>
        </div>

        {/* Výkaz: dnes, s aplikací, rozdíl */}
        <table className="mt-6 w-full border-collapse text-left tabular">
          <caption className="type-label mb-3 text-left text-ink">{calculator.ledger.title}</caption>
          <thead>
            <tr className="border-b-2 border-ink/80">
              <th scope="col" className="py-2 pr-3 text-[0.8rem] font-normal text-ink-muted">
                {calculator.ledger.columns.item}
              </th>
              <th scope="col" className="py-2 pr-3 text-right text-[0.8rem] font-normal text-ink-muted">
                {calculator.ledger.columns.hours}
              </th>
              <th scope="col" className="hidden py-2 pr-3 text-right text-[0.8rem] font-normal text-ink-muted sm:table-cell">
                {calculator.ledger.columns.monthly}
              </th>
              <th scope="col" className="py-2 text-right text-[0.8rem] font-normal text-ink-muted">
                {calculator.ledger.columns.yearly}
              </th>
            </tr>
          </thead>
          <tbody className="font-mono text-[0.88rem] sm:text-[0.95rem]">
            <LedgerRow
              label={calculator.ledger.manual}
              hours={result.manualHoursPerMonth}
              monthly={result.manualCostPerMonth}
            />
            <LedgerRow
              label={calculator.ledger.check}
              hours={result.checkHoursPerMonth}
              monthly={result.checkCostPerMonth}
              minus
            />
          </tbody>
          <tfoot className="font-mono text-[0.95rem] sm:text-[1.05rem]">
            <LedgerRow
              label={calculator.ledger.saved}
              hours={result.hoursSavedPerMonth}
              monthly={result.savingsPerMonth}
              total
            />
          </tfoot>
        </table>

        {showPrice ? (
          <dl className="mt-8">
            <Stat label={calculator.outputs.payback}>
              {site.monthlyFee === null ? (
                withPlaceholders(calculator.outputs.paybackUnknown)
              ) : result.paybackMonths === null ? (
                <span className="font-sans text-[0.95rem] text-ink-muted">{calculator.outputs.paybackNone}</span>
              ) : (
                <AnimatedNumber
                  value={result.paybackMonths}
                  format={(v) => `${oneDecimal.format(v)}\u00a0${calculator.outputs.paybackUnit}`}
                />
              )}
            </Stat>
          </dl>
        ) : null}

        <div className="mt-10">
          <h3 className="type-label mb-4 text-ink">
            {showPrice
              ? calculator.chart.titleWithPrice(DEFAULT_HORIZON_MONTHS)
              : calculator.chart.title(DEFAULT_HORIZON_MONTHS)}
          </h3>
          <SavingsChart
            series={result.series}
            showInvestment={showPrice}
            showPerDocument={showPrice && compare}
            paybackMonths={result.paybackMonths}
            description={calculator.chart.description(DEFAULT_HORIZON_MONTHS, `${czk.format(Math.round(total / 100) * 100)} Kč`)}
          />
          {showPrice && compare && result.breakEvenInvoicesPerMonth !== null ? (
            <p className="mt-4 text-[0.95rem]">
              {calculator.perDocument.result(czk.format(Math.ceil(result.breakEvenInvoicesPerMonth)), DEFAULT_HORIZON_MONTHS)}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/** Řádek výkazu. Kč ročně = měsíc × 12, zaokrouhluje se až při zobrazení. */
function LedgerRow({
  label,
  hours,
  monthly,
  minus,
  total,
}: {
  label: string;
  hours: number;
  monthly: number;
  minus?: boolean;
  total?: boolean;
}) {
  const sign = minus ? "\u2013\u00a0" : "";
  return (
    <tr className={cn(total ? "border-t-2 border-ink/80 text-accent-strong" : "border-b border-rule text-ink")}>
      <th
        scope="row"
        className={cn("py-3 pr-3 font-sans font-normal", total ? "text-[1rem] font-semibold" : "text-[0.92rem]")}
      >
        {label}
      </th>
      <td className="py-3 pr-3 text-right whitespace-nowrap">
        <AnimatedNumber value={hours} format={(v) => `${sign}${oneDecimal.format(v)}\u00a0h`} />
      </td>
      <td className="hidden py-3 pr-3 text-right whitespace-nowrap sm:table-cell">
        <AnimatedNumber value={monthly} format={(v) => `${sign}${czk.format(Math.round(v / 10) * 10)}\u00a0Kč`} />
      </td>
      <td className={cn("py-3 text-right whitespace-nowrap", total && "font-semibold")}>
        <AnimatedNumber value={monthly * 12} format={(v) => `${sign}${czk.format(Math.round(v / 100) * 100)}\u00a0Kč`} />
      </td>
    </tr>
  );
}

function Stat({ label, emphasis, children }: { label: string; emphasis?: boolean; children: React.ReactNode }) {
  return (
    <div className={cn(emphasis && "col-span-full border-b border-rule pb-6")}>
      <dt className="text-[0.85rem] leading-snug text-ink-muted">{label}</dt>
      <dd
        className={cn(
          "mt-2 font-heading leading-none tracking-[-0.02em] whitespace-nowrap tabular",
          emphasis ? "text-[clamp(3rem,6vw,4.75rem)] text-accent" : "text-[clamp(1.6rem,2.6vw,2.1rem)] text-ink",
        )}
      >
        {children}
      </dd>
    </div>
  );
}

/** Plynulá změna čísla (tween max 300 ms), při omezených animacích hned. */
function AnimatedNumber({ value, format }: { value: number; format: (value: number) => string }) {
  const reduce = usePrefersReducedMotion();
  const motionValue = useMotionValue(value);
  const text = useTransform(motionValue, format);

  useEffect(() => {
    if (reduce) {
      motionValue.set(value);
      return;
    }
    const controls = animate(motionValue, value, { duration: 0.3, ease: [0.2, 0.7, 0.2, 1] });
    return () => controls.stop();
  }, [value, reduce, motionValue]);

  return <m.span>{text}</m.span>;
}

function NumberSlider({
  field,
  value,
  onChange,
  size = "default",
}: {
  field: FieldKey;
  value: number;
  onChange: (value: number) => void;
  /** `lg` pro hlavní vstup (počet faktur). */
  size?: "default" | "lg";
}) {
  const id = useId();
  const config = cs.calculator.inputs[field];
  const limits = INPUT_LIMITS[field];
  const badge = "badge" in config ? config.badge : null;

  return (
    <div>
      <div className={cn("grid gap-3", size === "lg" ? "grid-cols-1" : "grid-cols-[minmax(0,1fr)_auto] items-end")}>
        <label
          htmlFor={id}
          className={cn(
            "leading-snug text-ink",
            size === "lg" ? "font-heading text-[clamp(1.3rem,2vw,1.6rem)] leading-[1.2]" : "text-[0.92rem] font-semibold",
          )}
        >
          {config.label}
          {badge ? <span className="mt-0.5 block font-mono text-[0.7rem] font-normal text-warn-ink">{badge}</span> : null}
        </label>
        <NumberInput
          id={id}
          large={size === "lg"}
          unit={config.unit}
          value={value}
          min={limits.min}
          max={limits.max}
          step={limits.step}
          onChange={onChange}
        />
      </div>
      <div className="mt-3">
        <div>
          <Slider
            min={limits.min}
            max={limits.max}
            step={limits.step}
            value={[value]}
            onValueChange={([next]) => onChange(next)}
            thumbLabel={config.label}
            thumbValueText={`${plain.format(value)} ${config.unit}`}
          />
          <div aria-hidden="true" className="mt-1.5 flex justify-between font-mono text-[0.7rem] text-ink-muted">
            <span>{plain.format(limits.min)}</span>
            <span>{plain.format(limits.max)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Číselné pole synchronizované s posuvníkem. Hodnota se omezí na rozsah při opuštění pole. */
function NumberInput({
  id,
  label,
  large,
  unit,
  value,
  min,
  max,
  step,
  onChange,
}: {
  id: string;
  /** Vlastní popisek. Bez něj pole popisuje `<label>` posuvníku. */
  label?: string;
  large?: boolean;
  unit: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}) {
  const [draft, setDraft] = useState<string | null>(null);

  const commit = (raw: string) => {
    const parsed = Number.parseFloat(raw.replace(",", ".").replace(/\s/g, ""));
    if (Number.isFinite(parsed)) {
      const stepped = Math.round(parsed / step) * step;
      onChange(Math.min(max, Math.max(min, Number(stepped.toFixed(2)))));
    }
    setDraft(null);
  };

  return (
    <span className="flex shrink-0 items-center gap-2">
      {label ? (
        <label htmlFor={id} className="mr-2 text-[0.95rem] font-semibold text-ink">
          {label}
        </label>
      ) : null}
      <input
        id={id}
        type="text"
        inputMode="decimal"
        value={draft ?? plain.format(value)}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={(event) => commit(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") commit(event.currentTarget.value);
        }}
        className={cn(
          "rounded-sm border border-field-border bg-sheet px-2.5 text-right font-mono text-ink tabular outline-none focus-visible:border-accent focus-visible:shadow-[0_0_0_1px_var(--accent)]",
          large ? "h-12 w-[6rem] text-[1.2rem]" : "h-10 w-[4.75rem] text-[0.95rem]",
        )}
      />
      <span className="w-11 font-mono text-[0.75rem] text-ink-muted">{unit}</span>
    </span>
  );
}
