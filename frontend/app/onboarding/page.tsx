import type { Metadata } from "next";
import { Navigation } from "@/components/landing/Navigation";
import { OnboardingPreview } from "@/components/landing/OnboardingPreview";

export const metadata: Metadata = {
  title: "Explore your next chapter — Opporbyte frontend preview",
};
export default function Onboarding() {
  return (
    <>
      <Navigation />
      <OnboardingPreview />
    </>
  );
}
