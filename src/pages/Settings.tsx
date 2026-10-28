import React from 'react';
import { Card, Input, Label, PageHeader, Textarea } from '../components/ui';
import ApiKeyCard from '../components/ApiKeyCard';
import TestModeToggle from '../components/TestModeToggle';
import PrivacyToggles from '../components/PrivacyToggles';
import AccountCard from '../components/AccountCard';
import { useApp } from '../lib/state';
import DeleteDataButton from '../components/DeleteDataButton';

export default function SettingsPage() {
  const { profile, setProfile, user } = useApp();
  return (
    <>
      <PageHeader eyebrow="Account" title="Settings" subtitle="Your free API key, your account and your preferences." />
      <div className="grid max-w-3xl gap-5">
        <Card id="delete"><h2 className="mb-2 text-3xl">Delete my data</h2><p className="mb-3 text-sm text-muted-foreground">Removes everything this app saved in this browser: resumes, jobs, API keys and preferences, for every account. You will be asked to confirm.</p><DeleteDataButton /></Card>
        <ApiKeyCard prominent />
        <Card data-testid="extension-export"><h2 className="mb-2 text-3xl">Autofill extension (beta)</h2>
          <p className="mb-3 text-sm text-muted-foreground">Download your details as a file, then import it in the Job Acquisition OS Chrome extension. It fills forms on Workday, Greenhouse, Lever, iCIMS, Taleo, SuccessFactors and Naukri. You check every field and press Submit yourself; it never submits. Your API key is not included.</p>
          <button className="inline-flex min-h-11 items-center rounded-lg border border-border px-4 text-sm cursor-pointer hover:bg-muted" onClick={() => { const [first, ...rest] = (profile.name || '').trim().split(/\s+/); const links = profile.links || ''; const pick = (re: RegExp) => (links.match(re) || [''])[0];
            const data = { app: 'jaos-autofill', v: 1, firstName: first || '', lastName: rest.join(' '), fullName: profile.name, email: profile.email, phone: profile.phone, location: profile.location, headline: profile.headline, linkedin: pick(/https?:\/\/[^\s,]*linkedin\.com[^\s,]*/i), github: pick(/https?:\/\/[^\s,]*github\.com[^\s,]*/i), website: pick(/https?:\/\/(?![^\s,]*(linkedin|github)\.com)[^\s,]+/i), skills: profile.skills || '', summary: profile.experience || '', expectedCtc: profile.minCtc || '' };
            const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })); a.download = 'jaos-autofill-profile.json'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000); }}>Download profile for the extension</button>
        </Card>
        <AccountCard user={user} />
        <Card>
          <h2 className="mb-3 text-3xl">Preferences</h2>
          <TestModeToggle />
          <PrivacyToggles />
          <div className="mb-4 max-w-[180px]"><Label htmlFor="dt">Daily application target</Label><Input id="dt" inputMode="numeric" value={profile.dailyTarget} onChange={(e) => setProfile({ ...profile, dailyTarget: e.target.value.replace(/\D/g, '') })} /></div>
          <Label htmlFor="ai" hint="optional, added to every AI request">AI instructions</Label>
          <Textarea id="ai" rows={4} value={profile.aiInstructions} onChange={(e) => setProfile({ ...profile, aiInstructions: e.target.value })} placeholder="e.g. Keep a warm, direct tone. Never mention my current employer in outreach." />
        </Card>
      </div>
    </>
  );
}
