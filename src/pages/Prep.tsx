import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { Badge, Button, Card, EmptyState, Label, PageHeader, Select, Textarea } from '../components/ui';
import { AiError_, RunButton, useAiAction } from '../components/AiPanel';
import { useApp } from '../lib/state';
import { STAGES, type MockTurn, type StageId, type StagePrep } from '../lib/prep';
import { today } from '../lib/utils';
import { Briefcase } from 'lucide-react';
import { VoiceInterview } from '../components/VoiceInterview';

/** Face the screening: per job and per round, likely questions with STAR drafts from real resume facts, red flags, questions to ask, and a mock interview. */
export default function PrepPage() {
  const { jobs, setJobs, selectedJobId, go, hasResume } = useApp();
  const [id, setId] = useState(selectedJobId);
  const job = jobs.find((j) => j.id === id) || jobs.find((j) => j.id === selectedJobId) || jobs.find((j) => j.status === 'Interviewing' || j.status === 'Screening') || jobs[0];
  const [stage, setStage] = useState<StageId>('recruiter');
  const prep = useAiAction<StagePrep>('stage-prep', job);
  const mock = useAiAction<{ feedback: string; score: number; nextQuestion: string; done: boolean }>('mock-interview', job);
  const [answer, setAnswer] = useState('');
  if (!job) return <><PageHeader eyebrow="Face the screening" title="Interview prep" /><EmptyState icon={<Briefcase size={32} />} title="Add a job first" body="Prep is built from a job post and your resume." action={<Button onClick={() => go('jobs')}>Go to Jobs</Button>} /><div className="mt-5"><VoiceInterview /></div></>;
  const patch = (p: object) => setJobs((js) => js.map((j) => (j.id === job.id ? { ...j, ...p } : j)));
  const sp = job.stagePrep?.[stage];
  const turns: MockTurn[] = job.mock?.[stage] || [];
  const st = STAGES.find((s) => s.id === stage)!;
  const step = async (text?: string) => {
    const hist = text ? [...turns, { role: 'candidate' as const, text }] : turns;
    const r = await mock.run({ stage, history: hist });
    if (!r) return;
    const withFb = text ? hist.map((t, i) => (i === hist.length - 1 ? { ...t, feedback: r.feedback, score: r.score } : t)) : hist;
    patch({ mock: { ...(job.mock || {}), [stage]: r.done ? [...withFb, { role: 'interviewer', text: `Done. ${r.feedback}` }] : [...withFb, { role: 'interviewer', text: r.nextQuestion }] } });
    setAnswer('');
  };
  const scores = turns.filter((t) => t.score).map((t) => t.score!);
  return (
    <>
      <PageHeader eyebrow="Face the screening" title="Interview prep" subtitle="For each round: likely questions, answer drafts built only from your resume, the red flags a recruiter would spot, and a mock interview with feedback. AI-generated (Google Gemini) — review before use." />
      <VoiceInterview />
      <Card className="mb-5 grid gap-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[240px] flex-1"><Label htmlFor="prep-job">Job</Label><Select id="prep-job" value={job.id} onChange={(e) => setId(e.target.value)}>{jobs.map((j) => <option key={j.id} value={j.id}>{j.title} · {j.company} ({j.status})</option>)}</Select></div>
        </div>
        <div role="tablist" aria-label="Interview round" className="flex flex-wrap gap-2">
          {STAGES.map((s) => <button key={s.id} role="tab" aria-selected={stage === s.id} data-testid={`stage-${s.id}`} onClick={() => setStage(s.id)} className={`min-h-11 rounded-full border px-4 text-sm cursor-pointer ${stage === s.id ? 'border-primary bg-primary text-primary-foreground' : 'border-border'}`}>{s.label}{job.stagePrep?.[s.id] ? ' ✓' : ''}</button>)}
        </div>
        {job.interviews.length > 0 && <p className="text-sm text-muted-foreground">Your rounds for this job: {job.interviews.map((i) => `${i.round} (${i.date.slice(0, 10)})`).join(', ')}. Pick the matching tab above.</p>}
        <p className="text-sm text-muted-foreground">This round usually tests: {st.focus}.</p>
        {!hasResume && <p className="text-sm">Add your resume first. <button className="underline cursor-pointer" onClick={() => go('resume')}>Go to My resume</button></p>}
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card data-testid="stage-prep">
          <div className="mb-3 flex items-center justify-between gap-2"><h2 className="text-2xl">{st.label}: prep</h2>
            <RunButton loading={prep.loading} disabled={!hasResume} onClick={async () => { const r = await prep.run({ stage }); if (r) patch({ stagePrep: { ...(job.stagePrep || {}), [stage]: { ...r, generatedAt: today() } } }); }}>{sp ? 'Regenerate' : 'Generate prep'}</RunButton></div>
          <AiError_ error={prep.error} go={go} />
          {!sp ? <p className="text-sm text-muted-foreground">Nothing yet for this round.</p> : (
            <div className="grid gap-4 text-sm">
              <p><b>Focus:</b> {sp.focus}</p>
              <div><h3 className="mb-2 font-semibold">Likely questions</h3>
                {sp.questions.map((q, i) => (
                  <details key={i} className="mb-2 rounded-xl border border-border p-3"><summary className="cursor-pointer font-medium">{q.question}</summary>
                    <p className="mt-2 text-muted-foreground"><b>Why they ask:</b> {q.why}</p>
                    <div className="mt-2 grid gap-1"><p><b>S:</b> {q.star.situation}</p><p><b>T:</b> {q.star.task}</p><p><b>A:</b> {q.star.action}</p><p><b>R:</b> {q.star.result}</p></div>
                    <p className={`mt-2 text-xs ${/^No matching fact/i.test(q.factUsed) ? 'text-danger' : 'text-muted-foreground'}`}><b>From your resume:</b> {q.factUsed}</p>
                  </details>))}
              </div>
              <div><h3 className="mb-2 font-semibold">Red flags a recruiter would see</h3><ul className="grid gap-2">{sp.redFlags.map((r, i) => <li key={i} className="rounded-xl bg-danger/5 p-3"><b>{r.flag}</b><br /><span className="text-muted-foreground">{r.howToAddress}</span></li>)}</ul></div>
              <div><h3 className="mb-2 font-semibold">Questions to ask them</h3><ul className="list-disc pl-5">{sp.askThem.map((q, i) => <li key={i}>{q}</li>)}</ul></div>
            </div>)}
        </Card>

        <Card data-testid="mock-interview">
          <div className="mb-3 flex items-center justify-between gap-2"><h2 className="text-2xl">Mock interview</h2>{scores.length > 0 && <Badge tone="gold">Average {Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10}/10</Badge>}</div>
          <AiError_ error={mock.error} go={go} />
          <div className="mb-3 grid max-h-[480px] gap-2 overflow-y-auto" aria-live="polite">
            {turns.map((t, i) => (
              <div key={i} className={`rounded-xl p-3 text-sm ${t.role === 'interviewer' ? 'bg-muted/60' : 'ml-6 border border-border'}`}>
                <div className="label mb-1 text-muted-foreground">{t.role === 'interviewer' ? 'Interviewer' : 'You'}</div><p className="whitespace-pre-wrap">{t.text}</p>
                {t.feedback && <p className="mt-2 rounded-lg bg-primary/10 p-2 text-xs"><b>Feedback{t.score ? ` · ${t.score}/10` : ''}:</b> {t.feedback}</p>}
              </div>))}
          </div>
          {!turns.length
            ? <RunButton loading={mock.loading} disabled={!hasResume} onClick={() => step()}>Start mock {st.label.toLowerCase()}</RunButton>
            : (<div className="grid gap-2">
                <Label htmlFor="mock-answer">Your answer</Label>
                <Textarea id="mock-answer" rows={4} value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Answer as you would in the interview. Use real examples." />
                <div className="flex flex-wrap gap-2"><Button disabled={mock.loading || !answer.trim()} onClick={() => step(answer.trim())}><Send size={14} /> {mock.loading ? 'Thinking…' : 'Send answer'}</Button>
                  <Button variant="outline" onClick={() => patch({ mock: { ...(job.mock || {}), [stage]: [] } })}>Start over</Button></div>
              </div>)}
        </Card>
      </div>
    </>
  );
}
