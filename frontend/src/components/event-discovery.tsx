"use client"

import { useState, useEffect } from "react"
import { EventCard } from "../components/event-card"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Search, Filter } from "lucide-react"
import { Skeleton } from "./ui/skeleton"
import { icApi, type Event } from "../lib/ic-api"

export function EventDiscovery() {
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [artStyle, setArtStyle] = useState("all")

  useEffect(() => {
    // Fetch events from the IC backend
    const fetchEvents = async () => {
      setIsLoading(true)
      try {
        const fetchedEvents = await icApi.getAllEvents()
        setEvents(fetchedEvents)
      } catch (error) {
        console.error("Error fetching events:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchEvents()
  }, [])

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStyle = artStyle === "all" || event.artStyle.toLowerCase() === artStyle.toLowerCase()
    return matchesSearch && matchesStyle
  })

  return (
    <section id="upcoming-events" className="container mx-auto px-4 py-16">
      <h2 className="text-3xl font-bold mb-8">Upcoming Events</h2>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search events..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select value={artStyle} onValueChange={setArtStyle}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Art Style" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Styles</SelectItem>
              <SelectItem value="cyberpunk">Cyberpunk</SelectItem>
              <SelectItem value="vintage">Vintage</SelectItem>
              <SelectItem value="minimalist">Minimalist</SelectItem>
              <SelectItem value="abstract">Abstract</SelectItem>
              <SelectItem value="futuristic">Futuristic</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="rounded-lg overflow-hidden border border-border">
                <Skeleton className="h-48 w-full" />
                <div className="p-4 space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-10 w-full mt-4" />
                </div>
              </div>
            ))}
        </div>
      ) : (
        <>
          {filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <EventCard key={event.id.toString()} event={event} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium mb-2">No events found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filters</p>
            </div>
          )}
        </>
      )}
    </section>
  )
}

