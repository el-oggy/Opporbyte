"use client";

import dynamic from "next/dynamic";
import {
  Component,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import styles from "./hero3d.module.css";
import StaticHero from "./StaticHero";

const OpportunityWorld = dynamic(() => import("./OpportunityWorld"), {
  ssr: false,
  loading: () => null,
});
export interface Hero3DProps {
  progress: RefObject<number>;
  reduced: boolean;
  mobile: boolean;
  paused?: boolean;
}
class SceneBoundary extends Component<
  { children: ReactNode; onFailure: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onFailure();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}
export default function Hero3D(props: Hero3DProps) {
  const host = useRef<HTMLDivElement>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const [mode, setMode] = useState<"checking" | "webgl" | "fallback">(
    "checking",
  );
  const [ready, setReady] = useState(false);
  const [intersecting, setIntersecting] = useState(true);
  const [tabVisible, setTabVisible] = useState(true);
  const onFailure = useCallback(() => {
    setMode("fallback");
    setReady(false);
  }, []);
  const onReady = useCallback(() => setReady(true), []);
  useEffect(() => {
    let cancelled = false;
    let frame = 0;
    document.fonts.ready.then(() => {
      frame = requestAnimationFrame(() => {
        if (cancelled) return;
        try {
          const probe = document.createElement("canvas");
          const gl = probe.getContext("webgl2", {
            failIfMajorPerformanceCaveat: true,
          });
          if (!gl) return setMode("fallback");
          gl.getExtension("WEBGL_lose_context")?.loseContext();
          setMode("webgl");
        } catch {
          setMode("fallback");
        }
      });
    });
    const observer = new IntersectionObserver(
      ([entry]) => setIntersecting(entry.isIntersecting),
      { rootMargin: "40px" },
    );
    if (host.current) observer.observe(host.current);
    const visibility = () =>
      setTabVisible(document.visibilityState !== "hidden");
    visibility();
    document.addEventListener("visibilitychange", visibility);
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);
  useEffect(() => {
    if (props.reduced || props.mobile) {
      pointer.current = { x: 0, y: 0 };
      return;
    }
    const move = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const bounds = host.current?.getBoundingClientRect();
      if (
        !bounds ||
        event.clientY < bounds.top ||
        event.clientY > bounds.bottom
      )
        return;
      pointer.current.x = Math.min(
        1,
        Math.max(-1, (event.clientX / window.innerWidth - 0.5) * 2),
      );
      pointer.current.y = Math.min(
        1,
        Math.max(-1, ((event.clientY - bounds.top) / bounds.height - 0.5) * -2),
      );
    };
    const reset = () => {
      pointer.current = { x: 0, y: 0 };
    };
    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", reset);
    return () => {
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", reset);
    };
  }, [props.mobile, props.reduced]);
  return (
    <div
      ref={host}
      id="hero-artwork"
      className={styles.host}
      data-hero3d="true"
      data-capability={mode}
      data-renderer={ready ? "webgl" : "static"}
      data-motion={props.reduced ? "frozen" : props.paused ? "paused" : "interactive"}
      data-render-loop={
        props.reduced
          ? "demand"
          : intersecting && tabVisible && !props.paused
            ? "always"
            : "paused"
      }
      aria-hidden="true"
    >
      <div className={styles.artwork}>
        {!ready && <StaticHero />}
        {mode === "webgl" && (
          <SceneBoundary onFailure={onFailure}>
            <OpportunityWorld
              {...props}
              visible={intersecting && tabVisible && (!props.paused || !ready)}
              pointer={pointer}
              onReady={onReady}
              onFailure={onFailure}
            />
          </SceneBoundary>
        )}
      </div>
      <span className={styles.caption}>
        ILLUSTRATIVE OPPORTUNITIES · YOUR OWN PATH
      </span>
    </div>
  );
}
