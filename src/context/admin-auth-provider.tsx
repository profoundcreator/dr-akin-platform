import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  fetchAdminProfile,
  getCurrentAdmin,
  signInAdmin,
  signOutAdmin,
} from "@/lib/auth/admin-auth";
import { canAccessAdmin } from "@/lib/auth/permissions";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { AdminProfile } from "@/lib/supabase/database.types";
import type { Session } from "@supabase/supabase-js";

interface AdminAuthContextValue {
  session: Session | null;
  profile: AdminProfile | null;
  loading: boolean;
  configured: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    const current = await getCurrentAdmin();
    setSession(current?.session ?? null);
    setProfile(current?.profile ?? null);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();

    if (!isSupabaseConfigured) return;

    const supabase = getSupabaseClient();
    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      if (newSession?.user) {
        const p = await fetchAdminProfile(newSession.user.id);
        setProfile(canAccessAdmin(p) ? p : null);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => sub.subscription.unsubscribe();
  }, [refresh]);

  const signIn = useCallback(async (email: string, password: string) => {
    const result = await signInAdmin(email, password);
    setSession(result.session);
    setProfile(result.profile);
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
