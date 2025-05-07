import { EventDiscovery } from "../components/event-discovery"
import { HeroSection } from "../components/hero-section"
import { MobileNavigation } from "../components/mobile-navigation"
import { SiteHeader } from "../components/site-header"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F0F1A] to-[#1A1A2C] text-[#E0E0FF]">
      <SiteHeader />
      <main>
        <HeroSection />
        <EventDiscovery />
      </main>
      <MobileNavigation />
    </div>
  )
}

