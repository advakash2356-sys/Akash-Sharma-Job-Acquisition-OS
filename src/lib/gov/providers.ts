// Country providers for Government Jobs. India is live; others are honest "coming soon" guides, never fake jobs. Akash Sync Agent.
import { IN_SOURCES, type Source } from './sources';
export type CountryCode = 'IN' | 'AU' | 'IT' | 'US';
export interface CountryJobProvider {
  code: CountryCode; name: string; flag: string; timezone: string; languages: string[]; live: boolean;
  headline: string; sub: string; sources: Source[];
  /** Plain-language notes on who can apply (summary only, not legal advice). */
  whoCanApply: string; payNote: string; howToSearch: string[];
  /** Is this URL on an official government or whitelisted public-sector domain? */
  verifyOfficialDomain(url: string): { trusted: boolean; tier: 'GOV_TLD' | 'WHITELIST_PSU' | 'UNTRUSTED' };
}
const host = (u: string) => { try { return new URL(u).hostname.toLowerCase(); } catch { return ''; } };
const onDomain = (h: string, d: string) => h === d || h.endsWith('.' + d);
export const IN_WHITELIST = ['ibps.in', 'sbi.co.in', 'rbi.org.in', 'nabard.org', 'pfrda.org.in', 'licindia.in', 'ntpc.co.in', 'ongcindia.com', 'bhel.com', 'iocl.com', 'coalindia.in', 'sailcareers.com', 'becil.com', 'edcilindia.co.in', 'careerindianairforce.cdac.in', 'samarth.edu.in', 'digialm.com'];
export function inDomain(url: string) {
  const h = host(url); if (!h || !/^https?:/.test(url)) return { trusted: false, tier: 'UNTRUSTED' as const };
  if (/\.(gov\.in|nic\.in|ac\.in|edu\.in|res\.in)$/.test(h)) return { trusted: true, tier: 'GOV_TLD' as const };
  if (IN_WHITELIST.some((d) => onDomain(h, d))) return { trusted: true, tier: 'WHITELIST_PSU' as const };
  return { trusted: false, tier: 'UNTRUSTED' as const };
}
const tld = (re: RegExp, extra: string[] = []) => (url: string) => { const h = host(url); return re.test(h) || extra.some((d) => onDomain(h, d)) ? { trusted: true, tier: 'GOV_TLD' as const } : { trusted: false, tier: 'UNTRUSTED' as const }; };
const s = (name: string, url: string, covers: string): Source => ({ name, url, covers, reach: 'ok' });

