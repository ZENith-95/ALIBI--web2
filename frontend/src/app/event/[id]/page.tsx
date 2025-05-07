import { EventDetails } from "../../../components/event-details"
import { SiteHeader } from "../../../components/site-header"
import { MobileNavigation } from "../../../components/mobile-navigation"

export async function generateStaticParams() {
  // Replace this with your actual data fetching logic
  const events = await fetchEventsFromDatabase(); // Example: Fetch events from your database
  return events.map((event) => ({
    id: event.id.toString(), // The 'id' parameter must be a string
  }));
}

// Example function to fetch events (replace with your actual implementation)
async function fetchEventsFromDatabase() {
  // This is a placeholder - replace with your actual data fetching
  return [
    { id: 1, name: "Event 1" },
    { id: 2, name: "Event 2" },
    { id: 3, name: "Event 3" },
  ];
}

export default function EventPage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F0F1A] to-[#1A1A2C] text-[#E0E0FF]">
      <SiteHeader />
      <main className="container mx-auto px-4 py-8">
        <EventDetails eventId={params.id} />
      </main>
      <MobileNavigation />
    </div>
  )
}

