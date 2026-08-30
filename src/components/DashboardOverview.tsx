import React, { useState } from 'react';
import { JobRole, TargetConfig } from '../types';
import { 
  ShieldCheck, 
  TrendingUp, 
  Briefcase, 
  CheckCircle2, 
  Sparkles, 
  ArrowUpRight, 
  Clock, 
  Send, 
  FileText, 
  Plus, 
  AlertTriangle,
  Award,
  Zap
} from 'lucide-react';
import { TargetStrategyWidget } from './TargetStrategyWidget';
import { RoiEfficiencySection } from './RoiEfficiencySection';
import { SalaryTrendChart } from './SalaryTrendChart';
import { CircularDailyProgress } from './CircularDailyProgress';
import { PipelineProgressWidget } from './PipelineProgressWidget';
import { StageProgressionChart } from './StageProgressionChart';
import { TimeToOfferProjection } from './TimeToOfferProjection';

import { RecruiterCoachSection } from './RecruiterCoachSection';
import { UsNightShiftTrackBanner } from './UsNightShiftTrackBanner';
import { ApplicationPieTracker } from './ApplicationPieTracker';
import { ApplicationStatusScheduleChart } from './ApplicationStatusScheduleChart';
import { DashboardAnalytics } from './DashboardAnalytics';
import { PriorityHeatmap } from './PriorityHeatmap';
import { ApplicationInterviewLineChart } from './ApplicationInterviewLineChart';
import { PanicModeSection } from './PanicModeSection';
import { AgentCeoBoard } from './AgentCeoBoard';
import { ResumeUpload, ResumeData } from './ResumeUpload';
import { SkillGapHeatmap } from './SkillGapHeatmap';
import { WeeklyPerformanceReport } from './WeeklyPerformanceReport';
import { CareerTrajectoryVisualizer } from './CareerTrajectoryVisualizer';
import { SalaryBenchmarking } from './SalaryBenchmarking';
import { InterviewStageTracker } from './InterviewStageTracker';
import { InterviewCalendar } from './InterviewCalendar';
import { FollowupNotificationManager } from './FollowupNotificationManager';
import { JobHistoryTimeline } from './JobHistoryTimeline';
import { AiOutreachGenerator } from './AiOutreachGenerator';
import { CommandCenterMatrix } from './CommandCenterMatrix';
import { AgentActivityMonitor } from './AgentActivityMonitor';
import { DailyApplicationSprintProgress } from './DailyApplicationSprintProgress';
import { SprintVelocityChart } from './SprintVelocityChart';
import { AgentGovernanceBoard } from './AgentGovernanceBoard';
import { CeoOversightWidget } from './CeoOversightWidget';
import { AgentD3PerformanceChart } from './AgentD3PerformanceChart';
import { DailySprintPlanner } from './DailySprintPlanner';
import { AgentCommunicationFeed } from './AgentCommunicationFeed';
import { MetricTooltip } from './MetricTooltip';
import { DeepFocusTimerWidget } from './DeepFocusTimerWidget';
import { DailySprintMeter } from './DailySprintMeter';

