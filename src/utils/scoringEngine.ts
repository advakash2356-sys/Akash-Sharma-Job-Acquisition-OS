import { JobRole, SuccessProbabilityBreakdown, MasterResumeData } from '../types';

/**
 * Calculates a comprehensive SuccessProbability for a JobRole based on:
 * 1. Resume Keyword Match Confidence (overlap between candidate resume skills & job responsibilities)
 * 2. Historical Application Channel Conversion Rate (Referral > Gartner Alumni > LinkedIn > Naukri)
 * 3. Overall Job Evaluation Total Score & CTC Floor status
 */
export function calculateSuccessProbability(
  job: JobRole,
  resumeSkills?: string[]
): SuccessProbabilityBreakdown {
  const baseSkills = resumeSkills || [
    'React', 'TypeScript', 'Node.js', 'Legal Ops', 'CLM', 'Process Optimization',
    'AI Automation', 'Copilot', 'Strategic Operations', 'Python', 'System Design'
  ];

  const jobText = `${job.title} ${job.company} ${job.description}`.toLowerCase();

  // 1. Calculate Keyword Match Confidence (0 - 100%)
  let matchedKeywordCount = 0;
  baseSkills.forEach(skill => {
    if (jobText.includes(skill.toLowerCase())) {
      matchedKeywordCount++;
    }
  });

  const keywordMatchConfidence = Math.min(
    98,
    Math.max(45, Math.round((matchedKeywordCount / Math.max(1, baseSkills.length)) * 140) + 35)
  );

  // 2. Calculate Historical Application Channel Performance
  let historicalConversionRate = 65; // baseline default
  if (job.source === 'Referral') historicalConversionRate = 88;
  else if (job.source === 'Gartner Alumni') historicalConversionRate = 84;
  else if (job.source === 'Company Page') historicalConversionRate = 72;
  else if (job.source === 'LinkedIn') historicalConversionRate = 68;
  else if (job.source === 'Naukri') historicalConversionRate = 55;

  if (job.contactPerson?.name) {
    historicalConversionRate += 6; // direct recruiter contact boost
  }

  // 3. Compute Weighted Overall Success Probability Percentage
  const scoreFactor = (job.scores.totalScore / 100) * 45; // 45% weight
  const keywordFactor = (keywordMatchConfidence / 100) * 35; // 35% weight
  const channelFactor = (historicalConversionRate / 100) * 20; // 20% weight

  let overallPercentage = Math.round((scoreFactor + keywordFactor + channelFactor) * 100);

  // Penalty if CTC floor failed
  if (!job.scores.ctcFloorPassed) {
    overallPercentage = Math.max(15, overallPercentage - 25);
  }

  // Determine Risk Level
  let riskLevel: SuccessProbabilityBreakdown['riskLevel'] = 'MODERATE';
  if (overallPercentage >= 80) riskLevel = 'VERY_HIGH';
  else if (overallPercentage >= 65) riskLevel = 'HIGH';
  else if (overallPercentage >= 45) riskLevel = 'MODERATE';
  else riskLevel = 'LOW';

  // Construct Key Drivers
  const keyDrivers: string[] = [
    `Resume keyword match confidence: ${keywordMatchConfidence}%`,
    `Historical channel response for ${job.source}: ${historicalConversionRate}%`,
    job.scores.ctcFloorPassed 
      ? `Salary range ₹${job.ctcMinLpa}L - ₹${job.ctcMaxLpa}L meets target floor`
      : `Below CTC target threshold (₹18L floor)`
  ];

  if (job.contactPerson?.name) {
    keyDrivers.push(`Direct contact available: ${job.contactPerson.name} (${job.contactPerson.title || 'Recruiter'})`);
  }

  return {
    overallPercentage,
    keywordMatchConfidence,
    historicalConversionRate,
    riskLevel,
    keyDrivers
  };
}

/**
 * Ensures all jobs in state have calculated successProbability property.
 */
export function enrichJobsWithSuccessProbability(jobs: JobRole[]): JobRole[] {
  return jobs.map(job => {
    const probability = calculateSuccessProbability(job);
    return {
      ...job,
      scores: {
        ...job.scores,
        successProbability: probability
      }
    };
  });
}
