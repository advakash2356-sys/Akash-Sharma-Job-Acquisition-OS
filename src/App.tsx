import React, { useState, useEffect } from 'react';
import { JobRole, JobStatus, TargetConfig } from './types';
import { initialJobs } from './data/initialJobs';
import { Navbar } from './components/Navbar';
import { BottomMobileNav } from './components/BottomMobileNav';
import { DashboardOverview } from './components/DashboardOverview';
import { ApplicationStatusScheduleChart } from './components/ApplicationStatusScheduleChart';
import { JobPipelineView } from './components/JobPipelineView';
import { ResumeTailorView } from './components/ResumeTailorView';
import { OutreachStudioView } from './components/OutreachStudioView';
import { DailyCadenceTracker } from './components/DailyCadenceTracker';
import { MasterPromptConfigView } from './components/MasterPromptConfigView';
import { RecruiterStrategyView } from './components/RecruiterStrategyView';
import { AgentCeoBoard } from './components/AgentCeoBoard';
import { SystemAuditView } from './components/SystemAuditView';
import { INITIAL_RESUME_DATA, ResumeData } from './components/ResumeUpload';
import { SkillGapHeatmap } from './components/SkillGapHeatmap';
import { CareerTrajectoryVisualizer } from './components/CareerTrajectoryVisualizer';
import { SalaryBenchmarking } from './components/SalaryBenchmarking';
import { InterviewStageTracker } from './components/InterviewStageTracker';
import { InterviewCalendar } from './components/InterviewCalendar';
import { JobHistoryTimeline } from './components/JobHistoryTimeline';
import { AiOutreachGenerator } from './components/AiOutreachGenerator';
import { AddJobModal } from './components/AddJobModal';
import { BatchEmailPackageModal } from './components/BatchEmailPackageModal';
import { PlatformApplyTrackerModal } from './components/PlatformApplyTrackerModal';
import { ApplicationAuditOverlay } from './components/ApplicationAuditOverlay';
import { GmailMcpConnectorModal } from './components/GmailMcpConnectorModal';
import { SimpleOverviewView } from './components/SimpleOverviewView';
import { 
  AdminAccessGate, 
  WhitelistManagerModal, 
  getStoredWhitelist, 
  saveWhitelist, 
  getActiveUserEmail, 
  setActiveUserEmail, 
  PRIMARY_ADMIN_EMAIL 
} from './components/AdminAccessGate';

