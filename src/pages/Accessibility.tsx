import React from 'react';
import { Card, PageHeader } from '../components/ui';

const S = ({ t, children }: { t: string; children: React.ReactNode }) => <Card><h2 className="mb-2 text-xl font-medium">{t}</h2><div className="grid gap-2 text-sm leading-relaxed">{children}</div></Card>;

export default function Accessibility() {
  return (
    <>
      <PageHeader eyebrow="Accessibility" title="Accessibility statement" subtitle="Last reviewed 24 October 2026." />
      <div className="grid gap-5">
        <S t="Our target">
          <p>We aim for the Web Content Accessibility Guidelines (WCAG) 2.2 at level AA. We have not had an independent audit, so we do not claim full conformance. We check pages with automated tools (axe) and by keyboard, and fix issues as we find them.</p>
        </S>
        <S t="What we have done">
          <ul className="list-disc grid gap-1 pl-5">
            <li>Keyboard access to menus, dialogs and forms, with visible focus.</li>
            <li>Labels on form fields, alt text or hidden labels on icons, and status messages announced to screen readers.</li>
            <li>Light and dark themes, touch targets of about 44px on main controls, and layouts that work on phones.</li>
            <li>The intro video can be paused and respects "reduce motion".</li>
          </ul>
        </S>
        <S t="Known issues">
          <ul className="list-disc grid gap-1 pl-5">
            <li>Some muted grey text may fall below the 4.5:1 contrast ratio in places.</li>
            <li>The Google sign-in button is drawn by Google inside a frame; we cannot change its accessibility.</li>
            <li>Downloaded PDF resumes and letters are not tagged PDFs, so screen readers may read them poorly. The DOCX downloads are a better choice for screen readers.</li>
            <li>AI-generated text is not checked for plain language.</li>
            <li>The Hindi short form has not been tested with screen readers in Hindi.</li>
          </ul>
        </S>
        <S t="Tell us about a barrier">
          <p>Email <a className="text-primary underline" href="mailto:adv.akash2356@gmail.com?subject=Accessibility">adv.akash2356@gmail.com</a> with the page and what went wrong, or use the <a className="text-primary underline" href="/feedback">feedback form</a>. We aim to reply within 7 days and will try to give you the information another way in the meantime.</p>
        </S>
      </div>
    </>
  );
}
