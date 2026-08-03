import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  resolveAdminProfileForSession,
  signInAdmin,
  signOutAdmin,
} from "@/lib/auth/admin-auth";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { AdminProfile } from "@/lib/supabase/database.types";
import type { Session } from "@supabase/supabase-js";

interface AdminAuthContextValue {
  session: Session | null;
  profile: AdminProfile | null;
  loading: boolean;
  configured: boolean;
  authError: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const applySession = useCallback(async (nextSession: Session | null) => {
    setSession(nextSession);
    if (!nextSession?.user) {
      setProfile(null);
      return;
    }

    const resolvedProfile = await resolveAdminProfileForSession(nextSession);
    setProfile(resolvedProfile);
  }, []);

  const refresh = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setAuthError(null);

    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      await applySession(data.session);
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : "Unable to verify admin session.");
      setSession(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [applySession]);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function bootstrap() {
      setLoading(true);
      setAuthError(null);

      try {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (!cancelled) await applySession(data.session);
      } catch (err) {
        if (!cancelled) {
          setAuthError(err instanceof Error ? err.message : "Unable to verify admin session.");
          setSession(null);
          setProfile(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void bootstrap();

    const supabase = getSupabaseClient();
    const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      void applySession(nextSession).catch(() => {
        if (!cancelled) setProfile(null);
      }).finally(() => {
        if (!cancelled) setLoading(false);
      });
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [applySession]);

  const signIn = useCallback(async (email: string, password: string) => {
    const result = await signInAdmin(email, password);
    setSession(result.session);
    setProfile(result.profile);
    setAuthError(null);
  }, []);

  const signOut = useCallback(async () => {
    await signOutAdmin(profile);
    setSession(null);
    setProfile(null);
  }, [profile]);

  return (
    <AdminAuthContext.Provider
      value={{
        session,
        profile,
        loading,
        configured: isSupabaseConfigured,
        authError,
        signIn,
        signOut,
        refresh,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}
