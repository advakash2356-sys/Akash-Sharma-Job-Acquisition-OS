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
