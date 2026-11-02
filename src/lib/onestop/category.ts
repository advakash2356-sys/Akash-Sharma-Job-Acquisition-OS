// Auto-classify a posting into the JAOS one-stop tabs (t345u). Deterministic, no AI. Akash Sync Agent.
export type Category = 'gov-cadre' | 'gov-lateral' | 'consulting' | 'remote' | 'international' | 'corporate';
export const CATEGORY_LABEL: Record<Category, string> = {
  'gov-cadre': 'Government: cadre exams (age-capped)',
  'gov-lateral': 'Government: lateral / consultant (all ages)',
  consulting: 'Consulting',
  corporate: 'Corporate / Private',
  remote: 'Remote Global',
  international: 'International',
};
export const CATEGORY_ORDER: Category[] = ['corporate', 'consulting', 'remote', 'international', 'gov-lateral', 'gov-cadre'];

const GOV_ORG = /\b(government|govt|ministry|niti aayog|meity|upsc|ssc|psc|psu|nic\b|cdac|c-dac|isro|drdo|railway|rrb|ibps|sbi po|rbi|sebi|nabard|bsnl|ongc|ntpc|bhel|gail|iocl|hal\b|bel\b|aiims|icmr|csir|digital india|mygov|niti|nhai|commission|directorate|municipal|nagar nigam|high court|district court|police|army|navy|air force|cantonment|public service)\b/i;
const LATERAL = /\b(young professional|consultant|senior consultant|sr\.? consultant|advisor|adviser|lateral|contract(ual)?|on contract|fellow(ship)?|deputation|specialist|expert|project (manager|associate|scientist)|retainer)\b/i;
const CADRE = /\b(exam(ination)?|recruitment \d{4}|cadre|civil services|combined|cgl|chsl|mts|constable|clerk|probationary officer|\bpo\b|group [abcd]|tier[- ]?i|prelims?|mains|admit card|age limit|apprentice)\b/i;
const CONSULT_CO = /\b(deloitte|pwc|pricewaterhouse|kpmg|ernst|\bey\b|accenture|mckinsey|bain|bcg|boston consulting|kearney|oliver wyman|zs\b|alvarez|fti consulting|protiviti|grant thornton|bdo|rsm|capgemini invent|gartner|korn ferry|huron|navigant|marsh|aon)\b/i;
const CONSULT_TITLE = /\b(consult(ant|ing)|advisory|management consultant|strategy & operations|transaction services|forensic)\b/i;
const VISA = /\b(visa sponsor(ship)?|sponsorship available|relocation (support|package|assistance)|will sponsor|h-?1b|skilled worker visa|blue card|work permit (provided|support))\b/i;
const IN_HINT = /\b(india|delhi|ncr|gurugram|gurgaon|noida|bengaluru|bangalore|mumbai|pune|hyderabad|chennai|kolkata|ahmedabad|jaipur|kochi|chandigarh|indore|coimbatore)\b/i;

export interface Classifiable { title: string; company: string; location?: string; description?: string; remote?: boolean; workMode?: string; gov?: boolean }
/** Government postings are split into age-capped cadre exams vs all-age lateral roles; the rest by company, title, remote flag and location. */
export function classify(j: Classifiable, home = 'IN'): Category {
  const tc = `${j.title} ${j.company}`; const all = `${tc} ${j.description || ''}`.slice(0, 3000); const loc = j.location || '';
  if (j.gov || GOV_ORG.test(j.company)) return LATERAL.test(j.title) && !CADRE.test(j.title) ? 'gov-lateral' : 'gov-cadre';
  if (CONSULT_CO.test(j.company) || CONSULT_TITLE.test(j.title)) return 'consulting';
  const remote = j.remote || /remote/i.test(j.workMode || '') || /\b(remote|anywhere|worldwide|work from home)\b/i.test(loc);
  if (remote && !IN_HINT.test(loc)) return 'remote';
  if (home === 'IN' && loc && !IN_HINT.test(loc) && !remote) return 'international';
  return 'corporate';
}
/** Cadre exams carry an age cap; lateral and private roles never do (the age penalty applies only here). */
export const ageCapped = (c: Category) => c === 'gov-cadre';
export const visaHint = (text: string) => VISA.test(text);
