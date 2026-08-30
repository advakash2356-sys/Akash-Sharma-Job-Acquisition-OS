import React from 'react';
import { Bot, Zap, CheckCircle2, Clock, AlertTriangle, ShieldCheck, Terminal, Play, Cpu, ArrowRight } from 'lucide-react';

export interface AgentNode {
  id: string;
  name: string;
  role: string;
  level: 'CEO' | 'SUBORDINATE';
  status: 'ACTIVE' | 'IDLE' | 'ERROR';
  pendingTasks: number;
  completedTasks: number;
  successRate: number;
  lastAction: string;
  avatarColor: string;
}

export const INITIAL_MATRIX_AGENTS: AgentNode[] = [
  {
    id: 'agent-ceo-main',
    name: 'Agent CEO (Executive Director)',
    role: 'Strategy & Resource Allocation',
    level: 'CEO',
    status: 'ACTIVE',
    pendingTasks: 3,
    completedTasks: 42,
    successRate: 98.2,
    lastAction: 'Allocated 5 high-CTC roles to Outreach Specialist for immediate recruiter messaging',
    avatarColor: 'bg-amber-500/20 text-amber-300 border-amber-500/50'
  },
  {
    id: 'agent-sub-outreach',
    name: 'Outreach Specialist',
    role: 'Recruiter Email & Direct Messaging',
    level: 'SUBORDINATE',
    status: 'ACTIVE',
    pendingTasks: 4,
    completedTasks: 18,
    successRate: 95.0,
    lastAction: 'Delivered batch email to Stripe & Atlassian hiring managers with ATS PDFs',
    avatarColor: 'bg-blue-500/20 text-blue-300 border-blue-500/50'
  },
  {
    id: 'agent-sub-ats',
    name: 'ATS Resume Architect',
    role: 'Resume Tailoring & Keyword Matching',
    level: 'SUBORDINATE',
    status: 'ACTIVE',
    pendingTasks: 1,
    completedTasks: 15,
    successRate: 100.0,
    lastAction: 'Rendered tailored PDF with 88%+ ATS match score for Databricks role',
    avatarColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
  },
  {
    id: 'agent-sub-scraper',
    name: 'Headhunter Scraper',
    role: 'Contact Extraction & Portal Scanning',
    level: 'SUBORDINATE',
    status: 'IDLE',
    pendingTasks: 0,
    completedTasks: 24,
    successRate: 91.6,
    lastAction: 'Extracted verified email contacts for 6 Senior Engineering Manager listings',
    avatarColor: 'bg-purple-500/20 text-purple-300 border-purple-500/50'
  },
  {
    id: 'agent-sub-market',
    name: 'Market Intelligence Bot',
    role: 'CTC & Compensation Floor Auditor',
    level: 'SUBORDINATE',
    status: 'ACTIVE',
    pendingTasks: 2,
    completedTasks: 30,
    successRate: 96.7,
    lastAction: 'Audited 12 new listings; flagged 3 roles below ₹18 LPA CTC floor requirement',
    avatarColor: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50'
  }
];

interface CommandCenterMatrixProps {
  onTriggerAgentLoop?: () => void;
  isSyncing?: boolean;
}

