import React, { useState } from 'react';
import { JobRole } from '../types';
import { masterResume } from '../data/masterResume';
import { 
  FileText, 
  Sparkles, 
  Copy, 
  Check, 
  Loader2, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  UserCheck, 
  Share2,
  Code2,
  Layers,
  Plus,
  Trash2,
  Edit3,
  X,
  Bookmark,
  Award,
  Zap,
  Download,
  ExternalLink,
  Mail
} from 'lucide-react';
import { AtsGapAuditor } from './AtsGapAuditor';
import { 
  downloadResumeDoc, 
  downloadCoverLetterDoc, 
  downloadPDFResume, 
  downloadPDFCoverLetter, 
  executeAndLaunchGmail, 
  getPlatformSearchUrls 
} from '../utils/documentExporter';

export interface MasterResumeIteration {
  id: string;
  label: string; // e.g., "Legal Ops & CLM Transformation Lead"
  tagline: string; // e.g., "Emphasizes CLM playbooks, 60% TAT reduction, and LLB qualification"
  corePositioning: string;
  executiveSummary: string;
  primarySkills: string[];
  dateSaved: string;
}

const defaultIterations: MasterResumeIteration[] = [
  {
    id: 'iter-legal-ops',
    label: 'Legal Ops & CLM Transformation Lead',
    tagline: 'Emphasizes CLM playbooks, 60% TAT reduction, LLB qualification, and legal vendor governance',
    corePositioning: 'Strategic Operations & Legal Ops Leader with 9+ years (7+ at Gartner) who bridges contract workflow, CLM technology, LLB expertise, and 60% TAT reduction via RCA.',
    executiveSummary: 'Accomplished Legal Operations & Strategic Operations Leader with 9+ years of experience leading cross-functional process transformations at Gartner. Holds an LLB degree with deep expertise in CLM implementation, vendor governance, contract playbook authoring, and reducing legal review TAT by 60%. Experienced in training 250+ global stakeholders and automating contract drafting.',
    primarySkills: ['CLM Technology & Playbooks', 'Contract Review TAT Reduction (60%)', 'Vendor Governance', 'LLB & Legal Risk RCA', 'Stakeholder Training (250+)'],
    dateSaved: '2026-07-28'
  },
  {
    id: 'iter-strat-ops',
    label: 'Strategic Operations & RCA Specialist',
    tagline: 'Focuses on 6 FTE team leadership, Gartner 7-year tenure, operational metrics, and root cause analysis',
    corePositioning: 'Senior Strategic Operations Manager with 7+ years at Gartner directing 6 FTEs, driving operational efficiency, SLA governance, and enterprise-wide process improvement.',
    executiveSummary: 'Results-driven Operations Leader with 7+ years at Gartner directing high-performing operational teams. Proven track record of managing 6 direct reports, executing continuous improvement frameworks, optimizing resource utilization, and maintaining 99.4% SLA adherence across complex global service lines.',
    primarySkills: ['Operational Strategy & SLA Governance', '6 FTE Direct Report Leadership', 'Root Cause Analysis (RCA)', '7+ Years Gartner Tenure', 'Process Engineering'],
    dateSaved: '2026-07-28'
  },
  {
    id: 'iter-ai-auto',
    label: 'Enterprise AI & Agentic Automation Director',
    tagline: 'Highlights Copilot, Python scripts, LLM prompt engineering, and live agentic tools built at Gartner',
    corePositioning: 'Operations & AI Automation Pioneer combining 9+ years operations leadership with hands-on Python, Microsoft Copilot, Gemini LLM prompt engineering, and agentic AI tools.',
    executiveSummary: 'Visionary Operations & Technology Leader specializing in bridging strategic operations with cutting-edge Agentic AI and Copilot automation. Built and deployed live Python/LLM contract automation tools at Gartner, achieving 60% turnaround time compression and pioneering AI-driven document workflows.',
    primarySkills: ['Agentic AI & LLM Prompting', 'Microsoft Copilot Integration', 'Python Process Automation', 'AI Workflow Architecture', 'Gartner Tech Stack'],
    dateSaved: '2026-07-28'
  }
];

import { ResumeUpload, ResumeData } from './ResumeUpload';

interface ResumeTailorViewProps {
  jobs: JobRole[];
  selectedJob: JobRole | null;
  onSelectJob: (job: JobRole) => void;
  resumeData?: ResumeData;
  onUpdateResume?: (data: ResumeData) => void;
}

