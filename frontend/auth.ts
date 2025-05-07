import { supabase } from './src/lib/supabase'; // Adjusted path to supabase client
import { SignInWithPasswordCredentials, SignUpWithPasswordCredentials } from '@supabase/supabase-js';

export async function signUpWithEmail(credentials: SignUpWithPasswordCredentials) {
  const { data, error } = await supabase.auth.signUp(credentials);
  if (error) {
    console.error('Error signing up:', error);
    return { user: null, error };
  }
  return { user: data.user, error: null };
}

export async function signInWithEmail(credentials: SignInWithPasswordCredentials) {
  const { data, error } = await supabase.auth.signInWithPassword(credentials);
  if (error) {
    console.error('Error signing in:', error);
    return { user: null, error };
  }
  return { user: data.user, error: null };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Error signing out:', error);
    return { error };
  }
  return { error: null };
}

export async function getCurrentUser() {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) {
    console.error('Error getting session:', sessionError);
    return null;
  }
  if (!session) {
    return null;
  }
  return session.user;
}

export function onAuthStateChange(callback: (event: string, session: any) => void) {
  const { data: authListener } = supabase.auth.onAuthStateChange(callback);
  return authListener;
}
