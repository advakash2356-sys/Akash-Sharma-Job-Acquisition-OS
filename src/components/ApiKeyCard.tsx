import React, { useState } from 'react';
import { CheckCircle2, Eye, EyeOff, KeyRound, Loader2, ShieldCheck, Trash2 } from 'lucide-react';
import { Badge, Button, Card, Input, Label } from './ui';
import { clearUserApiKey, getUserApiKey, setUserApiKey, usingGuestKey } from '../lib/userApiKey';
import { callAi } from '../lib/api';
import { useAiReady } from '../lib/aiReady';

export const KEY_URL = 'https://aistudio.google.com/apikey';

export default function ApiKeyCard({ prominent }: { prominent?: boolean }) {
  const [value, setValue] = useState('');
  const [show, setShow] = useState(false);
  const [testing, setTesting] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const { hasKey } = useAiReady();

  // Google issues two key formats: new "AQ." keys (about 53 characters) and older "AIza" keys (39). Format is not enforced;
  // Test key asks Google. Only an obviously partial paste (under 30 characters) is stopped.
  const shape = (v: string) => { const t = v.trim(); return t.length < 30 ? `This key is only ${t.length} characters, so it looks cut off. Copy it again with the copy button in AI Studio.` : ''; };
  const save = () => {
    if (!value.trim()) return setMsg({ ok: false, text: 'Paste a key first.' });
    const w = shape(value); if (w) return setMsg({ ok: false, text: w });
    setUserApiKey(value); setValue(''); setMsg({ ok: true, text: 'Key saved in this browser only. Use Test key to check it.' });
  };
  const test = async () => {
    if (value.trim()) { const w = shape(value); if (w) return setMsg({ ok: false, text: w }); setUserApiKey(value); setValue(''); }
    setTesting(true); setMsg({ ok: true, text: 'Testing with Google. This can take up to 20 seconds.' });
    try { await callAi('test-key', {}); setMsg({ ok: true, text: 'The key works. AI features are ready.' }); }
    catch (e: any) { setMsg({ ok: false, text: e.message || 'Test failed.' }); }
    finally { setTesting(false); }
  };

  return (
    <Card className={prominent ? 'border-primary/40 ring-1 ring-primary/30' : ''} id="api-key">
      <div className="mb-1 flex flex-wrap items-center gap-3">
        <KeyRound size={20} className="text-primary" />
        <h2 className="text-3xl">Add your free API key</h2>
        <Badge tone={hasKey ? 'primary' : 'muted'}>{hasKey ? 'Saved in this browser' : 'Not set'}</Badge>
      </div>
      <p className="mb-4 text-sm text-muted-foreground">
        A free Gemini key from Google AI Studio powers every AI feature: resume tailoring, cover letters, fit scores, the recruiter's read, interview prep and outreach. It takes a minute and needs no card.{' '}
        <a className="underline text-primary" href={KEY_URL} target="_blank" rel="noreferrer">Get your free key at aistudio.google.com/apikey</a>.
        Without a key the AI buttons stay disabled; everything else (jobs, charts, exports) works.
      </p>
      <Label htmlFor="key">Gemini API key</Label>
      <div className="flex gap-2">
        <Input id="key" type={show ? 'text' : 'password'} autoComplete="off" spellCheck={false} value={value} onChange={(e) => setValue(e.target.value)} placeholder={hasKey ? '•••••••• saved. Paste to replace' : 'Paste your key'} aria-describedby="key-len" />
        <Button variant="outline" onClick={() => setShow(!show)} aria-label={show ? 'Hide key' : 'Show key'}>{show ? <EyeOff size={16} /> : <Eye size={16} />}</Button>
      </div>
      {value && <p id="key-len" className="mt-1 text-xs text-muted-foreground">{value.trim().length} characters{value.trim().length < 30 ? ' (looks cut off; new keys start with "AQ." and are about 53 characters)' : '. Press Test key to check it with Google.'}</p>}
      <div className="mt-3 flex flex-wrap gap-2">
        <Button onClick={save}>Save key</Button>
        <Button variant="outline" onClick={test} disabled={testing || (!hasKey && !value.trim())}>{testing ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />} Test key</Button>
        {hasKey && <Button variant="danger" onClick={() => { clearUserApiKey(); setValue(''); setMsg({ ok: true, text: 'Key removed from this browser.' }); }}><Trash2 size={16} /> Remove</Button>}
      </div>
      <p data-testid="free-tier-warning" className="mt-3 rounded-lg border border-gold/40 bg-gold/10 px-3 py-2 text-sm">Free Gemini keys: Google may use what you send on its free tier to improve its products, and people at Google may review it. Use a paid (billing-enabled) key, or leave out sensitive details such as ID numbers, health or family information. <a className="underline text-primary" href="https://ai.google.dev/gemini-api/terms" target="_blank" rel="noreferrer">Google's terms</a></p>
      {usingGuestKey() && <p className="mt-3 text-sm text-muted-foreground">Using the key saved on this browser before sign-in was required. Save a key here to give this account its own.</p>}
      {msg && <p role="status" className={`mt-3 text-sm ${msg.ok ? 'text-primary' : 'text-danger'}`}>{msg.text}</p>}
      <div className="mt-4 flex gap-3 rounded-2xl bg-muted p-3 text-sm text-muted-foreground">
        <ShieldCheck size={18} className="mt-0.5 shrink-0 text-primary" />
        <p>Stored only in this browser. When you use an AI feature it is sent to this app's serverless function, which forwards it to Google for that one request. It is not stored or logged by this app. See Privacy & security.</p>
      </div>
    </Card>
  );
}
