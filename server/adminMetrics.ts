// Pure metrics for the admin dashboard, computed from the Sheet rows (Users, Events, Feedback). Real data only:
// any metric without enough data returns null, which the UI shows as "no data yet".
export type Row = string[];
const DAY = 86400000;
const d0 = (s: string) => { const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(s || "").replace(/^'/, "")); return m ? Date.UTC(+m[1], +m[2] - 1, +m[3]) : NaN; };
const iso = (t: number) => new Date(t).toISOString().slice(0, 10);
export const istToday = (now = Date.now()) => d0(new Date(now + 5.5 * 3600000).toISOString());
const pct = (a: number, b: number) => (b ? Math.round((a / b) * 1000) / 10 : null);

export const THEMES: [string, RegExp][] = [
  ["Job search & results", /\bjob|search|posting|listing|remote|location|result/i],
  ["Resume & documents", /\bresume|cv|cover|letter|pdf|docx|template|design/i],
  ["Bugs & errors", /\bbug|error|crash|broken|not work|doesn'?t work|fail|stuck|blank/i],
  ["Speed", /\bslow|speed|fast|loading|lag|wait/i],
  ["Mobile & layout", /\bmobile|phone|screen|layout|ui|design|button|dark/i],
  ["AI quality", /\bai\b|gemini|generated|score|fit|accura|wrong|hallucin/i],
  ["Sign-in & account", /\bsign.?in|login|log in|account|google/i],
  ["Salary", /\bsalary|pay|ctc|lpa/i],
  ["Praise", /\bgreat|love|awesome|helpful|nice|thanks|thank you|amazing|good/i],
];

export function computeMetrics(users: Row[], events: Row[], feedback: Row[], now = Date.now()) {
  const today = istToday(now);
  const ev = events.map((e) => ({ day: d0(e[1] || e[0]), email: String(e[2]).toLowerCase(), type: e[3], source: e[4] || "", detail: e[6] || "" })).filter((e) => !isNaN(e.day) && e.email);
  const activeIn = (from: number, to: number) => new Set(ev.filter((e) => e.day >= from && e.day <= to).map((e) => e.email)).size;
  const dau = activeIn(today, today), wau = activeIn(today - 6 * DAY, today), mau = activeIn(today - 29 * DAY, today);
  const wauPrev = activeIn(today - 13 * DAY, today - 7 * DAY);
  const first = new Map<string, number>();
  for (const u of users) { const t = d0(u[3]); if (!isNaN(t)) first.set(String(u[0]).toLowerCase(), t); }
  const signupsIn = (a: number, b: number) => [...first.values()].filter((t) => t >= a && t <= b).length;
  const s7 = signupsIn(today - 6 * DAY, today), sPrev = signupsIn(today - 13 * DAY, today - 7 * DAY);
  const trend = Array.from({ length: 30 }, (_, i) => { const t = today - (29 - i) * DAY; return { day: iso(t), signups: signupsIn(t, t), active: activeIn(t, t), wau: activeIn(t - 6 * DAY, t) }; });

  // Weekly cohorts (by signup week, Monday start). W1 = active 7-13 days after signup, W4 = 28-34 days.
  const byUser = new Map<string, Set<number>>();
  for (const e of ev) { if (!byUser.has(e.email)) byUser.set(e.email, new Set()); byUser.get(e.email)!.add(e.day); }
  const back = (email: string, t: number, a: number, b: number) => [...(byUser.get(email) || [])].some((d) => d >= t + a * DAY && d <= t + b * DAY);
  const weekStart = (t: number) => t - ((new Date(t).getUTCDay() + 6) % 7) * DAY;
  const cohorts = new Map<number, string[]>();
  for (const [email, t] of first) { const w = weekStart(t); if (!cohorts.has(w)) cohorts.set(w, []); cohorts.get(w)!.push(email); }
  const cohortRows = [...cohorts.entries()].sort((a, b) => b[0] - a[0]).slice(0, 8).map(([w, emails]) => {
    const ret = (a: number, b: number) => { const eligible = emails.filter((e) => first.get(e)! + b * DAY <= today); return eligible.length ? pct(eligible.filter((e) => back(e, first.get(e)!, a, b)).length, eligible.length) : null; };
    return { week: iso(w), users: emails.length, w1: ret(7, 13), w4: ret(28, 34) };
  });

  const did = (t: string) => new Set(ev.filter((e) => e.type === t).map((e) => e.email)).size;
  const funnel = [
    { step: "Signed up", users: first.size },
    { step: "Profile filled", users: did("profile_done") },
    { step: "Job viewed", users: did("job_viewed") },
    { step: "Documents generated", users: did("docs_generated") },
    { step: "Clicked apply", users: did("apply_click") },
    { step: "Marked applied", users: did("stage_applied") },
    { step: "Screening", users: did("stage_screening") },
    { step: "Interviewing", users: did("stage_interviewing") },
    { step: "Offer", users: did("stage_offer") },
    { step: "Accepted", users: did("stage_accepted") },
  ].map((s) => ({ ...s, ofSignups: pct(s.users, first.size) }));

  const channels: Record<string, number> = {};
  for (const e of ev) if (e.type === "signup") channels[e.source || "direct / unknown"] = (channels[e.source || "direct / unknown"] || 0) + 1;

  const fb = feedback.map((f) => ({ at: f[0], name: f[1], email: f[2], rating: Number(f[3]) || null, message: f[4], page: f[5], status: f[7], reply: f[8], replyAt: f[9], replyText: f[10] }));
  const themes = THEMES.map(([t, re]) => ({ theme: t, count: fb.filter((f) => re.test(f.message || "")).length })).filter((t) => t.count).sort((a, b) => b.count - a.count);
  const ratings = fb.map((f) => f.rating).filter((r): r is number => !!r);

  // Breakdowns from real rows only: latest profile_done detail per user; device class from the user agent.
  const lastDetail = new Map<string, Record<string, string>>();
  for (const e of ev) if (e.type === "profile_done" && e.detail) lastDetail.set(e.email, Object.fromEntries(e.detail.split(";").map((kv) => kv.split("=")).filter((x) => x.length === 2).map(([k, v]) => [k.trim(), v.trim()])));
  const tally = (vals: string[]) => { const m: Record<string, number> = {}; for (const v of vals) if (v) m[v] = (m[v] || 0) + 1; const out = Object.entries(m).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value })); return out.length ? out : null; };
  const details = [...lastDetail.values()];
  const device = (ua: string) => /ipad|tablet/i.test(ua) ? "Tablet" : /mobi|android|iphone/i.test(ua) ? "Mobile" : ua ? "Desktop" : "";
  const breakdowns = {
    channel: tally(ev.filter((e) => e.type === "signup").map((e) => e.source || "direct / unknown")),
    workMode: tally(details.flatMap((d) => (d.modes || "").split("+"))),
    role: tally(details.map((d) => d.role || "")),
    country: tally(details.map((d) => d.country || "")),
    device: tally(users.map((u) => device(String(u[10] || "")))),
  };
  const sentiment = ratings.length ? [{ name: "Positive (4-5)", value: ratings.filter((r) => r >= 4).length }, { name: "Neutral (3)", value: ratings.filter((r) => r === 3).length }, { name: "Negative (1-2)", value: ratings.filter((r) => r <= 2).length }].filter((x) => x.value) : null;
  const flagged = users.filter((u) => /^yes/i.test(u[8] || "")).length;
  return {
    asOf: iso(today),
    totals: { users: users.length || null, flaggedDevices: users.length ? flagged : null, visits: users.length ? users.reduce((a, u) => a + (Number(u[5]) || 0), 0) : null, feedback: fb.length || null, avgRating: ratings.length ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10 : null },
    active: ev.length ? { dau, wau, mau, stickiness: pct(dau, mau) } : null,
    growth: { signupsWoW: sPrev ? pct(s7 - sPrev, sPrev) : null, signupsThisWeek: first.size ? s7 : null, activeWoW: wauPrev ? pct(wau - wauPrev, wauPrev) : null },
    trend: first.size || ev.length ? trend : null,
    cohorts: cohortRows.length ? cohortRows : null,
    funnel: first.size ? funnel : null,
    channels: Object.keys(channels).length ? Object.entries(channels).sort((a, b) => b[1] - a[1]).map(([source, signups]) => ({ source, signups })) : null,
    themes: themes.length ? themes : null,
    breakdowns, sentiment,
    revenue: { conversion: null, mrr: null, arpu: null, note: "No payments yet. These fill in once a payment provider (Razorpay) is connected." },
    users: users.map((u) => ({ email: u[0], name: u[1], mobile: u[2], firstSeen: u[3], lastSeen: u[4], visits: Number(u[5]) || 0, devices: String(u[6] || "").split(",").filter((x) => x.trim()).length, multi: u[8] || "" })),
    feedback: fb.reverse(),
  };
}
