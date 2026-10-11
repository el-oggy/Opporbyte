import {
  ArrowRight,
  BriefcaseBusiness,
  FileCheck2,
  Layers3,
  MoveUpRight,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

export function WorkspacePreview() {
  return (
    <section
      className="workspace-section"
      id="how-it-works"
      aria-labelledby="workspace-title"
    >
      <div className="shell">
        <div className="section-topline">
          <span className="eyebrow">01 / A calmer way forward</span>
          <span className="small-note">FROM SCATTERED TO SORTED</span>
        </div>
        <div className="workspace-heading">
          <h2 id="workspace-title">
            Goodbye,
            <br />
            <span>endless tabs.</span>
          </h2>
          <p>
            Your next chapter deserves a little more headspace. Bring the
            search, the preparation, and the progress into one thoughtful
            workspace.
          </p>
        </div>
        <div className="preview-grid" id="features">
          <div className="preview-feature">
            <span className="feature-icon">
              <BriefcaseBusiness size={22} />
            </span>
            <span className="feature-number">01</span>
            <h3>Find your possibilities.</h3>
            <p>
              Explore opportunities for the direction you want to take. Any
              field. Your kind of fit.
            </p>
            <div className="feature-tags" id="explore">
              <span>Design</span>
              <span>Healthcare</span>
              <span>Technology</span>
              <span>+ every field</span>
            </div>
          </div>
          <div className="preview-feature">
            <span className="feature-icon cyan">
              <FileCheck2 size={22} />
            </span>
            <span className="feature-number">02</span>
            <h3>Put your story forward.</h3>
            <p>
              A place to prepare a resume around your experience, and the
              opportunity ahead.
            </p>
            <div className="mini-document">
              <span />
              <div>
                <b>Your experience, clearly told</b>
                <span>Resume preparation preview</span>
              </div>
              <Sparkles size={18} />
            </div>
          </div>
          <div className="preview-feature">
            <span className="feature-icon ink">
              <Layers3 size={22} />
            </span>
            <span className="feature-number">03</span>
            <h3>See the whole picture.</h3>
            <p>
              Keep every possibility in view, from that first saved role to your
              next conversation.
            </p>
            <div className="mini-pipeline">
              <span>
                Saved <b>04</b>
              </span>
              <ArrowRight size={12} />
              <span>
                Preparing <b>02</b>
              </span>
              <ArrowRight size={12} />
              <span className="pipeline-active">
                Interview <b>01</b>
              </span>
            </div>
          </div>
        </div>
        <div className="preview-footer">
          <span>
            <span className="live-dot" /> A first look at what’s possible.
            Demonstration only.
          </span>
          <Link href="/onboarding">
            Explore the frontend preview <MoveUpRight size={17} />
          </Link>
        </div>
      </div>
    </section>
  );
}
