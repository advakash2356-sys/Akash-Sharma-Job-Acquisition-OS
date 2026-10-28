import { useState } from 'react';
import { FileSearch, Upload } from 'lucide-react';
import { Badge, Button, Card, Input, Label, PageHeader, Textarea } from '../components/ui';
import { DISCLAIMER, findCtc, scanOffer, type Clause } from '../lib/offerShield';
import { ctcToInHand, inr, TAX_YEAR } from '../lib/indiaTax';
import { OFFER_ACCEPT, readOfferFile } from '../lib/docText';

const SAMPLE_A = `SAMPLE OFFER (made up). Dear Riya, we are pleased to offer you the role of Sales Executive at Sample Foods Pvt Ltd with an annual CTC of Rs 9,00,000. Variable pay of 10% is performance linked and at the sole discretion of the company. You will be on probation for 6 months. You agree to a service bond of 24 months; if you leave before that you shall pay Rs 2,00,000 as liquidated damages. You must submit your original certificates to HR, which will be retained during the bond period. The notice period after confirmation is 90 days. You shall not join any competitor for 12 months after leaving. Any joining bonus must be repaid in full if you resign within 12 months.`;
const SAMPLE_B = `SAMPLE OFFER (made up). We are happy to offer you Account Manager at Sample Retail Ltd. Your CTC is 8.5 LPA, all fixed. Probation is 3 months. Notice period is 30 days. You may not solicit our clients for 6 months after leaving.`;
const tone = (r: Clause['risk']) => (r === 'red' ? 'danger' : r === 'amber' ? 'gold' : 'muted') as 'danger' | 'gold' | 'muted';

interface Side { text: string; ctc: string; variable: string; busy: string }
const empty: Side = { text: '', ctc: '', variable: '0', busy: '' };

