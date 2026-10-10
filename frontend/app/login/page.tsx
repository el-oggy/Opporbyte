import { Suspense } from "react";
import LoginPage from "@/components/onboarding/LoginPage";
export default function Page() { return <Suspense fallback={<main className="session-state"><p>Loading sign-in…</p></main>}><LoginPage /></Suspense>; }
