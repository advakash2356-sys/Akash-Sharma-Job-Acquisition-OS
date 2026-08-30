import React, { useState } from 'react';
import { JobRole, InterviewRound, JobStatus } from '../types';
import { 
  Calendar, 
  Clock, 
  UserCheck, 
  Video, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Edit3, 
  Trash2, 
  FileText, 
  ChevronRight, 
  Sparkles,
  ExternalLink,
  MessageSquare,
  Award
} from 'lucide-react';
import { InterviewReadinessModule } from './InterviewReadinessModule';

interface InterviewSchedulerProps {
  jobs: JobRole[];
  onUpdateJob: (updatedJob: JobRole) => void;
  onUpdateJobStatus: (jobId: string, newStatus: JobStatus) => void;
  selectedJobId?: string | null;
}

export const InterviewScheduler: React.FC<InterviewSchedulerProps> = ({
  jobs,
  onUpdateJob,
  onUpdateJobStatus,
  selectedJobId
}) => {
  const interviewingJobs = jobs.filter(j => j.status === 'Interviewing' || (j.interviews && j.interviews.length > 0));

  const [activeJobId, setActiveJobId] = useState<string>(
    selectedJobId || (interviewingJobs.length > 0 ? interviewingJobs[0].id : jobs[0]?.id || '')
  );

  const activeJob = jobs.find(j => j.id === activeJobId) || jobs[0];

  const [isAddRoundOpen, setIsAddRoundOpen] = useState(false);
  const [editingRoundId, setEditingRoundId] = useState<string | null>(null);

  // New round form state
  const [roundTitle, setRoundTitle] = useState('Hiring Manager Technical & Case Study');
  const [scheduledDate, setScheduledDate] = useState('2026-08-02T15:00');
  const [interviewerName, setInterviewerName] = useState(activeJob?.contactPerson?.name || 'Siddharth Verma');
  const [interviewerTitle, setInterviewerTitle] = useState(activeJob?.contactPerson?.title || 'Director – Legal Ops');
  const [meetingLink, setMeetingLink] = useState('https://meet.google.com/abc-defg-hij');
  const [roundStatus, setRoundStatus] = useState<'Scheduled' | 'Completed' | 'Passed' | 'Needs Follow-Up' | 'Rejected'>('Scheduled');
  const [prepNotes, setPrepNotes] = useState('Focus on 60% TAT reduction metric at Gartner, CLM playbook authoring, and Python Copilot automation.');
  const [feedbackNotes, setFeedbackNotes] = useState('');

  const currentRounds = activeJob?.interviews || [];

  const handleAddRound = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeJob) return;

    const newRound: InterviewRound = {
      id: `round-${Date.now()}`,
      roundNumber: currentRounds.length + 1,
      roundTitle,
      scheduledDate,
      interviewerName,
      interviewerTitle,
      meetingLink,
      status: roundStatus,
      prepNotes,
      feedbackNotes
    };

    const updatedJob: JobRole = {
      ...activeJob,
      status: activeJob.status === 'Discovered' || activeJob.status === 'Scored' ? 'Interviewing' : activeJob.status,
      interviews: [...currentRounds, newRound]
    };

    onUpdateJob(updatedJob);
    if (activeJob.status !== 'Interviewing') {
      onUpdateJobStatus(activeJob.id, 'Interviewing');
    }
    setIsAddRoundOpen(false);

    // Reset defaults for next
    setRoundTitle('Executive Leadership & Negotiation');
    setPrepNotes('Emphasize ₹22–28 LPA CTC floor and 6 FTE leadership experience.');
  };

  const handleUpdateRoundStatus = (roundId: string, newStatus: 'Scheduled' | 'Completed' | 'Passed' | 'Needs Follow-Up' | 'Rejected') => {
    if (!activeJob) return;
    const updatedRounds = currentRounds.map(r => r.id === roundId ? { ...r, status: newStatus } : r);
    onUpdateJob({
      ...activeJob,
      interviews: updatedRounds
    });
  };

  const handleDeleteRound = (roundId: string) => {
    if (!activeJob) return;
    const updatedRounds = currentRounds.filter(r => r.id !== roundId);
    onUpdateJob({
      ...activeJob,
      interviews: updatedRounds
    });
  };

  const handleUpdateNotes = (roundId: string, feedbackText: string) => {
    if (!activeJob) return;
    const updatedRounds = currentRounds.map(r => r.id === roundId ? { ...r, feedbackNotes: feedbackText } : r);
    onUpdateJob({
      ...activeJob,
      interviews: updatedRounds
    });
  };

  return (
    <div className="bg-[#0d0d0f] border border-[#1f1f23] rounded p-5 shadow-lg space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1f1f23] pb-4">
        <div>
          <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-green-400" />
            Interview Scheduler & Round Feedback Command Center
          </span>
          <h2 className="text-base font-bold text-white uppercase tracking-wider mt-0.5">
            Active Interview Rounds & Preparation Log
          </h2>
          <p className="text-xs text-[#a0a0aa]">
            Track interview dates, meeting links, interviewer contacts, key prep notes, and round feedback for active roles.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddRoundOpen(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase tracking-wider px-3.5 py-2 rounded text-xs flex items-center gap-1.5 shadow-lg shadow-blue-900/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Schedule Interview Round
          </button>
        </div>
      </div>

      {/* Role Selection Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#1f1f23]">
        {jobs.filter(j => j.scores.ctcFloorPassed).map(job => {
          const isSelected = job.id === activeJobId;
          const hasInterviews = job.interviews && job.interviews.length > 0;
          return (
            <button
              key={job.id}
              onClick={() => setActiveJobId(job.id)}
              className={`px-3 py-2 rounded border text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                isSelected
                  ? 'bg-blue-600 text-white border-blue-500'
                  : 'bg-[#151518] text-[#a0a0aa] border-[#232328] hover:border-[#33333a] hover:text-white'
              }`}
            >
              <span>{job.company}</span>
              {hasInterviews && (
                <span className="bg-green-500/20 text-green-400 text-[9px] font-mono px-1.5 py-0.5 rounded border border-green-500/30">
                  {job.interviews?.length} Rounds
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Active Job Interview Dashboard */}
      {activeJob && (
        <div className="space-y-5">
          {/* Active Job Header Card */}
          <div className="bg-[#151518] border border-[#232328] rounded p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono font-bold text-green-400 bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20 uppercase">
                  Status: {activeJob.status}
                </span>
                <span className="text-[10px] font-mono text-white bg-[#0a0a0b] px-2 py-0.5 rounded border border-[#232328]">
                  Target CTC: ₹{activeJob.ctcMinLpa}–{activeJob.ctcMaxLpa} LPA
                </span>
              </div>
              <h3 className="text-base font-bold text-white leading-tight">{activeJob.title}</h3>
              <p className="text-xs text-[#a0a0aa]">{activeJob.company} • {activeJob.location} ({activeJob.workMode})</p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {activeJob.status !== 'Interviewing' && (
                <button
                  onClick={() => onUpdateJobStatus(activeJob.id, 'Interviewing')}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider px-3 py-1.5 rounded flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Set Status to 'Interviewing'
                </button>
              )}

              {activeJob.status === 'Interviewing' && (
                <button
                  onClick={() => onUpdateJobStatus(activeJob.id, 'Offer Received')}
                  className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs uppercase tracking-wider px-3 py-1.5 rounded flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Award className="w-3.5 h-3.5" />
                  Mark Offer Received!
                </button>
              )}
            </div>
          </div>

          {/* Rounds List */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-[#1f1f23] pb-2">
              <Clock className="w-4 h-4 text-blue-400" />
              Scheduled & Completed Rounds ({currentRounds.length})
            </h4>

            {currentRounds.length === 0 ? (
              <div className="bg-[#151518] border border-[#232328] rounded p-8 text-center space-y-3">
                <Calendar className="w-8 h-8 text-[#6b6b75] mx-auto" />
                <p className="text-xs text-[#a0a0aa]">
                  No interview rounds scheduled yet for <strong className="text-white">{activeJob.company}</strong>.
                </p>
                <button
                  onClick={() => setIsAddRoundOpen(true)}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase tracking-wider px-4 py-2 rounded text-xs inline-flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  Schedule Round 1
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {currentRounds.map((round) => (
                  <div 
                    key={round.id}
                    className="bg-[#151518] border border-[#232328] rounded p-4 space-y-3 transition-all"
                  >
                    {/* Round Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#232328] pb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-blue-600/20 text-blue-400 font-mono font-bold text-xs flex items-center justify-center border border-blue-500/30">
                          R{round.roundNumber}
                        </span>
                        <div>
                          <h5 className="font-bold text-white text-xs uppercase tracking-wider">{round.roundTitle}</h5>
                          <span className="text-[10px] text-[#6b6b75] font-mono">
                            {round.scheduledDate ? new Date(round.scheduledDate).toLocaleString() : 'Date TBD'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Status Select */}
                        <select
                          value={round.status}
                          onChange={(e) => handleUpdateRoundStatus(round.id, e.target.value as any)}
                          className="bg-[#0a0a0b] text-white text-[11px] font-mono font-bold px-2.5 py-1 rounded border border-[#232328] focus:border-blue-500"
                        >
                          <option value="Scheduled">Scheduled</option>
                          <option value="Completed">Completed</option>
                          <option value="Passed">Passed</option>
                          <option value="Needs Follow-Up">Needs Follow-Up</option>
                          <option value="Rejected">Rejected</option>
                        </select>

                        <button
                          onClick={() => handleDeleteRound(round.id)}
                          className="text-[#6b6b75] hover:text-red-400 p-1 transition-colors"
                          title="Delete Round"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Interviewer & Meeting Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-[#0a0a0b] p-3 rounded border border-[#232328]">
                      <div>
                        <span className="text-[10px] font-semibold text-[#a0a0aa] uppercase tracking-wider block mb-0.5">
                          Interviewer Contact
                        </span>
                        <div className="text-white font-bold">{round.interviewerName || 'Hiring Lead'}</div>
                        <div className="text-[10px] text-[#6b6b75]">{round.interviewerTitle || 'Talent Acquisition'}</div>
                      </div>

                      <div>
                        <span className="text-[10px] font-semibold text-[#a0a0aa] uppercase tracking-wider block mb-0.5">
                          Video Meeting Link
                        </span>
                        {round.meetingLink ? (
                          <a
                            href={round.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:underline font-mono text-xs flex items-center gap-1 font-semibold"
                          >
                            <Video className="w-3.5 h-3.5 text-blue-400" />
                            Launch Meeting Room
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-[#6b6b75] text-[11px]">No link attached</span>
                        )}
                      </div>
                    </div>

                    {/* Prep Notes & Feedback Notes */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-400" />
                          Preparation Focus Notes
                        </span>
                        <p className="bg-[#0a0a0b] p-2.5 rounded border border-[#232328] text-[#e0e0e0] font-sans text-xs leading-relaxed">
                          {round.prepNotes || 'No prep notes entered.'}
                        </p>
                      </div>

                      <div>
                        <span className="text-[10px] font-semibold text-green-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
                          <MessageSquare className="w-3 h-3 text-green-400" />
                          Round Feedback & Q&A Notes
                        </span>
                        <textarea
                          rows={3}
                          value={round.feedbackNotes || ''}
                          onChange={(e) => handleUpdateNotes(round.id, e.target.value)}
                          placeholder="Record key questions asked, salary budget discussed, and follow-up items..."
                          className="w-full bg-[#0a0a0b] text-[#e0e0e0] text-xs p-2.5 rounded border border-[#232328] focus:outline-none focus:border-blue-500 leading-relaxed font-sans"
                        ></textarea>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Targeted Interview Readiness Module */}
          <InterviewReadinessModule job={activeJob} />
        </div>
      )}

      {/* Add Round Modal */}
      {isAddRoundOpen && (
        <div className="fixed inset-0 bg-[#0a0a0b]/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0d0d0f] border border-[#1f1f23] rounded-lg max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1f1f23] pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-400" />
                Schedule Interview Round for {activeJob?.company}
              </h3>
              <button onClick={() => setIsAddRoundOpen(false)} className="text-[#6b6b75] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddRound} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#a0a0aa] font-semibold uppercase tracking-wider text-[10px] mb-1">
                  Round Title / Stage
                </label>
                <select
                  value={roundTitle}
                  onChange={(e) => setRoundTitle(e.target.value)}
                  className="w-full bg-[#0a0a0b] text-white p-2.5 rounded border border-[#232328] focus:outline-none focus:border-blue-500 font-semibold"
                >
                  <option value="Recruiter Screening Call">Recruiter Screening Call</option>
                  <option value="Hiring Manager Technical & Case Study">Hiring Manager Technical & Case Study</option>
                  <option value="Legal Ops & CLM Architecture Deep-Dive">Legal Ops & CLM Architecture Deep-Dive</option>
                  <option value="Executive Leadership & Culture Fit">Executive Leadership & Culture Fit</option>
                  <option value="HR & Salary Negotiation">HR & Salary Negotiation</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[#a0a0aa] font-semibold uppercase tracking-wider text-[10px] mb-1">
                    Scheduled Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full bg-[#0a0a0b] text-white p-2 rounded border border-[#232328] focus:outline-none focus:border-blue-500 font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[#a0a0aa] font-semibold uppercase tracking-wider text-[10px] mb-1">
                    Round Status
                  </label>
                  <select
                    value={roundStatus}
                    onChange={(e) => setRoundStatus(e.target.value as any)}
                    className="w-full bg-[#0a0a0b] text-white p-2 rounded border border-[#232328] focus:outline-none focus:border-blue-500 font-bold"
                  >
                    <option value="Scheduled">Scheduled</option>
                    <option value="Completed">Completed</option>
                    <option value="Passed">Passed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[#a0a0aa] font-semibold uppercase tracking-wider text-[10px] mb-1">
                    Interviewer Name
                  </label>
                  <input
                    type="text"
                    value={interviewerName}
                    onChange={(e) => setInterviewerName(e.target.value)}
                    placeholder="e.g. Siddharth Verma"
                    className="w-full bg-[#0a0a0b] text-white p-2 rounded border border-[#232328] focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[#a0a0aa] font-semibold uppercase tracking-wider text-[10px] mb-1">
                    Title / Designation
                  </label>
                  <input
                    type="text"
                    value={interviewerTitle}
                    onChange={(e) => setInterviewerTitle(e.target.value)}
                    placeholder="e.g. Director - Legal Ops"
                    className="w-full bg-[#0a0a0b] text-white p-2 rounded border border-[#232328] focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#a0a0aa] font-semibold uppercase tracking-wider text-[10px] mb-1">
                  Video Meeting Link (Google Meet / Teams / Zoom)
                </label>
                <input
                  type="url"
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  placeholder="https://meet.google.com/..."
                  className="w-full bg-[#0a0a0b] text-white p-2 rounded border border-[#232328] focus:outline-none focus:border-blue-500 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-[#a0a0aa] font-semibold uppercase tracking-wider text-[10px] mb-1">
                  Preparation Focus Notes
                </label>
                <textarea
                  rows={2}
                  value={prepNotes}
                  onChange={(e) => setPrepNotes(e.target.value)}
                  placeholder="Key metrics, project stories, or CLM frameworks to highlight..."
                  className="w-full bg-[#0a0a0b] text-white p-2 rounded border border-[#232328] focus:outline-none focus:border-blue-500 text-xs"
                ></textarea>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddRoundOpen(false)}
                  className="px-3 py-2 bg-[#151518] hover:bg-[#1f1f23] text-[#a0a0aa] rounded text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase tracking-wider rounded text-xs shadow-lg shadow-blue-900/30"
                >
                  Save Interview Round
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
