"use client";
import { useSyncExternalStore } from "react";
const fallback = "comfortable:system";
function subscribe(callback: () => void) {
  window.addEventListener("opporbyte-workspace-preferences", callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener("opporbyte-workspace-preferences", callback);
    window.removeEventListener("storage", callback);
  };
}
function snapshot() {
  try {
    return localStorage.getItem("opporbyte.workspace.appearance") || fallback;
  } catch {
    return fallback;
  }
}
export function useWorkspacePreferences() {
  const value = useSyncExternalStore(subscribe, snapshot, () => fallback);
  const [density, motion] = value.split(":");
  return {
    density: density === "compact" ? "compact" : "comfortable",
    motion: motion === "reduced" ? "reduced" : "system",
    set: (nextDensity: string, nextMotion: string) => {
      try {
        localStorage.setItem(
          "opporbyte.workspace.appearance",
          `${nextDensity}:${nextMotion}`,
        );
      } catch {
        /* Preferences remain unchanged when device storage is unavailable. */
      }
      window.dispatchEvent(new Event("opporbyte-workspace-preferences"));
    },
  };
}
