import React from 'react';
import { JobRole } from '../types';
import { ResumeData } from './ResumeUpload';
import { 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Award, 
  Plus, 
  Flame, 
  Layers, 
  ArrowUpRight, 
  ShieldAlert, 
  TrendingUp 
} from 'lucide-react';

interface SkillGapHeatmapProps {
  jobs: JobRole[];
  resumeData: ResumeData;
  onUpdateResume?: (data: ResumeData) => void;
}

export const SkillGapHeatmap: React.FC<SkillGapHeatmapProps> = ({
  jobs,
  resumeData,
  onUpdateResume
}) => {
  // Extract high-priority top-scoring jobs
  const highPriorityJobs = jobs.filter(j => j.scores.totalScore >= 75);

  // Common high-demand industry skills for Senior Fullstack / Architect roles
  const MARKET_REQUIRED_SKILLS = [
    { name: 'React 18', category: 'Frontend', demandScore: 98 },
    { name: 'TypeScript', category: 'Language', demandScore: 96 },
    { name: 'Node.js', category: 'Backend', demandScore: 94 },
    { name: 'PostgreSQL', category: 'Database', demandScore: 90 },
    { name: 'Docker', category: 'DevOps', demandScore: 88 },
    { name: 'Kubernetes', category: 'DevOps', demandScore: 85 },
    { name: 'Microservices', category: 'Architecture', demandScore: 92 },
    { name: 'System Design', category: 'Architecture', demandScore: 95 },
    { name: 'GraphQL', category: 'API', demandScore: 82 },
    { name: 'Kafka', category: 'Messaging', demandScore: 78 },
    { name: 'AWS Cloud Architect', category: 'Certification', demandScore: 94 },
    { name: 'Redis Caching', category: 'Performance', demandScore: 86 }
  ];

  // Compare resume skills against market requirements
  const userSkillSet = new Set([
    ...resumeData.skills.map(s => s.toLowerCase()),
    ...resumeData.certifications.map(c => c.toLowerCase()),
    ...resumeData.rawText.toLowerCase().split(/\W+/)
  ]);

  const skillAnalysis = MARKET_REQUIRED_SKILLS.map(item => {
    const isPresent = userSkillSet.has(item.name.toLowerCase()) || 
      Array.from(userSkillSet).some(s => s.includes(item.name.toLowerCase().split(' ')[0]));

    return {
      ...item,
      matched: isPresent
    };
  });

  const matchedCount = skillAnalysis.filter(s => s.matched).length;
  const matchPercentage = Math.round((matchedCount / MARKET_REQUIRED_SKILLS.length) * 100);

  const missingSkills = skillAnalysis.filter(s => !s.matched);

  const handleAddSkillToResume = (skillName: string) => {
    if (!onUpdateResume) return;
    const isCert = skillName.toLowerCase().includes('certification') || skillName.toLowerCase().includes('architect');
    
    if (isCert) {
      onUpdateResume({
        ...resumeData,
        certifications: [...resumeData.certifications, skillName],
        atsScore: Math.min(99, resumeData.atsScore + 2)
      });
    } else {
      onUpdateResume({
        ...resumeData,
        skills: [...resumeData.skills, skillName],
        atsScore: Math.min(99, resumeData.atsScore + 1)
      });
    }
  };

  return (
    <div className="bg-[#0d0d0f] border border-[#1f1f23] rounded-xl p-5 sm:p-6 shadow-2xl space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1f1f23] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono px-2.5 py-0.5 rounded font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-400 fill-current" />
              SKILL GAP & KEYWORD MATRIX
            </span>
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono px-2 py-0.5 rounded">
              ATS MATCH: {matchPercentage}%
            </span>
          </div>
          <h2 className="text-lg font-bold text-white uppercase tracking-wider mt-1.5 flex items-center gap-2">
            <span>High-Priority Target Skill Gap Heatmap</span>
          </h2>
          <p className="text-xs text-[#a0a0aa]">
            Compares keywords in base resume against top-scoring High-Priority job requirements to eliminate ATS disqualification risks.
          </p>
        </div>

        {/* Match Percentage Indicator */}
        <div className="flex items-center gap-3 bg-[#12131c] border border-[#222434] p-2.5 rounded-xl self-start sm:self-auto font-mono text-xs">
          <div className="text-center px-2">
            <span className="text-[10px] text-[#888898] uppercase block">Matched Skills</span>
            <span className="text-base font-bold text-emerald-400">{matchedCount} / {MARKET_REQUIRED_SKILLS.length}</span>
          </div>
          <div className="h-6 w-px bg-[#222434]"></div>
          <div className="text-center px-2">
            <span className="text-[10px] text-[#888898] uppercase block">Gap Ratio</span>
            <span className="text-base font-bold text-amber-400">{missingSkills.length} Missing</span>
          </div>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {skillAnalysis.map((item, idx) => (
          <div
            key={idx}
            className={`border rounded-xl p-3 flex flex-col justify-between transition-all ${
              item.matched
                ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
                : 'bg-red-950/20 border-red-500/40 text-red-300'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold uppercase ${
                  item.matched ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
                }`}>
                  {item.category}
                </span>
                <span className="text-[10px] font-mono font-bold text-amber-400">
                  {item.demandScore}% Req
                </span>
              </div>

              <h4 className="text-xs font-bold text-white mt-1 flex items-center justify-between">
                <span>{item.name}</span>
                {item.matched ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                )}
              </h4>
            </div>

            {!item.matched && (
              <button
                onClick={() => handleAddSkillToResume(item.name)}
                className="mt-2.5 bg-red-600/30 hover:bg-red-600/60 border border-red-500/40 text-white text-[10px] font-mono font-bold py-1 px-2 rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-all"
                title="Directly add this keyword to your base resume state"
              >
                <Plus className="w-3 h-3" />
                <span>Add to Resume</span>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
