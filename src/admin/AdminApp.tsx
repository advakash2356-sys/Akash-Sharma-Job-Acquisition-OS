import React, { useEffect, useMemo, useRef, useState } from 'react';
import { getSession, renderTokenButton } from '../lib/googleAuth';
import '../index.css';

type M = any;
const NoData = () => <span className="text-muted-foreground">no data yet</span>;
const val = (v: unknown, suffix = '') => (v === null || v === undefined ? <NoData /> : <>{String(v)}{suffix}</>);
const Box = ({ t, children, id }: { t: string; children: React.ReactNode; id?: string }) => (
  <section data-testid={id} className="rounded-2xl border border-border bg-card-solid p-5"><h2 className="mb-3 text-xl font-semibold">{t}</h2>{children}</section>
);
const Stat = ({ k, v }: { k: string; v: React.ReactNode }) => <div className="rounded-xl bg-muted/50 p-3"><div className="text-xs text-muted-foreground">{k}</div><div className="text-2xl font-semibold">{v}</div></div>;

function NotFound() {
  return (
    <div data-testid="admin-404" className="grid min-h-screen place-items-center bg-background text-center">
      <div><p className="label text-muted-foreground">404</p><h1 className="display mt-2 text-6xl">Off the path.</h1><p className="mt-4 text-muted-foreground">That page does not exist. Your data is untouched.</p>
        <a href="/" className="mt-8 inline-block rounded-full bg-primary px-6 py-3 font-medium text-primary-foreground">Back to the dashboard</a></div>
    </div>
  );
}

function Bars({ data }: { data: { day: string; signups: number; active: number }[] }) {
  const max = Math.max(1, ...data.map((d) => Math.max(d.signups, d.active)));
  const w = 720, h = 160, bw = w / data.length;
  return (
    <svg viewBox={`0 0 ${w} ${h + 20}`} className="w-full" role="img" aria-label="Sign-ups and active users per day, last 30 days">
      {data.map((d, i) => (
        <g key={d.day}>
          <rect x={i * bw + 2} y={h - (d.active / max) * h} width={bw - 4} height={(d.active / max) * h} className="fill-primary/25"><title>{`${d.day}: ${d.active} active`}</title></rect>
          <rect x={i * bw + bw * 0.3} y={h - (d.signups / max) * h} width={bw * 0.4} height={(d.signups / max) * h} className="fill-primary"><title>{`${d.day}: ${d.signups} sign-ups`}</title></rect>
          {i % 5 === 0 && <text x={i * bw} y={h + 15} fontSize="10" className="fill-muted-foreground">{d.day.slice(5)}</text>}
        </g>
      ))}
    </svg>
  );
}

