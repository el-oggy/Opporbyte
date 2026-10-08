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

export interface JobRecommendationSample {
  id: string;
  title: string;
  company: string;
  location: string;
  work_mode: "remote" | "hybrid" | "on-site";
  source: string;
  overall_score: number;
  classification: "strong" | "potential" | "low";
  matched_skills: string[];
  posted_time: string;
}
