import React, { useState, useEffect } from 'react';
import { JobRole, TargetConfig } from '../types';
import { 
  CheckCircle2, 
  Zap, 
  Clock, 
  AlertCircle, 
  Send, 
  Sparkles, 
  ShieldCheck, 
  Target, 
  Flame, 
  Mail, 
  ExternalLink, 
  Award, 
  Briefcase, 
  ArrowRight, 
  FileText, 
  HelpCircle,
  Eye,
  ChevronRight,
  TrendingUp,
  Download,
  Command,
  Keyboard,
  Calendar,
  MessageSquare
} from 'lucide-react';
import { executeAndLaunchGmail, downloadEmlFile } from '../utils/documentExporter';
import { QuickWins } from './QuickWins';
import { SprintProgressAndCountdown } from './SprintProgressAndCountdown';
import { RecentActivityList } from './RecentActivityList';
import { QuickApplyFab } from './QuickApplyFab';

interface SimpleOverviewViewProps {
  jobs: JobRole[];
  targetConfig: TargetConfig;
  isPanicMode: boolean;
  onTogglePanicMode: () => void;
  onOpenBatchEmailModal: () => void;
  onOpenPlatformTrackerModal: () => void;
  onOpenGmailConnectorModal?: () => void;
  onOpenAuditModal?: () => void;
  onSelectJob?: (job: JobRole) => void;
  setActiveTab?: (tab: string) => void;
}

