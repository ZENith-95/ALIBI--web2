import { createClient } from "./client";

export async function supabaseSignup(email: string, password: string) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
    });

    if (error) throw error;
    return data;
}

export async function supabaseSignin(email: string, password: string) {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) throw error;
    return data;
}
