import { ProtectedWorkspace } from "@/lib/session";
export default function Layout({ children }: { children: React.ReactNode }) { return <ProtectedWorkspace>{children}</ProtectedWorkspace>; }
