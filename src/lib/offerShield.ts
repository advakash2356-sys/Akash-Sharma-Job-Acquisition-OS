/** Offer Shield: finds clauses worth a second look in an offer letter. Rules only, in the browser. Information, not legal advice. Akash Sync Agent. */
export type Risk = 'red' | 'amber' | 'info';
export interface Clause { kind: string; risk: Risk; sentence: string; why: string; detail?: string }
const DUR = /(\d{1,3}|one|two|three|four|six|twelve|eighteen|twenty[- ]four)\s*(?:\(\d+\)\s*)?(days?|weeks?|months?|years?)/i;
const AMT = /(?:₹|rs\.?|inr)\s?\d[\d,]*(?:\.\d+)?(?:\s*(?:lakhs?|lacs?|crores?|l|cr))?|\d[\d,]*\s*(?:lakhs?|lacs?)/i;
const W: Record<string, number> = { one: 1, two: 2, three: 3, four: 4, six: 6, twelve: 12, eighteen: 18, 'twenty four': 24, 'twenty-four': 24 };
export function toDays(m: RegExpMatchArray | null): number | null {
  if (!m) return null; const n = W[m[1].toLowerCase()] ?? Number(m[1]); const u = m[2].toLowerCase();
  return u.startsWith('day') ? n : u.startsWith('week') ? n * 7 : u.startsWith('month') ? n * 30 : n * 365;
}

