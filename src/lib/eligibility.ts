// Remote-work eligibility: work mode, who may apply from where, and a per-candidate decision with a reason.
// Shared by the server (filtering search results) and the browser (profile defaults, badges).
// Adapted ideas (not code), see THIRD_PARTY_NOTICES.md:
//  - JobSpy (MIT, © 2023 Cullen Watson): a posting tagged remote AND hybrid is hybrid; "Hybrid - City" style location labels;
//    schema.org TELECOMMUTE is also used for hybrid jobs, so a remote flag alone is not trusted when the text names office days.
//  - work-in-timezone (MIT, © 2019 Michal Kvasničák): "+05:30"-style UTC offsets to hours, and eligibility as an overlap of offset ranges.
//  - Himalayas Jobs API field model (locationRestrictions / timezoneRestrictions, empty = worldwide).

export type WorkMode = 'remote' | 'hybrid' | 'onsite' | 'unknown';
export type Shift = 'local' | 'us' | 'uk-eu' | 'any';

/** ISO-3166 alpha-2 codes with names and common aliases (lower case). */
const COUNTRY: [string, string, string[]][] = [
  ['IN', 'India', ['india', 'bharat', 'ind']], ['US', 'United States', ['united states', 'usa', 'u.s.', 'u.s.a.', 'us', 'america', 'united states of america']],
  ['GB', 'United Kingdom', ['united kingdom', 'uk', 'u.k.', 'great britain', 'britain', 'england', 'scotland', 'wales']], ['CA', 'Canada', ['canada']],
  ['AU', 'Australia', ['australia']], ['NZ', 'New Zealand', ['new zealand']], ['IE', 'Ireland', ['ireland']], ['FR', 'France', ['france']],
  ['DE', 'Germany', ['germany', 'deutschland']], ['NL', 'Netherlands', ['netherlands', 'holland']], ['BE', 'Belgium', ['belgium']], ['LU', 'Luxembourg', ['luxembourg']],
  ['ES', 'Spain', ['spain']], ['PT', 'Portugal', ['portugal']], ['IT', 'Italy', ['italy']], ['CH', 'Switzerland', ['switzerland']], ['AT', 'Austria', ['austria']],
  ['SE', 'Sweden', ['sweden']], ['NO', 'Norway', ['norway']], ['DK', 'Denmark', ['denmark']], ['FI', 'Finland', ['finland']], ['IS', 'Iceland', ['iceland']],
  ['PL', 'Poland', ['poland']], ['CZ', 'Czechia', ['czechia', 'czech republic']], ['SK', 'Slovakia', ['slovakia']], ['HU', 'Hungary', ['hungary']], ['RO', 'Romania', ['romania']],
  ['BG', 'Bulgaria', ['bulgaria']], ['GR', 'Greece', ['greece']], ['HR', 'Croatia', ['croatia']], ['SI', 'Slovenia', ['slovenia']], ['EE', 'Estonia', ['estonia']],
  ['LV', 'Latvia', ['latvia']], ['LT', 'Lithuania', ['lithuania']], ['CY', 'Cyprus', ['cyprus']], ['MT', 'Malta', ['malta']], ['UA', 'Ukraine', ['ukraine']],
  ['RS', 'Serbia', ['serbia']], ['TR', 'Turkey', ['turkey', 'türkiye', 'turkiye']], ['IL', 'Israel', ['israel']], ['AE', 'United Arab Emirates', ['united arab emirates', 'uae', 'dubai', 'abu dhabi']],
  ['SA', 'Saudi Arabia', ['saudi arabia', 'ksa']], ['QA', 'Qatar', ['qatar']], ['EG', 'Egypt', ['egypt']], ['ZA', 'South Africa', ['south africa']], ['NG', 'Nigeria', ['nigeria']],
  ['KE', 'Kenya', ['kenya']], ['MA', 'Morocco', ['morocco']], ['PK', 'Pakistan', ['pakistan']], ['BD', 'Bangladesh', ['bangladesh']], ['LK', 'Sri Lanka', ['sri lanka']],
  ['NP', 'Nepal', ['nepal']], ['SG', 'Singapore', ['singapore']], ['MY', 'Malaysia', ['malaysia']], ['ID', 'Indonesia', ['indonesia']], ['PH', 'Philippines', ['philippines']],
  ['TH', 'Thailand', ['thailand']], ['VN', 'Vietnam', ['vietnam', 'viet nam']], ['JP', 'Japan', ['japan']], ['KR', 'South Korea', ['south korea', 'korea']], ['CN', 'China', ['china']],
  ['HK', 'Hong Kong', ['hong kong']], ['TW', 'Taiwan', ['taiwan']], ['MX', 'Mexico', ['mexico']], ['BR', 'Brazil', ['brazil', 'brasil']], ['AR', 'Argentina', ['argentina']],
  ['CL', 'Chile', ['chile']], ['CO', 'Colombia', ['colombia']], ['PE', 'Peru', ['peru']], ['UY', 'Uruguay', ['uruguay']], ['CR', 'Costa Rica', ['costa rica']],
  ['HN', 'Honduras', ['honduras']], ['GT', 'Guatemala', ['guatemala']], ['DO', 'Dominican Republic', ['dominican republic']], ['JM', 'Jamaica', ['jamaica']],
];
export const COUNTRY_NAME: Record<string, string> = Object.fromEntries(COUNTRY.map(([c, n]) => [c, n]));
export const ALL_COUNTRIES = COUNTRY.map(([c, n]) => ({ code: c, name: n }));
const EU = ['AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE'];
const EUROPE = [...EU, 'GB', 'CH', 'NO', 'IS', 'UA', 'RS', 'TR'];
const MENA = ['AE', 'SA', 'QA', 'EG', 'MA', 'IL', 'TR'];
const AFRICA = ['ZA', 'NG', 'KE', 'EG', 'MA'];
const APAC = ['IN', 'PK', 'BD', 'LK', 'NP', 'SG', 'MY', 'ID', 'PH', 'TH', 'VN', 'JP', 'KR', 'CN', 'HK', 'TW', 'AU', 'NZ'];
const LATAM = ['MX', 'BR', 'AR', 'CL', 'CO', 'PE', 'UY', 'CR', 'HN', 'GT', 'DO', 'JM'];
export const REGIONS: Record<string, string[]> = {
  EU, Europe: EUROPE, EMEA: [...EUROPE, ...MENA, ...AFRICA], APAC, Asia: APAC.filter((c) => !['AU', 'NZ'].includes(c)), 'South Asia': ['IN', 'PK', 'BD', 'LK', 'NP'],
  LATAM, 'North America': ['US', 'CA', 'MX'], Americas: ['US', 'CA', ...LATAM], 'Middle East': MENA, Africa: AFRICA, Oceania: ['AU', 'NZ'],
};
const REGION_RE: [RegExp, string][] = [
  [/\bEMEA\b/i, 'EMEA'], [/\bAPAC\b|\bAsia[- ]Pacific\b/i, 'APAC'], [/\bLATAM\b|\bLatin America\b|\bSouth America\b|\bCentral America\b/i, 'LATAM'],
  [/\b(?:the )?EU\b|\bEuropean Union\b/, 'EU'], [/\bEurope\b|\bEuropean\b/i, 'Europe'], [/\bNorth America\b/i, 'North America'], [/\bAmericas\b/i, 'Americas'],
  [/\bSouth Asia\b/i, 'South Asia'], [/\bAsia\b/i, 'Asia'], [/\bMiddle East\b|\bMENA\b/i, 'Middle East'], [/\bAfrica\b/i, 'Africa'], [/\bOceania\b|\bANZ\b/i, 'Oceania'],
];

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const ALIAS = COUNTRY.flatMap(([c, , al]) => al.map((a) => [a, c] as [string, string])).sort((a, b) => b[0].length - a[0].length);
/** Country codes named in free text. Short aliases (us, uk, ind) only as whole upper-case words to avoid "us" the pronoun. */
export function countriesIn(text: string): string[] {
  const out = new Set<string>(); let t = ` ${text || ''} `;
  for (const [a, c] of ALIAS) {
    const re = a.length <= 3 ? new RegExp(`(?<![A-Za-z])${esc(a.toUpperCase())}(?![A-Za-z])`, 'g') : new RegExp(`\\b${esc(a)}\\b`, 'gi');
    if (re.test(t)) { out.add(c); t = t.replace(re, ' '); }
  }
  return [...out];
}
export const countryCode = (s: string): string => { const t = (s || '').trim(); if (/^[A-Z]{2}$/.test(t) && COUNTRY_NAME[t]) return t; const c = countriesIn(t); return c[0] || ''; };

