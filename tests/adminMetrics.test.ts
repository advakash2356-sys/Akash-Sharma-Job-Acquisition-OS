import test from "node:test"; import assert from "node:assert/strict";
import { computeMetrics, istToday } from "../server/adminMetrics.ts";
const now = Date.UTC(2026, 9, 24, 6); const day = (n: number) => new Date(istToday(now) - n * 86400000).toISOString().slice(0, 10);
test("empty sheet: everything is 'no data yet' (null)", () => {
  const m = computeMetrics([], [], [], now);
  assert.equal(m.totals.users, null); assert.equal(m.active, null); assert.equal(m.funnel, null); assert.equal(m.cohorts, null); assert.equal(m.revenue.mrr, null);
});
test("real rows: DAU/WAU/MAU, funnel, cohort, channels, themes", () => {
  const users = [["a@x.com", "A", "", day(40) + " 10:00", day(0) + " 10:00", "5", "d1", "", "", "", ""], ["b@x.com", "B", "", day(3) + " 09:00", day(3) + " 09:00", "1", "d1", "", "yes: 2 accounts", "", ""]];
  const events = [[day(40), day(40), "a@x.com", "signup", "linkedin", "d1"], [day(33), day(33), "a@x.com", "visit", "", "d1"], [day(12), day(12), "a@x.com", "visit", "", "d1"], [day(0), day(0), "a@x.com", "job_viewed", "", "d1"], [day(3), day(3), "b@x.com", "signup", "", "d1"]];
  const m = computeMetrics(users, events, [["t", "R", "r@x", "4", "Salary page slow on mobile", "/", "", "new", "sent (Gemini)", "t", "Hi"]], now);
  assert.deepEqual(m.active, { dau: 1, wau: 2, mau: 2, stickiness: 50 });
  assert.equal(m.funnel![2].users, 1); assert.equal(m.totals.flaggedDevices, 1);
  const old = m.cohorts!.find((c) => c.users === 1 && c.w4 !== null)!; assert.equal(old.w4, 100); assert.equal(old.w1, 100); // visit 7 days after sign-up
  assert.deepEqual(m.channels, [{ source: "linkedin", signups: 1 }, { source: "direct / unknown", signups: 1 }]);
  assert.ok(m.themes!.some((t) => t.theme === "Salary"));
});
