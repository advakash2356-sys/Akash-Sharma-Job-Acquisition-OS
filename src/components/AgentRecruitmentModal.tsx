import React, { useState } from 'react';
import { 
  UserPlus, 
  Bot, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  AlertTriangle, 
  X, 
  Star, 
  Award, 
  Cpu, 
  RefreshCw,
  ArrowRight
} from 'lucide-react';
import { AuxiliaryAgent } from './AgentCeoBoard';

export interface AgentCandidate {
  id: string;
  name: string;
  architecture: string;
  primaryRole: string;
  skills: string[];
  slaGuarantee: string;
  latencyAvg: string;
  matchScore: number;
  costTier: 'OPTIMAL' | 'PREMIUM' | 'ENTERPRISE';
  recommendedFor: string;
}

export const CANDIDATE_PROFILES: AgentCandidate[] = [
  {
    id: 'cand-gemini-ats',
    name: 'ATS Resume Architect v3.0 (Gemini 1.5 Flash)',
    architecture: 'Gemini 1.5 Flash-Native',
    primaryRole: 'Resume Tailoring & Keyword Extraction',
    skills: ['100% ATS Parsing', 'JD Keyword Injector', 'PDF Structure Repair', 'Multi-Language Support'],
    slaGuarantee: '99.8% Uptime',
    latencyAvg: '0.4s / Resume',
    matchScore: 98,
    costTier: 'OPTIMAL',
    recommendedFor: 'Highest speed & precision resume optimization under 1 sec'
  },
  {
    id: 'cand-outreach-pro',
    name: 'Executive Outreach Bot v2.4 (Claude 3.5 Sonnet)',
    architecture: 'Anthropic Sonnet Pipeline',
    primaryRole: 'Direct Recruiter Cold Emailing',
    skills: ['Recruiter Personalization', 'Cold Email A/B Testing', 'Spam Score Optimization', 'LinkedIn InMail Bot'],
    slaGuarantee: '99.5% Delivery',
    latencyAvg: '0.9s / Email',
    matchScore: 95,
    costTier: 'PREMIUM',
    recommendedFor: 'High-conversion recruiter direct outreach & Vice President cold emails'
  },
  {
    id: 'cand-captcha-bypass',
    name: 'Workday Portal Bypass Bot v4 (GPT-4o Vision)',
    architecture: 'Vision-Enabled Multi-Modal',
    primaryRole: 'Workday & Greenhouse Auto-Submissions',
    skills: ['Cloudflare Turnstile Solver', 'Multi-Page Form Filling', 'Workday Auto-Login', 'File Attachment Automation'],
    slaGuarantee: '98.9% Success',
    latencyAvg: '1.8s / Application',
    matchScore: 92,
    costTier: 'ENTERPRISE',
    recommendedFor: 'Replaces terminated Workday Bot with zero 3-strike penalty history'
  },
  {
    id: 'cand-deepseek-scraper',
    name: 'Headhunter Lead Miner v1.8 (DeepSeek V3)',
    architecture: 'DeepSeek Reasoning Engine',
    primaryRole: 'Talent Acquisition Contact Mining',
    skills: ['LinkedIn Recruiter Mining', 'Naukri/Indeed Email Extractor', 'Verifiable Contact Checker', 'Auto CRM Sync'],
    slaGuarantee: '99.1% Accuracy',
    latencyAvg: '0.6s / Lead',
    matchScore: 94,
    costTier: 'OPTIMAL',
    recommendedFor: 'High-density lead extraction across global tech recruiters'
  }
];

interface AgentRecruitmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  terminatedAgentName?: string;
  onRecruitAgent: (candidate: AgentCandidate) => void;
}

