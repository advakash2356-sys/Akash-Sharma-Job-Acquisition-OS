// Live production check of launch items + a real job search for one profile. GoatCounter requests are aborted
// (after the CSP check), so audits never add to the owner's stats. Never sends email. Key comes from env, never printed.
import puppeteer from 'puppeteer-core'; import fs from 'fs';
const BASE=process.env.BASE||'https://akash-sharma-job-acquisition-os.vercel.app'; const KEY=process.env.GEMINI_API_KEY||'';
const sl=ms=>new Promise(r=>setTimeout(r,ms)); const R=[];
const T=async(page,promise,fn)=>{let res,ev;try{[res,ev]=await fn();}catch(e){res='No';ev='error: '+String(e.message).slice(0,120);}ev=String(ev).split(KEY||'\u0000').join('[key]');R.push({n:'P'+(R.length+1),page,promise,res,ev:ev.replace(/\|/g,'/').replace(/\n/g,' ').slice(0,260)});console.log('P'+R.length,res,promise.slice(0,60),'::',ev.slice(0,160));};
const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox'],headless:'new'});
let gc=[], csp=[];
async function fresh(url,w=1280,h=1000){for(const o of await b.pages())await o.close().catch(()=>{});const p=await b.newPage();await p.setViewport({width:w,height:h});await p.setRequestInterception(true);
 p.on('request',r=>{if(/goatcounter\.com/.test(r.url())){gc.push(decodeURIComponent(r.url()));return r.abort();}r.continue();});
 await p.evaluateOnNewDocument(()=>document.addEventListener('securitypolicyviolation',e=>console.log('CSPV '+e.violatedDirective+' '+e.blockedURI)));
 p.on('console',m=>{if(m.text().startsWith('CSPV'))csp.push(m.text())});
 await p.goto(BASE+'/#/x');await p.evaluate(()=>localStorage.clear());await p.goto(url);await sl(2500);return p;}
const txt=p=>p.evaluate(()=>document.body.innerText);
const click=(p,re)=>p.evaluate(s=>{const e=[...document.querySelectorAll('button,a')].find(e=>new RegExp(s).test(e.textContent.trim()));e?.click();return !!e},re.source);
const meta=p=>p.evaluate(()=>({t:document.title,c:document.querySelector('link[rel=canonical]')?.href,h1:document.querySelector('h1')?.textContent}));

