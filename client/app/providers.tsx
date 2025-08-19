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
      console.log("[AuthProvider] getSession result:", session, error);
      setSession(session);

      if (session) {
        // Fetch user_type from the profiles table
        let { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("user_type")
          .eq("id", session.user.id)
          .single();

        if (profile && profile.user_type) {
          setUserType(profile.user_type); // "business" or "society"
        } else {
          setUserType(undefined);
          if (profileError) console.error("Profile fetch error:", profileError);
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
      console.log("[AuthProvider] onAuthStateChange event:", event, session);
      getSessionAndType();
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    console.log("[AuthProvider] session state changed:", session);
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
