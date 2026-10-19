import React from 'react';
import { BarChart3, FileDown } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { jsPDF } from 'jspdf';
import { Badge, Button, Card, EmptyState, PageHeader } from '../components/ui';
import { useApp } from '../lib/state';
import { bySource, funnel, skillGaps, sprintStats, weeklyApplications } from '../lib/insights';

const axis = { fill: 'var(--muted-foreground)', fontSize: 12 };
const tip = { contentStyle: { background: 'var(--card-solid)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--foreground)' } };

export default function Insights() {
  const { jobs, profile, go } = useApp();
  if (jobs.length === 0) return <><PageHeader title="Insights" /><EmptyState icon={<BarChart3 size={32} />} title="Nothing to analyse yet" body="Track a few jobs and mark them applied. Your funnel, weekly pace, sources and skill gaps appear here." action={<Button onClick={() => go('jobs')}>Go to Jobs</Button>} /></>;

  const f = funnel(jobs);
  const stages = [['Saved', f.saved], ['Applied', f.applied], ['Interviewing', f.interviewing], ['Offers', f.offers]].map(([stage, n]) => ({ stage, n }));
  const weekly = weeklyApplications(jobs);
  const src = bySource(jobs);
  const gaps = skillGaps(jobs);

  const report = () => {
    const d = new Date(), date = d.toISOString().slice(0, 10), name = `weekly-report-${date}.pdf`;
    const sp = sprintStats(jobs, parseInt(profile.dailyTarget) || 0);
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    doc.setFont('helvetica', 'bold'); doc.setFontSize(18); doc.text(`Weekly job-search report${profile.name ? `: ${profile.name}` : ''}`, 56, 64);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(11);
    const lines = [`Date: ${date}`, '', `Saved: ${f.saved}   Applied: ${f.applied}   Interviewing: ${f.interviewing}   Offers: ${f.offers}`, `Applications in the last 7 days: ${sp.week.reduce((a, b) => a + b.count, 0)}   Current streak: ${sp.streak} days`, '', 'Skill gaps seen across scored jobs:', ...(gaps.length ? gaps.map(([g, n]) => `  - ${g} (${n})`) : ['  none scored yet']), '', 'Recent jobs:', ...jobs.slice(0, 12).map((j) => `  - ${j.title}, ${j.company} [${j.status}]${j.score ? ` score ${j.score.score}` : ''}`)];
    let y = 96; lines.forEach((l) => { (doc.splitTextToSize(l, 480) as string[]).forEach((x) => { doc.text(x, 56, y); y += 16; }); });
    doc.setFontSize(8); doc.setTextColor(120); doc.text(name, 56, 810);
    doc.save(name);
  };

  return (
    <>
      <PageHeader title="Insights" subtitle="Computed from your own jobs. Nothing here is made up." action={<Button variant="outline" onClick={report}><FileDown size={16} /> Weekly report (PDF)</Button>} />
      <div className="grid gap-5 md:grid-cols-2">
        <Card>
          <h2 className="mb-3 text-3xl">Funnel</h2>
          <div className="h-60" role="img" aria-label="Funnel from saved to offers">
            <ResponsiveContainer><BarChart data={stages} layout="vertical"><CartesianGrid stroke="var(--border)" horizontal={false} /><XAxis type="number" allowDecimals={false} tick={axis} /><YAxis type="category" dataKey="stage" tick={axis} width={90} /><Tooltip {...tip} /><Bar dataKey="n" name="Jobs" fill="var(--primary)" radius={[0, 8, 8, 0]} /></BarChart></ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <h2 className="mb-3 text-3xl">Applications per week</h2>
          <div className="h-60" role="img" aria-label="Applications per week">
            <ResponsiveContainer><BarChart data={weekly}><CartesianGrid stroke="var(--border)" vertical={false} /><XAxis dataKey="week" tick={axis} /><YAxis allowDecimals={false} tick={axis} /><Tooltip {...tip} /><Bar dataKey="count" name="Applications" fill="var(--primary)" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <h2 className="mb-3 text-3xl">Where interviews come from</h2>
          {src.length === 0 ? <p className="text-sm text-muted-foreground">Mark jobs applied and set a source to compare channels.</p> : (
            <ul className="grid gap-3 text-sm">{src.map((s) => <li key={s.source} className="flex items-center justify-between"><span>{s.source}</span><span className="font-mono text-muted-foreground">{s.interviews} interviews / {s.total} applied</span></li>)}</ul>
          )}
        </Card>
        <Card>
          <h2 className="mb-3 text-3xl">Skill gaps</h2>
          {gaps.length === 0 ? <p className="text-sm text-muted-foreground">Score a few jobs. Gaps that repeat across roles show up here.</p> : (
            <div className="flex flex-wrap gap-2">{gaps.map(([g, n]) => <Badge key={g} tone={n > 1 ? 'primary' : 'muted'}>{g}{n > 1 ? ` ×${n}` : ''}</Badge>)}</div>
          )}
        </Card>
      </div>
    </>
  );
}