const PAY_W = /\b(salary|pay|paid|remuneration|compensation|wages?|stipend|fixed pay)\b/i;
const NO_PAY = /\b(no\s+(?:salary|pay|remuneration)|not\s+(?:be\s+)?(?:paid|entitled)|unpaid|without\s+(?:salary|pay)|salary\s+(?:is\s+|will\s+be\s+)?(?:withheld|stopped|paused|not\s+paid)|will\s+not\s+pay\s+salary|not\s+pay\s+salary|salary\s+nahi|pay\s+nahi|tanka\s+nahi|nahi\s+mileg[ia])\b|वेतन\s*नहीं/i;
const BENCH_W = /\bbench\b|बेंच/i;
const ONLY_WHEN = /\b(only\s+(?:after|when|once|upon|if|for)|payable\s+only|paid\s+only|draw(?:s|n)?\s+(?:salary\s+|remuneration\s+)?only|starts?\s+only|begins?\s+only|commences?\s+only|solely\s+(?:after|upon|for)|contingent\s+upon|subject\s+to\s+being|unless\s+(?:allocated|assigned|deployed|staffed))\b/i;
const ALLOC_W = /\b(billable|deploy(?:ed|ment)|allocat(?:ed|ion)|staffed|client\s+project|client\s+assignment)\b/i;
function unpaidDenied(s: string) { return /\bunpaid\s+(?:leave|time)\b/i.test(s) || /\b(?:does\s+not|do\s+not|not|never|neither)\b[\s\S]{0,48}\bunpaid\b/i.test(s); }
const HI_PAY_PAUSED = /पारिश्रमिक.{0,16}रुक/;
const HI_PAY_STARTS = /वेतन.{0,80}तभी\s*शुरू.{0,160}(?:बिल\s*योग्य|तैनात|बेंच)/;
function benchPayHit(s: string) {
  if (unpaidDenied(s)) return false;
  return (NO_PAY.test(s) && BENCH_W.test(s)) || (PAY_W.test(s) && ONLY_WHEN.test(s) && ALLOC_W.test(s)) || (BENCH_W.test(s) && (HI_PAY_PAUSED.test(s) || HI_PAY_STARTS.test(s)));
}
/** Sentence split only. Do not break on ', and', and do not split on dotted abbreviations (B.E., LL.B., Ph.D., Sr. No., e.g., i.e., etc.). */
export function offerClauses(t: string): string[] {
  const raw = (t || '').replace(/\r/g, ' ').replace(/\s+/g, ' ').trim();
  const shield = (m: string) => m.replace(/\./g, '\0');
  const protectedText = raw
    .replace(/\bSr\.\s*No\./gi, shield)
    .replace(/\b(?:e\.g|i\.e|etc|a\.m|p\.m)\./gi, shield)
    .replace(/\b(?:[A-Za-z]{1,4}\.){2,}[A-Za-z]{0,5}\.?/g, shield)
    .replace(/\b((?:[A-Z](?:\.[A-Za-z]+)+)|(?:a|p)\.m)\./gi, shield)
    .replace(/\b([A-Z](?:\.[A-Za-z]+)+)\b/g, shield);
  return protectedText.split(/(?<=[.;!?।])\s+/)
    .map((s) => s.replace(/\0/g, '.').trim()).filter((s) => s.length > 6);
}
const ORIG_SUBJ = /\boriginals\b|\boriginal\s+TC\b|\bTC\s*\/\s*transfer\s+certificates?|\boriginal(?:\s+[\w.-]+){0,5}\s+(?:certificates?|documents?|mark\s*-?sheets?|marksheets?|degree|diplomas?|licen[cs]es?|papers?|testimonials?|academic\s+records|educational\s+(?:documents?|papers?|certificates?)|transfer\s+certificates?|TC)\b|मूल.{0,32}(?:प्रमाण\s*)?पत्र(?:ों)?|मूल.{0,24}(?:दस्तावेज(?:ों)?|डिग्री|अंक\s*पत्र(?:ों)?|ट्रांसफर|लाइसेंस)/i;
const YOUR_CERTS = /\b(?:your|aapke)\s+(?:original\s+)?(?:certificates?|documents?|mark\s*-?sheets?|marksheets?|degree(?:\s+certificates?)?|papers?|testimonials?|TC|transfer\s+certificates?)\b|आपके\s+मूल/i;
const ANAPHORA = /\b(they|them|those(?:\s+(?:papers?|certificates?|documents?|originals?))?|the\s+(?:same|said)\s+(?:papers?|certificates?|documents?)|the\s+paper(?:\s+itself)?|unhe|unki)\b/i;
const NEG_WORD = /\b(not|never|neither|nor|forbids?|forbidden|prohibit(?:s|ed)?|won['’]?t|shan['’]?t|aren['’]?t)\b|\bno\b(?!\.)|नहीं|नही|\bnahi[n]?\b|\bna\s+(?:to|hi)\b|ना\s+(?:तो|ही)|न\s+तो|न\s+ही/i;
const COPY_OBJ = /\b((?:photo)?cop(?:y|ies)|scanned\s+copies|self[- ]attested\s+copies|attested\s+(?:photo)?cop(?:y|ies)|scanned\s+(?:photo)?cop(?:y|ies)|xerox)\b|फोटोप्रति|फोटोकॉपी|छायाप्रति|प्रतिलिपि/i;
const HOLD_VERB = /\b(?:retain(?:s|ed|ing)?|keep(?:s|ing)?|kept|hold(?:s|ing)?|held|deposit(?:s|ed|ing)?|surrender(?:s|ed|ing)?|stor(?:e|es|ed|ing)|impound(?:s|ed|ing)?|withhold(?:s|ing)?|withheld|custody)\b|\bjama\b|\brakh(?:na|ne|ene|enge|ega|i|hi|waane|wane|waana|waayi|wayi|waaya|waya)?(?:\s+jaa?ye(?:gi|ga))?\b|\brah(?:enge|ega|egi|ena)?\b|\bpaas\s+rakh|\bke\s+paas\s+rah|जमा|रख(?:ना|ने|ेगा|ेगी|ेंगे|ा|े|ें|ी|वाई)?|रोक(?:ी|ेगा|ेगी|ेंगे)?/i;
const HOLD_PHRASE = /\bsubmit(?:s|ted|ting)?\b[\s\S]{0,90}?\b(?:until|till|unless)\b|\b(?:will\s+|shall\s+|are\s+|is\s+|to\s+)?not\s+(?:be\s+)?(?:return(?:ed|s)?|releas(?:e|ed|es|ing))[\s\S]{0,80}?\b(?:until|till|unless)\b|\breleas(?:e|ed|es|ing)\s+only\s+after\b|\b(?:remain(?:s|ed|ing)?|stays?|stay)\s+(?:with|in)\b|\btaken?\s+into\s+(?:safe\s+)?custody\b|\bin\s+(?:safe\s+)?custody\b|\bin\s+deposit\b|\bplaced\s+with\b|\bjab\s+tak\b|जब तक|तभी\s*जारी[\s\S]{0,48}जब|वापस\s*नहीं[\s\S]{0,40}(?:तक|जब)|के पास[\s\S]{0,48}रह|अभिरक्षा/i;
const DURABLE = /\b(?:until|till|unless|bond(?:ed)?|lock[- ]?in|surety|for\s+the\s+duration|up\s+to|throughout|collateral)\b|\bjab\s+tak\b|जब तक|बॉन्ड|अभिरक्षा|तभी/i;
function hasOrig(s: string) { return ORIG_SUBJ.test(s) || YOUR_CERTS.test(s); }
function hasHold(s: string) { return HOLD_VERB.test(s) || HOLD_PHRASE.test(s); }
function isCameraHold(s: string) { return /webcam|\bcameras?\b|कैमरा|camera ke saamne|in\s+front\s+of\s+the\s+(?:web)?camera/i.test(s) && /\bhold/i.test(s); }
/** Strict candidate-possession whitelist. The whole location phrase must be possession, not a compound workplace place. */
const SELF_NOUN = '(?:briefcases?|wallets?|bags?|handbags?|backpacks?|folders?|files?|possession|pockets?|suitcases?|purses?|hands?)';
const SELF_COMPOUND = /^(?:files?|lockers?|cupboards?|rooms?|cabinets?|almirahs?|drawers?|offices?|cells?|sections?|vaults?|stores?|units?|plants?|depots?|desks?|counters?|chambers?|safes?|godowns?|strong)\b/i;
const SELF_CLAUSE = /^(?:after|once|when|then|and|throughout|afterwards|following|during|before|as\s+soon\s+as|so\s+that|while\s+you|only|safely|yourself|too|as\s+well|that\s+you|which\s+you)\b/i;
function selfRemainderOk(rest: string): boolean {
  const r = rest.replace(/^\s+/, '');
  if (!r || /^[.,;:!?।]/.test(r)) return true;
  if (SELF_COMPOUND.test(r)) return false;
  if (/^of\s+(?:the\s+)?/i.test(r)) return false;
  if (/^(?:at|in)\s+/i.test(r)) return false;
  if (/^with\s+(?:your\s+)?(?:HR|hrs?|managers?|heads?|officers?|clerks?|admins?|companies?|offices?|boards?|cells?|controllers?|principals?|welfare|establishment|personnel)\b/i.test(r)) return false;
  if (/^(?:until|till|unless|jab\s+tak|tak)\b/i.test(r) || /^(?:जब तक|तक\b)/.test(r)) return false;
  if (/^for\s+(?:the\s+)?(?:\d+|one|two|three|[a-z]+)\s+(?:years?|months?|weeks?)\b/i.test(r)) return false;
  if (/^for\s+the\s+(?:traineeship|bond|duration|indenture|surety)\b/i.test(r)) return false;
  if (/^kept\s+by\b/i.test(r) && !/^kept\s+by\s+you\b/i.test(r)) return false;
  return SELF_CLAUSE.test(r);
}
function hasWholeSelfLocation(s: string): boolean {
  const re = new RegExp('(?:in|with)\\s+(?:your(?:\\s+own)?|(?:the\\s+)?candidate[\'’]s(?:\\s+own)?)\\s+' + SELF_NOUN + '\\b', 'ig');
  let m: RegExpExecArray | null, ok = false;
  while ((m = re.exec(s))) {
    if (selfRemainderOk(s.slice(m.index + m[0].length))) ok = true;
  }
  return ok;
}
function isWhitelistSelf(s: string) {
  if (/\b(?:with you|with the candidate|yourself|handed to you|returned to you|given back to you)\b/i.test(s)
    && !/\b(?:with you|with the candidate)\b[\s\S]{0,24}\b(?:until|till|unless|jab\s+tak)\b/i.test(s)) return true;
  if (hasWholeSelfLocation(s)) return true;
  if (/\bkeep(?:s|ing|t)?\b[\s\S]{0,50}\b(?:yourself|handy|ready|available)\b/i.test(s) && !/\b(?:until|till|unless)\b/i.test(s)) return true;
  if (/अपने पास रखें|अपने साथ रखें/i.test(s) && !/\b(?:jab\s+tak|until|till)\b|जब तक|तक/.test(s)) return true;
  const hi = /(?:aapke paas|apne paas|आपके पास|अपने पास)\s*(?:hi\s+|ही\s+)?(?:rakhein|rakho|rahenge|rakhna|rahiye|rahenga|rahegi|rahengi|rah\w*|रखें|रखो|रहेंगे|रहेंगी|रहेगा|रखिए|रहें)/ig;
  let m: RegExpExecArray | null;
  while ((m = hi.exec(s))) {
    if (selfRemainderOk(s.slice(m.index + m[0].length))) return true;
  }
  return false;
}
const WORK_PLACE = /\b(?:offices?|circles?|regional|units?|plants?|lockers?|managers?|heads?|branches?|departmental|depots?|cells?|sections?|clerks?|officers?|drawers?|rooms?|cupboards?|cabinets?|almirahs?|vaults?|stores?|strong\s+rooms?|workshops?|yards?|institutes?|colleges?|boards?|companies?|corporations?|establishments?|personnel|welfare|admins?|controllers?|principals?|reporting)\b/i;
/** Instruction is safe only if the place is a whole self-possession phrase. Workplace or time-bounded keep is never downgraded. */
function isPersonalInstructionAmber(s: string) {
  if (!/(?:\b(?:please|kindly)\s+(?:keep|leave|carry)|\bshould\s+(?:remain|stay|be kept))\b[\s\S]{0,80}\b(?:in|with)\s+your\b/i.test(s)) return false;
  const place = s.match(/\b(?:in|with)\s+your(?:\s+own)?\s+(.+)/i)?.[1] || '';
  if (WORK_PLACE.test(place) || SELF_COMPOUND.test(place.trim())) return false;
  if (/\b(?:until|till|unless|jab\s+tak)\b|जब तक|\bfor\s+(?:the\s+)?(?:\d+|one|two|three)\s+years?|\bfor\s+the\s+(?:traineeship|bond|duration|indenture)/i.test(s)) return false;
  return !isWhitelistSelf(s);
}

const LOC_TRANSFER = /\b(?:remain(?:s|ed|ing)?|stays?|kept|keep(?:s|ing)?|left|lie[sd]?|lying|deposit(?:s|ed|ing)?|stor(?:e|es|ed|ing)|lodg(?:e|es|ed|ing)|plac(?:e|es|ed|ing)|hand(?:s|ed|ing)?\s+over|submit(?:s|ted|ting)?)\b|\bbe\s+with\b|\bin\s+deposit\b|\bjama\b|\brakh\w*\b|रख|जमा/i;
function hasLocTransfer(s: string) {
  return LOC_TRANSFER.test(s) || /\bleav(?:e|es|ing)\s+(?:the\s+|your\s+)?original/i.test(s);
}
/** Drop "copy/photocopy of (the/your) original …" so those originals are not treated as the hold object. */
function withoutCopyOfOrig(s: string) {
  return s
    .replace(/\b(?:(?:photo)?cop(?:y|ies)|xerox|scanned\s+copies|self[- ]attested\s+copies)\s+(?:of\s+)?(?:your\s+|the\s+)?original(?:\s+[\w.-]+){0,5}(?:\s+(?:certificates?|documents?|mark\s*-?sheets?|marksheets?|degree|diplomas?|licen[cs]es?|papers?|testimonials?))?/gi, ' ')
    .replace(/मूल.{0,32}की\s+(?:फोटो)?प्रति(?:लिपि)?/g, ' ');
}
function origHeldAsTarget(s: string) {
  const rest = withoutCopyOfOrig(s);
  return hasOrig(rest) && (hasHold(rest) || hasLocTransfer(rest));
}
function copiesAreHoldObject(s: string) {
  return /(?:retain(?:s|ed|ing)?|keep(?:s|ing)?|kept|hold(?:s|ing)?|held|deposit(?:s|ed|ing)?|stor(?:e|es|ed|ing)|jama|जमा)\s+(?:only\s+)?(?:a\s+|the\s+)?(?:scanned\s+|attested\s+|self[- ]attested\s+|photo)?(?:cop(?:y|ies)|xerox|फोटोप्रति|फोटोकॉपी|छायाप्रति|प्रतिलिपि)/i.test(s)
    || /\b(?:(?:photo)?cop(?:y|ies)|xerox)\b[\s\S]{0,24}(?:are|is|will\s+be|to\s+be)?\s*(?:only\s+)?(?:retained|kept|held|deposited|stored|filed)\b/i.test(s)
    || /(?:फोटोप्रति|फोटोकॉपी|छायाप्रति|प्रतिलिपि).{0,24}जमा|जमा.{0,24}(?:फोटोप्रति|फोटोकॉपी|छायाप्रति|प्रतिलिपि)/.test(s)
    || /\b(?:(?:photo)?cop(?:y|ies)|xerox|प्रति(?:याँ|यां)?)\b[\s\S]{0,40}\b(?:rahegi|rahenge|rahega|remain(?:s|ed|ing)?|stays?|filed|file par)/i.test(s);
}
/** Copy-only when copies are the object of the hold verb and originals are not themselves the subject or object of that verb. */
function copyOnlyHold(s: string) {
  if (!COPY_OBJ.test(s) && !/फोटोप्रति|फोटोकॉपी|छायाप्रति|प्रतिलिपि/.test(s)) return false;
  if (origHeldAsTarget(s)) return false;
  return copiesAreHoldObject(s);
}
function copiesKeptOriginalsReturned(s: string) {
  return copiesAreHoldObject(s) && hasOrig(s) && /\b(?:returned|handed\s+(?:back|to you)|given\s+back|go(?:es)?\s+home)\b/i.test(s);
}
function isPlainVerify(s: string) {
  const cue = /\b(?:verif(?:y|ied|ication|ies|ying)|DV|document[- ]verification|visual check|inspection|inspect(?:ed)?|cross-check|attestation|exhibit(?:ed|tion)?|looked at|comparison with|dikhane|dikhana|viewing|viewed?|shown?|showing)\b|सत्यापन|दिखाना|दिखाने|जाँच|देखने/i.test(s)
    || /\b(?:same\s+(?:day|sitting|afternoon|evening|morning)|goes?\s+home|walk(?:s)?\s+out|pack it away|collected again|handed to you|before you leave|take them home|in one sitting)\b|उसी\s+(?:दिन|बैठक|समय)|वापस ले/i.test(s);
  if (!cue) return false;
  if (isWhitelistSelf(s)) return true;
  if (/\bkeep(?:s|ing|t)?\b[\s\S]{0,50}\b(?:ready|handy|available)\b/i.test(s) && !/\b(?:deposit|retain|store|lodge)\b/i.test(s)) return true;
  // (c) only when there is no hold / location / transfer verb besides the verification itself
  if (hasLocTransfer(s) || hasHold(s) || hasTimeOrReturn(s)) return false;
  return true;
}
const RETURN_FAM = /(?:return(?:ed|s|ing)?|releas(?:e|ed|es|ing)|(?:giv(?:e|en|ing)|hand(?:s|ed|ing)?|get(?:s|ting)?|got|take[ns]?|taken|sent)\s+(?:\S+\s+){0,4}back|hand(?:s|ed|ing)?\s+over)/i;
function isUntilReturnHold(s: string) {
  const negAux = /(?:won['’]?t|will\s+not|shan['’]?t|shall\s+not|aren['’]?t|are\s+not|isn['’]?t|is\s+not|(?:will\s+|shall\s+|are\s+|is\s+|to\s+)?not)/i;
  return new RegExp('\\b(?:' + negAux.source + ')\\s+(?:be\\s+)?' + RETURN_FAM.source + '[\\s\\S]{0,80}?\\b(?:until|till|unless)\\b', 'i').test(s)
    || /\breleas(?:e|ed|es|ing)\s+only\s+after\b/i.test(s)
    || /वापस\s*नहीं[\s\S]{0,40}(?:तक|जब)/.test(s)
    || /तभी\s*जारी[\s\S]{0,48}जब/.test(s)
    || /(?:\btak\b|hone\s+tak|जब तक|तक)\s*[,.]?\s*(?:wapas\s+nahi[n]?\s+mil|वापस\s*नहीं\s*मिल)/i.test(s)
    || /(?:wapas\s+nahi[n]?\s+mil|वापस\s*नहीं\s*मिल)[\s\S]{0,48}(?:\btak\b|जब तक|तक)/i.test(s);
}
/** Negation that only refuses a return never cancels a hold; it is a hold signal. */
function returnNotGiven(s: string) {
  return /wapas\s+nahi[n]?\s+mil|वापस\s*नहीं\s*(?:मिल|दिए|किए)|(?:will\s+not|won['’]?t|shall\s+not|(?:is|are)\s+not)\s+(?:be\s+)?(?:returned|given\s+back|handed\s+back)|not\s+(?:be\s+)?returned\b/i.test(s);
}
function negCancelsHold(s: string) {
  if (isUntilReturnHold(s) || returnNotGiven(s)) return false;
  return NEG_WORD.test(s);
}
function isConditionalHold(s: string) {
  return /\b(?:whether|if)\b[\s\S]{0,120}\b(?:to\s+be\s+|has\s+to\s+)?(?:held|kept|retained|deposited|stored|left|placed|lodged|remain(?:s|ed|ing)?|stays?)\b/i.test(s)
    || /\bwill\s+(?:say|advise|write|confirm)\s+(?:whether|if)\b/i.test(s)
    || /\bmay\s+be\b[\s\S]{0,80}\b(?:held|kept|retained|deposited|stored|left|placed)\b/i.test(s)
    || /\bwhether\b[\s\S]{0,120}\b(?:left\s+in\s+deposit|placed\s+in\s+custody|to\s+be\s+deposited)\b/i.test(s);
}
function isSoftSubmit(s: string) {
  return /\bsubmit(?:s|ted|ting)?\b/i.test(s)
    && /\b(?:along with|with the joining form|for (?:verification|joining|onboarding|scrutiny|inspection|DV))\b/i.test(s)
    && !hasTimeOrReturn(s)
    && !/\b(?:retain(?:s|ed|ing)?|deposit(?:s|ed|ing)?|stor(?:e|es|ed|ing)|kept|held|custody)\b/i.test(s);
}
function holdNegatedCleanly(s: string) {
  return /\b(?:does\s+not|do\s+not|will\s+not|shall\s+not|are\s+not|is\s+not|won['’]?t|shan['’]?t|not)\s+(?:be\s+)?(?:retain(?:s|ed|ing)?|keep(?:s|ing)?|kept|hold(?:s|ing)?|held|deposit(?:s|ed|ing)?|surrender(?:s|ed|ing)?|stor(?:e|es|ed|ing)|collect(?:s|ed|ing)?|left|hand(?:ed|ing)?\s+over)\b/i.test(s)
    || /\bno\s+original[\s\S]{0,64}?\b(?:are\s+|is\s+|will\s+be\s+)?(?:kept|stored|held|deposited|retained|collected|left|placed)\b/i.test(s)
    || /\bnothing\s+(?:is\s+)?(?:to\s+be\s+)?(?:stored|kept|retained|held|deposited|collected)\b/i.test(s)
    || /\bnot\s+a\s+request\s+to\s+(?:deposit|surrender|retain|keep)\b/i.test(s)
    || /जमा\s*नहीं|रखने\s*के\s*लिए\s*नहीं|rakhne ke liye nahi|jama nahi/i.test(s)
    || /\bnot\s+required\s+to\s+(?:surrender|deposit|submit|hand\s+over)\b/i.test(s)
    || /\b(?:forbids?|prohibits?)\b[\s\S]{0,48}\b(?:hold(?:ing)?|keeping|retaining|storing|depositing)\b/i.test(s)
    || /\bno\s+(?:right|authority|power|clause|provision|condition)\s+(?:to\s+|under\s+which\s+)/i.test(s)
    || /\bneither\s+(?:retain|keep|hold|deposit|store|withhold|ask|leave)\b/i.test(s)
    || /नहीं\s*रखेग[ाी]|नहीं\s*रखती|\bnahi[n]?\s+rakh(?:egi|ega|ti|te)\b/i.test(s);
}
function mixedException(s: string) {
  return (/\b(?:except|unless)\b/i.test(s) && /\b(?:bond|deposit|custody|surety)\b/i.test(s) && !isUntilReturnHold(s))
    || (/\b(?:normally|usually)\b/i.test(s) && /\b(?:except|unless|may|bond|differ)\b/i.test(s))
    || /\bmay\s+still\b/i.test(s);
}
export type DocsTier = 'red' | 'amber' | null;
/** Time / return markers. Bare 'back' is not a marker; require give/hand/get … back. */
function hasTimeOrReturn(s: string) {
  return /\b(?:until|till|unless)\b|\bonly\s+after\b|\bfor\s+the\s+duration\b|\block[- ]?in\b|\bjab\s+tak\b|\btak\b|जब तक|तक|वापस/i.test(s);
}
/** Three-tier documents rule. Time-marker fail-safe runs before keep-outs. Orig + location/transfer verb defaults to at least amber. */
export function docsHeldRisk(text: string): DocsTier {
  const sentences = offerClauses(text || '');
  let prevSubj = false, amber = false;
  for (const s of sentences) {
    const subj = hasOrig(s) || (prevSubj && ANAPHORA.test(s));
    const loc = hasLocTransfer(s);
    const hold = hasHold(s) || loc || !!(subj && /\bjab\s+tak\b|जब तक/i.test(s));
    const time = hasTimeOrReturn(s);
    prevSubj = hasOrig(s) || prevSubj;
    // 1. Orig + time/return marker is never clean. Run this before any keep-out or copy-only rule.
    if (subj && time) {
      if (isConditionalHold(s)) { amber = true; continue; }
      if (isUntilReturnHold(s) || returnNotGiven(s)) return 'red';
      // orig + time is never clean. Whitelist applies only when the whole location phrase is possession and is not time-bounded.
      if ((isWhitelistSelf(s) && !time) || (holdNegatedCleanly(s) && !mixedException(s) && !returnNotGiven(s)) || isCameraHold(s) || isPlainVerify(s) || copyOnlyHold(s) || copiesKeptOriginalsReturned(s) || isSoftSubmit(s)) {
        amber = true;
        continue;
      }
      if (isPersonalInstructionAmber(s)) { amber = true; continue; }
      if (subj && hold && !negCancelsHold(s)) return 'red';
      amber = true;
      continue;
    }
    // 2. whether / if / will say whether / may be about a later hold: amber, never red.
    if (isConditionalHold(s) && (subj || hold)) { amber = true; continue; }
    // 3. Clean only via (a) a whole-phrase possession match, (b) a clear denial, (c) plain verification / camera, or strict copy-only.
    if (isWhitelistSelf(s)) continue;
    if (holdNegatedCleanly(s) && !mixedException(s) && !returnNotGiven(s)) continue;
    if (isCameraHold(s)) continue;
    if (isPlainVerify(s)) continue;
    if (copyOnlyHold(s) || copiesKeptOriginalsReturned(s)) continue;
    if (isSoftSubmit(s)) { amber = true; continue; }
    if (isPersonalInstructionAmber(s)) { amber = true; continue; }
    if (isUntilReturnHold(s) && subj) return 'red';
    if (returnNotGiven(s) && subj) return 'red';
    if (subj && hold && !negCancelsHold(s)) return 'red';
    if ((subj && hold) || hold) amber = true;
  }
  return amber ? 'amber' : null;
}
export function docsHeldHit(text: string): boolean { return docsHeldRisk(text) != null; }

const RULES: { kind: string; re: RegExp; hit?: (s: string) => boolean; why: string | ((s: string) => string); risk: (s: string) => Risk; whole?: boolean }[] = [
  { kind: 'Service bond', re: /\b(service (bond|agreement)|bond(?!\s+period)|minimum (service|tenure)|lock[- ]in)\b/i, why: 'You may have to pay money if you leave before a set time. Ask for the amount, how it reduces over time, and what it covers.', risk: (s) => (AMT.test(s) || /penalt/i.test(s) ? 'red' : 'amber') },
  { kind: 'Pay to join / deposit', re: /\b((refundable |security |caution )deposit|deposit (of|amount)|pay(ment)? (to|before) (join|joining)|joining (fee|charges?)|registration (fee|charges?)|kit (fee|charges?)|laptop (deposit|charges?))\b/i, why: 'Asking a new hire to pay a deposit or fee to join is a serious warning sign. Genuine employers do not charge candidates. Do not pay; ask for this in writing.', risk: () => 'red' },
  { kind: 'Non-compete', re: /\b(non[- ]?compete|shall not (join|work for|engage)|competitor|competing business)\b/i, why: 'Limits where you can work after leaving. In India, section 27 of the Indian Contract Act, 1872 generally makes restraints on trade after employment void, but read it and ask: https://www.indiacode.nic.in/bitstream/123456789/2187/2/A187209.pdf', risk: () => 'amber' },
  { kind: 'Non-solicit', re: /\bnon[- ]?solicit/i, why: 'Stops you approaching the company\'s clients or staff for a period. Check how long and how wide.', risk: () => 'info' },
  { kind: 'Notice period', re: /\b(notice period|(\d+|one|two|three|six)\s*(days?|months?)['’]?\s*(written )?notice|notice of (\d+|one|two|three))/i, why: 'Long notice periods make it harder to join your next job. 30 to 60 days is common; 90 days is long.', risk: (s) => { const d = toDays(s.match(DUR)); return d != null && d >= 90 ? 'red' : d != null && d > 60 ? 'amber' : 'info'; } },
  { kind: 'Clawback / repayment', re: /\b(claw ?back|repay|refund (the|any)|recover(y|ed)? (of|from)|reimburse the company|joining bonus|relocation (assistance|bonus|allowance)|sign[- ]on bonus)\b/i, why: 'Money you may have to return if you leave early. Ask for the exact amount and time period in writing.', risk: (s) => (/repay|claw|recover|refund|reimburse/i.test(s) ? 'amber' : 'info') },
  { kind: 'Training cost recovery', re: /\btraining (cost|fee|expense|charges)/i, why: 'Some employers recover training costs if you leave. Ask what the real cost is and how it is calculated.', risk: () => 'amber' },
  { kind: 'Original documents held', re: /\b(originals?|original educational|retain (your|the) (original|certificates))|मूल/i, hit: docsHeldHit, whole: true, why: (s) => docsHeldRisk(s) === 'amber' ? 'Check: confirm whether originals are kept' : 'Holding original certificates is a serious warning sign. Offer only copies, and ask for this in writing.', risk: (s) => docsHeldRisk(s) === 'amber' ? 'amber' : 'red' },
  { kind: 'Pay depends on project allocation / bench', re: /\b(bench|billable|deploy(?:ed|ment)|allocat(?:ed|ion))\b/i, hit: benchPayHit, why: 'Pay may stop, or start only, when you are assigned to a billable project (including time on the bench). Ask in writing whether you are paid between projects, and from which date salary starts.', risk: (s) => (NO_PAY.test(s) ? 'red' : 'amber') },
  { kind: 'Liquidated damages', re: /\b(liquidated damages|penalty of|pay (a )?penalty|damages of)\b/i, why: 'A fixed sum payable if you break the terms. Ask how the figure was set.', risk: () => 'red' },
  { kind: 'Probation', re: /\bprobation/i, why: 'During probation notice is often shorter and confirmation is not automatic. Check the length and notice.', risk: (s) => { const d = toDays(s.match(DUR)); return d != null && d > 180 ? 'amber' : 'info'; } },
  { kind: 'Garden leave / notice buy-out', re: /\b(garden leave|buy[- ]?out|salary in lieu)\b/i, why: 'Check whether you can pay to leave early and how the amount is worked out.', risk: () => 'info' },
  { kind: 'Broad IP / moonlighting', re: /\b(all (inventions|intellectual property)|whether or not during working hours|outside (of )?working hours|moonlight|dual employment|side (business|project))\b/i, why: 'May cover side projects done in your own time. Ask for personal projects to be carved out.', risk: () => 'amber' },
  { kind: 'Variable pay', re: /\b(variable|performance (bonus|linked)|at the sole discretion)\b/i, why: 'Variable pay is not guaranteed. Count only fixed pay when comparing.', risk: () => 'info' },
];
const sentences = (t: string) => t.replace(/\r/g, '').replace(/([.;!?:])?[ \t]*\n{2,}/g, (_m, p) => (p ? p + ' ' : '. ')).replace(/(?<!\.)\.\s*\.(?!\.)/g, '.').replace(/\s+/g, ' ').split(/(?<=[.;!?])\s+(?=[A-Z0-9(•-])/).map((s) => s.trim()).filter((s) => s.length > 15);
export function scanOffer(text: string): Clause[] {
  const out: Clause[] = [];
  const chunks = (r: (typeof RULES)[number]) => r.whole ? [(text || '').replace(/\s+/g, ' ').trim()].filter((s) => s.length > 15) : sentences(text || '');
  for (const r of RULES) for (const s of chunks(r)) if (r.hit ? r.hit(s) : r.re.test(s)) {
    if (out.some((c) => c.kind === r.kind && c.sentence === s)) continue;
    const d = s.match(DUR), a = s.match(AMT);
    out.push({ kind: r.kind, risk: r.risk(s), sentence: s.slice(0, 400), why: typeof r.why === 'function' ? r.why(s) : r.why, detail: [a?.[0], d?.[0]].filter(Boolean).join(' · ') || undefined });
  }
  const order = { red: 0, amber: 1, info: 2 } as const;
  return out.sort((x, y) => order[x.risk] - order[y.risk]);
}
/** Pulls a clearly stated annual CTC in INR. Ranges, ceilings, conflicts, other currencies and bonus/buyout figures return null. */
const CTC_CTX = /(?:\bctc\b|\bc\.t\.c\.|\bcost to (?:the )?company\b|\bpackage\b|\b(?:annual|gross)\s+(?:annual\s+)?(?:gross\s+)?(?:salary|compensation|pay)\b|\bannual ctc\b)/i;
const PREV_CTC = /\b(?:previous|last|earlier|existing|prior)\s+(?:ctc|package|salary|compensation|pay)\b/i;
const CTC_NOISE = /\b(?:retention|joining|sign[- ]?on|performance)?\s*(?:bonus|bond|buy[- ]?outs?|buyouts?|penalty|deposit|damages|claw\s?backs?|liquidated)\b/i;
const NON_INR = /\b(?:usd|eur|gbp|aed|sgd|cad|aud|dollars?|euros?|pounds?)\b|[$€£]/i;
const INR_MARK = /₹|\b(?:inr|rs\.?|rupees?|rupaye|lakhs?|lacs?|lpa|crores?|crs?\b|लाख|करोड़)\b/i;
const RANGE_BEFORE = /(?:\d+(?:\.\d+)?)\s*(?:-|–|—|to)\s*$/i;
const UPTO_BEFORE = /\b(?:up\s*to|upto|as high as)\s*$/i;
const parseNum = (s: string) => Number(s.replace(/,/g, ''));
const abbrevDot = (t: string, j: number) => /(?:\b(?:rs|mr|mrs|ms|dr|no|inr|pvt|ltd|inc|co)|c\.t\.c|ctc)\.$/i.test(t.slice(Math.max(0, j - 8), j + 1));
const clauseSpan = (t: string, i: number) => {
  let a = 0, b = t.length;
  for (const sep of ['. ', '! ', '? ', '\n']) {
    const j = t.lastIndexOf(sep, i);
    if (j >= a && !(sep === '. ' && abbrevDot(t, j))) a = j + sep.length;
  }
  for (const sep of ['. ', '! ', '? ', '\n']) {
    const j = t.indexOf(sep, i);
    if (j >= 0 && j < b && !(sep === '. ' && abbrevDot(t, j))) b = j;
  }
  return { a, b, text: t.slice(a, b) };
};
type CtcHit = { value: number; monthly: boolean; annual: boolean; currency: 'inr' | 'other' | 'unknown' };
function unitOf(after: string): { mul: number; annual: boolean } {
  if (/^\s*(?:lpa\b|lakhs?\s+per\s+annum|lacs?\s+per\s+annum|लाख(?:\s*रुपये)?(?:\s*प्रति\s*वर्ष)?)/i.test(after)) return { mul: 100_000, annual: true };
  if (/^\s*(?:crores?|crs?\b|करोड़)/i.test(after)) return { mul: 10_000_000, annual: /^\s*(?:crores?|crs?\b|करोड़)(?:\s+per\s+annum)?/i.test(after) };
  if (/^\s*(?:lakhs?|lacs?|लाख)/i.test(after)) return { mul: 100_000, annual: false };
  return { mul: 1, annual: false };
}
function ctcHits(t: string): CtcHit[] {
  const out: CtcHit[] = [];
  const re = /\d+(?:,\d{2,3})+|\d+(?:\.\d+)?/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(t))) {
    const raw = m[0], start = m.index, end = start + raw.length;
    const { a, b, text: cl } = clauseSpan(t, start);
    const before = t.slice(a, start);
    const after = t.slice(end, b);
    const afterClose = after.slice(0, 22);
    if (RANGE_BEFORE.test(before) || UPTO_BEFORE.test(before)) continue;
    if (CTC_NOISE.test(before) || (CTC_NOISE.test(cl) && !CTC_CTX.test(before))) continue;
    if (PREV_CTC.test(cl) && !/\boffer(?:s|ed|ing)?\s+(?:a |you )?(?:ctc|package)\b/i.test(before) && !/\b(?:new|revised|proposed)\s+ctc\b/i.test(before)) continue;
    if (/\b(?:fixed(?:\s+pay)?|basic(?:\s+pay)?|basic\s+salary|in-?hand)\b/i.test(before) && !CTC_CTX.test(before.slice(Math.max(0, before.length - 28)))) continue;
    const unit = unitOf(after);
    const hasCtx = CTC_CTX.test(before) || /^(?:\s*(?:per\s+annum|p\.a\.?)?\s*)(?:ctc|cost to (?:the )?company|package)\b/i.test(after);
    if (!hasCtx) continue;
    const n = parseNum(raw);
    if (!Number.isFinite(n) || n <= 0) continue;
    const value = Math.round(n * unit.mul);
    if (value < 1000) continue;
    const currency: CtcHit['currency'] = NON_INR.test(before) || NON_INR.test(afterClose) ? 'other' : INR_MARK.test(before) || INR_MARK.test(after) || unit.mul > 1 ? 'inr' : 'unknown';
    const afterTimes = /(?:[x×*]\s*12\s*=\s*(?:₹|rs\.?|inr)?\s*)$/i.test(before);
    const monthly = !afterTimes && (/\b(?:per\s+month|monthly|\/\s*month|p\.?\s*m\.?)\b/i.test(afterClose) || /\s*[x×*]\s*12\b/i.test(afterClose) || /\bmonthly\s+ctc\b.{0,28}$/i.test(before));
    const annual = !monthly && (unit.annual || afterTimes || /\b(?:per\s+annum|per\s+year|p\.?\s*a\.?|annual\s+ctc)\b/i.test(afterClose) || /\bannual\s+ctc\b.{0,28}$/i.test(before));
    out.push({ value, monthly: monthly && !annual, annual, currency });
  }
  return out;
}
export function findCtc(text: string): number | null {
  const t = (text || '').replace(/\s+/g, ' ');
  const hits = ctcHits(t);
  if (!hits.length) return null;
  if (hits.some((h) => h.currency === 'other')) return null;
  const converted = [...new Set(hits.map((h) => (h.monthly ? h.value * 12 : h.value)))];
  return converted.length === 1 ? converted[0] : null;
}
export function findVariablePct(text: string): number | null {
  const t = (text || '').replace(/\s+/g, ' ');
  const pats = [
    /variable(?: pay| component| bonus)?[^%\d.]{0,40}(\d{1,2}(?:\.\d+)?)\s*%/ig,
    /(\d{1,2}(?:\.\d+)?)\s*%\s*(?:of (?:the |your )?(?:ctc|salary) )?(?:as |is )?variable/ig,
  ];
  const vals: number[] = [];
  for (const re of pats) {
    let m: RegExpExecArray | null;
    while ((m = re.exec(t))) {
      const numAt = m.index + m[0].lastIndexOf(m[1]);
      const beforeNum = t.slice(Math.max(0, numAt - 16), numAt);
      if (RANGE_BEFORE.test(beforeNum) || UPTO_BEFORE.test(beforeNum)) continue;
      const n = Number(m[1]);
      if (n > 0 && n <= 60) vals.push(n);
    }
  }
  const uniq = [...new Set(vals)];
  return uniq.length === 1 ? uniq[0] : null;
}
/** Values to pre-fill from a pasted letter. Omits a field when the figure is not clearly stated. */
export function prefillPayFields(text: string): { ctc?: string; variable?: string } {
  const c = findCtc(text), v = findVariablePct(text);
  return { ...(c ? { ctc: String(c) } : {}), ...(v != null ? { variable: String(v) } : {}) };
}
export type PaySide = { text: string; ctc: string; variable: string; ctcEdited?: boolean; variableEdited?: boolean };
/** Merge pre-fill into offer fields. 'type' never changes pay; 'new' (fresh paste/upload) fills or clears; 'append' never overwrites a field the user edited. */
export function mergePayPrefill(prev: PaySide, text: string, kind: 'type' | 'new' | 'append'): PaySide {
  if (kind === 'type') return { ...prev, text };
  const pay = prefillPayFields(text);
  if (kind === 'new') return { text, ctc: pay.ctc ?? '', variable: pay.variable ?? '0', ctcEdited: false, variableEdited: false };
  return {
    text,
    ctc: prev.ctcEdited ? prev.ctc : (pay.ctc ?? prev.ctc),
    variable: prev.variableEdited ? prev.variable : (pay.variable ?? prev.variable),
    ctcEdited: prev.ctcEdited,
    variableEdited: prev.variableEdited,
  };
}
/** Short notice when a whole-document re-paste replaces a hand-edited CTC or variable %. */
export function payRefreshNotice(prev: PaySide, kind: 'type' | 'new' | 'append'): string | undefined {
  if (kind === 'new' && (prev.ctcEdited || prev.variableEdited)) return 'CTC and variable were refreshed from the new letter.';
}
export const DISCLAIMER = 'Information, not legal advice. Rules-based reading in your browser can miss or misread clauses. For a binding view, ask a qualified professional of your choice.';
