import React, { Suspense, lazy, useEffect, useState } from 'react';
import { LayoutDashboard, Briefcase, CalendarDays, FileText, Wand2, Send, Settings as Cog, LineChart, BarChart3, Menu, Sun, Moon, X } from 'lucide-react';
import { emptyProfile, type Job, type Profile } from './types';
import { Ctx, type PageId } from './lib/state';
import { useLocalState } from './lib/useLocalState';
import { cn } from './lib/utils';
import Overview from './pages/Overview';
import Jobs from './pages/Jobs';
import Interviews from './pages/Interviews';
import ResumePage from './pages/Resume';
const Tailor = lazy(() => import('./pages/Tailor'));
const Outreach = lazy(() => import('./pages/Outreach'));
const Insights = lazy(() => import('./pages/Insights'));
const Landing = lazy(() => import('./pages/Landing'));
const Salary = lazy(() => import('./pages/Salary'));
import SettingsPage from './pages/Settings';

const NAV: { group: string; items: { id: PageId; label: string; icon: React.ElementType }[] }[] = [
  { group: 'Overview', items: [{ id: 'overview', label: 'Dashboard', icon: LayoutDashboard }] },
  { group: 'Pipeline', items: [{ id: 'jobs', label: 'Jobs', icon: Briefcase }, { id: 'interviews', label: 'Interviews', icon: CalendarDays }, { id: 'insights', label: 'Insights', icon: BarChart3 }, { id: 'salary', label: 'Salary', icon: LineChart }] },
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
  const [inApp, setInApp] = useState(() => location.hash.startsWith('#/app'));
  useEffect(() => {
    const f = () => setInApp(location.hash.startsWith('#/app'));
    window.addEventListener('hashchange', f);
    return () => window.removeEventListener('hashchange', f);
  }, []);
  const enter = () => { location.hash = '#/app'; window.scrollTo(0, 0); };
  const leave = () => { location.hash = ''; window.scrollTo(0, 0); };
  const [dark, setDark] = useState(() => {
    const s = localStorage.getItem('jaos_theme');
    return s ? s === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('jaos_theme', dark ? 'dark' : 'light');
  }, [dark]);

  const toggleTheme = () => setDark((d) => !d);
  const go = (p: PageId, jobId?: string) => {
    if (jobId) setSelectedJobId(jobId);
    setPage(p);
    setMenu(false);
    window.scrollTo(0, 0);
  };
  const hasResume = profile.resumeText.trim().length >= 50;

  const Page = { overview: Overview, jobs: Jobs, interviews: Interviews, resume: ResumePage, tailor: Tailor, outreach: Outreach, salary: Salary, insights: Insights, prep: Interviews, settings: SettingsPage }[page];

  const sidebar = (
    <nav aria-label="Main" className="flex h-full flex-col gap-6 overflow-y-auto p-4">
      <div className="px-2 pt-1">
        <button onClick={leave} className="display text-3xl leading-none cursor-pointer" aria-label="Back to home">Momentum</button>
        <div className="label mt-1 text-muted-foreground">{profile.name || 'Your job search'}</div>
      </div>
      {NAV.map((g) => (
        <div key={g.group}>
          <div className="label mb-1 px-2 text-muted-foreground">{g.group}</div>
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

  if (!inApp) return <Suspense fallback={<div className="min-h-screen bg-[#0d0b0a]" />}><Landing dark={dark} toggleTheme={toggleTheme} enter={enter} /></Suspense>;

  return (
    <Ctx.Provider value={{ profile, setProfile, jobs, setJobs, page, go, selectedJobId, hasResume }}>
      <div className="app-bg" aria-hidden="true" />
      <div className="min-h-screen lg:grid lg:grid-cols-[270px_1fr]">
        <aside className="sticky top-0 hidden h-screen p-4 lg:block"><div className="glass h-full overflow-hidden rounded-[28px]">{sidebar}</div></aside>

        <header className="glass sticky top-3 z-30 mx-3 mt-3 flex items-center justify-between rounded-full py-2 pl-5 pr-2 lg:hidden">
          <button onClick={leave} className="display text-2xl cursor-pointer">Momentum</button>
          <button onClick={() => setMenu(true)} aria-label="Open menu" className="rounded-lg p-2 hover:bg-muted cursor-pointer"><Menu size={20} /></button>
        </header>
        {menu && (
          <div className="fixed inset-0 z-40 lg:hidden" onKeyDown={(e) => e.key === 'Escape' && setMenu(false)}>
            <div className="absolute inset-0 bg-black/50" onClick={() => setMenu(false)} />
            <div role="dialog" aria-modal="true" aria-label="Menu" className="absolute inset-y-0 left-0 w-72 bg-card-solid shadow-2xl">
              <button onClick={() => setMenu(false)} aria-label="Close menu" className="absolute right-3 top-3 rounded-lg p-2 hover:bg-muted cursor-pointer"><X size={18} /></button>
              {sidebar}
            </div>
          </div>
        )}

        <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-8 lg:py-12">
          <Suspense fallback={<p className="label text-muted-foreground">Loading…</p>}><Page /></Suspense>
        </main>
      </div>
    </Ctx.Provider>
  );
}
