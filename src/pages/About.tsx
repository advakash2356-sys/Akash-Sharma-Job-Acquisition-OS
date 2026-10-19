import { Card, PageHeader } from '../components/ui';
import { COPYRIGHT, CREDIT, REPO } from '../lib/brand';

export default function About() {
  return (
    <>
      <PageHeader eyebrow="Credits" title="About Job Acquisition OS" subtitle={`${CREDIT}. A free, browser-only job search workspace.`} />
      <div className="grid gap-5">
        <Card><h2 className="mb-2 text-xl font-medium">Who made it</h2>
          <p className="text-sm">Job Acquisition OS is designed and built by <b>Akash Sync Agent</b> (Adv. Akash Sharma). {COPYRIGHT}.</p></Card>
        <Card><h2 className="mb-2 text-xl font-medium">Licence, in plain words</h2>
          <p className="text-sm">The source code is open under the MIT licence (<a className="underline text-primary" href={`https://github.com/${REPO}`} target="_blank" rel="noreferrer">GitHub</a>). MIT lets anyone use, copy, change and even sell the code, as long as they keep the copyright and licence notice. It does not give anyone the right to use the name "Akash Sync Agent", the Job Acquisition OS branding (design concept "Momentum") or the logo: those are not licensed for reuse.</p></Card>
        <Card><h2 className="mb-2 text-xl font-medium">Built with</h2>
          <ul className="list-disc space-y-1 pl-5 text-sm">
            <li>Jobs: <a className="underline" href="https://github.com/strelov1/freehire" target="_blank" rel="noreferrer">FreeHire</a> (MIT) open job search API.</li>
            <li>AI: Google Gemini API, with your own free key.</li>
            <li>Reading files: pdf.js (Apache-2.0) and mammoth (BSD-2). Exports: jsPDF (MIT) and docx (MIT).</li>
            <li>Interface: React (MIT), Tailwind CSS (MIT), lucide icons (ISC).</li>
          </ul></Card>
      </div>
    </>
  );
}