export const AgentRecruitmentModal: React.FC<AgentRecruitmentModalProps> = ({
  isOpen,
  onClose,
  terminatedAgentName = 'Workday 1-Click Bot v2 (Terminated: 3 Strikes)',
  onRecruitAgent
}) => {
  const [selectedCandidate, setSelectedCandidate] = useState<AgentCandidate>(CANDIDATE_PROFILES[2]);
  const [isHiring, setIsHiring] = useState(false);

  if (!isOpen) return null;

  const handleConfirmHire = () => {
    setIsHiring(true);
    setTimeout(() => {
      setIsHiring(false);
      onRecruitAgent(selectedCandidate);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in font-sans">
      <div className="bg-[#0b0c14] border border-amber-500/40 rounded-2xl w-full max-w-3xl p-5 sm:p-6 shadow-2xl space-y-5 text-white max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1f2238] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center font-bold text-amber-400 shadow-md">
              <UserPlus className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white uppercase tracking-wider font-mono">
                  CEO Agent Recruitment & Skill Replacement Simulation
                </h3>
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  REPLACEMENT POOL
                </span>
              </div>
              <p className="text-xs text-[#9090a8] mt-0.5">
                Select a high-performance candidate model to replace terminated agent and upgrade workforce capability.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-[#888898] hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Terminated Agent Replacement Notice */}
        <div className="bg-red-950/20 border border-red-500/40 p-3.5 rounded-xl flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <div>
              <span className="text-red-300 font-bold block">Terminated Agent Position Open:</span>
              <span className="text-[#a0a0b8]">{terminatedAgentName}</span>
            </div>
          </div>
          <span className="bg-red-500/20 text-red-300 border border-red-500/40 text-[10px] font-bold px-2.5 py-1 rounded-lg">
            VACANCY ACTIVE
          </span>
        </div>

        {/* Candidate Selection List */}
        <div className="space-y-3">
          <h4 className="text-xs font-mono uppercase text-[#8888a0] font-bold tracking-wider">
            Available Vetted Auxiliary Candidate Models ({CANDIDATE_PROFILES.length}):
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {CANDIDATE_PROFILES.map((cand) => {
              const isSelected = selectedCandidate.id === cand.id;

              return (
                <div
                  key={cand.id}
                  onClick={() => setSelectedCandidate(cand)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-3 relative overflow-hidden ${
                    isSelected
                      ? 'bg-[#121322] border-amber-500 shadow-xl ring-1 ring-amber-500/50'
                      : 'bg-[#0f101a] border-[#1e2136] hover:border-[#35395a]'
                  }`}
                >
                  {/* Top Badge & Match */}
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                      cand.costTier === 'OPTIMAL'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : cand.costTier === 'PREMIUM'
                        ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                        : 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                    }`}>
                      {cand.costTier} ARCHITECTURE
                    </span>

                    <span className="text-amber-400 font-bold flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      {cand.matchScore}% Skill Match
                    </span>
                  </div>

                  {/* Candidate Name & Architecture */}
                  <div>
                    <h5 className="font-bold text-white text-sm leading-snug">{cand.name}</h5>
                    <p className="text-xs text-[#8888a0] font-mono mt-0.5">{cand.primaryRole}</p>
                  </div>

                  {/* Skills Grid */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {cand.skills.map((sk, idx) => (
                      <span key={idx} className="bg-[#181a2d] text-[#b0b0cc] text-[10px] font-mono px-2 py-0.5 rounded border border-[#2a2d48]">
                        ✓ {sk}
                      </span>
                    ))}
                  </div>

                  {/* SLA Metrics */}
                  <div className="bg-[#080910] p-2 rounded-xl border border-[#1b1d30] flex justify-between text-[11px] font-mono text-[#8888a0]">
                    <span>SLA: <strong className="text-emerald-400">{cand.slaGuarantee}</strong></span>
                    <span>Speed: <strong className="text-blue-400">{cand.latencyAvg}</strong></span>
                  </div>

                  {/* Selected Indicator */}
                  {isSelected && (
                    <div className="absolute top-2 right-2 bg-amber-500 text-black rounded-full p-1 shadow-md">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Candidate Detailed Recommendation Box */}
        <div className="bg-[#121320] border border-[#23263d] p-4 rounded-xl space-y-2 font-mono text-xs">
          <div className="flex items-center gap-2 text-amber-400 font-bold uppercase">
            <Award className="w-4 h-4" />
            <span>CEO Recommendation Analysis:</span>
          </div>
          <p className="text-[#a0a0b8] leading-relaxed">
            {selectedCandidate.recommendedFor}
          </p>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between border-t border-[#1f2238] pt-4 font-mono text-xs">
          <span className="text-[#8888a0]">
            Selected: <strong className="text-white">{selectedCandidate.name}</strong>
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#161828] text-[#888898] hover:text-white rounded-xl font-bold cursor-pointer transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmHire}
              disabled={isHiring}
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold shadow-lg shadow-amber-950/50 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isHiring ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Onboarding Agent...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Hire & Swap Skills</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
