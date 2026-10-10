"use client";

import { useEffect, type RefObject } from "react";
import { clamp, damp, sceneProgress } from "./motion";

export function useScrollScene(
  host: RefObject<HTMLElement | null>,
  render: (progress: number) => void,
  reduced: boolean,
  override: number | null = null,
  measure?: (node: HTMLElement) => number,
) {
  useEffect(() => {
    const node = host.current;
    if (!node) return;
    let frame = 0;
    let previous = 0;
    let current = 0;
    let target = 0;
    let disposed = false;
    let dirty = false;
    const tick = (time: number) => {
      frame = 0;
      if (document.hidden) {
        previous = 0;
        return;
      }
      const elapsed = previous
        ? Math.min((time - previous) / 1000, 0.064)
        : 1 / 60;
      previous = time;
      current = reduced ? target : damp(current, target, elapsed);
      if (Math.abs(target - current) < 0.0005) current = target;
      render(current);
      dirty = false;
      if (current !== target) frame = requestAnimationFrame(tick);
      else previous = 0;
    };
    const update = () => {
      if (disposed) return;
      target =
        override ??
        (reduced
          ? 1
          : clamp(
              measure
                ? measure(node)
                : sceneProgress(
                    node.getBoundingClientRect().top,
                    window.innerHeight,
                  ),
            ));
      if (document.hidden) return;
      if (current === target && !dirty) return;
      if (!frame) frame = requestAnimationFrame(tick);
    };
    const refresh = () => {
      dirty = true;
      update();
    };
    // Initialize from the current position so re-entry/resize cannot replay from zero.
    target =
      override ??
      (reduced
        ? 1
        : clamp(
            measure
              ? measure(node)
              : sceneProgress(
                  node.getBoundingClientRect().top,
                  window.innerHeight,
                ),
          ));
    current = reduced ? target : Number(node.dataset.sceneProgress ?? target);
    if (!Number.isFinite(current)) current = target;
    render(current);
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", refresh);
    document.addEventListener("visibilitychange", update);
    const resize = new ResizeObserver(refresh);
    resize.observe(node);
    void document.fonts.ready.then(refresh);
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      resize.disconnect();
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", refresh);
      document.removeEventListener("visibilitychange", update);
    };
  }, [host, render, reduced, override, measure]);
}
