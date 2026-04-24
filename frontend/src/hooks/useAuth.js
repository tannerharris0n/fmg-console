import { useEffect, useState } from 'react';
import { supabase, hasSupabase } from '../lib/supabase';

export function useAuth() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(hasSupabase);

  useEffect(() => {
    if (!hasSupabase) return;
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, s) => {
      setSession(s);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const signIn = async (email, password) => supabase.auth.signInWithPassword({ email, password });
  const signUp = async (email, password) => supabase.auth.signUp({ email, password });
  const signOut = async () => supabase.auth.signOut();

  return {
    session,
    user: session?.user || null,
    loading,
    hasSupabase,
    signIn,
    signUp,
    signOut,
  };
}
