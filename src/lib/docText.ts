/** Reads an offer letter in the browser: PDF and DOCX text (pdf.js, mammoth), scans and photos by OCR (tesseract.js, Apache-2.0).
 *  The OCR engine and English language data are served from this site (/ocr/). Nothing is fetched from third parties; your document never leaves the device. */
import { ParseError, parseResumeFile } from './resumeParser';

async function ocr(images: (HTMLCanvasElement | File)[], onProgress?: (p: string) => void): Promise<string> {
  const { createWorker } = await import('tesseract.js');
  onProgress?.('Loading the text reader (first time about 7 MB)…');
  const worker = await createWorker('eng', 1, { workerPath: '/ocr/worker.min.js', corePath: '/ocr/', langPath: '/ocr/lang', gzip: true, workerBlobURL: false, logger: (m: any) => m?.status === 'recognizing text' && onProgress?.(`Reading the scan… ${Math.round((m.progress || 0) * 100)}%`) });
  try { const out: string[] = []; for (const im of images) out.push((await worker.recognize(im as any)).data.text); return out.join('\n\n'); }
  finally { await worker.terminate(); }
}
async function pdfPagesToCanvas(file: File, max = 10): Promise<HTMLCanvasElement[]> {
  const pdfjs = await import('pdfjs-dist');
  pdfjs.GlobalWorkerOptions.workerSrc = (await import('pdfjs-dist/build/pdf.worker.min.mjs?url')).default;
  const doc = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise; const out: HTMLCanvasElement[] = [];
  for (let i = 1; i <= Math.min(doc.numPages, max); i++) { const page = await doc.getPage(i); const vp = page.getViewport({ scale: 2 }); const c = document.createElement('canvas'); c.width = vp.width; c.height = vp.height; await page.render({ canvasContext: c.getContext('2d')!, viewport: vp, canvas: c } as any).promise; out.push(c); }
  return out;
}
export const OFFER_ACCEPT = '.pdf,.docx,.txt,.png,.jpg,.jpeg,.webp,image/*,application/pdf';
export async function readOfferFile(file: File, onProgress?: (p: string) => void): Promise<string> {
  if (file.type.startsWith('image/') || /\.(png|jpe?g|webp)$/i.test(file.name)) return ocr([file], onProgress);
  try { return await parseResumeFile(file); }
  catch (e) {
    if (e instanceof ParseError && /scan|image|selectable/i.test(e.message) && /\.pdf$/i.test(file.name)) { onProgress?.('This PDF is a scan. Reading it with OCR…'); return ocr(await pdfPagesToCanvas(file), onProgress); }
    throw e;
  }
}
