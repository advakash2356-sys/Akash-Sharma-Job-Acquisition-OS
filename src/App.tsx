import React, { Suspense, lazy, useEffect, useState } from 'react';
import { KanbanSquare, GraduationCap, LayoutDashboard, Briefcase, CalendarDays, FileText, Wand2, Send, Settings as Cog, LineChart, BarChart3, ShieldCheck, Menu, Sun, Moon, X, MessageSquare, Info } from 'lucide-react';
import { emptyProfile, type Job, type Profile } from './types';
import { Ctx, type PageId } from './lib/state';
import { funnel, getIdToken, getSession, isClientId, loadClientId, pingVisit, watchAuth, type AuthUser } from './lib/googleAuth';
import { candidateOf } from './lib/jobSearch';
import SignInGate, { SignInUnavailable } from './components/SignInGate';
import ReauthPrompt from './components/ReauthPrompt';
import { JOBS_KEY, PROFILE_KEY, scoped } from './lib/storage';
import { setKeyNamespace } from './lib/userApiKey';
import { useLocalState } from './lib/useLocalState';
import { needsMigration, normaliseJob } from './lib/docShape';
import { cn } from './lib/utils';
const Overview = lazy(() => import('./pages/Overview'));
const Jobs = lazy(() => import('./pages/Jobs'));
const Interviews = lazy(() => import('./pages/Interviews'));
const ResumePage = lazy(() => import('./pages/Resume'));
const Tailor = lazy(() => import('./pages/Tailor'));
const Outreach = lazy(() => import('./pages/Outreach'));
const Insights = lazy(() => import('./pages/Insights'));
const Landing = lazy(() => import('./pages/Landing'));
const Salary = lazy(() => import('./pages/Salary'));
const SettingsPage = lazy(() => import('./pages/Settings'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Setup = lazy(() => import('./pages/Setup'));
import ErrorBoundary from './components/ErrorBoundary';
import DeleteDataButton from './components/DeleteDataButton';
const NotFound = lazy(() => import('./pages/NotFound'));
import { CREDIT, COPYRIGHT, PAGE_META, PUBLIC_PAGES, SITE_URL } from './lib/brand';
import { track } from './lib/analytics';
import { getUserApiKey, KEY_EVENT } from './lib/userApiKey';
const About = lazy(() => import('./pages/About'));
const Terms = lazy(() => import('./pages/Terms'));
const PrepPage = lazy(() => import('./pages/Prep'));
const Tracker = lazy(() => import('./pages/Tracker'));
const Security = lazy(() => import('./pages/Security'));
const Accessibility = lazy(() => import('./pages/Accessibility'));
const Feedback = lazy(() => import('./pages/Feedback'));
const JobPage = lazy(() => import('./pages/JobPage'));
import FlowStepper from './components/FlowStepper';
// Dev-only: lets the launch audit prove the error boundary catches a crash.
const Crash = (): React.ReactElement => { throw new Error('Test crash (dev only)'); };
const PAGE_IDS = ['setup', 'overview', 'jobs', 'interviews', 'resume', 'tailor', 'outreach', 'salary', 'insights', 'privacy', 'settings', 'about', 'terms', 'feedback', 'job', 'security', 'accessibility', 'prep', 'tracker'];
/** '#/app/<page>' deep links. Unknown page -> 404. '#/app' alone -> null (default page). */
const isPublic = (p: string) => (PUBLIC_PAGES as readonly string[]).includes(p);
/** Keep <title>, description, canonical and og:url in step with the visible page. */
function setMeta(key: string, path: string) {
  const [t, d] = PAGE_META[key] || PAGE_META.app;
  document.title = t;
  const set = (sel: string, attr: string, v: string) => document.querySelector(sel)?.setAttribute(attr, v);
  set('meta[name="description"]', 'content', d); set('meta[property="og:title"]', 'content', t); set('meta[name="twitter:title"]', 'content', t); set('meta[name="twitter:description"]', 'content', d); set('meta[property="og:description"]', 'content', d);
  set('link[rel="canonical"]', 'href', SITE_URL + path); set('meta[property="og:url"]', 'content', SITE_URL + path);
}
const hashPage = (): PageId | null => { const m = location.hash.match(/^#\/app\/([a-z-]+)/); if (!m) return null; return (PAGE_IDS.includes(m[1]) ? m[1] : 'notfound') as PageId; };

const NAV: { group: string; items: { id: PageId; label: string; icon: React.ElementType }[] }[] = [
  { group: 'Overview', items: [{ id: 'setup', label: 'Guided setup', icon: Wand2 }, { id: 'overview', label: 'Dashboard', icon: LayoutDashboard }] },
  { group: 'Pipeline', items: [{ id: 'jobs', label: 'Jobs (pick one)', icon: Briefcase }, { id: 'tracker', label: 'Application tracker', icon: KanbanSquare }, { id: 'interviews', label: 'Interviews', icon: CalendarDays }, { id: 'prep', label: 'Interview prep', icon: GraduationCap }, { id: 'insights', label: 'Insights', icon: BarChart3 }, { id: 'salary', label: 'Salary', icon: LineChart }] },
  { group: 'Resume', items: [{ id: 'resume', label: 'My resume', icon: FileText }, { id: 'tailor', label: 'Application packs', icon: Wand2 }] },
  { group: 'Outreach', items: [{ id: 'outreach', label: 'Outreach studio', icon: Send }] },
  { group: 'Account', items: [{ id: 'settings', label: 'Settings', icon: Cog }, { id: 'privacy', label: 'Privacy & security', icon: ShieldCheck }, { id: 'feedback', label: 'Share feedback', icon: MessageSquare }, { id: 'about', label: 'About', icon: Info }] },
];

export default function App() {
  const [auth, setAuth] = useState<{ ready: boolean; user: AuthUser | null }>({ ready: true, user: getSession() });
  useEffect(() => watchAuth((u) => setAuth({ ready: true, user: u })), []);
  const uid = auth.user?.uid || 'guest';
  setKeyNamespace(uid);
  if (!auth.ready) return <div className="min-h-screen bg-background" />;
  return <Workspace key={uid} uid={uid} user={auth.user} />;
}

function Workspace({ uid, user }: { uid: string; user: AuthUser | null }) {
  const [profile, setProfile] = useLocalState<Profile>(scoped(PROFILE_KEY, uid), emptyProfile);
  const [jobs, setJobs] = useLocalState<Job[]>(scoped(JOBS_KEY, uid), []);
  // One-time migration of documents saved by older builds or imports in other shapes (e.g. a structured resume where text was expected).
  useEffect(() => { if (Array.isArray(jobs) && jobs.some(needsMigration)) setJobs((js) => js.map(normaliseJob)); }, [jobs]);
  const [page, setPage] = useState<PageId>(() => hashPage() || ((profile.resumeText || '').trim().length < 50 ? 'setup' : 'overview'));
  const [selectedJobId, setSelectedJobId] = useLocalState<string>(scoped('jaos_current_job', uid), (location.hash.match(/^#\/app\/job\/([^/?#]+)/) || [])[1] ? decodeURIComponent(location.hash.match(/^#\/app\/job\/([^/?#]+)/)![1]) : '');
  const [menu, setMenu] = useState(false);
  useEffect(() => { const jm = location.hash.match(/^#\/app\/job\/([^/?#]+)/); if (jm) setSelectedJobId(decodeURIComponent(jm[1])); }, []);
  const [inApp, setInApp] = useState(() => location.hash.startsWith('#/app'));
  const [gate, setGate] = useState<boolean | null>(null);
  useEffect(() => { loadClientId().then((id) => setGate(isClientId(id))); }, []);
  useEffect(() => { pingVisit(user); }, [user]);
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => { if (!user) return; getIdToken().then((t) => t && fetch('/api/admin/whoami', { headers: { Authorization: `Bearer ${t}` } }).then((r) => setIsAdmin(r.ok))).catch(() => {}); }, [user?.uid]);
  useEffect(() => {
    const f = () => { setInApp(location.hash.startsWith('#/app')); const jm = location.hash.match(/^#\/app\/job\/([^/?#]+)/); if (jm) setSelectedJobId(decodeURIComponent(jm[1])); const hp = hashPage(); if (hp) { setPage(hp); window.scrollTo(0, 0); } };
    window.addEventListener('hashchange', f);
    return () => window.removeEventListener('hashchange', f);
  }, []);
  const enter = () => { track('start_setup'); location.hash = '#/app'; window.scrollTo(0, 0); };
  const leave = () => { try { history.pushState(null, '', '/'); } catch { location.hash = ''; } setInApp(false); window.scrollTo(0, 0); };
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
    try { const q = p === 'notfound' ? 'overview' : p; history.replaceState(null, '', `${isPublic(q) ? `/${q}` : '/'}#/app/${q}${q === 'job' && (jobId || selectedJobId) ? `/${encodeURIComponent(jobId || selectedJobId)}` : ''}`); } catch { /* ignore */ }
    setMenu(false);
    window.scrollTo(0, 0);
  };
  useEffect(() => { if (!inApp) setMeta('landing', '/'); else if (isPublic(page)) setMeta(page, `/${page}`); else setMeta('app', '/'); }, [inApp, page]);
  const hasResume = profile.resumeText.trim().length >= 50;
  useEffect(() => { if (hasResume) { track('resume_added'); const c = candidateOf(profile); funnel('profile_done', `role=${(profile.targetRoles || profile.headline || '').split(/[,;\n]/)[0].trim().slice(0, 60)};country=${c.residence};modes=${c.modes.join('+')}`); } }, [hasResume]);
  useEffect(() => { if (jobs.some((j) => j.coverLetter || j.tailoredResume || j.outreach)) funnel('docs_generated'); }, [jobs]);
  useEffect(() => { const k = () => { if (getUserApiKey()) track('key_added'); }; k(); window.addEventListener(KEY_EVENT, k); return () => window.removeEventListener(KEY_EVENT, k); }, []);
  useEffect(() => { if (jobs.some((j) => j.found)) track('first_job_found'); }, [jobs]);

  const Page = { setup: Setup, overview: Overview, jobs: Jobs, interviews: Interviews, resume: ResumePage, tailor: Tailor, outreach: Outreach, salary: Salary, insights: Insights, prep: PrepPage, tracker: Tracker, privacy: Privacy, settings: SettingsPage, about: About, terms: Terms, security: Security, accessibility: Accessibility, feedback: Feedback, job: JobPage, notfound: () => <NotFound home={() => { location.hash = '#/app'; go('overview'); }} /> }[page];

  const sidebar = (
    <nav aria-label="Main" className="flex h-full flex-col gap-6 overflow-y-auto p-4">
      <div className="px-2 pt-1">
        <button onClick={leave} className="display text-3xl leading-none cursor-pointer" aria-label="Job Acquisition OS, back to home">Job Acquisition OS</button>
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
      <button onClick={() => go('settings')} className="mt-auto flex items-center gap-3 rounded-2xl border border-border px-3 py-2 text-left text-sm cursor-pointer hover:bg-muted">
        {user?.photo ? <img src={user.photo} alt="" referrerPolicy="no-referrer" className="h-7 w-7 rounded-full" /> : <span className="grid h-7 w-7 place-items-center rounded-full bg-accent text-xs text-primary">{(user?.name || 'G')[0]}</span>}
        <span className="min-w-0"><span className="block truncate">{user?.name || 'Not signed in'}</span><span className="label block text-muted-foreground">{user ? 'Google account' : 'Sign in to use the app'}</span></span>
      </button>
      <button onClick={() => setDark(!dark)} className=" flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm text-foreground/80 hover:bg-muted cursor-pointer">
        {dark ? <Sun size={17} /> : <Moon size={17} />} {dark ? 'Light theme' : 'Dark theme'}
      </button>
      {isAdmin && <a href="/admin" data-testid="admin-link" className="flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium text-primary hover:bg-muted"><ShieldCheck size={17} /> Admin</a>}
      <DeleteDataButton variant="link" />
      <div className="px-2.5 text-xs text-muted-foreground"><button onClick={() => go('about')} className="cursor-pointer hover:text-primary">{CREDIT}</button> · <button onClick={() => go('terms')} className="cursor-pointer hover:text-primary">Terms</button><div className="mt-0.5">{COPYRIGHT}</div></div>
    </nav>
  );

  if (!inApp) return <ErrorBoundary><Suspense fallback={<div className="min-h-screen bg-[#0d0b0a]" />}><Landing dark={dark} toggleTheme={toggleTheme} enter={enter} /></Suspense></ErrorBoundary>;

  // Sign-in is required for every app feature. Public pages (privacy, terms, security, accessibility, about, feedback) stay open.
  if (!user && !isPublic(page)) {
    if (gate === null) return <div className="min-h-screen bg-background" />;
    return gate ? <SignInGate openPrivacy={() => go('privacy')} back={leave} /> : <SignInUnavailable back={leave} />;
  }

  return (
    <Ctx.Provider value={{ profile, setProfile, jobs, setJobs, page, go, selectedJobId, hasResume, user }}>
      <div className="app-bg" aria-hidden="true" />
      <ReauthPrompt />
      <div className="min-h-screen lg:grid lg:grid-cols-[270px_1fr]">
        <aside className="sticky top-0 hidden h-screen p-4 lg:block"><div className="glass h-full overflow-hidden rounded-[28px]">{sidebar}</div></aside>

        <header className="glass sticky top-3 z-30 mx-3 mt-3 flex items-center justify-between rounded-full py-2 pl-5 pr-2 lg:hidden">
          <button onClick={leave} className="display text-2xl cursor-pointer">Job Acquisition OS</button>
          <span className="flex items-center"><DeleteDataButton variant="icon" />
          <button onClick={() => setMenu(true)} aria-label="Open menu" className="grid h-11 w-11 place-items-center rounded-lg hover:bg-muted cursor-pointer"><Menu size={20} /></button></span>
        </header>
        {menu && (
          <div className="fixed inset-0 z-40 lg:hidden" onKeyDown={(e) => e.key === 'Escape' && setMenu(false)}>
            <div className="absolute inset-0 bg-black/50" onClick={() => setMenu(false)} />
            <div role="dialog" aria-modal="true" aria-label="Menu" className="absolute inset-y-0 left-0 w-72 bg-card-solid shadow-2xl">
              <button onClick={() => setMenu(false)} aria-label="Close menu" className="absolute right-3 top-3 grid h-11 w-11 place-items-center rounded-lg hover:bg-muted cursor-pointer"><X size={18} /></button>
              {sidebar}
            </div>
          </div>
        )}

        <main className="mx-auto w-full max-w-5xl px-4 pb-24 pt-8 sm:px-8 lg:py-12">
          {!isPublic(page) && page !== 'notfound' && <FlowStepper />}
          <div key={page} className="stagger"><ErrorBoundary key={page}><Suspense fallback={<p className="label text-muted-foreground">Loading…</p>}>{import.meta.env.DEV && location.hash === '#/app/notfound?crash' ? <Crash /> : <Page />}</Suspense></ErrorBoundary></div>
          <footer className="mt-12 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-border pt-4 text-xs text-muted-foreground" data-testid="app-credit">
            <a href="/about" onClick={(e) => { e.preventDefault(); go('about'); }} className="inline-flex min-h-11 items-center font-medium text-foreground hover:text-primary">{CREDIT}</a>
            <span>{COPYRIGHT}</span>
            <a href="/terms" onClick={(e) => { e.preventDefault(); go('terms'); }} className="inline-flex min-h-11 items-center hover:text-primary">Terms</a>
            <a href="/privacy" onClick={(e) => { e.preventDefault(); go('privacy'); }} className="inline-flex min-h-11 items-center hover:text-primary">Privacy</a>
            <a href="/feedback" onClick={(e) => { e.preventDefault(); go('feedback'); }} className="inline-flex min-h-11 items-center hover:text-primary">Feedback</a>
            <a href="/accessibility" onClick={(e) => { e.preventDefault(); go('accessibility'); }} className="inline-flex min-h-11 items-center hover:text-primary">Accessibility</a>
            <a href="/security" onClick={(e) => { e.preventDefault(); go('security'); }} className="inline-flex min-h-11 items-center hover:text-primary">Security</a>
          </footer>
        </main>
      </div>
    </Ctx.Provider>
  );
}
