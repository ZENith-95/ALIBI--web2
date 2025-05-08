import Link from "next/link"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { Calendar, Clock, MapPin, QrCode, Lock, Unlock } from "lucide-react"

interface TicketCardProps {
  ticket: {
    id: string
    eventId: string
    eventName: string
    eventDate: string
    eventTime: string
    eventLocation: string
    imageUrl: string
    status: "active" | "used" | "expired"
    unlockables: {
      total: number
      unlocked: number
    }
  }
}

export function TicketCard({ ticket }: TicketCardProps) {
  const isUpcoming = new Date(ticket.eventDate) >= new Date()

  return (
    <div className="rounded-lg overflow-hidden border border-border bg-card transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 group">
      <div className="relative">
        <img
          src={ticket.imageUrl || "/placeholder.svg?height=300&width=200&text=NFT+Ticket"}
          alt={ticket.eventName}
          className="w-full h-64 object-cover transition-transform group-hover:scale-105"
          crossOrigin="anonymous"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-60"></div>
        <Badge
          className="absolute top-3 right-3"
          variant={ticket.status === "active" ? "default" : ticket.status === "used" ? "secondary" : "destructive"}
        >
          {ticket.status === "active" ? "Active" : ticket.status === "used" ? "Used" : "Expired"}
        </Badge>
      </div>
      <div className="p-4">
        <h3 className="text-xl font-bold mb-2">{ticket.eventName}</h3>
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="mr-2 h-4 w-4 text-primary" />
            <span>{ticket.eventDate}</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="mr-2 h-4 w-4 text-primary" />
            <span>{ticket.eventTime}</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="mr-2 h-4 w-4 text-primary" />
            <span>{ticket.eventLocation}</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            {ticket.unlockables.unlocked < ticket.unlockables.total ? (
              <Lock className="mr-2 h-4 w-4 text-primary" />
            ) : (
              <Unlock className="mr-2 h-4 w-4 text-primary" />
            )}
            <span>
              {ticket.unlockables.unlocked} / {ticket.unlockables.total} Unlockables
            </span>
          </div>
        </div>
        <div className="flex justify-between items-center">
          {isUpcoming ? (
            <Button asChild className="w-full">
              <Link href={`/tickets/${ticket.id}`}>
                <QrCode className="mr-2 h-4 w-4" />
                Show Ticket
              </Link>
            </Button>
          ) : (
            <Button asChild variant="outline" className="w-full">
              <Link href={`/tickets/${ticket.id}`}>View Details</Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

