"use client";

import { DebugAuthButton } from "@/components/debug-auth-button";

export default function AuthDebugPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Authentication Debug Page</h1>
      
      <div className="bg-card p-6 rounded-lg border border-border mb-6">
        <h2 className="text-lg font-semibold mb-2">Test Authentication</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Use these buttons to test Internet Identity authentication. 
          Check the browser console for detailed logs.
        </p>
        <DebugAuthButton />
      </div>
      
      <div className="bg-card p-6 rounded-lg border border-border">
        <h2 className="text-lg font-semibold mb-4">Troubleshooting Steps</h2>
        <ol className="list-decimal pl-5 space-y-2">
          <li>Click "Debug Login" to attempt authentication with Internet Identity</li>
          <li>Check the console logs for detailed information about the process</li>
          <li>Verify that the principal is correctly logged after successful login</li>
          <li>If you get errors, check your environment variables and network connections</li>
          <li>After logging in, try accessing the mint function again</li>
        </ol>
      </div>
    </div>
  );
} 