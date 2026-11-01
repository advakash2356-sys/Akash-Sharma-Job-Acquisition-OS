/** Escape a string for safe use inside new RegExp (semgrep regex-from-variable). Akash Sync Agent. */
export const reEscape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
