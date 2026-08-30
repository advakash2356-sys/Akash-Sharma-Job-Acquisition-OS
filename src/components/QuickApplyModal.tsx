import React, { useState, useEffect } from 'react';
import { JobRole, JobStatus } from '../types';
import { masterResume } from '../data/masterResume';
import { 
  Zap, 
  X, 
  Mail, 
  Copy, 
  Check, 
  Paperclip, 
  FileText, 
  ExternalLink, 
  Sparkles, 
  UserCheck, 
  Send, 
  Loader2,
  Eye,
  CheckCircle2,
  ShieldCheck,
  Download
} from 'lucide-react';
import { downloadResumeDoc, downloadCoverLetterDoc, downloadPDFResume, downloadPDFCoverLetter, executeAndLaunchGmail } from '../utils/documentExporter';

interface QuickApplyModalProps {
  job: JobRole;
  onClose: () => void;
  onUpdateJobStatus: (jobId: string, newStatus: JobStatus) => void;
}

export const QuickApplyModal: React.FC<QuickApplyModalProps> = ({
  job,
  onClose,
  onUpdateJobStatus,
}) => {
  const sanitizeCompany = (name: string) => name.replace(/[^a-zA-Z0-9]/g, '_');

  const [recruiterName, setRecruiterName] = useState(job.contactPerson?.name || 'Hiring Manager');
  const [recruiterTitle, setRecruiterTitle] = useState(job.contactPerson?.title || 'Talent Acquisition Lead');
  const [recruiterEmail, setRecruiterEmail] = useState(
    job.contactPerson?.email || `recruiter@${job.company.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`
  );

  const defaultSubject = `Application: ${job.title} – Akash Sharma (7+ Yrs Exp | Ex-Gartner | Legal Ops & AI Transformation)`;

  const buildDefaultBody = (name: string) => {
    return `Dear ${name || 'Hiring Team'},

I am writing to express my enthusiastic application for the ${job.title} position at ${job.company}.

Having spent 7+ years at Gartner leading Strategic Operations and Legal Operations Transformation, alongside holding an LLB degree and building hands-on Agentic AI and Copilot workflows, I am exceptionally well-aligned with ${job.company}'s objectives.

Key Impact Highlights Aligned with ${job.company}:
• 60% TAT Reduction: Spearheaded operational process overhauls and root-cause analysis (RCA) across multi-disciplinary global teams.
• Legal Ops & CLM Transformation: Managed CLM vendor implementations, SOP playbooks, and direct leadership of 6 FTEs.
• Agentic AI & Automation: Hands-on developer of custom AI agents, Copilot workflows, and Python automation tools (including live production booking engines).

Attached to this email, please find:
1. Tailored_Resume_Akash_Sharma_${sanitizeCompany(job.company)}.pdf
2. Executive_Cover_Letter_${sanitizeCompany(job.company)}.pdf

I welcome the opportunity to connect and discuss how my process transformation leadership and legal AI credentials can deliver immediate velocity to ${job.company}.

Best regards,

Akash Sharma
Strategic Operations & Process Transformation Leader | Agentic AI Specialist
Phone: +91 9818X XXXXX | Email: ${masterResume.contact.email}
LinkedIn: https://${masterResume.contact.linkedin}
Location: Delhi-NCR, India`;
  };

  const [subject, setSubject] = useState(defaultSubject);
  const [emailBody, setEmailBody] = useState(() => buildDefaultBody(recruiterName));
  const [coverLetter, setCoverLetter] = useState(job.coverLetter || '');
  const [tailoredResumeText, setTailoredResumeText] = useState('');
  
  const [loadingAi, setLoadingAi] = useState(false);
  const [copiedBody, setCopiedBody] = useState(false);
  const [copiedSubject, setCopiedSubject] = useState(false);
  const [copiedResume, setCopiedResume] = useState(false);
  const [copiedCover, setCopiedCover] = useState(false);
  const [appliedDone, setAppliedDone] = useState(job.status === 'Applied');
  const [activeTab, setActiveTab] = useState<'email' | 'resume' | 'cover'>('email');

  // Load tailored resume or cover letter on mount if missing
  useEffect(() => {
    let isMounted = true;
    const fetchInitialData = async () => {
      if (!coverLetter) {
        try {
          const res = await fetch('/api/generate-cover-letter', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: job.title,
              company: job.company,
              description: job.description
            })
          });
          const data = await res.json();
          if (isMounted && data.success && data.coverLetter) {
            setCoverLetter(data.coverLetter);
          }
        } catch (e) {
          console.error('Failed auto-fetching cover letter:', e);
        }
      }

      try {
        const res = await fetch('/api/tailor-resume', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: job.title,
            company: job.company,
            description: job.description
          })
        });
        const data = await res.json();
        if (isMounted && data.success && data.tailoredResume?.fullFormattedResumeText) {
          setTailoredResumeText(data.tailoredResume.fullFormattedResumeText);
        }
      } catch (e) {
        console.error('Failed auto-fetching tailored resume:', e);
      }
    };

    fetchInitialData();
    return () => { isMounted = false; };
  }, [job]);

  const handleRefineWithAi = async () => {
    setLoadingAi(true);
    try {
      const res = await fetch('/api/generate-outreach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: job.title,
          company: job.company,
          description: job.description,
          contactName: recruiterName,
          contactTitle: recruiterTitle
        })
      });
      const data = await res.json();
      if (data.success && data.outreach) {
        if (data.outreach.emailSubject) setSubject(data.outreach.emailSubject);
        if (data.outreach.emailBody) setEmailBody(data.outreach.emailBody);
      }
    } catch (e) {
      console.error('Error refining pitch:', e);
    } finally {
      setLoadingAi(false);
    }
  };

  const handleOpenMailClient = () => {
    const mailtoUrl = `mailto:${encodeURIComponent(recruiterEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;
    window.open(mailtoUrl, '_blank');
  };

  const handleCopy = (text: string, setFn: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setFn(true);
    setTimeout(() => setFn(false), 2000);
  };

  const handleMarkApplied = () => {
    onUpdateJobStatus(job.id, 'Applied');
    setAppliedDone(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const resumeFileName = `Akash_Sharma_Tailored_Resume_${sanitizeCompany(job.company)}.pdf`;
  const coverFileName = `Akash_Sharma_Cover_Letter_${sanitizeCompany(job.company)}.pdf`;

  return (
    <div className="fixed inset-0 bg-[#0a0a0b]/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-[#0d0d0f] border border-[#1f1f23] rounded-lg max-w-4xl w-full p-5 sm:p-6 space-y-5 shadow-2xl my-auto max-h-[92vh] flex flex-col">
        
        {/* Header Bar */}
        <div className="flex items-start justify-between border-b border-[#1f1f23] pb-4 shrink-0">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-emerald-500/10 text-green-400 font-mono font-bold text-[10px] px-2.5 py-0.5 rounded border border-green-500/30 flex items-center gap-1 uppercase tracking-wider">
                <Zap className="w-3.5 h-3.5 fill-current text-green-400" />
                Quick Apply Direct Pitch
              </span>
              <span className="bg-blue-600/10 text-blue-400 font-mono font-bold text-[10px] px-2.5 py-0.5 rounded border border-blue-500/30">
                Score: {job.scores.totalScore}/100
              </span>
              <span className="bg-[#1a1a1c] text-[#e0e0e0] font-mono text-[10px] px-2 py-0.5 rounded border border-[#2d2d30]">
                ₹{job.ctcMinLpa}–{job.ctcMaxLpa} LPA CTC
              </span>
            </div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2 mt-1">
              Apply to {job.title}
            </h2>
            <p className="text-xs text-[#a0a0aa]">
              {job.company} • {job.location} ({job.workMode})
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-[#6b6b75] hover:text-white p-1 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Recruiter Details Row */}
        <div className="bg-[#151518] p-3.5 rounded border border-[#232328] space-y-3 shrink-0">
          <div className="flex items-center justify-between border-b border-[#232328] pb-1.5">
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5" />
              Recruiter / Hiring Contact Information
            </span>
            <button
              onClick={handleRefineWithAi}
              disabled={loadingAi}
              className="text-[10px] text-blue-400 hover:text-blue-300 font-semibold uppercase tracking-wider flex items-center gap-1 cursor-pointer disabled:opacity-50"
            >
              {loadingAi ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3 text-amber-400" />}
              AI Re-Generate Pitch
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-[#a0a0aa] text-[10px] font-semibold uppercase tracking-wider mb-1">
                Contact Name
              </label>
              <input
                type="text"
                value={recruiterName}
                onChange={(e) => {
                  setRecruiterName(e.target.value);
                  setEmailBody(buildDefaultBody(e.target.value));
                }}
                placeholder="e.g. Siddharth Verma"
                className="w-full bg-[#0a0a0b] text-white p-2 rounded border border-[#232328] focus:outline-none focus:border-blue-500 font-medium text-xs"
              />
            </div>

            <div>
              <label className="block text-[#a0a0aa] text-[10px] font-semibold uppercase tracking-wider mb-1">
                Role / Title
              </label>
              <input
                type="text"
                value={recruiterTitle}
                onChange={(e) => setRecruiterTitle(e.target.value)}
                placeholder="e.g. Director - Legal Ops"
                className="w-full bg-[#0a0a0b] text-white p-2 rounded border border-[#232328] focus:outline-none focus:border-blue-500 font-medium text-xs"
              />
            </div>

            <div>
              <label className="block text-[#a0a0aa] text-[10px] font-semibold uppercase tracking-wider mb-1">
                Recruiter Email Address
              </label>
              <input
                type="email"
                value={recruiterEmail}
                onChange={(e) => setRecruiterEmail(e.target.value)}
                placeholder="e.g. sverma@deloitte.com"
                className="w-full bg-[#0a0a0b] text-white p-2 rounded border border-[#232328] focus:outline-none focus:border-blue-500 font-mono text-xs"
              />
            </div>
          </div>
        </div>

        {/* Tab Switcher for Previewing Draft / Resume / Cover Letter */}
        <div className="flex items-center gap-2 border-b border-[#1f1f23] pb-2 shrink-0">
          <button
            onClick={() => setActiveTab('email')}
            className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${
              activeTab === 'email'
                ? 'bg-blue-600 text-white'
                : 'text-[#a0a0aa] hover:text-white bg-[#151518]'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            Email Draft
          </button>

          <button
            onClick={() => setActiveTab('resume')}
            className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${
              activeTab === 'resume'
                ? 'bg-blue-600 text-white'
                : 'text-[#a0a0aa] hover:text-white bg-[#151518]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Tailored Resume
          </button>

          <button
            onClick={() => setActiveTab('cover')}
            className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${
              activeTab === 'cover'
                ? 'bg-blue-600 text-white'
                : 'text-[#a0a0aa] hover:text-white bg-[#151518]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Cover Letter
          </button>
        </div>

        {/* Main Content Area (Scrollable) */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {activeTab === 'email' && (
            <div className="space-y-3">
              {/* Subject Line */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[#a0a0aa] text-[10px] font-semibold uppercase tracking-wider block">
                    Subject Line
                  </label>
                  <button
                    onClick={() => handleCopy(subject, setCopiedSubject)}
                    className="text-[10px] text-blue-400 hover:underline flex items-center gap-1"
                  >
                    {copiedSubject ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                    {copiedSubject ? 'Copied Subject' : 'Copy Subject'}
                  </button>
                </div>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-[#0a0a0b] text-white p-2.5 rounded border border-[#232328] focus:outline-none focus:border-blue-500 font-semibold text-xs"
                />
              </div>

              {/* Email Body */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[#a0a0aa] text-[10px] font-semibold uppercase tracking-wider block">
                    Email Pitch Text
                  </label>
                  <button
                    onClick={() => handleCopy(emailBody, setCopiedBody)}
                    className="text-[10px] text-blue-400 hover:underline flex items-center gap-1"
                  >
                    {copiedBody ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                    {copiedBody ? 'Copied Body' : 'Copy Body Text'}
                  </button>
                </div>
                <textarea
                  rows={10}
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  className="w-full bg-[#0a0a0b] text-[#e0e0e0] text-xs p-3 rounded border border-[#232328] font-mono leading-relaxed focus:outline-none focus:border-blue-500"
                ></textarea>
              </div>

              {/* Attachments Display Bar */}
              <div className="bg-[#151518] border border-[#232328] rounded p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#a0a0aa] uppercase tracking-wider flex items-center gap-1.5">
                    <Paperclip className="w-3.5 h-3.5 text-blue-400" />
                    Executable Application Documents Package:
                  </span>
                  <span className="text-[10px] text-green-400 font-mono font-bold">Ready to Download & Attach</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {/* Attachment 1 */}
                  <div className="bg-[#0a0a0b] p-2.5 rounded border border-[#232328] flex items-center justify-between">
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="w-4 h-4 text-green-400 shrink-0" />
                      <div className="truncate">
                        <span className="text-white font-medium block truncate text-[11px]">{resumeFileName}</span>
                        <span className="text-[10px] text-[#6b6b75] block">Tailored ATS Resume (v2.0)</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      <button
                        onClick={() => downloadPDFResume(job.title, job.company)}
                        className="bg-green-600 hover:bg-green-500 text-white px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all shadow-sm"
                        title="Export printable PDF resume"
                      >
                        <FileText className="w-3 h-3 text-white" />
                        PDF
                      </button>
                      <button
                        onClick={() => downloadResumeDoc(job.title, job.company)}
                        className="bg-green-600/20 hover:bg-green-600/40 text-green-300 border border-green-500/30 px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all"
                        title="Download executable resume text file"
                      >
                        <Download className="w-3 h-3 text-green-400" />
                        TXT
                      </button>
                      <button
                        onClick={() => setActiveTab('resume')}
                        className="text-[10px] text-blue-400 hover:underline uppercase font-semibold ml-1"
                      >
                        View
                      </button>
                    </div>
                  </div>

                  {/* Attachment 2 */}
                  <div className="bg-[#0a0a0b] p-2.5 rounded border border-[#232328] flex items-center justify-between">
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
                      <div className="truncate">
                        <span className="text-white font-medium block truncate text-[11px]">{coverFileName}</span>
                        <span className="text-[10px] text-[#6b6b75] block">Executive Cover Letter</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      <button
                        onClick={() => downloadPDFCoverLetter(job.title, job.company, job.contactPerson?.name)}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all shadow-sm"
                        title="Export printable PDF cover letter"
                      >
                        <FileText className="w-3 h-3 text-white" />
                        PDF
                      </button>
                      <button
                        onClick={() => downloadCoverLetterDoc(job.title, job.company, job.contactPerson?.name)}
                        className="bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all"
                        title="Download executable cover letter text file"
                      >
                        <Download className="w-3 h-3 text-indigo-400" />
                        TXT
                      </button>
                      <button
                        onClick={() => setActiveTab('cover')}
                        className="text-[10px] text-blue-400 hover:underline uppercase font-semibold ml-1"
                      >
                        View
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* External Auto-Apply Hyperlink Launch Bar */}
              <div className="bg-[#151518] border border-[#232328] rounded p-3 space-y-2">
                <span className="text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                  Direct Execution & One-Click Portals:
                </span>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <button
                    onClick={() => executeAndLaunchGmail({
                      toEmail: job.contactPerson?.email || 'hr@' + job.company.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com',
                      jobTitle: job.title,
                      companyName: job.company,
                      contactName: job.contactPerson?.name,
                      customBody: emailBody
                    })}
                    className="bg-red-600 hover:bg-red-500 text-white border border-red-400 px-3 py-1.5 rounded font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                    title="Downloads Resume & Cover Letter files, copies text to clipboard, and opens Gmail Compose with full pre-filled text"
                  >
                    <Mail className="w-3.5 h-3.5 text-white" />
                    Download & Open Gmail Compose
                  </button>

                  <a
                    href={`https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(job.title + ' ' + job.company)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#0077b5]/20 hover:bg-[#0077b5]/40 text-[#38bdf8] border border-[#0077b5]/40 px-3 py-1.5 rounded font-bold text-xs flex items-center gap-1.5 transition-all"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Open LinkedIn Jobs
                  </a>

                  <a
                    href={`https://www.naukri.com/${encodeURIComponent(job.title.toLowerCase().replace(/[^a-z0-9]/g, '-'))}-jobs?k=${encodeURIComponent(job.title + ' ' + job.company)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#ff7555]/20 hover:bg-[#ff7555]/40 text-[#ff7555] border border-[#ff7555]/40 px-3 py-1.5 rounded font-bold text-xs flex items-center gap-1.5 transition-all"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Open Naukri Portal
                  </a>

                  <a
                    href={`https://www.indeed.com/jobs?q=${encodeURIComponent(job.title + ' ' + job.company)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#2164f3]/20 hover:bg-[#2164f3]/40 text-[#60a5fa] border border-[#2164f3]/40 px-3 py-1.5 rounded font-bold text-xs flex items-center gap-1.5 transition-all"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Open Indeed Search
                  </a>

                  {job.jobUrl && (
                    <a
                      href={job.jobUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-green-500/20 hover:bg-green-500/40 text-green-300 border border-green-500/40 px-3 py-1.5 rounded font-bold text-xs flex items-center gap-1.5 transition-all"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Direct Job URL
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'resume' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-[#232328] pb-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-green-400" />
                  Tailored Resume Preview ({job.company})
                </span>
                <button
                  onClick={() => handleCopy(tailoredResumeText || masterResume.executiveSummary, setCopiedResume)}
                  className="bg-[#1a1a1c] hover:bg-[#232328] text-white border border-[#2d2d30] font-semibold px-3 py-1 rounded text-xs flex items-center gap-1"
                >
                  {copiedResume ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedResume ? 'Copied Resume' : 'Copy Resume Text'}
                </button>
              </div>

              <pre className="bg-[#0a0a0b] p-4 rounded text-[#e0e0e0] font-mono text-xs whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto border border-[#232328]">
                {tailoredResumeText || `AKASH SHARMA
Strategic Operations & Process Transformation Leader | Legal Ops & Agentic AI
Email: ${masterResume.contact.email} | Phone: ${masterResume.contact.phone}

EXECUTIVE SUMMARY
${masterResume.executiveSummary}

CORE COMPETENCIES & KEY METRICS
• TAT Reduction: 60% end-to-end reduction via structured RCA
• Team Leadership: Managed 6 FTE direct reports
• Legal Ops & CLM: 5+ SOP Playbooks, LLB Degree, CLM Vendor Rollouts
• Agentic AI & Copilot: Custom Python AI tools, Copilot Prompt Architecture`}
              </pre>
            </div>
          )}

          {activeTab === 'cover' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-[#232328] pb-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-indigo-400" />
                  Executive Cover Letter Preview ({job.company})
                </span>
                <button
                  onClick={() => handleCopy(coverLetter, setCopiedCover)}
                  className="bg-[#1a1a1c] hover:bg-[#232328] text-white border border-[#2d2d30] font-semibold px-3 py-1 rounded text-xs flex items-center gap-1"
                >
                  {copiedCover ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedCover ? 'Copied Cover Letter' : 'Copy Cover Letter'}
                </button>
              </div>

              <pre className="bg-[#0a0a0b] p-4 rounded text-[#e0e0e0] font-mono text-xs whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto border border-[#232328]">
                {coverLetter || `Dear Hiring Manager,

I am writing to apply for the ${job.title} role at ${job.company}.

With over 7 years at Gartner leading process transformation and legal operations, coupled with formal legal credentials (LLB) and hands-on Agentic AI development experience, I am confident in my ability to drive significant operational performance for ${job.company}.

Looking forward to connecting soon.

Sincerely,
Akash Sharma`}
              </pre>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-[#1f1f23] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] text-[#a0a0aa] flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-green-400 shrink-0" />
            <span>Targeting ≥18 LPA CTC • Recruiter Email Pre-filled</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {appliedDone ? (
              <div className="bg-green-500/20 text-green-400 border border-green-500/40 px-4 py-2 rounded text-xs font-bold flex items-center gap-2 uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4" />
                Status Updated: APPLIED!
              </div>
            ) : (
              <>
                <button
                  onClick={handleOpenMailClient}
                  className="flex-1 sm:flex-initial bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-blue-900/30 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  Launch Mail Client (mailto:)
                </button>

                <button
                  onClick={handleMarkApplied}
                  className="flex-1 sm:flex-initial bg-green-600 hover:bg-green-500 text-white font-bold px-4 py-2 rounded text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-green-900/30 cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Mark as Applied
                </button>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
