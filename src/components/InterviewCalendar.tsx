import React, { useState } from 'react';
import { JobRole, InterviewRound } from '../types';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  UserCheck, 
  Video, 
  CheckCircle2, 
  Sparkles, 
  Plus, 
  Building2, 
  ExternalLink,
  Tag
} from 'lucide-react';

interface InterviewCalendarProps {
  jobs: JobRole[];
  onSelectJob?: (job: JobRole) => void;
}

interface CalendarInterviewEvent {
  jobId: string;
  company: string;
  jobTitle: string;
  roundTitle: string;
  roundType?: string;
  scheduledDate: string; // YYYY-MM-DD
  scheduledTime: string;
  interviewerName?: string;
  status: 'Scheduled' | 'Completed' | 'Passed' | 'Rejected' | 'Needs Follow-Up' | 'SCHEDULED' | 'COMPLETED';
  meetingLink?: string;
  feedbackNotes?: string;
}

export const InterviewCalendar: React.FC<InterviewCalendarProps> = ({
  jobs,
  onSelectJob
}) => {
  // Calendar View State - Defaulting to August 2026
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(7); // 0-indexed: 7 = August

  const [selectedDateStr, setSelectedDateStr] = useState<string>('2026-08-02');
  const [showAddModal, setShowAddModal] = useState(false);

  // Collect all interviews across jobs
  const getAllEvents = (): CalendarInterviewEvent[] => {
    const events: CalendarInterviewEvent[] = [];

    // Seed/Gather from jobs
    jobs.forEach(job => {
      if (job.interviews && job.interviews.length > 0) {
        job.interviews.forEach(round => {
          const rawDate = round.scheduledDate || '2026-08-02';
          const dateOnly = rawDate.includes('T') ? rawDate.split('T')[0] : rawDate;
          events.push({
            jobId: job.id,
            company: job.company,
            jobTitle: job.title,
            roundTitle: round.roundTitle || 'Interview Round',
            scheduledDate: dateOnly,
            scheduledTime: round.scheduledDate && round.scheduledDate.includes('T') ? round.scheduledDate.split('T')[1] : '02:00 PM',
            interviewerName: round.interviewerName || job.contactPerson?.name || 'Hiring Manager',
            status: round.status,
            meetingLink: round.meetingLink || 'https://meet.google.com/abc-defg-hij',
            feedbackNotes: round.feedbackNotes || round.prepNotes || 'Review System Design & Redis caching architecture.'
          });
        });
      } else if (job.status === 'Interviewing' || job.status === 'Offer Received') {
        // Generate default scheduled interview entry if job is interviewing
        events.push({
          jobId: job.id,
          company: job.company,
          jobTitle: job.title,
          roundTitle: 'Technical Screening & System Design',
          scheduledDate: '2026-08-02',
          scheduledTime: '04:30 PM',
          interviewerName: job.contactPerson?.name || 'Engineering Lead',
          status: 'Scheduled',
          meetingLink: 'https://meet.google.com/xyz-uvwx-rst',
          feedbackNotes: 'Focus on distributed systems, React 18 concurrent features & CLM workflows.'
        });
      }
    });

    // Seed default baseline entries for rich calendar display if empty
    if (events.length === 0 && jobs[0]) {
      events.push(
        {
          jobId: jobs[0].id,
          company: jobs[0].company,
          jobTitle: jobs[0].title,
          roundTitle: 'Technical R1 - System Architecture',
          scheduledDate: '2026-08-02',
          scheduledTime: '04:30 PM',
          interviewerName: 'Siddharth Verma (Engineering Lead)',
          status: 'Scheduled',
          meetingLink: 'https://meet.google.com/deloitte-tech-round',
          feedbackNotes: 'Prepare microservices architecture diagrams and React state optimization.'
        },
        {
          jobId: jobs[1]?.id || jobs[0].id,
          company: jobs[1]?.company || 'Fractal Analytics',
          jobTitle: jobs[1]?.title || 'Lead Enterprise AI Enablement',
          roundTitle: 'Executive Leadership & AI Strategy',
          scheduledDate: '2026-08-08',
          scheduledTime: '11:00 AM',
          interviewerName: 'Ananya Roy (VP Engineering)',
          status: 'Scheduled',
          meetingLink: 'https://meet.google.com/fractal-ai-sync',
          feedbackNotes: 'Discuss LLM agent workflows and enterprise Copilot rollouts.'
        }
      );
    }

    return events;
  };

  const allEvents = getAllEvents();

  // Calendar Helpers
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sun

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleToday = () => {
    setCurrentYear(2026);
    setCurrentMonth(7); // August
    setSelectedDateStr('2026-08-02');
  };

  // Filter events for selected date
  const selectedDateEvents = allEvents.filter(e => e.scheduledDate === selectedDateStr);

  return (
    <div className="bg-[#0d0d0f] border border-[#1f1f23] rounded-xl p-5 sm:p-6 shadow-2xl space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1f1f23] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono px-2.5 py-0.5 rounded font-bold uppercase tracking-wider flex items-center gap-1.5">
              <CalendarIcon className="w-3.5 h-3.5 text-emerald-400" />
              INTERVIEW CALENDAR
            </span>
            <span className="bg-blue-500/10 text-blue-400 border border-blue-500/30 text-[10px] font-mono px-2 py-0.5 rounded">
              SYNCED WITH TRACKER
            </span>
          </div>
          <h2 className="text-lg font-bold text-white uppercase tracking-wider mt-1.5 flex items-center gap-2">
            <span>Scheduled Interview Calendar View</span>
          </h2>
          <p className="text-xs text-[#a0a0aa]">
            Monthly calendar grid displaying scheduled interview rounds, interviewer details, and prep notes.
          </p>
        </div>

        {/* Calendar Controls */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-lg bg-[#151726] hover:bg-[#22253c] text-[#a0a0b0] hover:text-white border border-[#232742] transition-all cursor-pointer"
            title="Previous Month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="text-sm font-bold text-white px-3 py-1.5 bg-[#12131c] border border-[#222434] rounded-lg">
            {monthNames[currentMonth]} {currentYear}
          </span>

          <button
            onClick={handleNextMonth}
            className="p-2 rounded-lg bg-[#151726] hover:bg-[#22253c] text-[#a0a0b0] hover:text-white border border-[#232742] transition-all cursor-pointer"
            title="Next Month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={handleToday}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-lg border border-emerald-400 transition-all cursor-pointer ml-1 text-xs"
          >
            Today (Aug 2026)
          </button>
        </div>
      </div>

      {/* Main Grid & Side Details Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Monthly Calendar Grid (8 cols on lg) */}
        <div className="lg:col-span-8 bg-[#12131c] border border-[#222434] rounded-xl p-4">
          {/* Day Names Header */}
          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-mono font-bold text-[#888898] uppercase pb-2 border-b border-[#222434]">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Calendar Days Cells */}
          <div className="grid grid-cols-7 gap-1 mt-2">
            {/* Empty Offset Cells */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="h-16 sm:h-20 bg-[#0a0b12]/50 rounded border border-transparent"></div>
            ))}

            {/* Month Days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const formattedDay = dayNum < 10 ? `0${dayNum}` : `${dayNum}`;
              const formattedMonth = currentMonth + 1 < 10 ? `0${currentMonth + 1}` : `${currentMonth + 1}`;
              const dateStr = `${currentYear}-${formattedMonth}-${formattedDay}`;

              const dayEvents = allEvents.filter(e => e.scheduledDate === dateStr);
              const isSelected = dateStr === selectedDateStr;
              const isToday = dateStr === '2026-08-02';

              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDateStr(dateStr)}
                  className={`h-16 sm:h-20 p-1.5 rounded-lg border text-left flex flex-col justify-between transition-all cursor-pointer relative ${
                    isSelected
                      ? 'bg-emerald-950/40 border-emerald-500 ring-1 ring-emerald-500/50'
                      : isToday
                      ? 'bg-[#1a1d30] border-blue-500/60'
                      : 'bg-[#0b0c14] border-[#1d1f30] hover:border-[#333752]'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className={`text-xs font-mono font-bold ${
                      isToday ? 'text-blue-400 bg-blue-500/20 px-1.5 py-0.5 rounded' : 'text-white'
                    }`}>
                      {dayNum}
                    </span>

                    {dayEvents.length > 0 && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    )}
                  </div>

                  {/* Render event badges */}
                  <div className="space-y-1 overflow-hidden">
                    {dayEvents.map((evt, idx) => (
                      <div 
                        key={idx}
                        className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[9px] font-mono font-bold px-1 py-0.5 rounded truncate"
                      >
                        ⚡ {evt.company}: {evt.roundTitle}
                      </div>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Date Details Panel (4 cols on lg) */}
        <div className="lg:col-span-4 bg-[#12131c] border border-[#222434] rounded-xl p-4 space-y-4">
          <div className="border-b border-[#222434] pb-2 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono text-[#888898] uppercase block">Selected Date</span>
              <h3 className="text-sm font-bold text-white font-mono flex items-center gap-1.5 mt-0.5">
                <span>📅 {selectedDateStr}</span>
              </h3>
            </div>
            <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-emerald-500/30">
              {selectedDateEvents.length} Event{selectedDateEvents.length === 1 ? '' : 's'}
            </span>
          </div>

          {selectedDateEvents.length === 0 ? (
            <div className="text-center py-8 space-y-2 text-[#888898] font-mono text-xs">
              <p>No interview rounds scheduled for this date.</p>
              <p className="text-[10px] text-[#666]">Select another calendar day with active badges.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedDateEvents.map((evt, idx) => (
                <div key={idx} className="bg-[#0b0c14] border border-[#232742] rounded-lg p-3 space-y-2.5">
                  <div className="flex items-center justify-between border-b border-[#1f2238] pb-2">
                    <span className="text-xs font-bold text-emerald-400 font-mono flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5" />
                      {evt.company}
                    </span>
                    <span className="bg-blue-500/20 text-blue-300 text-[10px] font-mono px-2 py-0.5 rounded">
                      ⏰ {evt.scheduledTime}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-white">
                      {evt.roundTitle}
                    </h4>
                    <p className="text-[11px] text-[#a0a0b0] mt-0.5">
                      Target Role: {evt.jobTitle}
                    </p>
                  </div>

                  <div className="text-[11px] font-mono text-[#888898] space-y-1 bg-[#12131f] p-2 rounded border border-[#1f2238]">
                    <div className="flex items-center gap-1.5 text-amber-300">
                      <UserCheck className="w-3 h-3 text-amber-400" />
                      <span>Interviewer: {evt.interviewerName}</span>
                    </div>

                    {evt.meetingLink && (
                      <div className="flex items-center gap-1.5 text-blue-400">
                        <Video className="w-3 h-3 text-blue-400" />
                        <a 
                          href={evt.meetingLink} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="hover:underline flex items-center gap-1"
                        >
                          Join Google Meet Link <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                    )}
                  </div>

                  {evt.feedbackNotes && (
                    <p className="text-[10px] font-mono text-emerald-300 bg-emerald-950/20 p-2 rounded border border-emerald-500/30">
                      💡 Prep Focus: {evt.feedbackNotes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
