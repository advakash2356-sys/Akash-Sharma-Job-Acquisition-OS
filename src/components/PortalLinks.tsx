// "Search on other portals" (t345u): deep links to 50 job portals with role, place and experience prefilled.
// JAOS does not scrape these sites; links open their own search pages. Akash Sync Agent.
import { portalLinks } from '../lib/onestop/portals';
export default function PortalLinks({ role, loc, exp }: { role: string; loc: string; exp?: number }) {
  if (!role.trim()) return null;
  const links = portalLinks(role.trim(), loc.trim(), exp);
  const groups = [...new Set(links.map((l) => l.group))];
  return (
    <details className="mt-4 rounded-xl border border-border p-3" data-testid="portal-links">
      <summary className="cursor-pointer text-sm font-medium">Search on {links.length} other portals: LinkedIn, Naukri, Indeed, Foundit and more, prefilled with “{role}”{loc ? ` in ${loc}` : ''}</summary>
      <p className="mt-2 text-xs text-muted-foreground">These open each site's own search page in a new tab. JAOS does not copy jobs from them (their terms forbid it).</p>
      {groups.map((g) => (
        <div key={g} className="mt-2"><div className="label text-muted-foreground">{g}</div>
          <div className="mt-1 flex flex-wrap gap-2">{links.filter((l) => l.group === g).map((l) => <a key={l.name} href={l.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-9 items-center rounded-full bg-muted px-3 text-xs hover:text-primary">{l.name}</a>)}</div>
        </div>
      ))}
    </details>
  );
}
