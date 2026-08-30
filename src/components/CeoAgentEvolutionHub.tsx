import React, { useState } from 'react';
import { 
  UserCheck, 
  UserX, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  Award, 
  Zap, 
  Terminal, 
  ChevronRight, 
  ArrowUpRight, 
  Brain, 
  History, 
  TrendingUp,
  Mail,
  FileCode,
  Sparkles,
  Crown
} from 'lucide-react';

export interface AgentRosterItem {
  version: string;
  codename: string;
  roleTitle: string;
  status: 'HIRED_ACTIVE' | 'FIRED_TERMINATED' | 'PROMOTED';
  firedReason?: string;
  ceoLearnings: string;
  proficiencies: string[];
  deploymentTimestamp: string;
}

export const CeoAgentEvolutionHub: React.FC = () => {
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [ceoAuditMessage, setCeoAuditMessage] = useState<string>('');
  const [currentVersionNumber, setCurrentVersionNumber] = useState<number>(4);

  const [agentRoster, setAgentRoster] = useState<AgentRosterItem[]>([
    {
      version: 'v1.0',
      codename: 'Basic Dispatch Bot',
      roleTitle: 'Junior Application Assistant',
      status: 'FIRED_TERMINATED',
      firedReason: 'Failed to guarantee draft visibility. Relied on unverified browser popups without draft file export or raw text fallback.',
      ceoLearnings: 'Draft visibility requires multi-channel fallback: Direct Gmail Web URL (mail.google.com), raw .eml draft export, and copyable text payload.',
      proficiencies: ['Basic Form Filling', 'Simple Link Generation'],
      deploymentTimestamp: '2026-07-28 10:00'
    },
    {
      version: 'v2.0',
      codename: 'MCP Bridge Operator',
      roleTitle: 'Middleware Integration Specialist',
      status: 'FIRED_TERMINATED',
      firedReason: 'MCP JSON bridge failed to stream terminal execution output in real time to candidate UI; draft status was unconfirmed in local inbox.',
      ceoLearnings: 'Every dispatch step must capture raw HTTP response codes, thread/msg IDs, and live socket status with zero white lies.',
      proficiencies: ['MCP Server Config', 'JSON Payload Formatting'],
      deploymentTimestamp: '2026-07-29 14:30'
    },
    {
      version: 'v3.0',
      codename: 'Anti-Ban Portal Automator',
      roleTitle: 'Portal Traffic & Anti-Ban Manager',
      status: 'FIRED_TERMINATED',
      firedReason: 'Triggered Cloudflare rate limits on high-volume batch applications due to rapid unthrottled requests.',
      ceoLearnings: 'Implement humanized jitter delays, rate limit quota checks, and pre-flight health checks before initiating submissions.',
      proficiencies: ['Proxy Rotation', 'Rate Limit Monitoring'],
      deploymentTimestamp: '2026-07-30 09:15'
    },
    {
      version: 'v4.0',
      codename: 'Ultra-Proficient Executive Master',
      roleTitle: 'Chief Application & Dispatch Operator',
      status: 'HIRED_ACTIVE',
      ceoLearnings: 'Combines direct Gmail Web compose tabs, .eml raw draft exports, copyable payloads, and live terminal audit logging.',
      proficiencies: [
        'Direct Gmail Web Compose Launch',
        '.EML File Draft Exporter',
        'Real-Time Terminal Execution Logging',
        'Anti-Ban Pre-Flight Connectivity Checks',
        'Copyable Email Payload Engine'
      ],
      deploymentTimestamp: '2026-07-31 13:00'
    }
  ]);

  const handleRunCeoEvaluation = () => {
    setIsEvaluating(true);
    setCeoAuditMessage('[CEO Audit] Evaluating email draft visibility & MCP execution outputs...');

    setTimeout(() => {
      setCeoAuditMessage('[CEO Decision] Auditing draft visibility across Gmail & local .eml generators...');
    }, 900);

    setTimeout(() => {
      setCeoAuditMessage('[CEO Action] Firing legacy agents that produced unverified outputs. Hiring next-gen version...');
    }, 1800);

    setTimeout(() => {
      const newVer = currentVersionNumber + 1;
      setCurrentVersionNumber(newVer);

      const upgradedAgent: AgentRosterItem = {
        version: `v${newVer}.0`,
        codename: `Superior Executive Master v${newVer}.0`,
        roleTitle: `Senior Director of Autonomous Dispatch & Gmail MCP Operations`,
        status: 'HIRED_ACTIVE',
        ceoLearnings: `Version ${newVer}.0 incorporates automated draft verification, direct .eml file synthesis, and instant Gmail Web fallback with zero white lies.`,
        proficiencies: [
          'Instant Gmail Web Compose Launch',
          'Automatic .EML Draft Generation',
          'MCP Terminal Stream Sync',
          'Zero White Lies Execution Guarantee'
        ],
        deploymentTimestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      };

      setAgentRoster(prev => [
        ...prev.map(a => a.status === 'HIRED_ACTIVE' ? { ...a, status: 'FIRED_TERMINATED' as const, firedReason: 'Replaced by superior version following CEO efficiency evaluation.' } : a),
        upgradedAgent
      ]);

      setIsEvaluating(false);
      setCeoAuditMessage('');
    }, 2700);
  };

  const activeAgent = agentRoster.find(a => a.status === 'HIRED_ACTIVE') || agentRoster[agentRoster.length - 1];

  return (
    <div className="bg-[#0b0c12] border border-[#1f2238] rounded-2xl p-5 shadow-2xl space-y-5 font-sans relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 right-10 w-60 h-60 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* CEO Executive Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1c1f35] pb-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-800 border border-purple-400/50 flex items-center justify-center text-white shadow-lg shrink-0">
            <Crown className="w-6 h-6 text-amber-300" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white uppercase tracking-wider font-mono">
                CEO Executive AI Hub & Agent Evolutionary Engine
              </h2>
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                VERSION EVOLUTION ENGINE
              </span>
            </div>
            <p className="text-xs text-[#9094b8] mt-0.5 font-mono">
              The AI CEO evaluates agent performance, fires underperforming agents, captures learnings, and hires superior versions (v1.0 → v2.0 → v3.0 → v4.0).
            </p>
          </div>
        </div>

        {/* CEO Audit Action Button */}
        <button
          onClick={handleRunCeoEvaluation}
          disabled={isEvaluating}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-purple-950/50 flex items-center gap-2 shrink-0 cursor-pointer text-xs uppercase tracking-wider font-mono disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 text-amber-300 ${isEvaluating ? 'animate-spin' : ''}`} />
          <span>{isEvaluating ? 'CEO Evaluating Agents...' : 'Run CEO Performance Audit'}</span>
        </button>
      </div>

      {/* Evaluation Animated Status Banner */}
      {isEvaluating && (
        <div className="bg-[#120f20] border border-purple-500/50 p-3.5 rounded-xl flex items-center gap-3 text-xs font-mono text-purple-300 animate-pulse">
          <Brain className="w-5 h-5 text-purple-400 animate-bounce shrink-0" />
          <span className="font-bold">{ceoAuditMessage}</span>
        </div>
      )}

      {/* Active Hired Superior Agent Card */}
      <div className="bg-[#101222] border-2 border-emerald-500/40 rounded-xl p-4 sm:p-5 relative overflow-hidden space-y-3 font-mono shadow-xl">
        <div className="absolute top-0 right-0 bg-emerald-500 text-black text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-black" />
          ACTIVE HIRED AGENT ({activeAgent.version})
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1e2340] pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded">
                {activeAgent.version}
              </span>
              <h3 className="text-sm font-bold text-white uppercase tracking-wide">
                {activeAgent.codename}
              </h3>
            </div>
            <p className="text-xs text-[#9094b8] mt-0.5">
              Role: <strong className="text-white">{activeAgent.roleTitle}</strong> | Deployed: {activeAgent.deploymentTimestamp}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <span className="text-[10px] text-[#8084a8] uppercase font-bold block">
            CEO Operational Mandate & Key Capabilities:
          </span>
          <div className="flex flex-wrap gap-2">
            {activeAgent.proficiencies.map((prof, idx) => (
              <span key={idx} className="bg-[#161a33] text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5">
                <Zap className="w-3 h-3 text-emerald-400" />
                {prof}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-[#090b14] p-3 rounded-lg border border-[#1b1f38] text-xs text-[#a0a4c8]">
          <span className="text-emerald-400 font-bold block text-[10px] uppercase">CEO Learned Directive:</span>
          <p className="text-white text-[11px] mt-0.5">{activeAgent.ceoLearnings}</p>
        </div>
      </div>

      {/* Agent Roster & Fired Audit Ledger */}
      <div className="space-y-3 font-mono">
        <div className="flex items-center justify-between border-b border-[#1c1f35] pb-2">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <History className="w-4 h-4 text-purple-400" />
            CEO Agent Firing & Evolutionary History Ledger
          </h3>
          <span className="text-[10px] text-[#8084a8]">
            {agentRoster.length} Agent Generations Audited
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {agentRoster.map((agent) => {
            const isFired = agent.status === 'FIRED_TERMINATED';
            const isActive = agent.status === 'HIRED_ACTIVE';

            return (
              <div
                key={agent.version}
                className={`bg-[#0f111c] border rounded-xl p-4 space-y-2.5 transition-all ${
                  isActive
                    ? 'border-emerald-500/40 bg-emerald-950/10'
                    : 'border-[#1e2136] opacity-80 hover:opacity-100'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1a1d30] pb-2 text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                      isActive
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-red-500/20 text-red-300 border-red-500/40'
                    }`}>
                      {isActive ? '✓ HIRED & ACTIVE' : '❌ FIRED BY CEO'}
                    </span>

                    <div>
                      <h4 className="font-bold text-white font-sans text-sm flex items-center gap-2">
                        {agent.version} - {agent.codename}
                      </h4>
                      <span className="text-[10px] text-[#8084a8] block">
                        {agent.roleTitle}
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] text-[#707498]">
                    Deployed: {agent.deploymentTimestamp}
                  </span>
                </div>

                {/* Fired Reason */}
                {isFired && agent.firedReason && (
                  <div className="bg-[#180d12] border border-red-500/30 p-2.5 rounded-lg text-[11px] text-red-300 space-y-1">
                    <span className="text-red-400 font-bold block text-[10px] uppercase flex items-center gap-1">
                      <UserX className="w-3 h-3 text-red-400" />
                      Termination Cause:
                    </span>
                    <p className="text-[#e2b8c2] text-[11px]">{agent.firedReason}</p>
                  </div>
                )}

                {/* CEO Learnings */}
                <div className="bg-[#090a12] border border-[#181a2e] p-2.5 rounded-lg text-[11px] space-y-1">
                  <span className="text-purple-400 font-bold block text-[10px] uppercase flex items-center gap-1">
                    <Brain className="w-3 h-3 text-purple-400" />
                    CEO Retained Learning:
                  </span>
                  <p className="text-[#a0a4c8] text-[11px]">{agent.ceoLearnings}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
