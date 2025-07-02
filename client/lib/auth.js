import { supabase } from './supabaseClient';

export const auth = {
  signInWithEmail: async (email) => {
    return supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/auth/callback` },
    });
  },
  getSession: async () => {
    return supabase.auth.getSession();
  },
  signOut: async () => {
    return supabase.auth.signOut();
  },
};
