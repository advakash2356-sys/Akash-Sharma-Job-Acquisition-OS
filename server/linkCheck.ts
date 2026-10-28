import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { ApiError } from "./handlers.js";

// Job Truth Score: is the original job link still open? Public http(s) URLs only (SSRF guard). Akash Sync Agent.
const CLOSED = /(no longer (accepting|available|open)|position (has been|is) (filled|closed)|job (is )?(not found|closed|expired)|this job has expired|posting (has )?(closed|expired)|role has been filled|applications? (are |is )?closed|vacancy (is )?closed|page not found)/i;
export function privateIp(ip: string) {
  if (ip.includes(":")) { const l = ip.toLowerCase(); return l === "::1" || l.startsWith("fc") || l.startsWith("fd") || l.startsWith("fe80") || l.startsWith("::ffff:") && privateIp(l.slice(7)) || l === "::"; }
  const [a, b] = ip.split(".").map(Number);
  return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127) || a >= 224;
}
async function safe(u: URL) {
  if (!/^https?:$/.test(u.protocol) || u.username || u.password) throw new ApiError(400, "Only public http(s) links can be checked.", "BAD_URL");
  if (u.port && !["80", "443"].includes(u.port)) throw new ApiError(400, "Only standard ports can be checked.", "BAD_URL");
  const host = u.hostname.replace(/^\[|\]$/g, "");
  const ips = isIP(host) ? [host] : (await lookup(host, { all: true })).map((r) => r.address);
  if (!ips.length || ips.some(privateIp)) throw new ApiError(400, "That address is not public.", "BAD_URL");
}
export async function checkLink(raw: string): Promise<{ alive: "live" | "dead" | "unknown"; status: number; reason: string }> {
  let u: URL; try { u = new URL(String(raw || "")); } catch { throw new ApiError(400, "Not a valid link.", "BAD_URL"); }
  for (let hop = 0; hop < 4; hop++) {
    await safe(u);
    let r: Response;
    try { r = await fetch(u, { redirect: "manual", signal: AbortSignal.timeout(8000), headers: { "user-agent": "Mozilla/5.0 (JobAcquisitionOS link check)", accept: "text/html" } }); }
    catch { return { alive: "unknown", status: 0, reason: "The site did not answer in time." }; }
    if (r.status >= 300 && r.status < 400 && r.headers.get("location")) { u = new URL(r.headers.get("location")!, u); continue; }
    if (r.status === 404 || r.status === 410) return { alive: "dead", status: r.status, reason: `The page returns ${r.status} (gone).` };
    if (r.status >= 400) return { alive: "unknown", status: r.status, reason: `The site blocked the check (${r.status}). Open it yourself.` };
    const text = (await r.text()).slice(0, 400_000).replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, " ");
    const m = text.match(CLOSED);
    return m ? { alive: "dead", status: r.status, reason: `The page says "${m[0]}".` } : { alive: "live", status: r.status, reason: "The page opens and does not say it is closed." };
  }
  return { alive: "unknown", status: 0, reason: "Too many redirects." };
}
