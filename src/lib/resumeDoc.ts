// ATS-friendly resume documents.
// Data shape: a subset of the JSON Resume schema (https://github.com/jsonresume/resume-schema, MIT, © JSON Resume).
// Layout: single column, standard section headings, plain fonts, no tables, images or columns, as recommended by
// RenderCV (https://github.com/rendercv/rendercv, MIT, © Sina Atalay and contributors) and the
// jsonresume-theme-even layout (https://github.com/rbardini/jsonresume-theme-even, MIT, © Rafael Bardini).
// The code below is written for this app; see THIRD_PARTY_NOTICES.md.
import { jsPDF } from 'jspdf';
import { aiFooter } from './brand';
import { AlignmentType, BorderStyle, Document, Footer, HeadingLevel, Packer, Paragraph, TextRun } from 'docx';
import { track } from './analytics';
import { ACCENTS, SECTIONS, defaultSpec, type Section, type StyleSpec } from './resumeStyle';

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
/** Small grey footer on every page: AI label (+ credit). */
function stampFooter(doc: jsPDF) {
  const n = doc.getNumberOfPages(), W = doc.internal.pageSize.getWidth(), H = doc.internal.pageSize.getHeight();
  for (let i = 1; i <= n; i++) { doc.setPage(i); doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor(130); const t = aiFooter().replace('—', '-'); doc.text(t, (W - doc.getTextWidth(t)) / 2, H - 18); }
  doc.setTextColor(0);
}
const footerDocx = () => new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: aiFooter(), size: 14, color: '888888' })] })] });

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

export interface Block { key: Section; heading: string; items: { title: string; right?: string; sub?: string; bullets?: string[]; text?: string }[] }
/** Sections in the given order (default: summary, experience, skills, education, certifications, projects, languages). */
export function blocks(r: ResumeDoc, order: Section[] = defaultSpec().order): Block[] {
  const all: Partial<Record<Section, Block>> = {};
  if (r.basics.summary) all.summary = { key: 'summary', heading: 'Summary', items: [{ title: '', text: r.basics.summary }] };
  if (r.work.length) all.experience = { key: 'experience', heading: 'Experience', items: r.work.map((w) => ({ title: join(w.position, w.name), right: range(w.startDate, w.endDate), sub: w.location, bullets: w.highlights })) };
  if (r.skills.length) all.skills = { key: 'skills', heading: 'Skills', items: r.skills.map((s) => ({ title: '', text: s.name && s.keywords.length ? `${s.name}: ${s.keywords.join(', ')}` : s.name || s.keywords.join(', ') })) };
  if (r.projects.length) all.projects = { key: 'projects', heading: 'Projects', items: r.projects.map((p) => ({ title: p.name, text: p.description, bullets: p.highlights })) };
  if (r.education.length) all.education = { key: 'education', heading: 'Education', items: r.education.map((e) => ({ title: join([e.studyType, e.area].filter(Boolean).join(', '), e.institution), right: range(e.startDate, e.endDate), sub: e.score })) };
  if (r.certificates.length) all.certifications = { key: 'certifications', heading: 'Certifications', items: r.certificates.map((c) => ({ title: join(c.name, c.issuer), right: c.date })) };
  if (r.languages.length) all.languages = { key: 'languages', heading: 'Languages', items: [{ title: '', text: r.languages.map((l) => (l.fluency ? `${l.language} (${l.fluency})` : l.language)).join(', ') }] };
  const seq = [...order, ...SECTIONS.filter((x) => !order.includes(x))];
  return seq.map((k) => all[k]).filter(Boolean) as Block[];
}

/** Design tokens per template, in points. The same numbers drive the on-screen preview, the PDF and the DOCX. */
export interface Tokens { family: 'helvetica' | 'times'; css: string; docxFont: string; accent: string; nameSize: number; nameColor: string; center: boolean; labelItalic: boolean;
  headSize: number; headColor: string; headSpace: number; rule: string; ruleW: number; body: number; title: number; small: number; lead: number; gap: number; secGap: number; margin: number }
