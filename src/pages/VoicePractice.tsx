import { useEffect, useState } from 'react';
import { Bell, CalendarPlus, FileDown, Presentation, Trophy } from 'lucide-react';
import { Badge, Button, Card, Input, Label, PageHeader } from '../components/ui';
import { LocalNote } from '../components/LocalNote';
import { VoiceInterview } from '../components/VoiceInterview';
import { clearPersisted, usePersisted } from '../lib/persist';
import { DAILY_CAP, NEW_GAME, addAnswer, designationPack, inQuiet, practisedToday, reminderIcs, type Game } from '../lib/voiceGame';
import { downloadText } from '../lib/exportResult';
import { CREDIT } from '../lib/brand';

const URL_ = 'https://akash-sharma-job-acquisition-os.vercel.app/voice-practice';
function Trend({ g }: { g: Game }) {
  const h = g.history.slice(-30); if (h.length < 1) return <p className="text-sm text-muted-foreground">Your chart starts after your first counted answer.</p>;
  const W = 320, H = 120, x = (i: number) => (h.length === 1 ? W / 2 : 10 + (i * (W - 20)) / (h.length - 1)), y = (v: number) => H - 10 - ((v - 1) / 9) * (H - 20);
  return <svg viewBox={`0 0 ${W} ${H}`} className="h-32 w-full max-w-md" role="img" aria-label={`Level trend from ${h[0].level} to ${h[h.length - 1].level}`} data-testid="game-chart">
    {[1, 5, 10].map((v) => <g key={v}><line x1="0" x2={W} y1={y(v)} y2={y(v)} stroke="currentColor" strokeOpacity=".12" /><text x="2" y={y(v) - 2} fontSize="9" fill="currentColor" opacity=".5">{v}</text></g>)}
    {g.baseline != null && <line x1="0" x2={W} y1={y(g.baseline)} y2={y(g.baseline)} stroke="currentColor" strokeDasharray="4 3" strokeOpacity=".4" />}
    <polyline fill="none" stroke="currentColor" strokeWidth="2" className="text-primary" points={h.map((s, i) => `${x(i)},${y(s.level)}`).join(' ')} />
    {h.map((s, i) => <circle key={i} cx={x(i)} cy={y(s.level)} r="3" className="fill-primary" />)}
  </svg>;
}

