// Field matcher for job portals. Akash Sync Agent. MIT.
// Site-adapter approach (per-portal label selectors, select/option matching) adapted from Br1an67/OpenJobAutofill (MIT); rewritten, no code copied.
(function (g) {
  var RULES = [
    ['email', /e-?mail/],
    ['linkedin', /linked ?in/],
    ['github', /git ?hub/],
    ['website', /website|portfolio|personal (site|url)|blog/],
    ['firstName', /first ?name|given ?name|fname|legalnamesection firstname|forename/],
    ['lastName', /last ?name|family ?name|surname|lname|legalnamesection lastname/],
    ['phone', /phone|mobile|contact ?number|cell/],
    ['location', /\bcity\b|location|current address|addresssection city|current location/],
    ['expectedCtc', /expected (ctc|salary|compensation)|desired (salary|pay)|salary expectation/],
    ['currentCtc', /current (ctc|salary|compensation)/],
    ['noticePeriod', /notice period/],
    ['experienceYears', /(total )?(years of )?experience( in years)?$|total experience/],
    ['headline', /headline|current (title|designation|role)|job title/],
    ['skills', /key ?skills|\bskills\b/],
    ['summary', /summary|about (you|yourself)|profile summary/],
    ['fullName', /full ?name|^name$|your name|candidate name|\bname\b/]
  ];
  var SKIP = /password|otp|captcha|ssn|social security|aadhaar|\bpan\b|passport|date of birth|\bdob\b|gender|race|ethnic|veteran|disability|sexual|religion|consent|agree|terms|signature|search|referr?al code|coupon/;
  // Per-portal places where the visible question text lives.
  var ADAPTERS = [
    { name: 'Workday', host: /myworkdayjobs\.com|workday\.com/, label: '[data-automation-id="formField"] label, [data-automation-id*="formLabel"]', field: '[data-automation-id="formField"]' },
    { name: 'Greenhouse', host: /greenhouse\.io/, label: 'label', field: '.field, .application-question' },
    { name: 'Lever', host: /lever\.co/, label: '.application-label', field: '.application-question, .application-field' },
    { name: 'iCIMS', host: /icims\.com/, label: 'label, .iCIMS_InfoMsg', field: '.iCIMS_FieldRow, .form-group' },
    { name: 'Taleo', host: /taleo\.net/, label: 'label, .fieldLabel', field: '.field, .editablefield' },
    { name: 'SuccessFactors', host: /successfactors\.(com|eu)|sapsf/, label: 'label, .sfLabel', field: '.sfFormRow, .formRow' },
    { name: 'Naukri', host: /naukri\.com/, label: 'label, .label, .lbl', field: '.formRow, .input-wrap, .chatbot_InputContainer' }
  ];
  function adapterFor(host) { for (var i = 0; i < ADAPTERS.length; i++) if (ADAPTERS[i].host.test(host || '')) return ADAPTERS[i]; return null; }
  function describe(el, labelText) {
    return [labelText, el.getAttribute('aria-label'), el.getAttribute('name'), el.id, el.getAttribute('placeholder'), el.getAttribute('autocomplete'), el.getAttribute('data-automation-id')].filter(Boolean).join(' ').replace(/[_-]+/g, ' ').toLowerCase();
  }
  function match(desc) {
    if (!desc || SKIP.test(desc)) return null;
    for (var i = 0; i < RULES.length; i++) if (RULES[i][1].test(desc)) return RULES[i][0];
    return null;
  }
  /** Best option for a <select>: exact text, then starts-with, then contains. Returns index or -1. */
  function pickOption(options, value) {
    var v = String(value || '').trim().toLowerCase(); if (!v) return -1;
    var texts = options.map(function (o) { return String(o).trim().toLowerCase(); });
    var i = texts.indexOf(v); if (i >= 0) return i;
    for (i = 0; i < texts.length; i++) if (texts[i] && (texts[i].indexOf(v) === 0 || v.indexOf(texts[i]) === 0)) return i;
    for (i = 0; i < texts.length; i++) if (texts[i].length > 2 && texts[i].indexOf(v) >= 0) return i;
    return -1;
  }
  g.JAOS_MAP = { match: match, describe: describe, pickOption: pickOption, adapterFor: adapterFor, ADAPTERS: ADAPTERS, RULES: RULES, SKIP: SKIP };
})(typeof globalThis !== 'undefined' ? globalThis : this);
