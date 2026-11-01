import { useEffect, useState } from 'react';
import { CONSENT_TEXT, KEY, exportJson, load, save, setBoth, setConsent, type ConsentState } from '../lib/consent';
import { downloadText } from '../lib/exportResult';
import { CREDIT } from '../lib/brand';

const fmt = (iso?: string) => (iso ? new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '');
async function exportPdf(s: ConsentState) {
  try { await pdf(s); } catch { downloadText('jaos-consent-log.json', exportJson(s)); alert('PDF could not be made in this browser, so the JSON log was downloaded instead.'); }
}
async function pdf(s: ConsentState) {
  const { jsPDF } = await import('jspdf'); const p = new jsPDF({ unit: 'pt', format: 'a4' }); let y = 50;
  const L = (t: string, z = 10, b = false) => { p.setFont('helvetica', b ? 'bold' : 'normal'); p.setFontSize(z); for (const l of p.splitTextToSize(t, 500)) { if (y > 800) { p.addPage(); y = 50; } p.text(l, 48, y); y += z + 4; } };
  L('Consent log · Job Acquisition OS', 16, true); L(`Exported ${fmt(new Date().toISOString())}. Kept only in this browser; nothing was sent to a server.`); y += 6;
  L(`Text messages: ${s.sms.given ? `given ${fmt(s.sms.at)}` : 'not given'}`); L(`CV storage: ${s.cv.given ? `given ${fmt(s.cv.at)}, until ${fmt(s.cv.until)}` : 'not given'}`); y += 6;
  for (const e of s.log) { L(`${fmt(e.at)} · ${e.kind === 'sms' ? 'Text messages' : 'CV storage'} · ${e.action === 'default-on' ? 'ticked by default' : e.action === 'given' ? 'ticked' : e.action === 'withdrawn' ? 'unticked / withdrawn' : e.action}${e.until ? ` (until ${fmt(e.until)})` : ''} · ${e.where}`, 10, true); L(`"${e.text}" (wording version ${e.version})`, 9); }
  y += 8; L(CREDIT, 8); p.save('jaos-consent-log.pdf');
}
/** Optional consent checkboxes. Optional, unticked by default (Akash t307u); never required to submit or use anything. */
export function ConsentBoxes({ where }: { where: string }) {
  const [s, setS] = useState<ConsentState>(load);
  useEffect(() => { const f = () => setS(load()); window.addEventListener(KEY, f); return () => window.removeEventListener(KEY, f); }, []);
  const toggle = (k: 'sms' | 'cv', on: boolean) => { const n = setConsent(load(), k, on, where); save(n); setS(n); };
  const both = (on: boolean) => { const n = setBoth(load(), on, where); save(n); setS(n); };
  return (
    <fieldset className="grid min-w-0 gap-2 rounded-lg border border-border p-3 text-sm [overflow-wrap:anywhere]" data-testid={`consent-${where}`}>
      <legend className="px-1 text-xs font-medium text-muted-foreground">Optional consents (you can use everything without them)</legend>
      {(['sms', 'cv'] as const).map((k) => <label key={k} className="flex items-start gap-2"><input type="checkbox" className="mt-1 h-4 w-4 shrink-0" checked={s[k].given} onChange={(e) => toggle(k, e.target.checked)} data-testid={`consent-${k}`} />
        <span>{CONSENT_TEXT[k]}{k === 'cv' && s.cv.given && <span className="block text-xs text-muted-foreground" data-testid="consent-until">Given {fmt(s.cv.at)} · kept until {fmt(s.cv.until)}</span>}{k === 'sms' && s.sms.given && <span className="block text-xs text-muted-foreground">Given {fmt(s.sms.at)}</span>}
          {s[k].given && <button type="button" className="min-h-11 text-xs text-primary underline" onClick={() => toggle(k, false)}>Withdraw consent</button>}</span></label>)}
      <div className="flex flex-wrap items-center gap-3 text-xs" data-testid="consent-manage"><b>You can change or withdraw either choice any time.</b> Manage consent:
        <button type="button" className="min-h-11 text-primary underline" onClick={() => both(false)} data-testid="consent-untick-all">Untick both</button>
        <button type="button" className="min-h-11 text-primary underline" onClick={() => both(true)} data-testid="consent-tick-all">Tick both</button></div>
      <p className="text-xs text-muted-foreground">Saved only in your browser with the date and time. We don't collect it, we don't send text messages, and Job Acquisition OS does not share your CV with employers: it stays on this device. Both are optional and start unticked: you can submit and use everything without them. Tick, untick, "Withdraw consent" or "Untick both" at any time; each change is logged with its date, time and wording version. See our <a className="text-primary underline" href="/privacy#consent">privacy notice</a>.</p>
      <div className="flex flex-wrap gap-3 text-xs"><button type="button" className="min-h-11 text-primary underline" onClick={() => downloadText('jaos-consent-log.json', exportJson(load()))} data-testid="consent-json">Download consent log (JSON)</button><button type="button" className="min-h-11 text-primary underline" onClick={() => exportPdf(load())} data-testid="consent-pdf">Download consent log (PDF)</button></div>
    </fieldset>
  );
}
