import React from 'react';
import { Card, Input, Label, PageHeader, Textarea } from '../components/ui';
import ApiKeyCard from '../components/ApiKeyCard';
import TestModeToggle from '../components/TestModeToggle';
import AccountCard from '../components/AccountCard';
import { useApp } from '../lib/state';

export default function SettingsPage() {
  const { profile, setProfile, user } = useApp();
  return (
    <>
      <PageHeader eyebrow="Account" title="Settings" subtitle="Your free API key, your account and your preferences." />
      <div className="grid max-w-3xl gap-5">
        <ApiKeyCard prominent />
        <AccountCard user={user} />
        <Card>
          <h2 className="mb-3 text-3xl">Preferences</h2>
          <TestModeToggle />
          <div className="mb-4 max-w-[180px]"><Label htmlFor="dt">Daily application target</Label><Input id="dt" inputMode="numeric" value={profile.dailyTarget} onChange={(e) => setProfile({ ...profile, dailyTarget: e.target.value.replace(/\D/g, '') })} /></div>
          <Label htmlFor="ai" hint="optional, added to every AI request">AI instructions</Label>
          <Textarea id="ai" rows={4} value={profile.aiInstructions} onChange={(e) => setProfile({ ...profile, aiInstructions: e.target.value })} placeholder="e.g. Keep a warm, direct tone. Never mention my current employer in outreach." />
        </Card>
      </div>
    </>
  );
}
