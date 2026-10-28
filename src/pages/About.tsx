import { Card, PageHeader } from '../components/ui';
import { COPYRIGHT, CREDIT, REPO } from '../lib/brand';

export default function About() {
  return (
    <>
      <PageHeader eyebrow="Credits" title="About Job Acquisition OS" subtitle={`${CREDIT}. A free job search workspace; your resume and jobs are saved in your browser.`} />
      <div className="grid gap-5">
        <Card><h2 className="mb-2 text-xl font-medium">Who made it</h2>
          <p className="text-sm">Job Acquisition OS is designed and built by <b>Akash Sync Agent</b> (Adv. Akash Sharma). {COPYRIGHT}.</p></Card>
        <Card><h2 className="mb-2 text-xl font-medium">Licence, in plain words</h2>
          <p className="text-sm">The source code is open under the MIT licence (<a className="underline text-primary" href={`https://github.com/${REPO}`} target="_blank" rel="noreferrer">GitHub</a>). MIT lets anyone use, copy, change and even sell the code, as long as they keep the copyright and licence notice. It does not give anyone the right to use the name "Akash Sync Agent", the Job Acquisition OS branding (design concept "Momentum") or the logo: those are not licensed for reuse.</p></Card>
        <Card><h2 className="mb-2 text-xl font-medium">Built with</h2>
          <ul className="list-disc space-y-1 pl-5 text-sm">
            <li>Jobs: <a className="underline" href="https://github.com/strelov1/freehire" target="_blank" rel="noreferrer">FreeHire</a> (MIT) open job search API, plus the public Himalayas and Remote OK job feeds and SarkariMap's government-notice RSS feed. Each job links to its original posting.</li>
            <li>AI: Google Gemini API. No key needed (3 free results a day, OpenRouter free models as backup); your own free key is optional for unlimited use.</li>
            <li>Reading files: pdf.js (Apache-2.0) and mammoth (BSD-2). Exports: jsPDF (MIT) and docx (MIT).</li>
            <li>Resume format: <a className="underline" href="https://github.com/jsonresume/resume-schema" target="_blank" rel="noreferrer">JSON Resume schema</a> (MIT), ATS layout adapted from <a className="underline" href="https://github.com/rendercv/rendercv" target="_blank" rel="noreferrer">RenderCV</a> (MIT) and <a className="underline" href="https://github.com/rbardini/jsonresume-theme-even" target="_blank" rel="noreferrer">jsonresume-theme-even</a> (MIT). Full notices: THIRD_PARTY_NOTICES.md in the repository.</li>
            <li>Interface: React (MIT), Tailwind CSS (MIT), lucide icons (ISC).</li>
          </ul></Card>
      </div>
    </>
  );
}
