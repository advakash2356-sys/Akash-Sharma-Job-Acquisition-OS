// Utility to generate, download, copy, and export executable Tailored Resumes and Cover Letters in PDF & Text formats

export function getFormattedTailoredResumeText(jobTitle: string, companyName: string, customSummary?: string): string {
  return `================================================================================
AKASH SHARMA — TAILORED EXECUTIVE RESUME
Target Role: ${jobTitle} at ${companyName}
Email: Adv.Akash2356@gmail.com | Phone: +91 98765 43210
LinkedIn: https://linkedin.com/in/akash-sharma-gartner | Location: Gurgaon / Delhi NCR
================================================================================

[20-SECOND RECRUITER EYE-SCAN SUMMARY]
• Strategic Operations & CLM Leader with 7+ years at Gartner driving global operational transformations.
• Holds an LLB degree with deep expertise in Contract Lifecycle Management (CLM), vendor governance, and legal risk mitigation.
• Proven track record of reducing contract review Turnaround Time (TAT) by 60% and achieving 99.4% SLA adherence across 250+ global stakeholders.
• Hands-on expertise in Python process automation, Microsoft Copilot integration, and LLM prompt engineering for contract workflows.
• Direct leadership of 6 FTE team members, managing resource allocation, root cause analysis (RCA), and executive reporting.

${customSummary ? `[ROLE SPECIFIC ALIGNMENT]\n${customSummary}\n` : ''}
[PROFESSIONAL EXPERIENCE]
Gartner | Strategic Operations Lead & Legal Ops Specialist
Gurgaon, HR | June 2019 – Present (7+ Years)
• Led end-to-end CLM workflow modernization across 250+ enterprise stakeholders, achieving a 60% reduction in contract review TAT.
• Direct management of a 6 FTE operations team, maintaining 99.4% SLA compliance for high-value commercial agreements.
• Designed and deployed automated Python LLM prompt scripts and Microsoft Copilot tools to streamline contract drafting and risk scoring.
• Authored standardized legal operations playbooks and conducted training sessions for over 250 global business units.
• Spearheaded Root Cause Analysis (RCA) initiatives that eliminated recurring workflow bottlenecks and saved over $180K annually.

[EDUCATION & CREDENTIALS]
• Bachelor of Laws (LLB) — Legal & Regulatory Compliance Foundation
• Continuous Learning: Python Automation, LLM Prompt Engineering, Enterprise CLM Architectures

[CORE COMPETENCIES]
• Strategic Operations & Process Engineering
• Contract Lifecycle Management (CLM) & Playbooks
• Turnaround Time (TAT) Optimization & RCA
• Direct Team Leadership (6 FTEs) & SLA Governance
• Python Automation, Microsoft Copilot, Agentic AI Workflows
================================================================================`;
}

export function getFormattedCoverLetterText(jobTitle: string, companyName: string, contactName?: string): string {
  return `Akash Sharma
Gurgaon, Haryana, India
Email: Adv.Akash2356@gmail.com | Phone: +91 98765 43210
LinkedIn: https://linkedin.com/in/akash-sharma-gartner

Date: July 28, 2026

To: ${contactName || 'Hiring Manager / Talent Acquisition Team'}
${companyName}

RE: Application for ${jobTitle}

Dear ${contactName || 'Hiring Manager'},

I am writing to express my strong interest in the ${jobTitle} position at ${companyName}. With over 7 years of strategic operations and legal workflow leadership at Gartner, I have consistently delivered high-impact operational transformations that directly solve the core challenges outlined for this role.

In my current role at Gartner, I lead strategic operations and contract lifecycle management (CLM) across 250+ global stakeholders. Key achievements include:
1. Reduced Contract Review Turnaround Time (TAT) by 60% through Root Cause Analysis (RCA) and workflow engineering.
2. Directed a high-performing team of 6 FTEs, maintaining 99.4% SLA adherence across complex global service agreements.
3. Pioneered AI-enabled automation by building custom Python LLM prompt tools and Microsoft Copilot integrations for contract risk evaluation.

What excites me about ${companyName} is your commitment to operational excellence. Combining my LLB legal rigor, 7+ years of Gartner operations leadership, and modern AI process automation expertise, I am equipped to drive immediate value and eliminate operational friction for your team from Day 1.

I have attached my tailored resume for your review. I would welcome the opportunity to discuss how my background aligns with ${companyName}'s strategic priorities.

Sincerely,

Akash Sharma
Adv.Akash2356@gmail.com | +91 98765 43210
LinkedIn: https://linkedin.com/in/akash-sharma-gartner`;
}

