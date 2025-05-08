// A simple diagnostic function to test authentication
// Add this to frontend/src/lib/auth-test.ts

import { icApi } from './ic-api';
import { AuthClient } from '@dfinity/auth-client';

export async function testAuthentication() {
  try {
    console.log("Starting authentication test...");
    
    // Create a new AuthClient
    const authClient = await AuthClient.create();
    
    // Check if already authenticated
    if (await authClient.isAuthenticated()) {
      console.log("Already authenticated!");
      const identity = authClient.getIdentity();
      const principal = identity.getPrincipal();
      console.log("Principal:", principal.toString());
      
      // Update the identity in the API
      await icApi.updateIdentity(identity);
      return true;
    }
    
    console.log("Not authenticated, starting login process...");
    
    // Initiate login
    return new Promise<boolean>((resolve) => {
      authClient.login({
        identityProvider: process.env.NEXT_PUBLIC_INTERNET_IDENTITY_URL,
        onSuccess: async () => {
          console.log("Login successful!");
          const identity = authClient.getIdentity();
          const principal = identity.getPrincipal();
          console.log("Principal after login:", principal.toString());
          
          // Update the identity in the API
          await icApi.updateIdentity(identity);
          resolve(true);
        },
        onError: (error) => {
          console.error("Login failed:", error);
          resolve(false);
        }
      });
    });
  } catch (error) {
    console.error("Error in authentication test:", error);
    return false;
  }
}

export async function logout() {
  try {
    const authClient = await AuthClient.create();
    await authClient.logout();
    await icApi.updateIdentity(null);
    console.log("Logout successful");
    return true;
  } catch (error) {
    console.error("Error logging out:", error);
    return false;
  }
} 