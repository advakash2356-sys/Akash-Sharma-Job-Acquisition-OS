import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Send, 
  Bot, 
  Hash, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  Radio, 
  RefreshCw, 
  Search, 
  Flame, 
  Paperclip, 
  Zap, 
  ShieldAlert, 
  Terminal,
  ThumbsUp,
  Award,
  Filter
} from 'lucide-react';

export interface AgentChatMessage {
  id: string;
  channelId: string;
  senderName: string;
  senderRole: string;
  avatarColor: string;
  timestamp: string;
  messageType: 'MILESTONE' | 'BLOCKER' | 'UPDATE' | 'CEO_DIRECTIVE';
  content: string;
  attachmentSnippet?: {
    type: 'PDF' | 'EMAIL' | 'CAPTCHA_ALERT' | 'METRIC';
    label: string;
    value: string;
  };
  reactions: { emoji: string; count: number; reacted: boolean }[];
  isCeo?: boolean;
}

export const INITIAL_CHAT_MESSAGES: AgentChatMessage[] = [
  {
    id: 'msg-101',
    channelId: 'general-agent-feed',
    senderName: 'Outreach Specialist v1',
    senderRole: 'Recruiter Outreach Agent',
    avatarColor: 'bg-blue-600',
    timestamp: 'Just now',
    messageType: 'MILESTONE',
    content: '🚀 Daily Milestone Reached: Dispatched 5 customized direct emails to VP of Engineering contacts at Coinbase & Stripe. All SMTP deliveries confirmed.',
    attachmentSnippet: {
      type: 'EMAIL',
      label: 'SMTP Delivery Receipt',
      value: 'ID #OUT-88942-OK (0 Bounces)'
    },
    reactions: [
      { emoji: '🚀', count: 4, reacted: true },
      { emoji: '🎯', count: 3, reacted: false }
    ]
  },
  {
    id: 'msg-102',
    channelId: 'blocker-alerts',
    senderName: 'Workday 1-Click Bot',
    senderRole: 'Portal Submissions Agent',
    avatarColor: 'bg-amber-600',
    timestamp: '8 mins ago',
    messageType: 'BLOCKER',
    content: '⚠️ Blocker Alert: Encountered Cloudflare Turnstile captcha on Google Staff SWE Workday portal. Auto-routing candidate to 1-Click Manual Review queue.',
    attachmentSnippet: {
      type: 'CAPTCHA_ALERT',
      label: 'Portal URL',
      value: 'google.myworkdayjobs.com/en-US/careers'
    },
    reactions: [
      { emoji: '👀', count: 2, reacted: false },
      { emoji: '🤖', count: 5, reacted: true }
    ]
  },
  {
    id: 'msg-103',
    channelId: 'sprint-milestones',
    senderName: 'ATS Resume Architect v1',
    senderRole: 'Keyword Optimization Agent',
    avatarColor: 'bg-emerald-600',
    timestamp: '15 mins ago',
    messageType: 'MILESTONE',
    content: '✅ Resume Optimization Complete: Tailored candidate resume PDF for Senior Staff Backend Role at Datadog. ATS Match Score increased from 74% ➔ 92%.',
    attachmentSnippet: {
      type: 'PDF',
      label: 'Generated PDF Artifact',
      value: 'Datadog_Backend_Optimized_v3.pdf (Score: 92%)'
    },
    reactions: [
      { emoji: '🔥', count: 6, reacted: true },
      { emoji: '👍', count: 4, reacted: false }
    ]
  },
  {
    id: 'msg-104',
    channelId: 'general-agent-feed',
    senderName: 'Inspector & Auditor Agent',
    senderRole: 'Backend Inspector',
    avatarColor: 'bg-purple-600',
    timestamp: '22 mins ago',
    messageType: 'UPDATE',
    content: '🔍 Routine Inspection Audit: Scanned all 4 active agent output queues. System Health Score stands at 94/100 PTS with zero unhandled exceptions.',
    attachmentSnippet: {
      type: 'METRIC',
      label: 'Health Check',
      value: 'Pass rate: 100% | Latency: 1.2s'
    },
    reactions: [
      { emoji: '🛡️', count: 3, reacted: true }
    ]
  }
];

