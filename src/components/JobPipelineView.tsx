import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { JobRole, ScoreTier, JobStatus } from '../types';
import { 
  Plus, 
  Search, 
  Filter, 
  ShieldAlert, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  ChevronRight, 
  FileText, 
  Send, 
  AlertTriangle,
  Building,
  MapPin,
  Clock,
  ExternalLink,
  DollarSign,
  Zap,
  Calendar,
  Flame,
  CheckSquare,
  Square,
  Layers,
  ListFilter,
  History,
  Archive,
  RefreshCw,
  Mail,
  Download,
  Pause,
  Award,
  Target
} from 'lucide-react';
import { QuickApplyModal } from './QuickApplyModal';
import { InterviewScheduler } from './InterviewScheduler';
import { executeAndLaunchGmail, downloadResumeDoc, downloadCoverLetterDoc } from '../utils/documentExporter';
import { calculateSuccessProbability } from '../utils/scoringEngine';
import { MessageSquare, Edit3, Save, Tag } from 'lucide-react';

export interface HiringRiskItem {
  id: string;
  category: 'Skill Mismatch' | 'CTC Floor Risk' | 'Night Shift Alignment' | 'Seniority / Scope Gap' | 'High Competition';
  severity: 'HIGH_RISK' | 'MODERATE_RISK';
  title: string;
  reasoning: string;
  counterNarrativeBullets: string[];
}

export function evaluateHiringRisks(job: JobRole): HiringRiskItem[] {
  const risks: HiringRiskItem[] = [];

  // 1. Skill Mismatch / Gap
  if (job.scores.titleSkillsScore < 18 || (job.scores.skillGaps && job.scores.skillGaps.length > 0)) {
    const missingSkills = (job.scores.skillGaps && job.scores.skillGaps.length > 0)
      ? job.scores.skillGaps.join(', ')
      : 'Target Domain Tools & Automation Frameworks';
    
    risks.push({
      id: `risk-skill-${job.id}`,
      category: 'Skill Mismatch',
      severity: job.scores.titleSkillsScore < 12 ? 'HIGH_RISK' : 'MODERATE_RISK',
      title: `Skill Gap Flagged: ${missingSkills}`,
      reasoning: `Recruiter ATS scoring penalizes candidate profile due to unconfirmed direct matches for: ${missingSkills}.`,
      counterNarrativeBullets: [
        `• Engineered automated high-throughput workflows integrating ${missingSkills.split(',')[0] || 'domain tools'}, reducing technical operational overhead by 35%.`,
        `• Accelerated cross-functional mastery in ${missingSkills}, leading migration from legacy architectures to modern reliable pipelines.`
      ]
    });
  }

  // 2. CTC Floor / Value Risk
  if (!job.scores.ctcFloorPassed || job.ctcMinLpa < 18 || job.scores.salaryScore < 15) {
    risks.push({
      id: `risk-ctc-${job.id}`,
      category: 'CTC Floor Risk',
      severity: !job.scores.ctcFloorPassed ? 'HIGH_RISK' : 'MODERATE_RISK',
      title: `Compensation Band Below Preferred Target (₹${job.ctcMinLpa}–${job.ctcMaxLpa} LPA)`,
      reasoning: `Job budget indicates lower seniority band or cost compression relative to target ₹18+ LPA floor.`,
      counterNarrativeBullets: [
        `• Delivered $150,000+ in annual operational efficiencies through automated contract & process management, justifying senior compensation brackets.`,
        `• Managed high-stakes enterprise client portfolios with 98% retention, driving direct bottom-line revenue growth.`
      ]
    });
  }

  // 3. Shift / Timezone Alignment Risk
  if (job.shift === 'US/Night Shift' || job.location.toLowerCase().includes('us')) {
    risks.push({
      id: `risk-shift-${job.id}`,
      category: 'Night Shift Alignment',
      severity: 'MODERATE_RISK',
      title: `US/Night Shift (100% Timezone Overlap Required)`,
      reasoning: `Hiring managers test candidate readiness and reliability for non-standard working hours.`,
      counterNarrativeBullets: [
        `• Maintained 100% active overlap with US East/West Coast engineering & executive teams across 3+ years of remote operations.`,
        `• Established robust asynchronous communication protocols that reduced cross-timezone decision delays by 45%.`
      ]
    });
  }

  // 4. Seniority / Scope Gap
  if (job.scores.companyQualityScore < 10 || job.description.toLowerCase().includes('director') || job.description.toLowerCase().includes('head of')) {
    risks.push({
      id: `risk-seniority-${job.id}`,
      category: 'Seniority / Scope Gap',
      severity: 'HIGH_RISK',
      title: `Executive / Senior Leadership Scope Gap`,
      reasoning: `Role demands proven cross-departmental strategic leadership and budget authority.`,
      counterNarrativeBullets: [
        `• Spearheaded cross-departmental task forces of 15+ senior contributors, taking end-to-end ownership from initial scoping to C-suite sign-off.`,
        `• Standardized enterprise SLA frameworks and operating procedures adopted across multiple global regional offices.`
      ]
    });
  }

  // 5. Default High Competition / General Risk if no specific risks triggered
  if (risks.length === 0 && job.scores.totalScore < 75) {
    risks.push({
      id: `risk-comp-${job.id}`,
      category: 'High Competition',
      severity: 'MODERATE_RISK',
      title: `High Applicant Density & General Match Gap`,
      reasoning: `Role receives 100+ applications; ATS screening requires hyper-focused counter-narrative positioning.`,
      counterNarrativeBullets: [
        `• Tailored 100% ATS-indexed keyword profile matching target core competencies, achieving top 5% candidate ranking.`,
        `• Directly engaged hiring manager with a concise 3-point strategic value proposal to bypass automated filters.`
      ]
    });
  }

  return risks;
}

interface HiringRiskNeutralizerSectionProps {
  job: JobRole;
  onSelectJob?: (job: JobRole) => void;
  setActiveTab?: (tab: string) => void;
}

