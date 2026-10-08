export type ProfileType = "semiconductor" | "software";

export interface ProjectItem {
  title: string;
  description: string;
  technologies: string[];
  highlights: string[];
}

export interface SalaryExpectation {
  min_salary: number;
  target_salary: number;
  currency: string;
}

export interface CareerProfile {
  id: string;
  user_id: string;
  profile_type: ProfileType;
  title: string;
  summary: string;
  target_job_titles: string[];
  technical_skills: string[];
  experience_level: string;
  projects: ProjectItem[];
  preferred_locations: string[];
  work_preference: string[];
  employment_type: string[];
  salary_expectation: SalaryExpectation;
  excluded_companies: string[];
  matching_threshold: number;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  full_name?: string;
  is_active: boolean;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface Job {
  id: string;
  source_id?: string;
  external_id?: string;
  canonical_hash: string;
  title: string;
  company: string;
  location: string;
  employment_type: string;
  work_mode: string;
  description: string;
  url: string;
  created_at: string;
}

export interface MatchScoreBreakdown {
  required_skills_score: number;
  experience_score: number;
  alignment_score: number;
  preferences_score: number;
  overall_score: number;
  classification: "strong" | "potential" | "low";
}

export interface MatchEvidence {
  eligibility: {
    eligible: boolean;
    requires_human_review: boolean;
    review_reasons: string[];
  };
  matched_skills: string[];
  missing_critical_skills: string[];
  explanation: string;
  score_breakdown: MatchScoreBreakdown;
}

export interface JobMatch {
  id: string;
  job_id: string;
  profile_id: string;
  overall_score: number;
  required_skills_score: number;
  experience_score: number;
  alignment_score: number;
  preferences_score: number;
  classification: "strong" | "potential" | "low";
  match_evidence: MatchEvidence;
  reviewed_at?: string;
  created_at: string;
  job?: Job;
}

export interface JobDiscoveryResponse {
  success: boolean;
  new_jobs_count: number;
  duplicates_skipped_count: number;
  provider: string;
  board_token: string;
  message: string;
}
