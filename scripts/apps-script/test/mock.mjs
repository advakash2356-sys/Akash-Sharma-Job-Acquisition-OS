// Minimal in-memory Apps Script mock to exercise Code.gs logic.
import fs from 'fs'; import vm from 'vm'; import { execFileSync } from 'child_process';
export function load(props = {}) {
  const sheets = {}; const mails = []; const triggers = [];
  const mk = (name) => { const d = []; const sh = { name, d, getName: () => name, setName(n){ delete sheets[name]; name=n; sheets[n]=sh; }, appendRow: (r) => d.push([...r]), deleteRow: (r) => d.splice(r - 1, 1), getLastRow: () => d.length, setFrozenRows(){},
    getRange(r, c, nr = 1, nc = 1) { const self = this; if (typeof r === 'string') return { setDataValidation(){} };
      return { getValues: () => d.slice(r-1, r-1+nr).map(x => { const y=[...x]; while(y.length<c-1+nc) y.push(''); return y.slice(c-1, c-1+nc); }), getDisplayValues(){ return this.getValues().map(x=>x.map(String)); },
        setValues: (v) => v.forEach((row, k) => row.forEach((val, j) => { d[r-1+k][c-1+j] = val; })), setValue: (v) => { d[r-1][c-1] = v; }, getValue: () => (d[r-1] || [])[c-1] ?? '' }; } };
    sheets[name] = sh; return sh; };
  mk('Sheet1');
  const P = { ...props };
  const ctx = {
    SpreadsheetApp: { getActiveSpreadsheet: () => ({ getSheetByName: (n) => sheets[n] || null, insertSheet: (n) => mk(n), getSheets: () => Object.values(sheets), getUrl: () => 'https://sheet' }),
      newDataValidation: () => ({ requireValueInList(){ return this; }, build(){} }) },
    PropertiesService: { getScriptProperties: () => ({ getProperty: (k) => P[k] ?? null, setProperty: (k, v) => { P[k] = v; }, deleteProperty: (k) => { delete P[k]; } }) },
    Utilities: { formatDate: (d) => d.toISOString().slice(0,16).replace('T',' '), getUuid: () => Math.random().toString(16).slice(2) + 'abcdef0123456789' },
    ContentService: { createTextOutput: (s) => ({ s, setMimeType(){ return JSON.parse(s); } }), MimeType: { JSON: 1 } },
    LockService: { getScriptLock: () => ({ tryLock(){ return true; }, waitLock(){}, releaseLock(){} }) },
    MailApp: { sendEmail: (m) => mails.push(m) },
    UrlFetchApp: { fetch: (url, o) => { try { const out = execFileSync('curl', ['-s', '-m', '40', '-X', 'POST', '-H', 'Content-Type: application/json', '--data-binary', '@-', url], { input: o.payload }).toString(); return { getResponseCode: () => 200, getContentText: () => out }; } catch { return { getResponseCode: () => 500, getContentText: () => '' }; } } },
    ScriptApp: { getProjectTriggers: () => triggers, deleteTrigger: (t) => triggers.splice(triggers.indexOf(t), 1), newTrigger: (fn) => ({ timeBased(){ return this; }, everyMinutes(m){ this.m=m; return this; }, create(){ triggers.push({ fn, getHandlerFunction: () => fn }); } }) },
    Logger: { log(){} }, console,
  };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(new URL('../Code.gs', import.meta.url), 'utf8'), ctx);
  const post = (b) => ctx.doPost({ postData: { contents: JSON.stringify({ secret: P.SHARED_SECRET, ...b }) } });
  return { ctx, sheets, mails, triggers, P, post };
}
