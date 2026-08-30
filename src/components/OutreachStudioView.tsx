import React, { useState } from 'react';
import { JobRole } from '../types';
import { 
  Send, 
  Sparkles, 
  Mail, 
  Linkedin, 
  UserCheck, 
  Copy, 
  Check, 
  Loader2, 
  Clock, 
  AlertCircle, 
  Calendar,
  MessageSquare,
  Library,
  Download,
  FileText
} from 'lucide-react';
import { TemplateLibraryModal } from './TemplateLibraryModal';
import { 
  downloadResumeDoc, 
  downloadCoverLetterDoc, 
  downloadPDFResume, 
  downloadPDFCoverLetter, 
  executeAndLaunchGmail, 
  getPlatformSearchUrls 
} from '../utils/documentExporter';

interface OutreachStudioViewProps {
  jobs: JobRole[];
  selectedJob: JobRole | null;
  onSelectJob: (job: JobRole) => void;
}

export const OutreachStudioView: React.FC<OutreachStudioViewProps> = ({
  jobs,
  selectedJob,
  onSelectJob
}) => {
  const [loading, setLoading] = useState(false);
  const [contactName, setContactName] = useState(selectedJob?.contactPerson?.name || '');
  const [contactTitle, setContactTitle] = useState(selectedJob?.contactPerson?.title || 'Hiring Manager');
  const [outreachData, setOutreachData] = useState<any | null>(null);

  const [isTemplateLibraryOpen, setIsTemplateLibraryOpen] = useState(false);

  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedInMail, setCopiedInMail] = useState(false);
  const [copiedAlumni, setCopiedAlumni] = useState(false);

  const eligibleJobs = jobs.filter(j => j.scores.ctcFloorPassed);

  const handleGenerateOutreach = async () => {
    if (!selectedJob) return;
    setLoading(true);
    try {
      const response = await fetch('/api/generate-outreach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: selectedJob.title,
          company: selectedJob.company,
          description: selectedJob.description,
          contactName,
          contactTitle
        })
      });
      const data = await response.json();
      if (data.success && data.outreach) {
        setOutreachData(data.outreach);
      }
    } catch (error) {
      console.error('Outreach generation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, setCopied: React.Dispatch<React.SetStateAction<boolean>>) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApplyTemplateFromLibrary = (subject: string, body: string) => {
    setOutreachData({
      emailSubject: subject,
      emailBody: body,
      linkedinInMail: body.slice(0, 300),
      gartnerAlumniMessage: body
    });
  };

  return (
    <div className="space-y-6">
      {/* Role Selection Header */}
      <div className="bg-[#0d0d0f] border border-[#1f1f23] rounded p-5 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1">
            <Send className="w-3.5 h-3.5" />
            Hiring Manager & Recruiter Outreach Studio
          </span>
          <h2 className="text-base font-bold text-white uppercase tracking-wider">
            Cold Email, InMail & Gartner Alumni Warm Outreach Generator
          </h2>
        </div>

        {/* Job Selector & Template Library Button */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => setIsTemplateLibraryOpen(true)}
            className="w-full sm:w-auto bg-[#151518] hover:bg-[#1f1f23] text-white border border-[#232328] font-bold text-xs uppercase tracking-wider px-3.5 py-2.5 rounded flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
          >
            <Library className="w-4 h-4 text-blue-400" />
            Template Library
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <label className="text-xs text-[#a0a0aa] font-medium whitespace-nowrap">Target Role:</label>
            <select
              value={selectedJob?.id || ''}
              onChange={(e) => {
                const found = jobs.find(j => j.id === e.target.value);
                if (found) {
                  onSelectJob(found);
                  setContactName(found.contactPerson?.name || '');
                  setContactTitle(found.contactPerson?.title || 'Hiring Manager');
                  setOutreachData(null);
                }
              }}
              className="w-full md:w-72 bg-[#0a0a0b] border border-[#232328] text-white text-xs rounded p-2.5 focus:outline-none focus:border-blue-500 font-semibold"
            >
              <option value="" disabled>Select target role...</option>
              {eligibleJobs.map(job => (
                <option key={job.id} value={job.id}>
                  [{job.scores.totalScore}/100] {job.title} - {job.company}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {!selectedJob ? (
        <div className="bg-[#0d0d0f] border border-[#1f1f23] rounded p-12 text-center text-[#6b6b75] text-xs">
          Select a role from your pipeline above to configure contact details and generate high-converting outreach messages.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Target Contact Form */}
          <div className="bg-[#0d0d0f] border border-[#1f1f23] rounded p-5 shadow-md space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-[#1f1f23] pb-2">
              <UserCheck className="w-4 h-4 text-blue-400" />
              Target Decision Maker Details for {selectedJob.company}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-[#a0a0aa] font-semibold uppercase tracking-wider text-[10px] mb-1">Contact Name</label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="e.g. Siddharth Verma"
                  className="w-full bg-[#0a0a0b] text-white p-2.5 rounded border border-[#232328] focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[#a0a0aa] font-semibold uppercase tracking-wider text-[10px] mb-1">Title / Designation</label>
                <input
                  type="text"
                  value={contactTitle}
                  onChange={(e) => setContactTitle(e.target.value)}
                  placeholder="e.g. Director - Legal Ops / Talent Partner"
                  className="w-full bg-[#0a0a0b] text-white p-2.5 rounded border border-[#232328] focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleGenerateOutreach}
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase tracking-wider p-2.5 rounded text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-900/30 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating Messages...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generate Outreach Package
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {!outreachData ? (
            <div className="bg-[#0d0d0f] border border-[#1f1f23] rounded p-10 text-center text-[#6b6b75] text-xs">
              Click <strong>"Generate Outreach Package"</strong> to craft tailored messages for Email, LinkedIn InMail, and Alumni intro.
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Box 1: Hiring Manager Direct Email */}
              <div className="bg-[#0d0d0f] border border-[#1f1f23] rounded p-5 shadow-lg space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-[#1f1f23] pb-2 mb-3">
                    <span className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Mail className="w-4 h-4 text-blue-400" />
                      1. Hiring Manager Cold Email
                    </span>

                    <button
                      onClick={() => copyToClipboard(`Subject: ${outreachData.emailSubject}\n\n${outreachData.emailBody}`, setCopiedEmail)}
                      className="text-blue-400 hover:text-blue-300 text-xs font-semibold flex items-center gap-1"
                    >
                      {copiedEmail ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedEmail ? 'Copied!' : 'Copy Email'}
                    </button>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-[#a0a0aa] font-semibold uppercase tracking-wider block text-[10px]">Subject Line:</span>
                      <p className="bg-[#0a0a0b] p-2 rounded text-white font-medium border border-[#232328]">
                        {outreachData.emailSubject}
                      </p>
                    </div>

                    <div>
                      <span className="text-[#a0a0aa] font-semibold uppercase tracking-wider block text-[10px]">Email Body:</span>
                      <pre className="bg-[#0a0a0b] p-3 rounded text-[#e0e0e0] font-mono text-xs whitespace-pre-wrap leading-relaxed border border-[#232328] max-h-72 overflow-y-auto">
                        {outreachData.emailBody}
                      </pre>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-3 border-t border-[#1f1f23]">
                  {/* Document Attachment Downloads */}
                  <div className="bg-[#0a0a0b] p-2.5 rounded border border-[#232328] space-y-2">
                    <span className="text-[10px] font-bold text-white uppercase tracking-wider block">
                      Download Executable Application Documents:
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => downloadPDFResume(selectedJob.title, selectedJob.company)}
                        className="bg-green-600 hover:bg-green-500 text-white font-bold px-2.5 py-1 rounded text-xs flex items-center gap-1.5 cursor-pointer transition-all shadow-md"
                      >
                        <FileText className="w-3.5 h-3.5 text-white" />
                        Export PDF Resume
                      </button>

                      <button
                        onClick={() => downloadResumeDoc(selectedJob.title, selectedJob.company)}
                        className="bg-green-600/20 hover:bg-green-600/40 text-green-300 border border-green-500/30 px-2.5 py-1 rounded text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
                      >
                        <Download className="w-3.5 h-3.5 text-green-400" />
                        Download (.txt)
                      </button>

                      <button
                        onClick={() => downloadPDFCoverLetter(selectedJob.title, selectedJob.company, selectedJob.contactPerson?.name)}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-2.5 py-1 rounded text-xs flex items-center gap-1.5 cursor-pointer transition-all shadow-md"
                      >
                        <FileText className="w-3.5 h-3.5 text-white" />
                        Export PDF Cover Letter
                      </button>

                      <button
                        onClick={() => downloadCoverLetterDoc(selectedJob.title, selectedJob.company, selectedJob.contactPerson?.name)}
                        className="bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 px-2.5 py-1 rounded text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
                      >
                        <Download className="w-3.5 h-3.5 text-indigo-400" />
                        Download (.txt)
                      </button>
                    </div>
                  </div>

                  {/* Gmail & Mail App Launchers + Platforms */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => executeAndLaunchGmail({
                        toEmail: selectedJob.contactPerson?.email || 'hr@' + selectedJob.company.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com',
                        jobTitle: selectedJob.title,
                        companyName: selectedJob.company,
                        contactName: selectedJob.contactPerson?.name,
                        customBody: outreachData.emailBody
                      })}
                      className="bg-red-600 hover:bg-red-500 text-white border border-red-400 px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                      title="Downloads both attachments, copies application to clipboard, and launches Gmail Compose"
                    >
                      <Mail className="w-3.5 h-3.5 text-white" />
                      Download & Open Gmail Compose
                    </button>

                    {(() => {
                      const urls = getPlatformSearchUrls(selectedJob.title, selectedJob.company);
                      return (
                        <>
                          <a
                            href={urls.linkedIn}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-[#0077b5]/20 hover:bg-[#0077b5]/40 text-blue-300 border border-[#0077b5]/40 px-2.5 py-1.5 rounded text-xs font-bold flex items-center gap-1"
                          >
                            LinkedIn Jobs
                          </a>
                          <a
                            href={urls.naukri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-[#4a00e0]/20 hover:bg-[#4a00e0]/40 text-indigo-300 border border-[#4a00e0]/40 px-2.5 py-1.5 rounded text-xs font-bold flex items-center gap-1"
                          >
                            Naukri
                          </a>
                          <a
                            href={urls.indeed}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-[#2164f3]/20 hover:bg-[#2164f3]/40 text-sky-300 border border-[#2164f3]/40 px-2.5 py-1.5 rounded text-xs font-bold flex items-center gap-1"
                          >
                            Indeed
                          </a>
                        </>
                      );
                    })()}
                  </div>

                  <div className="pt-1 text-[11px] text-[#a0a0aa] flex items-center gap-1.5 font-mono">
                    <Clock className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>Cadence rule: Strict 5-day follow up if no reply.</span>
                  </div>
                </div>
              </div>

              {/* Box 2: LinkedIn InMail / Short Note */}
              <div className="bg-[#0d0d0f] border border-[#1f1f23] rounded p-5 shadow-lg space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-[#1f1f23] pb-2 mb-3">
                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Linkedin className="w-4 h-4 text-indigo-400" />
                      2. LinkedIn InMail / Short Connection
                    </span>

                    <button
                      onClick={() => copyToClipboard(outreachData.linkedinInMail, setCopiedInMail)}
                      className="text-indigo-400 hover:text-indigo-300 text-xs font-semibold flex items-center gap-1"
                    >
                      {copiedInMail ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedInMail ? 'Copied!' : 'Copy InMail'}
                    </button>
                  </div>

                  <div className="space-y-2 text-xs">
                    <span className="text-[#a0a0aa] font-semibold uppercase tracking-wider block text-[10px]">InMail Message (&lt; 300 Chars):</span>
                    <pre className="bg-[#0a0a0b] p-3 rounded text-[#e0e0e0] font-mono text-xs whitespace-pre-wrap leading-relaxed border border-[#232328] max-h-72 overflow-y-auto">
                      {outreachData.linkedinInMail}
                    </pre>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-[#1f1f23]">
                  <a
                    href={`https://www.linkedin.com/search/results/all/?keywords=${encodeURIComponent((contactName || 'Recruiter') + ' ' + selectedJob.company)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#0077b5]/20 hover:bg-[#0077b5]/40 text-[#38bdf8] border border-[#0077b5]/40 px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer inline-flex"
                    title="Search for recruiter on LinkedIn to send message"
                  >
                    <Linkedin className="w-3.5 h-3.5 text-[#38bdf8]" />
                    Open LinkedIn Search for Recruiter
                  </a>

                  <div className="pt-1 text-[11px] text-green-400 flex items-center gap-1.5 font-mono">
                    <Check className="w-3.5 h-3.5 shrink-0" />
                    <span>Optimized for 45%+ recruiter open rate.</span>
                  </div>
                </div>
              </div>

              {/* Box 3: Gartner Alumni / Warm Intro */}
              <div className="bg-[#0d0d0f] border border-[#1f1f23] rounded p-5 shadow-lg space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-[#1f1f23] pb-2 mb-3">
                    <span className="text-xs font-bold text-green-400 uppercase tracking-wider flex items-center gap-1.5">
                      <UserCheck className="w-4 h-4 text-green-400" />
                      3. Gartner Alumni Warm Network Note
                    </span>

                    <button
                      onClick={() => copyToClipboard(outreachData.alumniWarmIntro, setCopiedAlumni)}
                      className="text-green-400 hover:text-green-300 text-xs font-semibold flex items-center gap-1"
                    >
                      {copiedAlumni ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedAlumni ? 'Copied!' : 'Copy Warm Note'}
                    </button>
                  </div>

                  <div className="space-y-2 text-xs">
                    <span className="text-[#a0a0aa] font-semibold uppercase tracking-wider block text-[10px]">Peer-to-Peer Warm Intro:</span>
                    <pre className="bg-[#0a0a0b] p-3 rounded text-[#e0e0e0] font-mono text-xs whitespace-pre-wrap leading-relaxed border border-[#232328] max-h-72 overflow-y-auto">
                      {outreachData.alumniWarmIntro}
                    </pre>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#1f1f23] text-[11px] text-[#e0e0e0] font-mono">
                  {outreachData.strategicAdvice}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Template Library Modal */}
      <TemplateLibraryModal
        isOpen={isTemplateLibraryOpen}
        onClose={() => setIsTemplateLibraryOpen(false)}
        onApplyTemplate={handleApplyTemplateFromLibrary}
        selectedJob={selectedJob}
      />
    </div>
  );
};
