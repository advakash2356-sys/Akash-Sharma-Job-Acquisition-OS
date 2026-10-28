// Runs only when you click "Fill this page". Fills empty fields, highlights them, never submits. Akash Sync Agent.
(function () {
  var p = window.__JAOS_PROFILE__ || {}; var M = window.JAOS_MAP; var filled = 0, skipped = 0;
  function labelFor(el) {
    var t = '';
    if (el.id) { var l = document.querySelector('label[for="' + CSS.escape(el.id) + '"]'); if (l) t = l.textContent; }
    if (!t) { var c = el.closest('label'); if (c) t = c.textContent; }
    if (!t && el.getAttribute('aria-labelledby')) t = el.getAttribute('aria-labelledby').split(' ').map(function (id) { var n = document.getElementById(id); return n ? n.textContent : ''; }).join(' ');
    if (!t) { var w = el.closest('[data-automation-id], .field, .form-group, .application-question, li, div'); if (w) { var lab = w.querySelector('label, legend, .label, [class*="label"]'); if (lab) t = lab.textContent; } }
    return (t || '').trim().slice(0, 120);
  }
  function setValue(el, v) {
    var proto = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    var setter = Object.getOwnPropertyDescriptor(proto, 'value').set; setter.call(el, v);
    el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); el.dispatchEvent(new Event('blur', { bubbles: true }));
  }
  var els = document.querySelectorAll('input:not([type]), input[type=text], input[type=email], input[type=tel], input[type=url], input[type=number], textarea');
  els.forEach(function (el) {
    if (el.disabled || el.readOnly || el.offsetParent === null || el.value) return;
    var key = M.match(M.describe(el, labelFor(el)));
    var v = key && p[key]; if (!v) { skipped++; return; }
    setValue(el, String(v)); el.style.outline = '2px solid #e0a526'; el.title = 'Filled by JAOS Autofill: please check'; filled++;
  });
  return { filled: filled, skipped: skipped };
})();
