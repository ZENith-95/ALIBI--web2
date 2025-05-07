import { OrganizerDashboard } from "../../components/organizer/dashboard"
import { SiteHeader } from "../../components/site-header"

export default function OrganizerPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F0F1A] to-[#1A1A2C] text-[#E0E0FF]">
      <SiteHeader />
      <main className="container mx-auto px-4 py-8">
        <OrganizerDashboard />
      </main>
    </div>
  )
}

