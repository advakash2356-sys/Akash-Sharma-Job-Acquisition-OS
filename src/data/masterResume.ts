import { MasterResumeData } from '../types';
import { CONTACT_EMAIL, CONTACT_PHONE } from '../config';

export const masterResume: MasterResumeData = {
  name: "Akash Sharma",
  title: "Team Lead, Operations & Process Architecture | Strategy & Governance Lead",
  contact: {
    email: CONTACT_EMAIL,
    phone: CONTACT_PHONE,
    location: "Bijwasan, Southwest Delhi, India",
    linkedin: "linkedin.com/in/akash-sharma-ops",
  },
  executiveSummary: "Strategic Operations leader with 8+ years at Gartner architecting enterprise governance frameworks and process transformations. Partners with senior leadership and cross-functional global stakeholders to translate business requirements into scalable operating models, using structured Root Cause Analysis to identify and resolve operational bottlenecks. Combines a legal foundation (LLB) with hands-on Generative AI, Microsoft 365 Copilot, and prompt engineering training to bring AI-literate execution to strategy and governance work.",
  corePositioning: "Team Lead, Operations & Process Architecture with 8+ years at Gartner. Bridges strategy, governance, legal operations (LLB), BRD/FRD translation, and AI-enabled operations (Copilot & Prompt Engineering). Proven track record cutting turnaround times by up to 60% via Root Cause Analysis.",
  keyMetrics: {
    tatReduction: "Up to 60%",
    teamSize: "6 Direct Reports",
    stakeholdersTrained: "20+ Stakeholders across Global Offices",
    playbooksAuthored: "5+ Operational Governance Playbooks",
    liveAiProducts: [
      "Rural India AI (Privacy-by-Design & Offline-First)",
      "Akash Sharma Job Acquisition OS v2.0"
    ],
    yearsExp: "8+ Years at Gartner / 9+ Total",
    gartnerTenure: "8+ Years (Dec 2018 – Present)",
  },
  skills: {
    strategicOps: [
      "Strategy & Governance Frameworks",
      "Process Architecture & Optimization",
      "BRD/FRD Requirements Translation",
      "Root Cause Analysis (RCA)",
      "SLA Management & Audit Readiness",
      "Change Management & SOP Playbooks"
    ],
    legalOpsClm: [
      "Legal Operations & Governance",
      "Contract Lifecycle Management (CLM / Apttus)",
      "Salesforce CRM Administration",
      "Policy Compliance & Escalation",
      "Audit Readiness & Risk Mitigation",
      "LLB (Bachelor of Laws)"
    ],
    aiAutomation: [
      "Generative AI Integration & Applications",
      "Microsoft 365 Copilot for Work",
      "Prompt Engineering & Workflows",
      "Privacy-by-Design Architecture",
      "Offline-First Zero Data Transmission Apps",
      "UAT & System Delivery"
    ],
    leadership: [
      "Operations Team Leadership (6 FTEs)",
      "Global Stakeholder Leadership (20+ Trained)",
      "Cross-Functional Liaison (Business & IT)",
      "Vendor & Partner Governance",
      "Continuous Improvement"
    ]
  },
  experience: [
    {
      company: "Gartner",
      role: "Team Lead, Operations & Process Architecture",
      period: "Mar 2020 – Present",
      location: "Gurgaon / Delhi-NCR, India",
      achievements: [
        "Lead high-priority operational transformations, redesigning complex enterprise frameworks into streamlined, risk-mitigated processes and governance frameworks adopted organization-wide.",
        "Partner with senior leadership and global stakeholders to align day-to-day operational execution with long-term strategic business targets.",
        "Act as primary liaison between business units and IT teams, translating business requirements (BRD/FRD) into scalable technology solutions and platform governance.",
        "Direct a cross-functional operations team of 6 direct reports; lead training for 20+ stakeholders across multiple global offices.",
        "Run structured Root Cause Analysis to identify process bottlenecks and risk points, coordinating with international teams to cut turnaround times by up to 60%.",
        "Authored 5+ operational playbooks establishing compliance best practices used as the standard for global institutional training."
      ]
    },
    {
      company: "Gartner",
      role: "Operations & Support Specialist",
      period: "Dec 2018 – Mar 2020",
      location: "Gurgaon / Delhi-NCR, India",
      achievements: [
        "Managed end-to-end administration and system execution for enterprise agreements, ensuring adherence to compliance and institutional policy.",
        "Coordinated cross-functional communication among finance, operations, and sales teams to streamline contract approvals and project execution.",
        "Maintained documentation structures supporting audit readiness and institutional accountability."
      ]
    },
    {
      company: "UnitedLex BPO Pvt. Ltd.",
      role: "Process Associate",
      period: "Jul 2017 – Dec 2018",
      location: "Gurgaon / Delhi-NCR, India",
      achievements: [
        "Optimized operational workflows through structured task management and cross-departmental collaboration.",
        "Identified process bottlenecks and performed root cause analyses to implement targeted solutions, reducing turnaround time."
      ]
    }
  ],
  education: [
    {
      degree: "LLB (Bachelor of Laws)",
      institution: "Maharishi Dayanand University (MDU), Rohtak",
      year: "2017",
      details: "Formal legal qualification with specialization in corporate contracts, governance, statutory compliance, and statutory interpretation."
    },
    {
      degree: "Generative AI Mastermind Certification",
      institution: "Enterprise GenAI Program",
      year: "Jul 2026",
      details: "18-hour intensive certification covering enterprise GenAI applications, prompt engineering, and LLM workflow design."
    },
    {
      degree: "Microsoft & LinkedIn Certifications",
      institution: "Microsoft / LinkedIn Learning",
      year: "Jul 2026",
      details: "Career Essentials in Generative AI; Learning Microsoft 365 Copilot for Work; Ethics in the Age of Generative AI."
    }
  ],
  aiProjects: [
    {
      name: "Rural India AI",
      description: "Directed AI-assisted development of privacy-by-design applications aligning emerging technology with data minimization requirements and offline-first zero data transmission risk architecture.",
      techStack: ["Generative AI", "Offline-First Architecture", "Privacy-by-Design"],
      impact: "Demonstrated risk-mitigated innovation and zero data transmission safety for institutional compliance."
    },
    {
      name: "Akash Sharma Job Acquisition OS v2.0",
      description: "Full-stack career command center targeting ₹18–28 LPA leadership roles, featuring hard salary floor validation, 6-dimensional scoring, and ATS resume tailoring.",
      techStack: ["React 19", "Express.js", "Gemini 3.6 Flash API", "Tailwind CSS"],
      impact: "Automates job evaluation, ATS keyword alignment, and hiring manager outreach targeting ₹18–28 LPA leadership positions."
    }
  ]
};
