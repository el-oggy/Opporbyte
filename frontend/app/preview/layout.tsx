import { CareerProfileProvider } from "@/components/workspace/CareerProfileContext";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <CareerProfileProvider>{children}</CareerProfileProvider>;
}