export function downloadFile(filename: string, content: string, mimeType = 'text/plain;charset=utf-8') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadResumeDoc(jobTitle: string, companyName: string, customSummary?: string) {
  const text = getFormattedTailoredResumeText(jobTitle, companyName, customSummary);
  const safeCompany = companyName.replace(/[^a-zA-Z0-9]/g, '_');
  downloadFile(`Akash_Sharma_Tailored_Resume_${safeCompany}.txt`, text);
}

export function downloadCoverLetterDoc(jobTitle: string, companyName: string, contactName?: string) {
  const text = getFormattedCoverLetterText(jobTitle, companyName, contactName);
  const safeCompany = companyName.replace(/[^a-zA-Z0-9]/g, '_');
  downloadFile(`Akash_Sharma_Cover_Letter_${safeCompany}.txt`, text);
}

// Generate Printable Executive PDF Window
export function generatePDFDocument(title: string, subtitle: string, htmlContent: string) {
  const printWindow = window.open('', '_blank', 'width=900,height=1100');
  if (!printWindow) return;

  const fullHtml = `
<!DOCTYPE html>
<html>
<head>
  <title>${title} - ${subtitle}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800&display=swap');
    body {
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      margin: 0;
      padding: 40px;
      color: #0f172a;
      background: #ffffff;
      line-height: 1.5;
    }
    .header {
      border-bottom: 3px solid #0f172a;
      padding-bottom: 16px;
      margin-bottom: 24px;
    }
    .name {
      font-size: 26px;
      font-weight: 800;
      letter-spacing: -0.5px;
      color: #0f172a;
      margin: 0 0 4px 0;
      text-transform: uppercase;
    }
    .contact-bar {
      font-size: 11px;
      color: #475569;
      font-weight: 600;
    }
    .eye-scan-box {
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-left: 4px solid #0284c7;
      padding: 12px 16px;
      border-radius: 4px;
      margin-bottom: 20px;
    }
    .eye-scan-title {
      font-size: 11px;
      font-weight: 800;
      color: #0369a1;
      text-transform: uppercase;
      margin-bottom: 6px;
      letter-spacing: 0.5px;
    }
    .section-title {
      font-size: 12px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #0f172a;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 4px;
      margin-top: 20px;
      margin-bottom: 10px;
    }
    ul {
      margin: 0 0 12px 0;
      padding-left: 18px;
    }
    li {
      font-size: 12px;
      color: #334155;
      margin-bottom: 6px;
    }
    .job-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      font-weight: 700;
      font-size: 13px;
      margin-bottom: 4px;
    }
    .job-title {
      color: #0284c7;
    }
    .dates {
      font-size: 11px;
      color: #64748b;
      font-weight: 600;
    }
    p {
      font-size: 12px;
      color: #334155;
      margin-bottom: 12px;
    }
    @media print {
      body { padding: 20px; }
      @page { margin: 1cm; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1 class="name">Akash Sharma</h1>
    <div class="contact-bar">
      Target Role: ${subtitle} &nbsp;|&nbsp; Gurgaon, India &nbsp;|&nbsp; Adv.Akash2356@gmail.com &nbsp;|&nbsp; +91 98765 43210 &nbsp;|&nbsp; linkedin.com/in/akash-sharma-gartner
    </div>
  </div>
  ${htmlContent}
  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 300);
    };
  </script>
</body>
</html>
  `;

  printWindow.document.write(fullHtml);
  printWindow.document.close();
}

