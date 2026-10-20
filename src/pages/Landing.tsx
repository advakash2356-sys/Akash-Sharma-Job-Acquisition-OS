import React, { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, FileText, Gauge, Lock, Mail, Route, ScanSearch, Sun, Moon, TrendingUp, Download } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

import { COPYRIGHT, CREDIT, PROOF, SITE_URL } from '../lib/brand';
import { track } from '../lib/analytics';

gsap.registerPlugin(ScrollTrigger);

/** Share link for a friend: native share sheet where available, otherwise copy. ?ref=share lets the owner see shares in referrers. */
function ShareButton({ className }: { className: string }) {
  const [copied, setCopied] = useState(false);
  const url = `${SITE_URL}/?ref=share`;
  const share = async () => {
    track('share');
    const data = { title: 'Job Acquisition OS: a free job search workspace', text: 'Free job search workspace: real postings, tailored resumes, your data stays in your browser.', url };
    try { if (navigator.share) { await navigator.share(data); return; } } catch { return; }
    try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2500); } catch { prompt('Copy this link', url); }
  };
  return <button onClick={share} className={className}>{copied ? 'Link copied' : 'Share with a friend'}</button>;
}

const STEPS = [
  ['01', 'Bring your resume', 'Upload a PDF, DOCX or TXT, or fill a short Hindi/English form if you have none. Saved in your browser.'],
  ['02', 'Find real jobs', 'Real postings from FreeHire with the original link, plus government notices with an official link and a future last date. Verify before you apply.'],
  ['03', 'Score the role', 'A fit score with strengths, gaps and missing keywords (AI with your free Gemini key, otherwise a labelled keyword match).'],
  ['04', 'Tailor and reach out', 'Resume, cover letter and outreach drafts from your resume only, with a fact check. You read and send them yourself.'],
  ['05', 'Face the screen', 'A simulated recruiter read, plus interview prep for every round.'],
  ['06', 'Land the offer', 'Follow-up reminders for your calendar, pay you log on each job, and your weekly pace.'],
];

