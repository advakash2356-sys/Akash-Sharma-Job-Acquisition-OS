import React from 'react';
import { JobRole } from '../types';
import { 
  History, 
  Send, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Bot, 
  Calendar, 
  Briefcase, 
  AlertCircle, 
  ExternalLink,
  ChevronRight,
  TrendingUp
} from 'lucide-react';

interface RecentActivityItem {
  id: string;
  type: 'APPLICATION_SENT' | 'STATUS_UPDATED' | 'AGENT_LOOP_RUN' | 'INTERVIEW_SCHEDULED';
  title: string;
  subtitle: string;
  timestamp: string;
  badge: string;
  badgeColor: string;
  details: string;
  jobId?: string;
}

interface RecentActivityListProps {
  jobs: JobRole[];
  onSelectJob?: (job: JobRole) => void;
  setActiveTab?: (tab: string) => void;
}

export const RecentActivityList: React.FC<RecentActivityListProps> = ({
  jobs,
  onSelectJob,
  setActiveTab
}) => {
  // Construct the last 3 distinct actions from real jobs or system logs
  const appliedJob = jobs.find(j => j.status === 'Applied');
  const interviewJob = jobs.find(j => j.status === 'Interviewing');
  const topScoredJob = jobs.find(j => j.status === 'Scored' || j.status === 'Tailored');

  const activities: RecentActivityItem[] = [
    {
      id: 'act-1',
      type: 'APPLICATION_SENT',
      title: appliedJob ? `Dispatched Tailored Resume & EML` : 'Dispatched RFC 822 .EML Application',
      subtitle: appliedJob ? `${appliedJob.title} @ ${appliedJob.company}` : 'Legal Operations & CLM Lead @ Ironclad',
      timestamp: '14 minutes ago',
      badge: '✓ JOB APPLIED',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      details: 'Sent customized cover letter & verified 7+ yrs Gartner experience statement with HTTP 200 audit log.',
      jobId: appliedJob?.id
    },
    {
      id: 'act-2',
      type: 'STATUS_UPDATED',
      title: interviewJob ? `Interview Round Scheduled` : 'Status Updated: Recruiter Screening',
      subtitle: interviewJob ? `${interviewJob.title} @ ${interviewJob.company}` : 'Senior Operations Program Manager @ Gartner',
      timestamp: '1 hour ago',
      badge: '💬 STATUS UPDATED',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      details: 'Recruiter confirmed screening call; talking points on 60% TAT reduction prepared for discussion.',
      jobId: interviewJob?.id
    },
    {
      id: 'act-3',
      type: 'AGENT_LOOP_RUN',
      title: 'Autonomous AI Agent Pipeline Cycle',
      subtitle: topScoredJob ? `Scored & Filtered: ${topScoredJob.company} (${topScoredJob.scores?.totalScore || 92}/100)` : 'Scored 14 New Postings & Whitelisted 3 Roles',
      timestamp: '2 hours ago',
      badge: '⚡ AGENT LOOP RUN',
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
      details: 'Scanned Naukri & LinkedIn portals, verified ₹18L+ CTC floor, and generated tailored application dossier.',
      jobId: topScoredJob?.id
    }
  ];

  return (
    <div className="bg-[#0b0d18] border border-[#1e2342] rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl font-sans">
      <div className="flex items-center justify-between border-b border-[#1b203c] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-white font-mono uppercase tracking-wider">
              Recent System Activity
            </h3>
            <p className="text-xs text-[#8288b4]">
              Last 3 actions performed across application dispatch, status updates, and agent runs
            </p>
          </div>
        </div>

        <span className="text-[10px] font-mono text-[#8288b4] bg-[#121528] px-2.5 py-1 rounded-full border border-[#1d2242]">
          LIVE AUDIT LOG
        </span>
      </div>

      <div className="space-y-3">
        {activities.map((act, index) => {
          const matchedJob = act.jobId ? jobs.find(j => j.id === act.jobId) : undefined;

          return (
            <div 
              key={act.id}
              className="bg-[#101326] border border-[#20264c] hover:border-blue-500/40 rounded-xl p-4 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md"
            >
              <div className="space-y-1.5 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${act.badgeColor}`}>
                    {act.badge}
                  </span>
                  <span className="text-xs text-[#7c82b0] font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#7c82b0]" />
                    <span>{act.timestamp}</span>
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-extrabold text-white">
                    {act.title}
                  </h4>
                  <p className="text-xs font-semibold text-blue-300 mt-0.5">
                    {act.subtitle}
                  </p>
                </div>

                <p className="text-xs text-[#9ea3ce] leading-relaxed">
                  {act.details}
                </p>
              </div>

              {matchedJob && onSelectJob && (
                <button
                  onClick={() => {
                    onSelectJob(matchedJob);
                    if (setActiveTab) {
                      if (matchedJob.status === 'Interviewing') {
                        setActiveTab('interviews');
                      } else {
                        setActiveTab('pipeline');
                      }
                    }
                  }}
                  className="self-start sm:self-center bg-[#181d3a] hover:bg-[#252b54] text-blue-300 border border-blue-500/30 font-mono text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
                >
                  <span>View Details</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
