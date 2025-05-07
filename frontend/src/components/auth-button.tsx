"use client";

import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { LogIn, LogOut, Loader2 } from "lucide-react";
import { AuthClient } from "@dfinity/auth-client";
import { icApi } from "../lib/ic-api";

export function AuthButton() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [principalId, setPrincipalId] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const authClient = await AuthClient.create();
      const authenticated = await authClient.isAuthenticated();
      setIsAuthenticated(authenticated);

      if (authenticated) {
        const identity = authClient.getIdentity();
        const principal = identity.getPrincipal();
        setPrincipalId(principal.toString());
        
        // Update the IC API with the authenticated identity
        await icApi.updateIdentity(identity);
      }
    } catch (error) {
      console.error("Error checking authentication:", error);
    }
  };

  const login = async () => {
    setIsLoading(true);
    try {
      const authClient = await AuthClient.create();
      
      // Start the login flow
      await new Promise<void>((resolve) => {
        authClient.login({
          identityProvider: process.env.NEXT_PUBLIC_INTERNET_IDENTITY_URL,
          onSuccess: () => resolve(),
          onError: (error) => {
            console.error("Login failed:", error);
            setIsLoading(false);
          },
        });
      });

      await checkAuth();
    } catch (error) {
      console.error("Error during login:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      const authClient = await AuthClient.create();
      await authClient.logout();
      setIsAuthenticated(false);
      setPrincipalId(null);
      
      // Reset the IC API to use anonymous identity
      await icApi.updateIdentity(null);
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {isAuthenticated ? (
        <div className="flex flex-col items-end">
          {principalId && (
            <p className="text-xs text-muted-foreground mb-1">
              {principalId.substring(0, 5)}...{principalId.substring(principalId.length - 5)}
            </p>
          )}
          <Button onClick={logout} variant="outline" size="sm" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="mr-2 h-4 w-4" />
            )}
            Logout
          </Button>
        </div>
      ) : (
        <Button onClick={login} variant="outline" size="sm" disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <LogIn className="mr-2 h-4 w-4" />
          )}
          Login with Internet Identity
        </Button>
      )}
    </div>
  );
} 