import React, { useEffect, useMemo, useRef, useState } from 'react';
import { getIdToken, getSession, renderTokenButton } from '../lib/googleAuth';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
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


// Charts: Recharts (MIT). Loaded only in this lazy admin chunk.
const COLORS = ['#c2410c', '#f59e0b', '#0f766e', '#6366f1', '#db2777', '#64748b', '#16a34a', '#0891b2'];
function Donut({ data }: { data: { name: string; value: number }[] | null }) {
  if (!data) return <NoData />;
  return <ResponsiveContainer width="100%" height={220}><PieChart><Pie data={data} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>{data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip /><Legend wrapperStyle={{ fontSize: 12 }} /></PieChart></ResponsiveContainer>;
}
const csv = (rows: (string | number)[][]) => rows.map((r) => r.map((c) => { const s = String(c ?? ''); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; }).join(',')).join('\n');
function downloadCsv(name: string, rows: (string | number)[][]) { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv(rows)], { type: 'text/csv' })); a.download = name; a.click(); }
const fmt = (n: number | null, cur: 'INR' | 'USD') => n == null || !isFinite(n) ? '—' : new Intl.NumberFormat(cur === 'INR' ? 'en-IN' : 'en-US', { style: 'currency', currency: cur, maximumFractionDigits: 0 }).format(n);
const num = (v: any) => (v === '' || v == null || isNaN(Number(v)) ? null : Number(v));

