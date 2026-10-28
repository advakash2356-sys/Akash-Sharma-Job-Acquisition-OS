// Field matcher for job portals (Workday, Greenhouse, Lever, iCIMS, Taleo, SuccessFactors, Naukri). Akash Sync Agent. MIT.
// Order matters: the first rule that matches the field's description wins.
(function (g) {
  var RULES = [
    ['email', /e-?mail/],
    ['linkedin', /linked ?in/],
    ['github', /git ?hub/],
    ['website', /website|portfolio|personal (site|url)|blog/],
    ['firstName', /first ?name|given ?name|fname|legalnamesection_firstname|forename/],
    ['lastName', /last ?name|family ?name|surname|lname|legalnamesection_lastname/],
    ['phone', /phone|mobile|contact ?number|cell/],
    ['location', /\bcity\b|location|current address|addresssection_city|current location/],
    ['expectedCtc', /expected (ctc|salary|compensation)|desired (salary|pay)|salary expectation/],
    ['headline', /headline|current (title|designation|role)|job title/],
    ['skills', /key ?skills|\bskills\b/],
    ['summary', /summary|about (you|yourself)|profile summary/],
    ['fullName', /full ?name|^name$|your name|candidate name|\bname\b/]
  ];
  // Never touch these: passwords, IDs, consent boxes, EEO/diversity answers, files, captcha, search.
  var SKIP = /password|otp|captcha|ssn|social security|aadhaar|pan\b|passport|date of birth|dob|gender|race|ethnic|veteran|disability|sexual|religion|consent|agree|terms|signature|search|referr?al code|coupon/;
  function describe(el, labelText) {
    return [labelText, el.getAttribute('aria-label'), el.getAttribute('name'), el.id, el.getAttribute('placeholder'), el.getAttribute('autocomplete'), el.getAttribute('data-automation-id')].filter(Boolean).join(' ').replace(/[_-]+/g, ' ').toLowerCase();
  }
  function match(desc) {
    if (!desc || SKIP.test(desc)) return null;
    for (var i = 0; i < RULES.length; i++) if (RULES[i][1].test(desc)) return RULES[i][0];
    return null;
  }
  g.JAOS_MAP = { match: match, describe: describe, RULES: RULES, SKIP: SKIP };
})(typeof globalThis !== 'undefined' ? globalThis : this);