export default function Landing({ dark, toggleTheme, enter }: { dark: boolean; toggleTheme: () => void; enter: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => { track('landing_view'); }, []);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    if (reduce) return () => window.removeEventListener('scroll', onScroll);

    const lenis = new Lenis({ lerp: 0.1 });
    lenis.on('scroll', ScrollTrigger.update);
    const tick = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const ctx = gsap.context(() => {
      gsap.from('.hero-line', { yPercent: 110, opacity: 0, duration: 1.1, ease: 'power4.out', stagger: 0.12, delay: 0.15 });
      gsap.from('.hero-fade', { opacity: 0, y: 20, duration: 1, delay: 0.7, stagger: 0.1 });
      gsap.to('.hero-media', { scale: 1.18, yPercent: 8, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
      gsap.to('.hero-copy', { opacity: 0, y: -80, ease: 'none', scrollTrigger: { trigger: '.hero', start: '30% top', end: 'bottom top', scrub: true } });

      // Pinned path scene: steps reveal one by one while the line draws.
      const tl = gsap.timeline({ scrollTrigger: { trigger: '.path-scene', start: 'top top', end: '+=2400', pin: true, scrub: 0.6 } });
      tl.fromTo('.path-bg', { scale: 1.15 }, { scale: 1, duration: STEPS.length }, 0);
      tl.fromTo('.path-line', { scaleY: 0 }, { scaleY: 1, duration: STEPS.length, ease: 'none' }, 0);
      STEPS.forEach((_, i) => {
        tl.fromTo(`.path-step-${i}`, { opacity: 0.12, x: 30 }, { opacity: 1, x: 0, duration: 0.6 }, i);
        if (i < STEPS.length - 1) tl.to(`.path-step-${i}`, { opacity: 0.35, duration: 0.4 }, i + 0.9);
      });

      gsap.utils.toArray<HTMLElement>('.reveal').forEach((el) => {
        gsap.from(el, { opacity: 0, y: 50, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
      });
    }, root);

    return () => { ctx.revert(); gsap.ticker.remove(tick); lenis.destroy(); window.removeEventListener('scroll', onScroll); };
  }, []);

  const nav = (
    <header className="fixed inset-x-0 top-4 z-50 flex justify-center px-4">
      <nav className={`glass flex w-full max-w-2xl items-center justify-between rounded-full px-3 py-2 pl-5 transition-shadow ${scrolled ? 'shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)]' : ''}`} aria-label="Primary">
        <span className="display text-xl">Job Acquisition OS</span>
        <div className="hidden items-center gap-6 text-sm sm:flex">
          <a href="#path" className="hover:text-primary">The path</a>
          <a href="#tools" className="hover:text-primary">Toolkit</a>
          <a href="#private" className="hover:text-primary">Privacy</a>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={toggleTheme} aria-label="Toggle theme" className="grid h-11 w-11 place-items-center rounded-full hover:bg-muted cursor-pointer">{dark ? <Sun size={16} /> : <Moon size={16} />}</button>
          <button onClick={enter} className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 cursor-pointer">Start your path</button>
        </div>
      </nav>
    </header>
  );

  return (
    <div ref={root} className="relative bg-background text-foreground">
      {nav}

      {/* HERO */}
      <section className="hero relative h-[100svh] min-h-[640px] overflow-hidden bg-[#0d0b0a] text-[#f4ede2] grain">
        <div className="hero-media absolute inset-0 will-change-transform">
          <img src="/hero-poster.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
          <video className="absolute inset-0 hidden h-full w-full object-cover motion-safe:block" src="/hero-loop.mp4" poster="/hero-poster.jpg" autoPlay muted loop playsInline preload="metadata" aria-hidden="true" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0b0a] via-[#0d0b0a]/30 to-[#0d0b0a]/50" />
        <div className="hero-copy relative z-10 flex h-full flex-col justify-end px-5 pb-14 sm:px-10 sm:pb-20">
          <p className="hero-fade label mb-5 text-[#ffb089]">Job Acquisition OS · free, by Akash Sync Agent</p>
          <h1 className="display max-w-[16ch] text-[clamp(3.6rem,11.5vw,11rem)] leading-[0.9]">
            <span className="block overflow-hidden"><span className="hero-line block">Your next</span></span>
            <span className="block overflow-hidden"><span className="hero-line block italic text-[#ff6a2b]">offer</span></span>
            <span className="block overflow-hidden"><span className="hero-line block">starts here.</span></span>
          </h1>
          <div className="hero-fade mt-8 flex flex-wrap items-center gap-3">
            <button onClick={enter} className="inline-flex items-center gap-2 rounded-full bg-[#ff6a2b] px-6 py-3 font-medium text-[#1a0c05] hover:opacity-90 cursor-pointer">Start your path <ArrowUpRight size={18} /></button>
            <a href="#path" className="px-3 py-3 text-white/80 underline-offset-4 hover:underline">See how it works</a>
            <span className="label ml-2 hidden text-white/60 sm:block">Free · data saved in your browser · no sign-up</span>
          </div>
          {PROOF && <p className="hero-fade label mt-4 text-white/70" data-testid="social-proof">{PROOF.users.toLocaleString()} job seekers have started a search (as of {PROOF.asOf})</p>}
        </div>
      </section>

      {/* MARQUEE */}
      <section aria-hidden="true" className="overflow-hidden border-y border-border py-5">
        <div className="marquee-track flex w-max gap-10 whitespace-nowrap">
          {Array.from({ length: 2 }).flatMap((_, k) => ['Find', 'Score', 'Tailor', 'Follow up', 'Interview', 'Prepare', 'Offer'].map((w) => (
            <span key={w + k} className="display flex items-center gap-10 text-5xl sm:text-7xl">{w}<span className="text-primary">✦</span></span>
          )))}
        </div>
      </section>

      {/* PINNED PATH */}
      <section id="path" className="path-scene relative h-screen overflow-hidden bg-[#0d0b0a] text-[#f4ede2] grain">
        <img src="/ridges-path.jpg" alt="" className="path-bg absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0d0b0a]/95 via-[#0d0b0a]/70 to-[#0d0b0a]/45" />
        <div className="relative z-10 mx-auto flex h-full max-w-6xl items-center px-5 sm:px-10">
          <div className="grid w-full gap-8 md:grid-cols-[1fr_1.2fr]">
            <div className="self-center">
              <p className="label mb-4 text-[#ffb089]">The path to the offer</p>
              <h2 className="display text-[clamp(2.6rem,6vw,5.5rem)] leading-[0.95]">Every step,<br />one horizon.</h2>
            </div>
            <div className="relative">
              <span aria-hidden className="absolute bottom-2 left-[7px] top-2 w-px bg-white/15" />
              <span aria-hidden className="path-line absolute bottom-2 left-[7px] top-2 w-px origin-top bg-[#ff6a2b]" />
            <ol className="relative grid gap-5 pl-8">
              {STEPS.map(([n, t, d], i) => (
                <li key={n} className={`path-step-${i} relative`}>
                  <span className="absolute -left-8 top-2 h-3.5 w-3.5 rounded-full border-2 border-[#ff6a2b] bg-[#0d0b0a]" />
                  <div className="label text-[#ffb089]">{n}</div>
                  <div className="display text-3xl sm:text-4xl">{t}</div>
                  <p className="max-w-md text-sm text-white/70">{d}</p>
                </li>
              ))}
            </ol>
            </div>
          </div>
        </div>
      </section>

      {/* BENTO */}
      <section id="tools" className="mx-auto max-w-6xl px-5 py-24 sm:px-10">
        <p className="label reveal mb-3 text-primary">The toolkit</p>
        <h2 className="display reveal mb-10 max-w-3xl text-[clamp(2.4rem,6vw,5rem)] leading-[0.95]">Everything between "applied" and "accepted".</h2>
        <div className="grid auto-rows-[220px] gap-4 md:grid-cols-6">
          <div className="reveal glass relative overflow-hidden rounded-3xl p-6 md:col-span-3 md:row-span-2">
            <img src="/desk-offer.jpg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-90" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
            <div className="relative flex h-full flex-col justify-end text-[#f4ede2]">
              <FileText className="mb-3 text-[#ff6a2b]" />
              <h3 className="display text-4xl">Tailored resume & cover letter</h3>
              <p className="mt-1 max-w-sm text-sm text-white/75">Written per job from your resume text (read it before use). Export to PDF or DOCX with the date in the file name.</p>
            </div>
          </div>
          <Tile cls="md:col-span-3" icon={<Gauge />} title="Candid fit score" body="0 to 100 against your own resume, with strengths, gaps and missing keywords. (Example score shown; real scores need your Gemini key.)" big="87" />
          <Tile cls="md:col-span-2" icon={<ScanSearch />} title="Recruiter's 6-second read" body="A simulated shortlist read, plus a keyword match against the job description." />
          <Tile cls="md:col-span-1" icon={<TrendingUp />} title="Pay charts" body="Pay you log on jobs, against your minimum." />
          <Tile cls="md:col-span-2" icon={<Mail />} title="Outreach & templates" body="Open in Gmail or download .eml. You always press send." />
          <Tile cls="md:col-span-2" icon={<Route />} title="Interview prep" body="Likely questions, answer outlines and what to ask." />
          <Tile cls="md:col-span-2" icon={<Download />} title="Weekly report" body="Your week of applications, as a PDF." />
        </div>
      </section>

      {/* PRIVATE + CTA */}
      <section id="private" className="relative overflow-hidden bg-[#0d0b0a] px-5 py-28 text-[#f4ede2] sm:px-10 grain">
        <img src="/desk-offer.jpg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" />
        <div className="relative mx-auto max-w-5xl text-center">
          <Lock className="reveal mx-auto mb-5 text-[#ff6a2b]" />
          <h2 className="display reveal text-[clamp(2.6rem,8vw,7rem)] leading-[0.92]">Your data lives in <span className="italic text-[#ff6a2b]">your browser.</span></h2>
          <p className="reveal mx-auto mt-6 max-w-xl text-white/70">Resume, jobs and API key are saved in local storage, with no database. When you use an AI feature, the text it needs goes through this app to Google Gemini for that request. Export a backup any time.</p>
          <button onClick={enter} className="reveal mt-10 inline-flex items-center gap-2 rounded-full bg-[#ff6a2b] px-8 py-4 text-lg font-medium text-[#1a0c05] hover:opacity-90 cursor-pointer">Start your path <ArrowUpRight /></button>
        </div>
      </section>
      <footer className="grid gap-4 px-5 py-8 text-sm text-muted-foreground sm:px-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="display text-xl text-foreground">Job Acquisition OS</span>
          <nav aria-label="Footer" className="flex flex-wrap items-center gap-5">
            <a href="/feedback" className="label inline-flex min-h-11 items-center hover:text-primary">Share feedback</a>
            <ShareButton className="label inline-flex min-h-11 items-center cursor-pointer hover:text-primary" />
            <a href="/about" className="label inline-flex min-h-11 items-center hover:text-primary">About</a>
            <a href="/terms" className="label inline-flex min-h-11 items-center hover:text-primary">Terms</a>
            <a href="/privacy" className="label inline-flex min-h-11 items-center hover:text-primary">Privacy & security</a>
            <a href="/privacy#delete" className="label inline-flex min-h-11 items-center hover:text-primary">Delete my data</a>
          </nav>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <span><a href="/about" className="inline-flex min-h-11 items-center hover:text-primary">{CREDIT}</a> · {COPYRIGHT}</span>
          <span>Code under MIT licence; name and logo not licensed. No cookies: your data is kept in this browser's local storage.</span>
        </div>
      </footer>
    </div>
  );
}

function Tile({ cls, icon, title, body, big }: { cls: string; icon: React.ReactNode; title: string; body: string; big?: string }) {
  return (
    <div className={`reveal glass relative flex flex-col justify-between overflow-hidden rounded-3xl p-6 ${cls}`}>
      <div className="flex items-start justify-between text-primary">{icon}{big && <span className="display text-7xl leading-none text-gold">{big}</span>}</div>
      <div><h3 className="display text-3xl leading-tight">{title}</h3><p className="mt-1 text-sm text-muted-foreground">{body}</p></div>
    </div>
  );
}