export default function OfferShield() {
  const [s, setS] = useState<[Side, Side]>([{ ...empty }, { ...empty }]);
  const [basic, setBasic] = useState('50'); const [pt, setPt] = useState('2400');
  const set = (i: 0 | 1, p: Partial<Side>) => setS((x) => { const y = [...x] as [Side, Side]; y[i] = { ...y[i], ...p }; return y; });
  const load = async (i: 0 | 1, f?: File) => { if (!f) return; set(i, { busy: 'Reading…' }); try { const t = await readOfferFile(f, (b) => set(i, { busy: b })); const c = findCtc(t); set(i, { text: t, busy: '', ...(c ? { ctc: String(c) } : {}) }); } catch (e: any) { set(i, { busy: e?.message || 'Could not read the file.' }); } };
  const res = s.map((x) => ({ clauses: x.text.trim() ? scanOffer(x.text) : [], pay: Number(x.ctc) > 0 ? ctcToInHand({ ctc: Number(x.ctc), variablePct: Number(x.variable) || 0, basicPct: Number(basic) || 50, professionalTax: Number(pt) || 0 }) : null }));
  const both = res[0].pay && res[1].pay;
  return (
    <>
      <PageHeader eyebrow="Free · runs in your browser" title="Offer Shield: read an offer letter before you sign" subtitle="Upload a PDF, Word file, scan or photo of an offer. It flags bonds, non-competes, long notice, clawbacks and held documents, and estimates your monthly in-hand pay. Compare two offers side by side. Nothing leaves this device." />
      <p className="mb-5 rounded-2xl border border-border bg-muted/50 px-4 py-3 text-sm" data-testid="offer-disclaimer">{DISCLAIMER}</p>
      <div className="mb-5 grid gap-5 lg:grid-cols-2">
        {([0, 1] as const).map((i) => (
          <Card key={i} className="grid min-w-0 gap-3" data-testid={`offer-${i}`}>
            <h2 className="text-xl font-medium">Offer {i === 0 ? 'A' : 'B'}</h2>
            <label className="inline-flex min-h-11 w-fit cursor-pointer items-center gap-2 rounded-lg border border-border px-4 text-sm hover:bg-muted"><Upload size={15} /> Upload offer (PDF, DOCX, scan, photo)<input type="file" hidden accept={OFFER_ACCEPT} onChange={(e) => load(i, e.target.files?.[0])} /></label>
            {s[i].busy && <p className="text-sm text-muted-foreground" role="status">{s[i].busy}</p>}
            <div><Label htmlFor={`ot${i}`}>Or paste the text</Label><Textarea id={`ot${i}`} rows={6} value={s[i].text} onChange={(e) => set(i, { text: e.target.value })} /></div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><div className="min-w-0"><Label htmlFor={`oc${i}`}>CTC per year (₹)</Label><Input id={`oc${i}`} inputMode="numeric" value={s[i].ctc} onChange={(e) => set(i, { ctc: e.target.value.replace(/\D/g, '') })} /></div>
              <div className="min-w-0"><Label htmlFor={`ov${i}`}>Variable pay %</Label><Input id={`ov${i}`} inputMode="numeric" value={s[i].variable} onChange={(e) => set(i, { variable: e.target.value.replace(/[^\d.]/g, '') })} /></div></div>
            <Button variant="ghost" className="w-fit" onClick={() => set(i, { text: i === 0 ? SAMPLE_A : SAMPLE_B, ctc: i === 0 ? '900000' : '850000', variable: i === 0 ? '10' : '0' })}>Try a sample (made up)</Button>
            {res[i].pay && <div className="rounded-lg bg-muted/60 p-3 text-sm" data-testid={`inhand-${i}`}><div className="label text-muted-foreground">Estimated monthly in-hand</div><div className="font-mono text-3xl">{inr(res[i].pay!.monthlyInHand)}</div>
              <p className="mt-1 text-xs text-muted-foreground">Estimate · tax {inr(res[i].pay!.tax)}/yr · PF {inr(res[i].pay!.employeePf)}/yr · {TAX_YEAR}</p></div>}
            {res[i].clauses.length > 0 && <ul className="grid gap-2" data-testid={`clauses-${i}`}>{res[i].clauses.map((c, k) => <li key={k} className="min-w-0 rounded-lg border border-border p-3 text-sm [overflow-wrap:anywhere]"><div className="flex flex-wrap items-center gap-2"><Badge tone={tone(c.risk)}>{c.risk === 'red' ? 'Look closely' : c.risk === 'amber' ? 'Ask about it' : 'Note'}</Badge><b>{c.kind}</b>{c.detail && <span className="text-muted-foreground">· {c.detail}</span>}</div><p className="mt-1">{c.why}</p><p className="mt-1 text-xs text-muted-foreground">"{c.sentence}"</p></li>)}</ul>}
            {s[i].text.trim() && !res[i].clauses.length && <p className="text-sm text-muted-foreground">No clauses matched these rules. That does not mean there are none; read it fully.</p>}
          </Card>))}
      </div>
      {both && <Card className="mb-5 grid gap-3" data-testid="offer-compare"><h2 className="text-xl font-medium"><FileSearch size={18} className="mr-2 inline" />Side by side</h2>
        <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="text-left text-muted-foreground"><th className="py-1 font-normal"></th><th className="font-normal">Offer A</th><th className="font-normal">Offer B</th></tr></thead><tbody>
          {([['CTC', (i: number) => inr(Number(s[i].ctc))], ['Monthly in-hand (estimate)', (i: number) => inr(res[i].pay!.monthlyInHand)], ['Variable (not guaranteed)', (i: number) => inr(res[i].pay!.variable)], ['Clauses to look closely at', (i: number) => String(res[i].clauses.filter((c) => c.risk === 'red').length)], ['Clauses to ask about', (i: number) => String(res[i].clauses.filter((c) => c.risk === 'amber').length)]] as [string, (i: number) => string][]).map(([k, f]) => <tr key={k} className="border-t border-border/60"><td className="py-1">{k}</td><td>{f(0)}</td><td>{f(1)}</td></tr>)}
        </tbody></table></div></Card>}
      <Card className="grid gap-2 text-sm"><h2 className="text-xl font-medium">Estimate settings</h2>
        <div className="grid max-w-md grid-cols-1 gap-3 sm:grid-cols-2"><div className="min-w-0"><Label htmlFor="ob">Basic % of CTC</Label><Input id="ob" value={basic} onChange={(e) => setBasic(e.target.value.replace(/\D/g, ''))} /></div><div className="min-w-0"><Label htmlFor="op">Professional tax / yr</Label><Input id="op" value={pt} onChange={(e) => setPt(e.target.value.replace(/\D/g, ''))} /></div></div>
        {res[0].pay && <ul className="list-disc pl-5 text-muted-foreground">{res[0].pay.assumptions.map((a) => <li key={a}>{a}</li>)}</ul>}
        <p className="text-xs text-muted-foreground [overflow-wrap:anywhere]">Tax slabs from the Income Tax Department: https://www.incometax.gov.in/iec/foportal/help/individual/return-applicable-1. Your payslip can differ (allowances, reimbursements, state tax, employer policy).</p>
      </Card>
    </>
  );
}
