// Official-domain trust check (playbook §7). No imports so the server can load it. Akash Sync Agent.
export const host = (u: string) => { try { return new URL(u).hostname.toLowerCase(); } catch { return ''; } };
export const onDomain = (h: string, d: string) => h === d || h.endsWith('.' + d);
export const IN_WHITELIST = ['ibps.in', 'sbi.co.in', 'rbi.org.in', 'nabard.org', 'pfrda.org.in', 'licindia.in', 'ntpc.co.in', 'ongcindia.com', 'bhel.com', 'iocl.com', 'coalindia.in', 'sailcareers.com', 'becil.com', 'edcilindia.co.in', 'careerindianairforce.cdac.in', 'samarth.edu.in', 'digialm.com'];
export function inDomain(url: string) {
  const h = host(url); if (!h || !/^https?:/.test(url)) return { trusted: false, tier: 'UNTRUSTED' as const };
  if (/\.(gov\.in|nic\.in|ac\.in|edu\.in|res\.in)$/.test(h)) return { trusted: true, tier: 'GOV_TLD' as const };
  if (IN_WHITELIST.some((d) => onDomain(h, d))) return { trusted: true, tier: 'WHITELIST_PSU' as const };
  return { trusted: false, tier: 'UNTRUSTED' as const };
}
