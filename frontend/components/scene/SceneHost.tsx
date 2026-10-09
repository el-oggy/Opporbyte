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
import { StaticScene } from "./StaticScene";

const CoreScene = dynamic(() => import("./CoreScene"), {
  ssr: false,
  loading: () => null,
});
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

export function SceneHost({
  progress,
  reduced,
  mobile,
  compact,
  inspection,
}: {
  progress: RefObject<number>;
  reduced: boolean;
  mobile: boolean;
  compact: boolean;
  inspection: boolean;
}) {
  const [mode, setMode] = useState<"checking" | "webgl" | "fallback">(
    "checking",
  );
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(true);
  const host = useRef<HTMLDivElement>(null);
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
          if (!gl) {
            setMode("fallback");
            return;
          }
          gl.getExtension("WEBGL_lose_context")?.loseContext();
          setMode("webgl");
        } catch {
          setMode("fallback");
        }
      });
    });
    const observer = new IntersectionObserver(
      (entries) => setVisible(entries[0].isIntersecting),
      { rootMargin: "80px" },
    );
    if (host.current) observer.observe(host.current);
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);
  return (
    <div
      className="scene-host"
      ref={host}
      data-capability={mode}
      data-renderer={ready ? "webgl" : "static"}
    >
      {!ready && <StaticScene />}
      {mode === "webgl" && (
        <SceneBoundary onFailure={onFailure}>
          <CoreScene
            progress={progress}
            reduced={reduced}
            mobile={mobile}
            compact={compact}
            inspection={inspection}
            visible={visible}
            onReady={onReady}
            onFailure={onFailure}
          />
        </SceneBoundary>
      )}
    </div>
  );
}
