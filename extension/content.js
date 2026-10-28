// Runs only when you click "Fill this page". Fills empty fields, highlights them, never submits. Akash Sync Agent.
(function () {
  var p = window.__JAOS_PROFILE__ || {}; var M = window.JAOS_MAP; var A = M.adapterFor(location.hostname); var filled = 0, skipped = 0;
  function labelFor(el) {
    var t = '';
    if (el.id) { var l = document.querySelector('label[for="' + CSS.escape(el.id) + '"]'); if (l) t = l.textContent; }
    if (!t) { var c = el.closest('label'); if (c) t = c.textContent; }
    if (!t && el.getAttribute('aria-labelledby')) t = el.getAttribute('aria-labelledby').split(' ').map(function (id) { var n = document.getElementById(id); return n ? n.textContent : ''; }).join(' ');
    if (!t && A) { var f = el.closest(A.field); if (f) { var lab = f.querySelector(A.label); if (lab) t = lab.textContent; } }
    if (!t) { var w = el.closest('.field, .form-group, .application-question, li, div'); if (w) { var lb = w.querySelector('label, legend, .label, [class*="label"]'); if (lb) t = lb.textContent; } }
    return (t || '').trim().slice(0, 120);
  }
  function fire(el) { ['input', 'change', 'blur'].forEach(function (e) { el.dispatchEvent(new Event(e, { bubbles: true })); }); }
  function setValue(el, v) {
    var proto = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, v); fire(el);
  }
  function mark(el) { el.style.outline = '2px solid #e0a526'; el.title = 'Filled by JAOS Autofill: please check'; filled++; }
  document.querySelectorAll('input:not([type]), input[type=text], input[type=email], input[type=tel], input[type=url], input[type=number], textarea').forEach(function (el) {
    if (el.disabled || el.readOnly || el.offsetParent === null || el.value) return;
    var key = M.match(M.describe(el, labelFor(el))); var v = key && p[key];
    if (!v) { skipped++; return; } setValue(el, String(v)); mark(el);
  });
  document.querySelectorAll('select').forEach(function (el) {
    if (el.disabled || el.offsetParent === null || (el.selectedIndex > 0 && el.value)) return;
    var key = M.match(M.describe(el, labelFor(el))); var v = key && p[key]; if (!v) return;
    var i = M.pickOption(Array.prototype.map.call(el.options, function (o) { return o.text; }), v);
    if (i > 0) { el.selectedIndex = i; fire(el); mark(el); }
  });
  return { filled: filled, skipped: skipped, site: A ? A.name : 'Other site' };
})();
