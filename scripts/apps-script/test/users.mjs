import { load } from './mock.mjs'; import assert from 'assert';
const g = load(); g.ctx.setup();
assert.equal(g.post({ type: 'visit', email: 'a@x.com', deviceId: 'd1' }).ok, false); // unknown user cannot be created by a visit
assert.ok(g.post({ type: 'user', email: 'A@x.com', name: 'A', mobile: '+91 98', deviceId: 'dev-1111111111111111', fp: 'ab', ua: 'UA' }).ok);
assert.ok(g.post({ type: 'visit', email: 'a@x.com', deviceId: 'dev-1111111111111111' }).ok);
assert.equal(g.post({ type: 'visit', email: 'a@x.com', deviceId: 'other' }).ok, false);
assert.ok(g.post({ type: 'user', email: 'b@x.com', name: 'B', deviceId: 'dev-1111111111111111', fp: 'ab' }).ok);
assert.equal(g.post({ type: 'user', email: 'c@x.com', secret: 'wrong' }).ok, false);
const u = g.sheets.Users.d; console.log(u.map(r => r.join(' | ')).join('\n'));
assert.equal(u[1][5], 2); assert.match(String(u[1][8]), /yes: 2 accounts/); assert.match(String(u[2][8]), /yes: 2/);
console.log('users ok; mails', g.mails.length);
assert.ok(g.post({ type: 'event', email: 'a@x.com', deviceId: 'dev-1111111111111111', event: 'job_viewed', source: 'linkedin' }).ok);
assert.equal(g.post({ type: 'event', email: 'z@x.com', deviceId: 'dev-1111111111111111', event: 'job_viewed' }).ok, false);
assert.equal(g.post({ type: 'event', email: 'a@x.com', deviceId: 'dev-1111111111111111', event: 'signup' }).ok, false);
const ad = g.post({ type: 'admin-read' }); assert.equal(ad.users.length, 2); assert.equal(ad.events.map(e => e[3]).join(','), 'signup,visit,signup,job_viewed');
assert.ok(g.post({ type: 'config-save', config: { masterOn: false } }).ok); assert.equal(g.post({ type: 'admin-read' }).config, '{"masterOn":false}');
console.log('events/admin ok');