export default function VoicePractice() {
  const [g, setG] = usePersisted<Game>('jaos_voice_game', NEW_GAME);
  const [rem, setRem] = usePersisted('jaos_voice_reminder', { on: false, hour: 19, quietFrom: 22, quietTo: 8 });
  const [title, setTitle] = usePersisted('jaos_voice_designation', '');
  const [last, setLast] = useState('');
  useEffect(() => { // Local reminder: only while this site is open in the browser. No server, no push.
    if (!rem.on || !('Notification' in window) || Notification.permission !== 'granted') return;
    const tick = () => { const now = new Date(); if (!practisedToday(g) && now.getHours() >= rem.hour && !inQuiet(now.getHours(), rem.quietFrom, rem.quietTo) && localStorage.getItem('jaos_voice_nudged') !== now.toDateString()) { new Notification('Hi, you forgot to practise today', { body: 'Two answers out loud keeps your level moving.', icon: '/icon-192.png' }); localStorage.setItem('jaos_voice_nudged', now.toDateString()); } };
    tick(); const h = setInterval(tick, 60_000); return () => clearInterval(h);
  }, [rem, g]);
  const onTurn = (a: any) => { const r = addAnswer(g, a); setG(r.game); setLast(r.counted ? `Counted: rated ${r.rating}/10. Level ${r.game.level}${r.delta ? ` (${r.delta > 0 ? '+' : ''}${r.delta})` : ''}. +10 XP.${r.game.todayGain >= DAILY_CAP ? ' Daily growth cap reached; come back tomorrow.' : ''}` : `Not counted: ${r.why}. 0 points, no XP.`); };
  const pack = designationPack(title);
  const now = g.history[g.history.length - 1]; const skills = now?.skills;
  const strengths = skills ? Object.entries(skills).filter(([, v]) => v >= 70).map(([k]) => k) : [], weak = skills ? Object.entries(skills).filter(([, v]) => v < 70).map(([k]) => k) : [];
  const exportPdf = async () => { const { jsPDF } = await import('jspdf'); const p = new jsPDF({ unit: 'pt', format: 'a4' }); let y = 50; const L = (t: string, s = 10, b = false) => { p.setFont('helvetica', b ? 'bold' : 'normal'); p.setFontSize(s); for (const line of p.splitTextToSize(t, 500)) { if (y > 800) { p.addPage(); y = 50; } p.text(line, 48, y); y += s + 4; } };
    L(`Interview preparation pack: ${title || 'any role'}`, 16, true); L(`Level ${g.level ?? '-'} / 10 (started at ${g.baseline ?? '-'}) · streak ${g.streak} day(s) · ${g.history.length} practice day(s)`); y += 6;
    L('Trend: ' + (g.history.slice(-10).map((h) => `${h.date.slice(5)} ${h.level}`).join(', ') || 'no sessions yet'));
    if (skills) L(`Skills now: delivery ${skills.delivery}, content ${skills.content}, wording ${skills.wording} (out of 100)`);
    L(`Strengths: ${strengths.join(', ') || '-'}   To work on: ${weak.join(', ') || '-'}`); y += 6;
    pack.forEach((x, i) => { L(`${i + 1}. ${x.q}`, 11, true); L(`What to say: ${x.what}`); L(`Model answer: ${x.model}`); L(`How to say it: ${x.how}`); y += 4; });
    y += 6; L(`Practice feedback from simple rules, not a prediction of any result. ${CREDIT}.`, 8); p.save('interview-prep-pack.pdf'); };
  const exportPptx = async () => { const P = (await import('pptxgenjs')).default; const pp = new P(); pp.layout = 'LAYOUT_WIDE';
    const s1 = pp.addSlide(); s1.addText(`Interview prep: ${title || 'any role'}`, { x: 0.5, y: 0.5, w: 12, h: 1, fontSize: 32, bold: true }); s1.addText(`Level ${g.level ?? '-'} / 10 (started at ${g.baseline ?? '-'})\nStreak: ${g.streak} day(s)\nStrengths: ${strengths.join(', ') || '-'}\nTo work on: ${weak.join(', ') || '-'}`, { x: 0.5, y: 1.8, w: 12, h: 3, fontSize: 20 });
    if (g.history.length) s1.addChart(pp.ChartType.line, [{ name: 'Level', labels: g.history.slice(-14).map((h) => h.date.slice(5)), values: g.history.slice(-14).map((h) => h.level) }], { x: 7, y: 3.6, w: 5.8, h: 3.4, valAxisMinVal: 1, valAxisMaxVal: 10 });
    for (const x of pack) { const s = pp.addSlide(); s.addText(x.q, { x: 0.5, y: 0.4, w: 12.3, h: 1, fontSize: 24, bold: true }); s.addText([{ text: 'What to say: ', options: { bold: true } }, { text: x.what + '\n\n' }, { text: 'Model answer: ', options: { bold: true } }, { text: x.model + '\n\n' }, { text: 'How to say it: ', options: { bold: true } }, { text: x.how }], { x: 0.5, y: 1.5, w: 12.3, h: 5, fontSize: 16, valign: 'top' }); s.addText(CREDIT, { x: 0.5, y: 7, w: 12, h: 0.3, fontSize: 9, color: '888888' }); }
    await pp.writeFile({ fileName: 'interview-prep-pack.pptx' }); };
  const enableNotif = async () => { if (!('Notification' in window)) { alert('This browser does not support notifications. Use the calendar reminder instead.'); return; } const p = await Notification.requestPermission(); setRem({ ...rem, on: p === 'granted' }); };
  return (<>
    <PageHeader eyebrow="Free · beta · runs in your browser" title="Voice interview practice" subtitle="Interviews often happen on a call. Hear each question, answer out loud, and level up from 1 to 10. Growth is slow on purpose: real answers only, small steps, a daily cap." />
    <LocalNote onClear={() => { clearPersisted('jaos_voice_cfg', 'jaos_voice_turns', 'jaos_steps_voice', 'jaos_voice_game', 'jaos_voice_reminder', 'jaos_voice_designation'); location.reload(); }} />
    <Card className="mb-5 grid min-w-0 gap-3" data-testid="game-panel">
      <div className="flex flex-wrap items-end justify-between gap-3"><div><div className="text-xs text-muted-foreground">Your level</div><div className="font-mono text-5xl" data-testid="game-level">{g.level ?? '–'}<span className="text-xl text-muted-foreground">/10</span></div>
        <div className="text-sm text-muted-foreground">{g.baseline != null ? `Started at ${g.baseline} · ${g.level! >= g.baseline ? '+' : ''}${Math.round((g.level! - g.baseline) * 10) / 10} since` : 'Answer a question to get your starting level.'}</div></div>
        <div className="flex flex-wrap gap-2"><Badge tone="primary">🔥 {g.streak}-day streak</Badge><Badge>{g.xp} XP</Badge><Badge>Today +{g.todayGain} of {DAILY_CAP} max</Badge></div></div>
      {last && <p className="text-sm" role="status" data-testid="game-last">{last}</p>}
      <Trend g={g} />
      {skills && <div className="grid gap-2 sm:grid-cols-3" data-testid="game-skills">{(['delivery', 'content', 'wording'] as const).map((k) => <div key={k}><div className="flex justify-between text-sm"><span className="capitalize">{k}</span><span>{skills[k]}</span></div><div className="h-2 rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${skills[k]}%` }} /></div></div>)}</div>}
      {g.badges.length > 0 && <div className="flex flex-wrap gap-2" data-testid="game-badges">{g.badges.map((b) => <Badge key={b} tone="gold"><Trophy size={12} className="mr-1 inline" />{b}</Badge>)}</div>}
      <p className="text-xs text-muted-foreground">How it works: each answer is rated 1 to 10 (content 40%, delivery 40%, wording 20%). It only counts if it passes a sanity check: real words, on topic, at least 25 words, not fillers. A counted answer moves your level by at most +0.1, and by at most +{DAILY_CAP} a day.</p>
    </Card>
    <VoiceInterview onTurn={onTurn} />
    <Card className="mb-5 grid min-w-0 gap-3" data-testid="designation"><h2 className="text-xl font-medium">Prepare for any designation</h2>
      <div className="max-w-md"><Label htmlFor="dt">Job title (any, even if not in a listing)</Label><Input id="dt" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Vendor management lead" /></div>
      <ol className="grid gap-3">{pack.map((x, i) => <li key={i} className="rounded-lg border border-border p-3 text-sm [overflow-wrap:anywhere]"><b>{i + 1}. {x.q}</b><p className="mt-1"><b>What to say:</b> {x.what}</p><p className="mt-1"><b>Model answer:</b> {x.model}</p><p className="mt-1 text-muted-foreground"><b>How to say it:</b> {x.how}</p></li>)}</ol>
      <p className="text-xs text-muted-foreground">Model answers are templates: fill the [brackets] with your own true examples. Never claim experience you don't have.</p>
      <div className="flex flex-wrap gap-2"><Button variant="outline" onClick={exportPdf} data-testid="export-pdf"><FileDown size={15} /> Download prep pack (PDF)</Button><Button variant="outline" onClick={exportPptx} data-testid="export-pptx"><Presentation size={15} /> Download slides (PPTX)</Button></div>
    </Card>
    <Card className="mb-5 grid min-w-0 gap-3" data-testid="reminder"><h2 className="text-xl font-medium">Daily reminder</h2>
      <div className="grid gap-3 sm:grid-cols-3"><div><Label htmlFor="rh">Remind me after (hour, 0-23)</Label><Input id="rh" inputMode="numeric" value={String(rem.hour)} onChange={(e) => setRem({ ...rem, hour: Math.min(23, Number(e.target.value.replace(/\D/g, '')) || 0) })} /></div>
        <div><Label htmlFor="qf">Quiet hours from</Label><Input id="qf" inputMode="numeric" value={String(rem.quietFrom)} onChange={(e) => setRem({ ...rem, quietFrom: Math.min(23, Number(e.target.value.replace(/\D/g, '')) || 0) })} /></div>
        <div><Label htmlFor="qt">Quiet hours to</Label><Input id="qt" inputMode="numeric" value={String(rem.quietTo)} onChange={(e) => setRem({ ...rem, quietTo: Math.min(23, Number(e.target.value.replace(/\D/g, '')) || 0) })} /></div></div>
      <div className="flex flex-wrap gap-2">{rem.on ? <Button variant="outline" onClick={() => setRem({ ...rem, on: false })}><Bell size={15} /> Browser reminder on (turn off)</Button> : <Button variant="outline" onClick={enableNotif} data-testid="notif-on"><Bell size={15} /> Turn on browser reminder</Button>}
        <Button variant="outline" onClick={() => downloadText('practice-reminder.ics', reminderIcs(rem.hour, URL_))} data-testid="ics"><CalendarPlus size={15} /> Add daily reminder to my calendar (.ics)</Button></div>
      <p className="text-xs text-muted-foreground">The browser reminder ("Hi, you forgot to practise today") only appears while this site is open in a tab; there is no server or push service. For a reminder that always arrives, add the .ics file to your own calendar. Nothing is collected.</p>
    </Card>
    <p className="text-xs text-muted-foreground">{CREDIT}.</p>
  </>);
}