export function downloadPDFResume(jobTitle: string, companyName: string, customSummary?: string) {
  const content = `
    <div class="eye-scan-box">
      <div class="eye-scan-title">20-Second Recruiter Eye-Scan Summary</div>
      <ul>
        <li><strong>Strategic Operations & CLM Leader:</strong> 7+ years at Gartner directing enterprise workflow modernizations and legal ops pipelines.</li>
        <li><strong>LLB Qualification:</strong> Combines formal legal degree with high-tempo process engineering, contract playbooks, and vendor governance.</li>
        <li><strong>60% TAT Reduction:</strong> Proven track record of reducing review Turnaround Time from 14 days to 5.6 days across 250+ global stakeholders.</li>
        <li><strong>AI Process Automation:</strong> Engineered custom Python LLM prompt scripts and Microsoft Copilot tools for automated contract risk scoring.</li>
        <li><strong>6 FTE Direct Leadership:</strong> Directed direct report team managing resource allocation, root cause analysis (RCA), and executive reporting.</li>
      </ul>
    </div>

    ${customSummary ? `
      <div class="section-title">Tailored Role Alignment</div>
      <p>${customSummary}</p>
    ` : ''}

    <div class="section-title">Professional Experience</div>
    <div class="job-header">
      <div>Gartner &nbsp;—&nbsp; <span class="job-title">Strategic Operations Lead & Legal Ops Specialist</span></div>
      <div class="dates">June 2019 – Present (7+ Years) | Gurgaon, HR</div>
    </div>
    <ul>
      <li>Led end-to-end CLM workflow modernization across 250+ enterprise stakeholders, achieving a sustained 60% reduction in contract turnaround time (TAT).</li>
      <li>Directly managed a team of 6 FTE operations specialists, maintaining 99.4% SLA adherence for high-value vendor and client agreements.</li>
      <li>Pioneered Python LLM prompt scripts and Microsoft Copilot integrations to automate initial NDA clause screening and risk evaluation.</li>
      <li>Authored standardized legal operations playbooks and conducted enablement sessions for over 250 global business unit leaders.</li>
      <li>Spearheaded Root Cause Analysis (RCA) initiatives that eliminated recurring workflow friction and saved over $180K annually.</li>
    </ul>

    <div class="section-title">Education & Credentials</div>
    <ul>
      <li><strong>Bachelor of Laws (LLB):</strong> Foundation in Legal & Regulatory Compliance Frameworks.</li>
      <li><strong>Continuous Professional Development:</strong> Enterprise CLM Architectures, Python Automation, LLM Prompt Engineering.</li>
    </ul>

    <div class="section-title">Core Competencies</div>
    <p>Strategic Operations Engineering &nbsp;•&nbsp; Contract Lifecycle Management (CLM) &nbsp;•&nbsp; Turnaround Time (TAT) Optimization &nbsp;•&nbsp; Root Cause Analysis (RCA) &nbsp;•&nbsp; 6 FTE Direct Leadership &nbsp;•&nbsp; Python & Microsoft Copilot Automation &nbsp;•&nbsp; SLA Governance</p>
  `;

  generatePDFDocument(`Akash_Sharma_Tailored_Resume_${companyName}`, `${jobTitle} at ${companyName}`, content);
}

export function downloadPDFCoverLetter(jobTitle: string, companyName: string, contactName?: string) {
  const content = `
    <p style="font-size: 11px; color: #64748b; font-weight: 600;">Date: July 28, 2026</p>
    <p><strong>To: ${contactName || 'Hiring Manager / Talent Acquisition Team'}</strong><br/>${companyName}</p>
    
    <p><strong>RE: Application for ${jobTitle}</strong></p>

    <p>Dear ${contactName || 'Hiring Manager'},</p>

    <p>I am writing to express my strong interest in the <strong>${jobTitle}</strong> position at <strong>${companyName}</strong>. With over 7 years of strategic operations and legal workflow leadership at Gartner, I have consistently delivered high-impact operational transformations that directly solve the core challenges outlined for this role.</p>

    <p>In my current role at Gartner, I lead strategic operations and contract lifecycle management (CLM) across 250+ global stakeholders. Key achievements include:</p>

    <ul>
      <li><strong>60% Turnaround Time Reduction:</strong> Reduced Contract Review TAT through Root Cause Analysis (RCA) and workflow engineering.</li>
      <li><strong>6 FTE Direct Leadership:</strong> Directed a high-performing operations team maintaining 99.4% SLA adherence across global service agreements.</li>
      <li><strong>AI Process Automation:</strong> Built custom Python LLM prompt tools and Microsoft Copilot integrations for contract risk evaluation.</li>
    </ul>

    <p>What excites me about <strong>${companyName}</strong> is your commitment to operational excellence. Combining my LLB legal rigor, 7+ years of Gartner operations leadership, and modern AI process automation expertise, I am equipped to drive immediate value and eliminate operational friction for your team from Day 1.</p>

    <p>I have attached my tailored resume for your review. I would welcome the opportunity to discuss how my background aligns with ${companyName}'s strategic priorities.</p>

    <br/>
    <p>Sincerely,</p>
    <p><strong>Akash Sharma</strong><br/>Adv.Akash2356@gmail.com | +91 98765 43210<br/>linkedin.com/in/akash-sharma-gartner</p>
  `;

  generatePDFDocument(`Akash_Sharma_Cover_Letter_${companyName}`, `Cover Letter for ${companyName}`, content);
}

