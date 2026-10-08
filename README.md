# Opporbyte

<div align="center">

**Your opportunities. One intelligent engine.**

[![CI Pipeline](https://github.com/el-oggy/Opporbyte/actions/workflows/ci.yml/badge.svg)](https://github.com/el-oggy/Opporbyte/actions/workflows/ci.yml)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-16.4+-black.svg?logo=next.js&logoColor=white)](https://nextjs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16+-336791.svg?logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS%20v4-38B2AC.svg?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Single-User License](https://img.shields.io/badge/License-Private%20Personal%20Project-blue.svg)](#security-and-platform-compliance)

*A private, single-user, AI-powered job discovery, resume optimization, application management, and career automation platform.*

</div>

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Problem Statement](#problem-statement)
3. [Project Objectives](#project-objectives)
4. [Dual Engineering Career Profiles](#dual-engineering-career-profiles)
5. [Feature Status: Implemented vs. Planned](#feature-status-implemented-vs-planned)
6. [Technology Stack](#technology-stack)
7. [System Architecture](#system-architecture)
8. [Database Schema & Invariants](#database-schema--invariants)
9. [AI Matching Engine Design (Future)](#ai-matching-engine-design-future)
10. [ATS Resume Engine Design (Future)](#ats-resume-engine-design-future)
11. [Job Discovery & Application Automation Strategy](#job-discovery--application-automation-strategy)
12. [Planned Recruiter Outreach Module](#planned-recruiter-outreach-module)
13. [Security & Platform Compliance](#security--platform-compliance)
14. [Repository Structure](#repository-structure)
15. [Local Installation & Setup](#local-installation--setup)
16. [Environment Configuration](#environment-configuration)
17. [Testing & Verification](#testing--verification)
18. [Development Roadmap & Future Milestones](#development-roadmap--future-milestones)

---

## Project Overview

**Opporbyte** is a high-integrity, private software system engineered for a single engineer managing dual career tracks. Rather than operating as a commercial multi-tenant SaaS with diluted abstractions, Opporbyte runs locally or in a private container, providing deterministic job evaluation, strict factual resume provenance, and automated application tracking across **Semiconductor** and **Software** engineering domains.

---

## Problem Statement

Navigating modern technical careers across distinct engineering disciplines presents critical hurdles:
- **Domain Friction:** Hardware (VLSI/RTL/ASIC) and Software (Distributed Systems/Full Stack) hiring managers look for orthogonal signals. Generic resumes perform poorly across both.
- **ATS Black Boxes & Hallucination Risk:** Modern AI resume builders frequently invent technologies, manipulate project outcomes, and hallucinate qualifications, exposing candidates to severe credibility damage.
- **Application Fatigue & Accidental Duplication:** Candidates submitting dozens of applications frequently re-apply to the same canonical posting under different job titles or matching streams, causing administrative rejection.
- **Scraping Frailty & Policy Violations:** Flaky headless scrapers constantly break, trigger CAPTCHAs, and violate platform terms of service.

Opporbyte resolves these challenges by coupling **permitted, structured ATS integrations** with a **zero-hallucination fact repository**, **cross-profile application deduplication**, and an **auditable 4-factor AI heuristic engine**.

---

## Project Objectives

1. **Dual Track Isolation:** Maintain independent preferences, titles, and thresholds for Semiconductor and Software engineering tracks without data bleeding.
2. **Zero-Hallucination Resume Generation:** Synthesize ATS-tailored PDF resumes exclusively from human-verified candidate facts.
3. **Deterministic Heuristic Ranking:** Score job fit using transparent weights (40% skills, 25% experience, 20% role alignment, 15% preferences) with evidence citation.
4. **Cross-Profile Deduplication:** Enforce database-level uniqueness constraints preventing duplicate applications to the same canonical job.
5. **Private, Single-User Security:** Protect the application with bcrypt password hashing, signed JWTs, and secure HTTP-only cookies.

---

## Dual Engineering Career Profiles

Opporbyte provides first-class support for two independent career domains:

| Profile Domain | Supported Engineering Focus Areas | Configuration Scope |
| :--- | :--- | :--- |
| **Semiconductor** | • VLSI<br/>• RTL Design<br/>• Digital Design<br/>• ASIC Design<br/>• Design Verification (UVM/SystemVerilog)<br/>• FPGA Prototyping<br/>• Embedded Systems<br/>• Physical Design<br/>• DFT (Design for Test) | • Target Job Titles<br/>• Verified Technical Skills<br/>• Seniority / Experience Level<br/>• Hardware Projects & Tapouts<br/>• Preferred Locations<br/>• Remote / Hybrid / On-site<br/>• Full-time / Internship<br/>• Salary Expectations<br/>• Excluded Companies<br/>• Matching Threshold (50-95%) |
| **Software** | • Frontend Development<br/>• Backend Development<br/>• Full Stack Development<br/>• Web Development<br/>• App Development<br/>• Game Development<br/>• Software Engineering / Distributed Systems | • Target Job Titles<br/>• Verified Technical Skills<br/>• Seniority / Experience Level<br/>• Software Repositories & Highlights<br/>• Preferred Locations<br/>• Remote / Hybrid / On-site<br/>• Full-time / Internship<br/>• Salary Expectations<br/>• Excluded Companies<br/>• Matching Threshold (50-95%) |

> **State Isolation Guarantee:** Modifying preferences, thresholds, or skills in the Semiconductor profile does not modify or corrupt the Software profile. Both profiles link to canonical candidate facts while maintaining independent weighting.

---

## Feature Status: Implemented vs. Planned

| Capability / Module | Status | Details |
| :--- | :---: | :--- |
| **Monorepo Architecture** | **COMPLETE (Phase 1)** | Next.js App Router frontend, FastAPI REST backend, PostgreSQL/SQLite ORM layer. |
| **Single-User Authentication** | **COMPLETE (Phase 1)** | Bcrypt hashing, JWT tokens, secure HTTP-only cookies, protected route dependencies. |
| **Modern Dashboard UI** | **COMPLETE (Phase 1)** | Overview, Discover, Profiles, Resumes, Applications, Analytics, Settings. Light & Dark mode. |
| **Dual Career Profiles** | **COMPLETE (Phase 1)** | Isolated Semiconductor and Software profiles, live REST API persistence, independent parameters. |
| **10 Database Foundation Models** | **COMPLETE (Phase 1)** | `User`, `CareerProfile`, `CandidateFact`, `ProfileFact`, `JobSource`, `Job`, `JobMatch`, `ResumeVersion`, `Application`, `TaskRun`. |
| **Cross-Profile Deduplication** | **COMPLETE (Phase 1)** | Enforced via `UNIQUE(user_id, job_id)` constraint on the `applications` table. |
| **Alembic Database Migrations** | **COMPLETE (Phase 1)** | Fully autogenerated and verified initial schema migration. |
| **Automated Test Suite** | **COMPLETE (Phase 1)** | 13/13 passing Pytest tests covering auth, profiles, health, models, and isolation. Next.js typechecked build. |
| **Docker Compose Orchestration** | **COMPLETE (Phase 1)** | Multi-container setup for PostgreSQL, Redis, FastAPI backend, and Next.js frontend. |
| **Automated CI Workflow** | **COMPLETE (Phase 1)** | GitHub Actions pipeline testing backend and frontend builds on Ubuntu. |
| **Job Discovery Engine** | *Planned (Phase 2)* | Ingestion from Greenhouse, Ashby, Lever public board APIs. (Abstract interfaces defined in Phase 1). |
| **AI Compatibility Matcher** | *Planned (Phase 2)* | 40/25/20/15 heuristic scoring engine via OpenAI/Gemini structured outputs. (Interfaces defined in Phase 1). |
| **ATS Tailored Resume Engine** | *Planned (Phase 3)* | Dynamic fact selection and clean single-column PDF compiler. (Interfaces defined in Phase 1). |
| **Human-in-the-Loop Applications** | *Planned (Phase 3)* | Batch staging, 1-click human approval, authorized portal submissions. |
| **Recruiter Discovery & Outreach** | *Planned (Phase 4)* | Public contact discovery, personalized drafting, authorized Gmail integration. |

---

## Technology Stack

### Frontend
- **Framework:** [Next.js](https://nextjs.org) (App Router, React 19, TypeScript)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com) with custom CSS variables and glassmorphism
- **Icons:** [Lucide React](https://lucide.dev)
- **Architecture:** Component-based, responsive, dark/light theme switching

### Backend
- **Framework:** [FastAPI](https://fastapi.tiangolo.com) (Python 3.12)
- **Data Validation:** [Pydantic v2](https://docs.pydantic.dev) & Pydantic-Settings
- **ORM & Data Access:** [SQLAlchemy 2.0](https://www.sqlalchemy.org)
- **Database Migrations:** [Alembic](https://alembic.sqlalchemy.org)
- **Security:** Native `bcrypt` key derivation + `PyJWT` signed tokens
- **Testing:** [Pytest](https://docs.pytest.org) with isolated SQLite in-memory fixtures and HTTPX

### Database & Storage
- **Primary Database:** [PostgreSQL 16](https://www.postgresql.org) (Production / Docker) & [SQLite](https://sqlite.org) (Local / Testing)
- **Future Task Broker:** [Redis 7](https://redis.io) & [Celery](https://docs.celeryq.dev)

---

## System Architecture

```mermaid
graph TD
    subgraph Client Layer
        Web["Next.js App Router Dashboard<br/>(TypeScript, Tailwind CSS, Lucide)"]
    end

    subgraph Security & Session
        Auth["Single-User Guard<br/>(HTTP-only Cookies / Bearer JWT)"]
    end

    subgraph Application Core [FastAPI Backend]
        API["FastAPI REST API v1"]
        ProfileSvc["Profile Service<br/>(Semiconductor & Software Isolation)"]
        MatchInt["AI Matching Interface<br/>(Heuristic 40/25/20/15)"]
        ResumeInt["Resume Engine Interface<br/>(Fact Provenance)"]
        AppInt["Application Engine Interface<br/>(Deduplication Guard)"]
        OutreachInt["Recruiter Outreach Interface"]
    end

    subgraph Persistence Layer
        DB[(PostgreSQL / SQLite Storage)]
        Migrations[Alembic Migrations]
    end

    subgraph Future Asynchronous Layer
        CeleryWorker["Celery Worker Node"]
        RedisBroker["Redis Message Broker"]
    end

    Web -->|Secure Cookie / Bearer| Auth
    Auth --> API
    API --> ProfileSvc
    API --> MatchInt
    API --> ResumeInt
    API --> AppInt
    API --> OutreachInt
    ProfileSvc --> DB
    AppInt --> DB
    Migrations --> DB
    CeleryWorker -.-> RedisBroker
```

---

## Database Schema & Invariants

```mermaid
erDiagram
    USERS ||--o{ CAREER_PROFILES : owns
    USERS ||--o{ CANDIDATE_FACTS : possesses
    USERS ||--o{ APPLICATIONS : submits
    
    CAREER_PROFILES ||--o{ PROFILE_FACTS : weights
    CANDIDATE_FACTS ||--o{ PROFILE_FACTS : references
    
    JOB_SOURCES ||--o{ JOBS : originates
    JOBS ||--o{ JOB_MATCHES : evaluated_by
    CAREER_PROFILES ||--o{ JOB_MATCHES : scored_against
    
    CAREER_PROFILES ||--o{ RESUME_VERSIONS : generates
    JOBS ||--o{ RESUME_VERSIONS : tailored_for
    
    JOBS ||--o{ APPLICATIONS : targets
    CAREER_PROFILES ||--o{ APPLICATIONS : applies_under
    RESUME_VERSIONS ||--o{ APPLICATIONS : attaches
```

### Critical Invariants:
1. **Application Deduplication:** `UNIQUE (user_id, job_id)` prevents submitting multiple applications to the same canonical job, even when the job matches both Semiconductor and Software tracks.
2. **Canonical Job Hashing:** `UNIQUE (canonical_hash)` (`SHA-256(company + title + location)`) prevents storing duplicate postings from multiple sources.
3. **Profile Isolation:** `UNIQUE (user_id, profile_type)` guarantees exactly one active configuration per domain per user.

---

## AI Matching Engine Design (Future)

The upcoming matching engine (Phase 2) evaluates opportunities via a 2-stage pipeline:
1. **Mandatory Eligibility Pre-Filter:** Verifies hard constraints (work authorization, location eligibility, degree prerequisites). If any condition is uncertain, the posting is marked for human review.
2. **Composite Heuristic Relevance Score:**
   $$\text{Score} = (0.40 \times S_{\text{skills}}) + (0.25 \times S_{\text{experience}}) + (0.20 \times S_{\text{alignment}}) + (0.15 \times S_{\text{preferences}})$$
   - **Strong Match ($80-100$):** High qualification overlap, meets all preferences.
   - **Potential Match ($60-79$):** Meets baseline with slight experience/skill gaps.
   - **Low Match ($0-59$):** Significant missing prerequisites.

*Match scores are ranking heuristics, not predicted hiring probabilities.*

---

## ATS Resume Engine Design (Future)

The Phase 3 Resume Engine enforces a **Zero Hallucination Guarantee**:
- Resumes are assembled exclusively from verified candidate facts in `candidate_facts`.
- Every generated bullet point maintains foreign key provenance (`source_fact_ids`).
- Generates clean, single-column, ATS-parseable PDFs without complex graphics or tables.
- Staged in a human review interface before submission.

---

## Job Discovery & Application Automation Strategy

- **Permitted Sources:** Ingests postings exclusively through public, permitted APIs (Greenhouse, Ashby, Lever).
- **Compliance Rules:** No unauthorized web scraping, no CAPTCHA bypassing, no evasion of platform restrictions. Public job-posting APIs are never treated as authorization to spam applications.
- **Human Approval:** All applications require explicit 1-click human approval before transmission.

---

## Planned Recruiter Outreach Module

- Discovers publicly available professional contact information for relevant technical recruiters and hiring managers.
- Drafts personalized introduction emails grounded in verified candidate achievements.
- Sends messages exclusively through the candidate's authorized Gmail/email account following manual review.

---

## Security & Platform Compliance

- **Single-User Architecture:** Designed for one engineer; credentials configured in `.env`.
- **Password Security:** Hashed with `bcrypt` (12 rounds).
- **Session Transport:** Transmitted via HTTP-only, `SameSite=Lax` cookies and Bearer tokens.
- **Zero Hallucination Policy:** Prohibits fabricating qualifications or career claims.
- **Safe Bootstrap:** Initial user creation is executed via idempotent initialization script.

---

## Repository Structure

```
Opporbyte/
├── frontend/                  # Next.js App Router Web Dashboard
│   ├── app/                   # App Router pages ((auth), (dashboard))
│   ├── components/            # UI, Dashboard, and Profile components
│   ├── hooks/                 # useAuth, useTheme React hooks
│   ├── lib/                   # API client and utility helpers
│   ├── types/                 # TypeScript type definitions
│   └── Dockerfile             # Production container definition
├── backend/                   # Python FastAPI Backend Engine
│   ├── app/
│   │   ├── api/v1/            # Versioned API routes (auth, profiles, health)
│   │   ├── core/              # Config, security, hashing, bootstrap
│   │   ├── db/                # SQLAlchemy session and Base class
│   │   ├── models/            # 10 core entity models
│   │   ├── schemas/           # Pydantic validation schemas
│   │   └── services/          # Business logic and abstract engine interfaces
│   ├── alembic/               # Database migration scripts
│   ├── tests/                 # Comprehensive Pytest test suite
│   ├── Dockerfile             # Production container definition
│   └── requirements.txt       # Backend dependencies
├── docs/                      # Architectural & functional specifications
│   ├── ARCHITECTURE.md        # Monorepo architecture & design decisions
│   ├── DATABASE.md            # Schema specifications & constraints
│   ├── AI_MATCHING_SPEC.md    # 4-factor scoring heuristic specification
│   └── RESUME_ENGINE_SPEC.md  # Factual ATS resume engine design
├── .github/workflows/         # Automated GitHub Actions CI
├── docker-compose.yml         # Containerized development orchestration
├── .env.example               # Environment variables template
└── README.md                  # Comprehensive project documentation
```

---

## Local Installation & Setup

### Prerequisites
- **Node.js** v20+ and **npm**
- **Python** 3.11+ (Python 3.12 recommended)
- **Git**
- *(Optional)* **Docker & Docker Compose** for containerized PostgreSQL

---

### Method A: Local Host Setup (Fastest for Development)

#### 1. Clone & Setup Environment
```bash
git clone https://github.com/el-oggy/Opporbyte.git
cd Opporbyte

# Copy environment configuration
cp .env.example .env
```

#### 2. Backend Setup & Migrations
```bash
cd backend

# Create virtual environment and install dependencies
python -m venv .venv

# On Windows:
.\.venv\Scripts\activate
# On Linux/macOS:
source .venv/bin/activate

pip install -r requirements.txt

# Run database migrations
alembic upgrade head

# Bootstrap initial user and default Semiconductor & Software profiles
python -m app.core.init_db

# Start backend development server
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
*Backend API will be accessible at: `http://localhost:8000`*  
*Interactive Swagger Documentation: `http://localhost:8000/api/v1/docs`*

#### 3. Frontend Setup
```bash
# In a new terminal:
cd frontend

# Install dependencies
npm install

# Start Next.js development server
npm run dev
```
*Frontend Dashboard will be accessible at: `http://localhost:3000`*

---

### Method B: Docker Compose Setup

```bash
# From the project root:
docker compose up --build
```
*Spins up PostgreSQL 16, Redis 7, the FastAPI backend on port 8000, and the Next.js frontend on port 3000.*

---

## Environment Configuration

Configure the following variables in `.env`:

```env
# General
ENVIRONMENT=development
APP_NAME=Opporbyte

# Database (PostgreSQL for Docker/Production, SQLite for lightweight local dev)
DATABASE_URL=sqlite:///./opporbyte.db
# DATABASE_URL=postgresql+psycopg://opporbyte:opporbyte_secret@localhost:5432/opporbyte

# Security & Authentication
SECRET_KEY=change_this_to_a_super_secure_random_key_in_production
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Single-User Initial Bootstrap
FIRST_USER_EMAIL=engineer@opporbyte.internal
FIRST_USER_PASSWORD=ChangeMe123!SecurePassword

# Networking & Ports
BACKEND_HOST=0.0.0.0
BACKEND_PORT=8000
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

---

## Testing & Verification

### Running Backend Tests
Opporbyte includes 20 comprehensive unit and integration tests verifying authentication, session security, health checks, profile persistence, canonical deduplication, HTML extraction, and AI matching heuristics:

```bash
cd backend
.\.venv\Scripts\python -m pytest tests -v
```

**Test Coverage Summary:**
- `test_login_success`: Validates JWT token generation and HTTP-only cookie setting.
- `test_login_invalid_password`: Validates credential rejection.
- `test_unauthorized_access_without_token`: Validates protected route enforcement.
- `test_logout`: Validates session cookie invalidation.
- `test_health_check_endpoint`: Validates database connectivity and service telemetry.
- `test_list_profiles`: Validates simultaneous retrieval of Semiconductor and Software profiles.
- `test_get_semiconductor_profile_defaults`: Validates hardware interest defaults without qualification hallucinations.
- `test_get_software_profile_defaults`: Validates software interest defaults without qualification hallucinations.
- `test_profile_isolation_and_independent_persistence`: Verifies that updating Semiconductor profile does NOT mutate Software profile.
- `test_prevent_duplicate_application_across_profiles`: Validates database-level uniqueness constraint preventing duplicate applications to the same canonical job across both profiles.
- `test_html_cleaner`: Validates robust extraction of plain text from HTML job descriptions.
- `test_canonical_hash_normalization`: Validates case-insensitivity, company suffix normalization (Inc, LLC, Corp), and cryptographic deduplication hashing.
- `test_seed_initial_dataset_and_deduplication`: Verifies zero duplicate insertions on repeated ingestion cycles.
- `test_list_jobs_endpoint`: Validates query filtering by keyword and work mode (remote, hybrid, on-site).
- `test_matching_heuristic_weights_calculation`: Validates the 40/25/20/15 heuristic weights formula and classification thresholds.
- `test_blacklisted_company_eligibility`: Validates that excluded companies trigger human review flags and penalty deductions.
- `test_evaluate_and_get_matches_api`: Validates end-to-end evaluation and domain-based ranking for Semiconductor and Software profiles.

### Running Frontend Typecheck & Build
```bash
cd frontend
npm run build
```

---

## Development Roadmap & Milestones

- [x] **Phase 1: Build the Foundation**
  - [x] Clean modular monorepo layout.
  - [x] Single-user authentication with bcrypt and HTTP-only cookies.
  - [x] Modern, responsive dashboard with Light/Dark mode.
  - [x] Independent Semiconductor and Software career profile managers.
  - [x] 10 PostgreSQL/SQLAlchemy models with deduplication invariants.
  - [x] Alembic migration pipeline.
  - [x] Complete test suite and Docker Compose orchestration.
  - [x] Professional architecture, database, and engine specifications.
- [x] **Phase 2: Permitted Job Discovery & AI Matching Engine**
  - [x] Implement Greenhouse, Ashby, and Lever public API adapters.
  - [x] Canonical job hashing and SHA-256 deduplication ingestion pipeline.
  - [x] Implement 40/25/20/15 heuristic matching engine with full evidence preservation.
  - [x] Interactive ATS board ingestion and real-time candidate search in dashboard.
  - [x] Comprehensive test suite expanded to 20/20 passing tests.
- [ ] **Phase 3: Verified ATS Resume Engine & Human-in-the-Loop Applications**
  - [ ] Master resume ingestion and entity extraction.
  - [ ] Candidate fact verification dashboard.
  - [ ] Job-specific dynamic fact selection.
  - [ ] ATS-compliant clean PDF compiler.
  - [ ] Human application staging and approval queue.
- [ ] **Phase 4: Recruiter Outreach & Application Lifecycle Tracking**
  - [ ] Public recruiter contact discovery.
  - [ ] Personalized intro email drafting with fact citations.
  - [ ] Authorized Gmail mailbox integration.
  - [ ] Comprehensive interview and offer pipeline analytics.