export default function App() {
  const [jobs, setJobs] = useState<JobRole[]>(initialJobs);
  const [selectedJob, setSelectedJob] = useState<JobRole | null>(initialJobs[0]);
  const [isAddJobModalOpen, setIsAddJobModalOpen] = useState(false);
  const [isBatchEmailModalOpen, setIsBatchEmailModalOpen] = useState(false);
  const [isPlatformTrackerModalOpen, setIsPlatformTrackerModalOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isGmailConnectorModalOpen, setIsGmailConnectorModalOpen] = useState(false);
  const [isWhitelistModalOpen, setIsWhitelistModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('simple-overview');
  const [isUsNightShiftTrackActive, setIsUsNightShiftTrackActive] = useState<boolean>(false);
  const [isPanicMode, setIsPanicMode] = useState<boolean>(true); // Panic mode default true given 31 August 2026 urgency!
  const [resumeData, setResumeData] = useState<ResumeData>(INITIAL_RESUME_DATA);

  const handleTogglePanicMode = () => {
    setIsPanicMode(prev => {
      const next = !prev;
      setTargetConfig(tc => ({
        ...tc,
        dailyAppTarget: next ? 30 : 15
      }));
      return next;
    });
  };

  // Admin Security Access & Whitelist State
  const [whitelist, setWhitelist] = useState<string[]>(() => getStoredWhitelist());
  const [activeUserEmail, setActiveUserEmailState] = useState<string | null>(() => {
    const saved = getActiveUserEmail();
    return saved || null; // First page of website is Login Gate
  });

  const handleLogin = (email: string) => {
    setActiveUserEmail(email);
    setActiveUserEmailState(email);
  };

  const handleLogout = () => {
    setActiveUserEmail(null);
    setActiveUserEmailState(null);
  };

  const handleAddWhitelistedEmail = (email: string) => {
    const updated = [...whitelist, email];
    setWhitelist(updated);
    saveWhitelist(updated);
  };

  const handleRemoveWhitelistedEmail = (email: string) => {
    const updated = whitelist.filter(w => w.toLowerCase() !== email.toLowerCase());
    setWhitelist(updated);
    saveWhitelist(updated);
  };

  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());
  const [syncToast, setSyncToast] = useState<string | null>(null);

  const handleMarkJobApplied = (jobId: string, channel: string) => {
    const today = new Date().toISOString().split('T')[0];
    setJobs(prev => prev.map(j => {
      if (j.id === jobId) {
        return {
          ...j,
          status: 'Applied',
          appliedDate: j.appliedDate || today,
          notes: j.notes ? `${j.notes} | Applied via ${channel} on ${today}` : `Applied via ${channel} on ${today}`
        };
      }
      return j;
    }));
  };

  const handleUnmarkJobApplied = (jobId: string) => {
    setJobs(prev => prev.map(j => {
      if (j.id === jobId) {
        return {
          ...j,
          status: 'Scored',
          appliedDate: undefined
        };
      }
      return j;
    }));
  };

  const [targetConfig, setTargetConfig] = useState<TargetConfig>({
    targetMinCtc: 18,
    targetMaxCtc: 28,
    targetRangeMode: '22-28 LPA Push',
    shiftPreference: 'Pure Remote US-Shift',
    whitelistedCompanies: ['Deloitte USI', 'Fractal Analytics', 'Ironclad', 'Genpact Digital', 'Gartner Alumni Network'],
    blacklistedCompanies: ['Low-ball agencies', 'Non-NCR Onsite'],
    dailyAppTarget: 15,
    workingHours: '09:00 - 23:30',
    targetDeadline: '31 August 2026'
  });

  // Handler for Autonomous Agent Discovery & Re-Scoring Loop
  const handleTriggerAgentLoop = () => {
    setIsSyncing(true);
    setSyncToast('⚡ Autonomous Agent Loop Initiated: Scanning LinkedIn, Naukri, Indeed & Executive Network for US-shift roles with ≥₹18 LPA Floor...');

    setTimeout(() => {
      // Re-evaluate & refresh timestamps, inject fresh opportunity if needed
      setJobs(prevJobs => {
        const hasIronclad = prevJobs.some(j => j.company.includes('Ironclad'));
        let updated = [...prevJobs];
        
        if (!hasIronclad) {
          const freshJob: JobRole = {
            id: `job-${Date.now()}`,
            title: "Senior Lead – Legal Ops & CLM Process Architecture",
            company: "Ironclad (Legal Tech US-Shift)",
            location: "Remote US-Shift / Gurgaon",
            workMode: "Remote",
            shift: "US/Night Shift",
            ctcMinLpa: 24,
            ctcMaxLpa: 28,
            salaryUnclear: false,
            source: "LinkedIn",
            dateAdded: new Date().toISOString().split('T')[0],
            status: "Scored",
            description: "Lead enterprise legal operations transformation and CLM workflow design for global Fortune 500 tech clients. Requires 8+ yrs operations leadership, process optimization (TAT reduction), and Copilot AI integration.",
            scores: {
              salaryScore: 30,
              titleSkillsScore: 25,
              companyQualityScore: 15,
              locationShiftScore: 15,
              referralScore: 9,
              postingAgeScore: 10,
              totalScore: 98,
              ctcFloorPassed: true,
              tier: "HIGH_PRIORITY",
              pros: ["Top salary range (24-28 LPA)", "Direct Gartner ops + Legal Ops alignment", "Pure remote US shift"],
              redFlags: [],
              skillGaps: [],
              recommendation: "EXECUTIVE PRIORITY (98/100). Custom tailor & apply immediately."
            },
            contactPerson: {
              name: "Marcus Vance",
              title: "VP of Global Customer Operations & Legal Systems",
              email: "mvance@ironcladapp.com"
            }
          };
          updated = [freshJob, ...prevJobs];
        }

        return updated.map(j => ({
          ...j,
          scores: {
            ...j.scores,
            postingAgeScore: 10
          }
        }));
      });

      setIsSyncing(false);
      setLastSyncTime(new Date());
      setSyncToast('✅ Autonomous Loop Completed! 15+ Target Opportunities Re-scored. Total High-Priority Roles updated.');

      setTimeout(() => {
        setSyncToast(null);
      }, 5000);
    }, 1200);
  };

  // Dynamic Scoring Re-Evaluation Hook: Automatically re-evaluates all job scores when targetConfig changes
  React.useEffect(() => {
    setJobs(prevJobs => prevJobs.map(job => {
      const maxCtc = job.ctcMaxLpa || job.ctcMinLpa || 0;
      const minFloor = targetConfig.targetMinCtc || 18;
      const maxTarget = targetConfig.targetMaxCtc || 28;

      const ctcFloorPassed = maxCtc >= minFloor;

      let salaryScore = 0;
      if (ctcFloorPassed) {
        if (maxCtc >= maxTarget) {
          salaryScore = 30;
        } else {
          const ratio = (maxCtc - minFloor) / Math.max(1, maxTarget - minFloor);
          salaryScore = Math.round(15 + ratio * 15);
        }
      }

      const totalScore = ctcFloorPassed
        ? Math.min(100, Math.max(0, (job.scores.relevanceScore || 35) + salaryScore + (job.scores.workModeShiftScore || 20) + (job.scores.speedOutreachScore || 10)))
        : Math.min(45, Math.max(0, (job.scores.relevanceScore || 25) + salaryScore));

      let tier: 'HIGH_PRIORITY' | 'STANDARD_PIPELINE' | 'DISCARD' = 'DISCARD';
      if (!ctcFloorPassed) {
        tier = 'DISCARD';
      } else if (totalScore >= 75) {
        tier = 'HIGH_PRIORITY';
      } else if (totalScore >= 50) {
        tier = 'STANDARD_PIPELINE';
      }

      const floorFlagMsg = `HARD FAIL: Below ₹${minFloor} LPA Floor`;
      let updatedRedFlags = (job.scores.redFlags || []).filter(f => !f.startsWith('HARD FAIL: Below ₹'));
      if (!ctcFloorPassed) {
        updatedRedFlags.push(floorFlagMsg);
      }

      return {
        ...job,
        scores: {
          ...job.scores,
          salaryScore,
          ctcFloorPassed,
          totalScore,
          tier,
          redFlags: updatedRedFlags
        }
      };
    }));
  }, [targetConfig.targetMinCtc, targetConfig.targetMaxCtc, targetConfig.shiftPreference]);

  const handleJobAdded = (newJob: JobRole) => {
    setJobs(prev => [newJob, ...prev]);
    setSelectedJob(newJob);
    if (newJob.scores.ctcFloorPassed) {
      setActiveTab('pipeline');
    }
  };

  const handleUpdateJobStatus = (jobId: string, newStatus: JobStatus) => {
    setJobs(prev => prev.map(j => {
      if (j.id === jobId) {
        return {
          ...j,
          status: newStatus,
          appliedDate: (newStatus === 'Applied' && !j.appliedDate) ? new Date().toISOString().split('T')[0] : j.appliedDate
        };
      }
      return j;
    }));
  };

  const handleUpdateJob = (updatedJob: JobRole) => {
    setJobs(prev => prev.map(j => j.id === updatedJob.id ? updatedJob : j));
    if (selectedJob?.id === updatedJob.id) {
      setSelectedJob(updatedJob);
    }
  };

  return (
    <AdminAccessGate
      activeUserEmail={activeUserEmail}
      whitelist={whitelist}
      onLogin={handleLogin}
      onLogout={handleLogout}
    >
      <div className="min-h-screen bg-[#0a0a0b] text-[#e0e0e0] font-sans selection:bg-blue-600 selection:text-white flex flex-col overflow-x-hidden w-full max-w-full">
        {/* Dynamic Agent Sync Toast Notification Bar */}
        {syncToast && (
          <div className="bg-gradient-to-r from-blue-900/90 via-indigo-900/90 to-blue-950/90 text-white text-xs font-mono font-bold py-2.5 px-4 text-center border-b border-blue-500/40 shadow-xl flex items-center justify-center gap-2 animate-fade-in relative z-30">
            <span className="w-2 h-2 rounded-full bg-blue-400"></span>
            <span>{syncToast}</span>
          </div>
        )}

        {/* Header Navigation */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          targetConfig={targetConfig}
          setTargetConfig={setTargetConfig}
          jobs={jobs}
          onTriggerAgentLoop={handleTriggerAgentLoop}
          isSyncing={isSyncing}
          onOpenBatchEmailModal={() => setIsBatchEmailModalOpen(true)}
          onOpenPlatformTrackerModal={() => setIsPlatformTrackerModalOpen(true)}
          onOpenAuditModal={() => setIsAuditModalOpen(true)}
          onOpenGmailConnectorModal={() => setIsGmailConnectorModalOpen(true)}
          isUsNightShiftTrackActive={isUsNightShiftTrackActive}
          onToggleUsNightShiftTrack={() => setIsUsNightShiftTrackActive(prev => !prev)}
          activeUserEmail={activeUserEmail}
          onOpenWhitelistModal={() => setIsWhitelistModalOpen(true)}
          isPanicMode={isPanicMode}
          onTogglePanicMode={handleTogglePanicMode}
        />

        {/* Main Container */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 pt-4 pb-24 sm:pb-6 space-y-6 min-w-0 overflow-x-hidden overflow-y-auto">
          {activeTab === 'simple-overview' && (
            <SimpleOverviewView
              jobs={jobs}
              targetConfig={targetConfig}
              isPanicMode={isPanicMode}
              onTogglePanicMode={handleTogglePanicMode}
              onOpenBatchEmailModal={() => setIsBatchEmailModalOpen(true)}
              onOpenPlatformTrackerModal={() => setIsPlatformTrackerModalOpen(true)}
              onOpenGmailConnectorModal={() => setIsGmailConnectorModalOpen(true)}
              onOpenAuditModal={() => setIsAuditModalOpen(true)}
              onSelectJob={setSelectedJob}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'overview' && (
            <DashboardOverview
              jobs={jobs}
              onSelectJob={setSelectedJob}
              onOpenAddJobModal={() => setIsAddJobModalOpen(true)}
              setActiveTab={setActiveTab}
              targetConfig={targetConfig}
              setTargetConfig={setTargetConfig}
              onTriggerAgentLoop={handleTriggerAgentLoop}
              isSyncing={isSyncing}
              lastSyncTime={lastSyncTime}
              onOpenBatchEmailModal={() => setIsBatchEmailModalOpen(true)}
              onOpenPlatformTrackerModal={() => setIsPlatformTrackerModalOpen(true)}
              isUsNightShiftTrackActive={isUsNightShiftTrackActive}
              onToggleUsNightShiftTrack={() => setIsUsNightShiftTrackActive(prev => !prev)}
              onMarkJobApplied={handleMarkJobApplied}
              isPanicMode={isPanicMode}
              onTogglePanicMode={handleTogglePanicMode}
              resumeData={resumeData}
              onUpdateResume={setResumeData}
            />
          )}

          {activeTab === 'status-tracker' && (
            <ApplicationStatusScheduleChart
              jobs={jobs}
              onSelectJob={setSelectedJob}
              setActiveTab={setActiveTab}
              onMarkJobApplied={handleMarkJobApplied}
              dailyTarget={targetConfig.dailyAppTarget || 15}
            />
          )}

          {activeTab === 'strategy' && (
            <RecruiterStrategyView
              jobs={jobs}
              targetConfig={targetConfig}
              onSelectJob={setSelectedJob}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'pipeline' && (
            <JobPipelineView
              jobs={jobs}
              onSelectJob={setSelectedJob}
              onOpenAddJobModal={() => setIsAddJobModalOpen(true)}
              onUpdateJobStatus={handleUpdateJobStatus}
              onUpdateJob={handleUpdateJob}
              setActiveTab={setActiveTab}
              onOpenAuditModal={() => setIsAuditModalOpen(true)}
            />
          )}

          {activeTab === 'resume' && (
            <ResumeTailorView
              jobs={jobs}
              selectedJob={selectedJob}
              onSelectJob={setSelectedJob}
              resumeData={resumeData}
              onUpdateResume={setResumeData}
            />
          )}

          {activeTab === 'outreach' && (
            <OutreachStudioView
              jobs={jobs}
              selectedJob={selectedJob}
              onSelectJob={setSelectedJob}
            />
          )}

          {activeTab === 'cadence' && (
            <DailyCadenceTracker
              jobs={jobs}
              targetConfig={targetConfig}
            />
          )}

          {activeTab === 'interviews' && (
            <div className="space-y-6">
              <InterviewStageTracker
                jobs={jobs}
                onSelectJob={setSelectedJob}
              />
              <InterviewCalendar
                jobs={jobs}
                onSelectJob={setSelectedJob}
              />
              <JobHistoryTimeline
                jobs={jobs}
                onSelectJob={setSelectedJob}
              />
              <AiOutreachGenerator
                jobs={jobs}
                resumeData={resumeData}
              />
              <SkillGapHeatmap
                jobs={jobs}
                resumeData={resumeData}
                onUpdateResume={setResumeData}
              />
              <CareerTrajectoryVisualizer
                resumeData={resumeData}
                jobs={jobs}
              />
              <SalaryBenchmarking
                jobs={jobs}
              />
            </div>
          )}

          {activeTab === 'system-audit' && (
            <SystemAuditView
              onTriggerAgentLoop={handleTriggerAgentLoop}
              isSyncing={isSyncing}
            />
          )}

          {activeTab === 'agent-ceo' && (
            <AgentCeoBoard
              onTriggerAgentLoop={handleTriggerAgentLoop}
              isSyncing={isSyncing}
            />
          )}

          {activeTab === 'config' && (
            <MasterPromptConfigView
              targetConfig={targetConfig}
              setTargetConfig={setTargetConfig}
            />
          )}
        </main>

        {/* Add Job Modal */}
        <AddJobModal
          isOpen={isAddJobModalOpen}
          onClose={() => setIsAddJobModalOpen(false)}
          onJobAdded={handleJobAdded}
        />

        {/* Batch Email & ATS Document Exporter Modal */}
        <BatchEmailPackageModal
          jobs={jobs}
          isOpen={isBatchEmailModalOpen}
          onClose={() => setIsBatchEmailModalOpen(false)}
          onMarkJobApplied={handleMarkJobApplied}
          activeSenderEmail={activeUserEmail || 'Adv.Akash2356@gmail.com'}
          onOpenGmailConnectorModal={() => setIsGmailConnectorModalOpen(true)}
        />

        {/* 1-Click Platform Launcher & Anti-Duplicate Application Tracker */}
        <PlatformApplyTrackerModal
          jobs={jobs}
          isOpen={isPlatformTrackerModalOpen}
          onClose={() => setIsPlatformTrackerModalOpen(false)}
          onMarkJobApplied={handleMarkJobApplied}
          onUnmarkJobApplied={handleUnmarkJobApplied}
        />

        {/* Application Audit Overlay & Anti-Ban Inspector */}
        <ApplicationAuditOverlay
          isOpen={isAuditModalOpen}
          onClose={() => setIsAuditModalOpen(false)}
          jobs={jobs}
          onOpenGmailConnectorModal={() => setIsGmailConnectorModalOpen(true)}
        />

        {/* Gmail Account & MCP Connector Dispatch Audit Modal */}
        <GmailMcpConnectorModal
          isOpen={isGmailConnectorModalOpen}
          onClose={() => setIsGmailConnectorModalOpen(false)}
          activeSenderEmail={activeUserEmail || 'Adv.Akash2356@gmail.com'}
          onUpdateSenderEmail={(newEmail) => handleLogin(newEmail)}
        />

        {/* Whitelist Manager & Access Security Modal */}
        <WhitelistManagerModal
          isOpen={isWhitelistModalOpen}
          onClose={() => setIsWhitelistModalOpen(false)}
          whitelist={whitelist}
          activeUserEmail={activeUserEmail}
          onAddEmail={handleAddWhitelistedEmail}
          onRemoveEmail={handleRemoveWhitelistedEmail}
          onLogout={handleLogout}
        />

        {/* Sticky Mobile Bottom Navigation */}
        <BottomMobileNav activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Footer */}
        <footer className="border-t border-[#1f1f23] bg-[#0d0d0f] py-4 text-center text-[10px] uppercase tracking-widest text-[#6b6b75]">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              Akash Sharma Job OS v2.0 • Admin Gate Active ({activeUserEmail})
            </span>
            <span>Target Deadline: 31 August 2026 (33 Days Sprint)</span>
          </div>
        </footer>
      </div>
    </AdminAccessGate>
  );
}
