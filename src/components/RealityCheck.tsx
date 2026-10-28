import { useState } from 'react';
import { Badge, Card } from './ui';
import { realityCheck, type RealityInput } from '../lib/realityCheck';
import { COURSE_DISCLAIMER, courseLinks, quoteFor } from '../lib/courses';

export default function RealityCheck(p: RealityInput & { jobText?: string }) {
  const r = realityCheck(p);
  const [ok, setOk] = useState(false);
  return (
    <Card className="border-gold/40" data-testid="reality-check">
      <div className="mb-1 flex items-center gap-2"><h3 className="text-lg font-medium">Reality check</h3><Badge tone={r.tier === 'safe' ? 'primary' : r.tier === 'fit' ? 'gold' : 'danger'}>{r.tier}</Badge></div>
      <p className="text-sm font-medium">{r.headline}</p>
      <p className="mt-1 text-sm"><b>Risk:</b> {r.risk}</p>
      <p className="text-sm"><b>Reward:</b> {r.reward}</p>
      {r.gaps.length > 0 && <p className="mt-1 text-sm"><b>Skill gaps:</b> {r.gaps.join(', ')}</p>}
      <p className="mt-1 text-sm"><b>Competition:</b> {r.competition}</p>
      {r.improve.length > 0 && <div className="mt-1 text-sm"><b>Top 2 to improve:</b><ol className="list-decimal pl-5">{r.improve.map((x, i) => <li key={i}>{x}</li>)}</ol></div>}
      {r.gaps.length > 0 && (
        <div className="mt-3 rounded-lg bg-muted p-3 text-sm" data-testid="course-suggestions">
          <b>Learn the missing skills</b>
          <label className="mt-1 flex items-start gap-2 text-xs"><input type="checkbox" data-testid="course-consent" checked={ok} onChange={(e) => setOk(e.target.checked)} /> <span>{COURSE_DISCLAIMER} (<a className="underline" href="/terms#courses">Terms</a>)</span></label>
          {ok && r.gaps.map((g) => { const quote = quoteFor(g, p.jobText); return (
            <div key={g} className="mt-2">
              <div className="font-medium">{g}</div>
              {quote ? <blockquote className="border-l-2 border-gold pl-2 text-xs italic">Job post: "{quote}"</blockquote> : <p className="text-xs text-muted-foreground">The job post doesn't name this exactly; the match inferred it. Check before you study for it.</p>}
              <ul className="list-disc pl-5">{courseLinks(g).map((c) => <li key={c.provider}><a className="underline text-primary" href={c.url} target="_blank" rel="noreferrer noopener">{c.provider}</a> · {c.cost} · hours {c.hours}</li>)}</ul>
            </div>); })}
        </div>
      )}
      <p className="mt-2 text-xs text-muted-foreground">Based only on the match result above. No made-up numbers.</p>
    </Card>
  );
}
