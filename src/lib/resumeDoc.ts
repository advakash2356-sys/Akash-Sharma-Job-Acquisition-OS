// ATS-friendly resume documents.
// Data shape: a subset of the JSON Resume schema (https://github.com/jsonresume/resume-schema, MIT, © JSON Resume).
// Layout: single column, standard section headings, plain fonts, no tables, images or columns, as recommended by
// RenderCV (https://github.com/rendercv/rendercv, MIT, © Sina Atalay and contributors) and the
// jsonresume-theme-even layout (https://github.com/rbardini/jsonresume-theme-even, MIT, © Rafael Bardini).
// The code below is written for this app; see THIRD_PARTY_NOTICES.md.
import { jsPDF } from 'jspdf';
import { AlignmentType, BorderStyle, Document, Footer, HeadingLevel, Packer, Paragraph, TextRun } from 'docx';
import { track } from './analytics';

export interface ResumeDoc {
  basics: { name: string; label: string; email: string; phone: string; location: string; url: string; summary: string };
  work: { position: string; name: string; location: string; startDate: string; endDate: string; highlights: string[] }[];
  education: { institution: string; studyType: string; area: string; startDate: string; endDate: string; score: string }[];
  skills: { name: string; keywords: string[] }[];
  projects: { name: string; description: string; highlights: string[] }[];
  certificates: { name: string; issuer: string; date: string }[];
  languages: { language: string; fluency: string }[];
}

const arr = <T,>(x: unknown): T[] => (Array.isArray(x) ? (x as T[]) : []);
const t = (x: unknown) => (typeof x === 'string' ? x.trim() : '');
export function normalise(x: any): ResumeDoc | null {
  if (!x || typeof x !== 'object' || !x.basics) return null;
  const b = x.basics || {};
  return {
    basics: { name: t(b.name), label: t(b.label), email: t(b.email), phone: t(b.phone), location: t(b.location), url: t(b.url), summary: t(b.summary) },
    work: arr<any>(x.work).map((w) => ({ position: t(w.position), name: t(w.name), location: t(w.location), startDate: t(w.startDate), endDate: t(w.endDate), highlights: arr<string>(w.highlights).map(t).filter(Boolean) })).filter((w) => w.position || w.name),
    education: arr<any>(x.education).map((e) => ({ institution: t(e.institution), studyType: t(e.studyType), area: t(e.area), startDate: t(e.startDate), endDate: t(e.endDate), score: t(e.score) })).filter((e) => e.institution || e.studyType),
    skills: arr<any>(x.skills).map((s) => ({ name: t(s.name), keywords: arr<string>(s.keywords).map(t).filter(Boolean) })).filter((s) => s.name || s.keywords.length),
    projects: arr<any>(x.projects).map((p) => ({ name: t(p.name), description: t(p.description), highlights: arr<string>(p.highlights).map(t).filter(Boolean) })).filter((p) => p.name),
    certificates: arr<any>(x.certificates).map((c) => ({ name: t(c.name), issuer: t(c.issuer), date: t(c.date) })).filter((c) => c.name),
    languages: arr<any>(x.languages).map((l) => ({ language: t(l.language), fluency: t(l.fluency) })).filter((l) => l.language),
  };
}

const range = (a: string, b: string) => [a, b].filter(Boolean).join(' – ');
const join = (...p: string[]) => p.filter(Boolean).join(' | ');

interface Block { heading: string; items: { title: string; right?: string; sub?: string; bullets?: string[]; text?: string }[] }
function blocks(r: ResumeDoc): Block[] {
  const out: Block[] = [];
  if (r.basics.summary) out.push({ heading: 'Summary', items: [{ title: '', text: r.basics.summary }] });
  if (r.work.length) out.push({ heading: 'Experience', items: r.work.map((w) => ({ title: join(w.position, w.name), right: range(w.startDate, w.endDate), sub: w.location, bullets: w.highlights })) });
  if (r.skills.length) out.push({ heading: 'Skills', items: r.skills.map((s) => ({ title: '', text: s.name && s.keywords.length ? `${s.name}: ${s.keywords.join(', ')}` : s.name || s.keywords.join(', ') })) });
  if (r.projects.length) out.push({ heading: 'Projects', items: r.projects.map((p) => ({ title: p.name, text: p.description, bullets: p.highlights })) });
  if (r.education.length) out.push({ heading: 'Education', items: r.education.map((e) => ({ title: join([e.studyType, e.area].filter(Boolean).join(', '), e.institution), right: range(e.startDate, e.endDate), sub: e.score })) });
  if (r.certificates.length) out.push({ heading: 'Certifications', items: r.certificates.map((c) => ({ title: join(c.name, c.issuer), right: c.date })) });
  if (r.languages.length) out.push({ heading: 'Languages', items: [{ title: '', text: r.languages.map((l) => (l.fluency ? `${l.language} (${l.fluency})` : l.language)).join(', ') }] });
  return out;
}

/** Plain text (for copy, the fact check and ATS paste boxes). */
export function resumeText(r: ResumeDoc) {
  const lines = [r.basics.name, r.basics.label, join(r.basics.location, r.basics.email, r.basics.phone, r.basics.url), ''];
  for (const b of blocks(r)) {
    lines.push(b.heading.toUpperCase());
    for (const i of b.items) {
      const head = [i.title, i.right].filter(Boolean).join('  ·  ');
      if (head) lines.push(head);
      if (i.sub) lines.push(i.sub);
      if (i.text) lines.push(i.text);
      (i.bullets || []).forEach((x) => lines.push(`• ${x}`));
    }
    lines.push('');
  }
  return lines.join('\n').trim();
}

