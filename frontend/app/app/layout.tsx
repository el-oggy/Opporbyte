import { ProtectedWorkspace } from "@/lib/session";
import { CareerProfileProvider } from "@/components/workspace/CareerProfileContext";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedWorkspace>
      <CareerProfileProvider>{children}</CareerProfileProvider>
    </ProtectedWorkspace>
  );
}
