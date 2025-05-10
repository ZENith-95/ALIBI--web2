"use client"

import { useState, useEffect } from "react"
import { TicketCard } from "./ticket-card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs"
import { Skeleton } from "./ui/skeleton"
import { Button } from "./ui/button"
import { Ticket as TicketIcon } from "lucide-react" // Renamed to avoid conflict with Ticket type
import Link from "next/link"
import { getUserTickets } from "@/app/utils/pocketbase/ticket"; // PocketBase import with alias
import type { Ticket } from "@/app/types/data-types"; // Type import with alias
import useAuthStore from "@/app/hooks/useAuth"; // Use Zustand store with alias

// Map PocketBase ticket to frontend ticket display format
const mapTicketToDisplay = (ticket: Ticket) => { 
  // PocketBase metadata might be structured differently or need expansion
  // Assuming basic metadata stored directly for now
  const eventName = ticket.metadata?.event_name || ticket.metadata?.ticket_name || "Event Ticket"; 
  const eventDate = ticket.metadata?.event_date || ""; // Example field names
  const eventTime = ticket.metadata?.event_time || ""; // Example field names
  const eventLocation = ticket.metadata?.event_location || ""; // Example field names
  const qrHash = ticket.metadata?.qrHash || ticket.id; // Use ticket ID for QR if specific hash isn't stored

  return {
    id: ticket.id.toString(),
    eventId: ticket.event_id.toString(), // Assuming event_id is present
    eventName,
    eventDate,
    eventTime,
    eventLocation,
    imageUrl: ticket.metadata?.imageUrl || "/placeholder.svg?height=300&width=200&text=" + encodeURIComponent(eventName),
    status: ticket.is_used ? "used" : "active",
    qrHash,
    unlockables: { // This might need re-evaluation based on PocketBase data
      total: 3,
      unlocked: ticket.is_used ? 3 : 1,
    },
  };
};

export function TicketGallery() {
  const [tickets, setTickets] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { isAuthenticated, userId } = useAuthStore(); // Get auth state from store
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Define the async function to fetch tickets
    const fetchTickets = async () => {
      // Check if user is authenticated and userId is available
      if (!isAuthenticated || !userId) {
        setTickets([]); // Clear tickets if not authenticated
        setIsLoading(false);
        setError(null); // Clear any previous errors
        return; // Exit if not authenticated
      }

      setIsLoading(true);
      setError(null);
      try {
        // Fetch tickets using the PocketBase utility function
        const backendTickets = await getUserTickets(userId); 
        // Map the results to the display format
        const formattedTickets = backendTickets.map(mapTicketToDisplay);
        setTickets(formattedTickets);
      } catch (err) {
        console.error("Error fetching user tickets:", err);
        setTickets([]); // Clear tickets on error
        setError("Failed to load your tickets.");
      } finally {
        setIsLoading(false);
      }
    };

    // Call fetchTickets when the component mounts or auth state changes
    fetchTickets();

  }, [isAuthenticated, userId]); // Dependency array ensures effect runs when auth state changes

  const upcomingTickets = tickets.filter((ticket) => {
     try {
      // Combine date and a default time if time is missing/invalid for comparison
      const eventDateTime = new Date(`${ticket.eventDate}T${ticket.eventTime || '00:00:00'}`);
      // Get today's date at midnight for accurate comparison
      const today = new Date();
      today.setHours(0, 0, 0, 0); 
      return eventDateTime >= today;
    } catch (e) {
      console.warn("Error parsing ticket event date/time for filtering:", ticket.eventDate, ticket.eventTime, e);
      return false; // Treat invalid dates as not upcoming
    }
  });
  const pastTickets = tickets.filter((ticket) => {
     try {
      // Combine date and a default time if time is missing/invalid for comparison
      const eventDateTime = new Date(`${ticket.eventDate}T${ticket.eventTime || '00:00:00'}`);
      // Get today's date at midnight for accurate comparison
      const today = new Date();
      today.setHours(0, 0, 0, 0); 
      return eventDateTime < today;
    } catch (e) {
      console.warn("Error parsing ticket event date/time for filtering:", ticket.eventDate, ticket.eventTime, e);
      return false; // Treat invalid dates as not past
    }
  });

  // Show login prompt if not authenticated (and not loading)
  if (!isAuthenticated && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="bg-secondary/50 rounded-full p-6 mb-6">
          <TicketIcon className="h-12 w-12 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Login to View Your Tickets</h2>
        <p className="text-muted-foreground max-w-md mb-6">
          Please log in to see your tickets and manage your event RSVPs.
        </p>
        {/* The AuthButton in the header should handle login */}
      </div>
    );
  }

  // Show loading skeleton
  if (isLoading) {
    return (
      <div>
        <Tabs defaultValue="upcoming">
          <TabsList className="mb-6">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
          </TabsList>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(3)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="rounded-lg overflow-hidden border border-border">
                  <Skeleton className="h-64 w-full" />
                  <div className="p-4 space-y-3">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </div>
              ))}
          </div>
        </Tabs>
      </div>
    );
  }
  
  // Show error message
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <h2 className="text-2xl font-bold mb-2 text-destructive">{error}</h2>
        <p className="text-muted-foreground max-w-md mb-6">
          There was an issue loading your tickets. Please try again later.
        </p>
      </div>
    )
  }

  // Show "No Tickets" message if authenticated and no tickets found
  if (tickets.length === 0 && isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="bg-secondary/50 rounded-full p-6 mb-6">
          <TicketIcon className="h-12 w-12 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">No Tickets Found</h2>
        <p className="text-muted-foreground max-w-md mb-6">
          You haven't acquired any tickets yet. Browse upcoming events and get your first ticket.
        </p>
        <Button asChild>
          <Link href="/">Browse Events</Link>
        </Button>
      </div>
    );
  }

  // Display tickets if loaded and user is authenticated
  return (
    <div>
      <Tabs defaultValue="upcoming">
        <TabsList className="mb-6">
          <TabsTrigger value="upcoming">Upcoming ({upcomingTickets.length})</TabsTrigger>
          <TabsTrigger value="past">Past ({pastTickets.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          {upcomingTickets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingTickets.map((ticket) => (
                <TicketCard key={ticket.id} ticket={ticket} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium mb-2">No Upcoming Events</h3>
              <p className="text-muted-foreground mb-6">You don't have tickets for any upcoming events.</p>
              <Button asChild>
                <Link href="/">Browse Events</Link>
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="past">
          {pastTickets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastTickets.map((ticket) => (
                <TicketCard key={ticket.id} ticket={ticket} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium mb-2">No Past Events</h3>
              <p className="text-muted-foreground">You haven't attended any events yet.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