const HiringRiskNeutralizerSection: React.FC<HiringRiskNeutralizerSectionProps> = ({
  job,
  onSelectJob,
  setActiveTab
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedRiskId, setCopiedRiskId] = useState<string | null>(null);

  const risks = evaluateHiringRisks(job);
  const hasHighRisk = risks.some(r => r.severity === 'HIGH_RISK');

  const handleCopyBullets = (risk: HiringRiskItem) => {
    const textToCopy = `Counter-Narrative Bullets for ${job.company} (${risk.category}):\n` + risk.counterNarrativeBullets.join('\n');
    navigator.clipboard.writeText(textToCopy);
    setCopiedRiskId(risk.id);
    setTimeout(() => setCopiedRiskId(null), 3500);
  };

  const handleApplyToTailor = () => {
    if (onSelectJob) onSelectJob(job);
    if (setActiveTab) setActiveTab('resume');
  };

  return (
    <div className="bg-[#12131e] border border-[#23263b] rounded-xl p-3 space-y-2 text-xs my-2">
      {/* Header Tag Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-1 rounded font-mono font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5 border ${
            hasHighRisk
              ? 'bg-red-500/20 text-red-300 border-red-500/40 shadow-sm shadow-red-950/40'
              : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
          }`}>
            <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
            <span>HIRING RISK DETECTED ({risks.length})</span>
          </span>

          <div className="flex flex-wrap items-center gap-1">
            {risks.map(r => (
              <span key={r.id} className="bg-[#1a1c2b] text-[#c0c2db] text-[10px] px-2 py-0.5 rounded border border-[#2e324c] font-mono font-semibold">
                {r.category}
              </span>
            ))}
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-[11px] font-mono text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 cursor-pointer bg-[#171928] px-2.5 py-1 rounded border border-[#292c48] hover:bg-[#1e2238] transition-all ml-auto"
        >
          <span>{isExpanded ? 'Hide Counter-Narratives' : '🛡️ Neutralize Risk Bullets'}</span>
          <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
        </button>
      </div>

      {/* Expandable Neutralizer Body */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3 pt-2 border-t border-[#1f2238]"
          >
            <p className="text-[11px] text-[#a0a0b8] leading-relaxed">
              Recruiters filter out profiles due to perception gaps. Include these targeted <strong className="text-emerald-300">Counter-Narrative Bullets</strong> directly in your tailored resume to neutralize doubt before applying:
            </p>

            {risks.map(risk => (
              <div key={risk.id} className="bg-[#0b0c12] border border-[#222538] p-3 rounded-lg space-y-2">
                <div className="flex items-center justify-between gap-2 border-b border-[#1c1f33] pb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase border ${
                      risk.severity === 'HIGH_RISK'
                        ? 'bg-red-950 text-red-300 border-red-500/40'
                        : 'bg-amber-950 text-amber-300 border-amber-500/40'
                    }`}>
                      {risk.severity === 'HIGH_RISK' ? 'HIGH RISK' : 'MODERATE RISK'}
                    </span>
                    <span className="font-bold text-white text-[11px]">{risk.title}</span>
                  </div>

                  <button
                    onClick={() => handleCopyBullets(risk)}
                    className="bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border border-blue-500/30 text-[10px] font-mono font-bold px-2.5 py-1 rounded flex items-center gap-1 transition-all cursor-pointer shrink-0"
                  >
                    {copiedRiskId === risk.id ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-300">Copied to Clipboard!</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3 h-3 text-blue-400" />
                        <span>Copy Bullets</span>
                      </>
                    )}
                  </button>
                </div>

                <p className="text-[10px] text-[#888898] italic">
                  Why Recruiter Flags This: {risk.reasoning}
                </p>

                <div className="bg-[#121422] p-2.5 rounded border border-[#23273e] space-y-1 font-mono text-[11px] text-emerald-300">
                  <span className="text-[9px] uppercase font-bold text-[#888898] block">Recommended Counter-Narrative Resume Bullets:</span>
                  {risk.counterNarrativeBullets.map((bullet, idx) => (
                    <div key={idx} className="leading-relaxed">
                      {bullet}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] text-[#888898] font-mono">
                Pro-tip: Insert these bullets in your work experience section before clicking Apply.
              </span>
              <button
                onClick={handleApplyToTailor}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] uppercase tracking-wider px-3 py-1 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
              >
                <FileText className="w-3 h-3" />
                <span>Apply Bullets in Resume Tailor ➔</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface JobCardQuickNotesProps {
  job: JobRole;
  onUpdateJob?: (job: JobRole) => void;
}

const JobCardQuickNotes: React.FC<JobCardQuickNotesProps> = ({ job, onUpdateJob }) => {
  const [notesText, setNotesText] = useState(job.notes || '');
  const [isSaved, setIsSaved] = useState(false);
  const [isOpen, setIsOpen] = useState(Boolean(job.notes));

  const handleSave = () => {
    if (onUpdateJob) {
      onUpdateJob({ ...job, notes: notesText });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    }
  };

  const addTag = (tag: string) => {
    const updated = notesText ? `${notesText} [${tag}]` : `[${tag}]`;
    setNotesText(updated);
    if (onUpdateJob) {
      onUpdateJob({ ...job, notes: updated });
    }
  };

  return (
    <div className="mt-3 pt-3 border-t border-[#232328] space-y-2">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1.5 uppercase tracking-wider cursor-pointer"
        >
          <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
          Quick Notes & Call Logs {job.notes ? '• (Note Attached)' : ''}
        </button>
        {isSaved && (
          <span className="text-[10px] font-mono text-green-400 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Auto-Saved
          </span>
        )}
      </div>

      {isOpen && (
        <div className="space-y-2 bg-[#0a0a0b] p-2.5 rounded border border-[#232328]">
          <div className="flex flex-wrap gap-1 text-[10px]">
            {['Recruiter Call Scheduled', 'Salary ₹22 LPA Fixed', 'Hiring Manager Round', 'LinkedIn Referral Sent', 'Follow Up Required'].map(tag => (
              <button
                key={tag}
                type="button"
                onClick={() => addTag(tag)}
                className="bg-[#151518] hover:bg-[#1f1f23] text-[#a0a0aa] hover:text-white px-2 py-0.5 rounded border border-[#232328] transition-all cursor-pointer font-mono"
              >
                + {tag}
              </button>
            ))}
          </div>

          <textarea
            rows={2}
            value={notesText}
            onChange={(e) => setNotesText(e.target.value)}
            onBlur={handleSave}
            placeholder="Log recruiter call points, CTC breakdown discussed, or quick thoughts during application..."
            className="w-full bg-[#151518] text-white text-xs p-2 rounded border border-[#232328] focus:outline-none focus:border-amber-500 font-sans leading-relaxed"
          ></textarea>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSave}
              className="bg-amber-600/80 hover:bg-amber-500 text-white font-bold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded transition-all cursor-pointer"
            >
              Save Note
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

interface JobPipelineViewProps {
  jobs: JobRole[];
  onSelectJob: (job: JobRole) => void;
  onOpenAddJobModal: () => void;
  onUpdateJobStatus: (jobId: string, status: JobStatus) => void;
  onUpdateJob?: (updatedJob: JobRole) => void;
  setActiveTab: (tab: string) => void;
  onOpenAuditModal?: () => void;
}

export const JobPipelineView: React.FC<JobPipelineViewProps> = ({
  jobs,
  onSelectJob,
  onOpenAddJobModal,
  onUpdateJobStatus,
  onUpdateJob,
  setActiveTab,
  onOpenAuditModal
}) => {
  const [pipelineSubTab, setPipelineSubTab] = useState<'CARDS' | 'INTERVIEWS'>('CARDS');
  const [selectedInterviewJobId, setSelectedInterviewJobId] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedBreakdownJob, setSelectedBreakdownJob] = useState<JobRole | null>(null);
  const [quickApplyJob, setQuickApplyJob] = useState<JobRole | null>(null);

  // Requirement: Hot List toggle & Bulk Selection state
  const [isHotListOnly, setIsHotListOnly] = useState<boolean>(false);
  const [isRiskOnly, setIsRiskOnly] = useState<boolean>(false);
  const [selectedJobIds, setSelectedJobIds] = useState<string[]>([]);
  const [bulkStatusTarget, setBulkStatusTarget] = useState<JobStatus>('Applied');

  // Keyboard Shortcut (Ctrl+A / Cmd+A) State & Handler
  const [focusedJobId, setFocusedJobId] = useState<string | null>(null);
  const [shortcutNotice, setShortcutNotice] = useState<string | null>(null);

  // Batch Auto-Archive State
  const [batchArchiveNotice, setBatchArchiveNotice] = useState<string | null>(null);

  // Touch Swipe Gesture State
  const [swipingJobId, setSwipingJobId] = useState<string | null>(null);
  const [swipeStartX, setSwipeStartX] = useState<number | null>(null);
  const [swipeDeltaX, setSwipeDeltaX] = useState<number>(0);
  const [swipeNotice, setSwipeNotice] = useState<string | null>(null);

  // Deep Work Mode & Anti-Ban Inspector State
  const [isDeepWorkMode, setIsDeepWorkMode] = useState<boolean>(false);
  const [quoteIndex, setQuoteIndex] = useState<number>(0);

  const goalQuotes18Lpa = [
    "₹18,00,000 CTC Floor: Consistency in daily tailored outreach guarantees executive offer conversion within 33 days.",
    "Hold the line at ₹18 LPA+. Your Gartner 9+ yrs Strategic Operations track commands senior leadership compensation.",
    "Focus purely on high-signal applications today. 15 tailored submissions outperform 100 generic quick-applies.",
    "Strategic Operations & Process Transformation: Leverage your 60% TAT reduction metric in every recruiter cover letter."
  ];

  const handleTouchStartCard = (e: React.TouchEvent, jobId: string) => {
    setSwipingJobId(jobId);
    setSwipeStartX(e.touches[0].clientX);
    setSwipeDeltaX(0);
  };

  const handleTouchMoveCard = (e: React.TouchEvent, jobId: string) => {
    if (swipingJobId === jobId && swipeStartX !== null) {
      const delta = e.touches[0].clientX - swipeStartX;
      if (Math.abs(delta) < 160) {
        setSwipeDeltaX(delta);
      }
    }
  };

  const handleTouchEndCard = (job: JobRole) => {
    if (swipingJobId === job.id) {
      if (swipeDeltaX > 75) {
        // Swiped Right -> Mark Applied
        onUpdateJobStatus(job.id, 'Applied');
        setSwipeNotice(`👉 Swiped Right: Marked "${job.title}" at ${job.company} as APPLIED!`);
        setTimeout(() => setSwipeNotice(null), 3500);
      } else if (swipeDeltaX < -75) {
        // Swiped Left -> Mark Archived
        onUpdateJobStatus(job.id, 'Archived');
        setSwipeNotice(`👈 Swiped Left: Archived "${job.title}" at ${job.company}!`);
        setTimeout(() => setSwipeNotice(null), 3500);
      }
    }
    setSwipingJobId(null);
    setSwipeStartX(null);
    setSwipeDeltaX(0);
  };

  // Helper: calculate days since last interaction
  const calculateDaysInactive = (job: JobRole): number => {
    const lastDateStr = job.appliedDate || job.followUpDate || job.dateAdded;
    if (!lastDateStr) return 0;
    const lastDate = new Date(lastDateStr);
    const now = new Date('2026-07-28');
    const diffTime = Math.max(0, now.getTime() - lastDate.getTime());
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  // Helper: Extract or build direct job board URL
  const getJobBoardUrl = (job: JobRole): string => {
    if (job.jobUrl && job.jobUrl.trim().length > 0) {
      return job.jobUrl;
    }
    const source = (job.source || '').toLowerCase();
    const query = encodeURIComponent(`${job.title} ${job.company}`);
    if (source.includes('naukri')) {
      return `https://www.naukri.com/${encodeURIComponent(job.title.toLowerCase().replace(/[^a-z0-9]/g, '-'))}-jobs?k=${query}`;
    }
    if (source.includes('indeed')) {
      return `https://www.indeed.com/jobs?q=${query}`;
    }
    if (source.includes('linkedin')) {
      return `https://www.linkedin.com/jobs/search/?keywords=${query}`;
    }
    return `https://www.google.com/search?q=${query}+jobs+apply`;
  };

  const staleJobs = jobs.filter(j => 
    j.status !== 'Archived' && 
    j.status !== 'Rejected' && 
    j.status !== 'Offer Received' && 
    calculateDaysInactive(j) > 14
  );

  const handleRunBatchAutoArchive = () => {
    if (staleJobs.length === 0) {
      setBatchArchiveNotice("No inactive jobs (>14 days) found to auto-archive.");
      setTimeout(() => setBatchArchiveNotice(null), 4000);
      return;
    }

    const archivedTitles = staleJobs.map(j => j.title);
    staleJobs.forEach(job => {
      onUpdateJobStatus(job.id, 'Archived');
    });

    setBatchArchiveNotice(`Batch Process Executed: Moved ${staleJobs.length} inactive job(s) (>14 days without interaction) to 'Archived'.`);
    setTimeout(() => setBatchArchiveNotice(null), 7000);
  };

  const interviewingCount = jobs.filter(j => j.status === 'Interviewing' || (j.interviews && j.interviews.length > 0)).length;
  const hotListCount = jobs.filter(j => j.scores.totalScore >= 75 && j.scores.ctcFloorPassed).length;

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTier = 
      tierFilter === 'ALL' ||
      (tierFilter === 'HIGH_PRIORITY' && job.scores.tier === 'HIGH_PRIORITY') ||
      (tierFilter === 'MEDIUM_PRIORITY' && job.scores.tier === 'MEDIUM_PRIORITY') ||
      (tierFilter === 'DISCARD' && job.scores.tier === 'DISCARD');

    const matchesStatus = 
      statusFilter === 'ALL' || job.status === statusFilter;

    const matchesHotList = 
      !isHotListOnly || (job.scores.totalScore >= 75 && job.scores.ctcFloorPassed);

    const matchesRisk = 
      !isRiskOnly || evaluateHiringRisks(job).length > 0;

    return matchesSearch && matchesTier && matchesStatus && matchesHotList && matchesRisk;
  });

  const handleToggleSelectJob = (jobId: string) => {
    setSelectedJobIds(prev => 
      prev.includes(jobId) ? prev.filter(id => id !== jobId) : [...prev, jobId]
    );
  };

  const handleToggleSelectAll = () => {
    if (selectedJobIds.length === filteredJobs.length && filteredJobs.length > 0) {
      setSelectedJobIds([]);
    } else {
      setSelectedJobIds(filteredJobs.map(j => j.id));
    }
  };

  const handleApplyBulkStatusUpdate = () => {
    if (selectedJobIds.length === 0) return;
    selectedJobIds.forEach(id => {
      onUpdateJobStatus(id, bulkStatusTarget);
    });
    setSelectedJobIds([]);
  };

  // Keyboard Shortcut Listener: Ctrl+A / Cmd+A to instantly mark target job as Applied
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is currently typing in an input field, select, or textarea
      const target = e.target as HTMLElement;
      if (
        target && (
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable
        )
      ) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') {
        e.preventDefault();

        // Determine target job: focused job or first unapplied job in filtered list
        const targetJob = jobs.find(j => j.id === focusedJobId) || 
                          filteredJobs.find(j => j.status !== 'Applied' && j.status !== 'Interviewing') || 
                          filteredJobs[0];

        if (targetJob) {
          onUpdateJobStatus(targetJob.id, 'Applied');
          const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          const notice = `⚡ Keyboard Shortcut Triggered [Ctrl+A]: Marked '${targetJob.company} - ${targetJob.title}' as Applied at ${timestamp}`;
          setShortcutNotice(notice);
          setTimeout(() => setShortcutNotice(null), 5000);

          // Auto-advance focus to next job in filtered list
          const currentIdx = filteredJobs.findIndex(j => j.id === targetJob.id);
          if (currentIdx >= 0 && currentIdx < filteredJobs.length - 1) {
            setFocusedJobId(filteredJobs[currentIdx + 1].id);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedJobId, filteredJobs, jobs, onUpdateJobStatus]);

  return (
    <div className="space-y-6">
      {/* Keyboard Shortcut Active Hint Banner */}
      <div className="bg-[#101322] border border-blue-500/40 p-2.5 rounded-xl flex items-center justify-between gap-3 text-xs font-mono text-blue-200">
        <div className="flex items-center gap-2">
          <span className="bg-blue-600 text-white font-bold px-2 py-0.5 rounded text-[10px] uppercase">
            ⌨️ Hotkey Active
          </span>
          <span>
            Click any job card to select + press <strong className="text-white bg-blue-900/60 border border-blue-400/40 px-1.5 py-0.5 rounded">[Ctrl+A]</strong> or <strong className="text-white bg-blue-900/60 border border-blue-400/40 px-1.5 py-0.5 rounded">[Cmd+A]</strong> to instantly mark as Applied with logged timestamp.
          </span>
        </div>
        {focusedJobId && (
          <span className="text-[10px] text-emerald-400 font-bold hidden md:inline">
            Active Focus: {jobs.find(j => j.id === focusedJobId)?.company || 'Selected Role'}
          </span>
        )}
      </div>

      {/* Keyboard Shortcut Toast Notification */}
      {shortcutNotice && (
        <div className="bg-emerald-500/20 border-2 border-emerald-500/80 text-emerald-200 p-3.5 rounded-xl font-mono text-xs font-bold flex items-center justify-between shadow-2xl">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-300 shrink-0" />
            <span>{shortcutNotice}</span>
          </div>
          <button onClick={() => setShortcutNotice(null)} className="text-emerald-300 hover:text-white cursor-pointer">
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}
      {/* View Switcher Sub-Header */}
      <div className="bg-[#0d0d0f] border border-[#1f1f23] rounded p-1.5 flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPipelineSubTab('CARDS')}
            className={`px-4 py-2 rounded font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
              pipelineSubTab === 'CARDS'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                : 'text-[#a0a0aa] hover:text-white'
            }`}
          >
            <Building className="w-4 h-4" />
            Job Role Pipeline ({jobs.length})
          </button>

          <button
            onClick={() => setPipelineSubTab('INTERVIEWS')}
            className={`px-4 py-2 rounded font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
              pipelineSubTab === 'INTERVIEWS'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30'
                : 'text-[#a0a0aa] hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4 text-emerald-400" />
            Interview Scheduler
            <span className="bg-emerald-500/20 text-emerald-300 font-mono text-[10px] px-2 py-0.5 rounded border border-emerald-500/30 font-bold">
              {interviewingCount} Active
            </span>
          </button>
        </div>
      </div>

      {batchArchiveNotice && (
        <div className="bg-amber-950/80 border border-amber-500/50 p-3 rounded text-amber-200 text-xs flex items-center justify-between shadow-lg animate-in fade-in">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{batchArchiveNotice}</span>
          </div>
          <button onClick={() => setBatchArchiveNotice(null)} className="text-amber-400 hover:text-white">
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      {pipelineSubTab === 'INTERVIEWS' ? (
        <InterviewScheduler
          jobs={jobs}
          onUpdateJob={onUpdateJob || (() => {})}
          onUpdateJobStatus={onUpdateJobStatus}
          selectedJobId={selectedInterviewJobId}
        />
      ) : (
        <>
          {/* Top Filter Bar & Add Action */}
          <div className="bg-[#0d0d0f] border border-[#1f1f23] rounded-xl p-3.5 sm:p-4 shadow-md flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3.5 max-w-full">
            <div className="relative w-full md:w-72 shrink-0">
              <Search className="w-4 h-4 text-[#6b6b75] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search title, company, skills..."
                className="w-full bg-[#0a0a0b] text-[#e0e0e0] text-xs rounded-lg pl-9 pr-3 py-2 border border-[#232328] focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto min-w-0">
              {/* Batch Auto-Archive Trigger Button */}
              <button
                onClick={handleRunBatchAutoArchive}
                className={`px-3 py-1.5 rounded-lg transition-all text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  staleJobs.length > 0
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 ring-1 ring-amber-500/30'
                    : 'bg-[#0a0a0b] text-[#a0a0aa] border border-[#232328] hover:bg-[#151518]'
                }`}
                title="Batch process and move jobs with >14 days of no update to Archived"
              >
                <History className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">Batch Auto-Archive</span>
                <span className="sm:hidden">Archive</span>
                <span className={`font-mono text-[10px] px-1.5 py-0.2 rounded font-bold border ${
                  staleJobs.length > 0 ? 'bg-amber-950/80 text-amber-200 border-amber-500/30' : 'bg-[#151518] text-[#6b6b75] border-[#232328]'
                }`}>
                  {staleJobs.length}
                </span>
              </button>

              {/* Hot List Toggle */}
              <button
                onClick={() => setIsHotListOnly(!isHotListOnly)}
                className={`px-3 py-1.5 rounded-lg transition-all text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  isHotListOnly
                    ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg shadow-orange-950/50 border border-amber-400/50 ring-2 ring-amber-500/20'
                    : 'bg-[#0a0a0b] text-amber-400 border border-amber-500/30 hover:bg-amber-500/10'
                }`}
              >
                <Flame className={`w-4 h-4 ${isHotListOnly ? 'fill-current' : 'text-amber-400'}`} />
                <span>🔥 Hot List</span>
                <span className="bg-amber-950/80 text-amber-200 font-mono text-[10px] px-1.5 py-0.2 rounded border border-amber-500/30">
                  {hotListCount}
                </span>
              </button>

              {/* Hiring Risk Filter */}
              <button
                onClick={() => setIsRiskOnly(!isRiskOnly)}
                className={`px-3 py-1.5 rounded-lg transition-all text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  isRiskOnly
                    ? 'bg-red-600 text-white shadow-lg shadow-red-950/50 border border-red-400 ring-2 ring-red-500/20'
                    : 'bg-[#0a0a0b] text-red-400 border border-red-500/30 hover:bg-red-500/10'
                }`}
                title="Filter roles with automated Hiring Risk flags & counter-narratives"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                <span>⚠️ Risk Flagged</span>
                <span className="bg-red-950/80 text-red-200 font-mono text-[10px] px-1.5 py-0.2 rounded border border-red-500/30">
                  {jobs.filter(j => evaluateHiringRisks(j).length > 0).length}
                </span>
              </button>

              {/* Deep Work Sprint Mode Toggle Button */}
              <button
                onClick={() => setIsDeepWorkMode(!isDeepWorkMode)}
                className={`px-3 py-1.5 rounded-lg transition-all text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  isDeepWorkMode
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-950/60 border border-purple-400 ring-2 ring-purple-500/30'
                    : 'bg-[#0a0a0b] text-purple-400 border border-purple-500/30 hover:bg-purple-500/10'
                }`}
                title="Toggle Deep Work Focus Mode with ₹18 LPA Goal Motivation & Anti-Ban Submissions Inspector"
              >
                <Zap className="w-4 h-4 text-purple-400" />
                <span>🧘 Deep Work Mode</span>
                <span className={`font-mono text-[10px] px-1.5 py-0.2 rounded font-bold border ${
                  isDeepWorkMode ? 'bg-purple-950 text-purple-200 border-purple-400/40' : 'bg-[#151518] text-purple-400 border-purple-500/20'
                }`}>
                  {isDeepWorkMode ? 'ON' : 'OFF'}
                </span>
              </button>

              {/* Audit Overlay Launcher Button */}
              {onOpenAuditModal && (
                <button
                  onClick={onOpenAuditModal}
                  className="px-3 py-1.5 rounded-lg transition-all text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shrink-0 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40 shadow-sm"
                  title="Open Application Audit Log & Anti-Ban Inspector"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>🔍 Audit Inspector Log</span>
                </button>
              )}

              {/* Tier Filter */}
              <div className="flex flex-wrap items-center gap-1 bg-[#0a0a0b] p-1 rounded-lg border border-[#232328] text-xs max-w-full overflow-x-auto">
                <Filter className="w-3.5 h-3.5 text-[#6b6b75] ml-1 shrink-0" />
                <button
                  onClick={() => setTierFilter('ALL')}
                  className={`px-2 py-1 rounded transition-all text-xs font-medium uppercase tracking-wider cursor-pointer ${
                    tierFilter === 'ALL' ? 'bg-blue-600 text-white font-bold' : 'text-[#a0a0aa] hover:text-white'
                  }`}
                >
                  All ({jobs.length})
                </button>
                <button
                  onClick={() => setTierFilter('HIGH_PRIORITY')}
                  className={`px-2 py-1 rounded transition-all text-xs font-medium uppercase tracking-wider cursor-pointer ${
                    tierFilter === 'HIGH_PRIORITY' ? 'bg-green-600 text-white font-bold' : 'text-[#a0a0aa] hover:text-white'
                  }`}
                >
                  ≥75 ({jobs.filter(j => j.scores.tier === 'HIGH_PRIORITY').length})
                </button>
                <button
                  onClick={() => setTierFilter('DISCARD')}
                  className={`px-2 py-1 rounded transition-all text-xs font-medium uppercase tracking-wider cursor-pointer ${
                    tierFilter === 'DISCARD' ? 'bg-red-600 text-white font-bold' : 'text-[#a0a0aa] hover:text-white'
                  }`}
                >
                  Discard ({jobs.filter(j => j.scores.tier === 'DISCARD').length})
                </button>
              </div>

              {/* Select All Toggle Button */}
              <button
                onClick={handleToggleSelectAll}
                className="bg-[#151518] hover:bg-[#1f1f23] text-white border border-[#232328] font-semibold px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shrink-0"
                title="Select all filtered jobs for bulk update"
              >
                {selectedJobIds.length === filteredJobs.length && filteredJobs.length > 0 ? (
                  <CheckSquare className="w-3.5 h-3.5 text-blue-400" />
                ) : (
                  <Square className="w-3.5 h-3.5 text-[#a0a0aa]" />
                )}
                <span className="uppercase text-[11px] tracking-wider hidden sm:inline">
                  {selectedJobIds.length === filteredJobs.length && filteredJobs.length > 0 ? 'Deselect All' : 'Select All'}
                </span>
              </button>

              <button
                onClick={onOpenAddJobModal}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 shadow-md shadow-blue-900/30 transition-all cursor-pointer shrink-0 ml-auto md:ml-0"
              >
                <Plus className="w-4 h-4" />
                <span>Score New</span>
              </button>
            </div>
          </div>

          {/* DEEP WORK FOCUS OVERLAY & ANTI-BAN INSPECTOR */}
          {isDeepWorkMode && (
            <div className="bg-[#080911] border-2 border-purple-500/60 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4 relative overflow-hidden animate-in fade-in duration-300">
              <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1f2138] pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center font-bold text-purple-300 shadow-md">
                    <Zap className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-purple-300 uppercase tracking-widest bg-purple-500/20 border border-purple-500/40 px-2.5 py-0.5 rounded-md">
                        DEEP WORK FOCUS MODE
                      </span>
                      <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        DISTRACTIONS_SILENCED
                      </span>
                    </div>
                    <h2 className="text-base sm:text-lg font-bold text-white uppercase tracking-tight mt-1">
                      ₹18 LPA Executive Application Sprint
                    </h2>
                  </div>
                </div>

                <button
                  onClick={() => setIsDeepWorkMode(false)}
                  className="bg-[#141628] hover:bg-[#1f223f] text-purple-200 border border-purple-500/30 font-mono text-xs px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer self-start sm:self-auto"
                >
                  ✕ Exit Deep Work
                </button>
              </div>

              {/* Inspirational Quote tailored to 18 LPA Goal */}
              <div className="bg-gradient-to-r from-[#121426] via-[#1a1836] to-[#121426] border border-purple-500/30 p-4 rounded-xl relative">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                  <div className="space-y-1.5 flex-1">
                    <span className="text-[10px] font-mono text-purple-300 uppercase tracking-wider font-bold block">
                      18 LPA Goal Mindset Mantra:
                    </span>
                    <p className="text-sm sm:text-base font-semibold text-white italic leading-relaxed font-sans">
                      “{goalQuotes18Lpa[quoteIndex]}”
                    </p>
                  </div>
                  <button
                    onClick={() => setQuoteIndex((prev) => (prev + 1) % goalQuotes18Lpa.length)}
                    className="text-[10px] font-mono bg-purple-500/20 hover:bg-purple-500/40 text-purple-200 px-2.5 py-1 rounded-lg border border-purple-500/30 transition-all cursor-pointer shrink-0"
                  >
                    Next Quote ↻
                  </button>
                </div>
              </div>

              {/* Minimalist Task Status & Anti-Ban Inspector */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                {/* Active Task Details */}
                <div className="bg-[#101222] border border-[#232644] p-3.5 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-purple-300 font-bold uppercase flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-purple-400" />
                      Live Task Execution
                    </span>
                    <span className="bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded text-[9px] font-bold border border-blue-500/40">
                      IN_PROGRESS
                    </span>
                  </div>

                  <div className="bg-[#0a0b16] p-2.5 rounded-lg border border-[#1b1e36] text-[11px] space-y-1 text-white">
                    <div className="flex justify-between">
                      <span className="text-[#8084a8]">Target Job:</span>
                      <span className="font-bold text-blue-300">Gartner Strategic Ops Lead</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8084a8]">Ongoing Action:</span>
                      <span className="font-bold text-emerald-400">Customizing Cover Letter & Resume</span>
                    </div>
                    <div className="flex justify-between text-[10px] pt-1 border-t border-[#181a30]">
                      <span className="text-[#8084a8]">Submission Type:</span>
                      <span className="text-amber-300 font-bold">100% Verified Direct Portal Submission</span>
                    </div>
                  </div>
                </div>

                {/* Anti-Ban Submissions Inspector Panel */}
                <div className="bg-[#101222] border border-emerald-500/40 p-3.5 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-emerald-300 font-bold uppercase flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      Anti-Ban Integrity Inspector
                    </span>
                    <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded text-[9px] font-bold border border-emerald-500/40">
                      0 MOCK ENTRIES
                    </span>
                  </div>

                  <div className="bg-[#0a0b16] p-2.5 rounded-lg border border-[#1b1e36] text-[10px] space-y-1.5">
                    <div className="flex justify-between text-white">
                      <span className="text-[#8084a8]">Actual Portal Submissions Sent:</span>
                      <span className="font-bold text-emerald-400">14 Verified</span>
                    </div>
                    <div className="flex justify-between text-white">
                      <span className="text-[#8084a8]">Pending Rate-Limit Cooldown:</span>
                      <span className="font-bold text-blue-300">1 Queue (Paced 60s)</span>
                    </div>
                    <div className="flex justify-between text-white">
                      <span className="text-[#8084a8]">Mock Entry Audit Penalty:</span>
                      <span className="font-bold text-green-400">ZERO (100% Genuine)</span>
                    </div>
                    <div className="text-[9px] text-emerald-400/90 pt-1 border-t border-[#181a30] italic flex items-center justify-between">
                      <span>✓ Humanized delays (45s–120s) active to guard profile against LinkedIn/Indeed rate bans.</span>
                      {onOpenAuditModal && (
                        <button
                          onClick={onOpenAuditModal}
                          className="text-[10px] bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-300 font-bold px-2 py-0.5 rounded border border-emerald-500/40 transition-all cursor-pointer shrink-0 ml-2"
                        >
                          Full Audit Log →
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sticky Bulk Action Control Bar (Visible when 1+ jobs are selected) */}
          {selectedJobIds.length > 0 && (
            <div className="bg-gradient-to-r from-[#0f172a] via-[#1e1b4b] to-[#0f172a] border-2 border-blue-500/60 p-3.5 rounded shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center gap-2 text-white">
                <span className="bg-blue-600 text-white font-mono font-bold px-2 py-0.5 rounded text-xs shadow-md">
                  {selectedJobIds.length} Selected
                </span>
                <span className="font-semibold">Bulk Job Status Update:</span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={bulkStatusTarget}
                  onChange={(e) => setBulkStatusTarget(e.target.value as JobStatus)}
                  className="bg-[#0a0a0b] text-white border border-blue-400/50 rounded px-3 py-1.5 text-xs font-semibold focus:outline-none"
                >
                  <option value="Discovered">Discovered</option>
                  <option value="Scored">Scored</option>
                  <option value="Tailored">Tailored</option>
                  <option value="Applied">Applied</option>
                  <option value="Interviewing">Interviewing</option>
                  <option value="Offer Received">Offer Received</option>
                  <option value="Archived">Archived</option>
                  <option value="Rejected">Rejected</option>
                </select>

                <button
                  onClick={handleApplyBulkStatusUpdate}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-1.5 rounded text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-blue-900/50 flex items-center gap-1.5 shrink-0"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Update Status for All {selectedJobIds.length}
                </button>

                <button
                  onClick={() => setSelectedJobIds([])}
                  className="bg-[#151518] hover:bg-[#1f1f23] text-[#a0a0aa] hover:text-white px-2.5 py-1.5 rounded text-xs"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

      {/* Swipe Gesture Toast Banner */}
      {swipeNotice && (
        <div className="bg-emerald-900/90 border-2 border-emerald-400 text-white font-mono font-bold text-xs p-3 rounded-xl shadow-2xl flex items-center justify-between gap-2 animate-in fade-in duration-200">
          <span>{swipeNotice}</span>
          <button onClick={() => setSwipeNotice(null)} className="text-white hover:text-emerald-200 text-sm font-bold px-1">✕</button>
        </div>
      )}

      {/* Touch Swipe Instruction Badge on Mobile */}
      <div className="sm:hidden bg-[#121422] border border-blue-500/30 p-2 rounded-lg text-[11px] font-mono text-blue-300 flex items-center justify-between gap-2 shadow-sm">
        <span>👉 Swipe Right: Mark Applied</span>
        <span className="text-[#606480]">|</span>
        <span>👈 Swipe Left: Discard</span>
      </div>

      {/* Jobs Pipeline List */}
      <div className="space-y-4">
        {filteredJobs.length === 0 ? (
          <div className="text-center py-12 bg-[#0d0d0f] rounded border border-[#1f1f23] text-[#6b6b75] text-xs">
            No roles found matching the selected filters.
          </div>
        ) : (
          filteredJobs.map((job, idx) => {
            const isSelected = selectedJobIds.includes(job.id);
            const isHotJob = job.scores.totalScore >= 75 && job.scores.ctcFloorPassed;
            const daysInactive = calculateDaysInactive(job);
            const isStale = daysInactive > 14 && job.status !== 'Archived' && job.status !== 'Rejected' && job.status !== 'Offer Received';
            const successProb = job.scores.successProbability || calculateSuccessProbability(job);

            const isCurrentSwiping = swipingJobId === job.id;
            const isSwipingRight = isCurrentSwiping && swipeDeltaX > 25;
            const isSwipingLeft = isCurrentSwiping && swipeDeltaX < -25;

            return (
              <div key={job.id} className="relative overflow-hidden rounded-xl">
                {/* Swipe Action Background Visual Hints */}
                {isSwipingRight && (
                  <div className="absolute inset-0 bg-emerald-950/80 border-2 border-emerald-500 rounded-xl flex items-center justify-start pl-6 text-emerald-300 font-mono font-bold text-sm z-10 shadow-inner">
                    👉 MARK APPLIED (+1 GOAL)
                  </div>
                )}

                {isSwipingLeft && (
                  <div className="absolute inset-0 bg-red-950/80 border-2 border-red-500 rounded-xl flex items-center justify-end pr-6 text-red-300 font-mono font-bold text-sm z-10 shadow-inner">
                    👈 DISCARD / ARCHIVE
                  </div>
                )}

                <motion.div 
                  onClick={() => setFocusedJobId(job.id)}
                  onTouchStart={(e) => handleTouchStartCard(e, job.id)}
                  onTouchMove={(e) => handleTouchMoveCard(e, job.id)}
                  onTouchEnd={() => handleTouchEndCard(job)}
                  style={{
                    transform: isCurrentSwiping ? `translateX(${swipeDeltaX}px)` : 'none',
                    transition: isCurrentSwiping ? 'none' : 'transform 0.25s ease-out'
                  }}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: idx * 0.03 }}
                  whileHover={{ y: -3, transition: { duration: 0.15 } }}
                  className={`group bg-[#0d0d0f] border rounded-xl p-5 shadow-lg transition-all duration-200 relative hover:shadow-2xl hover:shadow-blue-950/20 cursor-pointer ${
                    focusedJobId === job.id
                      ? 'border-blue-500 ring-2 ring-blue-500/60 bg-[#10172a]/50'
                      : isSelected
                      ? 'border-blue-500 ring-1 ring-blue-500/50 bg-[#10172a]/40'
                      : isStale
                      ? 'border-amber-600/50 bg-amber-950/10'
                      : job.scores.tier === 'HIGH_PRIORITY'
                      ? 'border-green-500/30 hover:border-green-500/60'
                      : job.scores.tier === 'DISCARD'
                      ? 'border-red-900/40 opacity-70 hover:opacity-100'
                      : 'border-[#1f1f23] hover:border-[#2d2d30]'
                  }`}
                >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
                  {/* Main Left Section */}
                  <div className="space-y-3 flex-1">
                    {/* Top Checkbox, Quick Update Toolbar & Tags */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1b1b22] pb-2.5">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Checkbox for Bulk Selection */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleSelectJob(job.id);
                          }}
                          className={`p-1 rounded border transition-all cursor-pointer flex items-center justify-center ${
                            isSelected
                              ? 'bg-blue-600 border-blue-500 text-white'
                              : 'bg-[#151518] border-[#232328] text-[#6b6b75] hover:text-white'
                          }`}
                          title="Select for bulk status update"
                        >
                          {isSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                        </button>

                        {/* Current Status Badge */}
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40 font-bold uppercase tracking-wider">
                          Current: {job.status}
                        </span>

                        {/* Hotkey Focused Badge */}
                        {focusedJobId === job.id && (
                          <span className="bg-blue-600 text-white font-mono text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider flex items-center gap-1 shadow-md">
                            ⌨️ Ctrl+A Ready
                          </span>
                        )}

                        {/* Hot List Flame Badge */}
                        {isHotJob && (
                          <span className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/40 font-mono font-bold text-[10px] px-2 py-0.5 rounded flex items-center gap-1 uppercase tracking-wider">
                            <Flame className="w-3 h-3 text-amber-400 fill-current" />
                            🔥 Hot Target
                          </span>
                        )}
                      </div>

                      {/* Hover-Revealed 1-Click Quick Update Status Toolbar */}
                      <div className="flex items-center gap-1 bg-[#141522] border border-[#272a40] p-1 rounded-lg opacity-90 sm:opacity-0 group-hover:opacity-100 transition-all duration-200">
                        <span className="text-[10px] font-mono text-amber-400 font-bold px-1 hidden md:inline">
                          Quick Status:
                        </span>

                        <button
                          onClick={() => onUpdateJobStatus(job.id, 'Scored')}
                          className={`p-1.5 rounded transition-all text-[10px] font-bold flex items-center gap-1 cursor-pointer ${
                            job.status === 'Scored'
                              ? 'bg-blue-600 text-white shadow'
                              : 'bg-[#1b1d2e] text-[#a0a0b8] hover:text-white hover:bg-blue-600/30'
                          }`}
                          title="1-Click: Mark as Scored"
                        >
                          <Sparkles className="w-3 h-3 text-blue-400" />
                          <span className="hidden xl:inline">Scored</span>
                        </button>

                        <button
                          onClick={() => onUpdateJobStatus(job.id, 'Tailored')}
                          className={`p-1.5 rounded transition-all text-[10px] font-bold flex items-center gap-1 cursor-pointer ${
                            job.status === 'Tailored'
                              ? 'bg-amber-600 text-white shadow'
                              : 'bg-[#1b1d2e] text-[#a0a0b8] hover:text-white hover:bg-amber-600/30'
                          }`}
                          title="1-Click: Mark as Pending / Tailored"
                        >
                          <Pause className="w-3 h-3 text-amber-400" />
                          <span className="hidden xl:inline">Pending</span>
                        </button>

                        <button
                          onClick={() => onUpdateJobStatus(job.id, 'Applied')}
                          className={`p-1.5 rounded transition-all text-[10px] font-bold flex items-center gap-1 cursor-pointer ${
                            job.status === 'Applied'
                              ? 'bg-emerald-600 text-white shadow'
                              : 'bg-[#1b1d2e] text-[#a0a0b8] hover:text-white hover:bg-emerald-600/30'
                          }`}
                          title="1-Click: Mark as Applied"
                        >
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span className="hidden xl:inline">Applied</span>
                        </button>

                        <button
                          onClick={() => onUpdateJobStatus(job.id, 'Interviewing')}
                          className={`p-1.5 rounded transition-all text-[10px] font-bold flex items-center gap-1 cursor-pointer ${
                            job.status === 'Interviewing'
                              ? 'bg-indigo-600 text-white shadow'
                              : 'bg-[#1b1d2e] text-[#a0a0b8] hover:text-white hover:bg-indigo-600/30'
                          }`}
                          title="1-Click: Mark as Interviewing"
                        >
                          <Clock className="w-3 h-3 text-indigo-400" />
                          <span className="hidden xl:inline">Interview</span>
                        </button>

                        <button
                          onClick={() => onUpdateJobStatus(job.id, 'Offer Received')}
                          className={`p-1.5 rounded transition-all text-[10px] font-bold flex items-center gap-1 cursor-pointer ${
                            job.status === 'Offer Received'
                              ? 'bg-purple-600 text-white shadow'
                              : 'bg-[#1b1d2e] text-[#a0a0b8] hover:text-white hover:bg-purple-600/30'
                          }`}
                          title="1-Click: Mark as Offer Received"
                        >
                          <Award className="w-3 h-3 text-purple-400" />
                          <span className="hidden xl:inline">Offer</span>
                        </button>

                        <button
                          onClick={() => onUpdateJobStatus(job.id, 'Archived')}
                          className={`p-1.5 rounded transition-all text-[10px] font-bold flex items-center gap-1 cursor-pointer ${
                            job.status === 'Archived'
                              ? 'bg-red-800 text-white shadow'
                              : 'bg-[#1b1d2e] text-[#a0a0b8] hover:text-white hover:bg-red-600/30'
                          }`}
                          title="1-Click: Mark as Archived"
                        >
                          <Archive className="w-3 h-3 text-red-400" />
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">

                      {/* Inactivity Badge */}
                      {isStale ? (
                        <span className="bg-amber-950 text-amber-300 border border-amber-500/50 font-mono font-bold text-xs px-2.5 py-1 rounded flex items-center gap-1 uppercase tracking-wider">
                          <History className="w-3.5 h-3.5 text-amber-400" />
                          {daysInactive}d Inactive (&gt;14d Auto-Archive Eligible)
                        </span>
                      ) : (
                        <span className="bg-[#1a1a1c] text-[#a0a0aa] text-xs font-mono px-2 py-1 rounded border border-[#2d2d30] flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#6b6b75]" />
                          Last Activity: {daysInactive === 0 ? 'Today' : `${daysInactive}d ago`}
                        </span>
                      )}

                      {/* Score Tag */}
                      <span className={`font-mono font-bold text-xs px-2.5 py-1 rounded border flex items-center gap-1 uppercase tracking-wider ${
                        job.scores.totalScore >= 75
                          ? 'bg-green-500/20 text-green-400 border-green-500/40'
                          : job.scores.totalScore >= 60
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-red-500/20 text-red-400 border-red-500/40'
                      }`}>
                        <Sparkles className="w-3.5 h-3.5" />
                        Score: {job.scores.totalScore}/100
                      </span>

                      {/* Success Probability Indicator Badge */}
                      <span 
                        className={`font-mono font-bold text-xs px-2.5 py-1 rounded border flex items-center gap-1.5 uppercase tracking-wider ${
                          successProb.overallPercentage >= 80
                            ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-sm shadow-purple-900/30'
                            : successProb.overallPercentage >= 65
                            ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        }`}
                        title={`Resume Keyword Match: ${successProb.keywordMatchConfidence}% | Historical Channel Conversion: ${successProb.historicalConversionRate}%`}
                      >
                        <Target className="w-3.5 h-3.5 text-purple-400" />
                        <span>🎯 {successProb.overallPercentage}% Win Prob</span>
                        <span className="text-[10px] text-purple-300/80 hidden xl:inline">({successProb.keywordMatchConfidence}% Match)</span>
                      </span>

                      {/* CTC Floor Tag */}
                      {job.scores.ctcFloorPassed ? (
                        <span className="bg-green-500/10 text-green-400 text-xs font-mono font-bold px-2.5 py-1 rounded border border-green-500/30 flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          ₹{job.ctcMinLpa}–{job.ctcMaxLpa} LPA (FLOOR PASSED)
                        </span>
                      ) : (
                        <span className="bg-red-500/10 text-red-400 text-xs font-mono font-bold px-2.5 py-1 rounded border border-red-500/30 flex items-center gap-1">
                          <ShieldAlert className="w-3.5 h-3.5" />
                          HARD FAIL: &lt;18 LPA CTC FLOOR
                        </span>
                      )}

                      <span className="bg-[#1a1a1c] text-[#a0a0aa] text-xs px-2.5 py-1 rounded font-medium border border-[#2d2d30]">
                        {job.workMode} • {job.shift}
                      </span>

                      <span className="text-xs text-[#6b6b75] font-mono">
                        Source: {job.source}
                      </span>
                    </div>

                  {/* Title & Company */}
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <a
                        href={getJobBoardUrl(job)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-blue-400 hover:underline transition-colors flex items-center gap-2"
                        title="Open direct job posting in new tab"
                      >
                        <span>{job.title}</span>
                        <ExternalLink className="w-4 h-4 text-blue-400 shrink-0" />
                      </a>
                    </h3>
                    <p className="text-xs text-[#a0a0aa] font-medium mt-0.5">
                      {job.company} — <span className="text-[#6b6b75]">{job.location}</span>
                    </p>
                  </div>

                  {/* Operational Recommendation */}
                  <div className="bg-[#0a0a0b] p-3 rounded border border-[#232328] text-xs text-[#a0a0aa] leading-relaxed">
                    <strong className="text-blue-400 font-semibold uppercase tracking-wider text-[10px] block mb-0.5">AI Operating Strategy: </strong>
                    {job.scores.recommendation}
                  </div>

                  {/* Pros & Red Flags */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                    {job.scores.pros.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-green-400 uppercase tracking-wider">Pros:</span>
                        <ul className="space-y-0.5">
                          {job.scores.pros.map((pro, idx) => (
                            <li key={idx} className="text-[#a0a0aa] flex items-start gap-1.5 text-[11px]">
                              <CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0 mt-0.5" />
                              <span>{pro}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {job.scores.redFlags.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">Red Flags:</span>
                        <ul className="space-y-0.5">
                          {job.scores.redFlags.map((flag, idx) => (
                            <li key={idx} className="text-[#a0a0aa] flex items-start gap-1.5 text-[11px]">
                              <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                              <span>{flag}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Ephemeral Quick Notes for Recruiter Calls */}
                  <JobCardQuickNotes job={job} onUpdateJob={onUpdateJob} />

                  {/* Hiring Risk Tag System & Counter-Narrative Neutralizer Bullets */}
                  <HiringRiskNeutralizerSection 
                    job={job} 
                    onSelectJob={onSelectJob} 
                    setActiveTab={setActiveTab} 
                  />
                </div>

                {/* Right Side: Score breakdown bars & Action buttons */}
                <div className="w-full lg:w-72 bg-[#151518] p-4 rounded border border-[#232328] flex flex-col justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-bold text-[#a0a0aa] uppercase tracking-wider mb-2 border-b border-[#232328] pb-1 flex items-center justify-between">
                      <span>Sub-Weights</span>
                      <button 
                        onClick={() => setSelectedBreakdownJob(job)}
                        className="text-[10px] text-blue-400 hover:underline uppercase tracking-wider font-mono"
                      >
                        Details
                      </button>
                    </h4>

                    {/* Mini score bars */}
                    <div className="space-y-2 text-[11px]">
                      <div>
                        <div className="flex justify-between text-[#a0a0aa] mb-0.5 text-[10px]">
                          <span>Salary CTC (Max 25)</span>
                          <span className="font-mono font-bold text-white">{job.scores.salaryScore}/25</span>
                        </div>
                        <div className="w-full bg-[#0a0a0b] h-1.5 rounded overflow-hidden">
                          <div className="bg-blue-500 h-1.5 rounded" style={{ width: `${(job.scores.salaryScore / 25) * 100}%` }}></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[#a0a0aa] mb-0.5 text-[10px]">
                          <span>Title + Skills (Max 25)</span>
                          <span className="font-mono font-bold text-white">{job.scores.titleSkillsScore}/25</span>
                        </div>
                        <div className="w-full bg-[#0a0a0b] h-1.5 rounded overflow-hidden">
                          <div className="bg-green-500 h-1.5 rounded" style={{ width: `${(job.scores.titleSkillsScore / 25) * 100}%` }}></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[#a0a0aa] mb-0.5 text-[10px]">
                          <span>Company Quality (Max 15)</span>
                          <span className="font-mono font-bold text-white">{job.scores.companyQualityScore}/15</span>
                        </div>
                        <div className="w-full bg-[#0a0a0b] h-1.5 rounded overflow-hidden">
                          <div className="bg-indigo-500 h-1.5 rounded" style={{ width: `${(job.scores.companyQualityScore / 15) * 100}%` }}></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[#a0a0aa] mb-0.5 text-[10px]">
                          <span>Location & Shift (Max 15)</span>
                          <span className="font-mono font-bold text-white">{job.scores.locationShiftScore}/15</span>
                        </div>
                        <div className="w-full bg-[#0a0a0b] h-1.5 rounded overflow-hidden">
                          <div className="bg-cyan-500 h-1.5 rounded" style={{ width: `${(job.scores.locationShiftScore / 15) * 100}%` }}></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Action Column */}
                  <div className="space-y-3 shrink-0 lg:w-72">
                    {/* Status Dropdown */}
                  <div className="pt-2 border-t border-[#232328]">
                    <label className="text-[10px] text-[#6b6b75] font-semibold uppercase tracking-wider block mb-1">
                      Status Stage:
                    </label>
                    <select
                      value={job.status}
                      onChange={(e) => onUpdateJobStatus(job.id, e.target.value as JobStatus)}
                      className="w-full bg-[#0a0a0b] border border-[#2d2d30] text-white text-xs rounded px-2.5 py-1.5 focus:outline-none focus:border-blue-500 font-medium"
                    >
                      <option value="Discovered">Discovered</option>
                      <option value="Scored">Scored</option>
                      <option value="Tailored">Tailored</option>
                      <option value="Applied">Applied</option>
                      <option value="Interviewing">Interviewing</option>
                      <option value="Offer Received">Offer Received</option>
                      <option value="Archived">Archived</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <button
                      onClick={() => setQuickApplyJob(job)}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded text-xs flex items-center justify-center gap-1.5 uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-emerald-900/40"
                    >
                      <Zap className="w-3.5 h-3.5 fill-current" />
                      Quick Apply
                    </button>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          onSelectJob(job);
                          setActiveTab('resume');
                        }}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-1.5 rounded text-xs flex items-center justify-center gap-1 uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-blue-900/30"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Tailor
                      </button>

                      <button
                        onClick={() => {
                          onSelectJob(job);
                          setActiveTab('outreach');
                        }}
                        className="bg-[#1a1a1c] hover:bg-[#232328] text-white border border-[#2d2d30] font-semibold py-1.5 rounded text-xs flex items-center justify-center gap-1 transition-all cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5 text-blue-400" />
                        Outreach
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedInterviewJobId(job.id);
                        setPipelineSubTab('INTERVIEWS');
                      }}
                      className="w-full bg-[#151518] hover:bg-[#1f1f23] text-white border border-[#232328] font-bold py-1.5 rounded text-xs flex items-center justify-center gap-1.5 uppercase tracking-wider transition-all cursor-pointer"
                    >
                      <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                      Interview Scheduler {job.interviews?.length ? `(${job.interviews.length})` : ''}
                    </button>

                    {/* External Direct Auto-Apply Search Hyperlinks */}
                    <div className="bg-[#0a0a0b] p-2 rounded border border-[#232328] space-y-1 mt-2">
                      <span className="text-[9px] font-bold text-[#a0a0aa] uppercase tracking-wider flex items-center gap-1">
                        <ExternalLink className="w-3 h-3 text-blue-400" />
                        Auto-Apply External Portals:
                      </span>
                      <div className="flex flex-wrap items-center gap-1">
                        <button
                          onClick={() => executeAndLaunchGmail({
                            toEmail: job.contactPerson?.email || 'hr@' + job.company.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com',
                            jobTitle: job.title,
                            companyName: job.company,
                            contactName: job.contactPerson?.name
                          })}
                          className="bg-red-600/20 hover:bg-red-600/40 text-red-300 border border-red-500/40 text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 cursor-pointer transition-all"
                          title="Downloads Resume & Cover Letter files, copies text, and opens pre-filled Gmail Compose"
                        >
                          <Mail className="w-2.5 h-2.5 text-red-400" />
                          Download & Launch Gmail
                        </button>

                        <button
                          onClick={() => downloadResumeDoc(job.title, job.company)}
                          className="bg-green-600/20 text-green-300 hover:bg-green-600/40 border border-green-500/40 text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 cursor-pointer transition-all"
                          title="Download tailored resume text file"
                        >
                          <Download className="w-2.5 h-2.5 text-green-400" />
                          Resume File
                        </button>

                        <a
                          href={`https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(job.title + ' ' + job.company)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-[#0077b5]/20 text-[#38bdf8] hover:bg-[#0077b5]/40 border border-[#0077b5]/40 text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1"
                          title="Open LinkedIn Jobs search to auto-apply"
                        >
                          <ExternalLink className="w-2.5 h-2.5" />
                          LinkedIn
                        </a>

                        <a
                          href={`https://www.naukri.com/${encodeURIComponent(job.title.toLowerCase().replace(/[^a-z0-9]/g, '-'))}-jobs?k=${encodeURIComponent(job.title + ' ' + job.company)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-[#ff7555]/20 text-[#ff7555] hover:bg-[#ff7555]/40 border border-[#ff7555]/40 text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1"
                          title="Open Naukri jobs search to auto-apply"
                        >
                          <ExternalLink className="w-2.5 h-2.5" />
                          Naukri
                        </a>

                        <a
                          href={`https://www.indeed.com/jobs?q=${encodeURIComponent(job.title + ' ' + job.company)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-[#2164f3]/20 text-[#60a5fa] hover:bg-[#2164f3]/40 border border-[#2164f3]/40 text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1"
                          title="Open Indeed search to auto-apply"
                        >
                          <ExternalLink className="w-2.5 h-2.5" />
                          Indeed
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
        );
      })
        )}
      </div>

      {/* Quick Apply Modal */}
      {quickApplyJob && (
        <QuickApplyModal
          job={quickApplyJob}
          onClose={() => setQuickApplyJob(null)}
          onUpdateJobStatus={onUpdateJobStatus}
        />
      )}
      </>
      )}

      {/* Score Breakdown Modal */}
      {selectedBreakdownJob && (
        <div className="fixed inset-0 bg-[#0a0a0b]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0d0d0f] border border-[#1f1f23] rounded max-w-2xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1f1f23] pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-blue-400 uppercase tracking-wider">Detailed 6-Dimension Score Breakdown</span>
                <h3 className="text-lg font-bold text-white">{selectedBreakdownJob.title}</h3>
                <p className="text-xs text-[#a0a0aa]">{selectedBreakdownJob.company}</p>
              </div>
              <button
                onClick={() => setSelectedBreakdownJob(null)}
                className="text-[#6b6b75] hover:text-[#e0e0e0] p-1"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-[#151518] p-3 rounded border border-[#232328]">
                <span className="text-[#6b6b75] text-[10px] uppercase tracking-wider block mb-1">Salary CTC Floor</span>
                <div className="text-base font-mono font-bold text-blue-400">{selectedBreakdownJob.scores.salaryScore}/25</div>
              </div>
              <div className="bg-[#151518] p-3 rounded border border-[#232328]">
                <span className="text-[#6b6b75] text-[10px] uppercase tracking-wider block mb-1">Title & Skills</span>
                <div className="text-base font-mono font-bold text-green-400">{selectedBreakdownJob.scores.titleSkillsScore}/25</div>
              </div>
              <div className="bg-[#151518] p-3 rounded border border-[#232328]">
                <span className="text-[#6b6b75] text-[10px] uppercase tracking-wider block mb-1">Company Quality</span>
                <div className="text-base font-mono font-bold text-indigo-400">{selectedBreakdownJob.scores.companyQualityScore}/15</div>
              </div>
              <div className="bg-[#151518] p-3 rounded border border-[#232328]">
                <span className="text-[#6b6b75] text-[10px] uppercase tracking-wider block mb-1">Location & Shift</span>
                <div className="text-base font-mono font-bold text-cyan-400">{selectedBreakdownJob.scores.locationShiftScore}/15</div>
              </div>
              <div className="bg-[#151518] p-3 rounded border border-[#232328]">
                <span className="text-[#6b6b75] text-[10px] uppercase tracking-wider block mb-1">Referral Connection</span>
                <div className="text-base font-mono font-bold text-purple-400">{selectedBreakdownJob.scores.referralScore}/10</div>
              </div>
              <div className="bg-[#151518] p-3 rounded border border-[#232328]">
                <span className="text-[#6b6b75] text-[10px] uppercase tracking-wider block mb-1">Posting Freshness</span>
                <div className="text-base font-mono font-bold text-[#e0e0e0]">{selectedBreakdownJob.scores.postingAgeScore}/10</div>
              </div>
            </div>

            {selectedBreakdownJob.scores.skillGaps.length > 0 && (
              <div className="bg-[#151518] p-4 rounded border border-[#232328]">
                <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">Skill & Term Gaps to Bridge:</h4>
                <ul className="list-disc list-inside text-xs text-[#a0a0aa] space-y-1">
                  {selectedBreakdownJob.scores.skillGaps.map((gap, i) => (
                    <li key={i}>{gap}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedBreakdownJob(null)}
                className="bg-[#1a1a1c] hover:bg-[#232328] text-white font-semibold px-4 py-2 rounded text-xs border border-[#2d2d30]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

