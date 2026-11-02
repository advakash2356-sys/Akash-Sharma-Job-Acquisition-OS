// Title guessing without AI (pure, no browser globals, so tests can import it). Akash Sync Agent.
const TITLE_RE = /\b(manager|counsel|lead|analyst|engineer|officer|associate|executive|specialist|director|consultant|developer|designer|head|coordinator|administrator|advisor|architect|scientist|accountant)\b/i;
/** Guess job titles from resume lines, without AI. Looks for short lines that read like a title. */
export function guessTitles(resume: string): string[] {
  const out: string[] = [];
  // Tester LOW: a "Target roles:" line wins, then the current role (first title line under Experience).
  // "Target roles:" anywhere (any case), label dropped, split on , ; / |.
  const tgt = resume.match(/(?:target|desired|preferred)\s+(?:job\s+)?(?:roles?|positions?|titles?)\s*[:\-–]\s*([^\n]+)/i);
  if (tgt) { const ts = tgt[1].split(/\s*[,;|/]\s*/).map((x) => x.replace(/[.\s]+$/, '').trim()).filter((x) => x.length >= 3 && x.length <= 60).slice(0, 4); if (ts.length) return ts; }
  const exp = resume.match(/\n\s*(?:work |professional )?experience\s*:?\s*\n([\s\S]{0,600})/i);
  if (exp) for (const raw of exp[1].split('\n').slice(0, 6)) { const line = raw.replace(/^[\s•*\-–]+/, '').trim(); const t = line.split(/\s*(?:\bat\b|@|\||,|\()\s*/i)[0].replace(/\s+[-–—]\s+(?=\d|(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\b|present\b)[\s\S]*$/i, '').trim(); if (t.length >= 4 && t.length <= 60 && TITLE_RE.test(t)) { out.push(t); break; } }
  const flat = !/\n/.test(resume.slice(0, 300));
  for (const raw of flat ? [] : resume.split(/\n|(?<=[a-z])\.\s+/).slice(0, 120)) {
    const line = raw.replace(/^[\s•*\-–]+/, '').trim();
    if (line.length < 4 || line.length > 70 || !TITLE_RE.test(line) || /certif|licen[cs]|degree|diploma|bachelor|master of|universit|college|school|\b(LLB|LLM|MBA|B\.?A|B\.?Tech)\b/i.test(line)) continue;
    const t = line.split(/\s*(?:\bat\b|@|\||,|\(|\s-\s|–|—)\s*/i)[0].replace(/^(?:[A-Z]{4,}\s+)+/, '').trim();
    if (t.length >= 4 && t.length <= 50 && TITLE_RE.test(t) && !out.some((o) => o.toLowerCase() === t.toLowerCase())) out.push(t);
    if (out.length >= 3) break;
  }
  if (out.length) return out;
  // PDFs often come out as one long line. Fall back to title-like phrases near the top, e.g.
  // "Legal Operations & CLM Specialist" right after the name: a title word plus up to 4 words before it.
  const words = resume.slice(0, 1500).replace(/[|•·,;:()]/g, ' , ').split(/\s+/).filter(Boolean);
  words.forEach((w, k) => {
    if (out.length >= 3 || !(TITLE_RE.test(w) || /^(rider|driver|helper|cook|guard|technician|teacher|nurse|clerk|operator|agent|cashier|electrician|plumber|tailor|receptionist)s?$/i.test(w))) return;
    const pre: string[] = [];
    for (let b = k - 1; b >= 2 && pre.length < 4; b--) { // words 0-1 are usually the name
      const x = words[b];
      if (x === ',' || /^[A-Z]{4,}$/.test(x) || /[.@\d]/.test(x) || (!/^(&|and|of)$/i.test(x) && !/^[A-Z]/.test(x) && !/^(delivery|sales|customer|field|senior|junior|data|legal|office)$/i.test(x))) break;
      pre.unshift(x);
    }
    while (pre.length && /^(&|and|of)$/i.test(pre[0])) pre.shift();
    const t = [...pre, w].join(' ');
    if (t.length >= 4 && t.length <= 50 && !/universit|college|school|certif/i.test(t) && !out.some((o) => o.toLowerCase() === t.toLowerCase())) out.push(t);
  });
  return out;
}
