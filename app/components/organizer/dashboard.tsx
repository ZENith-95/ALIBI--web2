"use client"

import { useState, useEffect } from "react"
import { Button } from "../ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs"
import { Calendar, Plus, Ticket, Users, TrendingUp, QrCode } from "lucide-react"
import { Progress } from "../ui/progress"
import { Skeleton } from "../ui/skeleton"
import Link from "next/link"
import { EventList } from "./event-list"
import { EventAnalytics } from "./event-analytics"
import type { Event as OrganizerEventType } from "../../types/data-types"; // Type import
import useAuthStore from "../../hooks/useAuth";
import useEventStore from "../../hooks/useEvents"; // Import the event store

// Map PocketBase event to frontend event display format
const mapEventToDisplay = (event: OrganizerEventType) => {
  // totalCapacity and ticketsSold are already calculated in the enrichEventWithTicketData helper
  // in app/utils/pocketbase/events.ts
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
  const { isAuthenticated, userId } = useAuthStore();
  const { events: rawEvents, loading, error, fetchOrganizerEvents } = useEventStore();
  
  // Local state for mapped events, if mapping is complex or needs to be memoized
  const [displayedEvents, setDisplayedEvents] = useState<any[]>([]);

  useEffect(() => {
    if (isAuthenticated && userId) {
      fetchOrganizerEvents(userId);
    } else {
      // Clear events if user logs out or is not authenticated
      setDisplayedEvents([]); 
    }
  }, [isAuthenticated, userId, fetchOrganizerEvents]);

  useEffect(() => {
    // Map events whenever rawEvents from the store changes
    if (rawEvents) {
      setDisplayedEvents(rawEvents.map(mapEventToDisplay));
    }
  }, [rawEvents]);

  // Calculate dashboard stats from displayedEvents
  const totalTicketsSold = displayedEvents.reduce((sum, event) => sum + (event.ticketsSold || 0), 0);
  const totalCapacity = displayedEvents.reduce((sum, event) => sum + (event.capacity || 0), 0);
  const percentageSold = totalCapacity > 0 ? Math.round((totalTicketsSold / totalCapacity) * 100) : 0;
  const activeEvents = displayedEvents.filter((event) => {
    try {
      const eventDateTime = new Date(`${event.date}T${event.time || '00:00:00'}`);
      const today = new Date();
      today.setHours(0, 0, 0, 0); 
      return eventDateTime >= today;
    } catch (e) {
      console.warn("Error parsing event date/time for filtering:", event.date, event.time, e);
      return false;
    }
  }).length;

  if (!isAuthenticated && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <h2 className="text-2xl font-bold mb-2">Login Required</h2>
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

      {loading ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {Array(3).fill(0).map((_, i) => (<Skeleton key={i} className="h-32 rounded-lg" />))}
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
                    {totalTicketsSold} / {totalCapacity > 0 ? totalCapacity : 'N/A'}
                  </span>
                </div>
                {totalCapacity > 0 && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1 text-xs">
                      <span>Overall Capacity</span>
                      <span>{percentageSold}%</span>
                    </div>
                    <Progress value={percentageSold} className="h-1.5" />
                  </div>
                )}
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
                  <span>{displayedEvents.length - activeEvents} past events</span>
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
              {displayedEvents.length > 0 ? (
                 <EventList events={displayedEvents} />
              ) : (
                 <div className="text-center py-12">
                    <h3 className="text-xl font-medium mb-2">No Events Found</h3>
                    <p className="text-muted-foreground">You haven't created any events yet.</p>
                    <Button asChild className="mt-4">
                       <Link href="/organizer/create">Create Your First Event</Link>
                    </Button>
                 </div>
              )}
            </TabsContent>
            <TabsContent value="analytics">
              {displayedEvents.length > 0 ? (
                 <EventAnalytics events={displayedEvents} />
              ) : (
                 <div className="text-center py-12">
                    <h3 className="text-xl font-medium mb-2">No Analytics Available</h3>
                    <p className="text-muted-foreground">Create events and sell tickets to see analytics.</p>
                 </div>
              )}
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}
