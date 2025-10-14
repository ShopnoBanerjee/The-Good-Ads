"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { Session } from "@supabase/supabase-js";

interface AuthContextType {
  session: Session | null | undefined;
  userType: string | undefined;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: AuthProviderProps) {
  const supabase = getSupabaseClient();
  const [session, setSession] = useState<Session | null | undefined>(undefined); // undefined = loading
  const [userType, setUserType] = useState<string | undefined>(undefined);

  useEffect(() => {
    // Always check for session on mount
    const getSessionAndType = async (): Promise<void> => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      setSession(session);

      if (session) {
        // Fetch user_type from the profiles table
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("user_type")
          .eq("id", session.user.id)
          .maybeSingle();

        if (profile && profile.user_type) {
          setUserType(profile.user_type); // "business" or "college_society"
        } else {
          setUserType(undefined);
        }
      } else {
        setUserType(undefined);
      }
    };
    getSessionAndType();

    // Listen for changes and re-check session
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      getSessionAndType();
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
  }, [session]);

  return (
    <AuthContext.Provider value={{ session, userType }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
