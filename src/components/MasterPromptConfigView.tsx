import React, { useState } from 'react';
import { TargetConfig } from '../types';
import { 
  Sliders, 
  ShieldCheck, 
  Code2, 
  Copy, 
  Check, 
  Save, 
  Lock, 
  Sparkles,
  AlertTriangle
} from 'lucide-react';

interface MasterPromptConfigViewProps {
  targetConfig: TargetConfig;
  setTargetConfig: React.Dispatch<React.SetStateAction<TargetConfig>>;
}

export const MasterPromptConfigView: React.FC<MasterPromptConfigViewProps> = ({
  targetConfig,
  setTargetConfig
}) => {
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [positioningText, setPositioningText] = useState(
    "Strategic Operations & Process Transformation Leader with 9+ years (7+ at Gartner) who bridges business, legal ops, CLM and agentic AI. Proven 60% TAT reduction via structured RCA. LLB + hands-on agentic AI, Copilot, prompt engineering and Python automation. Already shipping live AI tools (WhatsApp booking platform + personal career automation console)."
  );

  const fullMasterPrompt = `MASTER PROMPT – Akash Sharma Job Acquisition OS (v2.0 – 18 LPA Floor)
Mission: Secure a written offer of ≥ ₹18 LPA CTC (preferably 20–28 LPA range) by 28 August 2026 in Strategic Operations / Process Transformation / Legal Ops / AI Integration & Governance / CLM / Enterprise AI Enablement roles.
Preferred: Remote / Hybrid Delhi-NCR (Gurgaon, Noida, Bijwasan-accessible) + US / Night shift preference.

Core Positioning:
"${positioningText}"

Hard Filters (non-negotiable – Scoring Engine enforces):
- Expected CTC ≥ 18 LPA. Roles quoting <18 LPA or "best as per industry" without clear band → auto-skip.
- Title match priority: Operations Lead / Process Transformation / Legal Ops / CLM / AI Enablement / Governance / Automation Lead / Enterprise AI.
- Experience relevance: Gartner / Big-4 / Global capability centres / Product companies with process + AI focus.
- Remote or Delhi-NCR preferred. Pure on-site outside NCR → heavy penalty.
- No pure individual contributor junior roles. Lead / Manager / Senior Manager level only.

Scoring Weights (0–100):
- Salary band ≥18 LPA clarity & upside (25)
- Title + skills match (Process + CLM + AI) (25)
- Company quality + growth + AI maturity (15)
- Remote / US-shift / location fit (15)
- Referral possibility or warm path (10)
- Posting age + competition (10)

Score Thresholds:
- Score ≥75 → full custom resume + cover + apply same day.
- 60–74 → light tailor.
- <60 → discard.

Exit Condition:
Written offer ≥18 LPA accepted + all open applications archived + final performance report generated.`;

  const copyPromptToClipboard = () => {
    navigator.clipboard.writeText(fullMasterPrompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#0d0d0f] border border-[#1f1f23] rounded p-5 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1">
            <Sliders className="w-3.5 h-3.5" />
            System Prompt & Scoring Engine Hard Rules
          </span>
          <h2 className="text-base font-bold text-white uppercase tracking-wider">
            Akash Sharma Master Prompt Configuration (v2.0)
          </h2>
          <p className="text-xs text-[#a0a0aa]">
            Hard-coded ₹18 LPA CTC floor, 6-dimension scoring weights, and positioning framing.
          </p>
        </div>

        <button
          onClick={copyPromptToClipboard}
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase tracking-wider px-4 py-2 rounded text-xs flex items-center gap-1.5 shadow-lg shadow-blue-900/30 cursor-pointer"
        >
          {copiedPrompt ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copiedPrompt ? 'Master Prompt Copied!' : 'Copy Master Prompt Text'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
        {/* Left 2 Cols: Master Prompt Code Viewer */}
        <div className="lg:col-span-2 bg-[#0d0d0f] border border-[#1f1f23] rounded p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#1f1f23] pb-2">
            <h3 className="font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Code2 className="w-4 h-4 text-blue-400" />
              Active System Prompt Injected Across Agents
            </h3>
            <span className="text-[10px] bg-green-500/10 text-green-400 font-mono px-2 py-0.5 rounded border border-green-500/20 uppercase tracking-wider">
              HARD_FLOOR_ACTIVE
            </span>
          </div>

          <pre className="bg-[#0a0a0b] p-4 rounded text-[#e0e0e0] font-mono text-[11px] whitespace-pre-wrap leading-relaxed border border-[#232328] max-h-[500px] overflow-y-auto">
            {fullMasterPrompt}
          </pre>
        </div>

        {/* Right Col: Parameters & Positioning Adjuster */}
        <div className="space-y-4">
          <div className="bg-[#0d0d0f] border border-[#1f1f23] rounded p-5 space-y-4">
            <h3 className="font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-[#1f1f23] pb-2">
              <Lock className="w-4 h-4 text-blue-400" />
              Hard Enforced Rules
            </h3>

            <div className="space-y-3">
              <div className="bg-[#0a0a0b] p-3 rounded border border-[#232328]">
                <span className="text-[#6b6b75] text-[10px] uppercase tracking-wider block">Non-Negotiable CTC Floor</span>
                <span className="text-base font-mono font-bold text-green-400 flex items-center gap-1 mt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                  ₹18,00,000 (18 LPA) CTC
                </span>
                <span className="text-[10px] text-[#6b6b75] block mt-1">Roles below 18 LPA auto-discarded. Zero effort spent.</span>
              </div>

              <div className="bg-[#0a0a0b] p-3 rounded border border-[#232328]">
                <span className="text-[#6b6b75] text-[10px] uppercase tracking-wider block">Target Role Seniority</span>
                <span className="text-xs font-bold text-white mt-0.5 block">Lead / Manager / Senior Manager / Associate Director</span>
                <span className="text-[10px] text-[#6b6b75] block mt-1">No pure individual contributor junior roles.</span>
              </div>

              <div className="bg-[#0a0a0b] p-3 rounded border border-[#232328]">
                <span className="text-[#6b6b75] text-[10px] uppercase tracking-wider block">Target Deadline</span>
                <span className="text-xs font-mono font-bold text-white mt-0.5 block">28 August 2026</span>
              </div>
            </div>
          </div>

          <div className="bg-[#0d0d0f] border border-[#1f1f23] rounded p-5 space-y-3">
            <h3 className="font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-[#1f1f23] pb-2">
              <Sparkles className="w-4 h-4 text-green-400" />
              Positioning Statement
            </h3>

            <textarea
              rows={5}
              value={positioningText}
              onChange={(e) => setPositioningText(e.target.value)}
              className="w-full bg-[#0a0a0b] text-[#e0e0e0] text-xs p-3 rounded border border-[#232328] focus:outline-none focus:border-blue-500 leading-relaxed font-sans"
            ></textarea>
            <p className="text-[10px] text-[#6b6b75]">
              This framing is injected into every AI resume tailoring and cover letter request.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
