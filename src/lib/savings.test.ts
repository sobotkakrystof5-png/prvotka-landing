import { describe, expect, it } from "vitest";
import {
  DEFAULT_INPUT,
  clampInput,
  INVOICE_STOPS,
  computeSavings,
  checkHoursPerMonth,
  nearestStopIndex,
  manualHoursPerMonth,
} from "./savings";

describe("manualHoursPerMonth a checkHoursPerMonth", () => {
  it("200 faktur × 5 min ručně = 16,7 h, × 1 min kontroly = 3,3 h", () => {
    expect(manualHoursPerMonth(200, 5)).toBeCloseTo(16.667, 3);
    expect(checkHoursPerMonth(200, 1)).toBeCloseTo(3.333, 3);
  });
});

describe("výkaz kalkulačky (dnes / s aplikací / rozdíl)", () => {
  it("rozdíl nákladu dnes a s aplikací je přesně měsíční úspora", () => {
    const result = computeSavings(DEFAULT_INPUT);
    expect(result.manualHoursPerMonth).toBeCloseTo(16.667, 3);
    expect(result.checkHoursPerMonth).toBeCloseTo(3.333, 3);
    expect(result.manualCostPerMonth).toBeCloseTo(5833.333, 3);
    expect(result.checkCostPerMonth).toBeCloseTo(1166.667, 3);
    expect(result.manualCostPerMonth - result.checkCostPerMonth).toBeCloseTo(result.savingsPerMonth, 10);
  });

  it("ušetřené hodiny za rok převede na osmihodinové pracovní dny", () => {
    // 13,33 h × 12 / 8 = 20 dní
    expect(computeSavings(DEFAULT_INPUT).workDaysSavedPerYear).toBeCloseTo(20, 10);
  });

  it("pracovní dny nejsou záporné, když kontrola trvá déle než přepis", () => {
    expect(computeSavings({ ...DEFAULT_INPUT, manualMinutes: 3, checkMinutes: 3 }).workDaysSavedPerYear).toBe(0);
  });
});

describe("computeSavings", () => {
  it("výchozí hodnoty dají cca 4 670 Kč měsíčně (kontrola se odečítá)", () => {
    const result = computeSavings(DEFAULT_INPUT);
    // 200 × (5 − 1) min = 800 min = 13,33 h × 350 Kč
    expect(result.minutesSavedPerInvoice).toBe(4);
    expect(result.hoursSavedPerMonth).toBeCloseTo(13.333, 3);
    expect(result.savingsPerMonth).toBeCloseTo(4666.667, 3);
    expect(Math.round(result.savingsPerMonth / 10) * 10).toBe(4670);
    expect(result.savingsPerYear).toBeCloseTo(56000, 6);
  });

  it("nezaokrouhluje v průběhu výpočtu", () => {
    const result = computeSavings({ ...DEFAULT_INPUT, invoicesPerMonth: 7 });
    expect(result.hoursSavedPerMonth).toBeCloseTo((7 * 4) / 60, 10);
    expect(result.savingsPerMonth).toBeCloseTo(((7 * 4) / 60) * 350, 10);
  });

  it("úspora je nulová, ne záporná, když kontrola trvá stejně nebo déle než přepis", () => {
    expect(computeSavings({ ...DEFAULT_INPUT, manualMinutes: 3, checkMinutes: 3 }).savingsPerMonth).toBe(0);
    expect(computeSavings({ ...DEFAULT_INPUT, manualMinutes: 3, checkMinutes: 5 }).savingsPerMonth).toBe(0);
  });

  it("bez ceny nepočítá návratnost ani investici", () => {
    const result = computeSavings(DEFAULT_INPUT);
    expect(result.paybackMonths).toBeNull();
    expect(result.breakEvenInvoicesPerMonth).toBeNull();
    expect(result.series.every((point) => point.investment === null)).toBe(true);
  });

  it("návratnost se nespočítá, když správa není známá", () => {
    const result = computeSavings(DEFAULT_INPUT, { price: 35000, monthlyFee: null });
    expect(result.netSavingsPerMonth).toBeNull();
    expect(result.paybackMonths).toBeNull();
  });

  it("návratnost počítá se správou", () => {
    const result = computeSavings(DEFAULT_INPUT, { price: 35000, monthlyFee: 1000 });
    expect(result.netSavingsPerMonth).toBeCloseTo(3666.667, 3);
    expect(result.paybackMonths).toBeCloseTo(35000 / 3666.6667, 3);
  });

  it("návratnost se nezobrazí, když úspora nepokryje správu", () => {
    const result = computeSavings({ ...DEFAULT_INPUT, invoicesPerMonth: 50 }, { price: 35000, monthlyFee: 5000 });
    expect(result.paybackMonths).toBeNull();
  });

  it("řada má hodnotu pro každý měsíc horizontu včetně nultého", () => {
    const result = computeSavings(DEFAULT_INPUT, { horizonMonths: 24, price: 35000, monthlyFee: 0 });
    expect(result.series).toHaveLength(25);
    expect(result.series[0]).toMatchObject({ month: 0, savings: 0, investment: 35000 });
    // 200 × 4 min / 60 × 350 Kč × 24 měsíců = 112 000 Kč
    expect(result.series[24].savings).toBeCloseTo(112000, 6);
  });

  it("srovnání s poplatkem za doklad: od kolika faktur vychází aplikace levněji", () => {
    // (35 000 + 0 × 24) / (4 Kč × 24) ≈ 364,6 faktur měsíčně
    const result = computeSavings(DEFAULT_INPUT, {
      price: 35000,
      monthlyFee: 0,
      perDocumentFee: 4,
      horizonMonths: 24,
    });
    expect(result.breakEvenInvoicesPerMonth).toBeCloseTo(364.583, 3);
    expect(result.series[24].perDocumentCost).toBe(4 * 200 * 24);
  });
});

