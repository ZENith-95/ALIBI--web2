import { AuthClient } from "@dfinity/auth-client";

export async function authenticateWithII(): Promise<string | null> {
  const authClient = await AuthClient.create();
  if (await authClient.isAuthenticated()) {
    return authClient.getIdentity().getPrincipal().toText();
  }

  await authClient.login({
    identityProvider: "https://identity.ic0.app",
    onSuccess: () => {
      console.log("Authenticated successfully!");
    },
  });

  return authClient.getIdentity().getPrincipal().toText();
}