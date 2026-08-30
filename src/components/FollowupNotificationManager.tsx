import React, { useState, useEffect } from 'react';
import { JobRole } from '../types';
import { Bell, CheckCircle2, Clock, AlertTriangle, Send, Sparkles, X } from 'lucide-react';

interface FollowupNotificationManagerProps {
  jobs: JobRole[];
  onSelectJob?: (job: JobRole) => void;
}

export const FollowupNotificationManager: React.FC<FollowupNotificationManagerProps> = ({
  jobs,
  onSelectJob
}) => {
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );
  const [notifiedJobs, setNotifiedJobs] = useState<string[]>([]);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  // Identify jobs in Applied status that are pending follow-up (applied >= 3 days ago or default follow-up approaching)
  const pendingFollowups = jobs.filter(j => j.status === 'Applied');

  const requestNotificationPermission = async () => {
    if (typeof Notification === 'undefined') return;
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result === 'granted') {
        sendDesktopNotification(
          '🔔 Job Engine Follow-Up Monitor Active',
          'You will now receive native desktop alerts when applied roles reach their follow-up window.'
        );
      }
    } catch (err) {
      console.error('Notification permission error:', err);
    }
  };

  const sendDesktopNotification = (title: string, body: string) => {
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/favicon.ico'
      });
    }
  };

  // Trigger notification for high-priority followup job
  useEffect(() => {
    if (permission === 'granted' && pendingFollowups.length > 0) {
      const topJob = pendingFollowups[0];
      if (topJob && !notifiedJobs.includes(topJob.id)) {
        sendDesktopNotification(
          `Follow-Up Due: ${topJob.company}`,
          `Application for ${topJob.title} is ready for recruiter follow-up outreach.`
        );
        setNotifiedJobs(prev => [...prev, topJob.id]);
      }
    }
  }, [permission, pendingFollowups]);

  if (pendingFollowups.length === 0) return null;

  return (
    <div className="bg-[#121422] border border-[#232742] rounded-xl p-4 shadow-xl space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-amber-500/20 text-amber-300 rounded-lg border border-amber-500/40">
            <Bell className="w-4 h-4 animate-bounce text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                DESKTOP FOLLOW-UP NOTIFIER
              </span>
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono px-2 py-0.2 rounded font-bold">
                {pendingFollowups.length} Applied Pending Follow-Up
              </span>
            </div>
            <p className="text-xs text-[#a0a0b0]">
              Automated desktop browser notifications alert you when applied roles reach their expected interview feedback window.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {permission !== 'granted' ? (
            <button
              onClick={requestNotificationPermission}
              className="bg-amber-600 hover:bg-amber-500 text-white font-mono text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-lg shadow-amber-900/30 transition-all border border-amber-400"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Enable Desktop Alerts</span>
            </button>
          ) : (
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono px-2.5 py-1 rounded-lg font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Desktop Alerts Granted
            </span>
          )}
        </div>
      </div>

      {/* Featured Followup Urgent Alert Card */}
      {pendingFollowups[0] && !bannerDismissed && (
        <div className="bg-[#0f101a] border border-[#222538] p-3 rounded-lg flex items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
            <span className="text-white">
              Follow-up due for <strong className="text-amber-300">{pendingFollowups[0].company}</strong> ({pendingFollowups[0].title})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onSelectJob && onSelectJob(pendingFollowups[0])}
              className="text-blue-400 hover:underline cursor-pointer text-[11px]"
            >
              Open Outreach Generator →
            </button>
            <button
              onClick={() => setBannerDismissed(true)}
              className="text-[#666] hover:text-white p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