const IN_CITY = /\b(delhi|new delhi|ncr|gurugram|gurgaon|noida|ghaziabad|faridabad|bengaluru|bangalore|mumbai|navi mumbai|thane|hyderabad|chennai|pune|kolkata|ahmedabad|jaipur|kochi|lucknow|chandigarh|indore|bhopal|nagpur|surat|vadodara|coimbatore|mohali|kanpur|ludhiana|mysuru|trivandrum|thiruvananthapuram|goa|haryana|karnataka|maharashtra|tamil nadu|telangana|uttar pradesh|west bengal|gujarat|rajasthan|kerala|punjab)\b/i;
const US_STATES = new Set('AL AK AZ AR CA CO CT DE FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY DC'.split(' '));
const US_STATE_NAMES = /\b(alabama|alaska|arizona|arkansas|california|colorado|connecticut|delaware|florida|georgia|hawaii|idaho|illinois|indiana|iowa|kansas|kentucky|louisiana|maine|maryland|massachusetts|michigan|minnesota|mississippi|missouri|montana|nebraska|nevada|new hampshire|new jersey|new mexico|new york|north carolina|north dakota|ohio|oklahoma|oregon|pennsylvania|rhode island|south carolina|south dakota|tennessee|texas|utah|vermont|virginia|washington|west virginia|wisconsin|wyoming|san francisco|seattle|chicago|boston|austin|los angeles)\b/i;
const OTHER_CITY: [RegExp, string][] = [[/\b(london|manchester|edinburgh)\b/i, 'GB'], [/\b(paris|lyon|marseille|toulouse)\b/i, 'FR'], [/\b(berlin|munich|hamburg|frankfurt)\b/i, 'DE'], [/\b(amsterdam|rotterdam)\b/i, 'NL'], [/\b(toronto|vancouver|montreal|ontario)\b/i, 'CA'], [/\b(sydney|melbourne)\b/i, 'AU'], [/\b(madrid|barcelona)\b/i, 'ES'], [/\b(dublin)\b/i, 'IE'], [/\b(warsaw|krakow)\b/i, 'PL'], [/\b(manila|cebu)\b/i, 'PH'], [/\b(karachi|lahore)\b/i, 'PK']];