export const ResumeTailorView: React.FC<ResumeTailorViewProps> = ({
  jobs,
  selectedJob,
  onSelectJob,
  resumeData,
  onUpdateResume
}) => {
  const [loadingResume, setLoadingResume] = useState(false);
  const [loadingCover, setLoadingCover] = useState(false);
  const [tailoredData, setTailoredData] = useState<any | null>(null);
  const [coverLetterText, setCoverLetterText] = useState<string | null>(selectedJob?.coverLetter || null);
  const [copiedResume, setCopiedResume] = useState(false);
  const [copiedCover, setCopiedCover] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'resume' | 'cover' | 'master'>('resume');

  // Master Resume Iterations State
  const [iterations, setIterations] = useState<MasterResumeIteration[]>(defaultIterations);
  const [activeIterationId, setActiveIterationId] = useState<string>('iter-legal-ops');
  const [isAddIterationModalOpen, setIsAddIterationModalOpen] = useState(false);

  // New Iteration Form State
  const [newLabel, setNewLabel] = useState('');
  const [newTagline, setNewTagline] = useState('');
  const [newPositioning, setNewPositioning] = useState('');
  const [newSummary, setNewSummary] = useState('');
  const [newSkillsStr, setNewSkillsStr] = useState('');

  const activeIteration = iterations.find(i => i.id === activeIterationId) || iterations[0];
  const eligibleJobs = jobs.filter(j => j.scores.ctcFloorPassed);

  const handleSaveNewIteration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel || !newPositioning) return;

    const newIter: MasterResumeIteration = {
      id: `iter-${Date.now()}`,
      label: newLabel,
      tagline: newTagline || 'Custom Master Resume Iteration',
      corePositioning: newPositioning,
      executiveSummary: newSummary || activeIteration.executiveSummary,
      primarySkills: newSkillsStr ? newSkillsStr.split(',').map(s => s.trim()) : ['Strategic Operations', 'Legal Ops', 'RCA'],
      dateSaved: new Date().toISOString().split('T')[0]
    };

    setIterations([...iterations, newIter]);
    setActiveIterationId(newIter.id);
    setIsAddIterationModalOpen(false);

    // Reset form
    setNewLabel('');
    setNewTagline('');
    setNewPositioning('');
    setNewSummary('');
    setNewSkillsStr('');
  };

  const handleDeleteIteration = (id: string) => {
    if (iterations.length <= 1) return;
    const filtered = iterations.filter(i => i.id !== id);
    setIterations(filtered);
    if (activeIterationId === id) {
      setActiveIterationId(filtered[0].id);
    }
  };

  const handleTailorResume = async () => {
    if (!selectedJob) return;
    setLoadingResume(true);
    try {
      const response = await fetch('/api/tailor-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: selectedJob.title,
          company: selectedJob.company,
          description: selectedJob.description,
          baselinePositioning: activeIteration.corePositioning,
          baselineSummary: activeIteration.executiveSummary
        })
      });
      const data = await response.json();
      if (data.success && data.tailoredResume) {
        setTailoredData(data.tailoredResume);
      }
    } catch (error) {
      console.error('Tailor resume error:', error);
    } finally {
      setLoadingResume(false);
    }
  };

  const handleGenerateCoverLetter = async () => {
    if (!selectedJob) return;
    setLoadingCover(true);
    try {
      const response = await fetch('/api/generate-cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: selectedJob.title,
          company: selectedJob.company,
          description: selectedJob.description,
          baselinePositioning: activeIteration.corePositioning
        })
      });
      const data = await response.json();
      if (data.success && data.coverLetter) {
        setCoverLetterText(data.coverLetter);
      }
    } catch (error) {
      console.error('Cover letter error:', error);
    } finally {
      setLoadingCover(false);
    }
  };

  const copyToClipboard = (text: string, setCopied: React.Dispatch<React.SetStateAction<boolean>>) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Upload Updated Resume & Certifications */}
      <ResumeUpload
        resumeData={resumeData}
        onUpdateResume={onUpdateResume}
      />

      {/* Top Banner & Master Iteration Selector Bar */}
      <div className="bg-[#0d0d0f] border border-[#1f1f23] rounded p-5 shadow-lg space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1 w-full md:w-auto">
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              AI Resume & Cover Letter Studio
            </span>
            <h2 className="text-base font-bold text-white uppercase tracking-wider">
              Tailor Master Resume for ≥₹18 LPA Roles
            </h2>
          </div>

          {/* Job Selector Dropdown */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <label className="text-xs text-[#a0a0aa] font-medium whitespace-nowrap">Target Role:</label>
            <select
              value={selectedJob?.id || ''}
              onChange={(e) => {
                const found = jobs.find(j => j.id === e.target.value);
                if (found) {
                  onSelectJob(found);
                  setTailoredData(null);
                  setCoverLetterText(found.coverLetter || null);
                }
              }}
              className="w-full md:w-80 bg-[#0a0a0b] border border-[#232328] text-white text-xs rounded p-2.5 focus:outline-none focus:border-blue-500 font-semibold"
            >
              <option value="" disabled>Select a role from pipeline...</option>
              {eligibleJobs.map(job => (
                <option key={job.id} value={job.id}>
                  [{job.scores.totalScore}/100] {job.title} - {job.company} (₹{job.ctcMinLpa}-{job.ctcMaxLpa} LPA)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Master Iterations Toolbar */}
        <div className="pt-3 border-t border-[#1f1f23] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#151518] p-3 rounded border border-[#232328]">
          <div className="flex items-center gap-2 overflow-x-auto">
            <span className="text-[10px] font-bold text-[#6b6b75] uppercase tracking-wider whitespace-nowrap flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              Master Baseline:
            </span>

            {iterations.map(iter => {
              const isActive = iter.id === activeIterationId;
              return (
                <button
                  key={iter.id}
                  onClick={() => {
                    setActiveIterationId(iter.id);
                    setTailoredData(null);
                  }}
                  className={`px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-blue-600 text-white border border-blue-500 shadow-md shadow-blue-900/30'
                      : 'bg-[#0a0a0b] text-[#a0a0aa] border border-[#232328] hover:text-white'
                  }`}
                >
                  <Bookmark className={`w-3 h-3 ${isActive ? 'fill-current' : ''}`} />
                  {iter.label}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => {
              setNewLabel('');
              setNewTagline('');
              setNewPositioning(activeIteration.corePositioning);
              setNewSummary(activeIteration.executiveSummary);
              setIsAddIterationModalOpen(true);
            }}
            className="bg-[#1a1a1c] hover:bg-[#232328] text-white border border-[#2d2d30] font-bold text-xs px-3 py-1.5 rounded flex items-center gap-1.5 shrink-0 transition-all cursor-pointer uppercase tracking-wider"
          >
            <Plus className="w-3.5 h-3.5 text-blue-400" />
            + New Iteration
          </button>
        </div>
      </div>

      {!selectedJob ? (
        <div className="bg-[#0d0d0f] border border-[#1f1f23] rounded p-12 text-center text-[#6b6b75] text-xs space-y-2">
          <Layers className="w-8 h-8 text-blue-400 mx-auto opacity-70" />
          <p className="text-white font-bold text-sm">Select a high-score job role above to begin tailoring</p>
          <p>Active Master Baseline: <strong className="text-blue-400">{activeIteration.label}</strong></p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Selected Job Card Overview */}
          <div className="bg-[#0d0d0f] border border-[#1f1f23] rounded p-4 shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono font-bold text-xs bg-green-500/10 text-green-400 px-2 py-0.5 rounded border border-green-500/20">
                  Score: {selectedJob.scores.totalScore}/100
                </span>
                <span className="font-mono text-white text-xs bg-[#1a1a1c] px-2 py-0.5 rounded border border-[#2d2d30]">
                  ₹{selectedJob.ctcMinLpa}–{selectedJob.ctcMaxLpa} LPA CTC
                </span>
                <span className="text-xs text-[#a0a0aa]">{selectedJob.workMode} ({selectedJob.shift})</span>
              </div>
              <h3 className="font-bold text-white text-base">{selectedJob.title}</h3>
              <p className="text-xs text-[#a0a0aa]">{selectedJob.company} • {selectedJob.location}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleTailorResume}
                disabled={loadingResume}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase tracking-wider px-4 py-2 rounded text-xs flex items-center gap-2 shadow-lg shadow-blue-900/30 cursor-pointer disabled:opacity-50"
              >
                {loadingResume ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Tailoring via AI...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Tailored Resume
                  </>
                )}
              </button>

              <button
                onClick={handleGenerateCoverLetter}
                disabled={loadingCover}
                className="bg-[#1a1a1c] hover:bg-[#232328] text-white border border-[#2d2d30] font-semibold px-4 py-2 rounded text-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loadingCover ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Drafting Cover Letter...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 text-blue-400" />
                    Draft Cover Letter
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Sub-tabs */}
          <div className="flex items-center gap-2 border-b border-[#1f1f23] pb-2">
            <button
              onClick={() => setActiveSubTab('resume')}
              className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all ${
                activeSubTab === 'resume'
                  ? 'bg-blue-600 text-white'
                  : 'text-[#a0a0aa] hover:text-white'
              }`}
            >
              Tailored Resume & ATS Keywords
            </button>

            <button
              onClick={() => setActiveSubTab('cover')}
              className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all ${
                activeSubTab === 'cover'
                  ? 'bg-blue-600 text-white'
                  : 'text-[#a0a0aa] hover:text-white'
              }`}
            >
              Executive Cover Letter
            </button>

            <button
              onClick={() => setActiveSubTab('master')}
              className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                activeSubTab === 'master'
                  ? 'bg-[#1a1a1c] text-white border border-[#2d2d30]'
                  : 'text-[#a0a0aa] hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              Master Resume Iterations ({iterations.length})
            </button>
          </div>

          {/* Content Area */}
          {activeSubTab === 'resume' && (
            <div className="space-y-6">
              {/* ATS Gap & Keyword Alignment Auditor */}
              <AtsGapAuditor 
                job={selectedJob} 
                activeIterationLabel={activeIteration.label} 
                tailoredResumeText={tailoredData?.fullFormattedResumeText}
              />

              {!tailoredData ? (
                <div className="bg-[#0d0d0f] border border-[#1f1f23] rounded p-10 text-center text-[#6b6b75] text-xs space-y-3">
                  <FileText className="w-8 h-8 text-blue-400 mx-auto opacity-80" />
                  <p>Click <strong>"Generate Tailored Resume"</strong> above to construct an ATS-optimized, keyword-matched resume customized specifically for {selectedJob.company}.</p>
                  <div className="text-[11px] text-[#a0a0aa] bg-[#151518] p-2 rounded inline-block border border-[#232328]">
                    Baseline Iteration: <strong className="text-white">{activeIteration.label}</strong>
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* ATS Keywords Matched */}
                  <div className="bg-[#0d0d0f] border border-[#1f1f23] rounded p-4 space-y-2">
                    <h4 className="text-xs font-bold text-green-400 uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                      ATS Target Keywords Integrated:
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {tailoredData.atsKeywordsMatched?.map((kw: string, i: number) => (
                        <span key={i} className="bg-green-500/10 text-green-300 text-[11px] px-2.5 py-1 rounded border border-green-500/30 font-medium">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Core Positioning */}
                  <div className="bg-[#0d0d0f] border border-[#1f1f23] rounded p-4 space-y-1">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Tailored Core Positioning:</h4>
                    <p className="text-xs text-[#e0e0e0] font-medium leading-relaxed bg-[#0a0a0b] p-3 rounded border border-[#232328]">
                      "{tailoredData.corePositioning}"
                    </p>
                  </div>

                  {/* Tailored Executive Summary */}
                  <div className="bg-[#0d0d0f] border border-[#1f1f23] rounded p-4 space-y-1">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Tailored Executive Summary:</h4>
                    <p className="text-xs text-[#a0a0aa] leading-relaxed bg-[#0a0a0b] p-3 rounded border border-[#232328]">
                      {tailoredData.executiveSummary}
                    </p>
                  </div>

                  {/* Executable Document Exports & One-Click Portals */}
                  {selectedJob && (
                    <div className="bg-[#121215] border border-[#232328] rounded p-4 space-y-3 shadow-md">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#232328] pb-2">
                        <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                          <Download className="w-4 h-4 text-green-400" />
                          Executable Document Downloads & Quick Apply Launchers:
                        </span>
                        <span className="text-[10px] text-green-400 font-mono font-bold">20-Year Recruiter Standard Formats</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => downloadPDFResume(selectedJob.title, selectedJob.company, tailoredData?.corePositioning)}
                          className="bg-green-600 hover:bg-green-500 text-white font-bold px-3 py-1.5 rounded text-xs flex items-center gap-1.5 cursor-pointer transition-all shadow-md"
                          title="Generate & print executable PDF Resume"
                        >
                          <FileText className="w-3.5 h-3.5 text-white" />
                          Export PDF Resume
                        </button>

                        <button
                          onClick={() => downloadResumeDoc(selectedJob.title, selectedJob.company, tailoredData?.corePositioning)}
                          className="bg-[#1a1a1e] hover:bg-[#25252a] text-green-300 border border-green-500/30 font-bold px-3 py-1.5 rounded text-xs flex items-center gap-1.5 cursor-pointer transition-all"
                        >
                          <Download className="w-3.5 h-3.5 text-green-400" />
                          Download Resume (.txt)
                        </button>

                        <button
                          onClick={() => executeAndLaunchGmail({
                            toEmail: selectedJob.contactPerson?.email || 'hr@' + selectedJob.company.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com',
                            jobTitle: selectedJob.title,
                            companyName: selectedJob.company,
                            contactName: selectedJob.contactPerson?.name,
                            customSummary: tailoredData?.corePositioning
                          })}
                          className="bg-red-600 hover:bg-red-500 text-white font-bold px-3 py-1.5 rounded text-xs flex items-center gap-1.5 cursor-pointer transition-all shadow-md ml-auto"
                        >
                          <Mail className="w-3.5 h-3.5 text-white" />
                          Download & Launch Gmail
                        </button>
                      </div>

                      {/* Quick Access Platform Links */}
                      <div className="pt-2 border-t border-[#1f1f23] flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-bold text-[#a0a0aa] uppercase tracking-wider mr-1">Quick Search Opportunity On:</span>
                        {(() => {
                          const urls = getPlatformSearchUrls(selectedJob.title, selectedJob.company);
                          return (
                            <>
                              <a
                                href={urls.linkedIn}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-[#0077b5]/20 hover:bg-[#0077b5]/40 text-blue-300 border border-[#0077b5]/40 px-2.5 py-1 rounded text-[11px] font-bold flex items-center gap-1"
                              >
                                <ExternalLink className="w-3 h-3 text-blue-400" />
                                LinkedIn Jobs
                              </a>
                              <a
                                href={urls.naukri}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-[#4a00e0]/20 hover:bg-[#4a00e0]/40 text-indigo-300 border border-[#4a00e0]/40 px-2.5 py-1 rounded text-[11px] font-bold flex items-center gap-1"
                              >
                                <ExternalLink className="w-3 h-3 text-indigo-400" />
                                Naukri
                              </a>
                              <a
                                href={urls.indeed}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-[#2164f3]/20 hover:bg-[#2164f3]/40 text-sky-300 border border-[#2164f3]/40 px-2.5 py-1 rounded text-[11px] font-bold flex items-center gap-1"
                              >
                                <ExternalLink className="w-3 h-3 text-sky-400" />
                                Indeed
                              </a>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  )}

                  {/* Formatted Full Resume Text Box */}
                  <div className="bg-[#0d0d0f] border border-[#1f1f23] rounded p-5 space-y-3">
                    <div className="flex items-center justify-between border-b border-[#1f1f23] pb-2">
                      <h4 className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-wider">
                        <Code2 className="w-4 h-4 text-blue-400" />
                        Full Ready-to-Submit Markdown Resume (Tailored from {activeIteration.label})
                      </h4>

                      <button
                        onClick={() => copyToClipboard(tailoredData.fullFormattedResumeText, setCopiedResume)}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-3 py-1.5 rounded text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-blue-900/30"
                      >
                        {copiedResume ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedResume ? 'Copied to Clipboard!' : 'Copy Tailored Resume'}
                      </button>
                    </div>

                    <pre className="bg-[#0a0a0b] p-4 rounded text-[#e0e0e0] font-mono text-[11px] whitespace-pre-wrap leading-relaxed max-h-[500px] overflow-y-auto border border-[#232328]">
                      {tailoredData.fullFormattedResumeText}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Cover Letter Tab */}
          {activeSubTab === 'cover' && (
            <div className="bg-[#0d0d0f] border border-[#1f1f23] rounded p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-[#1f1f23] pb-3">
                <div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">Executive Cover Letter for {selectedJob.company}</h4>
                  <p className="text-xs text-[#a0a0aa]">Positioning 60% TAT reduction, Gartner leadership, and Agentic AI credentials.</p>
                </div>

                {coverLetterText && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => downloadPDFCoverLetter(selectedJob.title, selectedJob.company, selectedJob.contactPerson?.name)}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-3 py-1.5 rounded text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                    >
                      <FileText className="w-3.5 h-3.5 text-white" />
                      Export PDF Cover Letter
                    </button>

                    <button
                      onClick={() => downloadCoverLetterDoc(selectedJob.title, selectedJob.company, selectedJob.contactPerson?.name)}
                      className="bg-[#1a1a1e] hover:bg-[#25252a] text-indigo-300 border border-indigo-500/30 font-bold px-3 py-1.5 rounded text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-indigo-400" />
                      Download (.txt)
                    </button>

                    <button
                      onClick={() => copyToClipboard(coverLetterText, setCopiedCover)}
                      className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-3 py-1.5 rounded text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-blue-900/30"
                    >
                      {copiedCover ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedCover ? 'Copied!' : 'Copy Cover Letter'}
                    </button>
                  </div>
                )}
              </div>

              {!coverLetterText ? (
                <div className="text-center py-10 text-[#6b6b75] text-xs">
                  Click <strong>"Draft Cover Letter"</strong> above to generate a tailored executive cover letter.
                </div>
              ) : (
                <textarea
                  value={coverLetterText}
                  onChange={(e) => setCoverLetterText(e.target.value)}
                  rows={16}
                  className="w-full bg-[#0a0a0b] text-[#e0e0e0] text-xs p-4 rounded border border-[#232328] font-mono leading-relaxed focus:outline-none focus:border-blue-500"
                ></textarea>
              )}
            </div>
          )}

          {/* Master Resume Base & Iterations Tab */}
          {activeSubTab === 'master' && (
            <div className="space-y-6">
              
              {/* Iterations Grid */}
              <div className="bg-[#0d0d0f] border border-[#1f1f23] rounded p-6 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1f1f23] pb-3">
                  <div>
                    <span className="text-[10px] text-green-400 font-mono font-bold uppercase tracking-wider">MASTER RESUME REPOSITORY</span>
                    <h3 className="text-base font-bold text-white">Saved Master Resume Iterations ({iterations.length})</h3>
                    <p className="text-xs text-[#a0a0aa]">Switch between target role archetypes or save custom positioning variants.</p>
                  </div>

                  <button
                    onClick={() => setIsAddIterationModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider px-3.5 py-2 rounded flex items-center gap-1.5 shadow-md shadow-blue-900/30 transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Save New Iteration
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {iterations.map(iter => {
                    const isActive = iter.id === activeIterationId;
                    return (
                      <div
                        key={iter.id}
                        className={`p-4 rounded border flex flex-col justify-between space-y-3 transition-all ${
                          isActive
                            ? 'bg-[#151518] border-blue-500 shadow-xl shadow-blue-900/10'
                            : 'bg-[#0a0a0b] border-[#232328] hover:border-[#33333a]'
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                              isActive ? 'bg-blue-600 text-white' : 'bg-[#151518] text-[#a0a0aa]'
                            }`}>
                              {isActive ? 'Active Baseline' : 'Saved Iteration'}
                            </span>

                            <span className="text-[10px] text-[#6b6b75] font-mono">{iter.dateSaved}</span>
                          </div>

                          <h4 className="font-bold text-white text-sm">{iter.label}</h4>
                          <p className="text-xs text-[#a0a0aa] leading-relaxed">{iter.tagline}</p>

                          <div className="flex flex-wrap gap-1 pt-1">
                            {iter.primarySkills.map((sk, idx) => (
                              <span key={idx} className="bg-[#151518] text-[#e0e0e0] text-[10px] px-2 py-0.5 rounded border border-[#232328] font-mono">
                                {sk}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="pt-2 border-t border-[#232328] flex items-center justify-between gap-2">
                          {!isActive ? (
                            <button
                              onClick={() => {
                                setActiveIterationId(iter.id);
                                setTailoredData(null);
                              }}
                              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-1.5 rounded text-xs uppercase tracking-wider transition-all"
                            >
                              Activate Baseline
                            </button>
                          ) : (
                            <span className="text-xs font-mono font-bold text-green-400 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Primary Baseline Active
                            </span>
                          )}

                          {iterations.length > 1 && (
                            <button
                              onClick={() => handleDeleteIteration(iter.id)}
                              className="text-[#6b6b75] hover:text-red-400 p-1 transition-colors"
                              title="Delete Iteration"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Active Iteration Detail Inspector */}
                <div className="bg-[#151518] border border-[#232328] rounded p-5 space-y-3">
                  <div className="flex items-center justify-between border-b border-[#232328] pb-2">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Bookmark className="w-4 h-4 text-blue-400" />
                      Active Iteration Baseline Details: <strong className="text-blue-400">{activeIteration.label}</strong>
                    </h4>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-[#a0a0aa] uppercase tracking-wider block mb-1">
                      Core Positioning Statement:
                    </label>
                    <p className="bg-[#0a0a0b] p-3 rounded border border-[#232328] text-white text-xs leading-relaxed font-medium">
                      "{activeIteration.corePositioning}"
                    </p>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-[#a0a0aa] uppercase tracking-wider block mb-1">
                      Executive Summary:
                    </label>
                    <p className="bg-[#0a0a0b] p-3 rounded border border-[#232328] text-[#a0a0aa] text-xs leading-relaxed">
                      {activeIteration.executiveSummary}
                    </p>
                  </div>
                </div>

              </div>

            </div>
          )}
        </div>
      )}

      {/* Add Master Resume Iteration Modal */}
      {isAddIterationModalOpen && (
        <div className="fixed inset-0 bg-[#0a0a0b]/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0d0d0f] border border-[#1f1f23] rounded-lg max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1f1f23] pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-400" />
                Save New Master Resume Iteration
              </h3>
              <button onClick={() => setIsAddIterationModalOpen(false)} className="text-[#6b6b75] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewIteration} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#a0a0aa] font-semibold uppercase tracking-wider text-[10px] mb-1">
                  Iteration Label / Title *
                </label>
                <input
                  type="text"
                  required
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="e.g. Corporate Strategy & GCC Lead"
                  className="w-full bg-[#0a0a0b] text-white p-2.5 rounded border border-[#232328] focus:outline-none focus:border-blue-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-[#a0a0aa] font-semibold uppercase tracking-wider text-[10px] mb-1">
                  Tagline / High-level Focus
                </label>
                <input
                  type="text"
                  value={newTagline}
                  onChange={(e) => setNewTagline(e.target.value)}
                  placeholder="e.g. Focuses on GCC setup, enterprise SLAs, and legal governance"
                  className="w-full bg-[#0a0a0b] text-white p-2.5 rounded border border-[#232328] focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[#a0a0aa] font-semibold uppercase tracking-wider text-[10px] mb-1">
                  Core Positioning Statement *
                </label>
                <textarea
                  rows={2}
                  required
                  value={newPositioning}
                  onChange={(e) => setNewPositioning(e.target.value)}
                  placeholder="1-2 sentences framing your core positioning for this archetype..."
                  className="w-full bg-[#0a0a0b] text-white p-2.5 rounded border border-[#232328] focus:outline-none focus:border-blue-500 leading-relaxed text-xs"
                ></textarea>
              </div>

              <div>
                <label className="block text-[#a0a0aa] font-semibold uppercase tracking-wider text-[10px] mb-1">
                  Executive Summary
                </label>
                <textarea
                  rows={3}
                  value={newSummary}
                  onChange={(e) => setNewSummary(e.target.value)}
                  placeholder="Full executive summary paragraph for this resume iteration..."
                  className="w-full bg-[#0a0a0b] text-white p-2.5 rounded border border-[#232328] focus:outline-none focus:border-blue-500 leading-relaxed text-xs"
                ></textarea>
              </div>

              <div>
                <label className="block text-[#a0a0aa] font-semibold uppercase tracking-wider text-[10px] mb-1">
                  Primary Skill Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={newSkillsStr}
                  onChange={(e) => setNewSkillsStr(e.target.value)}
                  placeholder="e.g. GCC Operations, SLA Governance, CLM Implementation, RCA"
                  className="w-full bg-[#0a0a0b] text-white p-2.5 rounded border border-[#232328] focus:outline-none focus:border-blue-500 font-mono text-xs"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddIterationModalOpen(false)}
                  className="px-3 py-2 bg-[#151518] hover:bg-[#1f1f23] text-[#a0a0aa] rounded text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase tracking-wider rounded text-xs shadow-lg shadow-blue-900/30"
                >
                  Save Master Iteration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