export const CHANNELS = [
  { id: 'general-agent-feed', name: 'general-agent-feed', label: 'General Live Feed', unread: 2 },
  { id: 'blocker-alerts', name: 'blocker-alerts', label: 'Blockers & Captchas', unread: 1 },
  { id: 'sprint-milestones', name: 'sprint-milestones', label: 'Sprint Milestones', unread: 0 },
  { id: 'ceo-directives', name: 'ceo-directives', label: 'CEO Direct Commands', unread: 0 }
];

interface AgentCommunicationFeedProps {
  onTriggerAgentLoop?: () => void;
  isSyncing?: boolean;
}

export const AgentCommunicationFeed: React.FC<AgentCommunicationFeedProps> = ({
  onTriggerAgentLoop,
  isSyncing = false
}) => {
  const [messages, setMessages] = useState<AgentChatMessage[]>(INITIAL_CHAT_MESSAGES);
  const [activeChannel, setActiveChannel] = useState<string>('general-agent-feed');
  const [filterType, setFilterType] = useState<'ALL' | 'MILESTONE' | 'BLOCKER' | 'UPDATE'>('ALL');
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isLiveStreaming, setIsLiveStreaming] = useState<boolean>(true);
  const [isSimulatingAgentReply, setIsSimulatingAgentReply] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeChannel]);

  // Periodic Simulated Agent Slack Updates (Live Feed)
  useEffect(() => {
    if (!isLiveStreaming) return;

    const interval = setInterval(() => {
      const randomUpdates: Partial<AgentChatMessage>[] = [
        {
          senderName: 'Outreach Specialist v1',
          senderRole: 'Recruiter Outreach Agent',
          avatarColor: 'bg-blue-600',
          messageType: 'UPDATE',
          content: '📬 Recruiter opened direct outreach email! Lead score boosted for Senior Platform Lead role.',
          attachmentSnippet: { type: 'EMAIL', label: 'Open Tracked', value: 'Recruiter email read 45s ago' }
        },
        {
          senderName: 'Headhunter Lead Scraper',
          senderRole: 'Contact Scraper',
          avatarColor: 'bg-pink-600',
          messageType: 'MILESTONE',
          content: '🎯 Contact Mining Complete: Mapped 3 primary Talent Partners for Netflix Cloud Infrastructure team.',
          attachmentSnippet: { type: 'METRIC', label: 'LinkedIn Verified', value: '3 Contacts added to CRM' }
        },
        {
          senderName: 'CTC Floor Auditor',
          senderRole: 'Compensation Agent',
          avatarColor: 'bg-amber-600',
          messageType: 'UPDATE',
          content: '💰 Filter Executed: Rejected 2 job listings with CTC below ₹18 LPA floor requirement.',
          attachmentSnippet: { type: 'METRIC', label: 'Compensation Audit', value: 'Floor Filter: Pass' }
        }
      ];

      const chosen = randomUpdates[Math.floor(Math.random() * randomUpdates.length)];
      const newMsg: AgentChatMessage = {
        id: `msg-live-${Date.now()}`,
        channelId: 'general-agent-feed',
        senderName: chosen.senderName || 'Auxiliary Agent',
        senderRole: chosen.senderRole || 'Autonomous Bot',
        avatarColor: chosen.avatarColor || 'bg-blue-600',
        timestamp: 'Just now',
        messageType: chosen.messageType as any || 'UPDATE',
        content: chosen.content || 'Autonomous agent background task completed.',
        attachmentSnippet: chosen.attachmentSnippet,
        reactions: [{ emoji: '👍', count: 1, reacted: false }]
      };

      setMessages(prev => [...prev, newMsg]);
    }, 14000);

    return () => clearInterval(interval);
  }, [isLiveStreaming]);

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim()) return;

    const ceoMsgText = inputMessage.trim();
    const ceoMsg: AgentChatMessage = {
      id: `ceo-msg-${Date.now()}`,
      channelId: activeChannel,
      senderName: 'CEO Executive Leader',
      senderRole: 'System Owner Directive',
      avatarColor: 'bg-amber-500',
      timestamp: 'Just now',
      messageType: 'CEO_DIRECTIVE',
      content: ceoMsgText,
      isCeo: true,
      reactions: [{ emoji: '👑', count: 3, reacted: true }]
    };

    setMessages(prev => [...prev, ceoMsg]);
    setInputMessage('');

    // Trigger Agent Reply Simulation
    setIsSimulatingAgentReply(true);
    setTimeout(() => {
      setIsSimulatingAgentReply(false);
      const agentReply: AgentChatMessage = {
        id: `reply-msg-${Date.now()}`,
        channelId: activeChannel,
        senderName: 'Inspector & Auditor Agent',
        senderRole: 'Chief Agent Orchestrator',
        avatarColor: 'bg-purple-600',
        timestamp: 'Just now',
        messageType: 'UPDATE',
        content: `🫡 CEO Directive Acknowledged: "${ceoMsgText}". Propagating operational instruction to all active auxiliary agents immediately.`,
        attachmentSnippet: {
          type: 'METRIC',
          label: 'Directive SLA Status',
          value: 'Instruction Enforced across 5 Agents'
        },
        reactions: [{ emoji: '✅', count: 4, reacted: true }]
      };
      setMessages(prev => [...prev, agentReply]);
      if (onTriggerAgentLoop) onTriggerAgentLoop();
    }, 1200);
  };

  const handleReaction = (msgId: string, emoji: string) => {
    setMessages(prev => prev.map(m => {
      if (m.id === msgId) {
        const existingReaction = m.reactions.find(r => r.emoji === emoji);
        let updatedReactions;
        if (existingReaction) {
          updatedReactions = m.reactions.map(r => 
            r.emoji === emoji 
              ? { ...r, count: r.reacted ? r.count - 1 : r.count + 1, reacted: !r.reacted }
              : r
          );
        } else {
          updatedReactions = [...m.reactions, { emoji, count: 1, reacted: true }];
        }
        return { ...m, reactions: updatedReactions };
      }
      return m;
    }));
  };

  const filteredMessages = messages.filter(m => {
    const matchesChannel = activeChannel === 'general-agent-feed' ? true : m.channelId === activeChannel;
    const matchesFilter = filterType === 'ALL' ? true : m.messageType === filterType;
    return matchesChannel && matchesFilter;
  });

  return (
    <div className="bg-[#0d0d0f] border border-[#1f1f28] hover:border-blue-500/30 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4 font-sans relative overflow-hidden transition-all">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1c1d28] pb-3.5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/40 flex items-center justify-center font-bold text-blue-400 shadow-md">
            <MessageSquare className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white uppercase tracking-wider font-mono">
                Direct Agent Slack Communication Feed
              </h3>
              <span className="bg-blue-500/20 text-blue-300 border border-blue-500/40 text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase flex items-center gap-1">
                <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                REAL-TIME AGENT SLACK STREAM
              </span>
            </div>
            <p className="text-xs text-[#9090a8] mt-0.5">
              Live updates, blocker alerts, and task completion receipts streamed directly from auxiliary agents to CEO.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            onClick={() => setIsLiveStreaming(!isLiveStreaming)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              isLiveStreaming
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-[#141522] text-[#888898] border-[#222438]'
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${isLiveStreaming ? 'text-emerald-400 animate-pulse' : ''}`} />
            <span>{isLiveStreaming ? 'Live Stream: ON' : 'Live Stream: PAUSED'}</span>
          </button>
        </div>
      </div>

      {/* Main Slack Layout (Channel Sidebar + Chat Window) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-[440px] border border-[#1f2238] rounded-2xl bg-[#090a12] overflow-hidden">
        {/* Channel Sidebar */}
        <div className="md:col-span-1 bg-[#0b0c14] border-r border-[#1a1c2e] p-3 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between text-[#888898] uppercase text-[10px] font-bold px-1">
            <span>Slack Channels</span>
            <span className="text-blue-400">{CHANNELS.length} Active</span>
          </div>

          <div className="space-y-1">
            {CHANNELS.map(ch => (
              <button
                key={ch.id}
                onClick={() => setActiveChannel(ch.id)}
                className={`w-full text-left px-2.5 py-2 rounded-xl transition-all flex items-center justify-between cursor-pointer ${
                  activeChannel === ch.id
                    ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40 font-bold'
                    : 'text-[#888898] hover:text-white hover:bg-[#121422]'
                }`}
              >
                <div className="flex items-center gap-1.5 truncate">
                  <Hash className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span className="truncate">{ch.name}</span>
                </div>
                {ch.unread > 0 && (
                  <span className="bg-amber-500 text-black text-[9px] font-bold px-1.5 py-0.2 rounded-full">
                    {ch.unread}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Filter Type Pills */}
          <div className="pt-3 border-t border-[#1a1c2e] space-y-1.5">
            <span className="text-[10px] text-[#777788] uppercase font-bold block px-1">Filter Message Type:</span>
            <div className="flex flex-col gap-1">
              {(['ALL', 'MILESTONE', 'BLOCKER', 'UPDATE'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`text-left px-2 py-1 rounded-lg text-[10px] transition-all cursor-pointer ${
                    filterType === type
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold'
                      : 'text-[#777788] hover:text-[#b0b0c8]'
                  }`}
                >
                  {type === 'ALL' ? '• All Messages' : type === 'MILESTONE' ? '🎯 Milestones' : type === 'BLOCKER' ? '⚠️ Blockers' : '📬 Updates'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chat Feed Messages Window */}
        <div className="md:col-span-3 flex flex-col justify-between bg-[#080910] p-4 relative overflow-hidden">
          {/* Chat Messages Scrollable Box */}
          <div className="flex-1 overflow-y-auto space-y-3.5 pr-2 font-sans">
            {filteredMessages.map(msg => (
              <div 
                key={msg.id} 
                className={`p-3 rounded-2xl border transition-all ${
                  msg.isCeo
                    ? 'bg-amber-950/15 border-amber-500/40 ml-4'
                    : msg.messageType === 'BLOCKER'
                    ? 'bg-red-950/20 border-red-500/40'
                    : msg.messageType === 'MILESTONE'
                    ? 'bg-emerald-950/15 border-emerald-500/40'
                    : 'bg-[#0e0f1a] border-[#1f2238]'
                }`}
              >
                {/* Message Header */}
                <div className="flex items-center justify-between gap-2 border-b border-[#181a2b] pb-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-lg ${msg.avatarColor} flex items-center justify-center font-extrabold text-[10px] text-white`}>
                      {msg.isCeo ? '👑' : '🤖'}
                    </div>
                    <div>
                      <span className="font-bold text-white text-xs mr-2">{msg.senderName}</span>
                      <span className="text-[10px] text-[#8888a0] font-mono">({msg.senderRole})</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 font-mono text-[10px]">
                    <span className={`px-2 py-0.2 rounded font-bold uppercase border ${
                      msg.messageType === 'BLOCKER'
                        ? 'bg-red-500/20 text-red-300 border-red-500/40'
                        : msg.messageType === 'MILESTONE'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : msg.messageType === 'CEO_DIRECTIVE'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                    }`}>
                      {msg.messageType}
                    </span>
                    <span className="text-[#666678]">{msg.timestamp}</span>
                  </div>
                </div>

                {/* Message Content */}
                <p className="text-xs text-white leading-relaxed font-sans">{msg.content}</p>

                {/* Attachment Snippet */}
                {msg.attachmentSnippet && (
                  <div className="mt-2 bg-[#06070c] p-2 rounded-xl border border-[#1b1e32] flex items-center gap-2 font-mono text-[11px]">
                    <Paperclip className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span className="text-[#8888a0]">{msg.attachmentSnippet.label}:</span>
                    <span className="text-amber-300 font-bold truncate">{msg.attachmentSnippet.value}</span>
                  </div>
                )}

                {/* Slack Reaction Bar */}
                <div className="flex items-center gap-1.5 pt-2">
                  {msg.reactions.map((r, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleReaction(msg.id, r.emoji)}
                      className={`px-2 py-0.5 rounded-lg border text-[11px] font-mono flex items-center gap-1 cursor-pointer transition-all ${
                        r.reacted
                          ? 'bg-blue-500/20 text-blue-300 border-blue-500/50'
                          : 'bg-[#121320] text-[#8888a0] border-[#222438] hover:text-white'
                      }`}
                    >
                      <span>{r.emoji}</span>
                      <span>{r.count}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {isSimulatingAgentReply && (
              <div className="p-3 bg-[#0e0f1a] border border-blue-500/30 rounded-2xl flex items-center gap-2 text-xs text-blue-300 font-mono animate-pulse">
                <Bot className="w-4 h-4 text-blue-400 animate-spin" />
                <span>Auxiliary Agent is composing operational response...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* CEO Command Input Bar */}
          <form onSubmit={handleSendMessage} className="pt-3 border-t border-[#181a2b] flex items-center gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Send CEO directive to agents (e.g. 'Outreach Agent, dispatch 5 extra cold emails today')..."
              className="flex-1 bg-[#0f101c] text-white text-xs font-mono p-2.5 rounded-xl border border-[#22253d] focus:outline-none focus:border-amber-500 placeholder-[#666678]"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim()}
              className="bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white p-2.5 rounded-xl font-bold transition-all cursor-pointer shadow-lg shadow-amber-950/50 flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
