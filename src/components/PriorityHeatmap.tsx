import React, { useState } from 'react';
import { JobRole } from '../types';
import { 
  Flame, 
  Sparkles, 
  Award, 
  TrendingUp, 
  ArrowUpRight, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Briefcase, 
  DollarSign, 
  ChevronRight, 
  FileText, 
  Send 
} from 'lucide-react';

interface PriorityHeatmapProps {
  jobs: JobRole[];
  onSelectJob: (job: JobRole) => void;
  setActiveTab: (tab: string) => void;
}

interface TierDefinition {
  id: string;
  name: string;
  scoreRange: string;
  minScore: number;
  maxScore: number;
  bgColor: string;
  borderColor: string;
  textColor: string;
  badgeBg: string;
  accentHex: string;
  description: string;
}

const TIERS: TierDefinition[] = [
  {
    id: 'ELITE',
    name: 'Tier 1: Elite Targets',
    scoreRange: '85–100 Score',
    minScore: 85,
    maxScore: 100,
    bgColor: 'bg-emerald-950/40 hover:bg-emerald-900/30',
    borderColor: 'border-emerald-500/50',
    textColor: 'text-emerald-400',
    badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    accentHex: '#10b981',
    description: 'Immediate action required. Highest alignment & CTC potential.'
  },
  {
    id: 'HIGH',
    name: 'Tier 2: High ROI Fit',
    scoreRange: '75–84 Score',
    minScore: 75,
    maxScore: 84,
    bgColor: 'bg-blue-950/40 hover:bg-blue-900/30',
    borderColor: 'border-blue-500/50',
    textColor: 'text-blue-400',
    badgeBg: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    accentHex: '#3b82f6',
    description: 'Strong technical match. Priority for customized resume tailoring.'
  },
  {
    id: 'MODERATE',
    name: 'Tier 3: Moderate Fit',
    scoreRange: '60–74 Score',
    minScore: 60,
    maxScore: 74,
    bgColor: 'bg-amber-950/40 hover:bg-amber-900/30',
    borderColor: 'border-amber-500/50',
    textColor: 'text-amber-400',
    badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    accentHex: '#f59e0b',
    description: 'Decent match. Suitable for 1-click apply or batch email campaigns.'
  },
  {
    id: 'BORDERLINE',
    name: 'Tier 4: Low / Borderline',
    scoreRange: '< 60 Score',
    minScore: 0,
    maxScore: 59,
    bgColor: 'bg-red-950/30 hover:bg-red-900/20',
    borderColor: 'border-red-500/40',
    textColor: 'text-red-400',
    badgeBg: 'bg-red-500/20 text-red-300 border-red-500/40',
    accentHex: '#ef4444',
    description: 'Low ROI or gap issues. Filtered or backlog opportunities.'
  }
];

