// Constrained resume style spec. The AI may only pick values from these lists; the renderer does the rest.
// AI never returns HTML/CSS. Shared by the browser (renderer) and the server (sanitising the AI answer).
export const TEMPLATES = ['classic', 'editorial', 'compact'] as const;
export type Template = (typeof TEMPLATES)[number];
export const TEMPLATE_INFO: Record<Template, { label: string; desc: string; credit: string }> = {
  classic: { label: 'Classic', desc: 'Sans-serif, accent headings with a hairline rule. Safe for most roles.', credit: 'Inspired by RenderCV "classic" (MIT)' },
  editorial: { label: 'Editorial', desc: 'Serif, centred header, quiet rules. Suits legal, policy, finance and senior roles.', credit: 'Inspired by RenderCV "sb2nov" and jsonresume-theme-even (MIT)' },
  compact: { label: 'Compact', desc: 'Dense one-page layout, accent only on the name. Suits short resumes and hands-on roles.', credit: 'Inspired by RenderCV "engineeringresumes" (MIT)' },
};
/** Safe accents: all reach WCAG AA (>= 4.5:1) on white and print well in greyscale. */
export const ACCENTS = { navy: '#1F3A5F', teal: '#0F5F5C', burgundy: '#7A1F3D', forest: '#2F5233', graphite: '#333F48' } as const;
export type Accent = keyof typeof ACCENTS;
export const SECTIONS = ['summary', 'experience', 'skills', 'projects', 'education', 'certifications', 'languages'] as const;
export type Section = (typeof SECTIONS)[number];

export interface StyleSpec {
  template: Template; accent: Accent; order: Section[]; density: 'comfortable' | 'compact';
  /** Date the guidance was produced for (yyyy-mm-dd, IST). */
  asOf: string;
  /** grounded = Gemini with Google Search; ai = Gemini without search; default = app default, no AI. */
  source: 'grounded' | 'ai' | 'default';
  tips: string[];
  /** The user chose the template/accent by hand; regeneration keeps it. */
  userPicked?: boolean;
}

export const todayIST = () => new Date(Date.now() + 5.5 * 3600e3).toISOString().slice(0, 10);

export function defaultSpec(roleHint = ''): StyleSpec {
  const hands = /driver|rider|delivery|helper|warehouse|guard|cook|electrician|plumber|operator|technician|mechanic|packer|loader/i.test(roleHint);
  const formal = /legal|law|counsel|policy|finance|compliance|audit/i.test(roleHint);
  return {
    template: hands ? 'compact' : formal ? 'editorial' : 'classic', accent: formal ? 'burgundy' : hands ? 'teal' : 'navy',
    order: hands ? ['summary', 'experience', 'skills', 'certifications', 'languages', 'education', 'projects'] : ['summary', 'experience', 'skills', 'education', 'certifications', 'projects', 'languages'],
    density: hands ? 'compact' : 'comfortable', asOf: todayIST(), source: 'default', tips: [],
  };
}

/** Accepts anything; returns a valid spec. Unknown values fall back to the default; tips are plain short text. */
export function sanitizeSpec(x: any, roleHint = '', source: StyleSpec['source'] = 'ai', asOf = todayIST()): StyleSpec {
  const d = defaultSpec(roleHint);
  if (!x || typeof x !== 'object') return d;
  const template = (TEMPLATES as readonly string[]).includes(x.template) ? x.template : d.template;
  const accent = Object.keys(ACCENTS).includes(x.accent) ? x.accent : d.accent;
  const seen = new Set<string>();
  const order = (Array.isArray(x.order) ? x.order : []).map((s: unknown) => String(s).toLowerCase().trim()).filter((s: string) => (SECTIONS as readonly string[]).includes(s) && !seen.has(s) && seen.add(s)) as Section[];
  for (const s of d.order) if (!seen.has(s)) order.push(s);
  order.sort((a, b) => (b === 'summary' ? 1 : 0) - (a === 'summary' ? 1 : 0)); // the summary always opens the resume
  const density = x.density === 'compact' || x.density === 'comfortable' ? x.density : d.density;
  const tips = (Array.isArray(x.tips) ? x.tips : []).map((t: unknown) => String(t).replace(/<[^>]*>/g, '').replace(/[{}<>`]/g, '').replace(/\s+/g, ' ').trim().slice(0, 140)).filter(Boolean).slice(0, 4);
  return { ...(x.userPicked === true ? { userPicked: true } : {}), template, accent, order, density, asOf: /^\d{4}-\d{2}-\d{2}$/.test(String(x.asOf || '')) ? String(x.asOf) : asOf, source, tips };
}

export function specLabel(s: StyleSpec) {
  const d = new Date(`${s.asOf}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  return s.source === 'grounded' ? `Formatted to resume standards as of ${d} (Gemini with Google Search)`
    : s.source === 'ai' ? `Formatted to AI-suggested resume standards as of ${d} (Gemini, no live search)`
    : `App default layout (AI style check not run) · ${d}`;
}
