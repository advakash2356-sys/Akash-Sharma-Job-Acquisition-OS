import { useState } from 'react';
import { Button, Card, Input, Label, Select } from './ui';
import { EDU_LABELS, WORK_CHOICES } from '../lib/jobSearch';
import type { Profile } from '../types';

/** Short form for people without a resume. Bilingual labels. Builds a plain-text profile that the rest of the app reads. */
export function buildResumeText(p: Partial<Profile>) {
  const work = WORK_CHOICES.filter((w) => (p.workPrefs || []).includes(w.id)).map((w) => w.en).join(', ');
  return [
    p.name ? `Name: ${p.name}` : '', p.age ? `Age: ${p.age}` : '', p.education ? `Education: ${EDU_LABELS[p.education]}` : '',
    p.location ? `City: ${p.location}` : '', p.skills ? `Skills: ${p.skills}` : '', work ? `Looking for work as: ${work}` : '',
    p.wantsGovt ? 'Open to government jobs: yes' : '', p.phone ? `Phone: ${p.phone}` : '',
  ].filter(Boolean).join('\n');
}

export default function ManualProfile({ initial, onSave }: { initial: Partial<Profile>; onSave: (p: Partial<Profile>) => void }) {
  const [f, setF] = useState<Partial<Profile>>({ education: '12', workPrefs: [], wantsGovt: true, ...initial });
  const [err, setErr] = useState('');
  const toggle = (id: string) => setF((x) => ({ ...x, workPrefs: (x.workPrefs || []).includes(id) ? (x.workPrefs || []).filter((w) => w !== id) : [...(x.workPrefs || []), id] }));
  const save = () => {
    if (!f.location?.trim()) return setErr('Enter your city / अपना शहर लिखें.');
    if (!(f.workPrefs || []).length && !f.wantsGovt) return setErr('Pick at least one kind of work or government jobs / कम से कम एक काम चुनें.');
    setErr('');
    onSave({ ...f, manual: true, targetRoles: WORK_CHOICES.filter((w) => (f.workPrefs || []).includes(w.id)).map((w) => w.en).join(', '), resumeText: buildResumeText(f), setupDone: undefined });
  };
  return (
    <div className="grid gap-4">
      <p className="text-sm text-muted-foreground">No resume? Fill this short form instead. Nothing here is sent anywhere until a search runs, and then only the kinds of work and your city. / रिज़्यूमे नहीं है? यह छोटा फॉर्म भरें।</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div><Label htmlFor="mn" hint="optional">Name / नाम</Label><Input id="mn" value={f.name || ''} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
        <div><Label htmlFor="ma">Age / उम्र</Label><Input id="ma" inputMode="numeric" value={f.age || ''} onChange={(e) => setF({ ...f, age: e.target.value.replace(/\D/g, '').slice(0, 2) })} /></div>
        <div><Label htmlFor="me">Education / पढ़ाई</Label>
          <Select id="me" value={f.education || ''} onChange={(e) => setF({ ...f, education: e.target.value as Profile['education'] })}>
            {Object.entries(EDU_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </Select></div>
        <div><Label htmlFor="mc">City / शहर</Label><Input id="mc" value={f.location || ''} onChange={(e) => setF({ ...f, location: e.target.value })} placeholder="Delhi" /></div>
        <div className="sm:col-span-2"><Label htmlFor="ms" hint="optional">Skills / हुनर</Label><Input id="ms" value={f.skills || ''} onChange={(e) => setF({ ...f, skills: e.target.value })} placeholder="e.g. two-wheeler licence, basic wiring, Hindi, English" /></div>
        <div className="sm:col-span-2"><Label htmlFor="mp" hint="optional">Phone / फोन</Label><Input id="mp" inputMode="tel" value={f.phone || ''} onChange={(e) => setF({ ...f, phone: e.target.value })} /></div>
      </div>
      <fieldset>
        <legend className="mb-2 text-sm font-medium">Preferred work / कौन सा काम चाहिए</legend>
        <div className="flex flex-wrap gap-2">
          {WORK_CHOICES.map((w) => {
            const on = (f.workPrefs || []).includes(w.id);
            return <button type="button" key={w.id} aria-pressed={on} onClick={() => toggle(w.id)} className={`cursor-pointer rounded-full border px-3 py-1.5 text-sm ${on ? 'border-primary bg-accent text-primary' : 'border-border hover:bg-muted'}`}>{w.en} · {w.hi}</button>;
          })}
        </div>
      </fieldset>
      <label className="flex cursor-pointer items-center gap-2 text-sm"><input type="checkbox" checked={!!f.wantsGovt} onChange={(e) => setF({ ...f, wantsGovt: e.target.checked })} /> Also show government jobs / सरकारी नौकरी भी दिखाएँ</label>
      {err && <p role="alert" className="text-sm text-danger">{err}</p>}
      <div><Button onClick={save}>Save and find jobs / सेव करें और नौकरी खोजें</Button></div>
    </div>
  );
}
