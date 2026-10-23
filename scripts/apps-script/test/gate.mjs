import puppeteer from 'puppeteer-core';
const B = process.env.B || 'http://localhost:3000', T = process.env.TAG || 'local';
const br = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] }); const p = await br.newPage(); await p.setViewport({ width: 1280, height: 900 });
const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto(B + '/#/app/overview', { waitUntil: 'networkidle2' }); await new Promise(r => setTimeout(r, 1500));
const gate = await p.$('[data-testid=signin-gate]'); console.log('gate shown:', !!gate);
if (gate) { await p.type('#gate-mobile', '+91 9800000000'); await p.click('[data-testid=gate-consent]'); await new Promise(r => setTimeout(r, 2500)); console.log('google iframe:', !!(await p.$('iframe[src*="accounts.google.com"]'))); }
await p.screenshot({ path: `/workspace/launch/signin-2026-10-24-${T}-gate.png` });
await p.goto(B + '/#/app/privacy', { waitUntil: 'networkidle2' }); await new Promise(r => setTimeout(r, 1200));
console.log('privacy open w/o sign-in:', !!(await p.$('[data-testid=dpdp-consent]')));
await (await p.$('[data-testid=dpdp-consent]'))?.scrollIntoView(); await p.screenshot({ path: `/workspace/launch/signin-2026-10-24-${T}-privacy.png` });
console.log('errors', errs); await br.close();