function save(blob: Blob, name: string) {
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name;
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

/** ATS-friendly PDF: real text (selectable), Helvetica, one column, standard headings. No app branding inside the resume. */
export function resumePdf(r: ResumeDoc, base: string) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const W = doc.internal.pageSize.getWidth(), H = doc.internal.pageSize.getHeight(), m = 48, cw = W - m * 2;
  let y = m;
  const need = (h: number) => { if (y + h > H - m) { doc.addPage(); y = m; } };
  const write = (s: string, size: number, style: 'normal' | 'bold' | 'italic' = 'normal', indent = 0, gap = 3) => {
    doc.setFont('helvetica', style); doc.setFontSize(size);
    for (const line of doc.splitTextToSize(s, cw - indent) as string[]) { need(size + gap); doc.text(line, m + indent, y + size); y += size + gap; }
  };
  write(r.basics.name || 'Resume', 20, 'bold', 0, 4);
  if (r.basics.label) write(r.basics.label, 11);
  const contact = join(r.basics.location, r.basics.email, r.basics.phone, r.basics.url);
  if (contact) write(contact, 9.5);
  y += 6;
  for (const b of blocks(r)) {
    need(30); y += 6;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.text(b.heading.toUpperCase(), m, y + 11); y += 15;
    doc.setDrawColor(150); doc.setLineWidth(0.6); doc.line(m, y, W - m, y); y += 5;
    for (const i of b.items) {
      if (i.title || i.right) {
        need(16);
        doc.setFont('helvetica', 'bold'); doc.setFontSize(10.5);
        const rw = i.right ? doc.getTextWidth(i.right) : 0;
        const tl = doc.splitTextToSize(i.title, cw - rw - 12) as string[];
        if (i.right) { doc.setFont('helvetica', 'normal'); doc.text(i.right, W - m - rw, y + 10.5); doc.setFont('helvetica', 'bold'); }
        tl.forEach((l) => { need(14); doc.text(l, m, y + 10.5); y += 14; });
      }
      if (i.sub) write(i.sub, 9.5, 'italic');
      if (i.text) write(i.text, 10);
      for (const x of i.bullets || []) {
        doc.setFont('helvetica', 'normal'); doc.setFontSize(10);
        const ls = doc.splitTextToSize(x, cw - 14) as string[];
        ls.forEach((l, k) => { need(13); if (!k) doc.text('•', m + 2, y + 10); doc.text(l, m + 14, y + 10); y += 13; });
      }
      y += 4;
    }
  }
  doc.setProperties({ title: `${r.basics.name} resume`, author: r.basics.name });
  doc.save(`${base}.pdf`); track('export');
}

export async function resumeDocx(r: ResumeDoc, base: string) {
  const P: Paragraph[] = [];
  P.push(new Paragraph({ heading: HeadingLevel.TITLE, children: [new TextRun({ text: r.basics.name || 'Resume', bold: true, size: 36 })] }));
  if (r.basics.label) P.push(new Paragraph({ children: [new TextRun({ text: r.basics.label, size: 22 })] }));
  const contact = join(r.basics.location, r.basics.email, r.basics.phone, r.basics.url);
  if (contact) P.push(new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text: contact, size: 19 })] }));
  for (const b of blocks(r)) {
    P.push(new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 200, after: 80 }, border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: '999999', space: 2 } }, children: [new TextRun({ text: b.heading.toUpperCase(), bold: true, size: 22, color: '000000' })] }));
    for (const i of b.items) {
      if (i.title || i.right) P.push(new Paragraph({ tabStops: [{ type: 'right' as any, position: 9000 }], children: [new TextRun({ text: i.title, bold: true, size: 21 }), ...(i.right ? [new TextRun({ text: `\t${i.right}`, size: 20 })] : [])] }));
      if (i.sub) P.push(new Paragraph({ children: [new TextRun({ text: i.sub, italics: true, size: 19 })] }));
      if (i.text) P.push(new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: i.text, size: 20 })] }));
      for (const x of i.bullets || []) P.push(new Paragraph({ bullet: { level: 0 }, children: [new TextRun({ text: x, size: 20 })] }));
    }
  }
  const doc = new Document({ creator: r.basics.name || 'Candidate', title: `${r.basics.name} resume`, styles: { default: { document: { run: { font: 'Calibri' } } } }, sections: [{ properties: { page: { margin: { top: 900, bottom: 900, left: 1000, right: 1000 } } }, children: P }] });
  save(await Packer.toBlob(doc), `${base}.docx`); track('export');
}

/** Cover letter as a plain business letter. The header names the job it is for. */
export function letterPdf(text: string, forLine: string, base: string) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const W = doc.internal.pageSize.getWidth(), H = doc.internal.pageSize.getHeight(), m = 56;
  let y = m;
  doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(90); doc.text(forLine, m, y); y += 26; doc.setTextColor(0);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(11);
  for (const line of doc.splitTextToSize(text.replace(/\*\*(.*?)\*\*/g, '$1'), W - m * 2) as string[]) { if (y > H - m) { doc.addPage(); y = m; } doc.text(line, m, y); y += 16; }
  doc.save(`${base}.pdf`); track('export');
}
export async function letterDocx(text: string, forLine: string, base: string) {
  const doc = new Document({ styles: { default: { document: { run: { font: 'Calibri' } } } }, sections: [{ footers: { default: new Footer({ children: [] }) }, children: [
    new Paragraph({ alignment: AlignmentType.LEFT, spacing: { after: 240 }, children: [new TextRun({ text: forLine, bold: true, size: 19, color: '555555' })] }),
    ...text.replace(/\*\*(.*?)\*\*/g, '$1').split('\n').map((l) => new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text: l, size: 22 })] })),
  ] }] });
  save(await Packer.toBlob(doc), `${base}.docx`); track('export');
}