export const PROVIDERS: Record<CountryCode, CountryJobProvider> = {
  IN: { code: 'IN', name: 'India', flag: '🇮🇳', timezone: 'Asia/Kolkata', languages: ['en', 'hi'], live: true,
    headline: 'Every official government and public-sector job in India, verified, decoded and direct to source.',
    sub: 'Live vacancies across central bodies, PSUs, courts, research labs, regulators and states, with plain-English eligibility, pay where the notice states it, and direct official notices.',
    sources: IN_SOURCES,
    whoCanApply: 'Indian citizens (including NRIs with an Indian passport). Many central posts also allow subjects of Nepal/Bhutan and some others with a certificate of eligibility. OCI cardholders generally cannot apply for civil services, defence or police, but can for faculty and research posts at central universities, IITs, NITs, IISERs and AIIMS. Reserved-category benefits in state jobs need that state\'s domicile. Summary only, not legal advice.',
    payNote: 'Central posts use the 7th CPC Pay Matrix (Level 1 basic ₹18,000 to Level 10 ₹56,100, plus DA and HRA). PSUs use IDA scales; contract roles state a consolidated monthly amount.',
    howToSearch: ['Start broad: Employment News and NCS (filter Government).', 'Then the big commissions: UPSC, SSC, RRB, IBPS.', 'Mid-career or abroad: Samarth, UPSC ORA, NITI Aayog, RBI, SEBI.', 'Read the notice: advertisement number, closing date and time, crucial date for age, vacancy table by category, pay level, essential qualification, selection and how to apply.', 'Keep ready: OTR ID, photo and signature at the required KB size, 10th certificate (proof of date of birth), category certificate for this financial year, NOC if already in government.'],
    verifyOfficialDomain: inDomain },
  AU: { code: 'AU', name: 'Australia', flag: '🇦🇺', timezone: 'Australia/Sydney', languages: ['en'], live: false,
    headline: 'Australian government jobs: coming soon.', sub: 'We have not connected Australian sources yet. Use the official portals below.',
    sources: [s('APSJobs (Commonwealth)', 'https://www.apsjobs.gov.au/', 'Australian Public Service and Parliamentary Service'), s('Careers Victoria', 'https://careers.vic.gov.au/', 'Victorian Public Service'), s('SmartJobs Queensland', 'https://smartjobs.qld.gov.au/', 'Queensland Government and Health'), { name: 'I Work for NSW', url: 'https://iworkfor.nsw.gov.au/', covers: 'New South Wales agencies and Health', reach: 'slow' }],
    whoCanApply: 'Federal APS roles usually need Australian citizenship (agencies can waive it for hard-to-fill roles). State governments, public hospitals and universities often accept permanent residents and valid work visas. Summary only, not legal advice.',
    payNote: 'Classifications APS 1 to EL 2 (federal), Clerk Grades (NSW), VPS 1 to 6 (Victoria), plus superannuation.',
    howToSearch: ['Federal: APSJobs, filter by classification and location.', 'States: the state portal (NSW, VIC, QLD, WA, SA, TAS, ACT, NT).', 'Check the citizenship line in each ad.'],
    verifyOfficialDomain: tld(/\.gov\.au$/) },
  IT: { code: 'IT', name: 'Italy', flag: '🇮🇹', timezone: 'Europe/Rome', languages: ['it', 'en'], live: false,
    headline: 'Italian public-sector jobs (concorsi): coming soon.', sub: 'We have not connected Italian sources yet. Use the official portals below.',
    sources: [s('inPA (Portale del Reclutamento)', 'https://www.inpa.gov.it/', 'Single national gateway for public competitions'), s('Gazzetta Ufficiale, 4ª Serie Speciale', 'https://www.gazzettaufficiale.it/', 'Official concorsi gazette, Tuesdays and Fridays')],
    whoCanApply: 'Most non-sovereign posts are open to Italian and EU citizens, their family members with residence rights, and non-EU holders of an EU long-term residence permit or protection status. Foreign degrees need equivalence; sign-in uses SPID, CIE, CNS or eIDAS. Summary only, not legal advice.',
    payNote: 'Pay follows the national collective agreement (CCNL) of each sector; the bando states the area and grade.',
    howToSearch: ['Search inPA by region and profile.', 'Check the Gazzetta Ufficiale 4ª Serie for health, courts and universities.', 'Read each bando for requirements and deadline.'],
    verifyOfficialDomain: tld(/\.gov\.it$/, ['gazzettaufficiale.it']) },
  US: { code: 'US', name: 'United States', flag: '🇺🇸', timezone: 'America/New_York', languages: ['en'], live: false,
    headline: 'US government jobs: coming soon.', sub: 'We have not connected US sources yet. Use the official portals below.',
    sources: [s('USAJOBS', 'https://www.usajobs.gov/', 'All federal agencies'), s('GovernmentJobs.com (NEOGOV)', 'https://www.governmentjobs.com/', 'Many cities, counties, courts and states'), s('U.S. Courts careers', 'https://www.uscourts.gov/careers', 'Federal judiciary')],
    whoCanApply: 'Federal jobs generally need U.S. citizenship (including citizens abroad), with hiring paths such as Open to the public, Veterans, Military spouses, Schedule A and Pathways. State and local jobs often accept permanent residents and work-authorised residents. Summary only, not legal advice.',
    payNote: 'Federal General Schedule GS-1 to GS-15 (steps 1 to 10) plus locality pay; Wage Grade and SES separately.',
    howToSearch: ['Federal: USAJOBS, filter by hiring path and location.', 'State/local: GovernmentJobs.com or the state civil service portal.', 'Read "Who may apply" and the closing date on each announcement.'],
    verifyOfficialDomain: tld(/\.(gov|mil)$/, ['governmentjobs.com']) },
};
export const COUNTRIES = Object.values(PROVIDERS);