/** Countries a posting's LOCATION field points to (where the office is, or where remote staff must be). */
export function locationCountries(location: string, codes: string[] = []): string[] {
  const loc = location || ''; const out = new Set<string>();
  const usHint = loc.split(/[;|/]| - /).some((part) => { const bits = part.split(',').map((x) => x.trim()).filter(Boolean); return bits.some((x) => /^[A-Z]{2}$/.test(x) && US_STATES.has(x) && x !== 'IN') || bits.some((x) => /^(us|usa|u\.s\.a?\.?)$/i.test(x)) || (bits.length > 1 && bits[bits.length - 1] === 'IN' && !IN_CITY.test(part)) || /^[A-Z]{2}-/.test(part.trim()); })
    || US_STATE_NAMES.test(loc.replace(/new delhi/gi, '')) || (/\b\d{5}(-\d{4})?\b/.test(loc) && !/india/i.test(loc));
  if (usHint) out.add('US');
  for (const c of countriesIn(loc.replace(/indiana/gi, ''))) if (!(c === 'IN' && usHint && !/\bindia\b/i.test(loc))) out.add(c);
  for (const [re, c] of OTHER_CITY) if (re.test(loc)) out.add(c);
  if (IN_CITY.test(loc) && !usHint) out.add('IN');
  for (const c of codes) if (/^[A-Z]{2}$/.test(c) && (COUNTRY_NAME[c] || !US_STATES.has(c)) && !(c === 'IN' && (usHint || out.size) && !out.has('IN'))) out.add(c);
  return [...out];
}

