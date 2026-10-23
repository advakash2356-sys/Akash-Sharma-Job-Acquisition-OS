import React, { useRef, useState } from 'react';
import { CalendarSearch, FileUp, Mail } from 'lucide-react';
import { Button, Card, Dialog, Input, Label, Select, Textarea } from './ui';
import { useApp } from '../lib/state';
import { uid } from '../lib/utils';
import { calendarConnected, calendarItems, connectCalendar, disconnectCalendar, emailItem, parseIcs, toCandidates, type Candidate } from '../lib/interviewImport';

export default function InterviewImport() {
  const { jobs, setJobs } = useApp();
  const [busy, setBusy] = useState(''); const [msg, setMsg] = useState(''); const [list, setList] = useState<Candidate[]>([]);
  const [paste, setPaste] = useState(false); const [text, setText] = useState(''); const [connected, setConnected] = useState(calendarConnected());
  const file = useRef<HTMLInputElement>(null);
  const known = () => new Set(jobs.flatMap((j) => j.interviews.map((i) => i.extId || '')).filter(Boolean));
  const review = async (label: string, get: () => Promise<any[]>) => {
    setBusy(label); setMsg('');
    try {
      const raw = await get(); const { list: l, aiError } = await toCandidates(raw, jobs, known());
      setList(l);
      setMsg(`${l.length ? `${l.length} possible interview${l.length > 1 ? 's' : ''} found. Check and confirm below.` : 'No new interviews found.'}${aiError ? ` AI check unavailable (${aiError}); matched by keywords only, so review carefully.` : ''}`);
    } catch (e: any) { setMsg(e?.message || 'Something went wrong.'); }
    setBusy('');
  };
  const set = (k: string, p: Partial<Candidate>) => setList((l) => l.map((c) => (c.key === k ? { ...c, ...p } : c)));
  const addSelected = () => {
    const pick = list.filter((c) => c.selected && c.jobId && c.date);
    setJobs((js) => js.map((j) => { const mine = pick.filter((c) => c.jobId === j.id); if (!mine.length) return j;
      return { ...j, status: j.status === 'Saved' || j.status === 'Applied' || j.status === 'Screening' ? 'Interviewing' : j.status, interviews: [...j.interviews, ...mine.map((c) => ({ id: uid(), round: c.round, date: c.date, link: c.link, source: c.source, extId: c.extId, notes: [c.interviewer && `Interviewer: ${c.interviewer}`, c.link && `Link: ${c.link}`, c.minutes ? `${c.minutes} min` : ''].filter(Boolean).join('\n') }))] }; }));
    setMsg(`Added ${pick.length} interview${pick.length === 1 ? '' : 's'}.`); setList((l) => l.filter((c) => !pick.includes(c)));
  };
  return (
    <Card className="mb-6" data-testid="interview-import">
      <h2 className="mb-1 text-2xl">Add interviews automatically</h2>
      <p className="mb-4 text-sm text-muted-foreground">Find interview invites and add them as rounds. Nothing is added until you confirm. Calendar access is read-only, stays in this browser tab and is never sent to or stored on our server. Event text is sent to Gemini (AI) only to spot interviews.</p>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" disabled={!!busy} data-testid="cal-connect" onClick={() => review('cal', async () => { if (!calendarConnected()) { await connectCalendar(); setConnected(true); } return calendarItems(60); })}><CalendarSearch size={15} /> {busy === 'cal' ? 'Reading calendar…' : connected ? 'Scan Google Calendar (next 60 days)' : 'Connect Google Calendar (optional)'}</Button>
        <Button variant="outline" disabled={!!busy} data-testid="paste-invite" onClick={() => setPaste(true)}><Mail size={15} /> Paste invite email</Button>
        <Button variant="outline" disabled={!!busy} onClick={() => file.current?.click()}><FileUp size={15} /> Upload .ics</Button>
        <input ref={file} type="file" accept=".ics,text/calendar" className="hidden" data-testid="ics-input" onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ''; if (f) review('ics', async () => parseIcs(await f.text())); }} />
        {connected && <Button variant="ghost" onClick={() => { disconnectCalendar(); setConnected(false); setMsg('Calendar disconnected and access revoked.'); }}>Disconnect calendar</Button>}
      </div>
      {msg && <p className="mt-3 text-sm" role="status" data-testid="import-msg">{msg}</p>}
      {list.length > 0 && (
        <div className="mt-4 grid gap-3" data-testid="import-candidates">
          {list.map((c) => (
            <div key={c.key} className="rounded-2xl border border-border p-3" data-testid="import-candidate">
              <label className="flex items-center gap-2 font-medium"><input type="checkbox" checked={c.selected} onChange={(e) => set(c.key, { selected: e.target.checked })} /> {c.title || c.round} <span className="text-xs text-muted-foreground">({c.source === 'calendar' ? 'Google Calendar' : c.source === 'ics' ? '.ics file' : 'pasted email'}{c.aiChecked ? ', AI-checked' : ''})</span></label>
              <div className="mt-2 grid gap-2 sm:grid-cols-3">
                <div><Label>Job</Label><Select value={c.jobId} onChange={(e) => set(c.key, { jobId: e.target.value, selected: !!e.target.value })}><option value="">Choose a tracked job…</option>{jobs.map((j) => <option key={j.id} value={j.id}>{j.title} · {j.company}</option>)}</Select></div>
                <div><Label>Round</Label><Input value={c.round} onChange={(e) => set(c.key, { round: e.target.value })} /></div>
                <div><Label>Date and time (your time)</Label><Input type="datetime-local" value={c.date} onChange={(e) => set(c.key, { date: e.target.value })} /></div>
              </div>
              <div className="mt-2 text-sm text-muted-foreground">{[c.company && `Company: ${c.company}`, c.role && `Role: ${c.role}`, c.interviewer && `Interviewer: ${c.interviewer}`].filter(Boolean).join(' · ')}{c.link && <> · <a className="underline" href={c.link} target="_blank" rel="noreferrer noopener">Meeting link</a></>}</div>
              {!c.jobId && <p className="mt-1 text-xs text-muted-foreground">No tracked job matched. Pick one, or add the job first.</p>}
              {c.tzNote && <p className="mt-1 text-xs text-amber-700">{c.tzNote}</p>}
            </div>
          ))}
          <div className="flex justify-end gap-2"><Button variant="ghost" onClick={() => setList([])}>Discard</Button><Button data-testid="import-add" disabled={!list.some((c) => c.selected && c.jobId && c.date)} onClick={addSelected}>Add selected</Button></div>
        </div>
      )}
      <Dialog open={paste} onClose={() => setPaste(false)} title="Paste an interview invite">
        <div className="grid gap-3">
          <p className="text-sm text-muted-foreground">Paste the email text (no Gmail access needed). AI reads the company, role, round, time and link; times are converted to your time zone. You check everything before it is added.</p>
          <Textarea rows={10} value={text} data-testid="paste-text" onChange={(e) => setText(e.target.value)} placeholder="Hi Akash, we would like to invite you to a technical round on…" />
          <div className="flex justify-end gap-2"><Button variant="ghost" onClick={() => setPaste(false)}>Cancel</Button><Button disabled={!text.trim() || !!busy} data-testid="paste-go" onClick={async () => { setPaste(false); await review('email', async () => [emailItem(text)]); setText(''); }}>Read invite</Button></div>
        </div>
      </Dialog>
    </Card>
  );
}
