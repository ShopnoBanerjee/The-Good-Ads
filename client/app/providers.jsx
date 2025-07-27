"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const supabase = getSupabaseClient();
  const [session, setSession] = useState(undefined); // undefined = loading
  const [userType, setUserType] = useState(undefined);

  useEffect(() => {
    // Always check for session on mount
    const getSessionAndType = async () => {
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

export const useAuth = () => useContext(AuthContext);