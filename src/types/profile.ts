export interface ProfileUrl {
  label: string;
  url: string;
  description?: string;
}

export interface WorkExperience {
  id: string;
  company: string;
  role: string;
  period: string;
  location?: string;
  highlights: string[];
  technologies: string[];
}

export interface PortfolioProject {
  id: string;
  name: string;
  role: string;
  description: string;
  url?: string;
  architectureHighlights: string[];
  technologies: string[];
}

export interface EducationItem {
  degree: string;
  institution: string;
  period: string;
}

export interface CertificationItem {
  name: string;
  issuer: string;
  year: string;
}

export interface CandidateProfile {
  slug: string;
  fullName: string;
  headline: string;
  email: string;
  phone: string;
  location: string;
  about: string;
  urls: ProfileUrl[];
  skills: {
    languages?: string[];
    frameworks?: string[];
    databases?: string[];
    cloudDevOps?: string[];
    toolsMethods?: string[];
    hardwareRealtime?: string[];
    // Competencias para Ingeniería Industrial, Eléctrica, Mecánica, etc.
    technicalCompetencies?: string[];
    softwareTools?: string[];
    standardsRegulations?: string[];
    managementOperations?: string[];
    [key: string]: string[] | undefined;
  };
  experience: WorkExperience[];
  projects: PortfolioProject[];
  education: EducationItem[];
  certifications: CertificationItem[];
  preferences?: {
    targetRoles: string[];
    workModality: string;
    salaryExpectation?: string;
  };
  rawDocumentsSummary?: string;
  updatedAt: string;
}

export interface ProfileMetadata {
  slug: string;
  fullName: string;
  headline: string;
  email: string;
  documentCount: number;
  urlCount: number;
  updatedAt: string;
}

export interface MemoryState {
  slug: string;
  isUpToDate: boolean;
  lastSyncAt: string;
  fingerprint: string;
  documentCount: number;
  urlCount: number;
  changesDetected: {
    hasChanges: boolean;
    modifiedDocuments: string[];
    urlsChanged: boolean;
  };
  cachedContextSummary?: string;
}
