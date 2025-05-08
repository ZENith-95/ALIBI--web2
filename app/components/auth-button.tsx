"use client";

import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { LogIn, LogOut, Loader2, UserCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "./ui/dialog";
import useAuthStore from "../hooks/useAuth";

export function AuthButton() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const authState = useAuthStore();
  const authenticated = authState.isAuthenticated;
  // useEffect(() => {
  //   const checkCurrentUser = async () => {
  //     setIsLoading(true);
  //     const user = await getCurrentUser();
  //     setCurrentUser(user);
  //     setIsLoading(false);
  //   };

  //   checkCurrentUser();

  //   const authListener = onAuthStateChange((event, session) => {
  //     console.log("Auth event:", event, session);
  //     setCurrentUser(session?.user ?? null);
  //     if (event === "SIGNED_IN") {
  //       setIsDialogOpen(false); // Close dialog on successful sign-in
  //     }
  //   });

  //   return () => {
  //     authListener.subscription?.unsubscribe();
  //   };
  // }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    await authState.login(email, password);
    // if (error) {
    // setAuthError(error.message);
    // console.error("Login failed:", error);
    // } else {
    // setEmail("");
    // setPassword("");
    // User state will be updated by onAuthStateChange
    // }
  };

  const handleLogout = async () => {
    setAuthError(null);
    // const { error } = await signOut();
    // if (error) {
    //   setAuthError(error.message);
    //   console.error("Logout failed:", error);
    // }
    // User state will be updated by onAuthStateChange
  };

  if (authState.processing && !authenticated) {
    return (
      <Button variant="outline" size="sm" disabled>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading...
      </Button>
    );
  }

  return (
    <div>
      {authenticated ? (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground hidden sm:inline">
            {authState.email?.substring(0, authState.email.indexOf('@'))}
          </span>
          <Button onClick={handleLogout} variant="outline" size="sm" disabled={authState.processing}>
            {authState.processing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="mr-2 h-4 w-4" />
            )}
            Logout
          </Button>
        </div>
      ) : (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <LogIn className="mr-2 h-4 w-4" />
              Login
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Login</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleLogin}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email-login" className="text-right">
                    Email
                  </Label>
                  <Input
                    id="email-login"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="password-login" className="text-right">
                    Password
                  </Label>
                  <Input
                    id="password-login"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="col-span-3"
                    required
                  />
                </div>
                {authError && (
                  <p className="col-span-4 text-red-500 text-sm text-center">{authError}</p>
                )}
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={authState.processing}>
                  {authState.processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
                  Login
                </Button>
              </DialogFooter>
            </form>
            {/* Basic Sign Up link - can be expanded later */}
            <p className="text-center text-sm mt-4">
              Don't have an account?{' '}
              <Button variant="link" className="p-0 h-auto" onClick={() => alert("Sign up functionality to be implemented")}>
                Sign Up
              </Button>
            </p>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
