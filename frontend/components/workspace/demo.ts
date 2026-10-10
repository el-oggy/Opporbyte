import type {
  Application,
  CareerProfile,
  CandidateFact,
  Job,
  JobMatch,
  ResumeVersion,
} from "./types";
export const demoDate = "2026-10-09T09:00:00Z";
export const demoJobs: Job[] = [
  [
    "job-1",
    "Frontend Engineer",
    "Northstar Studio",
    "Bengaluru, India",
    "hybrid",
    "React, TypeScript and accessible interfaces. Build thoughtful products with designers and a small engineering team. Requirements: 2+ years building production web interfaces; strong HTML, CSS and React fundamentals.",
  ],
  [
    "job-2",
    "Design Verification Engineer",
    "Circuit Works",
    "Austin, USA",
    "on-site",
    "Verify digital designs with SystemVerilog and UVM. Collaborate on reusable testbenches and coverage plans. Requirements: RTL fundamentals, simulation debugging and digital design experience.",
  ],
  [
    "job-3",
    "Full Stack Developer",
    "Common Ground",
    "Remote",
    "remote",
    "Build reliable APIs and web experiences using Python, SQL and TypeScript. Requirements: API design, relational databases, automated testing and clear written communication.",
  ],
  [
    "job-4",
    "Software Engineer",
    "Field Notes",
    "London, UK",
    "hybrid",
    "Develop useful tools for research teams. Requirements: Python, data modeling and testing. Work closely with users to turn feedback into simple, maintainable software.",
  ],
].map(([id, title, company, location, work_mode, description]) => ({
  id,
  title,
  company,
  location,
  work_mode,
  description,
  canonical_hash: id,
  employment_type: "full-time",
  url: "",
  created_at: demoDate,
}));
export const demoFacts: CandidateFact[] = [
  {
    id: "fact-1",
    user_id: "demo",
    category: "skill",
    title: "React and TypeScript",
    description:
      "Built accessible component libraries and responsive interfaces using React and TypeScript.",
    verified: true,
    source: "manual",
    created_at: demoDate,
  },
  {
    id: "fact-2",
    user_id: "demo",
    category: "project",
    title: "Career planning dashboard",
    description:
      "Developed a dashboard with reusable components, keyboard navigation and API integration.",
    verified: true,
    source: "manual",
    created_at: demoDate,
  },
  {
    id: "fact-3",
    user_id: "demo",
    category: "experience",
    title: "Frontend collaboration",
    description:
      "Worked with design and engineering teams to implement user feedback.",
    verified: false,
    source: "master_resume",
    created_at: demoDate,
  },
];
export function demoProfile(type: "semiconductor" | "software"): CareerProfile {
  return {
    id: type,
    user_id: "demo",
    profile_type: type,
    title:
      type === "software" ? "My software career" : "My semiconductor career",
    summary: "A fictional profile for exploring this workspace.",
    target_job_titles:
      type === "software"
        ? ["Frontend Engineer", "Full Stack Developer"]
        : ["Design Verification Engineer", "RTL Engineer"],
    technical_skills:
      type === "software"
        ? ["React", "TypeScript", "Python"]
        : ["SystemVerilog", "UVM", "RTL"],
    experience_level: "Mid-level",
    projects: [],
    preferred_locations: ["Bengaluru", "Remote"],
    work_preference: ["remote", "hybrid"],
    employment_type: ["full-time"],
    salary_expectation: { min_salary: 0, target_salary: 0, currency: "INR" },
    excluded_companies: [],
    matching_threshold: 75,
    created_at: demoDate,
    updated_at: demoDate,
  };
}
export const demoMatches: JobMatch[] = demoJobs.map((job, index) => ({
  id: `match-${index}`,
  job_id: job.id,
  profile_id: "software",
  overall_score: [91, 58, 84, 72][index],
  required_skills_score: 85,
  experience_score: 80,
  alignment_score: 90,
  preferences_score: 85,
  classification: index === 1 ? "low" : index === 3 ? "potential" : "strong",
  match_evidence: {
    eligibility: {
      eligible: true,
      requires_human_review: index === 1,
      review_reasons:
        index === 1
          ? ["Review work location and required domain experience."]
          : [],
    },
    matched_skills: index === 1 ? ["RTL"] : ["TypeScript", "React"],
    missing_critical_skills: index === 1 ? ["UVM"] : ["SQL"],
    explanation:
      "Illustrative evaluation only. Your actual fit depends on your verified profile and the current role requirements.",
    score_breakdown: {
      required_skills_score: 85,
      experience_score: 80,
      alignment_score: 90,
      preferences_score: 85,
      overall_score: [91, 58, 84, 72][index],
      classification:
        index === 1 ? "low" : index === 3 ? "potential" : "strong",
    },
  },
  created_at: demoDate,
  job,
}));
export const demoResumes: ResumeVersion[] = [
  {
    id: "resume-1",
    profile_id: "software",
    job_id: "job-1",
    version_name: "Frontend engineer · Northstar",
    summary:
      "Frontend developer focused on accessible, maintainable user interfaces with React and TypeScript.",
    selected_facts: demoFacts
      .filter((f) => f.verified)
      .map((f) => ({
        section: f.category === "skill" ? "Skills" : "Projects",
        fact_id: f.id,
        title: f.title,
        category: f.category,
        bullet_text: f.description,
        source_fact_ids: [f.id],
        relevance_score: 90,
      })),
    ats_score: 86,
    is_master: false,
    created_at: demoDate,
    job_title: "Frontend Engineer",
    job_company: "Northstar Studio",
  },
];
export const demoApplications: Application[] = [
  {
    id: "application-1",
    user_id: "demo",
    job_id: "job-1",
    profile_id: "software",
    resume_version_id: "resume-1",
    status: "ready_for_review",
    submission_method: "manual",
    notes:
      "Check the role requirements before applying on the employer website.",
    created_at: demoDate,
    updated_at: demoDate,
    job_title: "Frontend Engineer",
    job_company: "Northstar Studio",
    job_location: "Bengaluru, India",
    profile_type: "software",
    resume_name: demoResumes[0].version_name,
  },
  {
    id: "application-2",
    user_id: "demo",
    job_id: "job-3",
    profile_id: "software",
    status: "draft",
    submission_method: "manual",
    created_at: demoDate,
    updated_at: demoDate,
    job_title: "Full Stack Developer",
    job_company: "Common Ground",
    job_location: "Remote",
    profile_type: "software",
  },
];
export const demoState = {
  facts: [...demoFacts],
  resumes: [...demoResumes],
  applications: [...demoApplications],
  profiles: {
    software: demoProfile("software"),
    semiconductor: demoProfile("semiconductor"),
  },
};
