# Akash Sharma Job Acquisition OS

Executive job acquisition command center and AI scoring engine targeting ₹18+ LPA roles in Strategic Operations, Legal Ops, CLM & Enterprise AI Enablement.

## Features

- **AI Job Scoring & Tailoring**: Server endpoints for scoring job descriptions (`/api/score-job`), resume tailoring, cover letter generation, and outreach message drafting powered by Google GenAI.
- **Job Pipeline & Application Management**: Track applications, stages, deadlines, and daily targets via components like `JobPipelineView`, `AddJobModal`, `QuickApplyModal`, `InterviewStageTracker`, and `InterviewCalendar`.
- **Analytics & Visualizations**: Metrics and trend monitoring using Recharts and D3, including `SprintVelocityChart`, `SalaryTrendChart`, `CareerTrajectoryVisualizer`, `SkillGapHeatmap`, and `PriorityHeatmap`.
- **Agent Governance & Operations**: Dedicated agent and strategy monitoring views including `AgentCeoBoard`, `CeoDailyHuddleModal`, `AgentActivityMonitor`, and `AgentGovernanceBoard`.
- **Outreach & Communication Tools**: Generate and manage recruiter messaging through `OutreachStudioView`, `AiOutreachGenerator`, and `GmailMcpConnectorModal`.
- **Admin Access Control**: Email whitelist and admin verification module managed through `AdminAccessGate`.

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Motion, Recharts, D3, Lucide React, Canvas Confetti
- **Backend**: Node.js, Express, tsx, esbuild
- **AI & Integrations**: Google GenAI SDK (`@google/genai`)
- **Language**: TypeScript

## Setup

1. Configure environment variables in a `.env` file using `.env.example` as a reference. Ensure `GEMINI_API_KEY` is set.
2. Install dependencies:
   ```bash
   npm install
   ```

## Usage

- **Development Server**:
  ```bash
  npm run dev
  ```
  Runs `tsx server.ts` serving the application on port 3000.

- **Build**:
  ```bash
  npm run build
  ```
  Runs `vite build` and bundles `server.ts` with esbuild to `dist/server.cjs`.

- **Production Run**:
  ```bash
  npm start
  ```
  Executes `node dist/server.cjs`.

- **Type Check**:
  ```bash
  npm run lint
  ```

- **Clean**:
  ```bash
  npm run clean
  ```

## Project Structure

```
.
├── .env.example
├── .gitignore
├── assets/
│   └── .aistudio/
│       └── .gitignore
├── index.html
├── metadata.json
├── package.json
├── server.ts
├── server/
│   └── gemini.ts
└── src/
    ├── App.tsx
    └── components/
        ├── AddJobModal.tsx
        ├── AdminAccessGate.tsx
        ├── AgentActivityMonitor.tsx
        ├── AgentCeoBoard.tsx
        ├── AgentCommunicationFeed.tsx
        ├── AgentD3PerformanceChart.tsx
        ├── AgentGovernanceBoard.tsx
        ├── AgentHealthCheckWidget.tsx
        ├── AgentRecruitmentModal.tsx
        ├── AiOutreachGenerator.tsx
        ├── ApplicationAuditOverlay.tsx
        ├── ApplicationInterviewLineChart.tsx
        ├── ApplicationPieTracker.tsx
        ├── ApplicationStatusScheduleChart.tsx
        ├── AtsGapAuditor.tsx
        ├── BatchEmailPackageModal.tsx
        ├── BottomMobileNav.tsx
        ├── CareerTrajectoryVisualizer.tsx
        ├── CeoAgentEvolutionHub.tsx
        ├── CeoDailyHuddleModal.tsx
        ├── CeoOversightWidget.tsx
        ├── CircularDailyProgress.tsx
        ├── CommandCenterMatrix.tsx
        ├── DailyApplicationSprintProgress.tsx
        ├── DailyCadenceTracker.tsx
        ├── DailyChannelBreakdownModal.tsx
        ├── DailySprintMeter.tsx
        ├── DailySprintPlanner.tsx
        ├── DashboardAnalytics.tsx
        ├── DashboardOverview.tsx
        ├── DeadlineCountdown.tsx
        ├── DeepFocusTimerWidget.tsx
        ├── FollowupNotificationManager.tsx
        ├── GmailMcpConnectorModal.tsx
        ├── HeartbeatModal.tsx
        ├── InterviewCalendar.tsx
        ├── InterviewReadinessModule.tsx
        ├── InterviewScheduler.tsx
        ├── InterviewStageTracker.tsx
        ├── JobHistoryTimeline.tsx
        ├── JobPipelineView.tsx
        ├── MasterPromptConfigView.tsx
        ├── MetricTooltip.tsx
        ├── Navbar.tsx
        ├── OutreachStudioView.tsx
        ├── PanicModeSection.tsx
        ├── PipelineProgressWidget.tsx
        ├── PlatformApplyTrackerModal.tsx
        ├── PriorityHeatmap.tsx
        ├── QuickApplyFab.tsx
        ├── QuickApplyModal.tsx
        ├── QuickWins.tsx
        ├── RecentActivityList.tsx
        ├── RecruiterCoachSection.tsx
        ├── RecruiterSimulationEngine.tsx
        ├── RecruiterStrategyView.tsx
        ├── ResumeTailorView.tsx
        ├── ResumeUpload.tsx
        ├── RoiEfficiencySection.tsx
        ├── SalaryBenchmarking.tsx
        ├── SalaryTrendChart.tsx
        ├── SimpleOverviewView.tsx
        ├── SkillGapHeatmap.tsx
        ├── SprintProgressAndCountdown.tsx
        ├── SprintVelocityChart.tsx
        ├── StageProgressionChart.tsx
        ├── SystemAuditView.tsx
        ├── TargetStrategyWidget.tsx
        ├── TemplateLibraryModal.tsx
        ├── TimeToOfferProjection.tsx
        └── UsNightShiftTrackBanner.tsx

## Configuration

Owner email/phone are read from `VITE_CONTACT_EMAIL` and `VITE_CONTACT_PHONE` (see `.env.example`; set real values in `.env.local`). The first email acts as the primary admin.

## Add your API key

AI features need a Gemini API key (free at https://aistudio.google.com/apikey). Two ways:

1. **In the app (recommended):** click the **Enter your API key** button (bottom-right). The key field is masked (Show/Hide toggle) and has a **Remove key** button.
2. **Server env var:** set `GEMINI_API_KEY` in `.env.local` / your host's secrets (see `.env.example`).

**Privacy:** a key entered in the app is stored only in your own browser (localStorage). It is never committed to git and never logged. It is attached only to requests to this app's own server, held in memory for that request, and forwarded straight to Google's Gemini API. Click **Remove key** to delete it at any time.
