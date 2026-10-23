export const SITE_NAME = 'Job Acquisition OS';
export const SITE_URL = 'https://akash-sharma-job-acquisition-os.vercel.app';
export const CREDIT = 'Made by Akash Sync Agent';
export const COPYRIGHT = '© 2026 Akash Sync Agent (Adv. Akash Sharma)';
export const REPO = 'advakash2356-sys/Akash-Sharma-Job-Acquisition-OS';
export const OWNER_EMAIL = 'adv.akash2356@gmail.com';
/** Real numbers only. Leave null to hide the social-proof slot on the landing page. Update by hand from the analytics dashboard. */
export const PROOF: { users: number; asOf: string } | null = null;
const CREDIT_KEY = 'jaos_export_credit';
export const exportCreditOn = () => { try { return localStorage.getItem(CREDIT_KEY) !== '0'; } catch { return true; } };
export const setExportCredit = (on: boolean) => { try { localStorage.setItem(CREDIT_KEY, on ? '1' : '0'); } catch { /* ignore */ } };

/** Owner's public GoatCounter site code (not a secret). Override with VITE_GOATCOUNTER_CODE; set it to "off" to disable. */
export const GOATCOUNTER_CODE = 'akashsyncagent';

/** Pages that also have a clean public URL (served by a rewrite in vercel.json). */
export const PUBLIC_PAGES = ['about', 'terms', 'feedback', 'privacy'] as const;
/** Launch channels. Each link carries ref=<channel>, which GoatCounter records as the source of the visit. */
export const CHANNELS = ['instagram', 'youtube', 'facebook', 'linkedin', 'x', 'whatsapp'] as const;
export const CAMPAIGN = 'launch-oct26';
export const channelLink = (c: string) => `${SITE_URL}/?ref=${c}&utm_campaign=${CAMPAIGN}`;
/** Title and description per page (set at runtime; crawlers that run JS see them). */
export const PAGE_META: Record<string, [string, string]> = {
  landing: ['Job Acquisition OS: free job search, by Akash Sync Agent', 'Find real job postings, score them against your resume, and tailor resumes, cover letters and outreach with AI. Free during early access. Your resume and API key stay in your browser.'],
  about: ['About Job Acquisition OS · Made by Akash Sync Agent', 'Who made Job Acquisition OS, the licence in plain words, and the open-source parts it is built with.'],
  terms: ['Terms of use · Job Acquisition OS', 'Plain-language terms for Job Acquisition OS: provided as is, Google Gemini API terms apply, 18+, verify every job and AI draft.'],
  feedback: ['Share feedback · Job Acquisition OS', 'Tell Akash Sync Agent what worked, what did not, and what you wish Job Acquisition OS did. Post on GitHub or send a private email.'],
  privacy: ['Privacy & security · Job Acquisition OS', 'What Job Acquisition OS stores (only in your browser), what is sent to Google Gemini and FreeHire, and the anonymous usage counts.'],
  app: ['Your workspace · Job Acquisition OS', 'Your job search workspace: jobs, resume, tailoring, outreach and interviews. Your resume and jobs are saved in your browser.'],
};