function Pitch({ m, inputs, setInputs, saveInputs }: { m: M; inputs: M; setInputs: (x: M) => void; saveInputs: () => void }) {
  const set = (k: string, v: string) => setInputs({ ...inputs, [k]: v });
  const fx = num(inputs.fx) || 84;
  const price = num(inputs.priceInr), conv = num(inputs.convPct), churn = num(inputs.churnPct), margin = num(inputs.marginPct) ?? 80;
  const spend: Record<string, string> = inputs.spend || {};
  const totalSpend = Object.values(spend).reduce((a, v) => a + (num(v) || 0), 0);
  const signups = m.totals.users || 0;
  const cac = totalSpend && signups ? totalSpend / Math.max(1, signups * ((conv ?? 0) / 100 || 1)) : null;
  const arpu = price != null && conv != null ? price * (conv / 100) : null;
  const ltv = price != null && churn ? (price * (margin / 100)) / (churn / 100) : null;
  const payback = cac != null && price ? cac / (price * (margin / 100)) : null;
  const field = (k: string, label: string, ph = '') => <label className="grid gap-1 text-xs"><span className="text-muted-foreground">{label}</span><input value={inputs[k] ?? ''} placeholder={ph} onChange={(e) => set(k, e.target.value)} className="rounded border border-border bg-background px-2 py-1 text-sm" /></label>;
  const traction = [
    ['Users (signed in)', val(m.totals.users)], ['Sign-ups this week', val(m.growth.signupsThisWeek)], ['Sign-ups WoW', val(m.growth.signupsWoW, '%')],
    ['WAU / MAU', m.active ? `${m.active.wau} / ${m.active.mau}` : <NoData />], ['Stickiness DAU/MAU', val(m.active?.stickiness, '%')],
    ['Latest cohort W1', val(m.cohorts?.find((c: M) => c.w1 != null)?.w1, '%')], ['Latest cohort W4', val(m.cohorts?.find((c: M) => c.w4 != null)?.w4, '%')],
    ['Users who clicked apply', val(m.funnel?.find((f: M) => f.step === 'Clicked apply')?.users)],
  ];
  return (
    <div className="grid gap-5">
      <p className="text-sm text-muted-foreground">Traction numbers are computed from the Sheet. Anything marked <b>admin-entered</b> is your own estimate, saved in the Apps Script, and is shown as such. Revenue stays "no data yet" until payments exist.</p>
      <div className="grid gap-5 md:grid-cols-2">
        {(['INR', 'USD'] as const).map((cur) => (
          <Box key={cur} t={cur === 'INR' ? 'Shark Tank India pitch (₹)' : 'US pitch ($)'} id={`pitch-${cur}`}>
            <div className="grid grid-cols-2 gap-2 text-sm">{traction.map(([k, v]) => <Stat key={String(k)} k={String(k)} v={v as React.ReactNode} />)}</div>
            <h3 className="mb-1 mt-4 font-semibold">Market (admin-entered)</h3>
            <div className="grid grid-cols-3 gap-2"><Stat k="TAM" v={fmt(num(inputs.tamInr) != null ? (cur === 'INR' ? num(inputs.tamInr)! : num(inputs.tamInr)! / fx) : null, cur)} /><Stat k="SAM" v={fmt(num(inputs.samInr) != null ? (cur === 'INR' ? num(inputs.samInr)! : num(inputs.samInr)! / fx) : null, cur)} /><Stat k="SOM" v={fmt(num(inputs.somInr) != null ? (cur === 'INR' ? num(inputs.somInr)! : num(inputs.somInr)! / fx) : null, cur)} /></div>
            <h3 className="mb-1 mt-4 font-semibold">Unit economics (calculator, admin-entered inputs)</h3>
            <div className="grid grid-cols-2 gap-2"><Stat k="ARPU / month" v={fmt(arpu == null ? null : cur === 'INR' ? arpu : arpu / fx, cur)} /><Stat k="CAC (spend ÷ paying users)" v={fmt(cac == null ? null : cur === 'INR' ? cac : cac / fx, cur)} /><Stat k="LTV" v={fmt(ltv == null ? null : cur === 'INR' ? ltv : ltv / fx, cur)} /><Stat k="LTV : CAC" v={ltv && cac ? `${(ltv / cac).toFixed(1)}x` : '—'} /><Stat k="Payback" v={payback ? `${payback.toFixed(1)} months` : '—'} /><Stat k="MRR / conversion" v={<NoData />} /></div>
          </Box>))}
      </div>
      <Box t="Inputs (admin-entered, saved to Apps Script)" id="pitch-inputs">
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {field('tamInr', 'TAM (₹)')}{field('samInr', 'SAM (₹)')}{field('somInr', 'SOM (₹)')}{field('fx', '₹ per $1', '84')}{field('priceInr', 'Plan price ₹ / month')}
          {field('convPct', 'Assumed free→paid %')}{field('churnPct', 'Assumed monthly churn %')}{field('marginPct', 'Gross margin %', '80')}
        </div>
        <h3 className="mb-1 mt-4 text-sm font-semibold">Spend by channel (₹, admin-entered) → CAC proxy</h3>
        <div className="grid gap-2 sm:grid-cols-3">{(m.channels || [{ source: 'direct / unknown', signups: 0 }]).map((c: M) => {
          const s = num(spend[c.source]); return <label key={c.source} className="grid gap-1 text-xs"><span className="text-muted-foreground">{c.source} · {c.signups} sign-ups · CAC proxy {s && c.signups ? fmt(s / c.signups, 'INR') : '—'}</span><input value={spend[c.source] ?? ''} onChange={(e) => setInputs({ ...inputs, spend: { ...spend, [c.source]: e.target.value } })} className="rounded border border-border bg-background px-2 py-1 text-sm" /></label>; })}</div>
        <button data-testid="inputs-save" onClick={saveInputs} className="mt-3 rounded-full bg-primary px-5 py-2 text-primary-foreground">Save inputs</button>
      </Box>
    </div>
  );
}

