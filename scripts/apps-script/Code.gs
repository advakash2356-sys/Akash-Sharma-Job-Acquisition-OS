/**
 * Job Acquisition OS: feedback + comments backend (Google Apps Script, bound to the Sheet).
 * Pattern adapted from jamiewilson/form-to-google-sheets (Apache-2.0, https://github.com/jamiewilson/form-to-google-sheets):
 * doPost + LockService + appendRow + MailApp notification. Modified by Akash Sync Agent, 2026 (JSON body, shared secret,
 * two tabs, moderation, team replies). See THIRD_PARTY_NOTICES.md.
 *
 * Only the website's server calls this (it sends SHARED_SECRET). Visitors never see the secret or the Sheet.
 * Tabs: "Feedback" (first tab) and "Comments" (created by setup()).
 * Comments are public ONLY when column "Approved" is "yes". Team replies go in "Team reply" and show on the site
 * as "Akash Sync Agent team".
 */
const NOTIFY = 'adv.akash2356@gmail.com';
const FEEDBACK_HEAD = ['Timestamp (IST)', 'Name', 'Email', 'Rating (1-5)', 'Message', 'Page', 'User agent', 'Status'];
const COMMENT_HEAD = ['Timestamp (IST)', 'Comment ID', 'Name', 'Email (private)', 'Message', 'Page', 'Approved (yes/no)', 'Team reply', 'Reply date'];

function secret_() { return PropertiesService.getScriptProperties().getProperty('SHARED_SECRET') || ''; }
function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function now_() { return Utilities.formatDate(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd HH:mm'); }
function clean_(s, n) { s = String(s == null ? '' : s).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, n); return /^[=+\-@]/.test(s) ? "'" + s : s; } // blocks formula injection
function tab_(name, head) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(name);
  if (!sh) { sh = ss.insertSheet(name); sh.appendRow(head); sh.setFrozenRows(1); }
  return sh;
}

/** Run once from the editor: names the first tab, creates Comments, and sets a random secret (shown in the log). */
function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const first = ss.getSheets()[0];
  if (first.getName() !== 'Feedback') first.setName('Feedback');
  if (first.getLastRow() === 0) first.appendRow(FEEDBACK_HEAD);
  first.setFrozenRows(1);
  const c = tab_('Comments', COMMENT_HEAD);
  c.getRange('G2:G').setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(['yes', 'no'], true).build());
  if (!secret_()) PropertiesService.getScriptProperties().setProperty('SHARED_SECRET', Utilities.getUuid() + Utilities.getUuid());
  Logger.log('SHARED_SECRET (put this in Vercel as FEEDBACK_SECRET): ' + secret_());
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);
  try {
    const b = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (!secret_() || b.secret !== secret_()) return json_({ ok: false, error: 'forbidden' });
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const url = ss.getUrl();
    if (b.type === 'feedback') {
      const sh = ss.getSheetByName('Feedback') || ss.getSheets()[0];
      const row = [now_(), clean_(b.name, 80), clean_(b.email, 120), Number(b.rating) || '', clean_(b.message, 3000), clean_(b.page, 120), clean_(b.ua, 200), 'new'];
      sh.appendRow(row);
      const mail = { to: NOTIFY, name: 'Job Acquisition OS', subject: 'New feedback (' + (row[3] || '-') + '/5) on Job Acquisition OS',
        body: 'Rating: ' + (row[3] || '-') + '/5\nPage: ' + row[5] + '\nName: ' + (row[1] || '-') + '\nEmail: ' + (row[2] || '-') + '\n\n' + row[4] + '\n\nSheet: ' + url };
      if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(row[2])) mail.replyTo = row[2];
      MailApp.sendEmail(mail);
      return json_({ ok: true });
    }
    if (b.type === 'comment') {
      const sh = tab_('Comments', COMMENT_HEAD);
      const id = Utilities.getUuid().slice(0, 8);
      const row = [now_(), id, clean_(b.name, 60) || 'Anonymous', clean_(b.email, 120), clean_(b.message, 1500), clean_(b.page, 120), 'no', '', ''];
      sh.appendRow(row);
      MailApp.sendEmail({ to: NOTIFY, name: 'Job Acquisition OS', subject: 'New comment waiting for approval on Job Acquisition OS',
        body: 'From: ' + row[2] + (row[3] ? ' <' + row[3] + '>' : '') + '\nPage: ' + row[5] + '\n\n' + row[4] + '\n\nTo publish it, open the Comments tab and set "Approved" to yes. To reply as "Akash Sync Agent team", type in "Team reply".\n' + url });
      return json_({ ok: true, id: id });
    }
    return json_({ ok: false, error: 'unknown type' });
  } catch (err) {
    return json_({ ok: false, error: String(err).slice(0, 200) });
  } finally { lock.releaseLock(); }
}

/** APPROVED comments only, newest first. No emails. Needs the secret (only the website's server has it). */
function doGet(e) {
  const p = (e && e.parameter) || {};
  if (!secret_() || p.secret !== secret_()) return json_({ ok: false, error: 'forbidden' });
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Comments');
  if (!sh || sh.getLastRow() < 2) return json_({ ok: true, comments: [] });
  const rows = sh.getRange(2, 1, sh.getLastRow() - 1, COMMENT_HEAD.length).getDisplayValues();
  const out = rows.filter(function (r) { return String(r[6]).toLowerCase() === 'yes'; }).map(function (r) {
    return { id: r[1], at: r[0], name: r[2], message: r[4], page: r[5], reply: r[7] || '', replyAt: r[8] || '' };
  }).reverse().slice(0, 200);
  return json_({ ok: true, comments: out });
}

/** Simple trigger: stamps the reply date when a reply is typed in the Comments tab. */
function onEdit(e) {
  const sh = e.range.getSheet();
  if (sh.getName() === 'Comments' && e.range.getColumn() === 8 && e.range.getRow() > 1) sh.getRange(e.range.getRow(), 9).setValue(e.value ? now_() : '');
}
