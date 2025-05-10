"use client"; 

import { EventDetails } from "../../components/event-details";
import { SiteHeader } from "../../components/site-header";
import { MobileNavigation } from "../../components/mobile-navigation";
import { useParams } from 'next/navigation'; // Import useParams

// Removed generateStaticParams and fetchEventsFromDatabase as this is a Client Component

// Props type is no longer needed as params are accessed via hook
// type Props = {
//   params: { id: string };
// };

export default function EventPage() { // Remove params from props
  const params = useParams<{ id: string }>(); // Use hook to get params

  if (!params || !params.id) {
    // Handle case where params or id might not be available, though Next.js usually ensures this for dynamic routes
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0F0F1A] to-[#1A1A2C] text-[#E0E0FF] flex items-center justify-center">
        <p>Loading event...</p> {/* Or some error/loading state */}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F0F1A] to-[#1A1A2C] text-[#E0E0FF]">
      <SiteHeader />
      <main className="container mx-auto px-4 py-8">
        <EventDetails eventId={params.id} />
      </main>
      <MobileNavigation />
    </div>
  );
}
