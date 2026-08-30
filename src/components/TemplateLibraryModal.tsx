import React, { useState } from 'react';
import { ColdEmailTemplate, RoleCategory, CompanyCultureCategory, TemplateChannel, JobRole } from '../types';
import { emailTemplates } from '../data/emailTemplates';
import { 
  Library, 
  X, 
  Search, 
  Filter, 
  Copy, 
  Check, 
  Sparkles, 
  Send, 
  FileText, 
  Mail, 
  Linkedin, 
  UserCheck, 
  Building2, 
  Briefcase,
  ArrowRight,
  Plus
} from 'lucide-react';

interface TemplateLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyTemplate?: (subject: string, body: string) => void;
  selectedJob?: JobRole | null;
}

export const TemplateLibraryModal: React.FC<TemplateLibraryModalProps> = ({
  isOpen,
  onClose,
  onApplyTemplate,
  selectedJob
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleCategory, setSelectedRoleCategory] = useState<string>('ALL');
  const [selectedCultureCategory, setSelectedCultureCategory] = useState<string>('ALL');
  const [selectedChannel, setSelectedChannel] = useState<string>('ALL');

  const [activeTemplate, setActiveTemplate] = useState<ColdEmailTemplate>(emailTemplates[0]);
  const [copied, setCopied] = useState(false);
  const [customTemplates, setCustomTemplates] = useState<ColdEmailTemplate[]>([]);

  // Variable replacement state
  const [companyVar, setCompanyVar] = useState(selectedJob?.company || 'Deloitte USI');
  const [jobTitleVar, setJobTitleVar] = useState(selectedJob?.title || 'Senior Manager – Legal Ops Transformation');
  const [contactNameVar, setContactNameVar] = useState(selectedJob?.contactPerson?.name || 'Hiring Lead');

  if (!isOpen) return null;

  const allTemplates = [...emailTemplates, ...customTemplates];

  const filteredTemplates = allTemplates.filter(tpl => {
    const matchesSearch = 
      tpl.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.body.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = selectedRoleCategory === 'ALL' || tpl.roleCategory === selectedRoleCategory;
    const matchesCulture = selectedCultureCategory === 'ALL' || tpl.cultureCategory === selectedCultureCategory;
    const matchesChannel = selectedChannel === 'ALL' || tpl.channel === selectedChannel;

    return matchesSearch && matchesRole && matchesCulture && matchesChannel;
  });

  const getSubstitutedText = (text: string) => {
    return text
      .replace(/\{\{Company\}\}/g, companyVar || 'Target Company')
      .replace(/\{\{JobTitle\}\}/g, jobTitleVar || 'Target Role')
      .replace(/\{\{ContactName\}\}/g, contactNameVar || 'Hiring Manager');
  };

  const currentSubject = getSubstitutedText(activeTemplate.subject);
  const currentBody = getSubstitutedText(activeTemplate.body);

  const handleCopy = () => {
    const fullText = `SUBJECT: ${currentSubject}\n\n${currentBody}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApply = () => {
    if (onApplyTemplate) {
      onApplyTemplate(currentSubject, currentBody);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0a0a0b]/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-[#0d0d0f] border border-[#1f1f23] rounded-lg max-w-5xl w-full p-5 sm:p-6 space-y-5 shadow-2xl my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1f1f23] pb-4 shrink-0">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
              <Library className="w-4 h-4" />
              Strategic Cold Email & LinkedIn Template Library
            </span>
            <h2 className="text-lg font-bold text-white uppercase tracking-wider">
              Battle-Tested Outreach Templates (Ex-Gartner / Legal Ops / AI Focus)
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#6b6b75] hover:text-white p-1 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters and Variables Panel */}
        <div className="space-y-3 shrink-0">
          {/* Search & Category Filter Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
            <div className="relative sm:col-span-1">
              <Search className="w-3.5 h-3.5 text-[#6b6b75] absolute left-2.5 top-3" />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0a0a0b] text-white text-xs pl-8 pr-2.5 py-2 rounded border border-[#232328] focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <select
                value={selectedRoleCategory}
                onChange={(e) => setSelectedRoleCategory(e.target.value)}
                className="w-full bg-[#0a0a0b] text-white text-xs p-2 rounded border border-[#232328] focus:outline-none focus:border-blue-500"
              >
                <option value="ALL">All Role Categories</option>
                <option value="Legal Ops & CLM Transformation">Legal Ops & CLM Transformation</option>
                <option value="Strategic Operations Lead">Strategic Operations Lead</option>
                <option value="Enterprise AI & Process Automation">Enterprise AI & Automation</option>
                <option value="General Manager / Director">General Manager / Director</option>
              </select>
            </div>

            <div>
              <select
                value={selectedCultureCategory}
                onChange={(e) => setSelectedCultureCategory(e.target.value)}
                className="w-full bg-[#0a0a0b] text-white text-xs p-2 rounded border border-[#232328] focus:outline-none focus:border-blue-500"
              >
                <option value="ALL">All Company Cultures</option>
                <option value="Top-Tier Consulting (Deloitte / EY)">Top-Tier Consulting (Big-4)</option>
                <option value="High-Growth Tech & LegalTech">High-Growth Tech / LegalTech</option>
                <option value="Corporate GCC / MNC">Corporate GCC / Enterprise MNC</option>
                <option value="Gartner Alumni / Warm Network">Gartner Alumni Network</option>
              </select>
            </div>

            <div>
              <select
                value={selectedChannel}
                onChange={(e) => setSelectedChannel(e.target.value)}
                className="w-full bg-[#0a0a0b] text-white text-xs p-2 rounded border border-[#232328] focus:outline-none focus:border-blue-500"
              >
                <option value="ALL">All Channels</option>
                <option value="Cold Email">Cold Email</option>
                <option value="LinkedIn InMail">LinkedIn InMail</option>
                <option value="Warm Alumni Intro">Warm Alumni Intro</option>
                <option value="5-Day Follow-Up">5-Day Follow-Up</option>
              </select>
            </div>
          </div>

          {/* Variables Auto-Injector Row */}
          <div className="bg-[#151518] p-3 rounded border border-[#232328] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider whitespace-nowrap flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Live Variable Substitution:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full">
              <input
                type="text"
                placeholder="{{Company}}"
                value={companyVar}
                onChange={(e) => setCompanyVar(e.target.value)}
                className="bg-[#0a0a0b] text-white p-1.5 rounded border border-[#232328] text-xs font-mono focus:border-blue-500"
              />
              <input
                type="text"
                placeholder="{{JobTitle}}"
                value={jobTitleVar}
                onChange={(e) => setJobTitleVar(e.target.value)}
                className="bg-[#0a0a0b] text-white p-1.5 rounded border border-[#232328] text-xs font-mono focus:border-blue-500"
              />
              <input
                type="text"
                placeholder="{{ContactName}}"
                value={contactNameVar}
                onChange={(e) => setContactNameVar(e.target.value)}
                className="bg-[#0a0a0b] text-white p-1.5 rounded border border-[#232328] text-xs font-mono focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Modal Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 overflow-hidden min-h-0">
          
          {/* Left Column: Template Selection List */}
          <div className="lg:col-span-1 bg-[#0a0a0b] border border-[#232328] rounded p-3 overflow-y-auto space-y-2">
            <span className="text-[10px] font-bold text-[#a0a0aa] uppercase tracking-wider block mb-2">
              Available Templates ({filteredTemplates.length})
            </span>

            {filteredTemplates.length === 0 ? (
              <div className="text-center py-8 text-xs text-[#6b6b75]">
                No templates match your selected filters.
              </div>
            ) : (
              filteredTemplates.map(tpl => {
                const isActive = activeTemplate.id === tpl.id;
                return (
                  <button
                    key={tpl.id}
                    onClick={() => setActiveTemplate(tpl)}
                    className={`w-full text-left p-3 rounded border transition-all cursor-pointer ${
                      isActive
                        ? 'bg-blue-600/10 border-blue-500 text-white'
                        : 'bg-[#151518] border-[#232328] text-[#a0a0aa] hover:border-[#33333a] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono font-bold text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded border border-green-500/20">
                        {tpl.conversionRateEstimate}
                      </span>
                      <span className="text-[9px] font-mono text-[#6b6b75] uppercase">{tpl.channel}</span>
                    </div>

                    <h4 className="text-xs font-bold text-white mb-1 leading-tight">
                      {tpl.title}
                    </h4>

                    <p className="text-[10px] text-[#6b6b75] line-clamp-2">
                      {tpl.description}
                    </p>
                  </button>
                );
              })
            )}
          </div>

          {/* Right Column: Template Live Preview & Actions */}
          <div className="lg:col-span-2 bg-[#0a0a0b] border border-[#232328] rounded p-4 flex flex-col justify-between space-y-4 overflow-y-auto">
            <div className="space-y-4">
              
              {/* Header Info */}
              <div className="flex items-start justify-between border-b border-[#232328] pb-3">
                <div>
                  <div className="flex flex-wrap items-center gap-1.5 mb-1">
                    <span className="bg-blue-600/10 text-blue-400 text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded border border-blue-500/30">
                      {activeTemplate.roleCategory}
                    </span>
                    <span className="bg-purple-600/10 text-purple-400 text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded border border-purple-500/30">
                      {activeTemplate.cultureCategory}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    {activeTemplate.title}
                  </h3>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] font-mono text-green-400 bg-green-500/10 px-2 py-1 rounded border border-green-500/20 block font-bold">
                    {activeTemplate.conversionRateEstimate}
                  </span>
                </div>
              </div>

              {/* Subject Field */}
              <div>
                <label className="text-[10px] font-semibold text-[#a0a0aa] uppercase tracking-wider block mb-1">
                  Substituted Subject Line
                </label>
                <div className="bg-[#151518] border border-[#232328] p-2.5 rounded font-mono text-xs text-white font-semibold">
                  {currentSubject}
                </div>
              </div>

              {/* Body Field */}
              <div>
                <label className="text-[10px] font-semibold text-[#a0a0aa] uppercase tracking-wider block mb-1">
                  Substituted Email / Message Body
                </label>
                <div className="bg-[#151518] border border-[#232328] p-3 rounded font-mono text-xs text-[#e0e0e0] leading-relaxed whitespace-pre-wrap max-h-64 overflow-y-auto">
                  {currentBody}
                </div>
              </div>

              {/* Key Highlights */}
              <div className="flex flex-wrap gap-2 pt-1">
                {activeTemplate.keyHighlights.map((hl, i) => (
                  <span key={i} className="text-[10px] bg-[#1a1a1c] text-[#a0a0aa] px-2 py-0.5 rounded border border-[#2d2d30] font-mono">
                    ✓ {hl}
                  </span>
                ))}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between border-t border-[#232328] pt-3 shrink-0">
              <button
                onClick={handleCopy}
                className="bg-[#151518] hover:bg-[#1f1f23] text-white border border-[#232328] font-bold px-4 py-2 rounded text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-blue-400" />}
                {copied ? 'Copied to Clipboard!' : 'Copy Template Text'}
              </button>

              {onApplyTemplate && (
                <button
                  onClick={handleApply}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase tracking-wider px-4 py-2 rounded text-xs flex items-center gap-1.5 shadow-lg shadow-blue-900/30 transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  Use Template in Studio
                </button>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
