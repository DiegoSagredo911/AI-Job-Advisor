export interface JobAnalysisResult {
  jobTitle: string;
  companyName?: string;
  matchScore: number; // 0 to 100
  seniorityLevel: string;
  fitSummary: string;
  keyStrengths: string[];
  missingGaps: string[];
  recommendedProjects: {
    projectName: string;
    whyRelevant: string;
    talkingPoint: string;
  }[];
  atsKeywords: {
    criticalMatches: string[];
    missingKeywords: string[];
    suggestedAdditions: string[];
  };
  tailoredStrategy: {
    approachAdvice: string;
    interviewWarningAreas: string[];
    salaryRangeAdvice?: string;
  };
  detectedLanguage?: "es" | "en";
  reverseInterviewQuestions?: {
    category: "technical" | "culture" | "strategy";
    question: string;
    whyAskThis: string;
  }[];
  modelUsed?: string;
}

export interface TailoredResume {
  targetedRole: string;
  professionalSummary: string;
  highlightedSkills: string[];
  language?: "es" | "en";
  customExperience: {
    company: string;
    role: string;
    period: string;
    bulletPoints: string[];
  }[];
  relevantProjects: {
    name: string;
    bulletPoints: string[];
  }[];
  markdownResume: string;
}

export interface OutreachPitch {
  linkedInConnectionNote: string; // < 300 chars
  linkedInInMailMessage: string; // Persuasive cold pitch to Recruiter/Tech Lead
  emailCoverLetter: string; // Professional cover letter
}

export interface InterviewMessage {
  id: string;
  sender: "interviewer" | "candidate" | "system";
  content: string;
  timestamp: string;
  feedback?: {
    score: number; // 1-10
    positives: string[];
    improvements: string[];
    suggestedBetterAnswer?: string;
  };
}

export interface JobApplication {
  id: string;
  profileSlug: string;
  jobTitle: string;
  companyName: string;
  rawJobDescription: string;
  status: "draft" | "applied" | "interviewing" | "offer" | "rejected";
  analysis?: JobAnalysisResult;
  tailoredResume?: TailoredResume;
  outreachPitch?: OutreachPitch;
  interviewMessages?: InterviewMessage[];
  createdAt: string;
  updatedAt: string;
}
