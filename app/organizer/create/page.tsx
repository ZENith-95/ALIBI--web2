import { EventCreationForm } from "../../components/organizer/event-creation-form" // Corrected path
import { SiteHeader } from "../../components/site-header" // Corrected path
// EnvChecker import removed

export default function CreateEventPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F0F1A] to-[#1A1A2C] text-[#E0E0FF]">
      <SiteHeader />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Create New Event</h1>
        
        {/* EnvChecker component removed */}
        
        <EventCreationForm />
      </main>
    </div>
  )
}
