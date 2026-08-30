import { ColdEmailTemplate } from '../types';

export const emailTemplates: ColdEmailTemplate[] = [
  {
    id: 'tpl-001',
    title: 'Deloitte / EY Consulting Style - Legal Ops & CLM Leader Pitch',
    roleCategory: 'Legal Ops & CLM Transformation',
    cultureCategory: 'Top-Tier Consulting (Deloitte / EY)',
    channel: 'Cold Email',
    subject: 'Application: {{JobTitle}} – Ex-Gartner | 60% TAT Cut | LLB + CLM Transformation Lead',
    description: 'Data-backed, high-impact cold pitch formatted for Big-4 Consulting Directors & Talent Acquisition Leads.',
    conversionRateEstimate: '58% Recruiter Response Rate',
    keyHighlights: ['60% TAT Reduction', 'Ex-Gartner 7+ Yrs', '6 FTE Leadership', 'LLB & CLM Automation'],
    body: `Dear {{ContactName}},

I am reaching out regarding the {{JobTitle}} position at {{Company}}. 

Having spent 7+ years at Gartner leading Strategic Operations and Legal Operations Transformation—coupled with an LLB degree and hands-on Agentic AI development—I specialize in building high-velocity legal operations, CLM playbooks, and automated process workflows.

Key Highlights Aligned with {{Company}}'s Objectives:
• 60% TAT Cut: Spearheaded end-to-end turnaround time reduction across multi-disciplinary global legal & process workflows through structured Root Cause Analysis (RCA).
• Legal Ops & Team Leadership: Direct leadership of 6 FTE process consultants, authoring 5+ enterprise SOP playbooks, and guiding CLM vendor rollouts.
• Agentic AI & Automation: Hands-on experience developing custom AI agents, Copilot prompt architectures, and Python automation scripts to streamline contract risk intake.

I have attached my tailored resume and executive cover letter for your review. I would welcome 10 minutes to discuss how my consulting rigor and process expertise can deliver immediate impact to {{Company}}.

Best regards,

Akash Sharma
Strategic Operations & Legal Ops Transformation Leader
Phone: +91 9818X XXXXX | Email: Adv.Akash2356@gmail.com
LinkedIn: linkedin.com/in/akashsharma-operations`
  },
  {
    id: 'tpl-002',
    title: 'LinkedIn InMail - High-Growth LegalTech / SaaS Founders & VPs',
    roleCategory: 'Legal Ops & CLM Transformation',
    cultureCategory: 'High-Growth Tech & LegalTech',
    channel: 'LinkedIn InMail',
    subject: 'Akash Sharma | Ex-Gartner Legal Ops & CLM Lead (LLB + AI Agents)',
    description: 'Concise, high-energy InMail targeting VPs of Customer Success, Legal Engineering, or Product in LegalTech (Ironclad/SpotDraft style).',
    conversionRateEstimate: '62% InMail Accept Rate',
    keyHighlights: ['Direct & Punchy', '60% TAT Metric', 'LegalTech Mastery', 'LLB Credentials'],
    body: `Hi {{ContactName}},

Loved seeing {{Company}}'s recent expansion in automated contract management and enterprise workflow intelligence!

With 7+ years at Gartner leading process transformation and legal operations (plus an LLB and custom Python/AI agent development), I've consistently delivered 60% TAT reductions and led 6 FTE teams implementing enterprise CLM frameworks.

I'm actively evaluating Lead / Manager roles in Legal Ops & Transformation (targeting ₹18–28 LPA). I'd love to share my playbook on driving scalable CLM adoption.

Would you be open to a quick 5-minute chat this week?

Best,
Akash Sharma`
  },
  {
    id: 'tpl-003',
    title: 'Gartner Alumni Warm Network - Peer Introduction Pitch',
    roleCategory: 'Strategic Operations Lead',
    cultureCategory: 'Gartner Alumni / Warm Network',
    channel: 'Warm Alumni Intro',
    subject: 'Gartner Connection / Akash Sharma — {{JobTitle}} at {{Company}}',
    description: 'Leverages shared Gartner tenure for instant trust and peer-to-peer warm referral requests.',
    conversionRateEstimate: '75% Internal Referral Rate',
    keyHighlights: ['Warm Gartner Connection', 'Instant Trust', '7+ Yrs Shared History', 'Easy Referral Request'],
    body: `Hi {{ContactName}},

Hope you're doing well! Reaching out as a fellow Gartner alum (spent 7+ years in Strategic Operations delivering 60% TAT cuts across global workflows).

I noticed the {{JobTitle}} opening at {{Company}} and was immediately impressed by your team's focus on operational excellence and digital process transformation.

Given my background managing 6 FTE direct reports, authoring SOP playbooks, and deploying AI Copilot automation, I feel this is a seamless match.

Would you be open to connecting over a quick phone call or referring my application internally to the hiring lead? Happy to send across my tailored resume summary!

Best regards,

Akash Sharma
Ex-Gartner Strategic Operations Lead`
  },
  {
    id: 'tpl-004',
    title: 'Corporate GCC / MNC - Enterprise AI & Automation Leader Pitch',
    roleCategory: 'Enterprise AI & Process Automation',
    cultureCategory: 'Corporate GCC / MNC',
    channel: 'Cold Email',
    subject: 'Process Automation & AI Lead: Akash Sharma (Ex-Gartner | 60% TAT Reduction)',
    description: 'Tailored for Global Capability Centers (GCCs) looking to integrate GenAI, Copilot, and process engineering into shared operations.',
    conversionRateEstimate: '50% GCC Recruiter Response Rate',
    keyHighlights: ['GCC Scale Alignment', 'Copilot / GenAI', 'Python Automation', 'SLA Governance'],
    body: `Dear {{ContactName}},

As global capability centers rapidly transition from service delivery to AI-assisted process hubs, I am writing to present my candidacy for the {{JobTitle}} role at {{Company}}.

Over 7+ years at Gartner, I have specialized in transforming operational bottlenecks into automated, high-throughput workflows:
- AI & Automation Deployments: Built custom AI agents, Copilot prompt templates, and Python automation workflows to cut manual SLA effort.
- Proven Operations Metrics: Achieved a sustained 60% TAT reduction across multi-stakeholder business units.
- Strategic Governance: Managed 6 FTEs, established SLA metrics dashboards, and published 5+ enterprise SOP playbooks.

I would appreciate the opportunity to discuss how my combination of operational rigor and AI innovation can accelerate {{Company}}'s automation roadmap.

Sincerely,

Akash Sharma
Phone: +91 9818X XXXXX | Adv.Akash2356@gmail.com`
  },
  {
    id: 'tpl-005',
    title: 'Strict 5-Day Follow-Up Email - Re-Engaging Recruiter',
    roleCategory: 'Strategic Operations Lead',
    cultureCategory: 'Top-Tier Consulting (Deloitte / EY)',
    channel: '5-Day Follow-Up',
    subject: 'Following Up: {{JobTitle}} Application – Akash Sharma',
    description: 'Polite, persistent 5-day follow-up message adding fresh value or highlighting recent AI project developments.',
    conversionRateEstimate: '44% Conversion on Follow-Up',
    keyHighlights: ['Polite Persistence', 'Value Add', 'Recent AI Work', 'Low Friction'],
    body: `Hi {{ContactName}},

I wanted to briefly follow up on my application sent 5 days ago for the {{JobTitle}} position at {{Company}}. 

I remain extremely keen on bringing my 7+ years of Gartner process transformation experience (60% TAT reduction, LLB, and custom Agentic AI workflows) to your team.

Since applying, I recently published an updated Agentic AI workflow demo that automates contract clause risk scoring—an innovation directly applicable to {{Company}}'s operations.

I'd welcome a brief 5-minute conversation to see if my background aligns with your current shortlist timing.

Best regards,

Akash Sharma`
  },
  {
    id: 'tpl-006',
    title: 'LinkedIn Connection Request (<300 Chars)',
    roleCategory: 'General Manager / Director',
    cultureCategory: 'High-Growth Tech & LegalTech',
    channel: 'LinkedIn InMail',
    subject: 'Connection Request: Akash Sharma',
    description: 'Micro-pitch under 300 characters for instant LinkedIn connection approval.',
    conversionRateEstimate: '68% Accept Rate',
    keyHighlights: ['Under 300 Characters', 'Instant Skim', 'High Credibility'],
    body: `Hi {{ContactName}}, 7+ yrs Gartner Ops Lead & LLB. I cut turnaround time by 60% using process RCA & AI Copilots. Keen on {{Company}}'s {{JobTitle}} opening. Would love to connect and share my transformation playbook!`
  }
];
