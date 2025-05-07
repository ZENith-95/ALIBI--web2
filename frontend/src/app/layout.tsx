import "./fonts.css"; // Import the local fonts CSS
import type React from "react";
import "./globals.css";
import { ThemeProvider } from "../components/theme-provider";
import { Toaster } from "../components/ui/toaster";
import { WalletProvider } from "../components/wallet-provider";
import { authenticateWithII } from "../../auth";

export const metadata = {
  title: "Alibi - NFT Ticketing Platform",
  description: "AI-generated NFT ticketing platform for events",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Add a script to detect wallet extensions without modifying window.ethereum */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.hasIcWallets = false;
              try {
                window.hasIcWallets = !!(window.ic?.plug || window.ic?.internetIdentity);
              } catch (e) {
                console.error("Error checking for IC wallets:", e);
              }
            `,
          }}
        />
      </head>
      <body className={`font-sans`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <WalletProvider>
            {children}
            <Toaster />
          </WalletProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