export function tokens(spec: StyleSpec = defaultSpec()): Tokens {
  const accent = ACCENTS[spec.accent] || ACCENTS.navy;
  const k = spec.density === 'compact' ? 0.78 : 1;
  const sans = { family: 'helvetica' as const, css: 'Helvetica, Arial, "Liberation Sans", sans-serif', docxFont: 'Arial' };
  if (spec.template === 'editorial') return { family: 'times', css: '"Times New Roman", Times, "Liberation Serif", serif', docxFont: 'Times New Roman', accent, nameSize: 24, nameColor: '#111111', center: true, labelItalic: true,
    headSize: 11.5, headColor: accent, headSpace: 1.2, rule: accent, ruleW: 0.6, body: 10.5, title: 10.8, small: 9.8, lead: 1.32, gap: 5 * k, secGap: 13 * k, margin: 54 };
  if (spec.template === 'compact') return { ...sans, accent, nameSize: 18, nameColor: accent, center: false, labelItalic: false,
    headSize: 9.5, headColor: '#111111', headSpace: 1, rule: '#9AA3AB', ruleW: 0.5, body: 9.4, title: 9.8, small: 8.8, lead: 1.25, gap: 3 * k, secGap: 9 * k, margin: 40 };
  return { ...sans, accent, nameSize: 22, nameColor: accent, center: false, labelItalic: false,
    headSize: 10.5, headColor: accent, headSpace: 1.1, rule: accent, ruleW: 0.8, body: 10, title: 10.5, small: 9.3, lead: 1.3, gap: 4.5 * k, secGap: 12 * k, margin: 50 };
}
const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)) as [number, number, number];

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

/** ATS-friendly PDF: real selectable text, standard fonts, one column, standard headings, one accent colour. No app branding. */
export function resumePdf(r: ResumeDoc, base: string, spec: StyleSpec = defaultSpec()) {
  const T = tokens(spec);
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const W = doc.internal.pageSize.getWidth(), H = doc.internal.pageSize.getHeight(), m = T.margin, cw = W - m * 2;
  let y = m;
  const need = (h: number) => { if (y + h > H - m) { doc.addPage(); y = m; } };
  const color = (c: string) => doc.setTextColor(...hex(c));
  const write = (s: string, size: number, style: 'normal' | 'bold' | 'italic' = 'normal', indent = 0, c = '#222222', align: 'left' | 'center' = 'left') => {
    doc.setFont(T.family, style); doc.setFontSize(size); color(c);
    for (const line of doc.splitTextToSize(s, cw - indent) as string[]) { need(size * T.lead); doc.text(line, align === 'center' ? W / 2 : m + indent, y + size, { align }); y += size * T.lead; }
  };
  const al = T.center ? 'center' : 'left';
  write(r.basics.name || 'Resume', T.nameSize, 'bold', 0, T.nameColor, al); y += 2;
  if (r.basics.label) write(r.basics.label, T.title, T.labelItalic ? 'italic' : 'normal', 0, '#333333', al);
  const contact = join(r.basics.location, r.basics.email, r.basics.phone, r.basics.url);
  if (contact) write(contact, T.small, 'normal', 0, '#555555', al);
  for (const b of blocks(r, spec.order)) {
    need(T.headSize + 30); y += T.secGap;
    doc.setFont(T.family, 'bold'); doc.setFontSize(T.headSize); color(T.headColor); doc.setCharSpace(T.headSpace);
    doc.text(b.heading.toUpperCase(), m, y + T.headSize); doc.setCharSpace(0); y += T.headSize + 3;
    doc.setDrawColor(...hex(T.rule)); doc.setLineWidth(T.ruleW); doc.line(m, y, W - m, y); y += T.gap + 2;
    for (const i of b.items) {
      if (i.title || i.right) {
        need(T.title * 1.6);
        doc.setFont(T.family, 'normal'); doc.setFontSize(T.small);
        const rw = i.right ? doc.getTextWidth(i.right) : 0;
        if (i.right) { color('#555555'); doc.text(i.right, W - m - rw, y + T.title); }
        doc.setFont(T.family, 'bold'); doc.setFontSize(T.title); color('#111111');
        const tl = doc.splitTextToSize(i.title, cw - rw - 12) as string[];
        tl.forEach((l) => { need(T.title * T.lead); doc.text(l, m, y + T.title); y += T.title * T.lead; });
      }
      if (i.sub) write(i.sub, T.small, 'italic', 0, '#555555');
      if (i.text) write(i.text, T.body);
      for (const x of i.bullets || []) {
        doc.setFont(T.family, 'normal'); doc.setFontSize(T.body); color('#222222');
        const ls = doc.splitTextToSize(x, cw - 13) as string[];
        ls.forEach((l, k) => { need(T.body * T.lead); if (!k) { color(T.accent); doc.text('•', m + 2, y + T.body); color('#222222'); } doc.text(l, m + 13, y + T.body); y += T.body * T.lead; });
      }
      y += T.gap;
    }
  }
  stampFooter(doc);
  doc.setProperties({ title: `${r.basics.name} resume`, author: r.basics.name });
  doc.save(`${base}.pdf`); track('export');
}

