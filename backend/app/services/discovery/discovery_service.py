"""Master Job Discovery Service coordinating permitted providers and canonical deduplication."""

import hashlib
import logging
import re
from datetime import datetime, timezone
from typing import Dict, List, Optional, Tuple
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.job import Job, JobSource
from app.services.discovery.ashby import AshbyDiscoveryProvider
from app.services.discovery.greenhouse import GreenhouseDiscoveryProvider
from app.services.discovery.lever import LeverDiscoveryProvider
from app.services.interfaces.job_discovery import DiscoveredJobPayload, JobDiscoveryProvider

logger = logging.getLogger("opporbyte.discovery.service")


def compute_canonical_hash(company: str, title: str, location: str) -> str:
    """Compute deterministic SHA-256 fingerprint for canonical job deduplication."""
    # Normalize company (strip inc, corp, llc, etc.)
    c_norm = company.lower().strip()
    c_norm = re.sub(r"\b(inc|incorporated|corp|corporation|llc|ltd|limited)\b", "", c_norm)
    c_norm = re.sub(r"[^a-z0-9]", "", c_norm)

    # Normalize title
    t_norm = title.lower().strip()
    t_norm = re.sub(r"[^a-z0-9]", "", t_norm)

    # Normalize location
    l_norm = location.lower().strip()
    l_norm = re.sub(r"[^a-z0-9]", "", l_norm)

    raw_fingerprint = f"{c_norm}:{t_norm}:{l_norm}"
    return hashlib.sha256(raw_fingerprint.encode("utf-8")).hexdigest()


