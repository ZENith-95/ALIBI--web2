// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);


export async function supabaseSignup(email: string, password: string) {
    console.log(`supabaseUrl: ${supabaseUrl}`);
    console.log(`supabaseAnonKey: ${supabaseAnonKey}`);
    console.log(`password:${password} email:${email}`);
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
    });

    if (error) throw error;
    return data;
}

export async function supabaseSignin(email: string, password: string) {

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) throw error;
    return data;
}


export async function supabaseSignOut() {
    await supabase.auth.signOut();
}