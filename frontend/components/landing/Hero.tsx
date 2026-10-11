"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Captions,
  Pause,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Brand } from "./Brand";
import { useMediaQuery } from "./useMediaQuery";
import "./film-intro.css";

export function Hero() {
  const video = useRef<HTMLVideoElement>(null);
  const section = useRef<HTMLElement>(null);
  const intent = useRef(true);
  const heard = useRef(false);
  const completed = useRef(false);
  const position = useRef(0);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [ended, setEnded] = useState(false);
  const [captions, setCaptions] = useState(false);
  const [failed, setFailed] = useState(false);
  const portrait = useMediaQuery("(max-aspect-ratio: 1/1)");
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const format = portrait ? "portrait" : "landscape";
  const source = "/films/opporbyte-" + format + ".mp4";

  useEffect(() => {
    const element = video.current;
    if (!element) return;
    element.volume = 0.9;
    let inView = true,
      cancelled = false;
    const mediaError = () => {
      setFailed(true);
      setPlaying(false);
    };
    element.addEventListener("error", mediaError);
    // An initial request may fail before React attaches its event handlers.
    if (element.error)
      queueMicrotask(() => {
        if (!cancelled) mediaError();
      });
    if (reduced) intent.current = false;
    const update = () => {
      if (!inView || document.hidden || !intent.current) element.pause();
      else if (element.readyState >= 1 && !completed.current) {
        element.play().catch(() => {
          if (!cancelled) setPlaying(false);
        });
      }
    };
    const restore = () => {
      element.currentTime = Math.min(position.current, element.duration || 0);
      update();
    };
    const observer = new IntersectionObserver(
      ([item]) => {
        inView = item.isIntersecting && item.intersectionRatio >= 0.2;
        update();
      },
      { threshold: 0.2 },
    );
    if (section.current) observer.observe(section.current);
    document.addEventListener("visibilitychange", update);
    element.addEventListener("loadedmetadata", restore);
    if (element.readyState >= 1) restore();
    return () => {
      cancelled = true;
      if (element.readyState >= 1) position.current = element.currentTime;
      observer.disconnect();
      document.removeEventListener("visibilitychange", update);
      element.removeEventListener("loadedmetadata", restore);
      element.removeEventListener("error", mediaError);
      element.pause();
    };
  }, [source, reduced]);

  useEffect(() => {
    const element = video.current;
    if (!element) return;
    const update = () => {
      for (const track of element.textTracks)
        track.mode = captions ? "showing" : "hidden";
    };
    update();
    element.addEventListener("loadedmetadata", update);
    return () => element.removeEventListener("loadedmetadata", update);
  }, [captions, source]);

  const play = () => {
    const element = video.current;
    if (!element) return;
    if (completed.current || element.ended) {
      element.currentTime = 0;
      position.current = 0;
      completed.current = false;
      setEnded(false);
    }
    intent.current = true;
    element.play().catch(() => setPlaying(false));
  };
  const togglePlayback = () => {
    if (!video.current) return;
    if (video.current.paused || video.current.ended) play();
    else {
      intent.current = false;
      video.current.pause();
    }
  };
  const toggleSound = () => {
    const element = video.current;
    if (!element) return;
    const next = !muted;
    element.muted = next;
    element.volume = 0.9;
    setMuted(next);
    if (!next) {
      // First sound activation restarts the story so its opening line is heard.
      if (!heard.current) {
        element.currentTime = 0;
        position.current = 0;
        heard.current = true;
      }
      completed.current = false;
      setEnded(false);
      play();
    }
  };

  return (
    <section
      className="film-intro"
      ref={section}
      aria-labelledby="film-title"
      data-ended={ended}
      data-reduced={reduced}
      data-format={format}
    >
      <h1 id="film-title" className="sr-only">
        Opporbyte. Your whole job hunt, in one place.
      </h1>
      <video
        key={source}
        ref={video}
        className="intro-film"
        src={source}
        poster={"/films/opporbyte-" + format + "-poster.jpg"}
        muted={muted}
        playsInline
        preload="auto"
        aria-label="35-second Opporbyte product film, with fictional product examples."
        onPlay={() => {
          setPlaying(true);
          setEnded(false);
          setFailed(false);
        }}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(event) => {
          position.current = event.currentTarget.currentTime;
        }}
        onEnded={() => {
          completed.current = true;
          intent.current = false;
          setEnded(true);
          setPlaying(false);
        }}
        onError={() => {
          setFailed(true);
          setPlaying(false);
        }}
      >
        <track
          kind="captions"
          src="/films/opporbyte-en.vtt"
          srcLang="en"
          label="English"
        />
      </video>
      <header className="film-header">
        <a href="#how-it-works" className="skip-link">
          Skip the film
        </a>
        <nav className="film-nav" aria-label="Showcase navigation">
          <Brand />
          <div
            className="film-controls"
            role="group"
            aria-label="Film controls"
          >
            <button
              type="button"
              onClick={toggleSound}
              aria-label={
                muted ? "Sound off: watch with sound" : "Sound on: mute film"
              }
              aria-pressed={!muted}
            >
              {muted ? (
                <VolumeX size={18} aria-hidden="true" />
              ) : (
                <Volume2 size={18} aria-hidden="true" />
              )}
              <span>{muted ? "Sound off" : "Sound on"}</span>
            </button>
            <button
              type="button"
              onClick={togglePlayback}
              aria-label={
                ended ? "Replay film" : playing ? "Pause film" : "Play film"
              }
            >
              {ended ? (
                <RotateCcw size={18} aria-hidden="true" />
              ) : playing ? (
                <Pause size={18} aria-hidden="true" />
              ) : (
                <Play size={18} aria-hidden="true" />
              )}
            </button>
            <button
              type="button"
              onClick={() => setCaptions(!captions)}
              aria-label={captions ? "Hide captions" : "Show captions"}
              aria-pressed={captions}
            >
              <Captions size={19} aria-hidden="true" />
            </button>
          </div>
          <Link className="button button-primary film-entry" href="/onboarding">
            Enter Opporbyte
            <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
        </nav>
      </header>
      {ended && (
        <div className="film-end">
          <Link className="button button-primary" href="/onboarding">
            Find what’s next
            <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
        </div>
      )}
      {failed && (
        <div className="film-error" role="status">
          <p>The film couldn’t load. You can still enter Opporbyte.</p>
          <button
            type="button"
            onClick={() => {
              setFailed(false);
              video.current?.load();
              play();
            }}
          >
            Try the film again
          </button>
        </div>
      )}
      <p className="sr-only">
        Find opportunities for your field, prepare your resume, and keep
        applications and next steps together. This is a product preview with
        fictional examples. Entering opens the existing frontend demo.
      </p>
    </section>
  );
}
