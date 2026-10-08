# Opporbyte AI Matching Engine Specification (Design Only)

> **Status:** Specification & Typed Interfaces Implemented in Phase 1 (`app/services/interfaces/matching.py`)  
> **Target Execution:** Phase 2 Engine Activation

---

## 1. Core Principles

1. **Gating Eligibility Pre-Filter:** Mandatory gating criteria (work authorization, strict location requirements, degree minimums) are evaluated **first**. If a gating criteria is breached or uncertain, the candidate is flagged for human review rather than discarded blindly.
2. **Deterministic Heuristic Scores:** Match scores are **ranking heuristics**, not probabilistic predictions of hiring success.
3. **Auditability & Fact Provenance:** Every score must generate a factual explanation with concrete citations to verified candidate facts and job requirements.
4. **Provider-Agnostic Design:** Pluggable interface supporting OpenAI (e.g., `gpt-4o`), Google Gemini (e.g., `gemini-1.5-pro`), or local offline LLMs.

---

## 2. Scoring Methodology & Heuristic Weights

The overall compatibility score is calculated using four weighted components:

$$\text{Overall Score} = (0.40 \times S_{\text{skills}}) + (0.25 \times S_{\text{exp}}) + (0.20 \times S_{\text{align}}) + (0.15 \times S_{\text{pref}})$$

| Component | Weight | Criteria & Evaluation Logic |
| :--- | :---: | :--- |
| **Required Skills** | **40%** | Semantic intersection between candidate's verified skills and job must-haves. Penalizes missing core architectural tools while rewarding related domain competencies. |
| **Relevant Experience & Projects** | **25%** | Evaluates concrete project highlights, chip tap-outs, synthesis runs, full-stack production deployments, and quantified outcomes against the scope of the target role. |
| **Career-Role Alignment** | **20%** | Evaluates seniority match (e.g., Mid-level vs. Senior), architectural focus (e.g., RTL vs. Physical Design), and domain trajectory against profile targets. |
| **Job Preferences** | **15%** | Evaluates location compatibility, work modality (Remote, Hybrid, On-site), compensation expectations, and company exclusion lists. |

---

## 3. Tier Classification

- **Strong Match ($80 \le \text{Score} \le 100$):** High qualification overlap, meets all core requirements, aligned with preferences. Automatically prioritized for resume tailoring.
- **Potential Match ($60 \le \text{Score} < 80$):** Strong potential with slight experience gaps or partial skills overlap. Staged for review.
- **Low Match ($0 \le \text{Score} < 60$):** Significant missing prerequisites or substantial misalignment with target career preferences. Filtered out of high-priority queues.

---

## 4. Grounded Prompt Architecture

```json
{
  "system_prompt": "You are Opporbyte's deterministic career alignment auditor. You evaluate candidate profile data against job descriptions strictly using verified facts. You never assume or extrapolate unstated qualifications.",
  "structured_output_schema": {
    "eligibility": {
      "eligible": "boolean",
      "requires_human_review": "boolean",
      "review_reasons": ["string"]
    },
    "scores": {
      "required_skills": "integer (0-100)",
      "experience_and_projects": "integer (0-100)",
      "career_role_alignment": "integer (0-100)",
      "preferences_alignment": "integer (0-100)",
      "composite_score": "integer (0-100)"
    },
    "evidence": {
      "matched_skills": ["string"],
      "missing_critical_skills": ["string"],
      "relevant_projects": ["string"],
      "rationale": "string"
    }
  }
}
```
