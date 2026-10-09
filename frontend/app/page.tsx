import { Navigation } from "@/components/landing/Navigation";
import { Hero } from "@/components/landing/Hero";
import { WorkspacePreview } from "@/components/landing/WorkspacePreview";

export default function Home() {
  return (
    <>
      <Navigation />
      <main id="main" tabIndex={-1}>
        <Hero />
        <WorkspacePreview />
      </main>
    </>
  );
}
