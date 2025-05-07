"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { Calendar, MapPin, Users, Ticket, ArrowLeft, Share, Info, Loader2 } from "lucide-react"
import { Skeleton } from "./ui/skeleton"
import { Separator } from "./ui/separator"
import { useWallet } from "./wallet-provider"
import { toast } from "./ui/use-toast"
import Link from "next/link"
import { TicketMintingDialog } from "./ticket-minting-dialog"
import { icApi, type Event, type MintTicketRequest } from "../lib/ic-api"

interface EventDetailsProps {
  eventId: string
}

export function EventDetails({ eventId }: EventDetailsProps) {
  const [event, setEvent] = useState<Event | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isMintingDialogOpen, setIsMintingDialogOpen] = useState(false)
  const [selectedTicketType, setSelectedTicketType] = useState<bigint | null>(null)
  const { isConnected, address } = useWallet()
  const [isRsvpLoading, setIsRsvpLoading] = useState(false)

  useEffect(() => {
    // Fetch event details from the IC backend
    const fetchEvent = async () => {
      try {
        setIsLoading(true)
        const fetchedEvent = await icApi.getEvent(BigInt(eventId))
        setEvent(fetchedEvent)

        // Set default ticket type (usually the first one)
        if (fetchedEvent && fetchedEvent.ticketTypes.length > 0) {
          setSelectedTicketType(fetchedEvent.ticketTypes[0].id)
        }
      } catch (error) {
        console.error("Error fetching event:", error)
        toast({
          title: "Error",
          description: "Failed to load event details. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (eventId) {
      fetchEvent()
    }
  }, [eventId])

  const handleRSVP = useCallback(async () => {
    try {
      setIsRsvpLoading(true)

      if (!isConnected) {
        toast({
          title: "Wallet not connected",
          description: "Please connect your wallet to RSVP for this event.",
          variant: "destructive",
        })
        return
      }

      if (!event || !selectedTicketType) {
        toast({
          title: "Error",
          description: "Please select a ticket type.",
          variant: "destructive",
        })
        return
      }

      // Open the minting dialog
      setIsMintingDialogOpen(true)
    } catch (error) {
      console.error("RSVP error:", error)
      toast({
        title: "RSVP Failed",
        description: "There was an error processing your RSVP. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsRsvpLoading(false)
    }
  }, [isConnected, event, selectedTicketType])

  const handleMintTicket = useCallback(async () => {
    if (!event || !selectedTicketType) return null

    try {
      console.log("Starting mint with:", {
        eventId: event.id,
        ticketTypeId: selectedTicketType
      });
      
      const result = await icApi.mintTicket({
        eventId: event.id,
        ticketTypeId: selectedTicketType
      });

      if ("ok" in result) {
        console.log("Minting successful:", result.ok);
        return result.ok
      } else {
        // Map error to a more descriptive message
        let errorMessage = "Failed to mint ticket";
        if ("NotAuthorized" in result.err) {
          errorMessage = "You are not authorized to mint tickets. Please log in.";
        } else if ("NotFound" in result.err) {
          errorMessage = "Event or ticket type not found.";
        } else if ("SoldOut" in result.err) {
          errorMessage = "This ticket type is sold out.";
        } else if ("CannotModify" in result.err) {
          errorMessage = "Event is not active.";
        } else if ("SystemError" in result.err) {
          errorMessage = "A system error occurred. Please try again later.";
        }
        console.error("Mint error response:", result.err);
        throw new Error(errorMessage)
      }
    } catch (error) {
      console.error("Error minting ticket:", error)
      throw error
    }
  }, [event, selectedTicketType])

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-[400px] w-full rounded-lg mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Skeleton className="h-24 rounded-lg" />
          <Skeleton className="h-24 rounded-lg" />
          <Skeleton className="h-24 rounded-lg" />
        </div>
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>
    )
  }

  if (!event) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Event Not Found</h2>
        <p className="text-muted-foreground mb-6">The event you're looking for doesn't exist or has been removed.</p>
        <Button asChild>
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Events
          </Link>
        </Button>
      </div>
    )
  }

  const percentageSold = Math.round((Number(event.ticketsSold) / Number(event.totalCapacity)) * 100)
  const isAlmostSoldOut = percentageSold >= 80
  const isSoldOut = Number(event.ticketsSold) >= Number(event.totalCapacity)

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Button variant="outline" size="sm" asChild>
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Events
          </Link>
        </Button>
        <Button variant="outline" size="sm">
          <Share className="mr-2 h-4 w-4" />
          Share Event
        </Button>
      </div>

      <div className="rounded-lg overflow-hidden border border-border mb-8">
        <div className="relative">
          <img
            src={event.imageUrl || "/placeholder.svg?height=400&width=800&text=Event+Image"}
            alt={event.name}
            className="w-full h-[400px] object-cover"
            crossOrigin="anonymous"
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-background to-transparent"
            style={{ height: "50%" }}
          ></div>
          <div className="absolute bottom-6 left-6 right-6">
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge variant="secondary">{event.artStyle}</Badge>
              <Badge variant={isAlmostSoldOut ? "destructive" : "secondary"}>
                {isSoldOut ? "Sold Out" : isAlmostSoldOut ? "Almost Sold Out" : `${percentageSold}% Filled`}
              </Badge>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold">{event.name}</h1>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-card rounded-lg p-4 border border-border">
          <div className="flex items-center mb-2">
            <Calendar className="mr-2 h-5 w-5 text-primary" />
            <h3 className="font-medium">Date & Time</h3>
          </div>
          <p className="text-muted-foreground">{event.date}</p>
          <p className="text-muted-foreground">{event.time}</p>
        </div>
        <div className="bg-card rounded-lg p-4 border border-border">
          <div className="flex items-center mb-2">
            <MapPin className="mr-2 h-5 w-5 text-primary" />
            <h3 className="font-medium">Location</h3>
          </div>
          <p className="text-muted-foreground">{event.location}</p>
        </div>
        <div className="bg-card rounded-lg p-4 border border-border">
          <div className="flex items-center mb-2">
            <Users className="mr-2 h-5 w-5 text-primary" />
            <h3 className="font-medium">Capacity</h3>
          </div>
          <p className="text-muted-foreground">
            {event.ticketsSold.toString()} / {event.totalCapacity.toString()} Attendees
          </p>
          <div className="w-full bg-secondary h-2 rounded-full mt-2 overflow-hidden">
            <div className="bg-primary h-full rounded-full" style={{ width: `${percentageSold}%` }}></div>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-lg p-6 border border-border mb-8">
        <h2 className="text-xl font-bold mb-4">About This Event</h2>
        <p className="text-muted-foreground mb-4">{event.description}</p>
        <div className="flex items-center text-sm text-muted-foreground mt-6">
          <Info className="mr-2 h-4 w-4 text-primary" />
          <span>Tickets are non-refundable but can be transferred to another wallet.</span>
        </div>
      </div>

      <div className="bg-card rounded-lg p-6 border border-border mb-8">
        <div className="flex items-center mb-4">
          <Ticket className="mr-2 h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold">NFT Ticket</h2>
        </div>
        <p className="text-muted-foreground mb-6">
          Your NFT ticket is more than just entry to the event. It's a digital collectible with unique artwork and
          unlockable content.
        </p>

        <div className="space-y-4 mb-6">
          <h3 className="font-medium">Available Ticket Types</h3>
          {event.ticketTypes.map((ticketType) => (
            <div
              key={ticketType.id.toString()}
              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                selectedTicketType === ticketType.id
                  ? "border-primary bg-primary/10"
                  : "border-border bg-card/50 hover:border-primary/50"
              }`}
              onClick={() => setSelectedTicketType(ticketType.id)}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">{ticketType.name}</h4>
                <Badge variant="outline" className="bg-primary/20 text-primary border-primary/30">
                  {(Number(ticketType.price) / 100000000).toFixed(2)} ICP
                </Badge>
              </div>
              {ticketType.description && <p className="text-sm text-muted-foreground mb-2">{ticketType.description}</p>}
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {ticketType.sold.toString()} / {ticketType.capacity.toString()} sold
                </span>
                <span className="text-muted-foreground">
                  {Number(ticketType.capacity) - Number(ticketType.sold)} remaining
                </span>
              </div>
            </div>
          ))}
        </div>

        <Separator className="my-6" />

        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <p className="font-medium">
              Selected Ticket: {event.ticketTypes.find((tt) => tt.id === selectedTicketType)?.name || "None"}
            </p>
            <p className="text-sm text-muted-foreground">Plus gas fees for minting</p>
          </div>
          <Button
            size="lg"
            onClick={handleRSVP}
            disabled={isSoldOut || isRsvpLoading || !selectedTicketType}
            className={isSoldOut ? "opacity-50 cursor-not-allowed" : ""}
          >
            {isRsvpLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : isSoldOut ? (
              "Sold Out"
            ) : (
              "RSVP Now"
            )}
          </Button>
        </div>
      </div>

      <TicketMintingDialog
        open={isMintingDialogOpen}
        onOpenChange={setIsMintingDialogOpen}
        event={event}
        onMint={handleMintTicket}
        selectedTicketType={selectedTicketType}
      />
    </div>
  )
}