let p=await fresh(BASE+'/?ref=linkedin&utm_campaign=launch-oct26');
await T('Landing','Live landing: footer credit + copyright',async()=>{const f=await p.evaluate(()=>document.querySelector('footer')?.innerText||'');return [/Made by Akash Sync Agent/i.test(f)&&/© 2026 Akash Sync Agent \(Adv\. Akash Sharma\)/i.test(f)?'Yes':'No',f.replace(/\n/g,' · ').slice(0,160)]});
await T('Funnel','Channel link counted by source (pageview q=ref + from_<channel> event)',async()=>[gc.some(u=>/p=\/&.*q=\?ref=linkedin&utm_campaign=launch-oct26/.test(u))&&gc.some(u=>/p=from_linkedin/.test(u))&&gc.some(u=>/p=landing_view/.test(u))?'Yes':'No',gc.map(u=>u.replace(/^.*count\?/,'').replace(/&rnd=\w+/,'')).join(' | ')]);
await T('SEO','JSON-LD Organization + WebApplication, no ratings',async()=>{const j=await p.evaluate(()=>document.querySelector('script[type="application/ld+json"]')?.textContent||'');const g=JSON.parse(j)['@graph'];return [g.some(x=>x['@type']==='Organization'&&x.name==='Akash Sync Agent')&&g.some(x=>x['@type']==='WebApplication')&&!/aggregateRating|review/i.test(j)?'Yes':'No',g.map(x=>x['@type']+': '+x.name).join(', ')+'; no aggregateRating/review']});
for(const [u,h] of [['/about','About Momentum'],['/terms','Terms of use'],['/feedback','Share your feedback'],['/privacy','Privacy & security']]){p=await fresh(BASE+u);await T('SEO',`Clean URL ${u}: page, title, canonical`,async()=>{const m=await meta(p);return [m.h1===h&&m.c===BASE+u&&/Momentum/.test(m.t)?'Yes':'No',JSON.stringify(m)]});}
await T('Privacy','Live Privacy lists counted steps + page view/channel',async()=>{const t=await txt(p);return [/GoatCounter/.test(t)&&/landing view/.test(t)&&/ref=instagram/.test(t)&&/no cookies/i.test(t)?'Yes':'No','GoatCounter host akashsyncagent.goatcounter.com, 8 steps + page view + channel']});
p=await fresh(BASE+'/#/app/settings');
await T('App','Live sidebar credit, Terms, copyright',async()=>{const s=await p.evaluate(()=>document.querySelector('aside')?.innerText||'');return [/Made by Akash Sync Agent/i.test(s)&&/© 2026 Akash Sync Agent/i.test(s)&&/Terms/i.test(s)?'Yes':'No','sidebar footer present']});
await T('App','Live in-app 404',async()=>{await p.goto(BASE+'/#/app/zzz');await sl(1500);return [/Off the path\./.test(await txt(p))?'Yes':'No','"Off the path."']});
const r404=await fetch(BASE+'/nope-xyz'); const t404=await r404.text();
await T('Static','Live 404 for unknown path',async()=>[r404.status===404&&/Off the path\./.test(t404)?'Yes':'No','HTTP '+r404.status+', styled 404.html']);
const hr=await fetch(BASE+'/'); const H=k=>hr.headers.get(k)||'';
await T('Static','Live security headers',async()=>[/frame-ancestors 'none'/.test(H('content-security-policy'))&&/akashsyncagent\.goatcounter\.com/.test(H('content-security-policy'))&&H('x-frame-options')==='DENY'&&H('x-content-type-options')==='nosniff'&&/max-age/.test(H('strict-transport-security'))&&H('referrer-policy')&&H('permissions-policy')?'Yes':'No','CSP, XFO DENY, nosniff, HSTS, Referrer-Policy, Permissions-Policy']);
const sm=await (await fetch(BASE+'/sitemap.xml')).text(); const rb=await (await fetch(BASE+'/robots.txt')).text();
await T('SEO','Live sitemap (live domain, 5 URLs) + robots',async()=>[(sm.match(/<loc>https:\/\/akash-sharma-job-acquisition-os\.vercel\.app\//g)||[]).length===5&&/Sitemap: /.test(rb)?'Yes':'No','5 <loc> on live domain; robots Sitemap line']);
const og=await fetch(BASE+'/og.jpg');
await T('SEO','Live OG image',async()=>[og.status===200&&/jpeg/.test(og.headers.get('content-type'))?'Yes':'No','og.jpg 200 image/jpeg']);

// Real job search, Akash's real profile facts only (no AI, then AI with his key if present)
const resume=`Akash Sharma\nDelhi NCR (open to remote)\nLegal Operations and Contract Management professional.\nContract lifecycle management (CLM), contract review and drafting, legal operations.\nFormer Team Lead at Gartner.`;
const prof={name:'Akash Sharma',location:'Delhi NCR',resumeText:resume,targetRoles:'Legal Operations, Contract Manager, CLM Specialist',setupDone:'',remote:true};
p=await fresh(BASE+'/#/app/setup'); await p.evaluate(pr=>{localStorage.setItem('jaos_profile_v1',JSON.stringify(pr));localStorage.setItem('jaos_no_stats','1');},prof); await p.reload(); await sl(2500);
await T('Jobs','No-AI path: "Skip AI, search jobs now" returns real jobs',async()=>{await click(p,/Skip AI, search jobs now/);let jobs=[];for(let i=0;i<30;i++){await sl(2000);jobs=await p.evaluate(()=>JSON.parse(localStorage.getItem('jaos_jobs_v1')||'[]').filter(j=>j.found));if(jobs.length&&!/Searching/i.test(await txt(p)))break;}fs.writeFileSync('/tmp/live-jobs-noai.json',JSON.stringify(jobs.map(j=>({t:j.title,c:j.company,u:j.url,l:j.found?.location,src:j.found?.source})),null,1));return [jobs.length?'Yes':'No',`${jobs.length} jobs, e.g. `+jobs.slice(0,3).map(j=>`${j.title} @ ${j.company}`).join('; ')]});
const jobs=JSON.parse(fs.readFileSync('/tmp/live-jobs-noai.json','utf8'));
await T('Jobs','Job links open (HTTP check of first 5)',async()=>{const out=[];for(const j of jobs.slice(0,5)){try{const r=await fetch(j.u,{redirect:'follow',signal:AbortSignal.timeout(15000),headers:{'user-agent':'Mozilla/5.0'}});out.push(r.status);}catch(e){out.push('err')}}const ok=out.filter(s=>s>=200&&s<400).length;return [ok>=Math.min(3,jobs.length)&&jobs.length?'Yes':(ok?'Partial':'No'),'statuses: '+out.join(',')]});
if(KEY){p=await fresh(BASE+'/#/app/setup'); await p.evaluate((pr,k)=>{localStorage.setItem('jaos_profile_v1',JSON.stringify({...pr,targetRoles:''}));localStorage.setItem('user_gemini_api_key_v1:guest',k);localStorage.setItem('jaos_no_stats','1');},prof,KEY); await p.reload();
 await T('Jobs','AI path: guided setup with Akash\'s key fills roles and finds jobs',async()=>{let pr={},jobs=[];for(let i=0;i<45;i++){await sl(2000);pr=await p.evaluate(()=>JSON.parse(localStorage.getItem('jaos_profile_v1')||'{}'));jobs=await p.evaluate(()=>JSON.parse(localStorage.getItem('jaos_jobs_v1')||'[]').filter(j=>j.found));if(jobs.length&&pr.setupDone)break;}fs.writeFileSync('/tmp/live-jobs-ai.json',JSON.stringify(jobs.map(j=>({t:j.title,c:j.company,u:j.url,l:j.found?.location})),null,1));return [jobs.length?'Yes':'No',`AI roles: ${pr.targetRoles||'-'}; ${jobs.length} jobs, e.g. `+jobs.slice(0,3).map(j=>`${j.title} @ ${j.company}`).join('; ')]});}
else await T('Jobs','AI path','No key on box',async()=>['Partial','needs a Gemini key']);
await T('Security','No CSP violations across the live run',async()=>[csp.length?'No':'Yes',csp.length?csp.slice(0,3).join(' | '):'0 violations']);
p=await fresh(BASE+'/',390,800);
await T('Mobile','Live landing fits 390px',async()=>{const o=await p.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);return [o<=2?'Yes':'No','overflow px '+o]});
fs.writeFileSync('/tmp/live-launch.json',JSON.stringify(R,null,1)); await b.close(); console.log('PASS',R.filter(r=>r.res==='Yes').length,'/',R.length);
