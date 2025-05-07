"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

export function EnvChecker() {
  const [envVars, setEnvVars] = useState<Record<string, string | undefined>>({});

  useEffect(() => {
    // Get all environment variables that start with NEXT_PUBLIC_
    const publicVars: Record<string, string | undefined> = {
      NEXT_PUBLIC_EVENTS_CANISTER_ID: process.env.NEXT_PUBLIC_EVENTS_CANISTER_ID,
      NEXT_PUBLIC_PROFILE_CANISTER_ID: process.env.NEXT_PUBLIC_PROFILE_CANISTER_ID,
      NEXT_PUBLIC_TICKET_CANISTER_ID: process.env.NEXT_PUBLIC_TICKET_CANISTER_ID,
      NEXT_PUBLIC_IC_HOST: process.env.NEXT_PUBLIC_IC_HOST,
      NEXT_PUBLIC_INTERNET_IDENTITY_URL: process.env.NEXT_PUBLIC_INTERNET_IDENTITY_URL,
    };
    setEnvVars(publicVars);
  }, []);

  return (
    <Card className="w-full mb-6">
      <CardHeader>
        <CardTitle>Environment Variables Checker</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {Object.entries(envVars).map(([key, value]) => (
            <div key={key} className="grid grid-cols-2 gap-2">
              <div className="font-semibold">{key}:</div>
              <div className={value ? "text-green-500" : "text-red-500"}>
                {value || "Not set"}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 