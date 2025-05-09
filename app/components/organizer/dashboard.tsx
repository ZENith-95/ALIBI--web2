"use client"

import { useState, useEffect } from "react"
import { Button } from "../ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs"
import { Calendar, Plus, Ticket, Users, TrendingUp, QrCode } from "lucide-react"
import { Progress } from "../ui/progress"
import { Skeleton } from "../ui/skeleton"
import Link from "next/link"
import { EventList } from "./event-list" // Adjusted path
import { EventAnalytics } from "./event-analytics" // Adjusted path
import { User } from "@/app/types/data-types"
import useAuthStore from "@/app/hooks/useAuth"
import useEventStore from "@/app/hooks/useEvents"

// Map Supabase event to frontend event display format
const mapEventToDisplay = (event: OrganizerEvent) => {
  // totalCapacity and ticketsSold are already calculated in supabaseApi.mapSupabaseEventToFrontend
  return {
    id: event.id.toString(),
    name: event.name,
    date: event.date,
    time: event.time,
    location: event.location,
    capacity: event.totalCapacity,
    ticketsSold: event.ticketsSold,
    imageUrl: event.image_url || `/placeholder.svg?height=400&width=800&text=${encodeURIComponent(event.name)}`,
    artStyle: event.art_style,
  };
};

export function OrganizerDashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const authState = useAuthStore();
  const eventsState = useEventStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkUserAndFetchEvents = async () => {
      setIsLoading(true);
      const user = authState.user

      if (user) {
        try {
          const backendEvents = await eventsState.fetchEvents(user.id);
        } catch (err) {
          console.error("Error fetching events:", err);
          setEvents([]);
          setError("Failed to load events.");
        }
      } else {
        setEvents([]); // No user, no events
      }
      setIsLoading(false);
    };

    checkUserAndFetchEvents();

    const authListener = onAuthStateChange(async (event: string, session: Session | null) => {
      const user = session?.user ?? null;
      setCurrentUser(user);
      if (user) {
        setIsLoading(true);
        try {
          const backendEvents = await supabaseApi.getOrganizerEvents(user.id);
          const formattedEvents = backendEvents.map(mapEventToDisplay);
          setEvents(formattedEvents);
          setError(null);
        } catch (err) {
          console.error("Error fetching events on auth change:", err);
          setEvents([]);
          setError("Failed to load events.");
        }
        setIsLoading(false);
      } else {
        setEvents([]);
      }
    });

    return () => {
      authListener.subscription?.unsubscribe();
    };
  }, []);

  // Calculate dashboard stats
  const totalTicketsSold = events.reduce((sum, event) => sum + event.ticketsSold, 0)
  const totalCapacity = events.reduce((sum, event) => sum + event.capacity, 0)
  const percentageSold = totalCapacity > 0 ? Math.round((totalTicketsSold / totalCapacity) * 100) : 0
  const activeEvents = events.filter((event) => {
    const eventDate = new Date(event.date);
    // Consider time as well if available, for now just date
    return eventDate >= new Date(new Date().toDateString()); // Compare date part only
  }).length;


  if (!currentUser && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <h2 className="text-2xl font-bold mb-2">Login to View Dashboard</h2>
        <p className="text-muted-foreground max-w-md mb-6">
          Please log in to access the organizer dashboard.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Organizer Dashboard</h1>
        <Button asChild>
          <Link href="/organizer/create">
            <Plus className="mr-2 h-4 w-4" />
            Create Event
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {Array(3)
              .fill(0)
              .map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-lg" />
              ))}
          </div>
          <Skeleton className="h-[500px] rounded-lg" />
        </>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <h2 className="text-2xl font-bold mb-2 text-destructive">{error}</h2>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Tickets Sold</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Ticket className="h-5 w-5 text-primary mr-2" />
                  <span className="text-2xl font-bold">
                    {totalTicketsSold} / {totalCapacity}
                  </span>
                </div>
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1 text-xs">
                    <span>Overall Capacity</span>
                    <span>{percentageSold}%</span>
                  </div>
                  <Progress value={percentageSold} className="h-1.5" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-primary mr-2" />
                  <span className="text-2xl font-bold">{activeEvents}</span>
                </div>
                <div className="flex items-center mt-2 text-sm text-muted-foreground">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  <span>{events.length - activeEvents} past events</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Attendees (Sold)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-primary mr-2" />
                  <span className="text-2xl font-bold">{totalTicketsSold}</span>
                </div>
                <div className="flex items-center mt-2 text-sm text-muted-foreground">
                  <QrCode className="h-4 w-4 mr-1" />
                  <span>0 checked in (feature TBD)</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="events">
            <TabsList className="mb-6">
              <TabsTrigger value="events">My Events</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="events">
              <EventList events={events} />
            </TabsContent>

            <TabsContent value="analytics">
              <EventAnalytics events={events} />
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}
