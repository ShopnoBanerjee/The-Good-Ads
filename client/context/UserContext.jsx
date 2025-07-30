"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";

const UserContext = createContext({
  user: null,
  userType: null,
  isLoading: true,
  setUser: () => {},
});

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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
