import { Badge, Card } from './ui';
import { realityCheck, type RealityInput } from '../lib/realityCheck';

export default function RealityCheck(p: RealityInput) {
  const r = realityCheck(p);
  return (
    <Card className="border-gold/40" data-testid="reality-check">
      <div className="mb-1 flex items-center gap-2"><h3 className="text-lg font-medium">Reality check</h3><Badge tone={r.tier === 'safe' ? 'primary' : r.tier === 'fit' ? 'gold' : 'danger'}>{r.tier}</Badge></div>
      <p className="text-sm font-medium">{r.headline}</p>
      <p className="mt-1 text-sm"><b>Risk:</b> {r.risk}</p>
      <p className="text-sm"><b>Reward:</b> {r.reward}</p>
      {r.gaps.length > 0 && <p className="mt-1 text-sm"><b>Skill gaps:</b> {r.gaps.join(', ')}</p>}
      <p className="mt-1 text-sm"><b>Competition:</b> {r.competition}</p>
      {r.improve.length > 0 && <div className="mt-1 text-sm"><b>Top 2 to improve:</b><ol className="list-decimal pl-5">{r.improve.map((x, i) => <li key={i}>{x}</li>)}</ol></div>}
      <p className="mt-2 text-xs text-muted-foreground">Based only on the match result above. No made-up numbers.</p>
    </Card>
  );
}