const HYBRID = /\bhybrid\b|\b(\d|one|two|three|four)\s*(?:days?|x)\s*(?:a|per|\/)?\s*week\s*(?:in|at|from)?\s*(?:the|our)?\s*(?:office|site)|\b(?:\d|one|two|three|four)\s*days?\s*(?:in|at)\s*(?:the|our)?\s*office|\bin[- ]office\s*(?:\d|one|two|three)\s*days?|\boffice\b[^.]{0,25}\b(?:\d|one|two|three|four)\s*days?\b|\bpartially remote\b|\bflexible\s*(?:remote|working)\s*(?:and|\/|&)\s*office/i;
const REMOTE = /\bremote\b|\bwork from home\b|\bwork-from-home\b|\bwfh\b|\bfully[- ]distributed\b|\bdistributed team\b|\bwork from anywhere\b|\btelecommut/i;
const ONSITE = /\bon[- ]?site\b|\bin[- ]person\b|\bwork from office\b|\bwfo\b|\bin office\b|\boffice[- ]based\b|\bmust (?:report|commute) to\b|\bfield[- ]based\b/i;

/** remote / hybrid / onsite. Hybrid wins over remote (JobSpy rule). A city with no remote words is onsite. */
export function classifyMode(j: { title?: string; location?: string; workMode?: string; description?: string }): { mode: WorkMode; why: string } {
  const head = `${j.title || ''} | ${j.location || ''} | ${j.workMode || ''}`; const desc = (j.description || '').slice(0, 6000);
  if (HYBRID.test(head) || /hybrid/i.test(j.workMode || '')) return { mode: 'hybrid', why: 'listed as hybrid' };
  const remoteHead = REMOTE.test(head) || /remote/i.test(j.workMode || '');
  const eitherWay = /\b(?:hybrid|in[- ]office)\s*(?:or|\/|and)\s*(?:fully )?remote\b|\bremote\s*(?:or|\/)\s*hybrid\b|\b(?:candidates|those|employees) (?:in|near|located (?:in|near)) [^.]{0,40}(?:area|office)[^.]{0,30}\bhybrid\b|\bif you (?:live|are located) near\b/i.test(desc);
  if (remoteHead && eitherWay) return { mode: 'remote', why: 'remote (hybrid only optional or for people near an office)' };
  if (remoteHead && HYBRID.test(desc)) return { mode: 'hybrid', why: 'says remote but the description asks for office days' };
  if (remoteHead && /\b(?:on[- ]?site|in[- ]office|work from office)\b[^.]{0,40}\b(required|mandatory|only)\b/i.test(desc)) return { mode: 'onsite', why: 'description requires on-site work' };
  if (remoteHead) return { mode: 'remote', why: 'listed as remote' };
  if (ONSITE.test(head) || /onsite|on-site|office/i.test(j.workMode || '')) return { mode: 'onsite', why: 'listed as on-site' };
  if (HYBRID.test(desc)) return { mode: 'hybrid', why: 'description asks for office days' };
  if (/\b(?:this is a |fully |100% )remote (?:role|position|job)\b|\bremote[- ]first\b|\bwork from anywhere\b/i.test(desc)) return { mode: 'remote', why: 'description says the role is remote' };
  if ((j.location || '').trim() && !/^(anywhere|worldwide|global)$/i.test((j.location || '').trim())) return { mode: 'onsite', why: 'has an office location and no remote wording' };
  return { mode: 'unknown', why: 'no location or work-mode information' };
}

export interface Eligibility {
  worldwide: boolean; countries: string[]; regions: string[];
  /** Allowed UTC offsets in hours (e.g. -8..-5 for US time zones), when the posting states them. */
  tz: { min: number; max: number } | null;
  /** Countries where the posting requires the right to work. */
  authRequired: string[]; noSponsorship: boolean; contractorOk: boolean;
  /** Nothing stated about where remote staff may live. Shown, flagged, never hidden. */
  unclear: boolean; evidence: string[];
}

/** "+05:30" -> 5.5 (adapted from work-in-timezone's offsetToHours). */
export function offsetToHours(off: string): number { const m = String(off).match(/([+-]?)(\d{1,2})(?::?(\d{2}))?/); if (!m) return NaN; const h = Number(m[2]) + Number(m[3] || 0) / 60; return m[1] === '-' ? -h : h; }
const TZ_ABBR: Record<string, number> = { PST: -8, PDT: -7, PT: -8, MST: -7, MDT: -6, MT: -7, CST: -6, CDT: -5, CT: -6, EST: -5, EDT: -4, ET: -5, GMT: 0, UTC: 0, BST: 1, CET: 1, CEST: 2, EET: 2, IST: 5.5, SGT: 8, AEST: 10, JST: 9 };

