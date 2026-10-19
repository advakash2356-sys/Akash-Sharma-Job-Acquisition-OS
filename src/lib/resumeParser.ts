// Parses resume files entirely in the browser. Nothing is uploaded anywhere.
export class ParseError extends Error {}

const MAX_BYTES = 15 * 1024 * 1024;
export const ACCEPT = '.pdf,.docx,.doc,.txt,.md,.markdown,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/markdown';

async function pdfText(buf: ArrayBuffer): Promise<string> {
  const pdfjs = await import('pdfjs-dist');
  const worker = (await import('pdfjs-dist/build/pdf.worker.min.mjs?url')).default;
  pdfjs.GlobalWorkerOptions.workerSrc = worker;
  let doc;
  try { doc = await pdfjs.getDocument({ data: new Uint8Array(buf) }).promise; }
  catch (e: any) {
    if (e?.name === 'PasswordException') throw new ParseError('This PDF is password-protected. Remove the password and try again.');
    throw new ParseError('This PDF could not be read. It may be corrupted; try exporting it again.');
  }
  const pages: string[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const content = await (await doc.getPage(i)).getTextContent();
    let line = '';
    const lines: string[] = [];
    for (const it of content.items as any[]) {
      line += it.str;
      if (it.hasEOL) { lines.push(line); line = ''; } else if (it.str && !/\s$/.test(it.str)) line += ' ';
    }
    if (line.trim()) lines.push(line);
    pages.push(lines.join('\n'));
  }
  return pages.join('\n\n');
}

async function docxText(buf: ArrayBuffer): Promise<string> {
  const mammoth: any = (await import('mammoth/mammoth.browser')).default;
  try { return (await mammoth.extractRawText({ arrayBuffer: buf })).value; }
  catch { throw new ParseError('This Word file could not be read. Re-save it as .docx or PDF and try again.'); }
}

const tidy = (t: string) => t.replace(/\r\n?/g, '\n').replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();

async function parseResumeFileInner(file: File): Promise<string> {
  if (file.size > MAX_BYTES) throw new ParseError('That file is over 15 MB. Use a smaller file.');
  const name = file.name.toLowerCase();
  let text: string;
  if (name.endsWith('.pdf') || file.type === 'application/pdf') {
    text = tidy(await pdfText(await file.arrayBuffer()));
    if (text.replace(/\s/g, '').length < 40) throw new ParseError('This PDF has no selectable text, so it looks like a scan or an image. Export it from Word/Google Docs as a text PDF, or paste the text instead (OCR is not supported).');
  } else if (name.endsWith('.docx')) {
    text = tidy(await docxText(await file.arrayBuffer()));
  } else if (name.endsWith('.doc')) {
    throw new ParseError('Old .doc files are not supported. Open it in Word or Google Docs and save as .docx or PDF, then upload that.');
  } else if (/\.(txt|md|markdown)$/.test(name) || file.type.startsWith('text/')) {
    text = tidy(await file.text());
  } else {
    throw new ParseError('Unsupported file type. Use PDF, DOCX, TXT or MD.');
  }
  if (text.replace(/\s/g, '').length < 20) throw new ParseError('No readable text was found in this file.');
  return text;
}

/** Same as above but never hangs: stops after 45 seconds with a clear message. */
export function parseResumeFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new ParseError('Reading this file took longer than 45 seconds and was stopped. Try a smaller file, or paste the text instead.')), 45000);
    parseResumeFileInner(file).then(resolve, reject).finally(() => clearTimeout(timer));
  });
}
