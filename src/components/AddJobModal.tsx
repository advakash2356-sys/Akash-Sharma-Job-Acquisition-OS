import React, { useState } from 'react';
import { JobRole } from '../types';
import { X, Sparkles, AlertCircle, Loader2, ShieldCheck, DollarSign } from 'lucide-react';

interface AddJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJobAdded: (newJob: JobRole) => void;
}

export const AddJobModal: React.FC<AddJobModalProps> = ({
  isOpen,
  onClose,
  onJobAdded
}) => {
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('Gurgaon / Remote');
  const [workMode, setWorkMode] = useState<'Remote' | 'Hybrid NCR' | 'Onsite NCR' | 'Non-NCR Onsite'>('Remote');
  const [shift, setShift] = useState<'US/Night Shift' | 'Day Shift' | 'Flexible'>('US/Night Shift');
  const [ctcMinLpa, setCtcMinLpa] = useState<number | ''>(20);
  const [ctcMaxLpa, setCtcMaxLpa] = useState<number | ''>(25);
  const [source, setSource] = useState<'LinkedIn' | 'Naukri' | 'Gartner Alumni' | 'Legal Ops Community' | 'Company Page' | 'Referral'>('LinkedIn');
  const [jobUrl, setJobUrl] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) {
      setError('Please provide at least a Job Title and Description.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/score-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          company: company || 'Target Enterprise',
          description,
          location,
          workMode,
          shift,
          ctcMinLpa: ctcMinLpa !== '' ? Number(ctcMinLpa) : undefined,
          ctcMaxLpa: ctcMaxLpa !== '' ? Number(ctcMaxLpa) : undefined,
          source
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to score job description.');
      }

      const scoreResult = data.scoreResult;

      const newJob: JobRole = {
        id: `job-${Date.now()}`,
        title,
        company: company || 'Target Enterprise',
        location: location || 'Remote',
        workMode,
        shift,
        ctcMinLpa: Number(ctcMinLpa) || scoreResult.estimatedCtcMin || 18,
        ctcMaxLpa: Number(ctcMaxLpa) || scoreResult.estimatedCtcMax || 25,
        salaryUnclear: !ctcMinLpa,
        source,
        jobUrl: jobUrl || undefined,
        description,
        dateAdded: new Date().toISOString().split('T')[0],
        status: 'Scored',
        scores: {
          salaryScore: scoreResult.salaryScore,
          titleSkillsScore: scoreResult.titleSkillsScore,
          companyQualityScore: scoreResult.companyQualityScore,
          locationShiftScore: scoreResult.locationShiftScore,
          referralScore: scoreResult.referralScore,
          postingAgeScore: scoreResult.postingAgeScore,
          totalScore: scoreResult.totalScore,
          ctcFloorPassed: scoreResult.ctcFloorPassed,
          tier: scoreResult.tier,
          pros: scoreResult.pros || [],
          redFlags: scoreResult.redFlags || [],
          skillGaps: scoreResult.skillGaps || [],
          recommendation: scoreResult.recommendation
        }
      };

      onJobAdded(newJob);
      onClose();
    } catch (err: any) {
      console.error('Scoring error:', err);
      setError(err.message || 'An error occurred during job evaluation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0a0a0b]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0d0d0f] border border-[#1f1f23] rounded max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-[#1f1f23] pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-400" />
              <h2 className="text-base font-bold text-white uppercase tracking-wider">Score New Job Opportunity</h2>
            </div>
            <p className="text-xs text-[#a0a0aa] mt-0.5">
              Evaluates description against ₹18 LPA CTC floor & 6-dimension weighted matrix using Gemini 3.6 Flash.
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-[#6b6b75] hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-300 p-3 rounded text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[#a0a0aa] font-semibold uppercase tracking-wider text-[10px] mb-1">Job Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Senior Manager - Legal Ops Transformation"
                className="w-full bg-[#0a0a0b] text-[#e0e0e0] rounded p-2.5 border border-[#232328] focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-[#a0a0aa] font-semibold uppercase tracking-wider text-[10px] mb-1">Company *</label>
              <input
                type="text"
                required
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Deloitte / Ironclad / Gartner Alumni"
                className="w-full bg-[#0a0a0b] text-[#e0e0e0] rounded p-2.5 border border-[#232328] focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[#a0a0aa] font-semibold uppercase tracking-wider text-[10px] mb-1">Min Quoted CTC (LPA)</label>
              <input
                type="number"
                value={ctcMinLpa}
                onChange={(e) => setCtcMinLpa(e.target.value ? Number(e.target.value) : '')}
                placeholder="18"
                className="w-full bg-[#0a0a0b] text-[#e0e0e0] rounded p-2.5 border border-[#232328] focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-[#a0a0aa] font-semibold uppercase tracking-wider text-[10px] mb-1">Max Quoted CTC (LPA)</label>
              <input
                type="number"
                value={ctcMaxLpa}
                onChange={(e) => setCtcMaxLpa(e.target.value ? Number(e.target.value) : '')}
                placeholder="25"
                className="w-full bg-[#0a0a0b] text-[#e0e0e0] rounded p-2.5 border border-[#232328] focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-[#a0a0aa] font-semibold uppercase tracking-wider text-[10px] mb-1">Work Mode</label>
              <select
                value={workMode}
                onChange={(e) => setWorkMode(e.target.value as any)}
                className="w-full bg-[#0a0a0b] text-[#e0e0e0] rounded p-2.5 border border-[#232328] focus:outline-none focus:border-blue-500"
              >
                <option value="Remote">Remote</option>
                <option value="Hybrid NCR">Hybrid NCR (Gurgaon/Noida)</option>
                <option value="Onsite NCR">Onsite NCR</option>
                <option value="Non-NCR Onsite">Non-NCR Onsite (Heavy Penalty)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[#a0a0aa] font-semibold uppercase tracking-wider text-[10px] mb-1">Shift</label>
              <select
                value={shift}
                onChange={(e) => setShift(e.target.value as any)}
                className="w-full bg-[#0a0a0b] text-[#e0e0e0] rounded p-2.5 border border-[#232328] focus:outline-none focus:border-blue-500"
              >
                <option value="US/Night Shift">US / Night Shift</option>
                <option value="Flexible">Flexible</option>
                <option value="Day Shift">Day Shift</option>
              </select>
            </div>

            <div>
              <label className="block text-[#a0a0aa] font-semibold uppercase tracking-wider text-[10px] mb-1">Source</label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value as any)}
                className="w-full bg-[#0a0a0b] text-[#e0e0e0] rounded p-2.5 border border-[#232328] focus:outline-none focus:border-blue-500"
              >
                <option value="LinkedIn">LinkedIn</option>
                <option value="Naukri">Naukri</option>
                <option value="Gartner Alumni">Gartner Alumni Network</option>
                <option value="Legal Ops Community">Legal Ops Community</option>
                <option value="Company Page">Company Career Page</option>
                <option value="Referral">Direct Referral</option>
              </select>
            </div>

            <div>
              <label className="block text-[#a0a0aa] font-semibold uppercase tracking-wider text-[10px] mb-1">Job Link (Optional)</label>
              <input
                type="url"
                value={jobUrl}
                onChange={(e) => setJobUrl(e.target.value)}
                placeholder="https://..."
                className="w-full bg-[#0a0a0b] text-[#e0e0e0] rounded p-2.5 border border-[#232328] focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#a0a0aa] font-semibold uppercase tracking-wider text-[10px] mb-1">Job Description Text *</label>
            <textarea
              required
              rows={6}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Paste full job description, responsibilities, requirements..."
              className="w-full bg-[#0a0a0b] text-[#e0e0e0] rounded p-2.5 border border-[#232328] focus:outline-none focus:border-blue-500 font-mono text-[11px]"
            ></textarea>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-[#1f1f23]">
            <span className="text-[11px] text-green-400 font-mono flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Automated 18 LPA CTC floor verification
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-[#1a1a1c] hover:bg-[#232328] text-white rounded font-medium border border-[#2d2d30]"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase tracking-wider rounded flex items-center gap-2 shadow-lg shadow-blue-900/30 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Evaluating via Gemini 3.6...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Evaluate & Add Role
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
