import Link from "next/link"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { Calendar, Clock, MapPin, Users } from "lucide-react"
import type { Event } from "../lib/ic-api"

interface EventCardProps {
  event: Event
}

export function EventCard({ event }: EventCardProps) {
  const percentageSold = Math.round((Number(event.ticketsSold) / Number(event.totalCapacity)) * 100)
  const isAlmostSoldOut = percentageSold >= 80

  return (
    <div className="rounded-lg overflow-hidden border border-border bg-card transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
      <div className="relative">
        <img
          src={event.imageUrl || "/placeholder.svg?height=200&width=400&text=Event+Image"}
          alt={event.name}
          className="w-full h-48 object-cover"
          crossOrigin="anonymous"
        />
        <Badge className="absolute top-3 right-3" variant={isAlmostSoldOut ? "destructive" : "secondary"}>
          {isAlmostSoldOut ? "Almost Sold Out" : `${percentageSold}% Filled`}
        </Badge>
        <Badge className="absolute top-3 left-3 bg-primary/20 text-primary border-primary/30">{event.artStyle}</Badge>
      </div>
      <div className="p-4">
        <h3 className="text-xl font-bold mb-2">{event.name}</h3>
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="mr-2 h-4 w-4 text-primary" />
            <span>{event.date}</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="mr-2 h-4 w-4 text-primary" />
            <span>{event.time}</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="mr-2 h-4 w-4 text-primary" />
            <span>{event.location}</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Users className="mr-2 h-4 w-4 text-primary" />
            <span>
              {event.ticketsSold.toString()} / {event.totalCapacity.toString()} Attendees
            </span>
          </div>
        </div>
        <Button asChild className="w-full">
          <Link href={`/event/${event.id}`}>RSVP Now</Link>
        </Button>
      </div>
    </div>
  )
}

