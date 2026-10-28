/** India income tax, new regime, FY 2025-26 (AY 2026-27), as in the Finance Act 2025. ESTIMATE ONLY, not CA or tax advice.
 *  Source: https://www.incometax.gov.in/iec/foportal/help/individual/return-applicable-1 (new regime slabs, s.115BAC, rebate s.87A). Akash Sync Agent. */
export const TAX_YEAR = 'FY 2025-26 (new regime)';
export const STD_DEDUCTION = 75_000;
const SLABS: [number, number][] = [[400_000, 0], [800_000, 0.05], [1_200_000, 0.1], [1_600_000, 0.15], [2_000_000, 0.2], [2_400_000, 0.25], [Infinity, 0.3]];
export function slabTax(income: number): number {
  let tax = 0, prev = 0; for (const [cap, r] of SLABS) { if (income > prev) tax += (Math.min(income, cap) - prev) * r; prev = cap; } return tax;
}
/** Tax incl. s.87A rebate (taxable income up to 12 lakh: nil, with marginal relief), surcharge (no marginal relief applied) and 4% cess. */
export function incomeTax(taxable: number): number {
  const t = Math.max(0, taxable); let tax = slabTax(t);
  if (t <= 1_200_000) tax = 0; else tax = Math.min(tax, t - 1_200_000);
  const sc = t > 20_000_000 ? 0.25 : t > 10_000_000 ? 0.15 : t > 5_000_000 ? 0.1 : 0;
  return Math.round(tax * (1 + sc) * 1.04);
}
export interface CtcInput { ctc: number; variablePct?: number; basicPct?: number; pfCapped?: boolean; gratuityInCtc?: boolean; professionalTax?: number }
export interface InHand { gross: number; employerPf: number; gratuity: number; employeePf: number; professionalTax: number; tax: number; variable: number; monthlyInHand: number; annualInHand: number; assumptions: string[] }
/** CTC to in-hand estimate. Every assumption is returned so the page can show it. */
export function ctcToInHand(i: CtcInput): InHand {
  const ctc = Math.max(0, i.ctc || 0), basicPct = i.basicPct ?? 50, varPct = i.variablePct ?? 0, pt = i.professionalTax ?? 2_400;
  const basic = (ctc * basicPct) / 100;
  const pfBase = i.pfCapped === false ? basic : Math.min(basic, 15_000 * 12);
  const employerPf = Math.round(pfBase * 0.12), employeePf = employerPf;
  const gratuity = i.gratuityInCtc === false ? 0 : Math.round(basic * 0.0481);
  const gross = ctc - employerPf - gratuity, variable = Math.round((ctc * varPct) / 100);
  const tax = incomeTax(gross - STD_DEDUCTION);
  const annualInHand = Math.round(gross - variable - employeePf - pt - tax);
  return { gross, employerPf, gratuity, employeePf, professionalTax: pt, tax, variable, monthlyInHand: Math.round(annualInHand / 12), annualInHand,
    assumptions: [`Tax: ${TAX_YEAR}, standard deduction ₹75,000, 4% cess.`, `Basic pay ${basicPct}% of CTC.`, i.pfCapped === false ? 'PF 12% of full basic, employer and employee.' : 'PF 12% of basic capped at ₹15,000 a month (₹1,800 each side).', i.gratuityInCtc === false ? 'Gratuity not in CTC.' : 'Gratuity 4.81% of basic counted inside CTC.', `Professional tax ₹${pt.toLocaleString('en-IN')} a year (varies by state).`, varPct ? `Variable pay ${varPct}% left out of the monthly figure; tax on it is still counted.` : 'No variable pay.'] };
}
export const inr = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN');
