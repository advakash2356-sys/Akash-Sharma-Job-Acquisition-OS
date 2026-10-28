import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeMetrics } from '../server/adminMetrics';
const now = Date.UTC(2026, 9, 28, 6);
const ev = (d: string, e: string, t: string, s = '', detail = '') => [`${d} 09:00`, d, e, t, s, 'dev', detail];
test('marketing groups by first ?src= and tallies the price pulse', () => {
  const m: any = computeMetrics([['a@x.io', 'A', '', '2026-10-28 09:00'], ['b@x.io', 'B', '', '2026-10-28 09:00']], [
    ev('2026-10-28', 'a@x.io', 'signup', 'qr_reel20'), ev('2026-10-28', 'a@x.io', 'job_viewed'), ev('2026-10-28', 'a@x.io', 'price_pulse', '', 'choice=coffee'),
    ev('2026-10-28', 'b@x.io', 'signup', 'ig'),
  ], [], now);
  const qr = m.marketing.qrSources[0];
  assert.equal(qr.source, 'qr_reel20'); assert.equal(qr.signups, 1); assert.equal(qr.jobViewed, 1);
  assert.deepEqual(m.marketing.pricePulse, [{ name: 'coffee', value: 1 }]);
  assert.equal(m.marketing.funnel[1].users, 2);
});
