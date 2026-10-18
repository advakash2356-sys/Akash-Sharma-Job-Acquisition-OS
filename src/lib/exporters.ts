import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun, Footer, HeadingLevel } from 'docx';
import type { Job, Profile } from '../types';

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'document';
const stamp = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };

export function fileBase(profile: Profile, job: Job, kind: string) {
  return `${slug(profile.name || 'me')}-${kind}-${slug(job.company)}-${stamp()}`;
}

function save(blob: Blob, name: string) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

const clean = (t: string) => t.replace(/\*\*(.*?)\*\*/g, '$1').replace(/^#{1,6}\s*/gm, '').replace(/^\s*[*-]\s+/gm, '• ');

export function exportPdf(text: string, title: string, base: string) {
  const name = `${base}.pdf`;
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const w = doc.internal.pageSize.getWidth(), h = doc.internal.pageSize.getHeight(), m = 56;
  doc.setFont('helvetica', 'bold'); doc.setFontSize(16); doc.text(title, m, m);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(11);
  let y = m + 28;
  for (const line of doc.splitTextToSize(clean(text), w - m * 2) as string[]) {
    if (y > h - m - 20) { doc.addPage(); y = m; }
    doc.text(line, m, y); y += 16;
  }
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i); doc.setFontSize(8); doc.setTextColor(120);
    doc.text(`${name}  ·  page ${i} of ${pages}`, m, h - 28);
  }
  doc.save(name);
}

export async function exportDocx(text: string, title: string, base: string) {
  const name = `${base}.docx`;
  const doc = new Document({
    sections: [{
      footers: { default: new Footer({ children: [new Paragraph({ children: [new TextRun({ text: name, size: 16, color: '777777' })] })] }) },
      children: [
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: title, bold: true })] }),
        ...clean(text).split('\n').map((l) => new Paragraph({ spacing: { after: 100 }, children: [new TextRun(l)] })),
      ],
    }],
  });
  save(await Packer.toBlob(doc), name);
}

export interface Draft { to?: string; subject: string; body: string }

/** Unsent draft (X-Unsent: 1) that opens in a mail app for review. Nothing is sent. */
export function exportEml(d: Draft, base: string) {
  const name = `${base}.eml`;
  const body = `${d.body}\r\n\r\n--\r\n(${name})`.replace(/\r?\n/g, '\r\n');
  const eml = [`X-Unsent: 1`, `To: ${d.to || ''}`, `Subject: ${d.subject.replace(/[\r\n]+/g, ' ')}`, 'MIME-Version: 1.0', 'Content-Type: text/plain; charset=utf-8', 'Content-Transfer-Encoding: 8bit', '', body].join('\r\n');
  save(new Blob([eml], { type: 'message/rfc822' }), name);
}

/** Opens a Gmail compose window pre-filled. The user reviews and sends it themselves. */
export function gmailComposeUrl(d: Draft) {
  const q = new URLSearchParams({ view: 'cm', fs: '1', to: d.to || '', su: d.subject, body: d.body.slice(0, 1800) });
  return `https://mail.google.com/mail/?${q.toString()}`;
}
