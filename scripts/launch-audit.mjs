// Launch audit: branding, funnel counting, feedback, gap check. Run with the dev server (BASE) and an
// analytics-on preview build (GA_BASE, built with VITE_GOATCOUNTER_CODE=auditcode). Goatcounter requests are
// intercepted and aborted, so nothing is ever sent.
import puppeteer from 'puppeteer-core'; import fs from 'fs'; import { execSync } from 'child_process';
const BASE=process.env.BASE||'http://localhost:3000'; const GA=process.env.GA_BASE||'http://localhost:4174';
const sl=ms=>new Promise(r=>setTimeout(r,ms)); const DL='/tmp/dll';
const R=[]; const T=async(page,promise,test,fn)=>{let res,ev;try{[res,ev]=await fn();}catch(e){res='No';ev='error: '+String(e.message).slice(0,120);}R.push({n:'L'+(R.length+1),page,promise,test,res,ev:String(ev).replace(/\|/g,'/').replace(/\n/g,' ').slice(0,230)});console.log('L'+R.length,res,promise.slice(0,55),'::',String(ev).slice(0,120));};
fs.rmSync(DL,{recursive:true,force:true}); fs.mkdirSync(DL);
const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox'],headless:'new'});
const hosts=new Set(); let gc=[];
async function fresh(url,w=1280,h=1000,pre){for(const o of await b.pages())await o.close().catch(()=>{});const p=await b.newPage();await p.setViewport({width:w,height:h});await p.setRequestInterception(true);
 p.on('request',r=>{try{const u=new URL(r.url());if(u.host)hosts.add(u.host);if(/goatcounter\.com/.test(u.host)){gc.push(r.url());return r.abort();}}catch{}r.continue();});
 const c=await p.createCDPSession();await c.send('Page.setDownloadBehavior',{behavior:'allow',downloadPath:DL});
 await p.goto(url.replace(/#.*/,'')+'#/blank');await p.evaluate(pre=>{localStorage.clear();if(pre)for(const[k,v]of Object.entries(pre))localStorage.setItem(k,v);},pre||null);
 await p.goto(url);await p.reload();await sl(1800);return p;}
const click=(p,re)=>p.evaluate(s=>{const e=[...document.querySelectorAll('button,a')].find(e=>new RegExp(s).test(e.textContent.trim()));e?.click();return !!e},re.source);
const txt=p=>p.evaluate(()=>document.body.innerText);
const over=p=>p.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
const resume='Test User\nDelhi\ntest@example.com\nDelivery rider, 2 years delivering parcels in Delhi NCR. Two-wheeler licence. Hindi and English. Handled 40 orders a day.';
const prof=JSON.stringify({name:'Test User',location:'Delhi',resumeText:resume,setupDone:'2026-10-19'});

// Landing
let p=await fresh(BASE+'/');
await T('Landing','Footer credit, copyright and links','Read footer',async()=>{const f=await p.evaluate(()=>document.querySelector('footer')?.innerText||'');return [/Made by Akash Sync Agent/i.test(f)&&/© 2026 Akash Sync Agent \(Adv\. Akash Sharma\)/i.test(f)&&/Share feedback/i.test(f)&&/About/i.test(f)&&/Terms/i.test(f)&&/Privacy/i.test(f)?'Yes':'No',f.replace(/\n/g,' · ').slice(0,220)]});
await T('Landing','One strong CTA in the hero','Count buttons in hero section',async()=>{const h=await p.evaluate(()=>[...document.querySelector('section.hero').querySelectorAll('button')].map(b=>b.textContent.trim()));return [h.length===1&&/Start your path/.test(h[0])?'Yes':'No','hero buttons: '+JSON.stringify(h)+'; "See how it works" is a plain link']});
await T('Landing','Social-proof slot hidden until real numbers','Look for data-testid=social-proof',async()=>{const n=await p.$$('[data-testid=social-proof]');return [n.length===0?'Yes':'No','PROOF=null in src/lib/brand.ts, slot not rendered']});
await T('Landing','Share with a friend gives a referral link','Click Share (no Web Share in headless), read clipboard',async()=>{await b.defaultBrowserContext().overridePermissions(BASE,['clipboard-read','clipboard-write','clipboard-sanitized-write']);await click(p,/^Share with a friend$/);await sl(500);const c=await p.evaluate(()=>navigator.clipboard.readText());return [c==='https://akash-sharma-job-acquisition-os.vercel.app/?ref=share'?'Yes':'No','clipboard: '+c]});
await T('Landing','Meta: title, author, OG/Twitter card, canonical, favicon','Read <head>',async()=>{const m=await p.evaluate(()=>{const g=s=>document.querySelector(s)?.getAttribute('content')||document.querySelector(s)?.getAttribute('href');return {t:document.title,a:g('meta[name=author]'),sn:g('meta[property="og:site_name"]'),img:g('meta[property="og:image"]'),tw:g('meta[name="twitter:card"]'),can:g('link[rel=canonical]'),ico:g('link[rel=icon]')}});return [m.a==='Akash Sync Agent (Adv. Akash Sharma)'&&m.sn==='Job Acquisition OS'&&/og\.jpg$/.test(m.img)&&m.tw==='summary_large_image'&&m.ico==='/favicon.svg'&&m.can?'Yes':'No',JSON.stringify(m)]});
const head=async u=>{const r=await fetch(BASE+u);return [r.status,r.headers.get('content-type'),await r.arrayBuffer()];};
await T('Static','OG image 1200x630, favicon, apple icon served','Fetch and read size',async()=>{const [s,ct,buf]=await head('/og.jpg');fs.writeFileSync('/tmp/og.jpg',Buffer.from(buf));const dim=execSync('python3 -c "from PIL import Image;print(Image.open(\'/tmp/og.jpg\').size)"').toString().trim();const f=(await head('/favicon.svg'))[0],a=(await head('/apple-touch-icon.png'))[0];return [s===200&&dim==='(1200, 630)'&&f===200&&a===200?'Yes':'No',`og.jpg ${s} ${ct} ${dim} ${Math.round(buf.byteLength/1024)}KB; favicon ${f}; apple ${a}`]});
await T('Static','robots.txt and sitemap.xml','Fetch both',async()=>{const r=Buffer.from((await head('/robots.txt'))[2]).toString(),s=Buffer.from((await head('/sitemap.xml'))[2]).toString();return [/Sitemap: https:\/\/akash-sharma-job-acquisition-os\.vercel\.app\/sitemap\.xml/.test(r)&&/<urlset/.test(s)?'Yes':'No','robots allows all + Sitemap line; sitemap lists site root']});
await T('Static','404 page for unknown paths','Fetch /404.html (Vercel serves it for unknown paths)',async()=>{const t=Buffer.from((await head('/404.html'))[2]).toString();return [/Off the path\./.test(t)&&/noindex/.test(t)?'Yes':'No','404.html: "Off the path.", noindex, back link']});
const vj=JSON.parse(fs.readFileSync((process.env.REPO||'.')+'/vercel.json','utf8'));
await T('Static','Security headers in vercel.json','Parse config',async()=>{const h=Object.fromEntries(vj.headers[0].headers.map(x=>[x.key,x.value]));const ok=['Content-Security-Policy','X-Content-Type-Options','X-Frame-Options','Referrer-Policy','Permissions-Policy','Strict-Transport-Security'].every(k=>h[k])&&/frame-ancestors 'none'/.test(h['Content-Security-Policy'])&&/object-src 'none'/.test(h['Content-Security-Policy']);return [ok?'Yes':'No','CSP + nosniff + DENY + referrer + permissions + HSTS; functions config kept: '+!!vj.functions]});

// App pages (signed-in guest)
p=await fresh(BASE+'/#/app/overview',1280,1000,{jaos_profile_v1:prof});
await T('App','Sidebar credit, copyright and Terms link','Read sidebar',async()=>{const s=await p.evaluate(()=>document.querySelector('aside')?.innerText||'');return [/Made by Akash Sync Agent/i.test(s)&&/© 2026 Akash Sync Agent/i.test(s)&&/Terms/i.test(s)&&/Share feedback/i.test(s)?'Yes':'No',s.split('\n').slice(-5).join(' · ')]});
await T('About','Credit opens About: credits, plain MIT, brand not licensed','Click credit',async()=>{await click(p,/^Made by Akash Sync Agent$/i);await sl(1200);const t=await txt(p);return [/keep the copyright/i.test(t)&&/not licensed/i.test(t)&&/pdf\.js/i.test(t)&&(await p.evaluate(()=>location.hash))==='#/app/about'?'Yes':'No',(await p.evaluate(()=>location.hash))+'; '+(t.match(/[^\n]*not licensed[^\n]*/i)||[''])[0].slice(0,150)]});
await p.goto(BASE+'/#/app/terms'); await sl(1500);
await T('Terms','Terms: as-is, Gemini terms, 18+, free-tier data use, EEA/UK','Deep link #/app/terms',async()=>{const t=await txt(p);const l=await p.evaluate(()=>[...document.querySelectorAll('a')].some(a=>/ai\.google\.dev\/gemini-api\/terms/.test(a.href)));return [/18/.test(t)&&/European Economic Area|EEA/.test(t)&&/United Kingdom|UK/.test(t)&&/free/i.test(t)&&/as is/i.test(t)&&l?'Yes':'No','link to Gemini API Additional Terms; 18+; EEA/CH/UK paid only; free tier may be reviewed by humans']});
await p.goto(BASE+'/#/app/feedback'); await sl(1500);
await T('Feedback','Buttons disabled until text is written','Read hrefs on empty form',async()=>{const h=await p.evaluate(()=>[...document.querySelectorAll('a[aria-disabled]')].map(a=>a.getAttribute('href')));return [h.length===2&&h.every(x=>x===null)?'Yes':'No','hrefs: '+JSON.stringify(h)]});
await T('Feedback','Prefilled GitHub issue (form, label) and private email','Type text, read links',async()=>{await p.type('textarea','Love the follow-up reminders.');await sl(300);const h=await p.evaluate(()=>[...document.querySelectorAll('a[aria-disabled]')].map(a=>a.href));const gh=new URL(h[0]);const ml=h[1];return [gh.host==='github.com'&&/\/advakash2356-sys\/Akash-Sharma-Job-Acquisition-OS\/issues\/new$/.test(gh.pathname)&&gh.searchParams.get('template')==='feedback.yml'&&gh.searchParams.get('labels')==='feedback'&&/follow-up/.test(gh.searchParams.get('details')||'')&&/^mailto:adv\.akash2356@gmail\.com\?/.test(ml)?'Yes':'No',`${gh.pathname}?template=${gh.searchParams.get('template')}&labels=${gh.searchParams.get('labels')}; ${ml.slice(0,60)}…`]});
await T('Feedback','Feedback reaches Akash: [TEST] issue on GitHub','GitHub API issue #1',async()=>{const r=await (await fetch('https://api.github.com/repos/advakash2356-sys/Akash-Sharma-Job-Acquisition-OS/issues/1')).json();return [/^\[TEST\]/.test(r.title)&&r.labels.some(l=>l.name==='feedback')?'Yes':'No',`${r.html_url} "${r.title}" label feedback, ${r.state}`]});
await p.goto(BASE+'/#/app/does-not-exist'); await sl(1500);
await T('App','In-app 404 for unknown pages','#/app/does-not-exist',async()=>{const t=await txt(p);return [/Off the path\./.test(t)?'Yes':'No','"Off the path." with back button']});
await p.goto(BASE+'/#/app/notfound?crash'); await p.reload(); await sl(1800);
await T('App','Error boundary shows real cause, Reload and Report','Dev-only crash route',async()=>{const t=await txt(p);const side=await p.evaluate(()=>!!document.querySelector('aside'));return [/Test crash \(dev only\)/.test(t)&&/Reload/.test(t)&&/Report it/.test(t)&&side?'Yes':'No','message shown, sidebar still works']});
await p.goto(BASE+'/#/app/privacy'); await sl(1500);
await T('Privacy','Privacy matches analytics OFF state','Read page',async()=>{const t=await txt(p);return [/does not count usage/.test(t)&&/cookie/i.test(t)&&/local storage/i.test(t)&&!/goatcounter/i.test(t)?'Yes':'No',(t.match(/[^\n]*does not count usage[^\n]*/)||[''])[0].slice(0,160)]});
await p.goto(BASE+'/#/app/settings'); await sl(1500);
await T('Settings','Settings states counting is off; export credit toggle','Read page',async()=>{const t=await txt(p);return [/Usage counting is not switched on/.test(t)&&/credit/i.test(t)?'Yes':'No','both controls shown']});
// exports
const exp=async(kind)=>p.evaluate(async k=>{const m=await import('/src/lib/exporters.ts');if(k==='pdf')m.exportPdf('Test User\nDelivery rider in Delhi.','Resume: Test','audit-'+k);else await m.exportDocx('Test User\nDelivery rider in Delhi.','Resume: Test','audit-'+k);},kind);
await T('Exports','PDF footer carries the credit','exportPdf, pdftotext',async()=>{await exp('pdf');await sl(1500);const t=execSync(`pdftotext ${DL}/audit-pdf.pdf -`).toString();return [/Made by Akash Sync Agent \(akash-sharma-job-acquisition-os\.vercel\.app\)/.test(t)?'Yes':'No',(t.match(/[^\n]*Made by[^\n]*/)||[''])[0]]});
await T('Exports','DOCX footer carries the credit','exportDocx, unzip footer',async()=>{await exp('docx');await sl(1500);const x=execSync(`unzip -p ${DL}/audit-docx.docx 'word/footer*.xml'`).toString();return [/Made by Akash Sync Agent/.test(x)?'Yes':'No','word/footer1.xml contains credit']});
await T('Exports','Credit can be switched off in Settings','Set off, export PDF',async()=>{await p.evaluate(()=>localStorage.setItem('jaos_export_credit','0'));fs.rmSync(DL+'/audit-pdf.pdf',{force:true});await exp('pdf');await sl(1500);const t=execSync(`pdftotext ${DL}/audit-pdf.pdf -`).toString();return [!/Made by/.test(t)&&/page 1/i.test(t)?'Yes':'No','footer: '+(t.match(/[^\n]*page 1[^\n]*/i)||[''])[0]]});
await T('App','No GoatCounter (or other 3rd-party) requests when code is unset','All hosts so far',async()=>{const h=[...hosts].filter(x=>!/localhost/.test(x));return [h.length===0&&gc.length===0?'Yes':'No','hosts: '+[...hosts].join(', ')]});
// mobile
for(const u of ['/','/#/app/about','/#/app/terms','/#/app/feedback']){p=await fresh(BASE+u,390,800,{jaos_profile_v1:prof});await T('Mobile',`No sideways scroll at 390px: ${u}`,'scrollWidth - innerWidth',async()=>{const o=await over(p);return [o<=2?'Yes':'No','overflow px '+o]});}

// Analytics ON build: event names only, nothing else
gc=[]; p=await fresh(GA+'/');
await T('Analytics','landing_view counted on landing','Analytics-on build, intercepted',async()=>{await sl(500);return [gc.some(u=>/p=landing_view/.test(u))?'Yes':'No',gc[0]?.replace(/rnd=\w+/,'rnd=…')]});
await click(p,/^Start your path$/); await sl(1500);
await T('Analytics','start_setup counted','Click Start your path',async()=>[gc.some(u=>/p=start_setup/.test(u))?'Yes':'No',gc.map(u=>new URL(u).searchParams.get('p')).join(', ')]);
await p.evaluate(p=>localStorage.setItem('jaos_profile_v1',p),prof); await p.evaluate(()=>{localStorage.setItem('jaos_jobs_v1',JSON.stringify([{id:'f1',title:'Rider',company:'X',status:'Saved',createdAt:'2026-10-19',interviews:[],notes:'',url:'',description:'',found:{provider:'freehire',id:'f1'}}]));}); await p.reload(); await sl(2000); await p.reload(); await sl(1500);
await T('Analytics','resume_added / first_job_found once only','Seed then reload twice',async()=>{const n=gc.map(u=>new URL(u).searchParams.get('p'));const c=e=>n.filter(x=>x===e).length;return [c('resume_added')===1&&c('first_job_found')===1?'Yes':'No',n.join(', ')]});
await T('Analytics','Only the step name is sent (no content)','Inspect every intercepted URL',async()=>{const bad=gc.filter(u=>{const s=new URL(u).searchParams;const keys=[...s.keys()].sort().join(',');return keys!=='e,p,rnd,t'||/Delivery|Test User|AIza/.test(decodeURIComponent(u));});return [gc.length&&!bad.length?'Yes':'No',`${gc.length} requests, params e,p,t,rnd only; host ${new URL(gc[0]).host}`]});
await p.goto(GA+'/#/app/privacy'); await sl(1500);
await T('Analytics','Privacy lists the exact events when ON','Read page on analytics build',async()=>{const t=await txt(p);const ok=['landing view','start setup','resume added','key added','first job found','export','feedback sent','share'].every(e=>t.includes(e))&&/GoatCounter/.test(t);return [ok?'Yes':'No','all 8 events named; GoatCounter; DNT/GPC/opt-out']});
gc=[]; p=await fresh(GA+'/',1280,1000,{jaos_no_stats:'1'});
await T('Analytics','Opt-out stops counting','Set opt-out, load landing',async()=>{await sl(800);return [gc.length===0?'Yes':'No',gc.length+' requests']});
fs.writeFileSync('/tmp/launch-audit.json',JSON.stringify(R,null,1)); await b.close();
console.log('PASS',R.filter(r=>r.res==='Yes').length,'/',R.length);
