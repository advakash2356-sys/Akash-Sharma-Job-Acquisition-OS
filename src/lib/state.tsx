import React, { createContext, useContext } from 'react';
import type { Job, Profile } from '../types';

export type PageId = 'overview' | 'jobs' | 'interviews' | 'resume' | 'tailor' | 'outreach' | 'salary' | 'settings';

export interface AppCtx {
  profile: Profile;
  setProfile: React.Dispatch<React.SetStateAction<Profile>>;
  jobs: Job[];
  setJobs: React.Dispatch<React.SetStateAction<Job[]>>;
  page: PageId;
  go: (p: PageId, jobId?: string) => void;
  selectedJobId: string;
  hasResume: boolean;
}

export const Ctx = createContext<AppCtx>(null as unknown as AppCtx);
export const useApp = () => useContext(Ctx);
