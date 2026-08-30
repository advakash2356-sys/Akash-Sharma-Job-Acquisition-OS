import React, { useState } from 'react';
import { JobRole } from '../types';
import { ResumeData } from './ResumeUpload';
import { 
  Send, 
  Linkedin, 
  Mail, 
  Copy, 
  Check, 
  Sparkles, 
  Bot, 
  RefreshCw, 
  Award, 
  FileText 
} from 'lucide-react';

interface AiOutreachGeneratorProps {
  jobs: JobRole[];
  resumeData: ResumeData;
  selectedJobId?: string;
}

export const AiOutreachGenerator: React.FC<AiOutreachGeneratorProps> = ({
  jobs,
  resumeData,
  selectedJobId: initialSelectedJobId
}) => {
  const [selectedJobId, setSelectedJobId] = useState<string>(
    initialSelectedJobId || jobs[0]?.id || ''
  );
  const [channel, setChannel] = useState<'EMAIL' | 'LINKEDIN_NOTE' | 'LINKEDIN_INMAIL'>('EMAIL');
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const selectedJob = jobs.find(j => j.id === selectedJobId) || jobs[0];

  if (!selectedJob) return null;

  // Generate personalized outreach text based on job details and candidate resume
  const generateMessage = () => {
    const candidateName = resumeData.candidateName || 'Akash Sharma';
    const topSkills = resumeData.skills.slice(0, 3).join(', ') || 'React 18, TypeScript, Node.js';
    const targetTitle = selectedJob.title;
    const company = selectedJob.company;
    const lpa = selectedJob.ctcMaxLpa;

    const managerName = selectedJob.contactPerson?.name || 'Hiring Lead';
    const prosHighlight = selectedJob.scores.pros.slice(0, 3).join(', ') || 'System Design, React 18, Node.js';

    if (channel === 'LINKEDIN_NOTE') {
      return `Hi ${managerName}, I noticed your opening for ${targetTitle} at ${company}. With 5+ yrs experience in ${topSkills} & building high-scale architecture, I'd love to connect and share how my background aligns with your team's roadmap. Best, ${candidateName}.`;
    }

    if (channel === 'LINKEDIN_INMAIL') {
      return `Subject: Application & Inquiry: ${targetTitle} at ${company}\n\nHi ${managerName},\n\nI hope you're having a great week!\n\nI recently applied for the ${targetTitle} role at ${company}. As a Senior Fullstack Engineer specializing in ${topSkills}, I've consistently delivered microservices with 99.9% uptime and led high-throughput frontend architectures.\n\nMy core skill set directly matches the key requirements for this position (including ${prosHighlight}).\n\nWould you be open to a brief 10-minute sync this week to discuss how I can contribute to ${company}'s current technical initiatives?\n\nBest regards,\n${candidateName}\nLinkedIn: linkedin.com/in/akash-sharma-dev`;
    }

    // Default EMAIL
    return `Subject: Application: ${targetTitle} — ${candidateName} (${topSkills})\n\nDear ${managerName} at ${company},\n\nI hope this email finds you well.\n\nI am writing to express my strong interest in the ${targetTitle} position at ${company}. With over 5 years of full-stack engineering experience, I specialize in ${topSkills}, cloud infrastructure (AWS/Docker), and system design.\n\nKey Highlights Relevant to ${company}:\n- Hands-on expertise in ${prosHighlight}.\n- Experience designing resilient backend APIs and responsive modern web apps.\n- Proven track record of high ownership and fast delivery in fast-paced environments.\n\nI have attached my resume for your review and would welcome the opportunity to discuss how my technical expertise fits ${company}'s growth goals.\n\nThank you for your time and consideration.\n\nWarm regards,\n${candidateName}\nPhone: +91 98765 43210\nPortfolio: github.com/akash-dev`;
  };

  const [message, setMessage] = useState(generateMessage());

  const handleChannelChange = (newChannel: 'EMAIL' | 'LINKEDIN_NOTE' | 'LINKEDIN_INMAIL') => {
    setChannel(newChannel);
    setCopied(false);
  };

  const handleRegenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setMessage(generateMessage());
      setIsGenerating(false);
    }, 400);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#0d0d0f] border border-[#1f1f23] rounded-xl p-5 sm:p-6 shadow-2xl space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1f1f23] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-blue-500/20 text-blue-300 border border-blue-500/40 text-[10px] font-mono px-2.5 py-0.5 rounded font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              AI OUTREACH STUDIO
            </span>
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono px-2 py-0.5 rounded">
              COLD COLD CONTACT GENERATOR
            </span>
          </div>
          <h2 className="text-lg font-bold text-white uppercase tracking-wider mt-1.5 flex items-center gap-2">
            <span>Personalized Recruiter Cold Outreach Generator</span>
          </h2>
          <p className="text-xs text-[#a0a0aa]">
            Drafts hyper-tailored emails and LinkedIn messages combining target job specs with your base resume credentials.
          </p>
        </div>

        {/* Job selector */}
        <select
          value={selectedJobId}
          onChange={(e) => {
            setSelectedJobId(e.target.value);
            setCopied(false);
          }}
          className="bg-[#151726] border border-[#2b2e46] text-white text-xs font-mono p-2.5 rounded-xl focus:outline-none cursor-pointer self-start sm:self-auto"
        >
          {jobs.map((job) => (
            <option key={job.id} value={job.id}>
              {job.company} — {job.title}
            </option>
          ))}
        </select>
      </div>

      {/* Channel Switcher */}
      <div className="flex items-center gap-2 font-mono text-xs">
        <button
          onClick={() => handleChannelChange('EMAIL')}
          className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 font-bold cursor-pointer transition-all border ${
            channel === 'EMAIL'
              ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-900/30'
              : 'bg-[#12131c] text-[#a0a0b0] border-[#222434] hover:text-white'
          }`}
        >
          <Mail className="w-3.5 h-3.5" />
          <span>Cold Email</span>
        </button>

        <button
          onClick={() => handleChannelChange('LINKEDIN_NOTE')}
          className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 font-bold cursor-pointer transition-all border ${
            channel === 'LINKEDIN_NOTE'
              ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-900/30'
              : 'bg-[#12131c] text-[#a0a0b0] border-[#222434] hover:text-white'
          }`}
        >
          <Linkedin className="w-3.5 h-3.5" />
          <span>LinkedIn Connection Note (300 Char)</span>
        </button>

        <button
          onClick={() => handleChannelChange('LINKEDIN_INMAIL')}
          className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 font-bold cursor-pointer transition-all border ${
            channel === 'LINKEDIN_INMAIL'
              ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-900/30'
              : 'bg-[#12131c] text-[#a0a0b0] border-[#222434] hover:text-white'
          }`}
        >
          <Send className="w-3.5 h-3.5" />
          <span>LinkedIn InMail</span>
        </button>
      </div>

      {/* Generated Output Canvas */}
      <div className="bg-[#12131c] border border-[#222434] rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between text-xs font-mono text-[#888898] border-b border-[#222434] pb-2">
          <span>Target Recruiter: <strong className="text-amber-400">{selectedJob.contactPerson?.name || 'Hiring Lead'}</strong> @ {selectedJob.company}</span>
          <span>Role CTC: <strong className="text-emerald-400">₹{selectedJob.ctcMaxLpa} LPA</strong></span>
        </div>

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={8}
          className="w-full bg-[#0a0b12] border border-[#222538] text-white font-mono text-xs p-3.5 rounded-lg focus:outline-none focus:border-blue-500 leading-relaxed resize-y"
        />

        <div className="flex items-center justify-between gap-3 pt-1">
          <button
            onClick={handleRegenerate}
            disabled={isGenerating}
            className="bg-[#1b1e2e] hover:bg-[#252a40] text-amber-300 border border-[#333752] text-xs font-mono font-bold px-3 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>Regenerate Draft</span>
          </button>

          <button
            onClick={handleCopy}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-900/30 transition-all"
          >
            {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy Message'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
