import { SiteHeader } from "../../components/site-header"
import { TicketGallery } from "../../components/ticket-gallery"
import { MobileNavigation } from "../../components/mobile-navigation"

export default function TicketsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F0F1A] to-[#1A1A2C] text-[#E0E0FF]">
      <SiteHeader />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Tickets</h1>
        <TicketGallery />
      </main>
      <MobileNavigation />
    </div>
  )
}

