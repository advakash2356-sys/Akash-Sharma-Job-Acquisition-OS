/**
 * Official government recruitment pages read directly (t386u follow-up). Akash Sync Agent.
 * Every source here is a Government of India / State / court website. We read only job facts (post, organisation, dates,
 * official link) from public listing pages, once per cache window, identify ourselves in the user-agent and link back to
 * the official page or PDF. GIGW policy on these sites permits linking and reproducing public notices with attribution.
 *  1) Employment News "All Jobs" table (Ministry of Information & Broadcasting, employmentnews.gov.in).
 *  2) ISRO / Department of Space "All Current Opportunities" table (isro.gov.in).
 *  3) District & Sessions Courts recruitment pages on the national S3WaaS platform (<district>.dcourts.gov.in).
 *     These carry court staff posts and District Legal Services Authority (DLSA) posts such as Legal Aid Defence Counsel,
 *     panel lawyers and para-legal volunteers. Only rows that read as an OPEN call for applications are kept;
 *     results, waiting lists, joining orders, admit[- ]?cards and instructions are dropped.
 * Nothing is invented: a missing field stays empty and is shown as "see notice".
 */
import type { GovPosting } from "./govPostings.js";
/** Notices AIMED at retired staff (re-employment / engagement of retirees, pension notices) and the notice type itself come from
 *  the shared structured parser (src/lib/gov/notice.ts). Incidental mentions are kept: "Ex-Servicemen (pensioners) as Drivers",
 *  "superannuation age 60", "retired employees are not eligible", "pensioners may also apply". */
import { noticeTypeOf, retireeOnly } from "../src/lib/gov/notice.js";
export const retireeNotice = (t: string): boolean => retireeOnly(t);

export const EN_URL = "https://employmentnews.gov.in/newemp/AllJobs.aspx?k=All";
export const ISRO_URL = "https://www.isro.gov.in/ISRO_EN/ViewAllOpportunities.html";
export const S3_PATH = "/notice-category/recruitments/";

