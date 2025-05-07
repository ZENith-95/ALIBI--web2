"use client";

import React, { useEffect, useState } from 'react';
import { Button } from "../../components/ui/button"; // Assuming Button component is still used
import { getCurrentUser, onAuthStateChange } from "../../../auth"; // Adjusted path
import { User } from "@supabase/supabase-js";

export default function AuthDebugPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const user = await getCurrentUser();
      setCurrentUser(user);
      setIsLoading(false);
    };
    checkUser();

    const authListener = onAuthStateChange((event, session) => {
      setCurrentUser(session?.user ?? null);
    });

    return () => {
      authListener.subscription?.unsubscribe();
    };
  }, []);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Authentication Debug Page (Supabase)</h1>
      
      <div className="bg-card p-6 rounded-lg border border-border mb-6">
        <h2 className="text-lg font-semibold mb-2">Current User Status</h2>
        {isLoading ? (
          <p>Loading user status...</p>
        ) : currentUser ? (
          <div>
            <p><strong>User ID:</strong> {currentUser.id}</p>
            <p><strong>Email:</strong> {currentUser.email}</p>
            <p><strong>Authenticated:</strong> Yes</p>
          </div>
        ) : (
          <p>No user is currently authenticated.</p>
        )}
      </div>
      
      <div className="bg-card p-6 rounded-lg border border-border">
        <h2 className="text-lg font-semibold mb-4">Troubleshooting Steps</h2>
        <ol className="list-decimal pl-5 space-y-2">
          <li>Use the Login button in the site header to attempt authentication with Supabase (Email/Password).</li>
          <li>Check the browser console for detailed logs from Supabase Auth.</li>
          <li>Verify that the user information (ID, email) is correctly displayed above after successful login.</li>
          <li>If you get errors, check your Supabase project settings, environment variables (Supabase URL and Anon Key), and network connections.</li>
          <li>Ensure Row Level Security (RLS) policies in Supabase are configured correctly if you encounter data access issues.</li>
        </ol>
      </div>
    </div>
  );
}
