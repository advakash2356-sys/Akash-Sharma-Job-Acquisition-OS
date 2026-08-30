import { JobRole } from '../types';

export const initialJobs: JobRole[] = [
  {
    id: "job-001",
    title: "Senior Manager – Strategic Operations & Legal Ops Transformation",
    company: "Deloitte US-India (USI)",
    location: "Gurgaon / Remote US-Shift",
    workMode: "Hybrid NCR",
    shift: "US/Night Shift",
    ctcMinLpa: 22,
    ctcMaxLpa: 28,
    salaryUnclear: false,
    source: "LinkedIn",
    jobUrl: "https://linkedin.com/jobs/view/deloitte-legalops-lead",
    dateAdded: "2026-07-26",
    status: "Scored",
    description: `Deloitte USI is looking for an experienced Senior Manager to lead Strategic Operations and Legal Operations Transformation for global enterprise clients.
    
Responsibilities:
- Drive process transformation and Turnaround Time (TAT) reduction across global legal operations, contract lifecycle management (CLM), and procurement functions.
- Lead a team of 5-8 process consultants and analysts in executing root-cause analysis (RCA), SLA governance, and workflow restructuring.
- Evaluate and deploy AI-driven CLM tools, prompt engineering workflows, and Copilot automation to streamline contract intake, clause extraction, and risk assessment.
- Partner with C-suite stakeholders and legal counsel to publish operational playbooks, SOPs, and risk frameworks.
- Design metrics dashboards for continuous process improvement (Kaizen).

Qualifications:
- 8-12 years of experience in Strategic Operations, Legal Ops, CLM, or Process Transformation in Big-4 / Gartner / GCC environments.
- Formal legal education (LLB preferred) or deep CLM implementation background.
- Hands-on experience or demonstrated leadership in AI automation (Copilot, GenAI workflows, Python).
- Proven track record of 40%+ TAT reduction and managing cross-functional teams.`,
    scores: {
      salaryScore: 25, // 22-28 LPA (well above 18 LPA floor)
      titleSkillsScore: 25, // Perfect title match: Strategic Ops + Legal Ops + CLM + AI
      companyQualityScore: 14, // Big-4 tier
      locationShiftScore: 15, // Remote US-Shift / Gurgaon Hybrid
      referralScore: 8, // Ex-Gartner network connection
      postingAgeScore: 9, // Posted 2 days ago
      totalScore: 96,
      ctcFloorPassed: true,
      tier: "HIGH_PRIORITY",
      pros: [
        "Salary band 22-28 LPA exceeds floor significantly",
        "Direct match with 8+ yrs Gartner background & LLB degree",
        "Demands AI automation & Copilot implementation experience",
        "US-shift remote/hybrid fit in Gurgaon"
      ],
      redFlags: [],
      skillGaps: ["Highlight specific CLM vendor names in tailored resume"],
      recommendation: "TOP TARGET (96/100). Apply immediately with custom tailored resume, cover letter, and LinkedIn warm reach out to Deloitte Legal Ops Director."
    },
    contactPerson: {
      name: "Siddharth Verma",
      title: "Director – Legal Business Services & USI Ops",
      email: "sverma@deloitte.com",
      linkedinUrl: "https://linkedin.com/in/siddharth-verma-deloitte"
    }
  },
  {
    id: "job-002",
    title: "Lead – Enterprise AI Enablement & Process Optimization",
    company: "Fractal Analytics",
    location: "Gurgaon / Remote",
    workMode: "Remote",
    shift: "Flexible",
    ctcMinLpa: 20,
    ctcMaxLpa: 25,
    salaryUnclear: false,
    source: "Gartner Alumni",
    jobUrl: "https://fractal.ai/careers/enterprise-ai-lead",
    dateAdded: "2026-07-27",
    status: "Tailored",
    description: `Fractal Analytics is seeking an Enterprise AI Enablement & Process Transformation Lead to drive AI adoption, custom LLM workflow automation, and operational efficiency for Fortune 500 clients.

Key Responsibilities:
- Bridge business operations, legal/compliance workflows, and agentic AI tools.
- Identify bottleneck processes using structured RCA and deploy LLM/Python automation to cut TAT by 50%+.
- Author AI governance playbooks, prompt engineering guidelines, and change management strategies for executive teams.
- Lead multi-disciplinary teams in shipping custom internal AI tools (agents, bots, Copilot extensions).

Requirements:
- 7+ years leading operational transformation or technology enablement in top tier consulting or tech firms (Gartner/McKinsey/Big-4).
- Hands-on technical understanding of AI agents, prompt engineering, Python, and API integration.
- Executive stakeholder management skills.`,
    scores: {
      salaryScore: 24, // 20-25 LPA
      titleSkillsScore: 24, // Process + AI focus
      companyQualityScore: 13, // Leading AI firm
      locationShiftScore: 15, // Remote
      referralScore: 10, // Ex-Gartner peer works at Fractal
      postingAgeScore: 9, // 1 day ago
      totalScore: 95,
      ctcFloorPassed: true,
      tier: "HIGH_PRIORITY",
      pros: [
        "Excellent 20-25 LPA salary band",
        "Leverages live AI projects (Rural India AI & Career OS)",
        "Gartner alumni warm intro available",
        "100% Remote flexibility"
      ],
      redFlags: [],
      skillGaps: [],
      recommendation: "TOP TARGET (95/100). Customized resume ready. Reach out to Gartner alumnus at Fractal via cold email."
    },
    contactPerson: {
      name: "Priya Sundaram",
      title: "VP – Enterprise AI Solutions (Ex-Gartner)",
      email: "priya.s@fractal.ai",
      linkedinUrl: "https://linkedin.com/in/priya-sundaram-ai"
    }
  },
  {
    id: "job-007",
    title: "Director of Enterprise Legal Ops & AI Systems",
    company: "Ontra (US LegalTech Unicorn - Remote)",
    location: "Remote US (Night Shift / EST)",
    workMode: "Remote",
    shift: "US/Night Shift",
    ctcMinLpa: 28,
    ctcMaxLpa: 38,
    salaryUnclear: false,
    source: "Legal Ops Community",
    jobUrl: "https://ontra.ai/careers/director-legal-ops-ai",
    dateAdded: "2026-07-28",
    status: "Scored",
    description: `Ontra is looking for a Director of Enterprise Legal Ops & AI Systems to manage US-shift contract operations, contract automation pipelines, and enterprise CLM implementations for private equity and Fortune 500 legal teams.

Key Deliverables:
- Lead remote cross-border operations team in delivering 60%+ Turnaround Time (TAT) reduction across high-volume NDA and M&A contract workflows.
- Architect automated clause intake, risk scoring, and Copilot AI agent prompts integrated into Ontra's CLM platform.
- Act as primary operational liaison for US-based General Counsels, managing tight SLAs during US East Coast business hours (18:30 IST to 03:00 IST).
- LLB degree + 8+ years process transformation & Gartner operational rigor required.`,
    scores: {
      salaryScore: 30, // 28-38 LPA -> Top High Margin
      titleSkillsScore: 25,
      companyQualityScore: 15,
      locationShiftScore: 15, // Remote US Night Shift (+25 US Remote Night Shift Bonus)
      referralScore: 9,
      postingAgeScore: 10,
      totalScore: 99,
      ctcFloorPassed: true,
      tier: "HIGH_PRIORITY",
      pros: [
        "🔥 HIGH MARGIN TRACK: ₹28–38 LPA CTC ($35k–$48k USD arbitrage)",
        "Direct Gartner ops + LLB + Copilot AI alignment",
        "Pure Remote EST / US Night Shift coverage fit",
        "Over 60% TAT reduction track record matches job criteria"
      ],
      redFlags: [],
      skillGaps: [],
      recommendation: "EXECUTIVE HIGH-MARGIN TARGET (99/100). Apply immediately with tailored ATS resume & initiate VP cold outreach."
    },
    contactPerson: {
      name: "Erica Vance",
      title: "VP of Global Operations & Legal Intelligence",
      email: "evance@ontra.ai",
      linkedinUrl: "https://linkedin.com/in/erica-vance-ontra"
    }
  },
  {
    id: "job-008",
    title: "Lead CLM & Process Automation Architect (US Shift)",
    company: "Agiloft (Remote US)",
    location: "Remote US (PST / Night Shift)",
    workMode: "Remote",
    shift: "US/Night Shift",
    ctcMinLpa: 26,
    ctcMaxLpa: 34,
    salaryUnclear: false,
    source: "LinkedIn",
    jobUrl: "https://agiloft.com/careers/clm-process-architect",
    dateAdded: "2026-07-27",
    status: "Scored",
    description: `Agiloft is hiring a Lead CLM & Process Automation Architect to lead US-night-shift contract workflow design, SLA management, and agentic AI integration for enterprise US healthcare and tech clients.

Responsibilities:
- Transform complex enterprise contract review processes, achieving 50%+ turnaround time savings.
- Deploy custom LLM prompt workflows and automated risk scoring logic for legal teams.
- Oversee cross-functional delivery team in Gurgaon/Remote working US PST night hours.`,
    scores: {
      salaryScore: 29, // 26-34 LPA
      titleSkillsScore: 25,
      companyQualityScore: 14,
      locationShiftScore: 15,
      referralScore: 8,
      postingAgeScore: 9,
      totalScore: 97,
      ctcFloorPassed: true,
      tier: "HIGH_PRIORITY",
      pros: [
        "🔥 HIGH MARGIN TRACK: ₹26–34 LPA CTC",
        "100% Remote US Shift arbitrage",
        "Perfect match for Gartner process transformation + LLB credential"
      ],
      redFlags: [],
      skillGaps: [],
      recommendation: "HIGH MARGIN TARGET (97/100). Tailor resume focusing on 6 direct reports & Copilot AI live tool."
    },
    contactPerson: {
      name: "Douglas Sterling",
      title: "Head of Professional Services & Legal Engineering",
      email: "d.sterling@agiloft.com"
    }
  },
  {
    id: "job-003",
    title: "Manager – Global CLM & Legal Operations",
    company: "Ironclad (US SaaS - Remote India)",
    location: "Remote (US Night Shift)",
    workMode: "Remote",
    shift: "US/Night Shift",
    ctcMinLpa: 24,
    ctcMaxLpa: 30,
    salaryUnclear: false,
    source: "Legal Ops Community",
    jobUrl: "https://ironcladapp.com/careers/legal-ops-manager",
    dateAdded: "2026-07-25",
    status: "Discovered",
    description: `Ironclad, a global leader in Contract Lifecycle Management (CLM), is hiring a Manager of Global Legal Operations to lead enterprise implementation standards, operational turnaround times, and contract AI integration.

Role Overview:
- Oversee global contract operations and legal technology workflows.
- Drive structured RCA to eliminate contract review bottlenecks, maintaining strict SLAs.
- Train enterprise customers and internal teams on AI contract drafting and automated compliance.
- Law degree (LLB/JD) with 8+ years in legal ops / CLM required.`,
    scores: {
      salaryScore: 25, // 24-30 LPA
      titleSkillsScore: 25, // Perfect CLM + Legal Ops + LLB fit
      companyQualityScore: 15, // Top US CLM SaaS Unicorn
      locationShiftScore: 15, // Remote US Shift
      referralScore: 6, // Cold outreach needed
      postingAgeScore: 8, // 3 days ago
      totalScore: 94,
      ctcFloorPassed: true,
      tier: "HIGH_PRIORITY",
      pros: [
        "24-30 LPA compensation range (Top tier)",
        "Direct CLM software leader matches LLB & Gartner CLM experience",
        "US Night Shift preferred"
      ],
      redFlags: [],
      skillGaps: ["Emphasize specific CLM clause library setup in resume"],
      recommendation: "HIGH PRIORITY (94/100). Tailor resume focusing on CLM implementation and LLB credentials."
    }
  },
  {
    id: "job-004",
    title: "Process Transformation Specialist",
    company: "Mid-Tier Local Agency",
    location: "Noida (Onsite)",
    workMode: "Onsite NCR",
    shift: "Day Shift",
    ctcMinLpa: 11,
    ctcMaxLpa: 14,
    salaryUnclear: false,
    source: "Naukri",
    dateAdded: "2026-07-28",
    status: "Archived",
    description: `Looking for a process specialist to review internal documentation and workflows in Noida office. CTC offered: 11-14 LPA.`,
    scores: {
      salaryScore: 0, // CTC < 18 LPA -> HARD FAIL FLOOR
      titleSkillsScore: 12,
      companyQualityScore: 6,
      locationShiftScore: 8,
      referralScore: 0,
      postingAgeScore: 10,
      totalScore: 36,
      ctcFloorPassed: false, // HARD FAIL < 18 LPA
      tier: "DISCARD",
      pros: [],
      redFlags: ["HARD FAIL: CTC 11-14 LPA is below ₹18 LPA floor!", "Onsite Noida without remote option"],
      skillGaps: [],
      recommendation: "AUTO-DISCARD (36/100). Below ₹18 LPA Floor. Zero effort allocation per Master Prompt rules."
    }
  },
  {
    id: "job-005",
    title: "Associate Director – Operations & Automation Lead",
    company: "Genpact Digital Transformation",
    location: "Gurgaon, India",
    workMode: "Hybrid NCR",
    shift: "Day Shift",
    ctcMinLpa: 19,
    ctcMaxLpa: 23,
    salaryUnclear: false,
    source: "Naukri",
    jobUrl: "https://naukri.com/job/genpact-ops-automation-lead",
    dateAdded: "2026-07-27",
    status: "Scored",
    description: `Genpact Digital is hiring an Associate Director to lead Operations & Process Automation for global legal and financial services accounts.
    
Key Requirements:
- 8-12 years experience in process optimization, 6 Sigma / RCA, and automated workflows.
- Lead teams of 6-10 analysts.
- Track record in achieving 40%+ TAT reduction and implementing enterprise AI tools.`,
    scores: {
      salaryScore: 21, // 19-23 LPA
      titleSkillsScore: 22,
      companyQualityScore: 12,
      locationShiftScore: 13,
      referralScore: 7,
      postingAgeScore: 9,
      totalScore: 84,
      ctcFloorPassed: true,
      tier: "HIGH_PRIORITY",
      pros: ["19-23 LPA meets CTC floor", "Associate Director title bump", "Gurgaon hybrid location"],
      redFlags: [],
      skillGaps: ["Detail team scale and SLA management"],
      recommendation: "HIGH PRIORITY (84/100). Tailor resume focusing on 6 direct reports management and 60% TAT reduction."
    }
  },
  {
    id: "job-006",
    title: "Senior Process Analyst (Legacy System)",
    company: "Global Business Solutions",
    location: "Gurgaon, India",
    workMode: "Hybrid NCR",
    shift: "Day Shift",
    ctcMinLpa: 18,
    ctcMaxLpa: 20,
    salaryUnclear: false,
    source: "Naukri",
    dateAdded: "2026-07-02", // Stale > 14 days ago (26 days ago)
    status: "Discovered",
    description: `Process analysis role for legacy IT infrastructure. Stale posting without interaction in over 20 days.`,
    scores: {
      salaryScore: 18,
      titleSkillsScore: 15,
      companyQualityScore: 10,
      locationShiftScore: 10,
      referralScore: 3,
      postingAgeScore: 2,
      totalScore: 58,
      ctcFloorPassed: true,
      tier: "MEDIUM_PRIORITY",
      pros: ["18 LPA meets minimum threshold"],
      redFlags: ["Stale posting (>20 days without recruiter interaction)"],
      skillGaps: [],
      recommendation: "Candidate for Auto-Archive batch processing due to >14 days inactivity."
    }
  }
];
