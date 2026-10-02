export interface JobListing {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  city?: string;
  country: string;
  isRemote: boolean;
  publishedDate: string; // ISO string
  url: string;
  description: string;
  tags: string[];
  seniority?: string;
  source: "getonbrd" | "remotive" | "custom" | "gemini_discovery";
  matchScore?: number;
}

export interface JobSearchParams {
  query?: string;
  country?: string; // e.g. "Chile", "CL", "Remote"
  city?: string; // e.g. "Concepción", "Santiago"
  region?: string; // e.g. "Biobío", "Metropolitana"
  publishedWithinDays?: number; // 1, 3, 7, 14, 30
  fromDate?: string; // YYYY-MM-DD
  modality?: "all" | "remote" | "hybrid" | "presential";
}
