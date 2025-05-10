import { EventDiscovery } from "./components/event-discovery";
import { HeroSection } from "./components/hero-section";
import { MobileNavigation } from "./components/mobile-navigation";
import { SiteHeader } from "./components/site-header";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-grow">
        <HeroSection />
        <EventDiscovery /> 
      </main>
      <MobileNavigation /> 
    </div>
  );
}
