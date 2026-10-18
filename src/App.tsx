import React, { useEffect, useState } from 'react';
import { LayoutDashboard, Briefcase, CalendarDays, FileText, Wand2, Send, Settings as Cog, Menu, Sun, Moon, X } from 'lucide-react';
import { emptyProfile, type Job, type Profile } from './types';
import { Ctx, type PageId } from './lib/state';
import { useLocalState } from './lib/useLocalState';
import { cn } from './lib/utils';
import Overview from './pages/Overview';
import Jobs from './pages/Jobs';
import Interviews from './pages/Interviews';
import ResumePage from './pages/Resume';
import Tailor from './pages/Tailor';
import Outreach from './pages/Outreach';
import SettingsPage from './pages/Settings';

const NAV: { group: string; items: { id: PageId; label: string; icon: React.ElementType }[] }[] = [
  { group: 'Overview', items: [{ id: 'overview', label: 'Dashboard', icon: LayoutDashboard }] },
  { group: 'Pipeline', items: [{ id: 'jobs', label: 'Jobs', icon: Briefcase }, { id: 'interviews', label: 'Interviews', icon: CalendarDays }] },
  { group: 'Resume', items: [{ id: 'resume', label: 'My resume', icon: FileText }, { id: 'tailor', label: 'Tailor & cover letter', icon: Wand2 }] },
  { group: 'Outreach', items: [{ id: 'outreach', label: 'Outreach studio', icon: Send }] },
  { group: 'Account', items: [{ id: 'settings', label: 'Settings', icon: Cog }] },
];

export default function App() {
  const [profile, setProfile] = useLocalState<Profile>('jaos_profile_v1', emptyProfile);
  const [jobs, setJobs] = useLocalState<Job[]>('jaos_jobs_v1', []);
  const [page, setPage] = useState<PageId>('overview');
  const [selectedJobId, setSelectedJobId] = useState('');
  const [menu, setMenu] = useState(false);
  const [dark, setDark] = useState(() => {
    const s = localStorage.getItem('jaos_theme');
    return s ? s === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('jaos_theme', dark ? 'dark' : 'light');
  }, [dark]);

  const go = (p: PageId, jobId?: string) => {
    if (jobId) setSelectedJobId(jobId);
    setPage(p);
    setMenu(false);
    window.scrollTo(0, 0);
  };
  const hasResume = profile.resumeText.trim().length >= 50;

  const Page = { overview: Overview, jobs: Jobs, interviews: Interviews, resume: ResumePage, tailor: Tailor, outreach: Outreach, settings: SettingsPage }[page];

  const sidebar = (
    <nav aria-label="Main" className="flex h-full flex-col gap-6 overflow-y-auto p-4">
      <div className="px-2 pt-1">
        <div className="font-serif text-xl font-medium">Job OS</div>
        <div className="text-xs text-muted-foreground">{profile.name || 'Your job search, organised'}</div>
      </div>
      {NAV.map((g) => (
        <div key={g.group}>
          <div className="mb-1 px-2 text-xs font-medium text-muted-foreground">{g.group}</div>
          {g.items.map((it) => (
            <button
              key={it.id}
              onClick={() => go(it.id)}
              aria-current={page === it.id ? 'page' : undefined}
              className={cn('flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-sm transition-colors cursor-pointer',
                page === it.id ? 'bg-accent font-medium text-primary' : 'text-foreground/80 hover:bg-muted')}
            >
              <it.icon size={17} /> {it.label}
            </button>
          ))}
        </div>
      ))}
      <button onClick={() => setDark(!dark)} className="mt-auto flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm text-foreground/80 hover:bg-muted cursor-pointer">
        {dark ? <Sun size={17} /> : <Moon size={17} />} {dark ? 'Light theme' : 'Dark theme'}
      </button>
    </nav>
  );

  return (
    <Ctx.Provider value={{ profile, setProfile, jobs, setJobs, page, go, selectedJobId, hasResume }}>
      <div className="min-h-screen lg:grid lg:grid-cols-[250px_1fr]">
        <aside className="sticky top-0 hidden h-screen border-r border-border bg-card lg:block">{sidebar}</aside>

        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-card/90 px-4 py-3 backdrop-blur lg:hidden">
          <span className="font-serif text-lg font-medium">Job OS</span>
          <button onClick={() => setMenu(true)} aria-label="Open menu" className="rounded-lg p-2 hover:bg-muted cursor-pointer"><Menu size={20} /></button>
        </header>
        {menu && (
          <div className="fixed inset-0 z-40 lg:hidden" onKeyDown={(e) => e.key === 'Escape' && setMenu(false)}>
            <div className="absolute inset-0 bg-black/50" onClick={() => setMenu(false)} />
            <div role="dialog" aria-modal="true" aria-label="Menu" className="absolute inset-y-0 left-0 w-72 bg-card shadow-2xl">
              <button onClick={() => setMenu(false)} aria-label="Close menu" className="absolute right-3 top-3 rounded-lg p-2 hover:bg-muted cursor-pointer"><X size={18} /></button>
              {sidebar}
            </div>
          </div>
        )}

        <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-8 lg:py-10">
          <Page />
        </main>
      </div>
    </Ctx.Provider>
  );
}
