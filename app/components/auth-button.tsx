"use client";

import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { LogIn, LogOut, Loader2, UserCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
  DialogDescription, // Add DialogDescription
} from "./ui/dialog";
import useAuthStore from "@/app/hooks/useAuth"; // Using path alias

export function AuthButton() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const authState = useAuthStore();
  // Destructure all needed state and actions from the store directly
  const { 
    isAuthenticated, 
    processing: authProcessing, 
    error: storeAuthError, 
    user, // Destructure the user object
    login, 
    logout
  } = authState;
  
  useEffect(() => {
    if (storeAuthError) {
      setAuthError(storeAuthError);
    }
  }, [storeAuthError]);

  useEffect(() => {
    if (isAuthenticated && isDialogOpen) {
      setIsDialogOpen(false);
      setEmail(""); // Clear form fields on successful login
      setPassword("");
      setAuthError(null); // Clear local error
    }
  }, [isAuthenticated, isDialogOpen]);

  // const authenticated = authState.isAuthenticated; // Remove this line, use isAuthenticated from destructuring
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
    await login(email, password); // Call destructured login
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
    setAuthError(null); // Keep this to clear local errors if any
    await logout(); // Call destructured logout
    // State updates (isAuthenticated, email) are handled within the store
  };

  if (authProcessing && !isAuthenticated) { // Use destructured variables
    return (
      <Button variant="outline" size="sm" disabled>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading...
      </Button>
    );
  }

  return (
    <div>
      {isAuthenticated ? ( // Use destructured isAuthenticated
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground hidden sm:inline">
            {user?.email?.substring(0, user.email.indexOf("@"))} 
          </span>
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            disabled={authProcessing} // Use destructured authProcessing
          >
            {authProcessing ? ( // Use destructured authProcessing
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
          <DialogContent className="sm:max-w-[425px]" aria-describedby="login-dialog-description">
            <DialogHeader>
              <DialogTitle>Login</DialogTitle>
              <DialogDescription id="login-dialog-description">
                Enter your email and password to access your account.
              </DialogDescription>
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
                  <p className="col-span-4 text-red-500 text-sm text-center">
                    {authError}
                  </p>
                )}
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={authProcessing}> 
                  {authProcessing ? ( 
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <LogIn className="mr-2 h-4 w-4" />
                  )}
                  Login
                </Button>
              </DialogFooter>
            </form>
            {/* Basic Sign Up link - can be expanded later */}
            <p className="text-center text-sm mt-4">
              Don't have an account?{" "}
              <Button
                variant="link"
                className="p-0 h-auto"
                onClick={() => alert("Sign up functionality to be implemented")}
              >
                Sign Up
              </Button>
            </p>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