interface DashboardOverviewProps {
  jobs: JobRole[];
  onSelectJob: (job: JobRole) => void;
  onOpenAddJobModal: () => void;
  setActiveTab: (tab: string) => void;
  targetConfig: TargetConfig;
  setTargetConfig: React.Dispatch<React.SetStateAction<TargetConfig>>;
  onTriggerAgentLoop: () => void;
  isSyncing: boolean;
  lastSyncTime: Date;
  onOpenBatchEmailModal?: () => void;
  onOpenPlatformTrackerModal?: () => void;
  isUsNightShiftTrackActive?: boolean;
  onToggleUsNightShiftTrack?: () => void;
  onMarkJobApplied?: (jobId: string, channel: string) => void;
  isPanicMode: boolean;
  onTogglePanicMode: () => void;
  resumeData: ResumeData;
  onUpdateResume: (data: ResumeData) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  jobs,
  onSelectJob,
  onOpenAddJobModal,
  setActiveTab,
  targetConfig,
  setTargetConfig,
  onTriggerAgentLoop,
  isSyncing,
  lastSyncTime,
  onOpenBatchEmailModal,
  onOpenPlatformTrackerModal,
  isUsNightShiftTrackActive = false,
  onToggleUsNightShiftTrack = () => {},
  onMarkJobApplied,
  isPanicMode,
  onTogglePanicMode,
  resumeData,
  onUpdateResume
}) => {
  const [matrixCategory, setMatrixCategory] = useState<'all' | 'execution' | 'analytics' | 'intelligence' | 'operations'>('all');

  // If High Margin Track is active, filter for US Night Shift roles with CTC >= 22 LPA floor
  const displayJobs = isUsNightShiftTrackActive
    ? jobs.filter(j => (j.shift === 'US/Night Shift' || j.location.toLowerCase().includes('us') || j.location.toLowerCase().includes('remote')) && j.ctcMinLpa >= 22)
    : jobs;

  const eligibleJobs = displayJobs.filter(j => j.scores.ctcFloorPassed);
  const highScoreJobs = displayJobs.filter(j => j.scores.totalScore >= 75 && j.scores.ctcFloorPassed);
  const appliedJobs = displayJobs.filter(j => j.status === 'Applied' || j.status === 'Interviewing' || j.status === 'Offer Received');
  const interviewingJobs = displayJobs.filter(j => j.status === 'Interviewing');

  // Daily target calculation (assuming 15 target per day)
  const todayApps = appliedJobs.filter(j => j.appliedDate === new Date().toISOString().split('T')[0]).length;
  const todayProgressPercent = Math.min(100, Math.round((todayApps / targetConfig.dailyAppTarget) * 100));

  return (
    <div className={`space-y-6 transition-all duration-500 rounded-2xl ${
      isPanicMode 
        ? 'p-2 sm:p-4 border-2 border-red-500/70 shadow-[0_0_40px_rgba(239,68,68,0.35)] bg-gradient-to-b from-red-950/20 via-transparent to-red-950/10 ring-1 ring-red-500/30 animate-pulse' 
        : ''
    }`}>
      {/* PANIC MODE HIGH-INTENSITY ACQUISITION MODE GLOWING ALERT BAR */}
      {isPanicMode && (
        <div className="bg-red-950/80 border-2 border-red-500/80 rounded-xl p-3 px-4 flex items-center justify-between gap-3 shadow-[0_0_25px_rgba(239,68,68,0.4)] animate-pulse font-mono text-xs text-red-200">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-red-500 animate-ping shrink-0" />
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
              <span className="font-extrabold uppercase text-white tracking-widest bg-red-600 px-2 py-0.5 rounded text-[10px]">
                🚨 PANIC_MODE_ACTIVE
              </span>
              <span>High-Intensity Career Acquisition Mode Engaged. Daily Quota Throttles Lifted!</span>
            </div>
          </div>
          <button
            onClick={onTogglePanicMode}
            className="bg-red-600 hover:bg-red-500 text-white font-bold px-3 py-1 rounded-lg text-[10px] uppercase tracking-wider shrink-0 cursor-pointer shadow-md"
          >
            Deactivate
          </button>
        </div>
      )}

      {/* MATRIX FILTER SWITCHER BAR */}
      <div className="bg-[#0d0d0f] border border-[#1f1f23] rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-2">
          <span className="bg-blue-600/20 text-blue-300 border border-blue-500/30 text-[10px] font-mono font-bold px-2.5 py-1 rounded uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-blue-400" />
            MISSION_MATRIX_GRID
          </span>
          <span className="text-xs text-[#a0a0aa] font-mono hidden sm:inline">Select Matrix Focus View:</span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 font-mono text-xs">
          <button
            onClick={() => setMatrixCategory('all')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              matrixCategory === 'all'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40 border border-blue-400'
                : 'bg-[#14151f] text-[#a0a0aa] hover:text-white border border-[#222434]'
            }`}
          >
            🌐 Full Matrix
          </button>
          <button
            onClick={() => setMatrixCategory('execution')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              matrixCategory === 'execution'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-900/40 border border-amber-400'
                : 'bg-[#14151f] text-[#a0a0aa] hover:text-white border border-[#222434]'
            }`}
          >
            ⚡ Execution Track
          </button>
          <button
            onClick={() => setMatrixCategory('analytics')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              matrixCategory === 'analytics'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40 border border-emerald-400'
                : 'bg-[#14151f] text-[#a0a0aa] hover:text-white border border-[#222434]'
            }`}
          >
            📈 Analytics Matrix
          </button>
          <button
            onClick={() => setMatrixCategory('intelligence')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              matrixCategory === 'intelligence'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-900/40 border border-purple-400'
                : 'bg-[#14151f] text-[#a0a0aa] hover:text-white border border-[#222434]'
            }`}
          >
            🎯 Skills & AI
          </button>
          <button
            onClick={() => setMatrixCategory('operations')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              matrixCategory === 'operations'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/40 border border-indigo-400'
                : 'bg-[#14151f] text-[#a0a0aa] hover:text-white border border-[#222434]'
            }`}
          >
            📅 Operations & Interviews
          </button>
        </div>
      </div>

      {/* PROMINENT APPLICATION STATUS TRACKING & SCHEDULE CHART */}
      <ApplicationStatusScheduleChart
        jobs={jobs}
        onSelectJob={onSelectJob}
        setActiveTab={setActiveTab}
        onMarkJobApplied={onMarkJobApplied}
        dailyTarget={targetConfig.dailyAppTarget || 15}
      />

      {/* TOP STRATEGY BANNERS MATRIX */}
      {(matrixCategory === 'all' || matrixCategory === 'execution') && (
        <div className="space-y-6">
          <UsNightShiftTrackBanner
            jobs={jobs}
            isActive={isUsNightShiftTrackActive}
            onToggleTrack={onToggleUsNightShiftTrack}
            onTriggerAgentLoop={onTriggerAgentLoop}
            isSyncing={isSyncing}
          />

          <PanicModeSection
            isPanicMode={isPanicMode}
            onTogglePanicMode={onTogglePanicMode}
            jobs={displayJobs}
            onSelectJob={onSelectJob}
            setActiveTab={setActiveTab}
          />

          <FollowupNotificationManager
            jobs={jobs}
            onSelectJob={onSelectJob}
          />

          <RecruiterCoachSection
            jobs={jobs}
            onTriggerAgentLoop={onTriggerAgentLoop}
            isSyncing={isSyncing}
            lastSyncTime={lastSyncTime}
            onOpenBatchEmailModal={onOpenBatchEmailModal}
            onOpenPlatformTrackerModal={onOpenPlatformTrackerModal}
          />
        </div>
      )}

      {/* Top Welcome & Hard Positioning Banner */}
      <div className="bg-[#0d0d0f] border border-[#1f1f23] rounded-xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-blue-600/10 text-blue-400 text-[10px] font-bold uppercase tracking-[0.15em] px-2.5 py-1 rounded border border-blue-500/20 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                OFFER FLOOR: MINIMUM ₹18,00,000 CTC
              </span>
              <span className="bg-green-500/10 text-green-400 text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded border border-green-500/20">
                Strategic Ops / Legal Ops / Enterprise AI
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-white">
              Mission Commander Dashboard Matrix
            </h1>

            <p className="text-[#a0a0aa] text-xs sm:text-sm leading-relaxed">
              <strong className="text-white">Core Positioning:</strong> “Strategic Operations & Process Transformation Leader with 9+ years (7+ at Gartner) who bridges business, legal ops, CLM and agentic AI. Proven 60% TAT reduction via structured RCA. LLB + hands-on agentic AI, Copilot, prompt engineering and Python automation.”
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <WeeklyPerformanceReport
              jobs={jobs}
              isPanicMode={isPanicMode}
            />

            <button
              onClick={onOpenAddJobModal}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase tracking-wider px-4 py-2.5 rounded text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-900/30 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Score New Role
            </button>

            <button
              onClick={() => setActiveTab('pipeline')}
              className="bg-[#1a1a1c] hover:bg-[#232328] text-white font-semibold text-xs px-4 py-2.5 rounded border border-[#2d2d30] flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Briefcase className="w-4 h-4 text-blue-400" />
              Full Pipeline ({jobs.length})
            </button>
          </div>
        </div>
      </div>

      {/* DAILY SPRINT METER COMPONENT */}
      <DailySprintMeter
        jobs={jobs}
        targetConfig={targetConfig}
        setTargetConfig={setTargetConfig}
        setActiveTab={setActiveTab}
        onOpenBatchEmailModal={onOpenBatchEmailModal}
        onOpenPlatformTrackerModal={onOpenPlatformTrackerModal}
      />

      {/* DAILY APPLICATION SPRINT PROGRESS BAR */}
      <DailyApplicationSprintProgress
        jobs={jobs}
        targetConfig={targetConfig}
        setTargetConfig={setTargetConfig}
        setActiveTab={setActiveTab}
        onOpenAddJobModal={onOpenAddJobModal}
      />

      {/* RECHARTS CIRCULAR DAILY PROGRESS RING CHART */}
      <CircularDailyProgress
        jobs={jobs}
        targetConfig={targetConfig}
        setActiveTab={setActiveTab}
        onOpenAddJobModal={onOpenAddJobModal}
      />

      {/* REAL-TIME PIPELINE PROGRESS MATRIX WIDGET (Scored -> Tailored -> Applied) */}
      <PipelineProgressWidget
        jobs={jobs}
        setActiveTab={setActiveTab}
        onOpenAddJobModal={onOpenAddJobModal}
      />

      {/* DEEP FOCUS TAILOR & APPLY TIMER WIDGET */}
      <DeepFocusTimerWidget
        jobs={jobs}
        onMarkJobApplied={onMarkJobApplied}
        onSelectJob={onSelectJob}
      />

      {/* CEO EXECUTIVE OVERSIGHT SUMMARY WIDGET */}
      <CeoOversightWidget
        jobs={jobs}
        targetConfig={targetConfig}
        onTriggerAgentLoop={onTriggerAgentLoop}
        isSyncing={isSyncing}
      />

      {/* 24-HOUR DAILY SPRINT TASK PLANNER */}
      <DailySprintPlanner
        onTriggerAgentLoop={onTriggerAgentLoop}
        isSyncing={isSyncing}
      />

      {/* DIRECT AGENT SLACK COMMUNICATION FEED */}
      <AgentCommunicationFeed
        onTriggerAgentLoop={onTriggerAgentLoop}
        isSyncing={isSyncing}
      />

      {/* RECHARTS 30-DAY APPLIED VS TARGET SPRINT VELOCITY CHART */}
      <SprintVelocityChart
        jobs={jobs}
        targetConfig={targetConfig}
      />

      {/* D3 14-DAY ACTIVE AGENT PERFORMANCE COMPARISON CHART */}
      <AgentD3PerformanceChart />

      {/* COMMAND CENTER HIERARCHY MATRIX & AGENT ACTIVITY TICKER MONITOR */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CommandCenterMatrix 
          onTriggerAgentLoop={onTriggerAgentLoop}
          isSyncing={isSyncing}
        />
        <AgentActivityMonitor />
      </div>

      {/* CEO EXECUTIVE DIRECTIVE & 3-STRIKE GOVERNANCE BOARD */}
      <AgentGovernanceBoard
        onTriggerAgentLoop={onTriggerAgentLoop}
        isSyncing={isSyncing}
      />

      {/* KPI Cards Matrix Grid (4-Card Matrix) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0d0d0f] border border-[#1f1f23] rounded-xl p-4 shadow-md hover:border-blue-500/40 transition-all">
          <div className="flex items-center justify-between text-[#6b6b75] text-[10px] uppercase tracking-wider mb-2">
            <span className="flex items-center gap-1">
              High-Score Targets (≥75)
              <MetricTooltip
                title="High-Score Targets (≥75 PTS)"
                formula="Calculated from composite weighted scoring matrix: Skills Match (40%), Seniority Fit (30%), Salary Baseline (20%), Company Tier (10%)."
                impact18Lpa="Prioritizing roles with total score ≥75 ensures 80%+ recruiter callback rates and maximizes conversion into offer negotiations at or above ₹18 LPA."
                benchmark="Maintain a queue of at least 8+ high-score targets ready for instant custom application."
              />
            </span>
            <div className="p-1 bg-blue-600/10 text-blue-400 rounded">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-mono text-white font-bold">
            {highScoreJobs.length} <span className="text-xs font-sans text-[#a0a0aa]">roles</span>
          </div>
          <div className="mt-2 text-[11px] text-green-400 flex items-center gap-1 font-mono">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>READY_FOR_CUSTOM_APPLY</span>
          </div>
        </div>

        <div className="bg-[#0d0d0f] border border-[#1f1f23] rounded-xl p-4 shadow-md hover:border-green-500/40 transition-all">
          <div className="flex items-center justify-between text-[#6b6b75] text-[10px] uppercase tracking-wider mb-2">
            <span className="flex items-center gap-1">
              CTC Floor Passes (≥18 LPA)
              <MetricTooltip
                title="CTC Floor Pass Rate (≥₹18 LPA)"
                formula="Calculated as count of verified listings offering CTC >= ₹18,00,000 ÷ total analyzed job roles."
                impact18Lpa="Filtering 100% of incoming listings against the ₹18 LPA floor eliminates low-value applications and protects candidate position."
                benchmark="Target 100% compliance across active pipeline."
              />
            </span>
            <div className="p-1 bg-green-500/10 text-green-400 rounded">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-mono text-white font-bold">
            {eligibleJobs.length} <span className="text-xs font-sans text-[#a0a0aa]">of {jobs.length} total</span>
          </div>
          <div className="mt-2 text-[11px] text-[#6b6b75] font-mono">
            {jobs.length - eligibleJobs.length} DISCARDED (&lt;18 LPA)
          </div>
        </div>

        <div className="bg-[#0d0d0f] border border-[#1f1f23] rounded-xl p-4 shadow-md hover:border-indigo-500/40 transition-all">
          <div className="flex items-center justify-between text-[#6b6b75] text-[10px] uppercase tracking-wider mb-2">
            <span className="flex items-center gap-1">
              Active Pipeline / Interviews
              <MetricTooltip
                title="Active Pipeline / Interview Velocity"
                formula="Count of active roles in 'Applied' and 'Interviewing' stages."
                impact18Lpa="Maintaining 12+ applied roles yields 2-3 simultaneous interview loops. Multi-company interviews create competitive leverage to secure ₹18+ LPA salary packages."
                benchmark="Aim for 10+ applied roles and 2+ active interview loops at all times."
              />
            </span>
            <div className="p-1 bg-indigo-500/10 text-indigo-400 rounded">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-mono text-white font-bold">
            {appliedJobs.length} <span className="text-xs font-sans text-[#a0a0aa]">applied</span>
          </div>
          <div className="mt-2 text-[11px] text-blue-400 font-mono flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-blue-400" />
            <span>{interviewingJobs.length} active interviews</span>
          </div>
        </div>

        <div className="bg-[#0d0d0f] border border-[#1f1f23] rounded-xl p-4 shadow-md hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between text-[#6b6b75] text-[10px] uppercase tracking-wider mb-2">
            <span className="flex items-center gap-1">
              Daily Goal Pace (15 Apps)
              <MetricTooltip
                title="Daily Application Quota Metric"
                formula="Count of completed submissions today ÷ configured daily target (15 apps/day)."
                impact18Lpa="Consistent application volume keeps the recruiter top-of-funnel full, producing regular offer opportunities above ₹18 LPA within 30 days."
                benchmark="100% daily completion keeps momentum streak active."
              />
            </span>
            <div className="p-1 bg-blue-600/10 text-blue-400 rounded">
              <Award className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-mono text-white font-bold">
            {todayApps} <span className="text-xs font-sans text-[#a0a0aa]">/ {targetConfig.dailyAppTarget} today</span>
          </div>
          <div className="w-full bg-[#1f1f23] h-1.5 mt-2 rounded-full overflow-hidden">
            <div 
              className="bg-blue-500 h-full rounded-full transition-all"
              style={{ width: `${todayProgressPercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Target Strategy Alignment Bar */}
      {(matrixCategory === 'all' || matrixCategory === 'execution') && (
        <TargetStrategyWidget 
          targetConfig={targetConfig} 
          setTargetConfig={setTargetConfig} 
        />
      )}

      {/* MATRIX GRID SECTION 1: ANALYTICS & CONVERSION */}
      {(matrixCategory === 'all' || matrixCategory === 'analytics') && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 border-b border-[#1f1f23] pb-2 text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest">
            <span>📈 ANALYTICS & CONVERSION MATRIX</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DashboardAnalytics
              jobs={displayJobs}
              onSelectJob={onSelectJob}
              setActiveTab={setActiveTab}
              onMarkJobApplied={onMarkJobApplied}
            />

            <PriorityHeatmap
              jobs={displayJobs}
              onSelectJob={onSelectJob}
              setActiveTab={setActiveTab}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ApplicationInterviewLineChart
              jobs={displayJobs}
            />

            <SalaryBenchmarking
              jobs={displayJobs}
            />
          </div>
        </div>
      )}

      {/* MATRIX GRID SECTION 2: INTELLIGENCE & SKILLS */}
      {(matrixCategory === 'all' || matrixCategory === 'intelligence') && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 border-b border-[#1f1f23] pb-2 text-xs font-mono font-bold text-purple-400 uppercase tracking-widest">
            <span>🎯 INTELLIGENCE & SKILLS MATRIX</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AgentCeoBoard
              onTriggerAgentLoop={onTriggerAgentLoop}
              isSyncing={isSyncing}
            />

            <ResumeUpload
              resumeData={resumeData}
              onUpdateResume={onUpdateResume}
              onSelectJobForTailoring={() => setActiveTab('resume')}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SkillGapHeatmap
              jobs={displayJobs}
              resumeData={resumeData}
              onUpdateResume={onUpdateResume}
            />

            <CareerTrajectoryVisualizer
              resumeData={resumeData}
              jobs={displayJobs}
            />
          </div>
        </div>
      )}

      {/* MATRIX GRID SECTION 3: OPERATIONS & INTERVIEWS */}
      {(matrixCategory === 'all' || matrixCategory === 'operations') && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 border-b border-[#1f1f23] pb-2 text-xs font-mono font-bold text-indigo-400 uppercase tracking-widest">
            <span>📅 OPERATIONS & INTERVIEW MATRIX</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <InterviewStageTracker
              jobs={displayJobs}
              onSelectJob={onSelectJob}
            />

            <InterviewCalendar
              jobs={displayJobs}
              onSelectJob={onSelectJob}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <JobHistoryTimeline
              jobs={displayJobs}
              onSelectJob={onSelectJob}
            />

            <AiOutreachGenerator
              jobs={displayJobs}
              resumeData={resumeData}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ApplicationPieTracker
              jobs={displayJobs}
              onSelectJob={onSelectJob}
              setActiveTab={setActiveTab}
              onMarkJobApplied={onMarkJobApplied}
            />

            <TimeToOfferProjection 
              jobs={jobs} 
              targetDeadline={targetConfig.targetDeadline || '28 August 2026'} 
            />
          </div>
        </div>
      )}

      {/* MATRIX GRID SECTION 4: ROI & PERFORMANCE CHARTS */}
      {(matrixCategory === 'all' || matrixCategory === 'analytics') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CircularDailyProgress
            jobs={jobs}
            targetConfig={targetConfig}
            onOpenAddJobModal={onOpenAddJobModal}
            setActiveTab={setActiveTab}
          />

          <RoiEfficiencySection
            jobs={jobs}
            onSelectJob={onSelectJob}
            setActiveTab={setActiveTab}
          />
        </div>
      )}

      {/* High-Score Immediate Action Items */}
      <div className="bg-[#0d0d0f] border border-[#1f1f23] rounded-xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#1f1f23]">
          <div>
            <h2 className="font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              High Priority Opportunities Matrix (Score ≥ 75 & CTC ≥ ₹18 LPA)
            </h2>
            <p className="text-[11px] text-[#6b6b75] mt-0.5">
              High expected value opportunities requiring full custom resume, cover letter, and hiring manager outreach.
            </p>
          </div>

          <button
            onClick={() => setActiveTab('pipeline')}
            className="text-xs font-mono text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 uppercase tracking-wider cursor-pointer"
          >
            All Roles ({jobs.length})
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        {highScoreJobs.length === 0 ? (
          <div className="text-center py-8 text-[#6b6b75] text-xs bg-[#151518] rounded-lg border border-[#232328]">
            No high-score roles scored yet. Click "Score New Role" to analyze opportunities.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {highScoreJobs.map((job) => (
              <div 
                key={job.id}
                className="bg-[#12131c] border border-[#222434] hover:border-blue-500/50 rounded-xl p-4 transition-all flex flex-col justify-between gap-3 shadow-md hover:shadow-xl"
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-bold text-green-400 text-xs bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">
                      Score: {job.scores.totalScore}/100
                    </span>
                    <span className="font-mono text-white text-xs bg-[#1a1c2b] px-2 py-0.5 rounded border border-[#2d3045]">
                      ₹{job.ctcMinLpa}–{job.ctcMaxLpa} LPA
                    </span>
                    <span className="text-[10px] uppercase tracking-wider text-[#a0a0aa] bg-[#1a1c2b] px-2 py-0.5 rounded border border-[#2d3045]">
                      {job.workMode}
                    </span>
                  </div>

                  <h3 className="font-bold text-white text-base leading-snug">
                    {job.title}
                  </h3>

                  <div className="text-xs text-[#a0a0aa] font-medium">
                    {job.company} • <span className="text-[#6b6b75]">{job.location}</span>
                  </div>

                  <p className="text-xs text-[#a0a0aa] line-clamp-2 leading-relaxed">
                    {job.scores.recommendation}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#1f2238]">
                  <button
                    onClick={() => {
                      onSelectJob(job);
                      setActiveTab('resume');
                    }}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider px-3 py-1.5 rounded flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Tailor Resume
                  </button>

                  <button
                    onClick={() => {
                      onSelectJob(job);
                      setActiveTab('outreach');
                    }}
                    className="bg-[#1a1c2b] hover:bg-[#23273e] text-white border border-[#2d3045] font-semibold text-xs px-3 py-1.5 rounded flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5 text-blue-400" />
                    Outreach
                  </button>

                  <button
                    onClick={() => {
                      onSelectJob(job);
                      setActiveTab('pipeline')}
                    }
                    className="bg-[#1a1c2b] hover:bg-[#23273e] text-[#a0a0aa] hover:text-white px-3 py-1.5 rounded text-xs border border-[#2d3045] cursor-pointer"
                  >
                    Breakdown
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
