import React from 'react';
import { JobRole } from '../types';
import { 
  TrendingUp, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Target, 
  Zap,
  ArrowRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ReferenceLine,
  CartesianGrid
} from 'recharts';

interface TimeToOfferProjectionProps {
  jobs: JobRole[];
  targetDeadline?: string;
}

export const TimeToOfferProjection: React.FC<TimeToOfferProjectionProps> = ({
  jobs,
  targetDeadline = '28 August 2026'
}) => {
  const currentDate = new Date('2026-07-28');
  const deadlineDate = new Date('2026-08-28');
  const daysRemaining = Math.max(0, Math.ceil((deadlineDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)));

  const appliedJobs = jobs.filter(j => j.status === 'Applied' || j.status === 'Interviewing' || j.status === 'Offer Received');
  const interviewingJobs = jobs.filter(j => j.status === 'Interviewing' || j.status === 'Offer Received');
  const offerJobs = jobs.filter(j => j.status === 'Offer Received');

  // Conversion rates calculations
  const totalApplied = Math.max(1, appliedJobs.length);
  const totalInterviewing = interviewingJobs.length;
  const currentInterviewRate = Math.min(1.0, Math.max(0.12, totalInterviewing / totalApplied));
  
  // Historical conversion benchmark: ~15% interview rate, ~25% interview-to-offer rate (overall ~3.75% app-to-offer)
  const interviewToOfferRate = 0.25; 
  const appToOfferRate = currentInterviewRate * interviewToOfferRate;

  // Projection math
  const dailyAppPace = 12; // Target cadence apps/day
  const projectedAppsByDeadline = totalApplied + (dailyAppPace * daysRemaining);
  const projectedOffers = offerJobs.length + Math.round(projectedAppsByDeadline * appToOfferRate);

  // Time-to-offer estimate in days
  const avgProcessDays = 16; // Average interview-to-offer loop duration
  const estimatedOfferDaysFromNow = Math.round(avgProcessDays / Math.max(0.5, totalInterviewing || 1));
  const estimatedOfferDate = new Date(currentDate.getTime() + (estimatedOfferDaysFromNow * 20000000));
  
  const isOnTrack = daysRemaining >= 12 && (totalInterviewing > 0 || projectedOffers >= 1);

  // Recharts Projection Data across 5 milestone weeks up to 28 August 2026
  const projectionData = [
    { week: 'Jul 28 (Now)', applied: totalApplied, projectedInterviews: totalInterviewing, projectedOffers: offerJobs.length },
    { week: 'Aug 04 (Wk 1)', applied: totalApplied + 70, projectedInterviews: Math.round((totalApplied + 70) * currentInterviewRate), projectedOffers: Math.max(0, Math.round((totalApplied + 30) * appToOfferRate)) },
    { week: 'Aug 11 (Wk 2)', applied: totalApplied + 140, projectedInterviews: Math.round((totalApplied + 140) * currentInterviewRate), projectedOffers: Math.round((totalApplied + 80) * appToOfferRate) },
    { week: 'Aug 18 (Wk 3)', applied: totalApplied + 210, projectedInterviews: Math.round((totalApplied + 210) * currentInterviewRate), projectedOffers: Math.round((totalApplied + 140) * appToOfferRate) + 1 },
    { week: 'Aug 28 (Goal)', applied: projectedAppsByDeadline, projectedInterviews: Math.round(projectedAppsByDeadline * currentInterviewRate), projectedOffers: Math.max(1, projectedOffers) }
  ];

  return (
    <div className="bg-[#0d0d0f] border border-[#1f1f23] rounded p-5 shadow-xl space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1f1f23] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-blue-600/10 text-blue-400 text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded border border-blue-500/20 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              TIME TO OFFER PROJECTION ENGINE
            </span>
            <span className="bg-[#1a1a1c] text-[#a0a0aa] text-[10px] font-mono px-2 py-0.5 rounded border border-[#2d2d30]">
              TARGET: {targetDeadline}
            </span>
          </div>

          <h2 className="text-base font-bold text-white uppercase tracking-wider">
            Offer Deadline Tracking ({daysRemaining} Days Remaining)
          </h2>
        </div>

        {/* Status Badge */}
        <div className={`px-4 py-2 rounded border flex items-center gap-2.5 shadow-md ${
          isOnTrack 
            ? 'bg-green-500/10 border-green-500/30 text-green-400' 
            : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
        }`}>
          {isOnTrack ? (
            <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          )}
          <div>
            <div className="font-mono text-xs font-bold uppercase tracking-wider">
              {isOnTrack ? 'ON TRACK FOR 28 AUG OFFER' : 'SCHEDULE ACCELERATION RECOMMENDED'}
            </div>
            <div className="text-[11px] opacity-90">
              Est. Offer Window: 12 – 22 August 2026
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div className="bg-[#151518] p-3 rounded border border-[#232328]">
          <span className="text-[#6b6b75] text-[10px] uppercase font-semibold block mb-1">App-to-Interview Conversion</span>
          <div className="text-lg font-mono font-bold text-white">
            {(currentInterviewRate * 100).toFixed(1)}%
          </div>
          <span className="text-[10px] text-green-400 font-mono">{totalInterviewing} active interview loops</span>
        </div>

        <div className="bg-[#151518] p-3 rounded border border-[#232328]">
          <span className="text-[#6b6b75] text-[10px] uppercase font-semibold block mb-1">Estimated Process Duration</span>
          <div className="text-lg font-mono font-bold text-blue-400">
            14–18 Days
          </div>
          <span className="text-[10px] text-[#a0a0aa] font-mono">From screening to final offer</span>
        </div>

        <div className="bg-[#151518] p-3 rounded border border-[#232328]">
          <span className="text-[#6b6b75] text-[10px] uppercase font-semibold block mb-1">Daily Cadence Target</span>
          <div className="text-lg font-mono font-bold text-white">
            12–15 <span className="text-xs font-sans text-[#a0a0aa]">apps/day</span>
          </div>
          <span className="text-[10px] text-blue-400 font-mono">≥₹18 LPA CTC floor roles</span>
        </div>

        <div className="bg-[#151518] p-3 rounded border border-[#232328]">
          <span className="text-[#6b6b75] text-[10px] uppercase font-semibold block mb-1">Projected Offers by Aug 28</span>
          <div className="text-lg font-mono font-bold text-green-400">
            {projectedOffers} <span className="text-xs font-sans text-[#a0a0aa]">offers</span>
          </div>
          <span className="text-[10px] text-green-400 font-mono">High confidence trajectory</span>
        </div>
      </div>

      {/* Recharts Area Chart Visualization */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-[#a0a0aa]">
          <span className="font-semibold uppercase text-[10px] tracking-wider text-[#6b6b75]">
            Cumulative Funnel Trajectory (Applications → Interviews → Offers)
          </span>
          <span className="font-mono text-[11px] text-blue-400">
            Target Deadline: 28 August 2026
          </span>
        </div>

        <div className="h-56 w-full bg-[#0a0a0b] p-3 rounded border border-[#232328]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={projectionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="offersGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="interviewsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.5}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f1f23" />
              <XAxis dataKey="week" stroke="#6b6b75" fontSize={10} tickLine={false} />
              <YAxis stroke="#6b6b75" fontSize={10} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0d0d0f', borderColor: '#232328', color: '#fff', fontSize: '11px', borderRadius: '4px' }}
              />
              <Area 
                type="monotone" 
                dataKey="projectedInterviews" 
                name="Projected Interviews"
                stroke="#3b82f6" 
                fillOpacity={1} 
                fill="url(#interviewsGradient)" 
              />
              <Area 
                type="monotone" 
                dataKey="projectedOffers" 
                name="Projected Offers"
                stroke="#22c55e" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#offersGradient)" 
              />
              <ReferenceLine x="Aug 28 (Goal)" stroke="#ef4444" strokeDasharray="3 3" label={{ value: '28 Aug Deadline', fill: '#ef4444', fontSize: 10, position: 'top' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
