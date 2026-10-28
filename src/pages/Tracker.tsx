import React from 'react';
import { CalendarPlus, KanbanSquare } from 'lucide-react';
import { Badge, Button, Card, EmptyState, Input, PageHeader, Select } from '../components/ui';
import ReplyRate from '../components/ReplyRate';
import { useApp } from '../lib/state';
import { JOB_STATUSES, type Job, type JobStatus } from '../types';
import { downloadIcs, dueState, setStage, stageCounts } from '../lib/tracker';

const DUE: Record<string, string> = { overdue: 'Overdue', today: 'Due today', soon: 'Due soon' };
/** Application tracker: every job through Saved > Applied > Screening > Interviews > Offer > Accepted / Rejected / Withdrawn. */
export default function Tracker() {
  const { jobs, setJobs, go } = useApp();
  const patch = (id: string, p: Partial<Job>) => setJobs((js) => js.map((j) => (j.id === id ? { ...j, ...p } : j)));
  const c = stageCounts(jobs);
  const due = jobs.filter((j) => dueState(j)).sort((a, b) => (a.nextAction!.due! < b.nextAction!.due! ? -1 : 1));
  if (!jobs.length) return <><PageHeader eyebrow="Pipeline" title="Application tracker" /><EmptyState icon={<KanbanSquare size={32} />} title="No jobs yet" body="Find or add jobs first; they appear here as Saved." action={<Button onClick={() => go('jobs')}>Go to Jobs</Button>} /></>;
  return (
    <>
      <PageHeader eyebrow="Pipeline" title="Application tracker" subtitle="Move each job through its stages, keep dates and notes, and set the next action with a reminder. Reminders show here and on the dashboard; download an .ics to add one to your calendar." />
      <ReplyRate jobs={jobs} />
      <div data-testid="tracker-counts" className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
        {JOB_STATUSES.map((s) => <Card key={s} className="p-3"><div className="text-xs text-muted-foreground">{s}</div><div className="text-2xl font-semibold">{c[s] || 0}</div></Card>)}
      </div>
      {due.length > 0 && (
        <Card data-testid="tracker-due" className="mb-5"><h2 className="mb-2 text-xl font-medium">Reminders</h2>
          <ul className="grid gap-1 text-sm">{due.map((j) => <li key={j.id} className="flex flex-wrap items-center gap-2"><Badge tone={dueState(j) === 'overdue' ? 'gold' : 'primary'}>{DUE[dueState(j)!]}</Badge> {j.nextAction!.text} · <button className="underline cursor-pointer" onClick={() => go('job', j.id)}>{j.title} at {j.company}</button> · {j.nextAction!.due}</li>)}</ul>
        </Card>)}
      <div className="grid gap-3">
        {jobs.map((j) => {
          const d = dueState(j);
          return (
            <Card key={j.id} data-testid="tracker-row" className="grid gap-3 p-4 md:grid-cols-[1.4fr_180px_1.6fr]">
              <div className="min-w-0"><button className="text-left font-medium underline-offset-2 hover:underline cursor-pointer" onClick={() => go('job', j.id)}>{j.title}</button><div className="text-sm text-muted-foreground">{j.company}</div>
                <div className="mt-1 text-xs text-muted-foreground">{JOB_STATUSES.filter((s) => j.stageAt?.[s]).map((s) => `${s} ${j.stageAt![s]}`).join(' · ') || `Saved ${j.createdAt}`}{j.interviews.length ? ` · ${j.interviews.length} interview round(s)` : ''}</div></div>
              <Select aria-label={`Stage for ${j.title}`} value={j.status} onChange={(e) => patch(j.id, setStage(j, e.target.value as JobStatus))}>{JOB_STATUSES.map((s) => <option key={s}>{s}</option>)}</Select>
              <div className="grid gap-2 sm:grid-cols-[1fr_150px_auto]">
                <Input aria-label="Next action" placeholder="Next action, e.g. follow up with recruiter" value={j.nextAction?.text || ''} onChange={(e) => patch(j.id, { nextAction: { ...(j.nextAction || {}), text: e.target.value, done: false } })} />
                <Input aria-label="Due date" type="date" value={j.nextAction?.due || ''} onChange={(e) => patch(j.id, { nextAction: { text: j.nextAction?.text || 'Follow up', ...(j.nextAction || {}), due: e.target.value, done: false } })} />
                <div className="flex items-center gap-1">
                  {d && <Badge tone={d === 'overdue' ? 'gold' : 'primary'}>{DUE[d]}</Badge>}
                  {j.nextAction?.due && <Button size="sm" variant="ghost" aria-label="Download reminder (.ics)" onClick={() => downloadIcs(j)}><CalendarPlus size={16} /></Button>}
                  {j.nextAction?.text && <Button size="sm" variant="ghost" onClick={() => patch(j.id, { nextAction: { ...j.nextAction!, done: true } })}>Done</Button>}
                </div>
                <Input className="sm:col-span-3" aria-label="Notes" placeholder="Notes" value={j.notes} onChange={(e) => patch(j.id, { notes: e.target.value })} />
              </div>
            </Card>);
        })}
      </div>
    </>
  );
}
