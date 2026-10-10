import { Hero } from "@/components/landing/Hero";
import { WorkspacePreview } from "@/components/landing/WorkspacePreview";

export default function Home() {
  return (
    <>
      <main id="main" tabIndex={-1}>
        <Hero />
        <WorkspacePreview />
      </main>
    </>
  );
}
