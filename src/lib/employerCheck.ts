/** Employer Reality Check: link-outs to official registers and simple format checks. No scraping, nothing fetched. Akash Sync Agent. */
export const CIN_RE = /^[LU]\d{5}[A-Z]{2}\d{4}(PLC|PTC|OPC|NPL|GOI|SGC|FLC|FTC|GAP|GAT|ULL|ULT)\d{6}$/;
export const GSTIN_RE = /^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
export function checkCin(cin: string) {
  const c = (cin || '').trim().toUpperCase(); if (!c) return null;
  if (!CIN_RE.test(c)) return { ok: false, note: 'This is not a valid CIN format (21 characters, e.g. U72200KA2015PTC123456). Ask for the correct one.' };
  return { ok: true, note: `Format is valid: ${c[0] === 'L' ? 'listed' : 'unlisted'} company, state ${c.slice(6, 8)}, registered ${c.slice(8, 12)}, type ${c.slice(12, 15)}. Now confirm it on MCA.` };
}
export function checkGstin(g: string) {
  const s = (g || '').trim().toUpperCase(); if (!s) return null;
  return GSTIN_RE.test(s) ? { ok: true, note: 'Format is valid. Confirm the legal name on the GST portal.' } : { ok: false, note: 'Not a valid GSTIN format (15 characters).' };
}
const q = encodeURIComponent;
export function lookups(company: string, website = '') {
  const n = company.trim();
  return [
    { label: 'MCA company master data (official)', href: 'https://www.mca.gov.in/content/mca/global/en/mca/master-data/MDS.html', tip: 'Search the name or CIN. Check status is "Active" and the address matches.' },
    { label: 'GST taxpayer search (official)', href: 'https://services.gst.gov.in/services/searchtp', tip: 'Enter the GSTIN from the offer or invoice.' },
    { label: 'EPFO establishment search (official)', href: 'https://unifiedportal-emp.epfindia.gov.in/publicPortal/no-auth/misReport/home/loadEstSearchHome', tip: 'Real employers with 20+ staff are usually registered.' },
    { label: 'Search for complaints', href: `https://www.google.com/search?q=${q(`"${n}" fraud OR scam OR complaint`)}`, tip: 'Look for patterns, not one angry post.' },
    ...(website ? [{ label: 'Who owns the website domain (WHOIS)', href: `https://lookup.icann.org/en/lookup?name=${q(website.replace(/^https?:\/\//, '').split('/')[0])}`, tip: 'A domain created a few weeks ago for a "big company" is a warning sign.' }] : []),
  ];
}
