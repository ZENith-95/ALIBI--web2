"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  Calendar,
  Clock,
  MapPin,
  Ticket,
  Users,
  Loader2,
  AlertCircle,
} from "lucide-react";
import Image from "next/image";
import { Skeleton } from "./ui/skeleton";
import { getEventById } from "@/app/utils/pocketbase/events"; // PocketBase import with alias
import { mintTicket } from "@/app/utils/pocketbase/ticket"; // PocketBase import with alias
import type { Event, MintTicketRequest, TicketType } from "@/app/types/data-types"; // Type imports with alias
import { toast } from "./ui/use-toast";
import useAuthStore from "@/app/hooks/useAuth"; // Use Zustand store for auth state with alias

export function EventDetails({ eventId }: { eventId: string }) {
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMinting, setIsMinting] = useState<string | null>(null); // Store ticketTypeId being minted
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, userId } = useAuthStore(); // Get userId from store

  useEffect(() => {
    const fetchEvent = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const fetchedEvent = await getEventById(eventId); // Use PocketBase function
        if (fetchedEvent) {
          setEvent(fetchedEvent);
        } else {
          setError("Event not found.");
        }
      } catch (err) {
        console.error("Error fetching event:", err);
        setError("Failed to load event details.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  const handleMintTicket = async (ticketType: TicketType) => {
    if (!isAuthenticated || !userId) { // Check auth state and userId from store
      toast({
        title: "Authentication Required",
        description: "Please log in to get tickets.", // Consider triggering login modal
        variant: "destructive",
      });
      return;
    }

    if (!event) return;

    setIsMinting(ticketType.id); // Set the ID of the ticket type being minted
    try {
      const request: MintTicketRequest = {
        event_id: event.id, // Use string ID
        ticket_type_id: ticketType.id, // Use string ID
      };

      // Call PocketBase mint function, passing userId
      const newTicketId = await mintTicket(request, userId); 

      toast({
        title: "Ticket Acquired!",
        description: `Successfully acquired ticket: ${ticketType.name}. Ticket ID: ${newTicketId}`,
      });

      // Refetch event data to update sold counts
      const updatedEvent = await getEventById(eventId);
      setEvent(updatedEvent);
    } catch (err: any) {
      // Catch specific errors if needed
      console.error("Error minting ticket:", err);
      toast({
        title: "Error Acquiring Ticket",
        description: err.message || "An unexpected error occurred.", // Display error message from utility
        variant: "destructive",
      });
    } finally {
      setIsMinting(null); // Reset minting state
    }
  };

  if (isLoading) {
    return <EventDetailsSkeleton />;
  }

  if (error) {
    return (
      <div className="container mx-auto py-12 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
        <h2 className="text-2xl font-bold text-destructive mb-2">{error}</h2>
        <p className="text-muted-foreground">
          Please check the event ID or try again later.
        </p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto py-12 text-center">
        Event data could not be loaded.
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 md:py-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Image */}
        <div className="md:col-span-1">
          <Image
            src={
              event.image_url ||
              `/placeholder.svg?height=400&width=400&text=${encodeURIComponent(event.name)}`
            }
            alt={event.name}
            width={400}
            height={400}
            className="rounded-lg object-cover w-full aspect-square border border-border"
          />
        </div>

        {/* Right Column: Details & Tickets */}
        <div className="md:col-span-2 space-y-6">
          <h1 className="text-3xl md:text-4xl font-bold">{event.name}</h1>

          <div className="flex flex-wrap gap-x-6 gap-y-2 text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{event.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{event.time}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>{event.location}</span>
            </div>
          </div>

          <p className="text-foreground/80">{event.description}</p>

          {/* Ticket Types Section */}
          <Card>
            <CardHeader>
              <CardTitle>Get Tickets</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {event.ticketTypes.length > 0 ? (
                event.ticketTypes.map((ticketType) => (
                  <div
                    key={ticketType.id}
                    className="flex items-center justify-between p-4 border border-border rounded-md bg-background hover:bg-accent/50 transition-colors"
                  >
                    <div>
                      <h3 className="font-semibold">{ticketType.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {ticketType.description || "Standard ticket"}
                      </p>
                      <p className="text-sm font-medium mt-1">
                        Price:{" "}
                        {ticketType.price > 0
                          ? `${ticketType.price.toFixed(2)} Units`
                          : "Free"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {ticketType.capacity - ticketType.sold} /{" "}
                        {ticketType.capacity} available
                      </p>
                    </div>
                    <Button
                      onClick={() => handleMintTicket(ticketType)}
                      disabled={
                        isMinting === ticketType.id ||
                        ticketType.sold >= ticketType.capacity
                      }
                      size="sm"
                    >
                      {isMinting === ticketType.id ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Ticket className="mr-2 h-4 w-4" />
                      )}
                      {ticketType.sold >= ticketType.capacity
                        ? "Sold Out"
                        : "Get Ticket"}
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">
                  No ticket types available for this event.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Skeleton component for loading state
function EventDetailsSkeleton() {
  return (
    <div className="container mx-auto py-8 md:py-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <Skeleton className="rounded-lg w-full aspect-square" />
        </div>
        <div className="md:col-span-2 space-y-6">
          <Skeleton className="h-10 w-3/4" />
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-32" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-1/4" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-20 w-full rounded-md" />
              <Skeleton className="h-20 w-full rounded-md" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