/** Who may apply from where, from structured fields first, then the location and description text. */
export function extractEligibility(j: { location?: string; description?: string; title?: string; locationRestrictions?: string[]; timezoneRestrictions?: number[]; mode: WorkMode; countryCodes?: string[] }): Eligibility {
  const loc = j.location || ''; const d = (j.description || '').replace(/\s+/g, ' ').slice(0, 8000); const all = `${j.title || ''} . ${loc} . ${d}`;
  const ev: string[] = []; const countries = new Set<string>(); const regions = new Set<string>(); let worldwide = false;
  if (Array.isArray(j.locationRestrictions)) {
    if (!j.locationRestrictions.length) { worldwide = true; ev.push('source lists no location restriction (worldwide)'); }
    for (const r of j.locationRestrictions) { const c = countryCode(r); if (c) countries.add(c); else { const rg = REGION_RE.find(([re]) => re.test(r)); if (rg) regions.add(rg[1]); } }
    if (j.locationRestrictions.length) ev.push(`source restricts to: ${j.locationRestrictions.slice(0, 6).join(', ')}`);
  }
  if (/\b(?:work from )?anywhere(?: in the world)?\b|\bworldwide\b|\bglobal(?:ly)? remote\b|\bremote[- ]global\b|\bany (?:country|location|timezone)\b|\bfrom any country\b/i.test(`${loc} ${d}`) && !/\banywhere in (?!the world)(?:the )?(?!world)\w+/i.test(`${loc} ${d}`)) { worldwide = true; ev.push('says worldwide / anywhere'); }
  // "Remote - US", "Remote (Canada)", "US only", "must be based/located/residing in X", "open to candidates in X"
  const tp = (j.title || '').match(/\(([^)]{2,40})\)|[-–|]\s*([A-Z][A-Za-z ]{1,30}?)\s*(?:only)?$/);
  if (tp && j.mode !== 'onsite') { const cs = countriesIn(tp[1] || tp[2] || ''); if (cs.length) { cs.forEach((c) => countries.add(c)); ev.push(`title names ${cs.join(', ')}`); } }
  if (j.mode !== 'onsite') {
    for (const c of locationCountries(loc.replace(/\bremote\b/gi, ' '), j.countryCodes || [])) { countries.add(c); }
    if (countries.size && !j.locationRestrictions) ev.push(`location field: ${loc.slice(0, 60)}`);
  }
  const only = [...all.matchAll(/\b([A-Z][A-Za-z.]+(?: [A-Z][a-z]+)?)[- ](?:only|based only)\b|\b(?:must|need to|should|required to) (?:be )?(?:currently )?(?:based|located|living|reside|residing|resident) (?:in|within) (?:the )?([A-Z][A-Za-z. ]{1,30}?)(?=[.,;:)]| or | and |$)|\b(?:open|available) (?:only )?to (?:candidates|applicants|residents|people) (?:based |located |residing )?in (?:the )?([A-Z][A-Za-z. ]{1,30}?)(?=[.,;:)]| or | and |$)/g)];
  for (const m of only) { const txt = m[1] || m[2] || m[3] || ''; const cs = countriesIn(txt); const rg = REGION_RE.filter(([re]) => re.test(txt)).map(([, r]) => r); if (cs.length || rg.length) { cs.forEach((c) => countries.add(c)); rg.forEach((r) => regions.add(r)); ev.push(`"${m[0].trim().slice(0, 70)}"`); worldwide = false; } }
  if (j.mode !== 'onsite') for (const [re, r] of REGION_RE) { const m = `${loc} ${d.slice(0, 1500)}`.match(re); if (m && new RegExp(`(remote|based|located|candidates|within|across|from)[^.]{0,40}${esc(m[0])}|${esc(m[0])}[^.]{0,20}(only|time ?zones?|hours|based|remote)`, 'i').test(`${loc} ${d}`)) { regions.add(r); ev.push(`region: ${m[0]}`); } }
  const auth = [...all.matchAll(/\b(?:legally )?(?:authori[sz]ed|eligible|permitted|right) to work (?:in|for) (?:the )?([A-Z][A-Za-z. ]{1,30}?)(?=[.,;:)]| without| on | or | and |$)/g)];
  const authRequired = [...new Set(auth.flatMap((m) => countriesIn(m[1])))];
  if (authRequired.length) ev.push(`requires work authorisation in ${authRequired.join(', ')}`);
  if (/\bus citizens? (?:only|required)\b|\bmust be a (?:us|u\.s\.) citizen\b|\bsecurity clearance\b|\bgreen card\b/i.test(all) && !authRequired.includes('US')) { authRequired.push('US'); ev.push('US citizenship / clearance required'); }
  const noSponsorship = /\b(?:no|not|unable to|cannot|can't|will not|won't|do not|does not)\s+(?:offer |provide |currently )?(?:visa )?sponsor/i.test(all) || /\bsponsorship (?:is )?not (?:available|provided|offered)\b/i.test(all);
  if (noSponsorship) ev.push('no visa sponsorship');
  const contractorOk = /\b(?:independent )?contractor\b|\bemployer of record\b|\bEOR\b|\b(?:via|through) (?:deel|remote\.com|oyster|multiplier|rippling)\b|\bB2B contract\b|\bfreelance\b/i.test(all);
  if (contractorOk) ev.push('contractor / EOR hiring mentioned');
  let tz: Eligibility['tz'] = null;
  if (Array.isArray(j.timezoneRestrictions) && j.timezoneRestrictions.length) { const v = j.timezoneRestrictions.filter((x) => typeof x === 'number' && x > -13 && x < 13); if (v.length) tz = { min: Math.min(...v), max: Math.max(...v) }; }
  const tzm = all.match(/\b(?:UTC|GMT)\s*([+-]\s*\d{1,2}(?::\d{2})?)\s*(?:to|-|–|and)\s*(?:UTC|GMT)?\s*([+-]\s*\d{1,2}(?::\d{2})?)/i);
  if (!tz && tzm) { const a = offsetToHours(tzm[1].replace(/\s/g, '')), b = offsetToHours(tzm[2].replace(/\s/g, '')); if (Number.isFinite(a) && Number.isFinite(b)) tz = { min: Math.min(a, b), max: Math.max(a, b) }; }
  if (!tz) { const ab = [...all.matchAll(/\b(PST|PDT|PT|MST|MDT|MT|CST|CDT|CT|EST|EDT|ET|GMT|BST|CET|CEST|EET|IST|SGT|AEST|JST)\b/g)].map((m) => TZ_ABBR[m[1]]).filter((x) => x !== undefined);
    if (ab.length && /(time ?zones?|hours|overlap|working|shift|business)/i.test(all)) tz = { min: Math.min(...ab), max: Math.max(...ab) }; }
  if (!tz && /\b(?:US|U\.S\.|American|North American) (?:time ?zones?|hours|business hours|shift)\b/i.test(all)) tz = { min: -8, max: -5 };
  if (!tz && /\b(?:European|EU|CET|UK) (?:time ?zones?|hours|business hours)\b/i.test(all)) tz = { min: 0, max: 2 };
  if (tz) ev.push(`time zones UTC${tz.min >= 0 ? '+' : ''}${tz.min} to UTC${tz.max >= 0 ? '+' : ''}${tz.max}`);
  const unclear = j.mode !== 'onsite' && !worldwide && !countries.size && !regions.size;
  return { worldwide: worldwide && !countries.size && !regions.size, countries: [...countries], regions: [...regions], tz, authRequired, noSponsorship, contractorOk, unclear, evidence: ev.slice(0, 6) };
}

