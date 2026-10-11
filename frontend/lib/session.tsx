"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { ApiError, getMe, logout, type User } from "@/components/workspace/api";
import { Brand, Button, ButtonLink } from "@/components/ui";

type Session = {
  user: User | null;
  status: "checking" | "authenticated" | "anonymous" | "unavailable";
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
};
const Context = createContext<Session | null>(null);
export function useSession() {
  const value = useContext(Context);
  if (!value) throw new Error("Session provider required");
  return value;
}
export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<Session["status"]>("checking");
  const refresh = useCallback(async () => {
    setStatus("checking");
    try {
      setUser(await getMe());
      setStatus("authenticated");
    } catch (error) {
      setUser(null);
      setStatus(
        error instanceof ApiError &&
          (error.status === 401 || error.status === 403)
          ? "anonymous"
          : "unavailable",
      );
    }
  }, []);
  const signOut = useCallback(async () => {
    await logout();
    setUser(null);
    setStatus("anonymous");
  }, []);
  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) void refresh();
    });
    return () => {
      cancelled = true;
    };
  }, [refresh]);
  return (
    <Context.Provider value={{ user, status, refresh, signOut }}>
      {children}
    </Context.Provider>
  );
}
function Gate({ children }: { children: ReactNode }) {
  const { status, refresh } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  useEffect(() => {
    if (status === "anonymous")
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [status, pathname, router]);
  if (status === "authenticated") return children;
  return (
    <main className="session-state" id="main">
      <Brand />
      <div>
        <p className="ui-eyebrow">PRIVATE WORKSPACE</p>
        <h1>
          {status === "unavailable"
            ? "Let's reconnect your workspace."
            : status === "anonymous"
              ? "Sign in to your workspace."
              : "Checking your session…"}
        </h1>
        <p>
          {status === "unavailable"
            ? "The backend service is unavailable. Start the existing local backend, then retry. Your private data remains behind the existing sign-in."
            : "Your account is verified before workspace data is loaded."}
        </p>
        <div className="session-actions">
          {status === "unavailable" && (
            <Button onClick={() => void refresh()}>Try again</Button>
          )}
          <ButtonLink href="/login" variant="secondary">
            Owner sign-in
          </ButtonLink>
          <ButtonLink href="/preview" variant="ghost">
            Explore the demo
          </ButtonLink>
        </div>
      </div>
    </main>
  );
}
export function ProtectedWorkspace({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <Gate>{children}</Gate>
    </SessionProvider>
  );
}
