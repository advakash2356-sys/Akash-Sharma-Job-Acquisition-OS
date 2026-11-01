import { ExternalLink } from 'lucide-react';
import { Badge, Card } from './ui';
import { CHECKED } from '../lib/gov/sources';
import type { CountryJobProvider } from '../lib/gov/providers';

/** Official source directory for a country (links only). */
export function SourceDirectory({ p, lesserOnly }: { p: CountryJobProvider; lesserOnly?: boolean }) {
  const list = p.sources.filter((s) => !lesserOnly || s.lesser);
  return (
    <Card className="mb-5 grid min-w-0 gap-2 [overflow-wrap:anywhere]" data-testid="gov-sources"><h2 className="text-xl font-medium">Official sources to check ({p.name})</h2>
      <p className="text-sm text-muted-foreground">Where governments publish their own notices. Links checked from our server on {CHECKED}; "may be slow" means the site timed out from outside {p.name} or shows a bot check, and usually opens in a normal browser.</p>
      <ul className="grid gap-2 sm:grid-cols-2">{list.map((s) => <li key={s.url} className="rounded-lg border border-border p-2 text-sm" data-testid="gov-source">
        <a className="inline-flex items-center gap-1 font-medium text-primary underline" href={s.url} target="_blank" rel="noopener noreferrer">{s.name} <ExternalLink size={12} /></a>
        <div className="mt-1 flex flex-wrap gap-1">{s.lesser && <Badge tone="primary">Lesser-known</Badge>}{s.reach === 'slow' && <Badge tone="muted">may be slow</Badge>}</div>
        <div className="text-muted-foreground">{s.covers}{s.note ? ` ${s.note}` : ''}</div></li>)}</ul>
    </Card>
  );
}
/** "Coming soon" guide for countries we do not fetch yet. Shows no jobs, ever. */
export function CountryComingSoon({ p }: { p: CountryJobProvider }) {
  return (
    <>
      <Card className="mb-5 grid min-w-0 gap-3" data-testid="gov-coming-soon"><div className="flex flex-wrap items-center gap-2"><h2 className="text-xl font-medium">{p.flag} {p.headline}</h2><Badge tone="gold">Coming soon</Badge></div>
        <p className="text-sm">{p.sub} We show no job listings for {p.name} until we can read official sources reliably, so nothing here is invented.</p>
        <div className="text-sm"><b>Who can apply (summary, not legal advice):</b> {p.whoCanApply}</div>
        <div className="text-sm"><b>Pay:</b> {p.payNote}</div>
        <div className="text-sm"><b>How to search now:</b><ol className="ml-5 list-decimal">{p.howToSearch.map((h) => <li key={h}>{h}</li>)}</ol></div>
      </Card>
      <SourceDirectory p={p} />
    </>
  );
}
