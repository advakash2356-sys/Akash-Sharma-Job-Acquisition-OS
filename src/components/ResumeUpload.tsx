import React, { useState, useRef } from 'react';
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  Sparkles, 
  Award, 
  RefreshCw, 
  FileCheck, 
  ShieldCheck, 
  Plus, 
  Trash2, 
  Edit3, 
  ArrowRight 
} from 'lucide-react';

export interface ResumeData {
  fileName: string;
  lastUpdated: string;
  candidateName: string;
  headline: string;
  certifications: string[];
  skills: string[];
  rawText: string;
  atsScore: number;
}

export const INITIAL_RESUME_DATA: ResumeData = {
  fileName: 'Akash_Sharma_Senior_Fullstack_React_2026.pdf',
  lastUpdated: '30 July 2026',
  candidateName: 'Akash Sharma',
  headline: 'Senior Fullstack & React Native Engineer (Node.js, TypeScript, Cloud, Microservices)',
  certifications: [
    'AWS Certified Solutions Architect (2026)',
    'Google Cloud Professional Cloud Architect',
    'Meta React Native Certified Specialist',
    'PostgreSQL Advanced Database Tuning'
  ],
  skills: [
    'React 18', 'TypeScript', 'Node.js', 'Express', 'Tailwind CSS', 
    'PostgreSQL', 'Firestore', 'Docker', 'Kubernetes', 'Microservices', 'GraphQL'
  ],
  rawText: `AKASH SHARMA
Senior Fullstack & Systems Architect | 6+ Years Experience
Email: Adv.akash2356@gmail.com | Phone: +91 98765 43210
Location: Bangalore, India / Remote (US Night Shift Compatible)

SUMMARY:
Results-driven Senior Software Engineer specializing in high-concurrency web applications, microservices, and React/Node.js ecosystems. Track record of scaling systems to 100K+ daily active users with 99.99% uptime.

CERTIFICATIONS:
• AWS Certified Solutions Architect (2026)
• Google Cloud Professional Cloud Architect
• Meta React Native Certified Specialist

EXPERIENCE:
• Staff Software Engineer | TechCorp (2023 - Present)
  - Engineered high-throughput distributed payment gateway processing ₹50Cr+ monthly.
  - Reduced API latency by 42% through Redis caching & query optimizations.

• Senior Fullstack Developer | InnovateX (2021 - 2023)
  - Built React + Node.js dashboard utilized by 50,000+ enterprise recruiters.`,
  atsScore: 94
};

interface ResumeUploadProps {
  resumeData?: ResumeData;
  onUpdateResume?: (data: ResumeData) => void;
  onSelectJobForTailoring?: () => void;
}