const ent = (s: string) => s.replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&#0?39;|&#8217;|&rsquo;/g, "'").replace(/&quot;|&#8220;|&#8221;/g, '"').replace(/&#8211;|&ndash;/g, "–").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
export const text = (h: string) => ent(h.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
const iso = (y: number, m: number, d: number) => { const t = new Date(Date.UTC(y, m - 1, d)); return t.getUTCDate() === d && t.getUTCMonth() === m - 1 ? t.toISOString().slice(0, 10) : ""; };
/** dd/mm/yyyy (or dd-mm-yyyy, dd.mm.yyyy) → yyyy-mm-dd. */
export const ddmmyyyy = (s: string) => { const m = s.match(/(\d{1,2})[./-](\d{1,2})[./-](20\d{2})/); return m ? iso(+m[3], +m[2], +m[1]) : ""; };
const MON = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
/** "November 09, 2026", "Sept 15,2026", "9 Nov 2026" → yyyy-mm-dd. */
export function monthDate(s: string): string {
  let m = s.match(/([A-Za-z]{3,9})\.?\s+(\d{1,2})\s*,\s*(20\d{2})/); if (m) { const i = MON.indexOf(m[1].slice(0, 3).toLowerCase()); return i < 0 ? "" : iso(+m[3], i + 1, +m[2]); }
  m = s.match(/(\d{1,2})(?:st|nd|rd|th)?\s+([A-Za-z]{3,9})\.?,?\s+(20\d{2})/); if (m) { const i = MON.indexOf(m[2].slice(0, 3).toLowerCase()); return i < 0 ? "" : iso(+m[3], i + 1, +m[1]); }
  return "";
}
const base = (p: Partial<GovPosting> & Pick<GovPosting, "id" | "title" | "org" | "lastDate" | "noticeUrl" | "source">, today: string): GovPosting => ({
  state: "", location: "", pay: "", vacancies: "", eligibility: "", official: true, postedAt: "", lesserKnown: false, verifiedAt: today, ...p,
});

// ---- 1) Employment News ----
/** Rows: issued date | organisation | post | method of appointment | last date (both dd/mm/yyyy as printed). */
export function fromEmploymentNews(html: string, today: string): GovPosting[] {
  const out: GovPosting[] = [];
  for (const row of html.match(/<tr[^>]*>[\s\S]*?<\/tr>/g) || []) {
    const c = (row.match(/<td[^>]*>[\s\S]*?<\/td>/g) || []).map(text); if (c.length < 5) continue;
    const [issued, org, post, method, last] = c; const lastDate = ddmmyyyy(last);
    if (!org || !post || !lastDate || lastDate < today) continue;
    const emp = /contract/i.test(method) ? "contract basis" : /deputation/i.test(method) ? "deputation" : "";
    out.push(base({ id: `en:${org}|${post}|${lastDate}`.toLowerCase(), title: titleCase(post), org: titleCase(org), lastDate, postedAt: ddmmyyyy(issued),
      eligibility: `Method of appointment: ${method || "see notice"}${emp ? ` (${emp})` : ""}. Full advert in Employment News; qualification as stated in the notice.`,
      noticeUrl: EN_URL, linkKind: "site", source: "Employment News (Govt of India)" }, today));
  }
  return out;
}
const KEEP_UPPER = /^(ISRO|DRDO|CSIR|ICAR|ICMR|AIIMS|IIT|NIT|IIM|NIPER|LBSNAA|BRIC|NDMA|TGT|PGT|PRT|LDC|UDC|MTS|PSU|ONGC|NTPC|BHEL|SAIL|GAIL|IOCL|HAL|BEL|DOS|M\/O|D\/O|I|II|III|IV|PVT|LTD|SC|SD|CEO|MD)$/;
export const titleCase = (s: string) => s.split(/(\s+|\(|\)|\/|-)/).map((w) => (KEEP_UPPER.test(w) ? w : w.length >= 2 && w === w.toUpperCase() ? w[0] + w.slice(1).toLowerCase() : w)).join("").replace(/\bOf\b|\bAnd\b|\bThe\b|\bFor\b|\bIn\b/g, (x) => x.toLowerCase()).replace(/^./, (x) => x.toUpperCase());

// ---- 2) ISRO / Department of Space ----
export function fromIsro(html: string, today: string): GovPosting[] {
  const out: GovPosting[] = [];
  for (const row of html.match(/<tr[^>]*>[\s\S]*?<\/tr>/g) || []) {
    const cell = (k: string) => { const m = row.match(new RegExp(`<td class="${k}"[^>]*>([\\s\\S]*?)</td>`)); return m ? text(m[1]) : ""; }; // nosemgrep: detect-non-literal-regexp -- k is a fixed class name
    const loc = cell("location"), post = cell("post"), adv = cell("advNo"), lastDate = monthDate(cell("closeDate"));
    if (!post || !lastDate || lastDate < today) continue;
    const href = row.match(/location\.href='([^']+)'/)?.[1] || row.match(/href="([^"]+\.(?:html|pdf))"/)?.[1] || "";
    const url = href ? new URL(href, ISRO_URL).toString() : ISRO_URL;
    const title = post.replace(/^(recruitment to the (posts?|positions?) of|inviting (online )?applications for the (posts?|positions?) of|application for the posts? of)\s*/i, "").replace(/\.$/, "");
    out.push(base({ id: `isro:${adv || title}`, title: title.charAt(0).toUpperCase() + title.slice(1), org: loc.replace(/\s*,\s*/g, ", "), location: loc.split(",").pop()!.trim(), lastDate,
      startDate: monthDate(cell("openDate")) || undefined, eligibility: `Advt ${adv || "see notice"}. Post-wise qualification as stated in the official advertisement.`, noticeUrl: url,
      linkKind: href ? "notice" : "site", source: "ISRO / Dept of Space careers (official)", lesserKnown: true }, today));
  }
  return out;
}

