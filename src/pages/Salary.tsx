import React from 'react';
import { LineChart as LineIcon } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Button, Card, EmptyState, PageHeader } from '../components/ui';
import { useApp } from '../lib/state';

const axis = { fill: 'var(--muted-foreground)', fontSize: 12 };

export default function Salary() {
  const { jobs, profile, go } = useApp();
  const withPay = jobs.filter((j) => j.salaryMin != null || j.salaryMax != null || j.offerAmount != null);
  const target = parseFloat(profile.minCtc.replace(/[^0-9.]/g, ''));
  const ranges = withPay.map((j) => ({
    name: `${j.company}`.slice(0, 16),
    min: j.salaryMin ?? j.salaryMax ?? 0,
    spread: j.salaryMin != null && j.salaryMax != null ? Math.max(0, j.salaryMax - j.salaryMin) : 0,
    offer: j.offerAmount,
  }));
  const byMonth = new Map<string, number[]>();
  withPay.forEach((j) => {
    const mid = j.salaryMin != null && j.salaryMax != null ? (j.salaryMin + j.salaryMax) / 2 : (j.salaryMax ?? j.salaryMin);
    if (mid == null) return;
    const m = j.createdAt.slice(0, 7);
    byMonth.set(m, [...(byMonth.get(m) || []), mid]);
  });
  const trend = [...byMonth.entries()].sort().map(([m, v]) => ({ month: m, avg: +(v.reduce((a, b) => a + b, 0) / v.length).toFixed(1) }));
  const offers = jobs.filter((j) => j.offerAmount != null);
  const tip = { contentStyle: { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--foreground)' } };

  return (
    <>
      <PageHeader title="Salary" subtitle="Built only from the pay you enter on your jobs. Set a target on My resume (Minimum pay) to see it as a line." />
      {withPay.length === 0 ? (
        <EmptyState icon={<LineIcon size={32} />} title="No pay data yet" body="Add pay min / max (and any offer) to a job and your charts appear here." action={<Button onClick={() => go('jobs')}>Go to Jobs</Button>} />
      ) : (
        <div className="grid gap-5">
          <div className="grid grid-cols-3 gap-3">
            <Card className="p-4"><div className="font-mono text-2xl text-gold">{isNaN(target) ? '—' : target}</div><div className="text-sm text-muted-foreground">Your target</div></Card>
            <Card className="p-4"><div className="font-mono text-2xl">{withPay.length}</div><div className="text-sm text-muted-foreground">Jobs with pay</div></Card>
            <Card className="p-4"><div className="font-mono text-2xl text-gold">{offers.length ? Math.max(...offers.map((o) => o.offerAmount!)) : '—'}</div><div className="text-sm text-muted-foreground">Best offer</div></Card>
          </div>
          <Card>
            <h2 className="mb-3 text-xl font-medium">Pay range by job</h2>
            <div className="h-72" role="img" aria-label="Bar chart of pay ranges per job">
              <ResponsiveContainer>
                <BarChart data={ranges}>
                  <CartesianGrid stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="name" tick={axis} /><YAxis tick={axis} /><Tooltip {...tip} /><Legend />
                  <Bar dataKey="min" name="Min" stackId="a" fill="var(--primary)" />
                  <Bar dataKey="spread" name="Up to max" stackId="a" fill="var(--primary)" fillOpacity={0.3} />
                  {!isNaN(target) && <ReferenceLine y={target} stroke="var(--gold)" strokeDasharray="4 4" label={{ value: 'Target', fill: 'var(--gold)', fontSize: 12 }} />}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
          <Card>
            <h2 className="mb-3 text-xl font-medium">Average advertised pay over time</h2>
            {trend.length < 2 ? <p className="text-sm text-muted-foreground">Needs jobs added in at least two different months to show a trend.</p> : (
              <div className="h-64" role="img" aria-label="Line chart of average pay by month added">
                <ResponsiveContainer>
                  <LineChart data={trend}>
                    <CartesianGrid stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="month" tick={axis} /><YAxis tick={axis} /><Tooltip {...tip} />
                    <Line dataKey="avg" name="Average" stroke="var(--primary)" strokeWidth={2} dot />
                    {!isNaN(target) && <ReferenceLine y={target} stroke="var(--gold)" strokeDasharray="4 4" />}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>
        </div>
      )}
    </>
  );
}
