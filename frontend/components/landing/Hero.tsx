"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Check,
  Rotate3D,
  Sparkles,
} from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SceneHost } from "../scene/SceneHost";
import { useMediaQuery } from "./useMediaQuery";

export function Hero() {
  const hero = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const stage = useRef<HTMLDivElement>(null);
  const [inspection, setInspection] = useState(false);
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const mobile = useMediaQuery("(max-width: 760px)");
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();
    media.add(
      "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
      () => {
        const tween = gsap.to(progress, {
          current: 1,
          ease: "none",
          scrollTrigger: {
            trigger: hero.current,
            start: "top top",
            end: "+=850",
            pin: true,
            scrub: 0.6,
            onUpdate: (self) => {
              stage.current?.setAttribute(
                "data-stage",
                self.progress < 0.32 ? "0" : self.progress < 0.7 ? "1" : "2",
              );
            },
          },
        });
        return () => {
          tween.kill();
          progress.current = 0;
          stage.current?.setAttribute("data-stage", "0");
        };
      },
    );
    return () => media.revert();
  }, []);
  return (
    <section className="hero" ref={hero} aria-labelledby="hero-title">
      <div className="hero-grid shell">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="tiny-star" aria-hidden="true">
              ✳
            </span>{" "}
            A little clarity. A lot of possibility.
          </div>
          <h1 id="hero-title">
            Your job hunt.
            <br />
            <span>
              Finally in
              <br className="desktop-break" /> one place.
            </span>
          </h1>
          <p className="hero-description">
            Find opportunities that fit, prepare tailored resumes, and keep
            every application organized.
          </p>
          <div className="hero-actions">
            <Link href="/onboarding" className="button button-primary">
              Find my next role <ArrowUpRight size={20} aria-hidden="true" />
            </Link>
            <a href="#how-it-works" className="button button-text">
              See how it works <ArrowRight size={18} aria-hidden="true" />
            </a>
          </div>
          <div className="hero-reassurance">
            <span>
              <Check size={13} aria-hidden="true" /> Your career. Your
              direction.
            </span>
            <span className="reassurance-dot" /> Every industry welcome
          </div>
        </div>
        <div
          className="hero-visual"
          role="group"
          aria-label="An orange Opporbyte core surrounded by dimensional fictional job opportunities, a resume, a match indicator and an interview status. Scrolling gathers them into a workspace."
        >
          <div className="scene-index">
            <span className="live-dot" /> THE OPPORTUNITY ENGINE{" "}
            <span>01 / 03</span>
          </div>
          <SceneHost
            progress={progress}
            reduced={reduced}
            mobile={mobile}
            inspection={inspection}
          />
          <button
            type="button"
            className="scene-perspective"
            aria-pressed={inspection}
            onClick={() => setInspection(!inspection)}
          >
            <Rotate3D size={16} aria-hidden="true" />
            {inspection ? "Original view" : "Turn the view"}
          </button>
          <div className="scene-caption">
            <Sparkles size={13} aria-hidden="true" />
            <span>Move to explore. Scroll to bring it together.</span>
          </div>
        </div>
      </div>
      <div className="hero-bottom shell">
        <a className="scroll-cue" href="#how-it-works">
          <span className="scroll-circle">
            <ArrowDown size={16} aria-hidden="true" />
          </span>{" "}
          LESS SEARCHING. MORE POSSIBILITY.
        </a>
        <div
          className="scene-stages"
          ref={stage}
          data-stage="0"
          aria-label="Scene stages"
        >
          <span>
            01 <b>Discover</b>
          </span>
          <i />
          <span>
            02 <b>Connect</b>
          </span>
          <i />
          <span>
            03 <b>Organize</b>
          </span>
        </div>
        <span className="demo-caption">
          Fictional content · Frontend preview
        </span>
      </div>
    </section>
  );
}
