import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  resolveAdminProfileForSession,
  signInAdmin,
  signOutAdmin,
} from "@/lib/auth/admin-auth";
import { clearAdminBootstrapUser } from "@/lib/auth/admin-session-bootstrap";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { AdminProfile } from "@/lib/supabase/database.types";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";

interface AdminAuthContextValue {
  session: Session | null;
  profile: AdminProfile | null;
  loading: boolean;
  configured: boolean;
  authError: string | null;
  profileError: string | null;
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
  const [profileError, setProfileError] = useState<string | null>(null);
  const skipSignedInEventRef = useRef(false);
  const applySessionTaskRef = useRef<Promise<void> | null>(null);

  const applySession = useCallback(async (nextSession: Session | null) => {
    if (applySessionTaskRef.current) {
      await applySessionTaskRef.current;
    }

    const task = (async () => {
      setSession(nextSession);
      setProfileError(null);

      if (!nextSession?.user) {
        setProfile(null);
        return;
      }

      const result = await resolveAdminProfileForSession(nextSession);

      if (result.signOut) {
        const supabase = getSupabaseClient();
        await supabase.auth.signOut();
        setSession(null);
        setProfile(null);
        setProfileError(result.message);
        return;
      }

      setProfile(result.profile);
      setProfileError(result.profile ? null : result.message);
    })();

    applySessionTaskRef.current = task;

    try {
      await task;
    } finally {
      if (applySessionTaskRef.current === task) {
        applySessionTaskRef.current = null;
      }
    }
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
      setProfileError(null);
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
    const supabase = getSupabaseClient();

    async function bootstrap() {
      setLoading(true);
      setAuthError(null);
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (!cancelled) await applySession(data.session);
      } catch (err) {
        if (!cancelled) {
          setAuthError(err instanceof Error ? err.message : "Unable to verify admin session.");
          setSession(null);
          setProfile(null);
          setProfileError(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void bootstrap();

    const { data: sub } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, nextSession) => {
        if (cancelled) return;

        if (event === "INITIAL_SESSION") {
          return;
        }

        if (event === "SIGNED_IN" && skipSignedInEventRef.current) {
          skipSignedInEventRef.current = false;
          return;
        }

        if (event === "SIGNED_OUT") {
          setSession(null);
          setProfile(null);
          setProfileError(null);
          setLoading(false);
          clearAdminBootstrapUser();
          return;
        }

        if (event === "TOKEN_REFRESHED" || event === "SIGNED_IN") {
          setLoading(true);
          void applySession(nextSession)
            .catch((err) => {
              if (!cancelled) {
                setAuthError(
                  err instanceof Error ? err.message : "Unable to verify admin session.",
                );
              }
            })
            .finally(() => {
              if (!cancelled) setLoading(false);
            });
        }
      },
    );

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [applySession]);

  const signIn = useCallback(async (email: string, password: string) => {
    skipSignedInEventRef.current = true;
    const result = await signInAdmin(email, password);
    setSession(result.session);
    setProfile(result.profile);
    setAuthError(null);
    setProfileError(null);
  }, []);

  const signOut = useCallback(async () => {
    await signOutAdmin(profile);
    clearAdminBootstrapUser();
    setSession(null);
    setProfile(null);
    setProfileError(null);
  }, [profile]);

  return (
    <AdminAuthContext.Provider
      value={{
        session,
        profile,
        loading,
        configured: isSupabaseConfigured,
        authError,
        profileError,
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