export const ResumeUpload: React.FC<ResumeUploadProps> = ({
  resumeData = INITIAL_RESUME_DATA,
  onUpdateResume,
  onSelectJobForTailoring
}) => {
  const [currentResume, setCurrentResume] = useState<ResumeData>(resumeData);
  const [isEditingText, setIsEditingText] = useState(false);
  const [editedText, setEditedText] = useState(currentResume.rawText);
  const [newCertInput, setNewCertInput] = useState('');
  const [newSkillInput, setNewSkillInput] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const updated: ResumeData = {
        ...currentResume,
        fileName: file.name,
        lastUpdated: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        atsScore: Math.min(99, currentResume.atsScore + 2)
      };

      setCurrentResume(updated);
      if (onUpdateResume) onUpdateResume(updated);
      showToast(`Successfully uploaded '${file.name}'! Base resume and ATS scores updated.`);
    }
  };

  const handleAddCert = () => {
    if (!newCertInput.trim()) return;
    const updatedCerts = [...currentResume.certifications, newCertInput.trim()];
    const updated: ResumeData = {
      ...currentResume,
      certifications: updatedCerts,
      lastUpdated: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      atsScore: Math.min(99, currentResume.atsScore + 1)
    };
    setCurrentResume(updated);
    if (onUpdateResume) onUpdateResume(updated);
    setNewCertInput('');
    showToast(`Added new certification: '${newCertInput.trim()}'`);
  };

  const handleRemoveCert = (index: number) => {
    const updatedCerts = currentResume.certifications.filter((_, i) => i !== index);
    const updated: ResumeData = {
      ...currentResume,
      certifications: updatedCerts
    };
    setCurrentResume(updated);
    if (onUpdateResume) onUpdateResume(updated);
  };

  const handleAddSkill = () => {
    if (!newSkillInput.trim()) return;
    const updatedSkills = [...currentResume.skills, newSkillInput.trim()];
    const updated: ResumeData = {
      ...currentResume,
      skills: updatedSkills
    };
    setCurrentResume(updated);
    if (onUpdateResume) onUpdateResume(updated);
    setNewSkillInput('');
    showToast(`Added skill: '${newSkillInput.trim()}'`);
  };

  const handleRemoveSkill = (index: number) => {
    const updatedSkills = currentResume.skills.filter((_, i) => i !== index);
    const updated: ResumeData = {
      ...currentResume,
      skills: updatedSkills
    };
    setCurrentResume(updated);
    if (onUpdateResume) onUpdateResume(updated);
  };

  const handleSaveTextEdit = () => {
    const updated: ResumeData = {
      ...currentResume,
      rawText: editedText,
      lastUpdated: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    };
    setCurrentResume(updated);
    if (onUpdateResume) onUpdateResume(updated);
    setIsEditingText(false);
    showToast('Base resume text successfully updated!');
  };

  return (
    <div className="bg-[#0d0d0f] border border-[#1f1f23] rounded-xl p-5 sm:p-6 shadow-2xl space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-4 py-2.5 rounded-xl text-xs font-mono font-bold flex items-center gap-2 animate-fade-in">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1f1f23] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono px-2.5 py-0.5 rounded font-bold uppercase tracking-wider flex items-center gap-1.5">
              <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
              DYNAMIC BASE RESUME & CERTIFICATION ENGINE
            </span>
            <span className="bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[10px] font-mono px-2 py-0.5 rounded">
              AUTO ATS TAILORING READY
            </span>
          </div>
          <h2 className="text-lg font-bold text-white uppercase tracking-wider mt-1.5 flex items-center gap-2">
            <span>Upload Updated Resume & Certifications</span>
          </h2>
          <p className="text-xs text-[#a0a0aa]">
            Keep your base resume, new certifications, and skills updated. The AI re-crafts tailored PDF resumes and cover letters using this latest data.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto font-mono text-xs">
          <div className="bg-[#12131c] border border-[#222434] px-3 py-1.5 rounded-lg flex items-center gap-2">
            <span className="text-[#888]">ATS Base Score:</span>
            <span className="text-emerald-400 font-bold text-sm">{currentResume.atsScore}/100</span>
          </div>
        </div>
      </div>

      {/* Main Drag and Drop File Upload Area */}
      <div 
        onClick={() => fileInputRef.current?.click()}
        className="bg-[#12131c] border-2 border-dashed border-[#2b2d42] hover:border-emerald-500/80 p-6 rounded-xl text-center cursor-pointer transition-all duration-300 group hover:bg-[#151724]"
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileUpload} 
          accept=".pdf,.docx,.txt" 
          className="hidden" 
        />

        <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto mb-3 group-hover:scale-110 transition-transform">
          <Upload className="w-6 h-6 text-emerald-400" />
        </div>

        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          Click or Drag & Drop to Upload New Resume (.PDF, .DOCX)
        </h3>
        <p className="text-xs text-[#888898] mt-1">
          Currently active file: <strong className="text-emerald-300 font-mono">{currentResume.fileName}</strong> (Updated: {currentResume.lastUpdated})
        </p>
      </div>

      {/* Certifications Manager Section */}
      <div className="bg-[#12131c] border border-[#222434] rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-[#202230] pb-3">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Certifications & Badges ({currentResume.certifications.length})
            </h3>
          </div>
          <span className="text-xs text-[#888898] font-mono">
            Automatically appended to AI-generated resumes
          </span>
        </div>

        {/* Add Cert Form */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newCertInput}
            onChange={(e) => setNewCertInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddCert()}
            placeholder="e.g. AWS Certified Solutions Architect (2026)"
            className="flex-1 bg-[#181a26] border border-[#26283a] focus:border-emerald-400 text-white placeholder-[#555] rounded-lg px-3.5 py-2 text-xs font-mono focus:outline-none"
          />
          <button
            onClick={handleAddCert}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1 cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Certification</span>
          </button>
        </div>

        {/* Cert Badges List */}
        <div className="flex flex-wrap gap-2 pt-1">
          {currentResume.certifications.map((cert, index) => (
            <div
              key={index}
              className="bg-[#191c2b] border border-amber-500/30 text-amber-300 text-xs font-mono px-3 py-1.5 rounded-lg flex items-center gap-2"
            >
              <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{cert}</span>
              <button
                onClick={() => handleRemoveCert(index)}
                className="text-[#888] hover:text-red-400 p-0.5 rounded cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Skills Badges Manager */}
      <div className="bg-[#12131c] border border-[#222434] rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-[#202230] pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Core Tech Stack & Keywords ({currentResume.skills.length})
            </h3>
          </div>
        </div>

        {/* Add Skill Form */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newSkillInput}
            onChange={(e) => setNewSkillInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
            placeholder="e.g. GraphQL, Kubernetes, Microservices"
            className="flex-1 bg-[#181a26] border border-[#26283a] focus:border-blue-400 text-white placeholder-[#555] rounded-lg px-3.5 py-2 text-xs font-mono focus:outline-none"
          />
          <button
            onClick={handleAddSkill}
            className="bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1 cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Skill</span>
          </button>
        </div>

        {/* Skills Chips */}
        <div className="flex flex-wrap gap-2 pt-1">
          {currentResume.skills.map((skill, index) => (
            <div
              key={index}
              className="bg-[#191c2b] border border-blue-500/30 text-blue-300 text-xs font-mono px-2.5 py-1 rounded-md flex items-center gap-1.5"
            >
              <span>{skill}</span>
              <button
                onClick={() => handleRemoveSkill(index)}
                className="text-[#888] hover:text-red-400 p-0.5 rounded cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Raw Resume Text Editor */}
      <div className="bg-[#12131c] border border-[#222434] rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-[#202230] pb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Base Resume Raw Text (AI Parser Input)
            </h3>
          </div>

          <button
            onClick={() => {
              if (isEditingText) {
                handleSaveTextEdit();
              } else {
                setEditedText(currentResume.rawText);
                setIsEditingText(true);
              }
            }}
            className="bg-[#1f2234] hover:bg-[#282c44] text-emerald-300 border border-emerald-500/40 text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-bold cursor-pointer font-mono"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isEditingText ? 'Save Base Resume' : 'Edit Text Content'}</span>
          </button>
        </div>

        {isEditingText ? (
          <textarea
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            rows={8}
            className="w-full bg-[#161824] border border-[#26283a] focus:border-emerald-400 text-white font-mono text-xs p-3.5 rounded-xl focus:outline-none"
          />
        ) : (
          <pre className="bg-[#161824] p-4 rounded-xl text-xs font-mono text-[#a0a0b0] whitespace-pre-wrap max-h-48 overflow-y-auto border border-[#202230]">
            {currentResume.rawText}
          </pre>
        )}
      </div>
    </div>
  );
};
