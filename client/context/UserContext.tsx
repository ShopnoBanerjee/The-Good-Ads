"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { User } from "@supabase/supabase-js";

interface UserContextValue {
  user: User | null;
  userType: string | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
}

interface UserProviderProps {
  children: ReactNode;
}

const UserContext = createContext<UserContextValue>({
  user: null,
  userType: null,
  isLoading: true,
  setUser: () => {},
});

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }: UserProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [userType, setUserType] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUserAndType = async () => {
      try {
        const supabase = getSupabaseClient();
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          setUser(data.session.user);
          // Fetch user_type from profiles table
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("user_type")
            .eq("id", data.session.user.id)
            .single();
          if (!profileError && profile?.user_type) {
            setUserType(profile.user_type);
          }
        }
      } catch (error) {
        setUser(null);
        setUserType(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserAndType();
  }, []);

  return (
    <UserContext.Provider value={{ user, userType, isLoading, setUser }}>
      {children}
    </UserContext.Provider>
  );
};
