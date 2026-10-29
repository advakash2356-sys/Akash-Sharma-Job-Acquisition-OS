
import { FileDown } from 'lucide-react';
import { Button, Card, Input, Label, PageHeader, Textarea } from '../components/ui';
import { CHECKLIST, DISCLAIMER, EXPORT_LINE, SOURCES, estimate44ADA, invoiceTotal, type InvoiceData } from '../lib/remoteKit';
import { inr } from '../lib/indiaTax';
import { CREDIT } from '../lib/brand';
import { Steps } from '../components/Steps';
import { LocalNote } from '../components/LocalNote';
import { usePersisted, clearPersisted } from '../lib/persist';

const SAMPLE: InvoiceData = { number: 'SAMPLE-001', date: new Date().toISOString().slice(0, 10), from: 'Riya Sharma (sample)', fromAddress: 'Delhi, India', gstin: '', lutArn: '', pan: '', client: 'Sample Client LLC', clientAddress: 'Austin, Texas', clientCountry: 'United States', currency: 'USD', items: [{ desc: 'Software development services, October 2026', amount: 2500 }], bank: 'Bank name, account number, SWIFT/BIC' };

async function invoicePdf(d: InvoiceData) {
  const { jsPDF } = await import('jspdf'); const pdf = new jsPDF({ unit: 'pt', format: 'a4' }); let y = 60; const L = 50;
  const line = (t: string, size = 10, bold = false) => { pdf.setFont('helvetica', bold ? 'bold' : 'normal'); pdf.setFontSize(size); for (const s of pdf.splitTextToSize(t, 495)) { pdf.text(s, L, y); y += size + 5; } };
  line('INVOICE (EXPORT OF SERVICES)', 16, true); y += 6;
  line(`Invoice no: ${d.number}    Date: ${d.date}`);
  y += 8; line('From', 11, true); line(d.from); line(d.fromAddress); if (d.pan) line(`PAN: ${d.pan}`); if (d.gstin) line(`GSTIN: ${d.gstin}`); if (d.lutArn) line(`LUT ARN: ${d.lutArn}`);
  y += 8; line('Bill to', 11, true); line(d.client); line(`${d.clientAddress}, ${d.clientCountry}`);
  y += 8; line('Services', 11, true); for (const it of d.items) line(`${it.desc}    ${d.currency} ${Number(it.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`);
  y += 4; line(`Total: ${d.currency} ${invoiceTotal(d).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 12, true);
  y += 8; if (d.gstin) line(EXPORT_LINE); line('Place of supply: outside India.');
  y += 8; line('Payment details', 11, true); line(d.bank);
  y += 16; pdf.setTextColor(120); line(`Generated with Job Acquisition OS Remote-Ready kit · ${CREDIT}. Check the format with your CA.`, 8);
  pdf.save(`invoice-${d.number}.pdf`);
}

export default function RemoteKit() {
  const [rec, setRec] = usePersisted('jaos_remote_receipts', '2400000'); const [inv, setInv] = usePersisted<InvoiceData>('jaos_remote_invoice', { ...SAMPLE, items: [{ ...SAMPLE.items[0] }] });
  const e = estimate44ADA(Number(rec) || 0);
  const f = (k: keyof InvoiceData) => (ev: { target: { value: string } }) => setInv({ ...inv, [k]: ev.target.value });
  return (
    <>
      <PageHeader eyebrow="Free · for Indians paid by foreign clients" title="Remote-Ready India kit" subtitle="A checklist for LUT and FIRA, a section 44ADA tax estimate, and an export invoice PDF. Everything stays in your browser." />
      <p className="mb-5 rounded-2xl border border-border bg-muted/50 px-4 py-3 text-sm" data-testid="remote-disclaimer">{DISCLAIMER}</p>
      <LocalNote onClear={() => { clearPersisted('jaos_remote_receipts', 'jaos_remote_invoice', 'jaos_steps_remote'); location.reload(); }} />
      <div data-testid="remote-checklist"><Steps id="remote" title="Get remote-ready, step by step" steps={[...CHECKLIST.map((c) => ({ title: c.step, body: <>Then: {c.detail}</> })), { title: 'Estimate your tax (Section 44ADA, below)', body: 'Enter this year\'s receipts. Then set aside the monthly amount shown.' }, { title: 'Make your export invoice (below)', body: 'Fill in your details, then download the PDF and send it to your client from your own email.' }]} /></div>
      <Card className="mb-5 grid gap-3" data-testid="remote-44ada"><h2 className="text-xl font-medium">Section 44ADA estimate</h2>
        <div className="max-w-xs"><Label htmlFor="rr">Gross receipts this year (₹)</Label><Input id="rr" inputMode="numeric" value={rec} onChange={(ev) => setRec(ev.target.value.replace(/\D/g, ''))} /></div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 text-sm">{[['Deemed income (50%)', inr(e.deemedIncome)], ['Estimated tax', inr(e.tax)], ['Set aside per month', inr(e.monthlySetAside)], ['44ADA limit', e.eligible ? 'Within' : 'Above']].map(([k, v]) => <div key={k}><div className="label text-muted-foreground">{k}</div><div className="font-mono text-xl">{v}</div></div>)}</div>
        <p className="text-xs text-muted-foreground">{e.note} New regime, FY 2025-26, with the s.87A rebate and 4% cess. Ignores other income, deductions and surcharge relief. Estimate only.</p></Card>
      <Card className="mb-5 grid gap-3" data-testid="remote-invoice"><h2 className="text-xl font-medium">Export invoice (PDF)</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {([['number', 'Invoice number'], ['date', 'Date'], ['from', 'Your name / business'], ['fromAddress', 'Your address'], ['pan', 'PAN (optional)'], ['gstin', 'GSTIN (if registered)'], ['lutArn', 'LUT ARN (if registered)'], ['client', 'Client name'], ['clientAddress', 'Client address'], ['clientCountry', 'Client country'], ['currency', 'Currency']] as [keyof InvoiceData, string][]).map(([k, l]) => <div key={k}><Label htmlFor={`iv-${k}`}>{l}</Label><Input id={`iv-${k}`} value={String(inv[k] ?? '')} onChange={f(k)} /></div>)}
          <div><Label htmlFor="iv-d">Service description</Label><Input id="iv-d" value={inv.items[0].desc} onChange={(ev) => setInv({ ...inv, items: [{ ...inv.items[0], desc: ev.target.value }] })} /></div>
          <div><Label htmlFor="iv-a">Amount</Label><Input id="iv-a" inputMode="decimal" value={String(inv.items[0].amount)} onChange={(ev) => setInv({ ...inv, items: [{ ...inv.items[0], amount: Number(ev.target.value.replace(/[^\d.]/g, '')) || 0 }] })} /></div>
        </div>
        <div><Label htmlFor="iv-b">Bank details for payment</Label><Textarea id="iv-b" rows={2} value={inv.bank} onChange={f('bank')} /></div>
        <Button className="w-fit" onClick={() => invoicePdf(inv)}><FileDown size={16} /> Download invoice PDF</Button>
        <p className="text-xs text-muted-foreground">Starts with made-up sample data. Replace it with yours. The export line is added when a GSTIN is entered.</p></Card>
      <Card className="grid gap-2 text-sm"><h2 className="text-xl font-medium">Official sources</h2><ul className="grid gap-1">{SOURCES.map((s) => <li key={s.href}><a className="text-primary underline" href={s.href} target="_blank" rel="noreferrer">{s.label}</a></li>)}</ul></Card>
    </>
  );
}
