import { load } from './mock.mjs'; import assert from 'assert';
const key = process.env.GEMINI_API_KEY;
for (const [label, props] of [['gemini', { GEMINI_API_KEY: key }], ['nokey', {}]]) {
  const g = load(props); g.ctx.setup(); g.ctx.setupAutoReply(); g.mails.length = 0;
  assert.equal(g.triggers.length, 1);
  g.post({ type: 'feedback', name: 'Riya Sen', email: 'riya@example.com', rating: 4, message: '[TEST - please ignore] The job search found good remote roles but the salary page was confusing on mobile.', page: '/feedback' });
  g.post({ type: 'feedback', name: 'NoMail', email: '', rating: 5, message: 'nice', page: '/' });
  g.mails.length = 0; g.ctx.autoReply(); assert.equal(g.mails.length, 0); // too early
  const d = g.sheets.Feedback.d; d[1][11] -= 11 * 60000; d[2][11] -= 11 * 60000;
  g.ctx.autoReply(); g.ctx.autoReply();
  assert.equal(g.mails.length, 1); assert.equal(g.mails[0].to, 'adv.akash2356@gmail.com'); assert.match(g.mails[0].subject, /^\[TEST - please ignore\]/);
  console.log(`--- ${label}: status="${d[1][8]}" | row2="${d[2][8]}"\n${g.mails[0].subject}\n${g.mails[0].body}\n`);
}