const TABS = ['Overview', 'Pitch', 'Users', 'Feedback', 'Comments', 'Settings', 'Audit log'] as const;
export default function AdminApp() {
  const [state, setState] = useState<'checking' | '404' | 'verify' | 'loading' | 'ready' | 'error'>('checking');
  const [err, setErr] = useState('');
  const [data, setData] = useState<M>(null);
  const [tab, setTab] = useState<(typeof TABS)[number]>('Overview');
  const [note, setNote] = useState('');
  const [inputs, setInputs] = useState<M>({});
  const token = useRef('');
  const btn = useRef<HTMLDivElement>(null);
  const [uq, setUq] = useState(''); const [multiOnly, setMultiOnly] = useState(false);
  const [fq, setFq] = useState(''); const [fStatus, setFStatus] = useState('all'); const [minRating, setMinRating] = useState(0);
  const [replyTo, setReplyTo] = useState<number | null>(null); const [replyText, setReplyText] = useState('');
  const [banner, setBanner] = useState('');

  useEffect(() => {
    document.title = 'Not found';
    const meta = document.createElement('meta'); meta.name = 'robots'; meta.content = 'noindex, nofollow'; document.head.appendChild(meta);
    const s = getSession();
    if (!s?.email) { setState('404'); return; }
    fetch('/api/admin/check', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: s.email }) })
      .then(async (r) => { if (!r.ok) return setState('404'); const t = await getIdToken().catch(() => ''); if (t) { token.current = t; load(); } else setState('verify'); }).catch(() => setState('404'));
  }, []);
  const load = async () => {
    const r = await fetch('/api/admin/data', { headers: { Authorization: `Bearer ${token.current}` } });
    if (r.status === 404) { setState(state === 'ready' ? 'verify' : '404'); return; }
    const d = await r.json().catch(() => ({}));
    if (!r.ok) { setErr(d.error || 'Failed'); setState('error'); return; }
    document.title = 'Admin · Job Acquisition OS'; setData(d); setInputs(d.inputs || {}); setBanner(d.banner || ''); setState('ready');
  };
  useEffect(() => { if (state === 'verify' && btn.current) renderTokenButton(btn.current, (t) => { token.current = t; setState('loading'); load(); }, setErr); }, [state]);
  const op = async (body: M, ok = 'Done.') => {
    setNote('Working…');
    const r = await fetch('/api/admin/op', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token.current}` }, body: JSON.stringify(body) });
    const d = await r.json().catch(() => ({}));
    if (r.status === 404) { setNote('Session expired: reload the page.'); return false; }
    if (!r.ok || d.ok === false) { setNote(d.error || 'Failed'); return false; }
    setNote(d.test ? `${ok} (TEST mode: sent to you only)` : ok); await load(); return true;
  };
  const save = async (pricing: M) => {
    const r = await fetch('/api/admin/config', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token.current}` }, body: JSON.stringify({ pricing }) });
    const d = await r.json().catch(() => ({}));
    if (r.ok) load();
    return r.ok ? 'Saved.' : r.status === 404 ? 'Session expired: reload and verify again.' : d.error || 'Failed';
  };

  const m: M = data?.metrics;
  const users = useMemo(() => (m?.users || []).filter((u: M) => (!multiOnly || /^yes/i.test(u.multi)) && (!uq || `${u.email} ${u.name} ${u.mobile}`.toLowerCase().includes(uq.toLowerCase()))), [m, uq, multiOnly]);
  const fbAll = useMemo(() => (m?.feedback || []).map((f: M, i: number) => ({ ...f, row: (data?.feedbackRows || 0) + 1 - i })), [m, data]);
  const fb = useMemo(() => fbAll.filter((f: M) => (fStatus === 'all' || (fStatus === 'replied' ? /^sent|replied/.test(`${f.reply} ${f.status}`) : fStatus === 'pending' ? !f.reply && f.status === 'new' : fStatus === 'skipped' ? /skipped|failed/.test(f.reply || '') : f.status === fStatus)) && (f.rating || 0) >= minRating && (!fq || `${f.message} ${f.name} ${f.email}`.toLowerCase().includes(fq.toLowerCase()))), [fbAll, fq, fStatus, minRating]);

  if (state === 'checking' || state === 'loading') return <div className="min-h-screen bg-background" />;
  if (state === '404') return <NotFound />;
  if (state === 'verify') return <div className="grid min-h-screen place-items-center bg-background"><div className="text-center"><p className="mb-3 text-sm text-muted-foreground">Confirm it is you.</p><div ref={btn} className="min-h-[44px]" />{err && <p className="mt-2 text-sm text-danger">{err}</p>}</div></div>;
  if (state === 'error') return <div className="grid min-h-screen place-items-center bg-background p-6"><p role="alert" className="max-w-lg text-danger">{err}</p></div>;

  const t = m.totals, a = m.active, g = m.growth, b = m.breakdowns || {};
  return (
    <main data-testid="admin-dashboard" className="mx-auto grid max-w-6xl gap-5 bg-background p-5">
      <header className="flex flex-wrap items-baseline justify-between gap-2"><h1 className="display text-4xl">Admin</h1><span className="text-sm text-muted-foreground">Signed in as {data.admin} · data as of {m.asOf} (IST) · real Sheet data only · <a className="underline" href="/#/app/overview">Back to the app</a></span></header>
      <nav role="tablist" className="flex flex-wrap gap-2">{TABS.map((x) => <button key={x} role="tab" aria-selected={tab === x} data-testid={`tab-${x}`} onClick={() => setTab(x)} className={`rounded-full border px-4 py-2 text-sm ${tab === x ? 'border-primary bg-primary text-primary-foreground' : 'border-border'}`}>{x}</button>)}</nav>
      {note && <p role="status" className="text-sm text-primary">{note}</p>}

      {tab === 'Overview' && <>
        <Box t="Headline" id="admin-headline">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Stat k="Total users" v={val(t.users)} /><Stat k="DAU" v={val(a?.dau)} /><Stat k="WAU" v={val(a?.wau)} /><Stat k="MAU" v={val(a?.mau)} />
            <Stat k="Stickiness (DAU/MAU)" v={val(a?.stickiness, '%')} /><Stat k="Sign-ups this week" v={val(g.signupsThisWeek)} /><Stat k="Sign-ups WoW" v={val(g.signupsWoW, '%')} /><Stat k="Active users WoW" v={val(g.activeWoW, '%')} />
            <Stat k="Total visits" v={val(t.visits)} /><Stat k="Devices with several accounts" v={val(t.flaggedDevices)} /><Stat k="Feedback" v={val(t.feedback)} /><Stat k="Avg rating" v={val(t.avgRating, '/5')} />
          </div>
        </Box>
        <Box t="Daily active, weekly active and sign-ups (last 30 days)" id="admin-trend">{m.trend ? <ResponsiveContainer width="100%" height={260}><LineChart data={m.trend}><CartesianGrid strokeDasharray="3 3" opacity={0.3} /><XAxis dataKey="day" tickFormatter={(d) => d.slice(5)} fontSize={11} /><YAxis allowDecimals={false} fontSize={11} /><Tooltip /><Legend /><Line type="monotone" dataKey="active" name="DAU" stroke={COLORS[0]} dot={false} /><Line type="monotone" dataKey="wau" name="WAU" stroke={COLORS[2]} dot={false} /><Line type="monotone" dataKey="signups" name="Sign-ups" stroke={COLORS[1]} dot={false} /></LineChart></ResponsiveContainer> : <NoData />}</Box>
        <div className="grid gap-5 md:grid-cols-2">
          <Box t="Activation funnel (users)" id="admin-funnel">{m.funnel ? <ResponsiveContainer width="100%" height={300}><BarChart data={m.funnel} layout="vertical" margin={{ left: 40 }}><XAxis type="number" allowDecimals={false} fontSize={11} /><YAxis type="category" dataKey="step" width={130} fontSize={11} /><Tooltip /><Bar dataKey="users" fill={COLORS[0]} /></BarChart></ResponsiveContainer> : <NoData />}<p className="mt-2 text-xs text-muted-foreground">Signed-in users only, counted from the day each step started being logged.</p></Box>
          <Box t="Retention by sign-up week (%)" id="admin-cohorts">{m.cohorts ? <ResponsiveContainer width="100%" height={300}><BarChart data={[...m.cohorts].reverse()}><XAxis dataKey="week" fontSize={11} /><YAxis unit="%" fontSize={11} /><Tooltip /><Legend /><Bar dataKey="w1" name="W1" fill={COLORS[2]} /><Bar dataKey="w4" name="W4" fill={COLORS[3]} /></BarChart></ResponsiveContainer> : <NoData />}<p className="mt-2 text-xs text-muted-foreground">W1 = came back 7–13 days after sign-up; W4 = 28–34 days. Empty bars mean the cohort is not old enough yet.</p></Box>
          <Box t="Users by channel" id="pie-channel"><Donut data={b.channel} /><p className="text-xs text-muted-foreground">From ?ref= / utm_source on the first visit (only after consent). Page views: <a className="underline text-primary" href={data.goatcounter} target="_blank" rel="noreferrer">GoatCounter</a>.</p></Box>
          <Box t="Preferred work mode" id="pie-mode"><Donut data={b.workMode} /></Box>
          <Box t="Target role (first one)" id="pie-role"><Donut data={b.role?.slice(0, 8) || null} /></Box>
          <Box t="Country of residence" id="pie-country"><Donut data={b.country} /></Box>
          <Box t="Device" id="pie-device"><Donut data={b.device} /></Box>
          <Box t="Feedback sentiment (by star rating)" id="pie-sentiment"><Donut data={m.sentiment} /></Box>
          <Box t="Feedback themes" id="admin-themes">{m.themes ? <ResponsiveContainer width="100%" height={240}><BarChart data={m.themes}><XAxis dataKey="theme" fontSize={10} interval={0} angle={-20} textAnchor="end" height={60} /><YAxis allowDecimals={false} fontSize={11} /><Tooltip /><Bar dataKey="count" fill={COLORS[4]} /></BarChart></ResponsiveContainer> : <NoData />}<p className="text-xs text-muted-foreground">Keyword groups; one message can count in several.</p></Box>
          <Box t="Revenue (needs payments)" id="admin-revenue"><div className="grid grid-cols-3 gap-3"><Stat k="Free → paid" v={<NoData />} /><Stat k="MRR" v={<NoData />} /><Stat k="ARPU" v={<NoData />} /></div><p className="mt-2 text-sm text-muted-foreground">{m.revenue.note}</p></Box>
        </div>
      </>}

      {tab === 'Pitch' && <Pitch m={m} inputs={inputs} setInputs={setInputs} saveInputs={() => op({ op: 'inputs-save', inputs }, 'Inputs saved.')} />}

      {tab === 'Users' && <Box t={`Users (${users.length})`} id="admin-users">
        <div className="mb-3 flex flex-wrap items-center gap-3 text-sm"><input data-testid="users-filter" placeholder="Search email, name, mobile" value={uq} onChange={(e) => setUq(e.target.value)} className="rounded border border-border bg-background px-2 py-1" /><label className="flex items-center gap-1"><input type="checkbox" checked={multiOnly} onChange={(e) => setMultiOnly(e.target.checked)} /> Flagged multi-account devices only</label>
          <button data-testid="users-csv" className="rounded-full border border-border px-3 py-1" onClick={() => downloadCsv(`users-${m.asOf}.csv`, [['Email', 'Name', 'Mobile (unverified)', 'First seen', 'Last seen', 'Visits', 'Devices', 'Flag'], ...users.map((u: M) => [u.email, u.name, u.mobile, u.firstSeen, u.lastSeen, u.visits, u.devices, u.multi])])}>Export CSV</button></div>
        {users.length ? <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="text-left text-muted-foreground"><th>Email</th><th>Name</th><th>Mobile</th><th>First seen</th><th>Last seen</th><th>Visits</th><th>Devices</th><th>Flag</th><th>Actions</th></tr></thead><tbody>{users.map((u: M) => <tr key={u.email} className="border-t border-border align-top"><td>{u.email}</td><td>{u.name}</td><td>{u.mobile}</td><td>{u.firstSeen}</td><td>{u.lastSeen}</td><td>{u.visits}</td><td>{u.devices}</td><td className="text-danger">{u.multi}</td>
          <td className="whitespace-nowrap">{/^yes/i.test(u.multi) && !/reviewed/.test(u.multi) && <button className="mr-2 underline" onClick={() => { const n = prompt('Review note (optional), e.g. "family device, fine"') ?? null; if (n !== null) op({ op: 'user-review', email: u.email, note: n }, 'Marked reviewed.'); }}>Mark reviewed</button>}
            <button className="text-danger underline" data-testid="user-delete" onClick={() => { const c = prompt(`DPDP deletion: this removes ${u.email} from Users, Events, Feedback and Comments in the Sheet. Type the email to confirm.`); if (c) op({ op: 'user-delete', email: u.email, confirm: c.trim().toLowerCase() }, 'Deleted.'); }}>Delete data</button></td></tr>)}</tbody></table></div> : <NoData />}
        <p className="mt-2 text-xs text-muted-foreground">Deleting removes the person's rows from the Sheet only. Their browser data stays on their device; tell them to use "Delete my data" on the Privacy page.</p>
      </Box>}

      {tab === 'Feedback' && <Box t={`Feedback (${fb.length})`} id="admin-feedback">
        <div className="mb-3 flex flex-wrap gap-3 text-sm"><input placeholder="Search" value={fq} onChange={(e) => setFq(e.target.value)} className="rounded border border-border bg-background px-2 py-1" />
          <select data-testid="fb-status" value={fStatus} onChange={(e) => setFStatus(e.target.value)} className="rounded border border-border bg-background px-2 py-1"><option value="all">All</option><option value="pending">New, no reply</option><option value="replied">Replied</option><option value="in progress">In progress</option><option value="done">Done</option><option value="skipped">Auto-reply skipped / failed</option></select>
          <select value={minRating} onChange={(e) => setMinRating(Number(e.target.value))} className="rounded border border-border bg-background px-2 py-1"><option value={0}>Any rating</option>{[1, 2, 3, 4, 5].map((r) => <option key={r} value={r}>{r}+ stars</option>)}</select>
          <button className="rounded-full border border-border px-3 py-1" onClick={() => downloadCsv(`feedback-${m.asOf}.csv`, [['Time', 'Name', 'Email', 'Rating', 'Message', 'Page', 'Status', 'Auto-reply', 'Auto-reply text'], ...fb.map((f: M) => [f.at, f.name, f.email, f.rating ?? '', f.message, f.page, f.status, f.reply, f.replyText])])}>Export CSV</button></div>
        {fb.length ? <div className="grid gap-3">{fb.map((f: M) => <article key={f.row} className="rounded-xl border border-border p-3 text-sm"><div className="mb-1 text-muted-foreground">{f.at} · {f.name || 'Anonymous'} {f.email && `<${f.email}>`} · {f.rating ? `${f.rating}/5` : 'no rating'} · {f.page} · <b>{f.status}</b></div><p className="whitespace-pre-wrap">{f.message}</p>
          {f.reply && <details className="mt-2"><summary className="cursor-pointer text-primary">Auto-reply: {f.reply} {f.replyAt}</summary><p className="mt-1 whitespace-pre-wrap text-muted-foreground">{f.replyText}</p></details>}
          <div className="mt-2 flex flex-wrap gap-2"><select aria-label="Status" value={f.status} onChange={(e) => op({ op: 'fb-status', row: f.row, status: e.target.value }, 'Status saved.')} className="rounded border border-border bg-background px-2 py-1"><option>new</option><option>in progress</option><option>done</option><option>replied</option><option>spam</option></select>
            {f.email && <button className="underline" onClick={() => { setReplyTo(f.row); setReplyText(`Hi ${String(f.name || 'there').split(' ')[0]},\n\nThank you for your feedback. `); }}>Reply</button>}</div>
          {replyTo === f.row && <div className="mt-2 grid gap-2"><textarea rows={5} value={replyText} onChange={(e) => setReplyText(e.target.value)} className="rounded border border-border bg-background p-2" /><p className="text-xs text-muted-foreground">Auto-reply mode is <b>{data.autoReplyMode}</b>: {data.autoReplyMode === 'live' ? `this goes to ${f.email}.` : 'this goes to you only, marked [TEST - please ignore].'}</p><div className="flex gap-2"><button className="rounded-full bg-primary px-4 py-1 text-primary-foreground" onClick={async () => { if (await op({ op: 'fb-reply', row: f.row, text: replyText }, 'Reply sent.')) setReplyTo(null); }}>Send reply</button><button className="underline" onClick={() => setReplyTo(null)}>Cancel</button></div></div>}
        </article>)}</div> : <NoData />}
      </Box>}

      {tab === 'Comments' && <Box t={`Comments (${data.comments?.length || 0})`} id="admin-comments">
        {data.comments?.length ? <div className="grid gap-2">{data.comments.map((c: M) => <article key={c.id} className="rounded-xl border border-border p-3 text-sm"><div className="text-muted-foreground">{c.at} · {c.name} {c.email && `<${c.email}>`} · {c.page} · {c.approved === 'yes' ? <b className="text-primary">public</b> : 'hidden'}</div><p className="whitespace-pre-wrap">{c.message}</p>
          <div className="mt-2 flex gap-3">{c.approved === 'yes' ? <button className="underline" onClick={() => op({ op: 'comment-moderate', id: c.id, approved: 'no' }, 'Hidden.')}>Hide</button> : <button className="underline" onClick={() => op({ op: 'comment-moderate', id: c.id, approved: 'yes' }, 'Published.')}>Publish</button>}
            <button className="text-danger underline" onClick={() => { const r = prompt('Why is this abusive? (logged)'); if (r) op({ op: 'comment-moderate', id: c.id, approved: 'no', flag: r }, 'Flagged and hidden.'); }}>Flag abusive</button></div></article>)}</div> : <NoData />}
      </Box>}

      {tab === 'Settings' && <>
        <Box t="Announcement / maintenance banner" id="admin-banner"><p className="mb-2 text-sm text-muted-foreground">Shown at the top of every public page and the app when not empty (updates within about a minute).</p>
          <div className="flex flex-wrap gap-2"><input data-testid="banner-text" value={banner} maxLength={300} onChange={(e) => setBanner(e.target.value)} placeholder="e.g. Maintenance tonight 11 PM–12 AM IST" className="min-w-[280px] flex-1 rounded border border-border bg-background px-2 py-1" /><button className="rounded-full bg-primary px-4 py-1 text-primary-foreground" onClick={() => op({ op: 'banner', text: banner }, banner ? 'Banner on.' : 'Banner off.')}>Save</button><button className="underline" onClick={() => { setBanner(''); op({ op: 'banner', text: '' }, 'Banner off.'); }}>Turn off</button></div></Box>
        <Box t="Feedback auto-reply" id="admin-autoreply"><p className="mb-2 text-sm">Mode: <b data-testid="autoreply-mode">{data.autoReplyMode}</b>. In test mode every reply goes to you only, marked [TEST - please ignore].</p>
          <button className="rounded-full border border-border px-4 py-1" onClick={() => { const live = data.autoReplyMode !== 'live'; if (!live || confirm('Go live? Thank-you emails will go to the people who left feedback.')) op({ op: 'autoreply-mode', mode: live ? 'live' : 'test' }, 'Mode saved.'); }}>{data.autoReplyMode === 'live' ? 'Switch to test mode' : 'Go live'}</button></Box>
        <Pricing initial={data.pricing} save={save} />
      </>}

      {tab === 'Audit log' && <Box t="Admin actions" id="admin-log">{data.adminLog?.length ? <table className="w-full text-sm"><thead><tr className="text-left text-muted-foreground"><th>Time (IST)</th><th>Admin</th><th>Action</th><th>Target</th><th>Details</th></tr></thead><tbody>{data.adminLog.map((l: M, i: number) => <tr key={i} className="border-t border-border align-top"><td className="whitespace-nowrap">{l.at}</td><td>{l.admin}</td><td>{l.action}</td><td>{l.target}</td><td className="text-muted-foreground">{l.details}</td></tr>)}</tbody></table> : <NoData />}</Box>}
      <p className="text-xs text-muted-foreground">Made by Akash Sync Agent · charts by Recharts (MIT)</p>
    </main>
  );
}
