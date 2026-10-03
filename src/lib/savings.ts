/**
 * Modelový výpočet úspory pro kalkulačku (brief, část 6.6).
 *
 * Čistá funkce bez zaokrouhlování v průběhu. Zaokrouhluje se až při
 * zobrazení. Počítá obě varianty (s cenou i bez ní), o zobrazení rozhoduje
 * jen render podle `site.showPrice`.
 */

export interface SavingsInput {
  /** Faktur měsíčně (50–3 000). */
  invoicesPerMonth: number;
  /** Minut na ruční přepis jedné faktury (3–7). */
  manualMinutes: number;
  /** Hodinový náklad práce v Kč (250–600). */
  hourlyCost: number;
  /** Minut na kontrolu jedné faktury s aplikací (0,5–3), zatím odhad. */
  checkMinutes: number;
}

export interface SavingsOptions {
  /** Jednorázová cena aplikace v Kč. */
  price?: number | null;
  /** Měsíční správa v Kč. `null` = neznámá. */
  monthlyFee?: number | null;
  /** Časový horizont grafu a srovnání v měsících. */
  horizonMonths?: number;
  /** Cena za doklad u služby s poplatkem za doklad v Kč. */
  perDocumentFee?: number | null;
}

export interface SavingsPoint {
  month: number;
  /** Kumulativní úspora práce v Kč. */
  savings: number;
  /** Kumulativní investice (cena + správa) v Kč, pokud je cena známá. */
  investment: number | null;
  /** Kumulativní náklad služby s poplatkem za doklad, pokud je zadaný. */
  perDocumentCost: number | null;
}

export interface SavingsResult {
  /** Hodiny ručního přepisu měsíčně bez aplikace. */
  manualHoursPerMonth: number;
  /** Náklad ručního přepisu měsíčně v Kč. */
  manualCostPerMonth: number;
  /** Hodiny kontroly výstupu měsíčně s aplikací. */
  checkHoursPerMonth: number;
  /** Náklad kontroly měsíčně v Kč. */
  checkCostPerMonth: number;
  minutesSavedPerInvoice: number;
  hoursSavedPerMonth: number;
  savingsPerMonth: number;
  savingsPerYear: number;
  /** Ušetřené hodiny za rok převedené na osmihodinové pracovní dny. */
  workDaysSavedPerYear: number;
  /** Úspora po odečtení měsíční správy. `null`, když správa není známá. */
  netSavingsPerMonth: number | null;
  /** Návratnost v měsících. `null`, když ji nejde spočítat nebo úspora nepokryje správu. */
  paybackMonths: number | null;
  /**
   * Od kolika faktur měsíčně vychází aplikace v daném horizontu levněji
   * než poplatek za doklad. `null`, když chybí cena nebo poplatek.
   */
  breakEvenInvoicesPerMonth: number | null;
  series: SavingsPoint[];
}

export const DEFAULT_INPUT: SavingsInput = {
  invoicesPerMonth: 200,
  manualMinutes: 5,
  hourlyCost: 350,
  checkMinutes: 1,
};

export const INPUT_LIMITS = {
  invoicesPerMonth: { min: 50, max: 3000, step: 10 },
  manualMinutes: { min: 3, max: 7, step: 0.5 },
  hourlyCost: { min: 250, max: 600, step: 10 },
  checkMinutes: { min: 0.5, max: 3, step: 0.5 },
} as const satisfies Record<keyof SavingsInput, { min: number; max: number; step: number }>;

export const DEFAULT_HORIZON_MONTHS = 24;
/** Délka pracovního dne pro přepočet ušetřených hodin na dny. */
export const WORKDAY_HOURS = 8;
export const DEFAULT_PER_DOCUMENT_FEE = 4;

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