export interface Candidate {
  residence: string; city?: string; authorizedIn: string[]; relocate: boolean; relocateCountries: string[];
  modes: WorkMode[]; shift: Shift; tzOffset: number;
}
export type DecisionKind = 'local' | 'relocate' | 'remote-ok' | 'remote-unclear' | 'hidden';
export interface Decision { show: boolean; kind: DecisionKind; badge: string; reason: string }

const name = (c: string) => COUNTRY_NAME[c] || c;
const HOME_TZ: Record<string, number> = { IN: 5.5, US: -6, GB: 0, IE: 0, FR: 1, DE: 1, NL: 1, ES: 1, IT: 1, PL: 1, PT: 0, CA: -5, AU: 10, SG: 8, AE: 4, PH: 8, PK: 5, BR: -3, MX: -6 };
export const homeTz = (c: string) => HOME_TZ[c] ?? (EUROPE.includes(c) ? 1 : 0);
const SHIFT_TZ: Record<Shift, { min: number; max: number } | null> = { local: null, us: { min: -8, max: -4 }, 'uk-eu': { min: 0, max: 2 }, any: null };

/** Can this candidate apply, and why. Never invents facts: only what the posting states and what the candidate entered. */
export function decide(j: { location?: string; countryCodes?: string[] }, mode: WorkMode, el: Eligibility, c: Candidate): Decision {
  const home = c.residence; const can = new Set([home, ...c.authorizedIn]);
  if (mode === 'onsite' || mode === 'hybrid' || mode === 'unknown') {
    const where = locationCountries(j.location || '', j.countryCodes || []).concat(el.countries).filter((x, i, a) => a.indexOf(x) === i);
    const label = mode === 'hybrid' ? 'Hybrid' : mode === 'onsite' ? 'On-site' : 'Location';
    if (!c.modes.includes(mode === 'unknown' ? 'onsite' : mode) && !(mode === 'unknown' && c.modes.includes('hybrid'))) return { show: false, kind: 'hidden', badge: `${label}: hidden`, reason: `You chose ${c.modes.join('/') || 'no'} work only.` };
    if (!where.length) return { show: true, kind: 'remote-unclear', badge: `${label} - country unclear`, reason: `The posting does not say which country this ${label.toLowerCase()} role is in. Check before applying.` };
    if (where.includes(home)) { const near = c.city && (j.location || '').toLowerCase().includes(c.city.toLowerCase()); return { show: true, kind: 'local', badge: `${label} - ${near ? c.city : name(home)}`, reason: `${label} role in ${near ? `${c.city}, ` : ''}${name(home)}, where you live.` }; }
    const ok = where.find((w) => can.has(w) && c.relocate);
    if (ok) return { show: true, kind: 'relocate', badge: `${label} - ${name(ok)} (relocation)`, reason: `In ${name(ok)}; you are authorised to work there and open to relocating.` };
    const rel = where.find((w) => c.relocate && c.relocateCountries.includes(w));
    if (rel) return { show: true, kind: 'relocate', badge: `${label} - ${name(rel)} (relocation, visa needed)`, reason: `In ${name(rel)}, where you would relocate. You have not said you are authorised to work there${el.noSponsorship ? ' and the posting says it does not sponsor visas' : ''}.` };
    return { show: false, kind: 'hidden', badge: `${label} in ${where.map(name).join('/')}: hidden`, reason: `${label} role in ${where.map(name).join(', ')}; you live in ${name(home)} and have not chosen to relocate there.` };
  }
  // remote
  if (!c.modes.includes('remote')) return { show: false, kind: 'hidden', badge: 'Remote: hidden', reason: 'You did not choose remote work in your profile.' };
  const missingAuth = el.authRequired.filter((x) => !can.has(x));
  if (missingAuth.length) return { show: false, kind: 'hidden', badge: `Remote - ${missingAuth.map(name).join('/')} work authorisation required: hidden`, reason: `The posting requires the right to work in ${missingAuth.map(name).join(', ')}, which you have not listed.` };
  let ok = false; let why = '';
  if (el.worldwide) { ok = true; why = 'worldwide'; }
  if (el.countries.length) { const hit = el.countries.find((x) => can.has(x)); ok = !!hit; why = hit ? `accepts ${name(hit)}` : `${el.countries.map(name).join('/')} only`; }
  if (!ok && el.regions.length) { const r = el.regions.find((rg) => (REGIONS[rg] || []).some((x) => can.has(x))); if (r) { ok = true; why = `${r} (includes ${name(home)})`; } else if (!el.countries.length) why = `${el.regions.join('/')} only`; }
  if (el.unclear) {
    return { show: true, kind: 'remote-unclear', badge: 'Remote - eligibility unclear', reason: 'Remote, but the posting does not say which countries can apply. Check before applying.' + tzNote(el, c) };
  }
  if (!ok) return { show: false, kind: 'hidden', badge: `Remote - ${why}: hidden`, reason: `Remote, but only for ${why.replace(/ only$/, '')}; you live in ${name(home)}.${el.contractorOk ? ' (It mentions contractors, but not your country.)' : ''}` };
  return { show: true, kind: 'remote-ok', badge: `Remote - ${why === 'worldwide' ? `worldwide, accepts ${name(home)}` : why}`, reason: `Remote and open to people in ${name(home)} (${why}).${el.contractorOk ? ' Contractor/EOR hiring mentioned.' : ''}` + tzNote(el, c) };
}
function tzNote(el: Eligibility, c: Candidate) {
  if (!el.tz) return '';
  const want = SHIFT_TZ[c.shift]; const own = c.tzOffset;
  const fmt = (n: number) => `UTC${n >= 0 ? '+' : ''}${n}`;
  const span = `${fmt(el.tz.min)} to ${fmt(el.tz.max)}`;
  if (want && el.tz.max >= want.min && el.tz.min <= want.max) return ` Hours: ${span}, matches your ${c.shift === 'us' ? 'US shift' : 'UK/EU shift'} preference${c.shift === 'us' && own > 3 ? ' (night shift where you live)' : ''}.`;
  const inside = own >= el.tz.min - 1 && own <= el.tz.max + 1;
  return inside ? ` Hours: ${span}, close to your time zone.` : ` Hours: ${span}, about ${Math.round(Math.min(Math.abs(own - el.tz.min), Math.abs(own - el.tz.max)))} h from your time zone${c.shift === 'local' ? '; set your shift preference if you can work those hours' : ''}.`;
}

