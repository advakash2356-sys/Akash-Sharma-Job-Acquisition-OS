import puppeteer from 'puppeteer-core';
const B = process.env.B; const br = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] }); const sl = ms => new Promise(r => setTimeout(r, ms));
const b64 = o => Buffer.from(JSON.stringify(o)).toString('base64url');
const tok = (n, exp) => `${b64({ alg: 'RS256' })}.${b64({ sub: 'test-uid', exp, n })}.sig${n}xxxxxxxxxxxxxxxx`;
const now = () => Math.floor(Date.now() / 1000);
async function run(label, { oneTap, serverOkFor }) {
  const p = await br.newPage(); await p.setViewport({ width: 1280, height: 900 }); const errs = []; p.on('pageerror', e => errs.push(e.message));
  const seen = [];
  await p.setRequestInterception(true);
  p.on('request', r => {
    const u = r.url();
    if (u.includes('gsi/client')) return r.respond({ status: 200, contentType: 'text/javascript', body: `window.google={accounts:{id:{initialize(o){window.__cb=o.callback},prompt(n){${oneTap ? `setTimeout(()=>window.__cb({credential:${JSON.stringify(tok(2, now() + 3600))}}),200)` : `n&&n({isNotDisplayed:()=>true})`}},renderButton(el){var b=document.createElement('button');b.id='fakegsi';b.textContent='Continue with Google';b.onclick=()=>window.__cb({credential:${JSON.stringify(tok(3, now() + 3600))}});el.appendChild(b)},disableAutoSelect(){}}}};` });
    if (u.includes('/api/ai/')) { const a = r.headers()['authorization'] || ''; seen.push(a ? 'token' + (a.match(/sig(\d)/) || [])[1] : 'none'); const ok = serverOkFor.some(n => a.includes('sig' + n)); return r.respond({ status: ok ? 200 : 401, contentType: 'application/json', body: JSON.stringify(ok ? { result: { ok: true } } : { error: 'Your sign-in has expired', code: 'AUTH_EXPIRED' }) }); }
    r.continue();
  });
  await p.goto(B + '/#/x'); await p.evaluate((t) => { localStorage.clear(); localStorage.setItem('jaos_no_stats', '1'); localStorage.setItem('jaos_session_v1', JSON.stringify({ uid: 'test-uid', name: 'Test', email: 'test@example.com', photo: '' })); localStorage.setItem('user_gemini_api_key_v1:test-uid', 'AIzaFAKEKEYFORTEST000000000000000'); sessionStorage.setItem('jaos_idt_v1', t); }, tok(1, now() + 3600));
  await p.goto('about:blank'); await p.goto(B + '/#/app/settings', { waitUntil: 'networkidle2' }); await sl(1500);
  await p.type('#key', 'typed-but-unsaved'); // work in progress on the page
  await p.evaluate(() => [...document.querySelectorAll('button')].find(b => b.textContent.trim() === 'Test key')?.click()); await sl(2500);
  const prompt = !!(await p.$('[data-testid=reauth-prompt]'));
  if (prompt) { await p.screenshot({ path: `/workspace/launch/auth-2026-10-24-${process.env.TAG}-reauth.png` }); await p.click('#fakegsi'); await sl(2000); }
  const msg = await p.evaluate(() => document.querySelector('[role=status]')?.textContent || '');
  console.log(label.padEnd(34), '| calls', seen.join(' > '), '| reauth prompt', prompt, '| result:', msg.slice(0, 50), '| errors', errs.length);
  await p.close();
}
await run('A valid token', { oneTap: true, serverOkFor: [1] });
await run('B expired -> silent One Tap retry', { oneTap: true, serverOkFor: [2] });
await run('C silent fails -> re-sign-in dialog', { oneTap: false, serverOkFor: [3] });
await br.close();
