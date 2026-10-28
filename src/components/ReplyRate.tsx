import { Card } from './ui';
import type { Job } from '../types';
import { todayStr } from '../lib/insights';
import { companyRates, replyStats } from '../lib/ghost';

/** Your reply rate and which employers answered you. From your own tracker only; never shared or published. */
export default function ReplyRate({ jobs }: { jobs: Job[] }) {
  const now = todayStr(); const s = replyStats(jobs, now); const rows = companyRates(jobs, now).slice(0, 8);
  if (!s.applied) return null;
  return (
    <Card className="mb-5 grid gap-3" data-testid="reply-rate">
      <h2 className="text-xl font-medium">Who replied to you</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{[['Reply rate', s.rate == null ? '—' : `${s.rate}%`], ['Replied', s.replied], ['Ghosted (21+ days)', s.ghosted], ['Still waiting', s.waiting]].map(([k, v]) => <div key={String(k)}><div className="label text-muted-foreground">{k}</div><div className="font-mono text-2xl">{v}</div></div>)}</div>
      <table className="text-sm"><thead><tr className="text-left text-muted-foreground"><th className="py-1 font-normal">Employer</th><th className="font-normal">Applied</th><th className="font-normal">Replied</th><th className="font-normal">Ghosted</th></tr></thead>
        <tbody>{rows.map((r) => <tr key={r.company} className="border-t border-border/60"><td className="py-1">{r.company}</td><td>{r.applied}</td><td>{r.replied}</td><td>{r.ghosted}</td></tr>)}</tbody></table>
      <p className="text-xs text-muted-foreground">Counts applications at least 5 days old. Private to this browser: it is your own record, not a public rating of employers.</p>
    </Card>
  );
}
