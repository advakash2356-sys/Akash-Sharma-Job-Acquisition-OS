import React, { useState } from 'react';
import { JobRole } from '../types';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  Plus, 
  UserCheck, 
  MessageSquare, 
  Award, 
  ChevronRight, 
  FileText, 
  AlertCircle 
} from 'lucide-react';

interface InterviewRound {
  id: string;
  roundType: 'Screening' | 'Technical R1' | 'System Design' | 'Behavioral' | 'Partner Round';
  scheduledDate: string;
  scheduledTime: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'FEEDBACK_PENDING';
  feedbackNotes: string;
  interviewerName: string;
}

interface InterviewStageTrackerProps {
  jobs: JobRole[];
  onSelectJob?: (job: JobRole) => void;
}

export const InterviewStageTracker: React.FC<InterviewStageTrackerProps> = ({
  jobs,
  onSelectJob
}) => {
  // Filter jobs currently in active pipeline or applied
  const activeJobs = jobs.filter(j => j.status === 'Applied' || j.status === 'Interviewing' || j.status === 'Offer Received');

  const [selectedJobId, setSelectedJobId] = useState<string>(activeJobs[0]?.id || jobs[0]?.id || '');

  // Mock initial rounds store for selected job
  const [roundsMap, setRoundsMap] = useState<Record<string, InterviewRound[]>>({
    [selectedJobId]: [
      {
        id: 'round-1',
        roundType: 'Screening',
        scheduledDate: '2026-07-28',
        scheduledTime: '11:00 AM',
        status: 'COMPLETED',
        feedbackNotes: 'Passed HR screening. Strong alignment with React 18 & Node.js experience.',
        interviewerName: 'Sarah Jenkins (Talent Acquisition)'
      },
      {
        id: 'round-2',
        roundType: 'Technical R1',
        scheduledDate: '2026-08-02',
        scheduledTime: '04:30 PM',
        status: 'SCHEDULED',
        feedbackNotes: 'Focus on System Design, Redis caching & distributed lock patterns.',
        interviewerName: 'Vikram Mehta (Engineering Manager)'
      }
    ]
  });

  const [newRoundType, setNewRoundType] = useState<InterviewRound['roundType']>('Technical R1');
  const [newRoundDate, setNewRoundDate] = useState('2026-08-05');
  const [newRoundTime, setNewRoundTime] = useState('03:00 PM');
  const [newInterviewer, setNewInterviewer] = useState('');
  const [newNotes, setNewNotes] = useState('');

  const currentRounds = roundsMap[selectedJobId] || [];
  const selectedJob = jobs.find(j => j.id === selectedJobId);

  const handleAddRound = () => {
    if (!selectedJobId) return;

    const newRound: InterviewRound = {
      id: `round-${Date.now()}`,
      roundType: newRoundType,
      scheduledDate: newRoundDate,
      scheduledTime: newRoundTime,
      status: 'SCHEDULED',
      feedbackNotes: newNotes || 'Scheduled round - AI prep prompts ready.',
      interviewerName: newInterviewer || 'Hiring Panel'
    };

    setRoundsMap(prev => ({
      ...prev,
      [selectedJobId]: [...(prev[selectedJobId] || []), newRound]
    }));

    setNewNotes('');
    setNewInterviewer('');
  };

  const handleToggleStatus = (roundId: string) => {
    setRoundsMap(prev => ({
      ...prev,
      [selectedJobId]: (prev[selectedJobId] || []).map(r => {
        if (r.id === roundId) {
          const nextStatus = r.status === 'SCHEDULED' ? 'COMPLETED' : 'SCHEDULED';
          return { ...r, status: nextStatus };
        }
        return r;
      })
    }));
  };

  return (
    <div className="bg-[#0d0d0f] border border-[#1f1f23] rounded-xl p-5 sm:p-6 shadow-2xl space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1f1f23] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-[10px] font-mono px-2.5 py-0.5 rounded font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              INTERVIEW ROUND TRACKER
            </span>
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono px-2 py-0.5 rounded">
              31 AUG DEADLINE DRILLS
            </span>
          </div>
          <h2 className="text-lg font-bold text-white uppercase tracking-wider mt-1.5 flex items-center gap-2">
            <span>Interview Stage Logger & Round Countdown</span>
          </h2>
          <p className="text-xs text-[#a0a0aa]">
            Log interview rounds (Screening, Technical, System Design, Partner), track dates, and record recruiter feedback notes.
          </p>
        </div>

        {/* Job selector dropdown */}
        <select
          value={selectedJobId}
          onChange={(e) => setSelectedJobId(e.target.value)}
          className="bg-[#151726] border border-[#2b2e46] text-white text-xs font-mono p-2.5 rounded-xl focus:outline-none cursor-pointer self-start sm:self-auto"
        >
          {jobs.map((job) => (
            <option key={job.id} value={job.id}>
              {job.company} — {job.title}
            </option>
          ))}
        </select>
      </div>

      {selectedJob && (
        <div className="space-y-4">
          {/* Active Job Header Banner */}
          <div className="bg-[#12131c] border border-[#222434] p-3.5 rounded-xl flex items-center justify-between gap-3 font-mono text-xs">
            <div>
              <span className="text-amber-400 font-bold block">{selectedJob.company}</span>
              <span className="text-white text-sm font-bold">{selectedJob.title}</span>
            </div>
            <div className="text-right">
              <span className="text-emerald-400 font-bold text-sm block">₹{selectedJob.ctcMinLpa}L – ₹{selectedJob.ctcMaxLpa}L</span>
              <span className="text-[10px] text-[#888898]">{selectedJob.location}</span>
            </div>
          </div>

          {/* Add Round Form */}
          <div className="bg-[#141522] border border-[#23263a] p-4 rounded-xl space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 font-mono">
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>Log Scheduled Interview Round</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
              <select
                value={newRoundType}
                onChange={(e) => setNewRoundType(e.target.value as any)}
                className="bg-[#191b2b] border border-[#2d3046] text-white font-mono p-2 rounded-lg"
              >
                <option value="Screening">HR Screening</option>
                <option value="Technical R1">Technical R1</option>
                <option value="System Design">System Design</option>
                <option value="Behavioral">Behavioral</option>
                <option value="Partner Round">Partner / Director Round</option>
              </select>

              <input
                type="date"
                value={newRoundDate}
                onChange={(e) => setNewRoundDate(e.target.value)}
                className="bg-[#191b2b] border border-[#2d3046] text-white font-mono p-2 rounded-lg"
              />

              <input
                type="text"
                placeholder="Interviewer Name / Panel"
                value={newInterviewer}
                onChange={(e) => setNewInterviewer(e.target.value)}
                className="bg-[#191b2b] border border-[#2d3046] text-white font-mono p-2 rounded-lg placeholder-[#555]"
              />

              <button
                onClick={handleAddRound}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs p-2 rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-all"
              >
                <span>Add Round</span>
              </button>
            </div>
          </div>

          {/* Logged Rounds List */}
          <div className="space-y-2">
            {currentRounds.length === 0 ? (
              <div className="text-xs text-[#777] italic py-4 text-center">
                No interview rounds logged yet for this role. Use the form above to add upcoming rounds.
              </div>
            ) : (
              currentRounds.map((round) => (
                <div
                  key={round.id}
                  className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    round.status === 'COMPLETED'
                      ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
                      : 'bg-[#12131c] border-[#222434] text-white'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 font-mono text-xs">
                      <span className="font-bold text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30 uppercase">
                        {round.roundType}
                      </span>
                      <span className="text-[#a0a0b0]">
                        📅 {round.scheduledDate} at {round.scheduledTime}
                      </span>
                    </div>

                    <h5 className="font-bold text-sm text-white mt-1">
                      {round.interviewerName}
                    </h5>

                    <p className="text-xs text-[#a0a0b0] leading-relaxed">
                      {round.feedbackNotes}
                    </p>
                  </div>

                  <button
                    onClick={() => handleToggleStatus(round.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold shrink-0 flex items-center gap-1.5 cursor-pointer border transition-all ${
                      round.status === 'COMPLETED'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-[#1e2133] hover:bg-[#282c44] text-white border-[#333750]'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{round.status === 'COMPLETED' ? 'Completed' : 'Mark Completed'}</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
