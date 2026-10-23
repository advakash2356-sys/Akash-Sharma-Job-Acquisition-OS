import { useEffect, useRef, useState } from 'react';
import { MessageCircle, ShieldCheck } from 'lucide-react';
import { Button, Card, Input, Label, Textarea } from './ui';

interface C { id: string; at: string; name: string; message: string; page: string; reply: string; replyAt: string }

/** Public comments. New comments wait for approval (no auto-publish), then show with any reply from the team. */
export default function Comments() {
  const [list, setList] = useState<C[] | null>(null);
  const [connected, setConnected] = useState(true);
  const [loadErr, setLoadErr] = useState('');
  const [f, setF] = useState({ name: '', email: '', message: '', website: '' });
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [msg, setMsg] = useState('');
  const t0 = useRef(Date.now());
  useEffect(() => {
    fetch('/api/comments').then((r) => r.json()).then((d) => { setList(d.comments || []); setConnected(d.connected !== false); if (d.error) setLoadErr(d.error); }).catch(() => { setList([]); setLoadErr('Comments could not be loaded right now.'); });
  }, []);
  const send = async (e: React.FormEvent) => {
    e.preventDefault(); if (state === 'sending') return;
    setState('sending'); setMsg('');
    try {
      const r = await fetch('/api/comments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...f, page: location.pathname, elapsedMs: Date.now() - t0.current }) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error || `Could not send (${r.status}).`);
      setState('sent'); setF({ name: '', email: '', message: '', website: '' });
    } catch (err: any) { setState('error'); setMsg(err.message); }
  };
  return (
    <Card id="comments" className="grid scroll-mt-24 gap-4">
      <div>
        <div className="label mb-1 text-primary">Public comments</div>
        <h2 className="text-3xl">What people are saying</h2>
        <p className="mt-1 flex items-start gap-2 text-sm text-muted-foreground"><ShieldCheck size={15} className="mt-0.5 shrink-0" />A person reads every comment before it appears, to keep out spam and personal data. Replies come from the Akash Sync Agent team. Your email (optional) is never shown.</p>
      </div>
      {list === null ? <p className="text-sm text-muted-foreground">Loading comments…</p>
        : list.length === 0 ? <p className="text-sm text-muted-foreground">{loadErr || (connected ? 'No comments yet. Be the first.' : 'Comments open soon: the comment inbox is being connected.')}</p>
        : <ul className="grid gap-3" data-testid="comment-list">{list.map((c) => (
          <li key={c.id} className="rounded-2xl border border-border p-4 text-sm">
            <div className="flex flex-wrap items-center gap-2"><MessageCircle size={14} className="text-primary" /><b>{c.name}</b><span className="text-xs text-muted-foreground">{c.at}</span></div>
            <p className="mt-1 whitespace-pre-wrap">{c.message}</p>
            {c.reply && <div className="mt-3 rounded-xl border-l-2 border-primary bg-primary/5 p-3"><div className="text-xs font-medium text-primary">Akash Sync Agent team{c.replyAt ? ` · ${c.replyAt}` : ''}</div><p className="mt-1 whitespace-pre-wrap">{c.reply}</p></div>}
          </li>))}</ul>}
      <form onSubmit={send} className="grid gap-3 rounded-2xl border border-border p-4" aria-label="Add a comment">
        <div className="grid gap-3 sm:grid-cols-2">
          <div><Label htmlFor="cn" hint="optional, shown">Name</Label><Input id="cn" maxLength={60} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Anonymous" /></div>
          <div><Label htmlFor="ce" hint="optional, private">Email</Label><Input id="ce" type="email" maxLength={120} value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></div>
        </div>
        <div className="hidden" aria-hidden="true"><label>Website<input tabIndex={-1} autoComplete="off" value={f.website} onChange={(e) => setF({ ...f, website: e.target.value })} name="website" /></label></div>
        <div><Label htmlFor="cm">Comment</Label><Textarea id="cm" rows={3} maxLength={1500} required value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} placeholder="A tip, a question or what worked for you. No phone numbers or resumes, please." /></div>
        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={state === 'sending' || f.message.trim().length < 3}>{state === 'sending' ? 'Sending…' : 'Post comment'}</Button>
          {state === 'sent' && <span role="status" className="text-sm text-primary">Thanks! Your comment will appear once it is approved.</span>}
          {state === 'error' && <span role="alert" className="text-sm text-danger">{msg}</span>}
        </div>
      </form>
    </Card>
  );
}
