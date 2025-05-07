import { Card, CardContent } from "../ui/card"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { Progress } from "../ui/progress"
import { Calendar, Clock, MapPin, Users, QrCode, MoreHorizontal, Edit, Trash } from "lucide-react"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"

interface EventListProps {
  events: any[]
}

export function EventList({ events }: EventListProps) {
  const activeEvents = events.filter((event) => new Date(event.date) >= new Date())
  const pastEvents = events.filter((event) => new Date(event.date) < new Date())

  if (events.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium mb-2">No Events Created</h3>
          <p className="text-muted-foreground max-w-md mb-6">
            You haven't created any events yet. Create your first event to start selling tickets.
          </p>
          <Button asChild>
            <Link href="/organizer/create">Create Your First Event</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold mb-4">Active Events</h2>
        {activeEvents.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {activeEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-6 text-center">
              <p className="text-muted-foreground">No active events. Create a new event to get started.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {pastEvents.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4">Past Events</h2>
          <div className="grid grid-cols-1 gap-4">
            {pastEvents.map((event) => (
              <EventCard key={event.id} event={event} isCompleted />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function EventCard({ event, isCompleted = false }: { event: any; isCompleted?: boolean }) {
  const percentageSold = Math.round((event.ticketsSold / event.capacity) * 100)

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col md:flex-row">
        <div className="w-full md:w-1/4 h-40 md:h-auto">
          <img
            src={event.imageUrl || "/placeholder.svg?height=200&width=200&text=Event+Image"}
            alt={event.name}
            className="w-full h-full object-cover"
            crossOrigin="anonymous"
          />
        </div>
        <div className="flex-1 p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <h3 className="text-xl font-bold mr-3">{event.name}</h3>
              <Badge variant={isCompleted ? "secondary" : "default"}>{isCompleted ? "Completed" : "Active"}</Badge>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Event
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <QrCode className="mr-2 h-4 w-4" />
                  Scan Tickets
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">
                  <Trash className="mr-2 h-4 w-4" />
                  Delete Event
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
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
                {event.ticketsSold} / {event.capacity} Attendees
              </span>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-1 text-xs">
              <span>Ticket Sales</span>
              <span>{percentageSold}%</span>
            </div>
            <Progress value={percentageSold} className="h-1.5" />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm" variant={isCompleted ? "outline" : "default"}>
              <Link href={`/organizer/event/${event.id}`}>{isCompleted ? "View Summary" : "Manage Event"}</Link>
            </Button>
            {!isCompleted && (
              <Button asChild size="sm" variant="outline">
                <Link href={`/scan`}>
                  <QrCode className="mr-2 h-4 w-4" />
                  Scan Tickets
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}

