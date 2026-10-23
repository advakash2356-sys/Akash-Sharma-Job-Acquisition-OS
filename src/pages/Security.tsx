import React from 'react';
import { Card, PageHeader } from '../components/ui';

const S = ({ t, children }: { t: string; children: React.ReactNode }) => <Card><h2 className="mb-2 text-xl font-medium">{t}</h2><div className="grid gap-2 text-sm leading-relaxed">{children}</div></Card>;

export default function Security() {
  return (
    <>
      <PageHeader eyebrow="Security" title="Security and breach procedure" subtitle="How to report a problem, and what we will do if personal data is exposed. Last updated 24 October 2026." />
      <div className="grid gap-5">
        <S t="Report a vulnerability">
          <p>Email <a className="text-primary underline" href="mailto:adv.akash2356@gmail.com?subject=Security%20report">adv.akash2356@gmail.com</a> with the subject "Security report", the steps to reproduce, and what you think is affected. Please do not access other people's data, run denial-of-service tests or publish details before we have had a reasonable chance to fix them. We will acknowledge your report as soon as we can. This is a one-person early-access project with no bug bounty. Machine-readable contact: <a className="text-primary underline" href="/.well-known/security.txt">/.well-known/security.txt</a>.</p>
        </S>
        <S t="What personal data we hold">
          <p>Your resume, jobs and API key stay in your browser. The owner's private Google Sheet holds sign-in details (name, email, optional mobile, device id and hint, visit dates), usage steps of signed-in users, and feedback. The <a className="text-primary underline" href="/privacy">Privacy page</a> has the full list.</p>
        </S>
        <S t="If a personal data breach happens">
          <ol className="list-decimal grid gap-1 pl-5">
            <li><b>Contain:</b> revoke exposed secrets (Apps Script shared secret, Vercel environment variables, API keys), redeploy, and restrict access to the Sheet.</li>
            <li><b>Assess:</b> what data, whose, since when, and how it happened. Keep a written record and preserve logs.</li>
            <li><b>CERT-In:</b> where the incident is of a type covered by CERT-In's Directions of 28 April 2022, report it to CERT-In (incident@cert-in.org.in) within 6 hours of noticing it.</li>
            <li><b>Affected users:</b> tell each affected person, without delay, what happened, what data was involved, the likely consequences, what we are doing, what they can do, and who to contact, as the Digital Personal Data Protection Act, 2023 and its Rules require.</li>
            <li><b>Data Protection Board of India:</b> notify the Board in the form and within the time the DPDP Act and Rules require, including the follow-up report.</li>
            <li><b>Fix and review:</b> fix the cause, check for similar issues, and update this page and the Privacy page if anything changes.</li>
          </ol>
          <p className="text-muted-foreground">This is our procedure, not a promise that breaches cannot happen. No online service can guarantee that.</p>
        </S>
        <S t="Contact">
          <p>Akash Sync Agent, <a className="text-primary underline" href="mailto:adv.akash2356@gmail.com">adv.akash2356@gmail.com</a>.</p>
        </S>
      </div>
    </>
  );
}
