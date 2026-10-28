import React, { useState } from 'react';
import { CheckCircle2, Eye, EyeOff, KeyRound, Loader2, ShieldCheck, Trash2 } from 'lucide-react';
import { Badge, Button, Card, Input, Label } from './ui';
import { clearUserApiKey, getUserApiKey, setUserApiKey, usingGuestKey } from '../lib/userApiKey';
import { testGeminiKey } from '../lib/keyTest';
import { useAiReady } from '../lib/aiReady';

export const KEY_URL = 'https://aistudio.google.com/app/apikey';

export default function ApiKeyCard({ prominent }: { prominent?: boolean }) {
  const [value, setValue] = useState('');
  const [show, setShow] = useState(false);
  const [testing, setTesting] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const { hasKey } = useAiReady();

  const save = () => {
    if (!value.trim()) return setMsg({ ok: false, text: 'Paste a key first.' });
    setUserApiKey(value); setValue(''); setMsg({ ok: true, text: 'Key saved in this browser only. Use Test key to check it.' });
  };
  const test = async () => {
    const k = value.trim() || getUserApiKey();
    setTesting(true); setMsg(null);
    const r = await testGeminiKey(k);
    if (r.ok && value.trim()) { setUserApiKey(value); setValue(''); r.text += ' Saved in this browser.'; }
    setMsg(r); setTesting(false);
  };

  return (
    <Card className={prominent ? 'border-primary/40 ring-1 ring-primary/30' : ''} id="api-key">
      <div className="mb-1 flex flex-wrap items-center gap-3">
        <KeyRound size={20} className="text-primary" />
        <h2 className="text-3xl">Add your free Gemini key</h2>
        <Badge tone={hasKey ? 'primary' : 'muted'}>{hasKey ? 'Saved in this browser' : 'Not set'}</Badge>
      </div>
      <p className="mb-3 text-sm text-muted-foreground">AI features (tailored resumes, cover letters, fit scores, interview prep, outreach) use your own free Gemini key. It takes about a minute and needs no card.</p>
      <a data-testid="get-key" className="mb-3 inline-flex h-10 items-center gap-2 rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90" href={KEY_URL} target="_blank" rel="noopener noreferrer"><KeyRound size={16} /> Get your free Gemini key</a>
      <ol data-testid="key-steps" className="mb-4 list-decimal space-y-1 pl-5 text-sm">
        <li><b>Sign in</b> with your Google account on the page that opens.</li>
        <li>Click <b>Create API key</b>.</li>
        <li><b>Copy</b> the key and <b>paste</b> it below, then press Test key.</li>
      </ol>
      <Label htmlFor="key">Gemini API key</Label>
      <div className="flex gap-2">
        <Input id="key" type={show ? 'text' : 'password'} autoComplete="off" spellCheck={false} value={value} onChange={(e) => setValue(e.target.value)} placeholder={hasKey ? '•••••••• saved. Paste to replace' : 'Paste your key'} />
        <Button variant="outline" onClick={() => setShow(!show)} aria-label={show ? 'Hide key' : 'Show key'}>{show ? <EyeOff size={16} /> : <Eye size={16} />}</Button>
      </div>
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
        <p data-testid="key-local-note">Your key stays in this browser. We don't save it on our servers. It's only sent along when you use an AI feature, so Google can answer that one request. Test key checks it with Google directly.</p>
      </div>
    </Card>
  );
}
