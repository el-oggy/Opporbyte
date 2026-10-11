"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { ProfileType } from "./types";

const CareerProfileContext = createContext<{
  profile: ProfileType;
  setProfile: (profile: ProfileType) => void;
} | null>(null);

// Layout state survives workspace navigation, but leaves no career data in
// browser storage and resets when the user leaves this workspace.
export function CareerProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<ProfileType>("software");
  return (
    <CareerProfileContext.Provider value={{ profile, setProfile }}>
      {children}
    </CareerProfileContext.Provider>
  );
}

export function useCareerProfile() {
  const value = useContext(CareerProfileContext);
  if (!value) throw new Error("Career profiles require a workspace layout.");
  return value;
}