export const PriorityHeatmap: React.FC<PriorityHeatmapProps> = ({
  jobs,
  onSelectJob,
  setActiveTab
}) => {
  const [selectedTierId, setSelectedTierId] = useState<string | null>(null);

  // Filter only qualified jobs (CTC floor passed) or active scored roles
  const activeScoredJobs = jobs.filter(j => j.scores.ctcFloorPassed);

  return (
    <div className="bg-[#0d0d0f] border border-[#1f1f23] rounded-xl p-5 sm:p-6 shadow-2xl space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1f1f23] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono px-2.5 py-0.5 rounded font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-400 fill-current" />
              HEATMAP VISUALIZATION
            </span>
            <span className="bg-blue-500/10 text-blue-400 border border-blue-500/30 text-[10px] font-mono px-2 py-0.5 rounded">
              ROI OPPORTUNITY MATRIX
            </span>
          </div>
          <h2 className="text-lg font-bold text-white uppercase tracking-wider mt-1.5 flex items-center gap-2">
            <span>Opportunity Priority Heatmap Tiers</span>
          </h2>
          <p className="text-xs text-[#a0a0aa]">
            Active scored jobs categorized into color-coded score tiers to maximize application bandwidth and ROI.
          </p>
        </div>

        {selectedTierId && (
          <button
            onClick={() => setSelectedTierId(null)}
            className="bg-[#1f1f26] hover:bg-[#2a2a35] text-white border border-[#333] text-xs font-mono px-3 py-1.5 rounded-lg cursor-pointer transition-all self-start sm:self-auto"
          >
            Show All Tiers
          </button>
        )}
      </div>

      {/* Heatmap Tiers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {TIERS.map((tier) => {
          const tierJobs = activeScoredJobs.filter(
            j => j.scores.totalScore >= tier.minScore && j.scores.totalScore <= tier.maxScore
          );

          const isFiltered = selectedTierId && selectedTierId !== tier.id;
          const isSelected = selectedTierId === tier.id;

          const avgCtc = tierJobs.length > 0 
            ? Math.round(tierJobs.reduce((acc, j) => acc + (j.ctcMinLpa + j.ctcMaxLpa)/2, 0) / tierJobs.length)
            : 0;

          return (
            <div
              key={tier.id}
              onClick={() => setSelectedTierId(isSelected ? null : tier.id)}
              className={`border rounded-xl p-4 transition-all duration-300 cursor-pointer relative overflow-hidden flex flex-col justify-between ${tier.bgColor} ${tier.borderColor} ${
                isFiltered ? 'opacity-40 scale-98' : 'opacity-100'
              } ${isSelected ? 'ring-2 ring-white shadow-2xl scale-[1.02]' : ''}`}
            >
              {/* Header */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-bold uppercase tracking-wider ${tier.badgeBg}`}>
                    {tier.scoreRange}
                  </span>
                  <span className="text-xs font-mono font-bold text-white bg-black/50 px-2 py-0.5 rounded">
                    {tierJobs.length} Roles
                  </span>
                </div>

                <h3 className={`text-sm font-bold ${tier.textColor} uppercase tracking-wider flex items-center justify-between`}>
                  <span>{tier.name}</span>
                </h3>

                <p className="text-[11px] text-[#888898] mt-1 leading-tight">
                  {tier.description}
                </p>

                {tierJobs.length > 0 && (
                  <div className="mt-3 bg-black/40 border border-white/10 rounded p-2 text-[11px] font-mono flex items-center justify-between">
                    <span className="text-[#888]">Avg Salary:</span>
                    <span className="text-green-400 font-bold">₹{avgCtc} LPA</span>
                  </div>
                )}
              </div>

              {/* Roles list inside heatmap cell */}
              <div className="mt-4 space-y-2 border-t border-white/10 pt-3">
                {tierJobs.length === 0 ? (
                  <div className="text-[11px] text-[#666] italic py-2 text-center">
                    No roles in this score range
                  </div>
                ) : (
                  tierJobs.slice(0, 3).map((job) => (
                    <div
                      key={job.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectJob(job);
                        setActiveTab('resume');
                      }}
                      className="bg-black/60 hover:bg-black/90 border border-white/10 hover:border-white/30 p-2.5 rounded-lg transition-all group/job"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-white text-xs line-clamp-1 group-hover/job:text-blue-300">
                          {job.title}
                        </span>
                        <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-500/20 px-1.5 py-0.2 rounded shrink-0">
                          {job.scores.totalScore}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-1 text-[10px] text-[#aaa] mt-1">
                        <span className="truncate">{job.company}</span>
                        <span className="text-green-400 font-mono font-bold shrink-0">
                          ₹{job.ctcMinLpa}L
                        </span>
                      </div>
                    </div>
                  ))
                )}

                {tierJobs.length > 3 && (
                  <div className="text-[10px] font-mono text-center text-[#888] pt-1">
                    + {tierJobs.length - 3} more opportunities in tier
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
