"use client"

import { useState, useEffect } from "react"
import { TicketCard } from "./ticket-card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs"
import { Skeleton } from "./ui/skeleton"
import { Button } from "./ui/button"
import { Ticket as TicketIcon } from "lucide-react" // Renamed to avoid conflict with Ticket type
import Link from "next/link"
import { supabaseApi, Ticket } from "../lib/supabaseApi"; // Assuming supabaseApi.ts now exports supabaseApi and types
import { getCurrentUser, onAuthStateChange } from "../../auth";
import { User, Session } from "@supabase/supabase-js";

// Map Supabase ticket to frontend ticket display format
const mapTicketToDisplay = (ticket: Ticket) => {
  // Metadata structure might differ with Supabase, adjust as needed
  const eventName = ticket.metadata?.name || "Event Ticket";
  const eventDate = ticket.metadata?.attributes?.find(
    (attr: {trait_type: string, value: string}) => attr.trait_type === "Date"
  )?.value || "";
  const eventTime = ticket.metadata?.attributes?.find(
    (attr: {trait_type: string, value: string}) => attr.trait_type === "Time"
  )?.value || "";
  const eventLocation = ticket.metadata?.attributes?.find(
    (attr: {trait_type: string, value: string}) => attr.trait_type === "Location"
  )?.value || "";
  const qrHash = ticket.metadata?.qrHash || ""; // Assuming qrHash might be part of metadata

  return {
    id: ticket.id.toString(),
    eventId: ticket.event_id.toString(),
    eventName,
    eventDate,
    eventTime,
    eventLocation,
    imageUrl: ticket.metadata?.imageUrl || "/placeholder.svg?height=300&width=200&text=" + encodeURIComponent(eventName),
    status: ticket.is_used ? "used" : "active",
    qrHash,
    unlockables: { // This might need to be re-evaluated based on Supabase data
      total: 3,
      unlocked: ticket.is_used ? 3 : 1,
    },
  };
};

export function TicketGallery() {
  const [tickets, setTickets] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkUserAndFetchTickets = async () => {
      setIsLoading(true);
      const user = await getCurrentUser();
      setCurrentUser(user);

      if (user) {
        try {
          const backendTickets = await supabaseApi.getUserTickets(user.id);
          const formattedTickets = backendTickets.map(mapTicketToDisplay);
          setTickets(formattedTickets);
          setError(null);
        } catch (err) {
          console.error("Error fetching tickets:", err);
          setTickets([]);
          setError("Failed to load tickets.");
        }
      } else {
        setTickets([]); // No user, no tickets
      }
      setIsLoading(false);
    };

    checkUserAndFetchTickets();

    const authListener = onAuthStateChange(async (event: string, session: Session | null) => {
      const user = session?.user ?? null;
      setCurrentUser(user);
      if (user) {
        setIsLoading(true);
        try {
          const backendTickets = await supabaseApi.getUserTickets(user.id);
          const formattedTickets = backendTickets.map(mapTicketToDisplay);
          setTickets(formattedTickets);
          setError(null);
        } catch (err) {
          console.error("Error fetching tickets on auth change:", err);
          setTickets([]);
          setError("Failed to load tickets.");
        }
        setIsLoading(false);
      } else {
        setTickets([]);
      }
    });

    return () => {
      authListener.subscription?.unsubscribe();
    };
  }, []);

  const upcomingTickets = tickets.filter((ticket) => {
    const eventDateTime = new Date(`${ticket.eventDate} ${ticket.eventTime || '00:00:00'}`);
    return eventDateTime >= new Date();
  });
  const pastTickets = tickets.filter((ticket) => {
    const eventDateTime = new Date(`${ticket.eventDate} ${ticket.eventTime || '00:00:00'}`);
    return eventDateTime < new Date();
  });

  if (!currentUser && !isLoading) {
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

  if (tickets.length === 0 && currentUser) {
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
