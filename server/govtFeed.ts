/**
 * Government job notices from SarkariMap's public RSS feed (https://sarkarimap.org/rss.xml).
 * The repo https://github.com/suryadev-sm/sarkari-jobs-api documents the feed as free for any feed reader or automation tool.
 * We read only titles, links, publish dates and one-line descriptions, link back to their page, and cache for 30 minutes.
 * The feed links to SarkariMap's own page (an aggregator), not to the official notice. The UI says so.
 */
const FEED = "https://sarkarimap.org/rss.xml";
const TTL = 30 * 60 * 1000;
let cached: { at: number; items: GovtItem[] } | null = null;

export interface GovtItem { id: string; title: string; url: string; postedAt: string; summary: string; lastDate: string }

const NOT_A_JOB = /\b(result|admit card|answer key|admission|time ?table|score ?card|skill test|pet\b|schedule|syllabus|seat|cut ?off|counselling|revised|date 2026|re-?check)\b/i;
const GRADUATE_ONLY = /\b(scientist|officer|engineer|professor|doctor|resident|director|manager|fellow|research|consultant|expert|lecturer|specialist|analyst|developer|faculty|medical|coordinator|associate|young professional|jrf|srf|lawyer|advocate|counsel)\b/i;

const MONTHS = "january february march april may june july august september october november december".split(" ");
/** "04 November 2026" -> 2026-11-04 (UTC, no timezone drift). */
export function dmy(day: string, month: string, year: string): string {
  const mi = MONTHS.findIndex((m) => m.startsWith(month.toLowerCase().slice(0, 3)) && month.length >= 3);
  if (mi < 0) return "";
  const d = new Date(Date.UTC(+year, mi, +day));
  return Number.isFinite(d.getTime()) ? d.toISOString().slice(0, 10) : "";
}
function parseLastDate(text: string): string {
  const m = text.match(/last date[^.]{0,60}?(\d{1,2})\s+(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{4})/i);
  if (!m) return "";
  return dmy(m[1], m[2], m[3]);
}
const unCdata = (s: string) => s.replace(/^<!\[CDATA\[|\]\]>$/g, "").trim();
const tag = (it: string, t: string) => { const m = it.match(new RegExp(`<${t}>([\\s\\S]*?)</${t}>`)); return m ? unCdata(m[1]) : ""; };

export function parseFeed(xml: string): GovtItem[] {
  return (xml.match(/<item>[\s\S]*?<\/item>/g) || []).map((it) => {
    const title = tag(it, "title"), url = tag(it, "link"), summary = tag(it, "description");
    const t = Date.parse(tag(it, "pubDate"));
    return { id: url, title, url, summary: summary.slice(0, 300), postedAt: Number.isFinite(t) ? new Date(t).toISOString().slice(0, 10) : "", lastDate: parseLastDate(summary) };
  }).filter((i) => i.title && /^https:\/\/sarkarimap\.org\//.test(i.url));
}

export async function govtNotices(education: string, now = Date.now()): Promise<GovtItem[]> {
  if (!cached || now - cached.at > TTL) {
    const ctl = new AbortController(); const timer = setTimeout(() => ctl.abort(), 9000);
    try {
      const r = await fetch(FEED, { signal: ctl.signal, headers: { accept: "application/rss+xml", "user-agent": "momentum-job-os (feed reader)" } });
      if (!r.ok) throw new Error(`SarkariMap feed answered HTTP ${r.status}`);
      cached = { at: now, items: parseFeed(await r.text()) };
    } catch (e: any) {
      throw new Error(e?.name === "AbortError" ? "SarkariMap feed did not answer within 9 seconds" : e.message || "SarkariMap feed failed");
    } finally { clearTimeout(timer); }
  }
  const lowEdu = ["8", "10", "12", "iti", "diploma"].includes(education);
  return cached.items.filter((i) => /recruitment|vacancy|bharti/i.test(i.title) && !NOT_A_JOB.test(i.title) && i.lastDate && Date.parse(i.lastDate) >= now - 86400000 && !(lowEdu && GRADUATE_ONLY.test(i.title)));
}