export const CommandCenterMatrix: React.FC<CommandCenterMatrixProps> = ({
  onTriggerAgentLoop,
  isSyncing = false
}) => {
  const ceoAgent = INITIAL_MATRIX_AGENTS.find(a => a.level === 'CEO') || INITIAL_MATRIX_AGENTS[0];
  const subordinateAgents = INITIAL_MATRIX_AGENTS.filter(a => a.level === 'SUBORDINATE');

  const totalCompleted = INITIAL_MATRIX_AGENTS.reduce((acc, a) => acc + a.completedTasks, 0);
  const totalPending = INITIAL_MATRIX_AGENTS.reduce((acc, a) => acc + a.pendingTasks, 0);

  return (
    <div className="bg-[#0d0d0f] border border-[#1f1f28] rounded-2xl p-4 sm:p-5 shadow-xl space-y-5">
      {/* Widget Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1c1d28] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center font-bold text-amber-400">
            <Cpu className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white uppercase tracking-wider font-mono">
                Command Center Hierarchy Matrix
              </h3>
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                AUTONOMOUS LOOP RUNNING
              </span>
            </div>
            <p className="text-xs text-[#9090a0] mt-0.5">
              CEO Strategic Directives funneling to specialized subordinate agents with live task verification.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onTriggerAgentLoop && (
            <button
              onClick={onTriggerAgentLoop}
              disabled={isSyncing}
              className="bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-blue-600/20 disabled:opacity-50"
            >
              <Zap className={`w-3.5 h-3.5 text-amber-300 ${isSyncing ? 'animate-bounce' : ''}`} />
              <span>{isSyncing ? 'Allocating Tasks...' : 'Execute Agent Cycle'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Top Stat Summary Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
        <div className="bg-[#12131e] border border-[#222436] p-3 rounded-xl">
          <span className="text-[#888898] text-[10px] uppercase block">Total Done Tasks</span>
          <span className="text-emerald-400 font-bold text-base">{totalCompleted} Executed</span>
        </div>
        <div className="bg-[#12131e] border border-[#222436] p-3 rounded-xl">
          <span className="text-[#888898] text-[10px] uppercase block">Queue Pending</span>
          <span className="text-amber-400 font-bold text-base">{totalPending} Queued</span>
        </div>
        <div className="bg-[#12131e] border border-[#222436] p-3 rounded-xl">
          <span className="text-[#888898] text-[10px] uppercase block">Overall Accuracy</span>
          <span className="text-blue-400 font-bold text-base">96.8% SLA</span>
        </div>
        <div className="bg-[#12131e] border border-[#222436] p-3 rounded-xl">
          <span className="text-[#888898] text-[10px] uppercase block">Team Status</span>
          <span className="text-white font-bold text-base flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            5/5 Operational
          </span>
        </div>
      </div>

      {/* CEO Node - Level 1 */}
      <div className="bg-gradient-to-r from-amber-950/30 via-[#131522] to-indigo-950/30 border border-amber-500/40 rounded-xl p-4 space-y-3 relative overflow-hidden shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-500/20 pb-2.5">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${ceoAgent.avatarColor}`}>
              <Bot className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-white text-sm">{ceoAgent.name}</h4>
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono text-[9px] px-2 py-0.5 rounded font-bold uppercase">
                  LEVEL 1 EXECUTIVE OVERSEER
                </span>
              </div>
              <p className="text-[11px] text-[#a0a0b0]">{ceoAgent.role}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] px-2.5 py-0.5 rounded font-bold uppercase flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              {ceoAgent.status}
            </span>
            <span className="bg-[#181a28] text-white px-2.5 py-0.5 rounded border border-[#2b2e45] text-[11px]">
              {ceoAgent.completedTasks} Done | {ceoAgent.pendingTasks} Pending
            </span>
          </div>
        </div>

        <div className="bg-[#0b0c14] p-3 rounded-lg border border-[#1f2236] text-xs font-mono">
          <span className="text-[#888898] text-[10px] uppercase block">Latest Strategic Command:</span>
          <p className="text-amber-200 font-semibold mt-0.5 flex items-center gap-1.5">
            <ArrowRight className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            {ceoAgent.lastAction}
          </p>
        </div>
      </div>

      {/* Subordinate Hierarchy - Level 2 Grid */}
      <div className="space-y-2">
        <span className="text-[11px] font-mono text-[#888898] uppercase tracking-wider block font-bold">
          Level 2 Subordinate Employee Agents:
        </span>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {subordinateAgents.map((agent) => (
            <div
              key={agent.id}
              className="bg-[#11121d] border border-[#202233] hover:border-blue-500/40 rounded-xl p-3.5 transition-all space-y-2.5"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${agent.avatarColor}`}>
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-white text-xs">{agent.name}</h5>
                    <p className="text-[10px] text-[#888898]">{agent.role}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 font-mono text-[10px]">
                  <span className={`px-2 py-0.5 rounded font-bold uppercase ${
                    agent.status === 'ACTIVE'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {agent.status}
                  </span>
                  <span className="bg-[#181a28] text-[#c0c2d8] px-2 py-0.5 rounded border border-[#282a3f]">
                    {agent.completedTasks} Done / {agent.pendingTasks} Queue
                  </span>
                </div>
              </div>

              <div className="bg-[#0b0c12] p-2.5 rounded-lg border border-[#1d1f30] text-[11px]">
                <span className="text-[#777788] text-[9px] font-mono uppercase block">Recent Action:</span>
                <p className="text-[#d0d2e5] font-sans line-clamp-2 mt-0.5">{agent.lastAction}</p>
              </div>

              <div className="flex items-center justify-between font-mono text-[10px] text-[#888898] pt-0.5">
                <span>Success Rate: <strong className="text-emerald-400">{agent.successRate}%</strong></span>
                <span>Role: Employee Agent</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