const HANDS_ON = /driver|rider|delivery|helper|warehouse|guard|cook|electrician|plumber|operator|technician|mechanic|packer|loader|housekeeping|nurse|teacher|tailor|welder|fitter|carpenter/i;
/** Defaults from the resume and profile; the user can change every field. Remote is off by default for hands-on roles. */
export function inferCandidate(p: { location?: string; resumeText?: string; targetRoles?: string; headline?: string; elig?: Partial<Candidate> }): Candidate {
  const loc = p.location || (p.resumeText || '').split('\n').slice(0, 8).join(' ');
  const home = locationCountries(loc)[0] || countriesIn(loc)[0] || 'IN';
  const city = (p.location || '').split(',')[0].trim();
  const hands = HANDS_ON.test(`${p.targetRoles || ''} ${p.headline || ''}`) || (!p.targetRoles && HANDS_ON.test((p.resumeText || '').slice(0, 300)));
  const wantsUsShift = /\b(us|u\.s\.|american|night)\s*(shift|hours|time ?zone)/i.test(p.resumeText || '');
  const base: Candidate = { residence: home, city: city && !countriesIn(city).length ? city : '', authorizedIn: [home], relocate: false, relocateCountries: [], modes: hands ? ['onsite', 'hybrid'] : ['onsite', 'hybrid', 'remote'], shift: wantsUsShift ? 'us' : 'local', tzOffset: homeTz(home) };
  const e = p.elig || {};
  const cc = (xs: unknown) => (Array.isArray(xs) ? xs.map((x) => countryCode(String(x))).filter(Boolean) : []);
  return {
    residence: countryCode(String(e.residence || '')) || base.residence, city: typeof e.city === 'string' ? e.city : base.city,
    authorizedIn: e.authorizedIn ? [...new Set(cc(e.authorizedIn))] : base.authorizedIn, relocate: typeof e.relocate === 'boolean' ? e.relocate : base.relocate,
    relocateCountries: e.relocateCountries ? cc(e.relocateCountries) : base.relocateCountries,
    modes: Array.isArray(e.modes) ? (e.modes.filter((m) => ['remote', 'hybrid', 'onsite'].includes(m as string)) as WorkMode[]) : base.modes,
    shift: ['local', 'us', 'uk-eu', 'any'].includes(e.shift as string) ? (e.shift as Shift) : base.shift,
    tzOffset: typeof e.tzOffset === 'number' && Math.abs(e.tzOffset) <= 14 ? e.tzOffset : homeTz(countryCode(String(e.residence || '')) || base.residence),
  };
}