function Pricing({ initial, save }: { initial: M; save: (p: M) => Promise<string> }) {
  const [p, setP] = useState<M>(initial);
  const [msg, setMsg] = useState('');
  const up = (f: (x: M) => void) => setP((o: M) => { const n = structuredClone(o); f(n); return n; });
  return (
    <Box t="Pricing config (draft)" id="admin-pricing">
      <p className="mb-3 text-sm text-muted-foreground">Stored in the Apps Script (Script Property PRICING_CONFIG). The public site does not read this yet, so nothing changes for visitors. {p.payment?.note}</p>
      <label className="mb-4 flex items-center gap-2 font-medium"><input type="checkbox" data-testid="pricing-master" checked={p.masterOn} onChange={(e) => up((x) => { x.masterOn = e.target.checked; })} /> Master switch: paid features {p.masterOn ? 'ON (no effect until payments exist)' : 'OFF'}</label>
      <div className="mb-4 grid gap-2">
        {p.plans.map((pl: M, i: number) => (
          <div key={i} className="grid gap-2 sm:grid-cols-[120px_1fr_120px_2fr]">
            <input aria-label="Plan id" className="rounded border border-border bg-background px-2 py-1" value={pl.id} onChange={(e) => up((x) => { x.plans[i].id = e.target.value; })} />
            <input aria-label="Plan name" className="rounded border border-border bg-background px-2 py-1" value={pl.name} onChange={(e) => up((x) => { x.plans[i].name = e.target.value; })} />
            <input aria-label="Price INR per month" type="number" className="rounded border border-border bg-background px-2 py-1" value={pl.priceInrMonthly} onChange={(e) => up((x) => { x.plans[i].priceInrMonthly = Number(e.target.value); })} />
            <input aria-label="Limits" className="rounded border border-border bg-background px-2 py-1" value={pl.limits} onChange={(e) => up((x) => { x.plans[i].limits = e.target.value; })} />
          </div>
        ))}
        <button className="w-fit text-sm text-primary underline" onClick={() => up((x) => { x.plans.push({ id: 'new', name: 'New plan', priceInrMonthly: 0, limits: '' }); })}>Add plan</button>
      </div>
      <div className="mb-4 grid gap-1 sm:grid-cols-2">
        {Object.keys(p.features).map((k) => <label key={k} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={p.features[k]} onChange={(e) => up((x) => { x.features[k] = e.target.checked; })} /> {k} is paid</label>)}
      </div>
      <button data-testid="pricing-save" className="rounded-full bg-primary px-5 py-2 text-primary-foreground" onClick={async () => setMsg(await save(p))}>Save config</button> <span role="status" className="text-sm">{msg}</span>
    </Box>
  );
}