export async function executeAndLaunchGmail(params: {
  toEmail: string;
  jobTitle: string;
  companyName: string;
  contactName?: string;
  customBody?: string;
  customSummary?: string;
  onSuccessToast?: (msg: string) => void;
}) {
  const { toEmail, jobTitle, companyName, contactName, customBody, customSummary, onSuccessToast } = params;

  // 1. Generate text & text file downloads
  const resumeText = getFormattedTailoredResumeText(jobTitle, companyName, customSummary);
  const coverText = getFormattedCoverLetterText(jobTitle, companyName, contactName);

  // 2. Download files automatically so candidate has them ready to attach!
  downloadResumeDoc(jobTitle, companyName, customSummary);
  setTimeout(() => {
    downloadCoverLetterDoc(jobTitle, companyName, contactName);
  }, 300);

  // 3. Copy cover letter / application body to clipboard
  const fullBodyToCopy = customBody || coverText;
  try {
    await navigator.clipboard.writeText(fullBodyToCopy);
  } catch (e) {
    console.error('Clipboard write failed:', e);
  }

  // 4. Construct Gmail URL with full pre-filled email body including cover letter text
  const subject = `Application for ${jobTitle} - Akash Sharma (7+ Yrs Gartner Strategic Ops & CLM Lead)`;
  
  const gmailBody = `${fullBodyToCopy}\n\n----------------------------------------\n[TAILORED RESUME PREVIEW ATTACHED BELOW & DOWNLOADED TO YOUR COMPUTER]\n\n${resumeText}`;

  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(toEmail)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(gmailBody)}`;

  // 5. Open Gmail in new tab
  window.open(gmailUrl, '_blank', 'noopener,noreferrer');

  if (onSuccessToast) {
    onSuccessToast(`✅ Resume & Cover Letter files generated! Application text copied to clipboard & Gmail launched.`);
  }
}

export function downloadEmlFile(params: {
  toEmail: string;
  fromEmail?: string;
  jobTitle: string;
  companyName: string;
  contactName?: string;
  customSummary?: string;
}) {
  const { toEmail, fromEmail = 'Adv.Akash2356@gmail.com', jobTitle, companyName, contactName, customSummary } = params;
  const coverText = getFormattedCoverLetterText(jobTitle, companyName, contactName);
  const resumeText = getFormattedTailoredResumeText(jobTitle, companyName, customSummary);
  const subject = `Application for ${jobTitle} - Akash Sharma (7+ Yrs Gartner Ops & LLB)`;

  const emlContent = `X-Unsent: 1
From: Akash Sharma <${fromEmail}>
To: ${toEmail}
Subject: ${subject}
Date: ${new Date().toUTCString()}
MIME-Version: 1.0
Content-Type: text/plain; charset=UTF-8

Dear ${contactName || 'Hiring Manager'},

${coverText}

================================================================
TAILORED ATS RESUME SUMMARY & VERIFIED GARTNER EXPERTISE
================================================================

${resumeText}
`;

  const blob = new Blob([emlContent], { type: 'message/rfc822' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Draft_Application_${companyName.replace(/[^a-zA-Z0-9]/g, '_')}.eml`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Quick Access Platform Deep Hyperlinks
export function getPlatformSearchUrls(jobTitle: string, companyName: string) {
  const query = encodeURIComponent(`${jobTitle} ${companyName}`);
  return {
    linkedIn: `https://www.linkedin.com/jobs/search/?keywords=${query}`,
    naukri: `https://www.naukri.com/jobs-in-india?k=${query}`,
    indeed: `https://www.indeed.com/jobs?q=${query}`,
    glassdoor: `https://www.glassdoor.com/Job/jobs.htm?sc.keyword=${query}`
  };
}
