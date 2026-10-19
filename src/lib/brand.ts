export const SITE_NAME = 'Momentum';
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
  landing: ['Momentum: free job search workspace, by Akash Sync Agent', 'Find real job postings, score them against your resume, and tailor your resume, cover letters and outreach with AI. Free. Your data stays in your browser.'],
  about: ['About Momentum · Made by Akash Sync Agent', 'Who made Momentum, the licence in plain words, and the open-source parts it is built with.'],
  terms: ['Terms of use · Momentum', 'Plain-language terms for Momentum: provided as is, Google Gemini API terms apply, 18+, verify every job and AI draft.'],
  feedback: ['Share feedback · Momentum', 'Tell Akash Sync Agent what worked, what did not, and what you wish Momentum did. Post on GitHub or send a private email.'],
  privacy: ['Privacy & security · Momentum', 'What Momentum stores (only in your browser), what is sent to Google Gemini and FreeHire, and the anonymous usage counts.'],
  app: ['Your workspace · Momentum', 'Your job search workspace: jobs, resume, tailoring, outreach and interviews, saved in your browser.'],
};
