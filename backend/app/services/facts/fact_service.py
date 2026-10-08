"""Candidate Facts management and extraction service."""

import logging
import re
from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.fact import CandidateFact
from app.schemas.fact import FactCreate, FactUpdate

logger = logging.getLogger("opporbyte.facts")


class FactService:
    @staticmethod
    def get_facts_for_user(
        db: Session,
        user_id: str,
        category: Optional[str] = None,
        verified_only: bool = False,
    ) -> List[CandidateFact]:
        stmt = (
            select(CandidateFact)
            .where(CandidateFact.user_id == user_id)
            .order_by(CandidateFact.category.asc(), CandidateFact.created_at.desc())
        )
        if category:
            stmt = stmt.where(CandidateFact.category == category.lower())
        if verified_only:
            stmt = stmt.where(CandidateFact.verified.is_(True))
        return list(db.scalars(stmt).all())

    @staticmethod
    def create_fact(db: Session, user_id: str, data: FactCreate) -> CandidateFact:
        fact = CandidateFact(
            user_id=user_id,
            category=data.category.lower(),
            title=data.title.strip(),
            description=data.description.strip(),
            verified=data.verified,
            source=data.source,
        )
        db.add(fact)
        db.commit()
        db.refresh(fact)
        return fact

    @staticmethod
    def update_fact(
        db: Session, user_id: str, fact_id: str, data: FactUpdate
    ) -> Optional[CandidateFact]:
        fact = db.scalar(
            select(CandidateFact).where(
                CandidateFact.id == fact_id,
                CandidateFact.user_id == user_id,
            )
        )
        if not fact:
            return None

        update_dict = data.model_dump(exclude_unset=True)
        for k, v in update_dict.items():
            if k == "category" and v:
                setattr(fact, k, v.lower())
            else:
                setattr(fact, k, v)

        db.add(fact)
        db.commit()
        db.refresh(fact)
        return fact

    @staticmethod
    def delete_fact(db: Session, user_id: str, fact_id: str) -> bool:
        fact = db.scalar(
            select(CandidateFact).where(
                CandidateFact.id == fact_id,
                CandidateFact.user_id == user_id,
            )
        )
        if not fact:
            return False
        db.delete(fact)
        db.commit()
        return True

    @staticmethod
    def extract_facts_from_text(
        db: Session, user_id: str, text: str, source: str = "master_resume"
    ) -> List[CandidateFact]:
        """Parse structured achievements and skills from master document text."""
        extracted: List[CandidateFact] = []
        lines = [line.strip() for line in text.split("\n") if line.strip()]

        current_category = "experience"
        for line in lines:
            line_lower = line.lower()
            if any(h in line_lower for h in ["skills", "technologies", "technical proficiency"]):
                current_category = "skill"
                continue
            elif any(h in line_lower for h in ["experience", "work history", "employment"]):
                current_category = "experience"
                continue
            elif any(h in line_lower for h in ["projects", "personal projects", "open source"]):
                current_category = "project"
                continue
            elif any(h in line_lower for h in ["education", "degrees", "university"]):
                current_category = "education"
                continue

            # Process bullet points or notable lines
            if line.startswith(("-", "•", "*")) or len(line) > 20:
                clean_line = re.sub(r"^[-•*]\s*", "", line)
                if len(clean_line) < 5:
                    continue

                title = clean_line[:60] + "..." if len(clean_line) > 60 else clean_line
                new_fact = CandidateFact(
                    user_id=user_id,
                    category=current_category,
                    title=title,
                    description=clean_line,
                    verified=False,  # Human review required by default!
                    source=source,
                )
                db.add(new_fact)
                extracted.append(new_fact)

        db.commit()
        for f in extracted:
            db.refresh(f)
        return extracted

    @staticmethod
    def seed_default_facts(db: Session, user_id: str) -> List[CandidateFact]:
        """Bootstrap verified facts covering both Semiconductor and Software tracks."""
        existing = db.scalar(select(CandidateFact).where(CandidateFact.user_id == user_id).limit(1))
        if existing:
            return list(db.scalars(select(CandidateFact).where(CandidateFact.user_id == user_id)).all())

        curated = [
            # Semiconductor Facts
            CandidateFact(
                user_id=user_id,
                category="skill",
                title="SystemVerilog & UVM Verification",
                description="Built comprehensive UVM testbenches with constrained-random stimulus and SystemVerilog Assertions (SVA).",
                verified=True,
                source="master_resume",
            ),
            CandidateFact(
                user_id=user_id,
                category="skill",
                title="RTL Digital Design & Logic Synthesis",
                description="Designed synthesizable RTL pipelines; closed timing using Synopsys Design Compiler and PrimeTime STA.",
                verified=True,
                source="master_resume",
            ),
            CandidateFact(
                user_id=user_id,
                category="project",
                title="RISC-V 5-Stage Pipelined Core with Branch Prediction",
                description="Implemented synthesizable 32-bit RV32I core in SystemVerilog with forwarding unit, hazard detection, and 2-bit saturating branch predictor. Verified with 100% functional coverage in Verilator.",
                verified=True,
                source="master_resume",
            ),
            CandidateFact(
                user_id=user_id,
                category="experience",
                title="Hardware Verification Engineer (PCIe Subsystem)",
                description="Developed reusable UVM verification components for PCIe Gen 4 interconnect. Identified and resolved 18 functional corner cases prior to tape-out.",
                verified=True,
                source="master_resume",
            ),
            # Software Facts
            CandidateFact(
                user_id=user_id,
                category="skill",
                title="Full Stack Web Architecture (Next.js & TypeScript)",
                description="Designed responsive, production React/Next.js App Router frontends with Tailwind CSS and strict TypeScript typing.",
                verified=True,
                source="master_resume",
            ),
            CandidateFact(
                user_id=user_id,
                category="skill",
                title="High-Throughput Backend APIs (FastAPI & PostgreSQL)",
                description="Engineered RESTful microservices with FastAPI, SQLAlchemy 2.0 ORM, and optimized PostgreSQL indexes.",
                verified=True,
                source="master_resume",
            ),
            CandidateFact(
                user_id=user_id,
                category="project",
                title="Distributed Job Queue & Microservice Engine",
                description="Architected asynchronous worker system with Redis and PostgreSQL handling concurrent job execution and cryptographic deduplication.",
                verified=True,
                source="master_resume",
            ),
            CandidateFact(
                user_id=user_id,
                category="education",
                title="B.S. in Electrical Engineering & Computer Science",
                description="Rigorous coursework in Computer Architecture, VLSI Design, Distributed Systems, and Operating Systems.",
                verified=True,
                source="transcript",
            ),
        ]

        for item in curated:
            db.add(item)
        db.commit()
        for item in curated:
            db.refresh(item)
        return curated


fact_service = FactService()
