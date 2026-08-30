import React, { useState } from 'react';
import { JobRole } from '../types';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Sparkles, 
  ArrowDown, 
  Building2, 
  UserCheck, 
  Send, 
  Award, 
  FileText, 
  Flame 
} from 'lucide-react';

interface JobHistoryTimelineProps {
  jobs: JobRole[];
  selectedJobId?: string;
  onSelectJob?: (job: JobRole) => void;
}

interface TimelineEvent {
  id: string;
  stageName: 'Scored' | 'Applied' | 'Interview' | 'Offer / Result';
  date: string;
  title: string;
  description: string;
  status: 'COMPLETED' | 'ACTIVE' | 'PENDING';
  actor: 'AI Agent' | 'Candidate' | 'Recruiter';
  notes?: string;
}

export const JobHistoryTimeline: React.FC<JobHistoryTimelineProps> = ({
  jobs,
  selectedJobId: propSelectedJobId,
  onSelectJob
}) => {
  const [activeJobId, setActiveJobId] = useState<string>(
    propSelectedJobId || jobs[0]?.id || ''
  );

  const activeJob = jobs.find(j => j.id === activeJobId) || jobs[0];

  if (!activeJob) {
    return null;
  }

  // Construct vertical chronological timeline sequence for selected job
  const getTimelineEvents = (job: JobRole): TimelineEvent[] => {
    const isApplied = job.status === 'Applied' || job.status === 'Interviewing' || job.status === 'Offer Received' || job.status === 'Archived';
    const isInterviewing = job.status === 'Interviewing' || job.status === 'Offer Received';
    const isOffer = job.status === 'Offer Received';

    return [
      {
        id: 'evt-1',
        stageName: 'Scored',
        date: job.dateAdded || '2026-07-20',
        title: 'Evaluated & High-Priority Match Scored',
        description: `Autonomous agent scored this role ${job.scores.totalScore}/100. High-Margin CTC match (₹${job.ctcMinLpa}L - ₹${job.ctcMaxLpa}L).`,
        status: 'COMPLETED',
        actor: 'AI Agent',
        notes: `Key Strengths: ${job.scores.pros.join(', ') || 'High alignment'}`
      },
      {
        id: 'evt-2',
        stageName: 'Applied',
        date: job.appliedDate || '2026-07-24',
        title: isApplied ? 'Application Submitted & Outreach Fired' : 'Pending Direct Application Submit',
        description: isApplied 
          ? `Resume tailored & cold outreach email dispatched via ${job.source || 'Direct Portal'}.` 
          : 'Queued in daily application batch.',
        status: isApplied ? 'COMPLETED' : 'PENDING',
        actor: isApplied ? 'Candidate' : 'AI Agent'
      },
      {
        id: 'evt-3',
        stageName: 'Interview',
        date: isInterviewing ? '2026-07-28' : 'Expected: 3-5 Days',
        title: isInterviewing ? 'Interview Rounds Scheduled & Active' : 'Waiting for Recruiter Screening Call',
        description: isInterviewing 
          ? 'Technical screening & system design prep drills completed.'
          : 'Snooze timer running for automated follow-up nudge.',
        status: isInterviewing ? 'COMPLETED' : (isApplied ? 'ACTIVE' : 'PENDING'),
        actor: isInterviewing ? 'Recruiter' : 'AI Agent'
      },
      {
        id: 'evt-4',
        stageName: 'Offer / Result',
        date: isOffer ? '2026-07-30' : 'Goal: Before 31 Aug 2026',
        title: isOffer ? 'Offer Extended — CTC ₹26.5 LPA' : 'Final Selection Decision',
        description: isOffer ? 'Offer letter received and verified.' : 'Tracking toward target deadline.',
        status: isOffer ? 'COMPLETED' : 'PENDING',
        actor: 'Recruiter'
      }
    ];
  };

  const events = getTimelineEvents(activeJob);

  return (
    <div className="bg-[#0d0d0f] border border-[#1f1f23] rounded-xl p-5 sm:p-6 shadow-2xl space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1f1f23] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono px-2.5 py-0.5 rounded font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              JOB HISTORY FLOW
            </span>
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono px-2 py-0.5 rounded">
              CHRONOLOGICAL AUDIT
            </span>
          </div>
          <h2 className="text-lg font-bold text-white uppercase tracking-wider mt-1.5 flex items-center gap-2">
            <span>Vertical Status Transition Flow</span>
          </h2>
          <p className="text-xs text-[#a0a0aa]">
            Complete lifecycle history (Scored → Applied → Interview → Offer) with timestamps and agent actions.
          </p>
        </div>

        {/* Job selector */}
        <select
          value={activeJobId}
          onChange={(e) => setActiveJobId(e.target.value)}
          className="bg-[#151726] border border-[#2b2e46] text-white text-xs font-mono p-2.5 rounded-xl focus:outline-none cursor-pointer self-start sm:self-auto"
        >
          {jobs.map((job) => (
            <option key={job.id} value={job.id}>
              {job.company} — {job.title}
            </option>
          ))}
        </select>
      </div>

      {/* Vertical Timeline */}
      <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#222538]">
        {events.map((evt, idx) => (
          <div key={evt.id} className="relative group">
            {/* Timeline Dot Indicator */}
            <div 
              className={`absolute -left-6 sm:-left-8 top-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-bold font-mono ${
                evt.status === 'COMPLETED'
                  ? 'bg-emerald-500 border-emerald-400 text-black shadow-lg shadow-emerald-500/30'
                  : evt.status === 'ACTIVE'
                  ? 'bg-amber-500 border-amber-400 text-black animate-pulse'
                  : 'bg-[#12131c] border-[#333750] text-[#666]'
              }`}
            >
              {idx + 1}
            </div>

            {/* Event Content Card */}
            <div className={`border rounded-xl p-4 transition-all ${
              evt.status === 'COMPLETED'
                ? 'bg-[#121422] border-[#22253d]'
                : evt.status === 'ACTIVE'
                ? 'bg-amber-950/20 border-amber-500/40'
                : 'bg-[#0f1017] border-[#1d1f2e] opacity-70'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1f2233] pb-2">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                    evt.stageName === 'Scored' ? 'bg-purple-500/20 text-purple-300' :
                    evt.stageName === 'Applied' ? 'bg-blue-500/20 text-blue-300' :
                    evt.stageName === 'Interview' ? 'bg-indigo-500/20 text-indigo-300' :
                    'bg-emerald-500/20 text-emerald-300'
                  }`}>
                    {evt.stageName}
                  </span>
                  <span className="text-xs font-mono text-amber-400 font-bold">
                    📅 {evt.date}
                  </span>
                </div>

                <span className="text-[10px] font-mono bg-[#1b1e2e] text-[#a0a0b0] px-2 py-0.5 rounded border border-[#2b2e46]">
                  Actor: {evt.actor}
                </span>
              </div>

              <h4 className="text-sm font-bold text-white mt-2">
                {evt.title}
              </h4>
              <p className="text-xs text-[#a0a0b0] mt-1 leading-relaxed">
                {evt.description}
              </p>

              {evt.notes && (
                <div className="mt-2 text-[11px] font-mono text-emerald-400 bg-emerald-950/30 p-2 rounded border border-emerald-500/30">
                  💡 {evt.notes}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
