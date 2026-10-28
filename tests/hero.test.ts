// Sample data below is made up for tests (labelled "sample"). Akash Sync Agent.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { scanMessage, shareText, normPhone } from '../src/lib/scamShield';
import { truthScore, repostCount } from '../src/lib/truthScore';
import { schedule, isGhosted, draft, replyStats, companyRates } from '../src/lib/ghost';
import { contactCheck } from '../src/lib/contactCheck';
import { hasTerm } from '../src/lib/keywords';

test('scam: fee with rupee amount is red', () => { const r = scanMessage({ message: 'Sample: You are shortlisted at Tata Motors. Pay ₹1,800 registration fee via UPI to schedule 2 interviews today only.' }); assert.equal(r.verdict, 'red'); assert.ok(r.signs.some((s) => s.title === 'Asks you to pay')); assert.ok(r.signs.some((s) => s.title === 'Time pressure')); });
test('scam: Hinglish fee is red', () => { assert.equal(scanMessage({ message: 'Sample: interview ke liye 2500 rupaye fees jama karo turant' }).verdict, 'red'); });
test('scam: Hindi fee is red', () => { assert.equal(scanMessage({ message: 'नमूना: इंटरव्यू के लिए ₹500 फीस जमा करें' }).verdict, 'red'); });
test('scam: lookalike naukri domain is red', () => { const r = scanMessage({ message: 'Sample: HR from Naukri here', email: 'hr@naukri-jobs.in' }); assert.equal(r.verdict, 'red'); });
test('scam: free mail + whatsapp is amber', () => { const r = scanMessage({ message: 'Sample: Hi, I am hiring for Infosys, message me on WhatsApp', email: 'infosys.hr@gmail.com' }); assert.equal(r.verdict, 'amber'); assert.ok(r.signs.length >= 2); });
test('scam: normal recruiter mail is green', () => { assert.equal(scanMessage({ message: 'Sample: Thanks for applying to the Analyst role. Could you share your availability for a 30 minute call next week?', email: 'talent@acme-sample.com' }).verdict, 'green'); });
test('scam: task fraud is red', () => { assert.equal(scanMessage({ message: 'Sample: Part time job, like videos on YouTube and earn ₹300 per task' }).verdict, 'red'); });
test('scam: share text has no message content', () => { const r = scanMessage({ message: 'Sample secret 9876543210 pay ₹999 fee' }); const s = shareText(r); assert.ok(!s.includes('9876543210')); assert.ok(s.includes('never ask you to pay')); assert.equal(normPhone('+91 98765-43210'), '9876543210'); });

const now = Date.parse('2026-10-28');
test('truth: fresh live salaried good fit = apply', () => { const t = truthScore({ postedAt: '2026-10-25', alive: 'live', reposts: 0, description: 'Salary ₹8-12 LPA', fit: 80, now }); assert.equal(t.verdict, 'apply'); assert.equal(t.score, 95); });
test('truth: dead link = skip', () => { const t = truthScore({ postedAt: '2026-09-17', alive: 'dead', fit: 72, now }); assert.equal(t.verdict, 'skip'); assert.equal(t.label, "Don't apply"); assert.ok(t.dontApply.length >= 1); });
test('truth: unknown = check', () => { assert.equal(truthScore({ now }).verdict, 'check'); });
test('truth: repost count', () => { const a = { id: '1', title: 'Sales Executive', company: 'Sample Co' }; assert.equal(repostCount(a, [a, { ...a, id: '2' }, { ...a, id: '3', title: 'Sales executive (Delhi)' }]), 2); });

const job = (p: any) => ({ id: 'j', title: 'Analyst', company: 'Sample Co', url: '', description: '', status: 'Applied', createdAt: '2026-10-01', notes: '', interviews: [], ...p });
test('ghost: schedule 5/10/21 and states', () => { const s = schedule(job({ appliedAt: '2026-10-01' }) as any, '2026-10-12'); assert.deepEqual(s.map((x) => x.date), ['2026-10-06', '2026-10-11', '2026-10-22']); assert.deepEqual(s.map((x) => x.state), ['due', 'due', 'upcoming']); });
test('ghost: ghosted after 21 days, not after reply', () => { assert.ok(isGhosted(job({ appliedAt: '2026-10-01' }) as any, '2026-10-22')); assert.ok(!isGhosted(job({ appliedAt: '2026-10-01', reply: { text: 'x', kind: 'positive', at: '' } }) as any, '2026-10-28')); });
test('ghost: drafts are plain', () => { for (const n of [1, 2, 3] as const) { const d = draft(job({ appliedAt: '2026-10-01' }) as any, n, 'Riya Demo'); assert.ok(!/—|hope this (email )?finds you|delve|thrilled/i.test(d.body)); assert.ok(d.body.includes('Riya Demo')); } });
test('ghost: reply stats', () => { const js = [job({ id: 'a', appliedAt: '2026-10-01' }), job({ id: 'b', appliedAt: '2026-10-01', status: 'Interviewing' }), job({ id: 'c', appliedAt: '2026-10-27' })] as any; const s = replyStats(js, '2026-10-28'); assert.equal(s.applied, 2); assert.equal(s.replied, 1); assert.equal(s.ghosted, 1); assert.equal(s.rate, 50); assert.equal(companyRates(js, '2026-10-28')[0].company, 'Sample Co'); });
test('contact check catches misspelt name and email', () => { const r = contactCheck('Best, Riya Sharmaa. riya.sharma@gmial.com', { name: 'Riya Sharma', email: 'riya.sharma@gmail.com' }); assert.ok(r.some((x) => x.kind === 'name')); assert.ok(r.some((x) => x.kind === 'email')); assert.equal(contactCheck('Riya Sharma riya.sharma@gmail.com', { name: 'Riya Sharma', email: 'riya.sharma@gmail.com' }).length, 0); });
test('keywords: Presented vs presenting, SaaS', () => { assert.ok(hasTerm('Presented to the board', 'presenting')); assert.ok(hasTerm('Sold SAAS products', 'saas')); assert.ok(hasTerm('Experience with React.js', 'react')); });
import { privateIp } from '../server/linkCheck';
test('link check blocks private addresses', () => { for (const ip of ['127.0.0.1', '10.1.2.3', '192.168.0.1', '169.254.169.254', '172.20.0.1', '::1']) assert.ok(privateIp(ip), ip); assert.ok(!privateIp('8.8.8.8')); });
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
test('extension field map', () => { const ctx: any = {}; vm.runInNewContext(readFileSync('extension/fieldmap.js', 'utf8'), { globalThis: ctx }); const M = ctx.JAOS_MAP;
  const cases: [string, string | null][] = [['First Name', 'firstName'], ['legalNameSection_lastName', 'lastName'], ['Email address', 'email'], ['Mobile Number', 'phone'], ['LinkedIn Profile', 'linkedin'], ['Expected CTC', 'expectedCtc'], ['Full name', 'fullName'], ['Password', null], ['Gender', null], ['Aadhaar number', null], ['I agree to the terms', null]];
  for (const [d, k] of cases) assert.equal(M.match(d.toLowerCase().replace(/[_-]+/g, ' ')), k, d); });