export async function resumeDocx(r: ResumeDoc, base: string, spec: StyleSpec = defaultSpec()) {
  const T = tokens(spec); const c = (h: string) => h.replace('#', '');
  const hp = (pt: number) => Math.round(pt * 2); const tw = (pt: number) => Math.round(pt * 20);
  const al = T.center ? AlignmentType.CENTER : AlignmentType.LEFT;
  const P: Paragraph[] = [];
  P.push(new Paragraph({ alignment: al, children: [new TextRun({ text: r.basics.name || 'Resume', bold: true, size: hp(T.nameSize), color: c(T.nameColor) })] }));
  if (r.basics.label) P.push(new Paragraph({ alignment: al, children: [new TextRun({ text: r.basics.label, italics: T.labelItalic, size: hp(T.title), color: '333333' })] }));
  const contact = join(r.basics.location, r.basics.email, r.basics.phone, r.basics.url);
  if (contact) P.push(new Paragraph({ alignment: al, children: [new TextRun({ text: contact, size: hp(T.small), color: '555555' })] }));
  for (const b of blocks(r, spec.order)) {
    P.push(new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: tw(T.secGap), after: tw(T.gap + 1) }, border: { bottom: { style: BorderStyle.SINGLE, size: Math.max(4, Math.round(T.ruleW * 8)), color: c(T.rule), space: 2 } },
      children: [new TextRun({ text: b.heading.toUpperCase(), bold: true, size: hp(T.headSize), color: c(T.headColor), characterSpacing: Math.round(T.headSpace * 20), font: T.docxFont })] }));
    for (const i of b.items) {
      if (i.title || i.right) P.push(new Paragraph({ spacing: { before: tw(T.gap) }, tabStops: [{ type: 'right' as any, position: 9600 }], children: [new TextRun({ text: i.title, bold: true, size: hp(T.title), color: '111111' }), ...(i.right ? [new TextRun({ text: `\t${i.right}`, size: hp(T.small), color: '555555' })] : [])] }));
      if (i.sub) P.push(new Paragraph({ children: [new TextRun({ text: i.sub, italics: true, size: hp(T.small), color: '555555' })] }));
      if (i.text) P.push(new Paragraph({ spacing: { after: tw(T.gap) }, children: [new TextRun({ text: i.text, size: hp(T.body), color: '222222' })] }));
      for (const x of i.bullets || []) P.push(new Paragraph({ bullet: { level: 0 }, children: [new TextRun({ text: x, size: hp(T.body), color: '222222' })] }));
    }
  }
  const mg = tw(T.margin);
  const doc = new Document({ creator: r.basics.name || 'Candidate', title: `${r.basics.name} resume`, styles: { default: { document: { run: { font: T.docxFont } } } }, sections: [{ properties: { page: { margin: { top: mg, bottom: mg, left: mg, right: mg } } }, footers: { default: footerDocx() }, children: P }] });
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
  stampFooter(doc);
  doc.save(`${base}.pdf`); track('export');
}
export async function letterDocx(text: string, forLine: string, base: string) {
  const doc = new Document({ styles: { default: { document: { run: { font: 'Calibri' } } } }, sections: [{ footers: { default: footerDocx() }, children: [
    new Paragraph({ alignment: AlignmentType.LEFT, spacing: { after: 240 }, children: [new TextRun({ text: forLine, bold: true, size: 19, color: '555555' })] }),
    ...text.replace(/\*\*(.*?)\*\*/g, '$1').split('\n').map((l) => new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text: l, size: 22 })] })),
  ] }] });
  save(await Packer.toBlob(doc), `${base}.docx`); track('export');
}
