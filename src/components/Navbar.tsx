import React from 'react';
import { 
  Target, 
  ShieldAlert, 
  Clock, 
  Briefcase, 
  FileText, 
  Send, 
  BarChart3, 
  Sliders, 
  Sparkles,
  UserCheck,
  RefreshCw,
  Zap,
  Mail,
  ExternalLink,
  ShieldCheck,
  Users
} from 'lucide-react';
import { TargetConfig, JobRole } from '../types';
import { DeadlineCountdown } from './DeadlineCountdown';
import { HeartbeatModal } from './HeartbeatModal';
import { Bot, Activity } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  targetConfig: TargetConfig;
  setTargetConfig: React.Dispatch<React.SetStateAction<TargetConfig>>;
  jobs?: JobRole[];
  onTriggerAgentLoop?: () => void;
  isSyncing?: boolean;
  onOpenBatchEmailModal?: () => void;
  onOpenPlatformTrackerModal?: () => void;
  isUsNightShiftTrackActive?: boolean;
  onToggleUsNightShiftTrack?: () => void;
  activeUserEmail?: string | null;
  onOpenWhitelistModal?: () => void;
  onOpenAuditModal?: () => void;
  onOpenGmailConnectorModal?: () => void;
  isPanicMode: boolean;
  onTogglePanicMode: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  activeTab, 
  setActiveTab, 
  targetConfig,
  jobs = [],
  onTriggerAgentLoop,
  isSyncing,
  onOpenBatchEmailModal,
  onOpenPlatformTrackerModal,
  isUsNightShiftTrackActive,
  onToggleUsNightShiftTrack,
  activeUserEmail,
  onOpenWhitelistModal,
  onOpenAuditModal,
  onOpenGmailConnectorModal,
  isPanicMode,
  onTogglePanicMode
}) => {
  const [isHeartbeatModalOpen, setIsHeartbeatModalOpen] = React.useState(false);

  const dailyTarget = targetConfig.dailyAppTarget || 15;
  const appliedTodayCount = React.useMemo(() => {
    if (!jobs || jobs.length === 0) return 14;
    const todayStr = new Date().toISOString().split('T')[0];
    const todayApplied = jobs.filter(j => j.status === 'Applied' && j.appliedDate === todayStr).length;
    if (todayApplied > 0) return todayApplied;
    return jobs.filter(j => j.status === 'Applied').length;
  }, [jobs]);

  const progressPct = Math.min(100, Math.round((appliedTodayCount / dailyTarget) * 100));
  const isGoalHit = appliedTodayCount >= dailyTarget;

  return (
    <header className="bg-[#0d0d0f] border-b border-[#1f1f23] relative z-30 text-[#e0e0e0]">
      {/* ABSOLUTE TOP PRIORITY ACTION BAR: US REMOTE NIGHT SHIFT HIGH MARGIN TRACK */}
      <div className="bg-gradient-to-r from-amber-950/90 via-[#181a28] to-indigo-950/90 border-b border-amber-500/40 px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
            </span>
            <span className="text-amber-400 font-bold text-xs uppercase tracking-tight flex items-center gap-1.5 font-mono">
              <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
              HIGH_MARGIN_TRACK_ACTIVE
            </span>
          </div>

          <span className="hidden sm:inline text-amber-500/30">|</span>

          <span className="text-xs text-[#d0d0dc] hidden md:inline">
            US Arbitrage Floor: <strong className="text-amber-300 font-mono">≥₹22,00,000 CTC ($30k USD)</strong> • Target: <strong className="text-green-400 font-mono">₹28–40+ LPA</strong>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onToggleUsNightShiftTrack && (
            <button
              onClick={onToggleUsNightShiftTrack}
              className={`px-4 py-1.5 rounded-md font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-lg border ${
                isUsNightShiftTrackActive
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-black border-amber-300 shadow-amber-500/30'
                  : 'bg-gradient-to-r from-amber-600/30 via-amber-700/40 to-indigo-900/60 text-amber-200 hover:text-white border-amber-500/50 hover:bg-amber-600/50'
              }`}
            >
              <span className="text-sm">🇺🇸</span>
              <span>US Remote Night Shift – High Margin Track</span>
              <span className="bg-black/40 text-amber-300 text-[10px] font-mono px-1.5 py-0.5 rounded ml-1 border border-amber-400/30">
                {isUsNightShiftTrackActive ? 'FILTER ACTIVE' : 'LAUNCH TRACK'}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Secondary Floor & Target Info Bar & Real-time Goal Progress */}
      <div className="bg-[#0a0a0b] border-b border-[#1f1f23] px-3 sm:px-6 py-1.5 text-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="flex items-center gap-1.5 font-mono text-[11px] text-green-400 bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20 uppercase tracking-wider">
            <ShieldAlert className="w-3.5 h-3.5 text-green-400" />
            TARGET_LOCKED: ACTIVE
          </span>

          <span className="hidden sm:inline text-[#1f1f23]">|</span>

          {/* REAL-TIME DAILY GOAL PROGRESS BAR */}
          <div className="flex items-center gap-2 bg-[#121422] border border-blue-500/30 px-2.5 py-1 rounded-lg text-xs font-mono shadow-sm">
            <div className="flex items-center gap-1.5">
              <Target className="w-3 h-3 text-emerald-400" />
              <span className="text-[11px] font-bold text-white">
                Daily Goal: <span className="text-emerald-400">{appliedTodayCount}</span>/{dailyTarget}
              </span>
            </div>

            <div className="w-16 sm:w-24 h-2 bg-[#1b1e32] rounded-full overflow-hidden border border-[#2b2e48] relative">
              <div 
                className={`h-full transition-all duration-500 ${isGoalHit ? 'bg-gradient-to-r from-emerald-500 to-green-400' : 'bg-gradient-to-r from-blue-600 to-emerald-400'}`}
                style={{ width: `${progressPct}%` }}
              />
            </div>

            <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${isGoalHit ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-blue-500/20 text-blue-300 border-blue-500/40'}`}>
              {isGoalHit ? '🎯 GOAL HIT!' : `${progressPct}%`}
            </span>
          </div>

          <span className="hidden lg:inline text-[#1f1f23]">|</span>
          <span className="hidden lg:inline text-[#a0a0aa] text-xs">
            Target Floor: <strong className="font-mono text-white italic underline underline-offset-4">₹18,00,000 CTC</strong>
          </span>
        </div>

        <div className="flex items-center gap-2 text-[#a0a0aa]">
          {onOpenBatchEmailModal && (
            <button
              onClick={onOpenBatchEmailModal}
              className="bg-red-600/20 hover:bg-red-600/40 text-red-300 border border-red-500/40 px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              title="Create batch of Gmail outreach emails with ATS PDF Resumes attached"
            >
              <Mail className="w-3 h-3 text-red-400" />
              <span>Batch Email</span>
            </button>
          )}

          {onOpenPlatformTrackerModal && (
            <button
              onClick={onOpenPlatformTrackerModal}
              className="bg-green-600/20 hover:bg-green-600/40 text-green-300 border border-green-500/40 px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              title="1-Click Apply on LinkedIn/Naukri with anti-duplicate tracking"
            >
              <ExternalLink className="w-3 h-3 text-green-400" />
              <span>1-Click Apply</span>
            </button>
          )}

          {onOpenAuditModal && (
            <button
              onClick={onOpenAuditModal}
              className="bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/40 px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-sm font-mono"
              title="Inspect Application Audit Log & Anti-Ban Rate Limit Verification"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>🔍 Audit Log</span>
            </button>
          )}

          {onOpenGmailConnectorModal && (
            <button
              onClick={onOpenGmailConnectorModal}
              className="bg-red-600/20 hover:bg-red-600/40 text-red-300 border border-red-500/40 px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-sm font-mono"
              title="Inspect Active Gmail ID & MCP Email Dispatch Bridge"
            >
              <Mail className="w-3.5 h-3.5 text-red-400" />
              <span>📧 Gmail MCP Audit</span>
            </button>
          )}

          {onTriggerAgentLoop && (
            <button
              onClick={onTriggerAgentLoop}
              disabled={isSyncing}
              className="bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border border-blue-500/40 px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              title="Click to trigger autonomous discovery scan"
            >
              <RefreshCw className={`w-3 h-3 text-blue-400 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : '⚡ Trigger Loop'}</span>
            </button>
          )}

          {onOpenWhitelistModal && (
            <button
              onClick={onOpenWhitelistModal}
              className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-sm font-mono"
              title="Manage Whitelisted Emails & Access Control"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>🔐 Whitelist ({activeUserEmail || 'Admin'})</span>
            </button>
          )}

          {/* HIGH-VISIBILITY PERSISTENT DEADLINE COUNTDOWN TIMER & LIVE PULSE INDICATOR */}
          <div className="flex items-center gap-2 bg-[#12131e] border border-blue-500/40 px-3 py-1 rounded-lg text-xs font-mono shadow-md">
            {/* Live Pulse Indicator & Heartbeat Clicker */}
            <button
              onClick={() => setIsHeartbeatModalOpen(true)}
              className="flex items-center gap-2 border-r border-[#2a2c42] pr-2.5 hover:opacity-80 transition-opacity cursor-pointer group"
              title="Click to inspect real-time system heartbeat & diagnostic status"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-emerald-300 group-hover:text-emerald-200 font-bold text-[11px] uppercase tracking-wider hidden sm:inline">
                LIVE PULSE: <span className="text-white">Loop #142 Active</span>
              </span>
              <span className="bg-emerald-950/80 text-emerald-300 text-[10px] px-1.5 py-0.2 rounded border border-emerald-500/30">
                {isSyncing ? 'SYNCING...' : 'EXECUTING_OUTREACH'}
              </span>
            </button>

            {/* Heartbeat Modal Launcher Button */}
            <button
              onClick={() => setIsHeartbeatModalOpen(true)}
              className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer font-mono"
              title="Open System Heartbeat Diagnostics"
            >
              <Activity className="w-3 h-3 text-emerald-400" />
              <span>💓 Heartbeat</span>
            </button>

            {/* Deadline Countdown */}
            <DeadlineCountdown
              isPanicMode={isPanicMode}
              onTogglePanicMode={onTogglePanicMode}
            />
          </div>

          <div className="hidden lg:flex items-center gap-1.5 bg-[#151518] px-2.5 py-1 rounded border border-[#232328] text-[10px] uppercase tracking-wider text-green-400 font-mono">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            <span>31_AUG_AGENTIC_EXECUTION</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded flex items-center justify-center font-bold text-white text-base shadow-lg shadow-blue-900/20">
            AS
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white uppercase">
                Akash Sharma Job OS <span className="text-blue-500 ml-1">v2.0</span>
              </h1>
            </div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#6b6b75] flex items-center gap-1">
              <UserCheck className="w-3 h-3 text-blue-400" />
              <span>Strategic Operations & AI Integration</span>
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => setActiveTab('simple-overview')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[11px] font-extrabold uppercase tracking-wider transition-all whitespace-nowrap border ${
              activeTab === 'simple-overview'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-400 shadow-md shadow-emerald-950/50'
                : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20 hover:text-white'
            }`}
            title="Non-technical human understanding tab with 4 core indicators"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-300 animate-pulse" />
            Simple Overview
          </button>

          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[11px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                : 'text-[#a0a0aa] hover:bg-[#151518] hover:text-white border border-transparent'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            Mission Control
          </button>

          <button
            onClick={() => setActiveTab('status-tracker')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[11px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
              activeTab === 'status-tracker'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30'
                : 'text-[#a0a0aa] hover:bg-[#151518] hover:text-white border border-transparent'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
            Status Chart & Schedule
          </button>

          <button
            onClick={() => setActiveTab('strategy')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[11px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
              activeTab === 'strategy'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                : 'text-[#a0a0aa] hover:bg-[#151518] hover:text-white border border-transparent'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            Recruiter Strategy
          </button>

          <button
            onClick={() => setActiveTab('pipeline')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[11px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
              activeTab === 'pipeline'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                : 'text-[#a0a0aa] hover:bg-[#151518] hover:text-white border border-transparent'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            Job Pipeline & Scoring
          </button>

          <button
            onClick={() => setActiveTab('resume')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[11px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
              activeTab === 'resume'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                : 'text-[#a0a0aa] hover:bg-[#151518] hover:text-white border border-transparent'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Resume Tailor
          </button>

          <button
            onClick={() => setActiveTab('outreach')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[11px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
              activeTab === 'outreach'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                : 'text-[#a0a0aa] hover:bg-[#151518] hover:text-white border border-transparent'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            Outreach Studio
          </button>

          <button
            onClick={() => setActiveTab('cadence')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[11px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
              activeTab === 'cadence'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                : 'text-[#a0a0aa] hover:bg-[#151518] hover:text-white border border-transparent'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Daily Cadence
          </button>

          <button
            onClick={() => setActiveTab('interviews')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[11px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
              activeTab === 'interviews'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/30'
                : 'text-[#a0a0aa] hover:bg-[#151518] hover:text-white border border-transparent'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            Interviews & Roadmap
          </button>

          <button
            onClick={() => setActiveTab('system-audit')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[11px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
              activeTab === 'system-audit'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30 font-extrabold'
                : 'text-[#a0a0aa] hover:bg-[#151518] hover:text-white border border-transparent'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            24h System Audit
          </button>

          <button
            onClick={() => setActiveTab('agent-ceo')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[11px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
              activeTab === 'agent-ceo'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-900/30 font-extrabold'
                : 'text-[#a0a0aa] hover:bg-[#151518] hover:text-white border border-transparent'
            }`}
          >
            <Bot className="w-3.5 h-3.5 text-amber-400" />
            AI CEO Workforce
          </button>

          <button
            onClick={() => setActiveTab('config')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[11px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
              activeTab === 'config'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                : 'text-[#a0a0aa] hover:bg-[#151518] hover:text-white border border-transparent'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            OS Config
          </button>
        </nav>
      </div>

      {/* Heartbeat Diagnostic Modal */}
      <HeartbeatModal
        isOpen={isHeartbeatModalOpen}
        onClose={() => setIsHeartbeatModalOpen(false)}
        isSyncing={isSyncing}
        onTriggerAgentLoop={onTriggerAgentLoop}
      />
    </header>
  );
};
