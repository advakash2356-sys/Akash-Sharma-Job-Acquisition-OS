import { useEffect, useRef, useState } from 'react';
import { Mic, Square, Phone, Volume2 } from 'lucide-react';
import { Badge, Button, Card, Input, Label, Select, Textarea } from './ui';
import { Steps } from './Steps';
import { usePersisted } from '../lib/persist';
import { QUESTIONS, ROUNDS, analyze, highlight, type Analysis, type Round } from '../lib/voiceInterview';
import { CREDIT } from '../lib/brand';

interface Turn { q: string; answer: string; secs: number | null; a: Analysis }
const SR: any = typeof window !== 'undefined' ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition : null;
const speak = (t: string, onEnd?: () => void) => { if (!('speechSynthesis' in window)) { onEnd?.(); return; } speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(t); u.lang = 'en-IN'; u.rate = 0.95; u.onend = () => onEnd?.(); speechSynthesis.speak(u); };

/** Voice interview practice. Questions are spoken by the browser; answers are scored by simple rules on this device. */
export function VoiceInterview({ onTurn }: { onTurn?: (a: Analysis, q: string) => void } = {}) {
  const [cfg, setCfg] = usePersisted('jaos_voice_cfg', { role: '', round: 'hr' as Round });
  const [turns, setTurns] = usePersisted<Turn[]>('jaos_voice_turns', []);
  const [idx, setIdx] = useState(-1); const [follow, setFollow] = useState(false);
  const [text, setText] = useState(''); const [rec, setRec] = useState(false); const [secs, setSecs] = useState(0);
  const r = useRef<any>(null); const t0 = useRef(0); const timer = useRef<any>(null);
  const qs = QUESTIONS[cfg.round]; const role = cfg.role.trim() || 'this';
  const cur = idx >= 0 && idx < qs.length ? qs[idx] : null; const qText = cur ? (follow ? cur.follow : cur.q.replace('{role}', role)) : '';
  useEffect(() => () => { clearInterval(timer.current); r.current?.stop?.(); if ('speechSynthesis' in window) speechSynthesis.cancel(); }, []);
  const ask = (i: number, f: boolean) => { setIdx(i); setFollow(f); setText(''); setSecs(0); const q = qs[i]; if (q) speak(f ? q.follow : q.q.replace('{role}', role)); };
  const start = () => { setTurns([]); ask(0, false); };
  const listen = () => {
    if (!SR) return; const s = new SR(); s.lang = 'en-IN'; s.continuous = true; s.interimResults = true; let final = '';
    s.onresult = (e: any) => { let interim = ''; for (let i = e.resultIndex; i < e.results.length; i++) { const x = e.results[i]; if (x.isFinal) final += x[0].transcript + ' '; else interim += x[0].transcript; } setText((final + interim).trim()); };
    s.onend = () => setRec(false); r.current = s; t0.current = Date.now(); setSecs(0); clearInterval(timer.current); timer.current = setInterval(() => setSecs(Math.round((Date.now() - t0.current) / 1000)), 500); s.start(); setRec(true);
  };
  const stop = () => { r.current?.stop(); clearInterval(timer.current); setRec(false); };
  const submit = () => { stop(); if (!cur) return; const a = analyze(text, SR && secs ? secs : null, cur.keys, cfg.round); setTurns([...turns, { q: qText, answer: text, secs: SR && secs ? secs : null, a }]); onTurn?.(a, qText);
    if (!follow) ask(idx, true); else if (idx + 1 < qs.length) ask(idx + 1, false); else { setIdx(qs.length); speak('Thank you. That is the end of this practice call.'); } };
  const overall = turns.length ? Math.round(turns.reduce((s, x) => s + x.a.score, 0) / turns.length) : null;
  const replay = () => { let i = 0; const next = () => { if (i < turns.length) { speak(turns[i].q); i++; } }; next(); return next; };
  const [replayNext, setReplayNext] = useState<null | (() => void)>(null); const [rt, setRt] = useState(0);
  useEffect(() => { if (!replayNext) return; const h = setInterval(() => setRt((x) => x + 1), 1000); return () => clearInterval(h); }, [replayNext]);
  return (
    <div data-testid="voice-interview">
      <Steps id="voice" title="Voice interview practice (beta)" steps={[{ title: 'Pick your role and round', body: 'Then press Start call.' }, { title: 'Listen to the question, then answer out loud', body: 'Press Stop when done, then Submit. A follow-up question comes next.' }, { title: 'Read your scores and the transcript', body: 'Fillers are highlighted. Then read "Say it more naturally".' }, { title: 'Replay it as a real call', body: 'Answer again with the timer running, until it feels natural.' }]} />
      <Card className="mb-5 grid min-w-0 gap-3">
        <p className="rounded-lg bg-muted/50 p-3 text-sm"><b>Beta.</b> Questions are read aloud by your browser and answers are scored by simple rules on this device. Works best in Chrome or Edge on desktop or Android. Safari mostly works. Firefox can't capture voice, so type your answer instead. Your browser's speech service turns speech into text (Chrome uses Google's, Safari uses Apple's). We never receive or store your audio. Practice feedback, not a prediction of any interview result.</p>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="min-w-0"><Label htmlFor="vr">Role</Label><Input id="vr" value={cfg.role} placeholder="e.g. Operations team lead" onChange={(e) => setCfg({ ...cfg, role: e.target.value })} /></div>
          <div className="min-w-0"><Label htmlFor="vd">Round</Label><Select id="vd" className="w-full" value={cfg.round} onChange={(e) => { setCfg({ ...cfg, round: e.target.value as Round }); setIdx(-1); }}>{(Object.keys(ROUNDS) as Round[]).map((k) => <option key={k} value={k}>{ROUNDS[k]}</option>)}</Select></div>
          <div className="flex items-end"><Button onClick={start} data-testid="voice-start"><Phone size={16} /> Start call</Button></div>
        </div>
        {cur && <div className="grid gap-2 rounded-lg border border-border p-3" data-testid="voice-question">
          <div className="text-xs text-muted-foreground">Question {idx + 1} of {qs.length}{follow ? ' · follow-up' : ''}</div>
          <div className="flex items-start gap-2"><p className="font-medium">{qText}</p><button type="button" aria-label="Repeat the question" className="min-h-11 min-w-11" onClick={() => speak(qText)}><Volume2 size={16} /></button></div>
          <div className="flex flex-wrap items-center gap-2">{SR ? (rec ? <Button variant="outline" onClick={stop}><Square size={15} /> Stop ({secs}s)</Button> : <Button variant="outline" onClick={listen} data-testid="voice-mic"><Mic size={15} /> Answer by voice</Button>) : <Badge tone="gold">Voice capture not supported in this browser. Type your answer.</Badge>}</div>
          <Textarea aria-label="Your answer" rows={4} value={text} onChange={(e) => setText(e.target.value)} placeholder="Your answer appears here as you speak. You can also type it." />
          <Button className="w-fit" disabled={text.trim().length < 3} onClick={submit} data-testid="voice-submit">Submit answer</Button>
        </div>}
        {idx >= qs.length && <p className="text-sm">Call finished.</p>}
      </Card>
      {turns.length > 0 && <Card className="mb-5 grid min-w-0 gap-3" data-testid="voice-results">
        <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-xl font-medium">Your scores</h2><Badge tone="primary">Overall {overall}/100</Badge></div>
        {turns.map((x, i) => <div key={i} className="grid gap-2 rounded-lg border border-border p-3 text-sm [overflow-wrap:anywhere]">
          <b>{x.q}</b>
          {x.a.noAnswer && <Badge tone="danger">No real answer detected</Badge>}{x.a.tooShort && <Badge tone="gold">Answer too short</Badge>}
          <div className="flex flex-wrap gap-2"><Badge tone="primary">Answer {x.a.score}/100</Badge><Badge>Content {x.a.content}</Badge><Badge>Delivery {x.a.delivery}</Badge>{x.a.wpm != null && <Badge>{x.a.wpm} wpm</Badge>}<Badge>{x.a.words} words</Badge><Badge>STAR {Object.values(x.a.star).filter(Boolean).length}/4</Badge></div>
          <p data-testid="voice-transcript">{highlight(x.answer).map((p, k) => p.filler ? <mark key={k} className="rounded bg-red-100 px-0.5 text-red-800">{p.text}</mark> : <span key={k}>{p.text}</span>)}</p>
          {x.a.tips.length > 0 && <ul className="list-disc pl-5 text-muted-foreground">{x.a.tips.map((t) => <li key={t}>{t}</li>)}</ul>}
          <div className="rounded bg-muted/50 p-2"><div className="text-xs text-muted-foreground">Say it more naturally (your words, cleaned up)</div>{x.a.rewrite || '—'}</div>
        </div>)}
        <div className="flex flex-wrap items-center gap-2"><Button variant="outline" onClick={() => { setRt(0); setReplayNext(() => replay()); }} data-testid="voice-replay"><Phone size={15} /> Replay as a real call</Button>
          {replayNext && <><span className="font-mono">{Math.floor(rt / 60)}:{String(rt % 60).padStart(2, '0')}</span><Button variant="ghost" onClick={() => replayNext()}>Next question</Button><Button variant="ghost" onClick={() => { speechSynthesis.cancel(); setReplayNext(null); }}>End call</Button></>}</div>
        <p className="text-xs text-muted-foreground">Scores come from simple rules (keywords, STAR markers, words per minute, filler and slang lists). They are practice hints. Saved only in your browser. {CREDIT}.</p>
      </Card>}
    </div>
  );
}
