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
