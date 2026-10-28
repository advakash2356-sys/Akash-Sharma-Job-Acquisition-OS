import EarlyAccessNote from '../components/EarlyAccessNote';
import { Card, PageHeader } from '../components/ui';
import { COPYRIGHT } from '../lib/brand';

const S = ({ t, children }: { t: string; children: React.ReactNode }) => <Card><h2 className="mb-2 text-xl font-medium">{t}</h2><div className="grid gap-2 text-sm">{children}</div></Card>;

export default function Terms() {
  return (
    <>
      <PageHeader eyebrow="Plain language" title="Terms of use" subtitle="Short and honest. Last updated 23 October 2026." />
      <EarlyAccessNote className="mb-5" />
      <div className="grid gap-5">
        <S t="Price">
          <p>Job Acquisition OS is free during early access. Paid plans may be introduced later; we'll give advance notice and no one is charged without opting in. Your own Gemini key is billed (if at all) by Google under your own Google account, not by us.</p>
        </S>
        <S t="Age">
          <p data-testid="age-18">18+ only. You must be 18 or older to use Job Acquisition OS.</p>
        </S>
        <S t="What this is">
          <p>Job Acquisition OS is a free tool to organise your job search. It is provided as is, without any warranty. It does not apply for jobs or send emails for you: you review and send everything yourself.</p>
        </S>
        <S t="Who can use the AI features">
          <p>The AI features use Google's Gemini API with your own key, so Google's <a className="underline text-primary" href="https://ai.google.dev/gemini-api/terms" target="_blank" rel="noreferrer">Gemini API Additional Terms</a> apply to you. Google requires you to be <b>18 or older</b> to use the API.</p>
          <p>On Google's free tier, Google may use what you send (resume text, job descriptions, prompts) to improve its products, and human reviewers may read it. Do not send anything you would not want Google to process.</p>
          <p>Google's terms say that if you are in the <b>European Economic Area, Switzerland or the UK</b>, you may only use paid-tier (billing-enabled) API services. If that applies to you, use a paid key or do not use the AI features. Everything else in the app works without AI.</p>
        </S>
        <S t="Jobs and AI output">
          <p>Job postings come from third-party sources (FreeHire, official government sites) with their original links. They can be out of date or wrong: check the employer's or official page before you apply. AI-written text can contain mistakes; the Fact check helps, but you are responsible for what you send.</p>
        </S>
        <S t="Your data">
          <p>Your resume, jobs and API key stay in your browser's local storage; sign-in and feedback details go to the owner's private Google Sheet. See <a className="underline text-primary" href="/privacy">Privacy & security</a> for exactly what goes where.</p>
        </S>
        <S t="Reality check and course suggestions">
          <p id="courses">The Reality check and course suggestions are generated automatically from an AI match result and may be wrong or out of date. They are general information, not career, education or financial advice. Check with the employer what the role really needs. Course links go to the providers' own public search pages (Google Skills, Microsoft Learn, freeCodeCamp, Coursera, LinkedIn Learning); they are not affiliate links and JAOS earns nothing from them. Course content, length and price are set by each provider. JAOS is not responsible for any course you buy or its results. You must tick the notice before suggestions are shown.</p>
        </S>
        <S t="Fair use">
          <p>Do not use the app to spam employers, scrape sites, or break any law or platform terms. The job search has a rate limit to keep it fair.</p>
        </S>
        <S t="Name and logo">
          <p>The code is MIT licensed. The name "Akash Sync Agent", the Job Acquisition OS branding (design concept "Momentum") and the logo are not licensed for reuse. {COPYRIGHT}.</p>
        </S>
      </div>
    </>
  );
}
