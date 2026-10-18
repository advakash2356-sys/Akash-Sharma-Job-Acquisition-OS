import React, { useState } from 'react';
import { Eye, EyeOff, ShieldCheck, Trash2 } from 'lucide-react';
import { Button, Card, Input, Label, PageHeader, Badge, Textarea } from '../components/ui';
import { useApp } from '../lib/state';
import { clearUserApiKey, getUserApiKey, setUserApiKey } from '../lib/userApiKey';

export default function SettingsPage() {
  const { profile, setProfile } = useApp();
  const [value, setValue] = useState('');
  const [show, setShow] = useState(false);
  const [saved, setSaved] = useState(() => !!getUserApiKey());
  const [msg, setMsg] = useState('');

  return (
    <>
      <PageHeader title="Settings" subtitle="AI features use a free Gemini API key. You bring your own." />
      <Card className="max-w-2xl">
        <div className="mb-1 flex items-center gap-3">
          <h2 className="text-xl font-medium">Gemini API key</h2>
          <Badge tone={saved ? 'primary' : 'muted'}>{saved ? 'Saved in this browser' : 'Not set'}</Badge>
        </div>
        <p className="mb-4 text-sm text-muted-foreground">
          Get a free key at <a className="underline" href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer">aistudio.google.com/apikey</a>. No card needed.
        </p>
        <Label htmlFor="key">API key</Label>
        <div className="flex gap-2">
          <Input id="key" type={show ? 'text' : 'password'} autoComplete="off" spellCheck={false} value={value} onChange={(e) => setValue(e.target.value)} placeholder={saved ? '•••••••• saved. Paste to replace' : 'Paste your key'} />
          <Button variant="outline" onClick={() => setShow(!show)} aria-label={show ? 'Hide key' : 'Show key'}>{show ? <EyeOff size={16} /> : <Eye size={16} />}</Button>
        </div>
        <div className="mt-3 flex gap-2">
          <Button onClick={() => { if (!value.trim()) return setMsg('Paste a key first.'); setUserApiKey(value); setValue(''); setSaved(true); setMsg('Key saved in this browser only.'); }}>Save key</Button>
          {saved && <Button variant="danger" onClick={() => { clearUserApiKey(); setSaved(false); setValue(''); setMsg('Key removed.'); }}><Trash2 size={16} /> Remove</Button>}
        </div>
        {msg && <p role="status" className="mt-3 text-sm text-primary">{msg}</p>}
        <div className="mt-5 flex gap-3 rounded-lg bg-muted p-3 text-sm text-muted-foreground">
          <ShieldCheck size={18} className="mt-0.5 shrink-0 text-primary" />
          <p>The key stays in this browser's storage. It is never committed or logged. Each AI request sends it to this app's server, which forwards it to Google for that one request and does not store it.</p>
        </div>
      </Card>
      <Card className="mt-5 max-w-2xl">
        <h2 className="mb-3 text-2xl">Preferences</h2>
        <div className="mb-4 max-w-[180px]"><Label htmlFor="dt">Daily application target</Label><Input id="dt" inputMode="numeric" value={profile.dailyTarget} onChange={(e) => setProfile({ ...profile, dailyTarget: e.target.value.replace(/\D/g, '') })} /></div>
        <Label htmlFor="ai" hint="optional, added to every AI request">AI instructions</Label>
        <Textarea id="ai" rows={4} value={profile.aiInstructions} onChange={(e) => setProfile({ ...profile, aiInstructions: e.target.value })} placeholder="e.g. Keep a warm, direct tone. Never mention my current employer in outreach." />
      </Card>
    </>
  );
}
