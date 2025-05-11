import { EventDiscovery } from "./components/event-discovery";
import { HeroSection } from "./components/hero-section";
// MobileNavigation import removed
// SiteHeader import removed from here

export default function Home() {
  return (
    // The main div structure might also be redundant if layout.tsx handles it.
    // For now, just removing SiteHeader. The MobileNavigation might also be duplicated.
    // The div with min-h-screen is likely handled by layout.tsx's div.
    // Let's simplify to just the main content for the page.
    <main className="flex-grow"> {/* SiteHeader removed, div wrapper might be redundant */}
      <HeroSection />
      <EventDiscovery /> 
    </main>
    // MobileNavigation is also in layout.tsx, so it's duplicated too.
    // Removing it from here.
  );
}