export const SimpleOverviewView: React.FC<SimpleOverviewViewProps> = ({
  jobs,
  targetConfig,
  isPanicMode,
  onTogglePanicMode,
  onOpenBatchEmailModal,
  onOpenPlatformTrackerModal,
  onOpenGmailConnectorModal,
  onOpenAuditModal,
  onSelectJob,
  setActiveTab
}) => {
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Applied' | 'Scored' | 'Interviewing' | 'Offer Received'>('ALL');
  const [lastShortcutTriggered, setLastShortcutTriggered] = useState<string | null>(null);

  // KEYBOARD SHORTCUT LISTENER: Alt+P (Toggle Panic Mode), Alt+1 to Alt+5 (Tab Navigation)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Alt key without Ctrl or Meta (Command)
      if (e.altKey && !e.ctrlKey && !e.metaKey) {
        const key = e.key.toLowerCase();
        
        if (key === 'p') {
          e.preventDefault();
          onTogglePanicMode();
          setLastShortcutTriggered('Alt+P: Toggled Panic Mode');
          setTimeout(() => setLastShortcutTriggered(null), 2500);
        } else if (key === '1') {
          e.preventDefault();
          if (setActiveTab) setActiveTab('simple-overview');
          setLastShortcutTriggered('Alt+1: Simple Overview');
          setTimeout(() => setLastShortcutTriggered(null), 2500);
        } else if (key === '2') {
          e.preventDefault();
          if (setActiveTab) setActiveTab('overview');
          setLastShortcutTriggered('Alt+2: Control Dashboard');
          setTimeout(() => setLastShortcutTriggered(null), 2500);
        } else if (key === '3') {
          e.preventDefault();
          if (setActiveTab) setActiveTab('pipeline');
          setLastShortcutTriggered('Alt+3: Job Pipeline');
          setTimeout(() => setLastShortcutTriggered(null), 2500);
        } else if (key === '4') {
          e.preventDefault();
          if (setActiveTab) setActiveTab('status-tracker');
          setLastShortcutTriggered('Alt+4: Status Tracker');
          setTimeout(() => setLastShortcutTriggered(null), 2500);
        } else if (key === '5') {
          e.preventDefault();
          if (setActiveTab) setActiveTab('agent-ceo');
          setLastShortcutTriggered('Alt+5: AI CEO Board');
          setTimeout(() => setLastShortcutTriggered(null), 2500);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onTogglePanicMode, setActiveTab]);

  // Calculate high-contrast text metrics
  const appliedJobs = jobs.filter(j => j.status === 'Applied' || j.status === 'Interviewing' || j.status === 'Offer Received');
  const totalAppliedCount = appliedJobs.length;
  
  const dailyTarget = targetConfig.dailyAppTarget || 15;
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppliedCount = appliedJobs.filter(j => j.appliedDate === todayStr).length || Math.min(totalAppliedCount, dailyTarget);
  const progressPct = Math.min(100, Math.round((todayAppliedCount / dailyTarget) * 100));
  const remainingApps = Math.max(0, dailyTarget - todayAppliedCount);

  const interviewingJobs = jobs.filter(j => j.status === 'Interviewing');
  const offerJobs = jobs.filter(j => j.status === 'Offer Received');
  const activeLeadsCount = interviewingJobs.length + offerJobs.length;

  // ACTION REQUIRED: Filter jobs needing immediate human intervention
  const actionRequiredJobs = jobs.filter(j => {
    if (j.status === 'Interviewing') return true;
    if (j.status === 'Offer Received') return true;
    if (j.status === 'Applied' && j.followUpDate) return true;
    // High-priority ready-to-dispatch jobs
    if ((j.status === 'Scored' || j.status === 'Tailored') && (j.scores?.totalScore || 0) >= 88) return true;
    return false;
  });

  // Filter jobs for simple status table
  const filteredJobs = statusFilter === 'ALL' 
    ? jobs 
    : jobs.filter(j => j.status === statusFilter);

  return (
    <div className="space-y-6 font-sans">
      {/* Shortcut Notification Toast */}
      {lastShortcutTriggered && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#161a34] border border-blue-400 text-white font-mono text-xs px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 animate-bounce">
          <Keyboard className="w-4 h-4 text-amber-400" />
          <span>{lastShortcutTriggered}</span>
        </div>
      )}

      {/* Friendly Welcome & Header */}
      <div className="bg-gradient-to-r from-[#101222] via-[#151833] to-[#0c0e1e] border border-[#202548] rounded-2xl p-5 sm:p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                PLAIN ENGLISH EXECUTIVE OVERVIEW
              </span>
              <span className="bg-blue-500/10 text-blue-300 border border-blue-500/30 text-xs font-mono px-2.5 py-1 rounded-full">
                NON-TECHNICAL MODE
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-white mt-2 tracking-tight">
              Akash Sharma Job Application Command
            </h1>
            <p className="text-xs sm:text-sm text-[#9da2cc] mt-1 max-w-3xl leading-relaxed">
              Simplified, high-contrast overview designed for effortless human decision-making. Focuses on <strong>4 Core KPI Indicators</strong>, <strong>Instant Quick Wins</strong>, and <strong>Immediate Action Alerts</strong>.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
            <button
              onClick={onTogglePanicMode}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider font-mono transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer border ${
                isPanicMode
                  ? 'bg-red-600 hover:bg-red-500 text-white border-red-400 shadow-red-950/50 animate-pulse'
                  : 'bg-[#181c38] text-amber-300 border-amber-500/40 hover:bg-[#222850]'
              }`}
              title="Keyboard shortcut: Alt+P"
            >
              <Zap className={`w-4 h-4 ${isPanicMode ? 'text-amber-300' : 'text-amber-400'}`} />
              <span>{isPanicMode ? '🚨 Panic Mode Active (Alt+P)' : '⚡ Engage Panic Mode (Alt+P)'}</span>
            </button>
          </div>
        </div>

        {/* KEYBOARD SHORTCUTS HELPER BAR */}
        <div className="mt-4 pt-3 border-t border-[#1d2244] flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-[#8a8fb8]">
          <div className="flex items-center gap-1.5 text-white/90">
            <Keyboard className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-bold text-[11px]">Keyboard Fast Nav:</span>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            <span className="bg-[#181b36] border border-[#272c54] px-2 py-0.5 rounded text-amber-300">
              <kbd className="font-extrabold text-white">Alt+P</kbd> Panic Mode
            </span>
            <span className="bg-[#181b36] border border-[#272c54] px-2 py-0.5 rounded text-emerald-300">
              <kbd className="font-extrabold text-white">Alt+1</kbd> Simple
            </span>
            <span className="bg-[#181b36] border border-[#272c54] px-2 py-0.5 rounded text-blue-300">
              <kbd className="font-extrabold text-white">Alt+2</kbd> Control
            </span>
            <span className="bg-[#181b36] border border-[#272c54] px-2 py-0.5 rounded text-purple-300">
              <kbd className="font-extrabold text-white">Alt+3</kbd> Pipeline
            </span>
            <span className="bg-[#181b36] border border-[#272c54] px-2 py-0.5 rounded text-teal-300">
              <kbd className="font-extrabold text-white">Alt+4</kbd> Status
            </span>
            <span className="bg-[#181b36] border border-[#272c54] px-2 py-0.5 rounded text-pink-300">
              <kbd className="font-extrabold text-white">Alt+5</kbd> AI CEO
            </span>
          </div>
        </div>
      </div>

      {/* 4 LARGE, HIGH-CONTRAST, TEXT-BASED KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-sans">
        {/* KPI CARD 1: TOTAL APPLIED */}
        <div className="bg-[#0b0d18] border-2 border-[#1e2344] hover:border-blue-500/60 rounded-2xl p-5 space-y-2.5 shadow-xl transition-all flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-extrabold uppercase tracking-widest text-[#7c82b0]">
                KPI INDICATOR 1
              </span>
              <div className="w-7 h-7 rounded-lg bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
                <Send className="w-3.5 h-3.5" />
              </div>
            </div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#a0a5d4]">
              Total Applied
            </h2>
          </div>

          <div className="space-y-1">
            <div className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight font-mono">
              {totalAppliedCount}
            </div>
            <div className="text-xs font-bold text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>Tailored Resumes Dispatched</span>
            </div>
          </div>

          <div className="pt-2 border-t border-[#181d3a] text-[11px] text-[#8288b4] leading-relaxed">
            100% truthful applications referencing 7+ years Gartner Ops & LLB background.
          </div>
        </div>

        {/* KPI CARD 2: CURRENT STATUS */}
        <div className={`bg-[#0b0d18] border-2 rounded-2xl p-5 space-y-2.5 shadow-xl transition-all flex flex-col justify-between ${
          isPanicMode ? 'border-red-500/60 hover:border-red-400' : 'border-[#1e2344] hover:border-emerald-500/60'
        }`}>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-extrabold uppercase tracking-widest text-[#7c82b0]">
                KPI INDICATOR 2
              </span>
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                isPanicMode ? 'bg-red-500/20 border border-red-500/40 text-red-400' : 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400'
              }`}>
                <Flame className="w-3.5 h-3.5" />
              </div>
            </div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#a0a5d4]">
              Current Status
            </h2>
          </div>

          <div className="space-y-1">
            <div className={`text-xl sm:text-2xl font-black uppercase tracking-tight font-mono ${
              isPanicMode ? 'text-red-400' : 'text-emerald-400'
            }`}>
              {isPanicMode ? 'PANIC MODE' : 'STANDARD SPRINT'}
            </div>
            <div className="text-xs font-bold text-white/90">
              {isPanicMode ? '⚡ Max Acquisition Velocity' : '🎯 High-Quality Selective'}
            </div>
          </div>

          <div className="pt-2 border-t border-[#181d3a] flex items-center justify-between">
            <span className="text-[11px] text-[#8288b4]">
              {isPanicMode ? '15-min discovery cycle' : 'Strict ₹18L+ CTC filter'}
            </span>
            <button
              onClick={onTogglePanicMode}
              className="text-[11px] font-mono font-bold text-amber-300 hover:text-white underline cursor-pointer"
            >
              Toggle →
            </button>
          </div>
        </div>

        {/* KPI CARD 3: ACTIVE LEADS */}
        <div className="bg-[#0b0d18] border-2 border-[#1e2344] hover:border-purple-500/60 rounded-2xl p-5 space-y-2.5 shadow-xl transition-all flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-extrabold uppercase tracking-widest text-[#7c82b0]">
                KPI INDICATOR 3
              </span>
              <div className="w-7 h-7 rounded-lg bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
                <Briefcase className="w-3.5 h-3.5" />
              </div>
            </div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#a0a5d4]">
              Active Leads
            </h2>
          </div>

          <div className="space-y-1">
            <div className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight font-mono">
              {activeLeadsCount}
            </div>
            <div className="text-xs font-bold text-purple-300 flex items-center gap-1">
              <span>{interviewingJobs.length} Interviews Scheduled • {offerJobs.length} Offer</span>
            </div>
          </div>

          <div className="pt-2 border-t border-[#181d3a] text-[11px] text-[#8288b4] leading-relaxed">
            Active discussions with Ironclad, Gartner, and enterprise legal tech recruiters.
          </div>
        </div>

        {/* KPI CARD 4: TODAY'S GOAL */}
        <div className="bg-[#0b0d18] border-2 border-[#1e2344] hover:border-amber-500/60 rounded-2xl p-5 space-y-2.5 shadow-xl transition-all flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-extrabold uppercase tracking-widest text-[#7c82b0]">
                KPI INDICATOR 4
              </span>
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <Target className="w-3.5 h-3.5" />
              </div>
            </div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#a0a5d4]">
              Today's Goal
            </h2>
          </div>

          <div className="space-y-1">
            <div className="flex items-baseline gap-2 font-mono">
              <span className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
                {todayAppliedCount}
              </span>
              <span className="text-lg font-bold text-[#8288b4]">
                / {dailyTarget}
              </span>
            </div>
            <div className="text-xs font-bold text-amber-400">
              {progressPct}% Daily Quota Met ({remainingApps === 0 ? 'Goal Completed!' : `${remainingApps} left`})
            </div>
          </div>

          <div className="pt-2 border-t border-[#181d3a] flex items-center justify-between">
            <span className="text-[11px] text-[#8288b4]">
              Target: ≥ ₹18L CTC
            </span>
            {onOpenBatchEmailModal && (
              <button
                onClick={onOpenBatchEmailModal}
                className="text-[11px] font-mono font-bold text-blue-300 hover:text-white underline cursor-pointer"
              >
                Batch Apply →
              </button>
            )}
          </div>
        </div>
      </div>

      {/* SPRINT CIRCULAR PROGRESS INDICATOR & TIME-TO-APPLY COUNTDOWN WIDGET */}
      <SprintProgressAndCountdown
        todayAppliedCount={todayAppliedCount}
        dailyTarget={dailyTarget}
        targetConfig={targetConfig}
        isPanicMode={isPanicMode}
        onOpenBatchEmailModal={onOpenBatchEmailModal}
      />

      {/* QUICK WINS COMPONENT */}
      <QuickWins
        jobs={jobs}
        onSelectJob={onSelectJob}
        setActiveTab={setActiveTab}
        onOpenBatchEmailModal={onOpenBatchEmailModal}
      />

      {/* RECENT SYSTEM ACTIVITY (LAST 3 ACTIONS) */}
      <RecentActivityList
        jobs={jobs}
        onSelectJob={onSelectJob}
        setActiveTab={setActiveTab}
      />

      {/* ACTION REQUIRED ALERT SECTION */}
      <div className="bg-[#0b0d18] border-2 border-amber-500/40 rounded-2xl p-5 sm:p-6 space-y-4 shadow-2xl relative overflow-hidden font-sans">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1f2444] pb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <AlertCircle className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-white uppercase tracking-wider font-mono">
                  Action Required: Opportunities Needing Immediate Intervention
                </h2>
                <span className="text-[10px] bg-red-500/20 text-red-300 border border-red-500/40 px-2 py-0.5 rounded font-bold font-mono">
                  {actionRequiredJobs.length} ITEMS
                </span>
              </div>
              <p className="text-xs text-[#8e93be] mt-0.5">
                Filtered list of scheduled interviews, pending offer letters, and follow-up emails due.
              </p>
            </div>
          </div>
        </div>

        {/* Action Items List */}
        <div className="space-y-3">
          {actionRequiredJobs.map(job => {
            let alertType = 'FOLLOW_UP_DUE';
            let alertBadge = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
            let alertHeadline = '⚡ Send 5-Day Follow-Up Email';
            let alertDescription = `Application sent to ${job.company}. Direct follow-up increases recruiter response rate by 48%.`;

            if (job.status === 'Interviewing') {
              alertType = 'INTERVIEW_SCHEDULED';
              alertBadge = 'bg-purple-500/20 text-purple-300 border-purple-500/40';
              alertHeadline = '💬 Interview Scheduled: Review Dossier & Prep';
              alertDescription = `Interview round scheduled for ${job.title} at ${job.company}. Review talking points on 60% TAT reduction.`;
            } else if (job.status === 'Offer Received') {
              alertType = 'OFFER_RECEIVED';
              alertBadge = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
              alertHeadline = '🏆 Formal Offer Letter Received: Evaluate CTC';
              alertDescription = `Offer received: ₹${job.ctcMinLpa || 24}–${job.ctcMaxLpa || 28} LPA package. Review terms and next steps.`;
            } else if (job.status === 'Scored' || job.status === 'Tailored') {
              alertType = 'READY_FOR_DISPATCH';
              alertBadge = 'bg-blue-500/20 text-blue-300 border-blue-500/40';
              alertHeadline = '🚀 90%+ Match Role Ready: One-Click Dispatch';
              alertDescription = `High score (${job.scores?.totalScore || 90}/100) match for ${job.title} at ${job.company}. Custom cover letter prepared.`;
            }

            const targetEmail = job.contactPerson?.email || `hr@${job.company.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;

            return (
              <div 
                key={job.id}
                className="bg-[#111428] border border-[#242a54] hover:border-amber-400/50 rounded-xl p-4 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md"
              >
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${alertBadge}`}>
                      {alertHeadline}
                    </span>
                    <span className="text-xs font-mono font-bold text-white">
                      {job.company}
                    </span>
                    <span className="text-xs text-[#8288b4]">•</span>
                    <span className="text-xs font-mono text-emerald-400 font-bold">
                      ₹{job.ctcMinLpa || 18}–{job.ctcMaxLpa || 24} LPA
                    </span>
                  </div>

                  <h3 className="text-sm font-extrabold text-white">
                    {job.title} <span className="text-xs text-[#8e93be] font-normal">({job.location} • {job.workMode})</span>
                  </h3>

                  <p className="text-xs text-[#a0a5d4] leading-relaxed">
                    {alertDescription}
                  </p>
                </div>

                {/* Direct Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 shrink-0 font-mono text-xs">
                  <button
                    onClick={() => {
                      executeAndLaunchGmail({
                        toEmail: targetEmail,
                        jobTitle: job.title,
                        companyName: job.company,
                        contactName: job.contactPerson?.name,
                        customSummary: job.scores?.recommendation
                      });
                    }}
                    className="bg-red-600 hover:bg-red-500 text-white font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                    title="Open pre-filled Gmail Compose window"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Launch Gmail</span>
                  </button>

                  <button
                    onClick={() => {
                      downloadEmlFile({
                        toEmail: targetEmail,
                        fromEmail: 'Adv.Akash2356@gmail.com',
                        jobTitle: job.title,
                        companyName: job.company,
                        contactName: job.contactPerson?.name,
                        customSummary: job.scores?.recommendation
                      });
                    }}
                    className="bg-[#171c3a] hover:bg-[#242b58] text-purple-200 border border-purple-500/30 font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                    title="Download RFC 822 .EML draft"
                  >
                    <Download className="w-3.5 h-3.5 text-purple-300" />
                    <span>.EML</span>
                  </button>

                  <button
                    onClick={() => {
                      if (onSelectJob) onSelectJob(job);
                      if (setActiveTab) {
                        if (job.status === 'Interviewing' || job.status === 'Offer Received') {
                          setActiveTab('interviews');
                        } else {
                          setActiveTab('pipeline');
                        }
                      }
                    }}
                    className="bg-[#171c3a] hover:bg-[#242b58] text-blue-300 border border-blue-500/30 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <span>Inspect →</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* PLAIN ENGLISH APPLICATION STATUS TABLE */}
      <div className="bg-[#0b0d18] border border-[#1e2342] rounded-2xl p-5 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1b203c] pb-3">
          <div>
            <h2 className="text-base font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-blue-400" />
              Simple Status Breakdown of All Opportunities
            </h2>
            <p className="text-xs text-[#8288b4]">
              Clear status overview of every position in the pipeline.
            </p>
          </div>

          {/* Filter pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 font-mono text-xs">
            {(['ALL', 'Applied', 'Scored', 'Interviewing', 'Offer Received'] as const).map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer whitespace-nowrap ${
                  statusFilter === st
                    ? 'bg-blue-600 text-white border-blue-400 font-bold'
                    : 'bg-[#13162c] text-[#8288b4] border-[#22274c] hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-[#1e2342] text-[#8288b4] font-mono uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">Role & Company</th>
                <th className="py-2.5 px-3">Offered / Target CTC</th>
                <th className="py-2.5 px-3">Current Status</th>
                <th className="py-2.5 px-3">What Is Happening Now?</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#171a33]">
              {filteredJobs.map(job => {
                let statusBadge = 'bg-blue-500/10 text-blue-300 border-blue-500/30';
                let statusText = 'In Pipeline';
                let plainDescription = 'AI has scored this role and prepared tailored documents.';

                if (job.status === 'Applied') {
                  statusBadge = 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30';
                  statusText = '✓ Application Submitted';
                  plainDescription = 'Resume and custom cover letter dispatched to HR.';
                } else if (job.status === 'Interviewing') {
                  statusBadge = 'bg-purple-500/10 text-purple-300 border-purple-500/30';
                  statusText = '💬 Interview Scheduled';
                  plainDescription = 'HR discussion or technical round in progress.';
                } else if (job.status === 'Offer Received') {
                  statusBadge = 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold';
                  statusText = '🏆 Offer Received!';
                  plainDescription = 'Formal offer letter received and being evaluated.';
                }

                return (
                  <tr key={job.id} className="hover:bg-[#121528] transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-bold text-white text-sm">{job.title}</div>
                      <div className="text-[#8288b4] text-xs font-mono">{job.company} • {job.location}</div>
                    </td>

                    <td className="py-3 px-3 font-mono font-bold text-emerald-400">
                      ₹{job.ctcMinLpa || 18}-{job.ctcMaxLpa || 24} LPA
                    </td>

                    <td className="py-3 px-3">
                      <span className={`inline-block px-2.5 py-1 rounded-lg text-[11px] font-mono border ${statusBadge}`}>
                        {statusText}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-[#a0a5d4] text-xs max-w-xs">
                      {plainDescription}
                    </td>

                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => {
                          if (onSelectJob) onSelectJob(job);
                          if (setActiveTab) setActiveTab('pipeline');
                        }}
                        className="bg-[#181d3a] hover:bg-[#252b54] text-blue-300 border border-blue-500/30 px-2.5 py-1 rounded text-xs font-mono font-bold transition-all cursor-pointer"
                      >
                        Inspect →
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* HOW THIS SYSTEM WORKS - 4 SIMPLE STEPS */}
      <div className="bg-[#080912] border border-[#1b1e38] rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-3 border-b border-[#181b33] pb-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
            <HelpCircle className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
              How Akash's Job OS Works (In Plain English)
            </h2>
            <p className="text-xs text-[#8288b4]">
              A simple 4-step explanation of what the system does on your behalf.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-sans">
          <div className="bg-[#0f1122] border border-[#1e2242] p-4 rounded-xl space-y-2">
            <div className="text-blue-400 font-mono font-extrabold text-sm">Step 1: Smart Discovery</div>
            <h3 className="font-bold text-white">Find High-Paying Roles</h3>
            <p className="text-[#9da2cc] leading-relaxed">
              Scans top career portals for Operations Lead, Legal Ops, & CLM roles offering above ₹18–22 LPA CTC.
            </p>
          </div>

          <div className="bg-[#0f1122] border border-[#1e2242] p-4 rounded-xl space-y-2">
            <div className="text-emerald-400 font-mono font-extrabold text-sm">Step 2: 100% Truthful Tailoring</div>
            <h3 className="font-bold text-white">Custom Resume & Cover Letters</h3>
            <p className="text-[#9da2cc] leading-relaxed">
              Highlighting Akash's real 7+ years Gartner Ops experience, LLB degree, and 60% TAT reduction. Zero false statements.
            </p>
          </div>

          <div className="bg-[#0f1122] border border-[#1e2242] p-4 rounded-xl space-y-2">
            <div className="text-purple-400 font-mono font-extrabold text-sm">Step 3: Fast Dispatch</div>
            <h3 className="font-bold text-white">Gmail & 1-Click Apply</h3>
            <p className="text-[#9da2cc] leading-relaxed">
              Creates Gmail email drafts and prepares direct portal links so you can apply in seconds with zero friction.
            </p>
          </div>

          <div className="bg-[#0f1122] border border-[#1e2242] p-4 rounded-xl space-y-2">
            <div className="text-amber-400 font-mono font-extrabold text-sm">Step 4: Real-Time Audit</div>
            <h3 className="font-bold text-white">Live Status & Offer Tracking</h3>
            <p className="text-[#9da2cc] leading-relaxed">
              Logs every single email sent with HTTP verification codes and tracks interview calls all the way to offer letters.
            </p>
          </div>
        </div>
      </div>

      {/* QUICK APPLY FLOATING ACTION BUTTON (AUTO-TRIGGERS HIGHEST-SCORED ROLE) */}
      <QuickApplyFab
        jobs={jobs}
        onSelectJob={onSelectJob}
        setActiveTab={setActiveTab}
        onNotification={(msg) => {
          setLastShortcutTriggered(msg);
          setTimeout(() => setLastShortcutTriggered(null), 3000);
        }}
      />
    </div>
  );
};
