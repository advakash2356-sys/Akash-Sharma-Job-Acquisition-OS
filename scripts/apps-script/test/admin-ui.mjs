import puppeteer from 'puppeteer-core';
const B = process.env.B || 'http://localhost:3000', T = process.env.TAG || 'local';
const br = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] }); const sl = ms => new Promise(r => setTimeout(r, ms));
const errs = []; const reqs = [];
async function page(session, mock) {
  const p = await br.newPage(); await p.setViewport({ width: 1280, height: 900 }); p.on('pageerror', e => errs.push(e.message)); p.on('request', r => reqs.push(r.url()));
  await p.goto(B + '/', { waitUntil: 'domcontentloaded' });
  await p.evaluate(s => { localStorage.clear(); if (s) localStorage.setItem('jaos_session_v1', JSON.stringify(s)); }, session);
  if (mock) { await p.setRequestInterception(true); p.on('request', r => { if (r.url().includes('gsi/client')) r.respond({ status: 200, contentType: 'text/javascript', body: 'window.google={accounts:{id:{initialize(o){window.__cb=o.callback},renderButton(el){var b=document.createElement("button");b.id="fakegsi";b.textContent="Continue with Google";b.onclick=function(){window.__cb({credential:"fake.token.for.test"})};el.appendChild(b)},disableAutoSelect(){}}}};' }); else if (r.url().includes('/api/admin/data')) r.respond({ status: 200, contentType: 'application/json', body: JSON.stringify(mock) }); else r.continue(); }); }
  await p.goto(B + '/admin', { waitUntil: 'networkidle2' }); await sl(1500); return p;
}
let p = await page(null); console.log('no session -> 404:', !!(await p.$('[data-testid=admin-404]')), '| robots:', await p.$eval('meta[name=robots]', m => m.content).catch(() => 'none'));
await p.screenshot({ path: `/workspace/launch/admin-2026-10-24-${T}-nonadmin.png` });
p = await page({ uid: '1', name: 'X', email: 'someone@gmail.com', photo: '' }); console.log('non-admin session -> 404:', !!(await p.$('[data-testid=admin-404]')));
p = await page({ uid: '2', name: 'Akash', email: 'adv.akash2356@gmail.com', photo: '' }); console.log('admin session -> verify button:', !!(await p.$('iframe[src*="accounts.google.com"]')), 'not 404:', !(await p.$('[data-testid=admin-404]')));
// Dashboard render with a mocked data response (token is fake; the real server returns 404 for it, tested by curl)
const mock = JSON.parse(process.env.MOCK);
p = await page({ uid: '2', name: 'Akash', email: 'adv.akash2356@gmail.com', photo: '' }, mock);
await p.screenshot({ path: `/workspace/launch/admin-2026-10-24-${T}-verify.png` });
await p.click('#fakegsi'); await sl(1200);
console.log('dashboard rendered (mocked Google + data):', !!(await p.$('[data-testid=admin-dashboard]')));
await p.type('[data-testid=users-filter]', 'b@'); await sl(200); console.log('user filter rows:', await p.$$eval('[data-testid=admin-users] tbody tr', r => r.length));
await p.evaluate(() => { const i = document.querySelector('[data-testid=users-filter]'); }); 
await p.screenshot({ path: `/workspace/launch/admin-2026-10-24-${T}-dashboard.png`, fullPage: true });
// public site does not load the admin chunk
const q = await br.newPage(); const urls = []; q.on('request', r => urls.push(r.url())); await q.goto(B + '/', { waitUntil: 'networkidle2' }); await q.goto(B + '/#/app/overview', { waitUntil: 'networkidle2' }); await sl(800);
console.log('public loads AdminApp chunk:', urls.some(u => /AdminApp/.test(u)));
console.log('errors', errs); await br.close();