// ---- 3) District courts (S3WaaS) ----
/** Extra negatives on top of the notice type: instructions, corrigenda, forms, test notices, promotions. */
const NOT_OPEN = /\b(final list|list of (?:eligible|ineligible|selected|shortlisted|provisional\w*|qualified)|eligible applications?|result|select(?:ed|ion)? (?:list|notification|of candidates)|wait(?:ing)? ?list|merit list|joining|appointment (?:orders?|letters?)|posting orders?|receipt of appointment|resolution of applications|application (?:form|format)s?|in pursuan\w*|reg(?:arding)? appointment letters?|instructions?|intimation|addendum|corrigendum|admit[- ]?card|hall[- ]?ticket|call[- ]?letter|answer[- ]?key|interview (?:list|schedule|notice|date)|amended|typing test|skill test|qualifying test|written test|viva|document verification|provisional|shortlist|eligible candidates|ineligible|rejected|marks|cancel|postpone|promotion|by way of promotion|transfer|seniority|passing benchmark|objection|key answer)(?:s|es)?\b|पदोन्नति|परिणाम|प्रतीक्षा|चयन सूची/i;
export interface S3Site { host: string; org: string; state: string; city: string }
/** Rows: title | description | start date | end date | file. S3WaaS "end date" is the date the notice stays listed, which offices set to the application last date for recruitment notices; the UI says to confirm it in the notice. */
export function fromS3waas(html: string, site: S3Site, today: string): GovPosting[] {
  const i = html.indexOf("data-table-1"); if (i < 0) return [];
  const table = html.slice(i, html.indexOf("</table>", i)); const out: GovPosting[] = [];
  for (const row of table.match(/<tr>[\s\S]*?<\/tr>/g) || []) {
    const cells = row.match(/<td[^>]*>[\s\S]*?<\/td>/g) || []; if (cells.length < 5) continue;
    const [title, desc] = [text(cells[0]), text(cells[1])]; const start = ddmmyyyy(text(cells[2])), end = ddmmyyyy(text(cells[3]));
    const all = `${title} ${desc}`;
    // Only open calls: lists, interview calls, roll numbers, schedules, application status, appointment letters and
    // retired-only notices are not. "Recruitment of X" alone is weak evidence, kept only when nothing marks it as one of those.
    if (!end || end < today || !["open_call", "unclear"].includes(noticeTypeOf(all)) || NOT_OPEN.test(all)) continue;
    // Long-running listings (e.g. a 2023 process kept up until 2034) are not current openings.
    if (start && (Date.parse(today) - Date.parse(start)) / 864e5 > 120) continue;
    if ((Date.parse(end) - Date.parse(today)) / 864e5 > 400) continue;
    const pdf = cells[4].match(/href="(https:\/\/[^"]+)"/)?.[1] || "";
    const name = (desc && desc.length > title.length && /post|recruit|applica|engage|vacanc|appoint/i.test(desc) ? desc : title).slice(0, 180);
    // L4: S3WaaS "End Date" is when the notice stops being listed. Use a last date only when the row itself states one.
    const stated = ddmmyyyy(all.match(/last date[^0-9]{0,40}(\d{1,2}[./-]\d{1,2}[./-]20\d{2})/i)?.[1] || "");
    out.push(base({ id: `s3:${site.host}|${title}|${end}`.toLowerCase(), title: name, org: site.org, state: site.state, location: site.city, lastDate: stated && stated >= today ? stated : end, dateKind: stated && stated >= today ? "last" : "listing", startDate: start || undefined,
      eligibility: `${title !== name ? `${title}. ` : ""}${desc && desc !== name ? desc.slice(0, 200) : ""}`.trim() || "Qualification as stated in the official notice.",
      noticeUrl: pdf || `https://${site.host}${S3_PATH}`, linkKind: pdf ? "notice" : "site", source: "District Courts (eCourts S3WaaS, official)", lesserKnown: true, postedAt: start }, today));
  }
  return out;
}
const DC: [string, string, string][] = [
  // [subdomain, city label, state]
  ["patna", "Patna", "Bihar"], ["muzaffarpur", "Muzaffarpur", "Bihar"], ["saran", "Chhapra (Saran)", "Bihar"], ["begusarai", "Begusarai", "Bihar"], ["bhojpur", "Arrah (Bhojpur)", "Bihar"], ["supaul", "Supaul", "Bihar"], ["madhepura", "Madhepura", "Bihar"], ["sheikhpura", "Sheikhpura", "Bihar"], ["lakhisarai", "Lakhisarai", "Bihar"],
  ["deoghar", "Deoghar", "Jharkhand"], ["dumka", "Dumka", "Jharkhand"], ["palamu", "Daltonganj (Palamu)", "Jharkhand"],
  ["sitapur", "Sitapur", "Uttar Pradesh"], ["unnao", "Unnao", "Uttar Pradesh"], ["azamgarh", "Azamgarh", "Uttar Pradesh"], ["jalaun", "Orai (Jalaun)", "Uttar Pradesh"], ["pilibhit", "Pilibhit", "Uttar Pradesh"], ["balrampur", "Balrampur", "Uttar Pradesh"],
  ["howrah", "Howrah", "West Bengal"], ["murshidabad", "Murshidabad", "West Bengal"], ["sambalpur", "Sambalpur", "Odisha"],
  ["bilaspur", "Bilaspur", "Chhattisgarh"], ["rajnandgaon", "Rajnandgaon", "Chhattisgarh"],
  ["jabalpur", "Jabalpur", "Madhya Pradesh"], ["satna", "Satna", "Madhya Pradesh"], ["ujjain", "Ujjain", "Madhya Pradesh"], ["dewas", "Dewas", "Madhya Pradesh"], ["khandwa", "Khandwa", "Madhya Pradesh"], ["katni", "Katni", "Madhya Pradesh"],
  ["nagpur", "Nagpur", "Maharashtra"], ["nashik", "Nashik", "Maharashtra"], ["aurangabad", "Chhatrapati Sambhajinagar", "Maharashtra"], ["pune", "Pune", "Maharashtra"], ["solapur", "Solapur", "Maharashtra"], ["kolhapur", "Kolhapur", "Maharashtra"], ["sangli", "Sangli", "Maharashtra"], ["satara", "Satara", "Maharashtra"], ["ahmednagar", "Ahilyanagar", "Maharashtra"], ["jalgaon", "Jalgaon", "Maharashtra"], ["dhule", "Dhule", "Maharashtra"], ["akola", "Akola", "Maharashtra"], ["amravati", "Amravati", "Maharashtra"], ["latur", "Latur", "Maharashtra"], ["nanded", "Nanded", "Maharashtra"], ["parbhani", "Parbhani", "Maharashtra"], ["osmanabad", "Dharashiv", "Maharashtra"], ["chandrapur", "Chandrapur", "Maharashtra"], ["wardha", "Wardha", "Maharashtra"], ["ratnagiri", "Ratnagiri", "Maharashtra"], ["sindhudurg", "Sindhudurg", "Maharashtra"], ["raigad", "Alibag (Raigad)", "Maharashtra"],
  ["bengaluru", "Bengaluru", "Karnataka"], ["mysuru", "Mysuru", "Karnataka"], ["vijayapura", "Vijayapura", "Karnataka"], ["kodagu", "Madikeri (Kodagu)", "Karnataka"],
  ["chennai", "Chennai", "Tamil Nadu"], ["mahabubnagar", "Mahabubnagar", "Telangana"], ["kurnool", "Kurnool", "Andhra Pradesh"], ["westgodavari", "Eluru (West Godavari)", "Andhra Pradesh"], ["chittoor", "Chittoor", "Andhra Pradesh"],
  ["ernakulam", "Ernakulam", "Kerala"], ["pathanamthitta", "Pathanamthitta", "Kerala"], ["kannur", "Kannur", "Kerala"],
  ["chandigarh", "Chandigarh", "Chandigarh"], ["ludhiana", "Ludhiana", "Punjab"], ["bathinda", "Bathinda", "Punjab"],
  ["faridabad", "Faridabad", "Haryana"], ["ambala", "Ambala", "Haryana"], ["yamunanagar", "Yamunanagar", "Haryana"], ["jind", "Jind", "Haryana"], ["rewari", "Rewari", "Haryana"],
  ["gangtok", "Gangtok", "Sikkim"], ["dibrugarh", "Dibrugarh", "Assam"], ["jorhat", "Jorhat", "Assam"], ["cachar", "Silchar (Cachar)", "Assam"],
];
export const S3_SITES: S3Site[] = DC.map(([h, city, state]) => ({ host: `${h}.dcourts.gov.in`, org: `District & Sessions Court, ${city}`, state, city }));
