/**
 * SSRF guard for server-side fetches of official notice PDFs. Every hop's host is resolved with DNS first and refused when ANY
 * address is private, loopback, link-local, CGNAT, multicast, reserved or documentation space (IPv4 and IPv6, IPv4-mapped and
 * NAT64 forms included). The real transport (pinnedFetch) also validates the address at connect time through the socket's
 * lookup hook, so a DNS answer that changes between the check and the connection (rebinding) is refused too. Akash Sync Agent.
 */
import { lookup as dnsLookup } from "node:dns";
import { lookup as dnsLookupP } from "node:dns/promises";
import { request } from "node:https";
import { isIP } from "node:net";

const v4n = (ip: string) => ip.split(".").reduce((a, b) => (a << 8) + Number(b), 0) >>> 0;
const V4_BLOCKS: [string, number][] = [["0.0.0.0", 8], ["10.0.0.0", 8], ["100.64.0.0", 10], ["127.0.0.0", 8], ["169.254.0.0", 16], ["172.16.0.0", 12], ["192.0.0.0", 24], ["192.0.2.0", 24], ["192.88.99.0", 24], ["192.168.0.0", 16], ["198.18.0.0", 15], ["198.51.100.0", 24], ["203.0.113.0", 24], ["224.0.0.0", 4], ["240.0.0.0", 4]];
function v4Private(ip: string): boolean { const n = v4n(ip); return V4_BLOCKS.some(([b, bits]) => ((n ^ v4n(b)) >>> (32 - bits)) === 0); }
function v6Words(ip: string): number[] | null {
  let s = ip.toLowerCase().replace(/^\[|\]$/g, "").replace(/%.*$/, "");
  const tail = s.match(/(\d+\.\d+\.\d+\.\d+)$/); if (tail) { const n = v4n(tail[1]); s = s.slice(0, -tail[1].length) + `${(n >>> 16).toString(16)}:${(n & 0xffff).toString(16)}`; }
  const [h, t] = s.split("::"); const hw = h ? h.split(":") : []; const tw = t !== undefined ? (t ? t.split(":") : []) : [];
  const fill = t !== undefined ? 8 - hw.length - tw.length : 0; if (fill < 0) return null;
  const w = [...hw, ...Array(fill).fill("0"), ...tw].map((x) => parseInt(x || "0", 16)); return w.length === 8 && w.every((x) => x >= 0 && x <= 0xffff) ? w : null;
}
/** true for any address a server must never fetch from (fail-closed: anything unparseable counts as private). */
export function isPrivateIp(ip: string): boolean {
  const kind = isIP(ip.replace(/^\[|\]$/g, "").replace(/%.*$/, ""));
  if (kind === 4) return v4Private(ip);
  if (kind !== 6) return true;
  const w = v6Words(ip); if (!w) return true;
  if (w.every((x) => x === 0)) return true; // ::
  if (w.slice(0, 7).every((x) => x === 0) && w[7] === 1) return true; // ::1
  const v4of = (a: number, b: number) => `${a >> 8}.${a & 255}.${b >> 8}.${b & 255}`;
  if (w.slice(0, 5).every((x) => x === 0) && (w[5] === 0xffff || w[5] === 0)) return v4Private(v4of(w[6], w[7])); // ::ffff:a.b.c.d, ::a.b.c.d
  if (w[0] === 0x64 && w[1] === 0xff9b) return v4Private(v4of(w[6], w[7])); // NAT64
  if ((w[0] & 0xfe00) === 0xfc00) return true; // fc00::/7 unique local
  if ((w[0] & 0xffc0) === 0xfe80 || (w[0] & 0xffc0) === 0xfec0) return true; // link-local, site-local
  if ((w[0] & 0xff00) === 0xff00) return true; // multicast
  if (w[0] === 0x2001 && w[1] === 0x0db8) return true; // documentation
  if (w[0] === 0x0100 && w[1] === 0 && w[2] === 0 && w[3] === 0) return true; // discard
  if (w[0] === 0x2002) return v4Private(v4of(w[1], w[2])); // 6to4
  return false;
}
export type Resolver = (host: string) => Promise<string[]>;
export const resolveHost: Resolver = async (host) => (await dnsLookupP(host, { all: true, verbatim: true })).map((a) => a.address);
/** Resolves the host and throws PRIVATE_ADDRESS when it has no address or any address is non-public. */
export async function assertPublicHost(host: string, resolve: Resolver = resolveHost): Promise<void> {
  if (isIP(host.replace(/^\[|\]$/g, ""))) throw Object.assign(new Error("IP-literal hosts are not fetched."), { code: "PRIVATE_ADDRESS" });
  let addrs: string[]; try { addrs = await resolve(host); } catch { throw Object.assign(new Error("Host did not resolve."), { code: "PRIVATE_ADDRESS" }); }
  if (!addrs.length || addrs.some(isPrivateIp)) throw Object.assign(new Error("Host resolves to a non-public address."), { code: "PRIVATE_ADDRESS" });
}
/** Socket lookup hook: the address actually connected to is validated too (closes the DNS-rebinding window). */
function guardedLookup(host: string, opts: any, cb: (...a: any[]) => void) {
  dnsLookup(host, { ...opts, verbatim: true }, (err: any, address: any, family?: number) => {
    if (err) return cb(err);
    const list: { address: string; family: number }[] = Array.isArray(address) ? address : [{ address, family: family! }];
    if (!list.length || list.some((a) => isPrivateIp(a.address))) return cb(Object.assign(new Error("Non-public address refused."), { code: "PRIVATE_ADDRESS" }));
    return Array.isArray(address) ? cb(null, list) : cb(null, list[0].address, list[0].family);
  });
}
/** Minimal fetch over node:https with the guarded lookup; never follows redirects (the caller re-validates every hop). */
export const pinnedFetch = ((input: any, init: any = {}) => new Promise<Response>((resolve, reject) => {
  const u = new URL(String(input)); if (u.protocol !== "https:") return reject(new Error("https only"));
  const req = request(u, { method: "GET", headers: { ...(init.headers || {}), "Accept-Encoding": "identity" }, lookup: guardedLookup as any, signal: init.signal }, (res) => {
    const status = res.statusCode || 0; const headers = new Headers(); for (const [k, v] of Object.entries(res.headers)) if (v !== undefined) headers.set(k, Array.isArray(v) ? v.join(", ") : String(v));
    if (status >= 300 && status < 400) { res.resume(); return resolve(new Response(null, { status, headers })); }
    const chunks: Buffer[] = []; let n = 0; const cap = Number(init.maxBytes || 6 * 1024 * 1024) + 1;
    res.on("data", (c: Buffer) => { n += c.length; if (n > cap) { res.destroy(); return; } chunks.push(c); });
    res.on("end", () => resolve(new Response(status === 204 || status === 304 ? null : Buffer.concat(chunks), { status: status < 200 || status > 599 ? 502 : status, headers })));
    res.on("error", reject); res.on("close", () => { if (n > cap) resolve(new Response(null, { status: 413 })); });
  });
  req.on("error", reject); req.end();
})) as typeof fetch;