class DiscoveryService:
    def __init__(self):
        self.providers: Dict[str, JobDiscoveryProvider] = {
            "greenhouse": GreenhouseDiscoveryProvider(),
            "ashby": AshbyDiscoveryProvider(),
            "lever": LeverDiscoveryProvider(),
        }

    def get_provider(self, name: str) -> Optional[JobDiscoveryProvider]:
        return self.providers.get(name.lower())

    async def ingest_board(
        self,
        db: Session,
        provider_name: str,
        board_token: str,
        limit: int = 50,
    ) -> Tuple[int, int]:
        """Ingest jobs from an authorized ATS board token and enforce deduplication.
        
        Returns (new_jobs_count, duplicates_skipped_count).
        """
        provider = self.get_provider(provider_name)
        if not provider:
            raise ValueError(f"Unsupported discovery provider: {provider_name}")

        # Ensure JobSource record exists
        stmt = select(JobSource).where(JobSource.name == f"{provider_name}:{board_token}")
        source = db.scalar(stmt)
        if not source:
            source = JobSource(
                name=f"{provider_name}:{board_token}",
                base_url=f"https://{provider_name}.com/{board_token}",
                is_active=True,
                rate_limit_per_minute=30,
            )
            db.add(source)
            db.commit()
            db.refresh(source)

        source.last_polled_at = datetime.now(timezone.utc)
        db.add(source)

        postings = await provider.fetch_recent_postings(board_token, limit=limit)
        new_count = 0
        duplicate_count = 0

        for payload in postings:
            canon_hash = compute_canonical_hash(payload.company, payload.title, payload.location)

            # Check for existing canonical job
            existing_job = db.scalar(select(Job).where(Job.canonical_hash == canon_hash))
            if existing_job:
                duplicate_count += 1
                continue

            new_job = Job(
                source_id=source.id,
                external_id=payload.external_id,
                canonical_hash=canon_hash,
                title=payload.title,
                company=payload.company,
                location=payload.location,
                employment_type=payload.employment_type,
                work_mode=payload.work_mode,
                description=payload.description,
                url=payload.url,
                raw_payload=payload.raw_metadata,
            )
            db.add(new_job)
            new_count += 1

        db.commit()
        return new_count, duplicate_count

    def seed_initial_discovery_dataset(self, db: Session) -> int:
        """Seed a rich, realistic baseline of engineering jobs across Semiconductor

        and Software disciplines for immediate local testing and evaluation.
        """
        curated_postings = [
            # Semiconductor Postings
            {
                "company": "Advanced Micro Devices",
                "title": "Lead RTL Design & Microarchitecture Engineer",
                "location": "Austin, TX",
                "work_mode": "hybrid",
                "employment_type": "Full-time",
                "url": "https://careers.amd.com/jobs/rtl-microarch-lead",
                "description": (
                    "Lead microarchitecture definition and RTL implementation for next-generation Zen core units. "
                    "Requires strong proficiency in SystemVerilog, UVM verification concepts, digital logic design, "
                    "logic synthesis with Synopsys Design Compiler, static timing analysis (STA), and clock domain crossing (CDC) analysis. "
                    "Experience with ASIC and FPGA emulation flows is required."
                ),
            },
            {
                "company": "NVIDIA",
                "title": "Senior ASIC Verification Engineer (PCIe / CXL)",
                "location": "Santa Clara, CA",
                "work_mode": "on-site",
                "employment_type": "Full-time",
                "url": "https://nvidia.wd5.myworkdayjobs.com/jobs/asic-verification-sr",
                "description": (
                    "Responsible for functional verification of high-speed interconnect subsystems (PCIe Gen 5/6 and CXL). "
                    "Build constrained-random verification testbenches in SystemVerilog/UVM. Create assertion coverage plans (SVA). "
                    "Collaborate with RTL design and physical design teams to debug simulation and gate-level test failures. "
                    "Experience with Cadence Xcelium or Synopsys VCS required."
                ),
            },
            {
                "company": "Qualcomm",
                "title": "FPGA Systems Emulation & Prototyping Engineer",
                "location": "San Diego, CA",
                "work_mode": "hybrid",
                "employment_type": "Full-time",
                "url": "https://qualcomm.wd5.myworkdayjobs.com/jobs/fpga-emulation-engineer",
                "description": (
                    "Design and maintain FPGA prototyping platforms for complex Snapdragon SoC blocks. "
                    "Synthesize and partition large digital designs using Xilinx Vivado and Synopsys ZeBu emulator. "
                    "Debug embedded systems firmware, RTL testbenches, and logic analyzer captures. "
                    "Familiarity with digital design, VHDL/Verilog, and C/C++ device drivers."
                ),
            },
            {
                "company": "Synopsys",
                "title": "Physical Design & STA Implementation Engineer",
                "location": "San Jose, CA",
                "work_mode": "hybrid",
                "employment_type": "Full-time",
                "url": "https://synopsys.wd1.myworkdayjobs.com/jobs/physical-design-engineer",
                "description": (
                    "Execute complete Netlist-to-GDSII physical implementation for advanced finFET process nodes. "
                    "Perform floorplanning, place-and-route (P&R), clock tree synthesis (CTS), timing closure, IR drop analysis, "
                    "and Design for Test (DFT) scan insertion. Tool experience: ICC2, Primetime, and Calibre DRC/LVS."
                ),
            },
            # Software Engineering Postings
            {
                "company": "Stripe",
                "title": "Staff Distributed Backend Systems Engineer",
                "location": "San Francisco, CA",
                "work_mode": "remote",
                "employment_type": "Full-time",
                "url": "https://stripe.com/jobs/distributed-backend-staff",
                "description": (
                    "Architect high-reliability distributed ledger and transaction processing systems handling tens of billions in volume. "
                    "Build resilient microservices using Python, Go, and PostgreSQL. "
                    "Design idempotent API architectures, distributed locking mechanisms, and asynchronous worker queues with Redis. "
                    "Strong focus on backend development, software engineering best practices, and low-latency API contracts."
                ),
            },
            {
                "company": "Datadog",
                "title": "Senior Full Stack Platform Engineer",
                "location": "New York, NY",
                "work_mode": "hybrid",
                "employment_type": "Full-time",
                "url": "https://careers.datadoghq.com/jobs/fullstack-platform-sr",
                "description": (
                    "Build interactive telemetry dashboards and analytics web applications for cloud monitoring. "
                    "Proficiency with modern frontend frameworks (React, Next.js, TypeScript, Tailwind CSS) "
                    "coupled with backend API development in Python/FastAPI or Go. "
                    "Experience with streaming time-series data and modular UI component libraries."
                ),
            },
            {
                "company": "Cloudflare",
                "title": "Infrastructure & High-Throughput API Engineer",
                "location": "Austin, TX",
                "work_mode": "remote",
                "employment_type": "Full-time",
                "url": "https://cloudflare.com/careers/infrastructure-api-engineer",
                "description": (
                    "Develop edge computing platforms and control planes managing global DNS, security, and CDN traffic. "
                    "Build REST and gRPC services in Python and Rust. Ensure 99.999% availability under massive concurrency. "
                    "Strong command of software engineering, networking fundamentals, Docker, and Linux systems programming."
                ),
            },
            {
                "company": "GitHub",
                "title": "Senior Developer Tools & Systems Engineer",
                "location": "Remote, USA",
                "work_mode": "remote",
                "employment_type": "Full-time",
                "url": "https://github.com/about/careers/developer-tools-sr",
                "description": (
                    "Build developer productivity infrastructure and CI/CD automation pipelines for millions of engineers. "
                    "Develop full stack internal tooling using TypeScript, React, and Python services. "
                    "Maintain high software quality, rigorous automated test suites, and containerized deployment workflows."
                ),
            },
        ]

        seeded_count = 0
        for p in curated_postings:
            canon_hash = compute_canonical_hash(p["company"], p["title"], p["location"])
            existing = db.scalar(select(Job).where(Job.canonical_hash == canon_hash))
            if not existing:
                new_j = Job(
                    canonical_hash=canon_hash,
                    title=p["title"],
                    company=p["company"],
                    location=p["location"],
                    employment_type=p["employment_type"],
                    work_mode=p["work_mode"],
                    description=p["description"],
                    url=p["url"],
                    raw_payload={"seeded": True, "domain": "engineering"},
                )
                db.add(new_j)
                seeded_count += 1

        db.commit()
        return seeded_count


discovery_service = DiscoveryService()
