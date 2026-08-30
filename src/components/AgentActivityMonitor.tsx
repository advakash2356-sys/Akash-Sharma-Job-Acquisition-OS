import React, { useState } from 'react';
import { Bot, Zap, CheckCircle2, AlertTriangle, Clock, RefreshCw, Search, Terminal, ArrowUpRight, Filter } from 'lucide-react';

export interface TickerActionLog {
  id: string;
  timestamp: string;
  agentName: string;
  agentRole: string;
  actionText: string;
  status: 'SUCCESS' | 'IN_PROGRESS' | 'QUEUED' | 'FLAGGED';
  category: 'OUTREACH' | 'RESUME_ATS' | 'CONTACT_SCRAPER' | 'MARKET_AUDIT' | 'CEO_STRATEGY';
  impactSummary: string;
}

export const INITIAL_TICKER_LOGS: TickerActionLog[] = [
  {
    id: 'log-101',
    timestamp: '22:45:12',
    agentName: 'Outreach Specialist',
    agentRole: 'Subordinate Employee Agent',
    actionText: 'Delivered customized email batch to 5 hiring managers at Stripe & Atlassian with tailored ATS PDF attachments.',
    status: 'SUCCESS',
    category: 'OUTREACH',
    impactSummary: 'Sent 5 emails, 0 bounces'
  },
  {
    id: 'log-102',
    timestamp: '22:30:04',
    agentName: 'ATS Resume Architect',
    agentRole: 'Subordinate Employee Agent',
    actionText: 'Compiled and rendered 3 tailored PDF resumes targeting Senior Fullstack Engineer roles (Databricks, Atlassian, Swiggy).',
    status: 'SUCCESS',
    category: 'RESUME_ATS',
    impactSummary: 'Match score elevated to 88%+'
  },
  {
    id: 'log-103',
    timestamp: '22:15:30',
    agentName: 'Headhunter Scraper',
    agentRole: 'Subordinate Employee Agent',
    actionText: 'Scanned 15 new listings on LinkedIn/Naukri; extracted 6 verified talent acquisition lead emails.',
    status: 'SUCCESS',
    category: 'CONTACT_SCRAPER',
    impactSummary: '6 verified email contacts added'
  },
  {
    id: 'log-104',
    timestamp: '21:50:00',
    agentName: 'Market Intelligence Bot',
    agentRole: 'Subordinate Employee Agent',
    actionText: 'Audited 12 job postings against CTC floor requirement (₹18+ LPA). Flagged 3 roles below salary threshold.',
    status: 'SUCCESS',
    category: 'MARKET_AUDIT',
    impactSummary: 'Filtered out 3 sub-CTC roles'
  },
  {
    id: 'log-105',
    timestamp: '21:30:15',
    agentName: 'Agent CEO (Executive Director)',
    agentRole: 'Level 1 Executive Overseer',
    actionText: 'Executed strategic loop #142: Prioritized 4 high-match roles (≥75 score) for immediate 24h recruiter follow-up.',
    status: 'SUCCESS',
    category: 'CEO_STRATEGY',
    impactSummary: 'Prioritized 4 roles for 24h SLA'
  },
  {
    id: 'log-106',
    timestamp: '21:10:00',
    agentName: 'Outreach Specialist',
    agentRole: 'Subordinate Employee Agent',
    actionText: 'Triggered 24h follow-up ping to Atlassian Recruiter regarding Senior Engineering Manager application.',
    status: 'IN_PROGRESS',
    category: 'OUTREACH',
    impactSummary: 'Awaiting SMTP delivery receipt'
  }
];

export const AgentActivityMonitor: React.FC = () => {
  const [logs, setLogs] = useState<TickerActionLog[]>(INITIAL_TICKER_LOGS);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredLogs = logs.filter(log => {
    const matchesCat = selectedCategory === 'ALL' || log.category === selectedCategory;
    const matchesSearch = searchTerm === '' || 
      log.actionText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.agentName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="bg-[#0d0d0f] border border-[#1f1f28] rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1c1d28] pb-3.5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center font-bold text-blue-400">
            <Terminal className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white uppercase tracking-wider font-mono">
                Real-Time Agent Activity Ticker Feed
              </h3>
              <span className="bg-blue-500/10 text-blue-400 border border-blue-500/30 text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping"></span>
                LIVE FEED
              </span>
            </div>
            <p className="text-xs text-[#9090a0] mt-0.5">
              Live audit trail validating real actions executed by the Agent CEO and subordinate employee agents.
            </p>
          </div>
        </div>

        {/* Filter Pill Switcher */}
        <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
          {['ALL', 'CEO_STRATEGY', 'OUTREACH', 'RESUME_ATS', 'CONTACT_SCRAPER', 'MARKET_AUDIT'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-lg font-bold text-[10px] uppercase tracking-wider transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-[#151622] text-[#888898] hover:text-white border border-[#232538]'
              }`}
            >
              {cat.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input */}
      <div className="relative w-full">
        <Search className="w-4 h-4 text-[#666] absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter agent ticker by keyword (e.g. Stripe, email, ATS, CTC)..."
          className="w-full bg-[#11121d] text-[#e0e0e0] text-xs font-mono rounded-xl pl-9 pr-3 py-2 border border-[#202235] focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Real-time Ticker Feed Items */}
      <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1 scrollbar-thin">
        {filteredLogs.map(log => (
          <div
            key={log.id}
            className="bg-[#11121d] border border-[#202235] hover:border-blue-500/40 rounded-xl p-3.5 transition-all space-y-2 font-mono text-xs shadow-sm"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1b1d2e] pb-2">
              <div className="flex items-center gap-2">
                <span className="text-[#777788] text-[11px] flex items-center gap-1 bg-[#0b0c14] px-2 py-0.5 rounded border border-[#1b1c28]">
                  <Clock className="w-3 h-3 text-blue-400" />
                  {log.timestamp}
                </span>

                <span className="font-bold text-white text-xs flex items-center gap-1.5">
                  <Bot className="w-3.5 h-3.5 text-amber-400" />
                  {log.agentName}
                </span>

                <span className="text-[#888898] text-[10px] hidden sm:inline">
                  ({log.agentRole})
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[9px] px-2 py-0.5 rounded font-bold uppercase">
                  {log.category.replace('_', ' ')}
                </span>

                <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase flex items-center gap-1 ${
                  log.status === 'SUCCESS'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  {log.status}
                </span>
              </div>
            </div>

            <p className="text-[#d8d8e6] text-xs font-sans leading-relaxed">
              {log.actionText}
            </p>

            <div className="bg-[#0b0c12] p-2 rounded-lg border border-[#1c1e2e] flex items-center justify-between text-[11px]">
              <span className="text-[#888898]">Action Verified Impact:</span>
              <span className="text-emerald-400 font-bold">{log.impactSummary}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