export default function AdminApp() {
  const [state, setState] = useState<'checking' | '404' | 'verify' | 'loading' | 'ready' | 'error'>('checking');
  const [err, setErr] = useState('');
  const [data, setData] = useState<M>(null);
  const token = useRef('');
  const btn = useRef<HTMLDivElement>(null);
  const [uq, setUq] = useState(''); const [multiOnly, setMultiOnly] = useState(false);
  const [fq, setFq] = useState(''); const [fStatus, setFStatus] = useState('all'); const [minRating, setMinRating] = useState(0);

  useEffect(() => {
    document.title = 'Not found';
    const meta = document.createElement('meta'); meta.name = 'robots'; meta.content = 'noindex, nofollow'; document.head.appendChild(meta);
    const s = getSession();
    if (!s?.email) { setState('404'); return; }
    fetch('/api/admin/check', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: s.email }) })
      .then((r) => setState(r.ok ? 'verify' : '404')).catch(() => setState('404'));
  }, []);
  const load = async () => {
    setState('loading');
    const r = await fetch('/api/admin/data', { headers: { Authorization: `Bearer ${token.current}` } });
    if (r.status === 404) { setState('404'); return; }
    const d = await r.json().catch(() => ({}));
    if (!r.ok) { setErr(d.error || 'Failed'); setState('error'); return; }
    document.title = 'Admin · Job Acquisition OS'; setData(d); setState('ready');
  };
  useEffect(() => { if (state === 'verify' && btn.current) renderTokenButton(btn.current, (t) => { token.current = t; load(); }, setErr); }, [state]);
  const save = async (pricing: M) => {
    const r = await fetch('/api/admin/config', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token.current}` }, body: JSON.stringify({ pricing }) });
    const d = await r.json().catch(() => ({}));
    return r.ok ? 'Saved.' : r.status === 404 ? 'Session expired: reload and verify again.' : d.error || 'Failed';
  };

  const m: M = data?.metrics;
  const users = useMemo(() => (m?.users || []).filter((u: M) => (!multiOnly || /^yes/i.test(u.multi)) && (!uq || `${u.email} ${u.name} ${u.mobile}`.toLowerCase().includes(uq.toLowerCase()))), [m, uq, multiOnly]);
  const fb = useMemo(() => (m?.feedback || []).filter((f: M) => (fStatus === 'all' || (fStatus === 'replied' ? /^sent/.test(f.reply || '') : fStatus === 'pending' ? !f.reply : /skipped|failed/.test(f.reply || ''))) && (f.rating || 0) >= minRating && (!fq || `${f.message} ${f.name} ${f.email}`.toLowerCase().includes(fq.toLowerCase()))), [m, fq, fStatus, minRating]);

  if (state === 'checking' || state === 'loading') return <div className="min-h-screen bg-background" />;
  if (state === '404') return <NotFound />;
  if (state === 'verify') return <div className="grid min-h-screen place-items-center bg-background"><div className="text-center"><p className="mb-3 text-sm text-muted-foreground">Confirm it is you.</p><div ref={btn} className="min-h-[44px]" />{err && <p className="mt-2 text-sm text-danger">{err}</p>}</div></div>;
  if (state === 'error') return <div className="grid min-h-screen place-items-center bg-background p-6"><p role="alert" className="max-w-lg text-danger">{err}</p></div>;

  const t = m.totals, a = m.active, g = m.growth;
  return (
    <main data-testid="admin-dashboard" className="mx-auto grid max-w-6xl gap-5 bg-background p-5">
      <header className="flex flex-wrap items-baseline justify-between gap-2"><h1 className="display text-4xl">Admin</h1><span className="text-sm text-muted-foreground">Signed in as {data.admin} · data as of {m.asOf} (IST) · real Sheet data only</span></header>
      <Box t="Headline" id="admin-headline">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat k="Total users" v={val(t.users)} /><Stat k="DAU" v={val(a?.dau)} /><Stat k="WAU" v={val(a?.wau)} /><Stat k="MAU" v={val(a?.mau)} />
          <Stat k="Stickiness (DAU/MAU)" v={val(a?.stickiness, '%')} /><Stat k="Sign-ups this week" v={val(g.signupsThisWeek)} /><Stat k="Sign-ups WoW" v={val(g.signupsWoW, '%')} /><Stat k="Active users WoW" v={val(g.activeWoW, '%')} />
          <Stat k="Total visits" v={val(t.visits)} /><Stat k="Devices with several accounts" v={val(t.flaggedDevices)} /><Stat k="Feedback" v={val(t.feedback)} /><Stat k="Avg rating" v={val(t.avgRating, '/5')} />
        </div>
      </Box>
      <Box t="Revenue (needs payments)" id="admin-revenue">
        <div className="grid grid-cols-3 gap-3"><Stat k="Free → paid conversion" v={<NoData />} /><Stat k="MRR" v={<NoData />} /><Stat k="ARPU" v={<NoData />} /></div>
        <p className="mt-2 text-sm text-muted-foreground">{m.revenue.note}</p>
      </Box>
      <Box t="Sign-ups (dark) and active users (light), last 30 days" id="admin-trend">{m.trend ? <Bars data={m.trend} /> : <NoData />}</Box>
      <div className="grid gap-5 md:grid-cols-2">
        <Box t="Activation funnel" id="admin-funnel">{m.funnel ? <table className="w-full text-sm"><tbody>{m.funnel.map((s: M) => <tr key={s.step}><td className="py-1">{s.step}</td><td className="text-right font-medium">{s.users}</td><td className="w-40 pl-3"><div className="h-2 rounded bg-primary" style={{ width: `${s.ofSignups ?? 0}%` }} /></td><td className="w-14 text-right text-muted-foreground">{val(s.ofSignups, '%')}</td></tr>)}</tbody></table> : <NoData />}<p className="mt-2 text-xs text-muted-foreground">Signed-in users only. Steps are counted from the day this was deployed.</p></Box>
        <Box t="Retention cohorts (by sign-up week)" id="admin-cohorts">{m.cohorts ? <table className="w-full text-sm"><thead><tr className="text-left text-muted-foreground"><th>Week of</th><th>Users</th><th>W1</th><th>W4</th></tr></thead><tbody>{m.cohorts.map((c: M) => <tr key={c.week}><td>{c.week}</td><td>{c.users}</td><td>{val(c.w1, '%')}</td><td>{val(c.w4, '%')}</td></tr>)}</tbody></table> : <NoData />}<p className="mt-2 text-xs text-muted-foreground">W1 = came back 7 to 13 days after sign-up; W4 = 28 to 34 days. "no data yet" until a cohort is old enough.</p></Box>
        <Box t="Traffic by channel (sign-ups)" id="admin-channels">{m.channels ? <ul className="text-sm">{m.channels.map((c: M) => <li key={c.source} className="flex justify-between py-0.5"><span>{c.source}</span><b>{c.signups}</b></li>)}</ul> : <NoData />}<p className="mt-2 text-xs text-muted-foreground">From ?ref= / utm_source on the first visit. Anonymous page views per channel: <a className="text-primary underline" href={data.goatcounter} target="_blank" rel="noreferrer">GoatCounter</a>.</p></Box>
        <Box t="Feedback themes" id="admin-themes">{m.themes ? <ul className="text-sm">{m.themes.map((x: M) => <li key={x.theme} className="flex justify-between py-0.5"><span>{x.theme}</span><b>{x.count}</b></li>)}</ul> : <NoData />}<p className="mt-2 text-xs text-muted-foreground">Keyword groups; one message can count in several.</p></Box>
      </div>
      <Box t={`Users (${users.length})`} id="admin-users">
        <div className="mb-3 flex flex-wrap gap-3 text-sm"><input data-testid="users-filter" placeholder="Search email, name, mobile" value={uq} onChange={(e) => setUq(e.target.value)} className="rounded border border-border bg-background px-2 py-1" /><label className="flex items-center gap-1"><input type="checkbox" checked={multiOnly} onChange={(e) => setMultiOnly(e.target.checked)} /> Only devices with several accounts</label></div>
        {users.length ? <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="text-left text-muted-foreground"><th>Email</th><th>Name</th><th>Mobile (unverified)</th><th>First seen</th><th>Last seen</th><th>Visits</th><th>Devices</th><th>Flag</th></tr></thead><tbody>{users.map((u: M) => <tr key={u.email} className="border-t border-border"><td>{u.email}</td><td>{u.name}</td><td>{u.mobile}</td><td>{u.firstSeen}</td><td>{u.lastSeen}</td><td>{u.visits}</td><td>{u.devices}</td><td className="text-danger">{u.multi}</td></tr>)}</tbody></table></div> : <NoData />}
      </Box>
      <Box t={`Feedback (${fb.length})`} id="admin-feedback">
        <div className="mb-3 flex flex-wrap gap-3 text-sm"><input placeholder="Search" value={fq} onChange={(e) => setFq(e.target.value)} className="rounded border border-border bg-background px-2 py-1" />
          <select data-testid="fb-status" value={fStatus} onChange={(e) => setFStatus(e.target.value)} className="rounded border border-border bg-background px-2 py-1"><option value="all">All</option><option value="replied">Auto-replied</option><option value="pending">Waiting</option><option value="skipped">Skipped / failed</option></select>
          <select value={minRating} onChange={(e) => setMinRating(Number(e.target.value))} className="rounded border border-border bg-background px-2 py-1"><option value={0}>Any rating</option>{[1, 2, 3, 4, 5].map((r) => <option key={r} value={r}>{r}+ stars</option>)}</select></div>
        {fb.length ? <div className="grid gap-3">{fb.map((f: M, i: number) => <article key={i} className="rounded-xl border border-border p-3 text-sm"><div className="mb-1 text-muted-foreground">{f.at} · {f.name || 'Anonymous'} {f.email && `<${f.email}>`} · {f.rating ? `${f.rating}/5` : 'no rating'} · {f.page} · {f.status}</div><p className="whitespace-pre-wrap">{f.message}</p>{f.reply && <details className="mt-2"><summary className="cursor-pointer text-primary">Auto-reply: {f.reply} {f.replyAt}</summary><p className="mt-1 whitespace-pre-wrap text-muted-foreground">{f.replyText}</p></details>}</article>)}</div> : <NoData />}
      </Box>
      <Pricing initial={data.pricing} save={save} />
      <p className="text-xs text-muted-foreground">Made by Akash Sync Agent</p>
    </main>
  );
}