/** Omezí vstupy na povolený rozsah kalkulačky. */
export function clampInput(input: SavingsInput): SavingsInput {
  return {
    invoicesPerMonth: clamp(input.invoicesPerMonth, INPUT_LIMITS.invoicesPerMonth.min, INPUT_LIMITS.invoicesPerMonth.max),
    manualMinutes: clamp(input.manualMinutes, INPUT_LIMITS.manualMinutes.min, INPUT_LIMITS.manualMinutes.max),
    hourlyCost: clamp(input.hourlyCost, INPUT_LIMITS.hourlyCost.min, INPUT_LIMITS.hourlyCost.max),
    checkMinutes: clamp(input.checkMinutes, INPUT_LIMITS.checkMinutes.min, INPUT_LIMITS.checkMinutes.max),
  };
}

/** Hodiny ruční práce měsíčně bez aplikace (řádek „Ruční přepis dnes“ ve výkazu kalkulačky). */
export function manualHoursPerMonth(invoicesPerMonth: number, manualMinutes: number): number {
  return (invoicesPerMonth * manualMinutes) / 60;
}

/** Hodiny kontroly výstupu měsíčně s aplikací (řádek „Kontrola s aplikací“). */
export function checkHoursPerMonth(invoicesPerMonth: number, checkMinutes: number): number {
  return (invoicesPerMonth * checkMinutes) / 60;
}

export function computeSavings(input: SavingsInput, options: SavingsOptions = {}): SavingsResult {
  const { invoicesPerMonth, manualMinutes, hourlyCost, checkMinutes } = input;
  const price = options.price ?? null;
  const monthlyFee = options.monthlyFee ?? null;
  const horizon = Math.max(1, Math.round(options.horizonMonths ?? DEFAULT_HORIZON_MONTHS));
  const perDocumentFee = options.perDocumentFee ?? null;

  const manualHours = manualHoursPerMonth(invoicesPerMonth, manualMinutes);
  const checkHours = checkHoursPerMonth(invoicesPerMonth, checkMinutes);

  // Úspora nikdy není záporná: když kontrola trvá stejně jako přepis, je nulová.
  const minutesSavedPerInvoice = Math.max(0, manualMinutes - checkMinutes);
  const hoursSavedPerMonth = (invoicesPerMonth * minutesSavedPerInvoice) / 60;
  const savingsPerMonth = hoursSavedPerMonth * hourlyCost;
  const savingsPerYear = savingsPerMonth * 12;
  const workDaysSavedPerYear = (hoursSavedPerMonth * 12) / WORKDAY_HOURS;

  const netSavingsPerMonth = monthlyFee === null ? null : savingsPerMonth - monthlyFee;

  // Návratnost jen se známou cenou i správou a jen když úspora správu pokryje.
  let paybackMonths: number | null = null;
  if (price !== null && netSavingsPerMonth !== null && netSavingsPerMonth > 0) {
    paybackMonths = price / netSavingsPerMonth;
  }

  let breakEvenInvoicesPerMonth: number | null = null;
  if (price !== null && perDocumentFee !== null && perDocumentFee > 0) {
    const appCostOverHorizon = price + (monthlyFee ?? 0) * horizon;
    breakEvenInvoicesPerMonth = appCostOverHorizon / (perDocumentFee * horizon);
  }

  const series: SavingsPoint[] = [];
  for (let month = 0; month <= horizon; month += 1) {
    series.push({
      month,
      savings: savingsPerMonth * month,
      investment: price === null ? null : price + (monthlyFee ?? 0) * month,
      perDocumentCost:
        perDocumentFee === null ? null : perDocumentFee * invoicesPerMonth * month,
    });
  }

  return {
    manualHoursPerMonth: manualHours,
    manualCostPerMonth: manualHours * hourlyCost,
    checkHoursPerMonth: checkHours,
    checkCostPerMonth: checkHours * hourlyCost,
    minutesSavedPerInvoice,
    hoursSavedPerMonth,
    savingsPerMonth,
    savingsPerYear,
    workDaysSavedPerYear,
    netSavingsPerMonth,
    paybackMonths,
    breakEvenInvoicesPerMonth,
    series,
  };
}
