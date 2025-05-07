"use client"

import { useState, useEffect } from "react"
import { Button } from "../ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs"
import { Calendar, Plus, Ticket, Users, TrendingUp, QrCode } from "lucide-react"
import { Progress } from "../ui/progress"
import { Skeleton } from "../ui/skeleton"
import Link from "next/link"
import { EventList } from "../organizer/event-list"
import { EventAnalytics } from "../organizer/event-analytics"
import { icApi } from "../../lib/ic-api"

// Map backend event to frontend event display format
const mapEventToDisplay = (event: any) => {
  const totalCapacity = event.ticketTypes.reduce(
    (sum: number, tt: any) => sum + Number(tt.capacity), 
    0
  );
  
  const ticketsSold = event.ticketTypes.reduce(
    (sum: number, tt: any) => sum + Number(tt.sold), 
    0
  );
  
  return {
    id: event.id.toString(),
    name: event.name,
    date: event.date,
    time: event.time,
    location: event.location,
    capacity: totalCapacity,
    ticketsSold: ticketsSold,
    imageUrl: event.imageUrl || `/placeholder.svg?height=400&width=800&text=${encodeURIComponent(event.name)}`,
    artStyle: event.artStyle,
  };
};

export function OrganizerDashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const [events, setEvents] = useState<any[]>([])

  useEffect(() => {
    // Fetch events from the canister
    const fetchEvents = async () => {
      setIsLoading(true)
      
      try {
        const backendEvents = await icApi.getOrganizerEvents();
        const formattedEvents = backendEvents.map(mapEventToDisplay);
        setEvents(formattedEvents);
      } catch (error) {
        console.error("Error fetching events:", error);
        setEvents([]);
      }
      
      setIsLoading(false);
    }

    fetchEvents()
  }, [])

  // Calculate dashboard stats
  const totalTicketsSold = events.reduce((sum, event) => sum + event.ticketsSold, 0)
  const totalCapacity = events.reduce((sum, event) => sum + event.capacity, 0)
  const percentageSold = totalCapacity > 0 ? Math.round((totalTicketsSold / totalCapacity) * 100) : 0
  const activeEvents = events.filter((event) => new Date(event.date) >= new Date()).length

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
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Attendees</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-primary mr-2" />
                  <span className="text-2xl font-bold">{totalTicketsSold}</span>
                </div>
                <div className="flex items-center mt-2 text-sm text-muted-foreground">
                  <QrCode className="h-4 w-4 mr-1" />
                  <span>0 checked in</span>
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