describe("řada pro graf nákladů (dnes / s aplikací)", () => {
  it("rozdíl kumulativních nákladů je kumulativní úspora", () => {
    const result = computeSavings(DEFAULT_INPUT, { horizonMonths: 24 });
    // 5 833,33 Kč × 24 = 140 000 Kč, 1 166,67 Kč × 24 = 28 000 Kč
    expect(result.series[24].manualCost).toBeCloseTo(140000, 6);
    expect(result.series[24].checkCost).toBeCloseTo(28000, 6);
    for (const point of result.series) {
      expect(point.manualCost - point.checkCost).toBeCloseTo(point.savings, 6);
    }
  });
});

describe("zastávky posuvníku faktur", () => {
  it("pokrývají celý rozsah vzestupně a obsahují výchozí hodnotu", () => {
    expect(INVOICE_STOPS[0]).toBe(50);
    expect(INVOICE_STOPS[INVOICE_STOPS.length - 1]).toBe(3000);
    expect(INVOICE_STOPS.every((value, index) => index === 0 || value > INVOICE_STOPS[index - 1])).toBe(true);
    expect(INVOICE_STOPS).toContain(DEFAULT_INPUT.invoicesPerMonth);
  });

  it("najde nejbližší zastávku k zapsané hodnotě", () => {
    expect(INVOICE_STOPS[nearestStopIndex(INVOICE_STOPS, 200)]).toBe(200);
    expect(INVOICE_STOPS[nearestStopIndex(INVOICE_STOPS, 330)]).toBe(325);
    expect(INVOICE_STOPS[nearestStopIndex(INVOICE_STOPS, 1240)]).toBe(1200);
    expect(nearestStopIndex(INVOICE_STOPS, 99999)).toBe(INVOICE_STOPS.length - 1);
  });
});

describe("clampInput", () => {
  it("omezí vstupy na rozsah kalkulačky", () => {
    expect(
      clampInput({ invoicesPerMonth: 10, manualMinutes: 99, hourlyCost: Number.NaN, checkMinutes: 0 }),
    ).toEqual({ invoicesPerMonth: 50, manualMinutes: 7, hourlyCost: 250, checkMinutes: 0.5 });
  });
});
