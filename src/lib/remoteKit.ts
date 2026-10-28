/** Remote-Ready India kit: for Indians paid by foreign clients. ESTIMATES and checklists, not CA or tax advice. Akash Sync Agent. */
import { incomeTax } from './indiaTax';
export const SOURCES = [
  { label: 'New tax regime slabs and rebate, Income Tax Dept', href: 'https://www.incometax.gov.in/iec/foportal/help/individual/return-applicable-1' },
  { label: 'Section 44ADA (presumptive income, professionals), Income Tax Dept', href: 'https://www.incometax.gov.in/iec/foportal/help/individual-business-profession' },
  { label: 'LUT for export without IGST (Form GST RFD-11), GST portal', href: 'https://tutorial.gst.gov.in/userguide/refund/Furnishing_of_Letter_of_Undertaking_for_Export_of_Goods_or_Services.htm' },
  { label: 'CBIC circular on LUT acceptance (PDF)', href: 'https://gstcouncil.gov.in/sites/default/files/2024-06/circularno-40-cgst.pdf' },
];
export const CHECKLIST: { step: string; detail: string }[] = [
  { step: 'PAN and a bank account that accepts foreign inward remittances', detail: 'Tell the bank the payments are for export of services.' },
  { step: 'Decide on GST registration', detail: 'Usually needed once turnover crosses the threshold (₹20 lakh for services in most states). Ask a CA for your case.' },
  { step: 'If registered: file a LUT (Form GST RFD-11) each financial year', detail: 'Lets you invoice exports without paying IGST. Quote the LUT ARN on every invoice.' },
  { step: 'Invoice in foreign currency', detail: 'Include your GSTIN (if any), LUT ARN, client name and country, and "Supply meant for export under LUT without payment of IGST".' },
  { step: 'Get a FIRA / e-FIRC for each payment', detail: 'Ask your bank, or your payment platform, for the inward remittance certificate with the purpose code (e.g. P0802 software consultancy). Keep it with the invoice.' },
  { step: 'Report in GST returns (if registered)', detail: 'Show exports as zero-rated supplies in GSTR-1 and GSTR-3B.' },
  { step: 'Income tax: consider section 44ADA if eligible', detail: 'For specified professions with receipts up to ₹75 lakh (if cash receipts are 5% or less), 50% of receipts can be declared as income. File ITR-4. Check eligibility with a CA.' },
  { step: 'Pay advance tax', detail: 'Under 44ADA the whole advance tax can be paid by 15 March. Otherwise four instalments.' },
];
export interface Est44 { receipts: number; deemedIncome: number; tax: number; monthlySetAside: number; eligible: boolean; note: string }
/** 44ADA estimate: 50% of gross receipts deemed income, new-regime tax. Ignores other income and deductions. */
export function estimate44ADA(receiptsInr: number): Est44 {
  const r = Math.max(0, receiptsInr || 0), eligible = r <= 7_500_000, deemed = Math.round(r * 0.5), tax = incomeTax(deemed);
  return { receipts: r, deemedIncome: deemed, tax, monthlySetAside: Math.round(tax / 12), eligible, note: eligible ? 'Within the ₹75 lakh limit (if cash receipts are 5% or less of total).' : 'Above ₹75 lakh: 44ADA does not apply; books and audit rules apply.' };
}
export interface InvoiceData { number: string; date: string; from: string; fromAddress: string; gstin?: string; lutArn?: string; pan?: string; client: string; clientAddress: string; clientCountry: string; currency: string; items: { desc: string; amount: number }[]; bank: string }
export const invoiceTotal = (d: InvoiceData) => d.items.reduce((a, i) => a + (Number(i.amount) || 0), 0);
export const EXPORT_LINE = 'Supply meant for export of services under LUT without payment of IGST.';
export const DISCLAIMER = 'Estimates and a checklist only, not CA or tax advice. Rules change; check the official sources and a chartered accountant for your case.';
