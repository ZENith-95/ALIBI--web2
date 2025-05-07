"use client"

import { Badge } from "./ui/badge"

import { useState, useCallback } from "react"
import { Button } from "./ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog"
import { Loader2, Check, Ticket } from "lucide-react"
import { toast } from "./ui/use-toast"
import { useRouter } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import type { Event } from "../lib/ic-api"

interface TicketMintingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  event: Event
  onMint: () => Promise<bigint | null>
  selectedTicketType: bigint | null
}

export function TicketMintingDialog({
  open,
  onOpenChange,
  event,
  onMint,
  selectedTicketType,
}: TicketMintingDialogProps) {
  const router = useRouter()
  const [step, setStep] = useState<"style" | "generating" | "minting" | "success">("style")
  const [selectedStyle, setSelectedStyle] = useState<string>(event?.artStyle || "cyberpunk")
  const [generatedTickets, setGeneratedTickets] = useState<string[]>([])
  const [selectedTicket, setSelectedTicket] = useState<number | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [ticketId, setTicketId] = useState<bigint | null>(null)

  const handleGenerateTickets = useCallback(async () => {
    try {
      setIsProcessing(true)
      setStep("generating")

      // In a real implementation, this would use AI to generate ticket designs
      // For now, we'll generate placeholder images based on event name and style
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Generate ticket designs based on selected style
      const basePath = `/placeholder.svg?height=300&width=200&text=${encodeURIComponent(event.name)}`;
      const tickets = [
        `${basePath}+${encodeURIComponent(selectedStyle)}+1`,
        `${basePath}+${encodeURIComponent(selectedStyle)}+2`,
        `${basePath}+${encodeURIComponent(selectedStyle)}+3`,
      ];
      
      setGeneratedTickets(tickets)
      setSelectedTicket(0) // Select the first ticket by default
      setStep("minting")
    } catch (error) {
      console.error("Error generating tickets:", error)
      toast({
        title: "Generation Failed",
        description: "Failed to generate ticket designs. Please try again.",
        variant: "destructive",
      })
      setStep("style")
    } finally {
      setIsProcessing(false)
    }
  }, [event.name, selectedStyle])

  const handleMintTicket = useCallback(async () => {
    if (selectedTicket === null) {
      toast({
        title: "No ticket selected",
        description: "Please select a ticket design to mint.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsProcessing(true)

      // Call the onMint callback to mint the ticket
      const mintedTicketId = await onMint()

      if (mintedTicketId) {
        setTicketId(mintedTicketId)
        setStep("success")
        toast({
          title: "Ticket minted successfully",
          description: "Your NFT ticket has been added to your wallet.",
        })
      } else {
        throw new Error("Failed to mint ticket")
      }
    } catch (error) {
      console.error("Error minting ticket:", error)
      toast({
        title: "Minting Failed",
        description: "Failed to mint your ticket. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }, [selectedTicket, onMint])

  const handleClose = useCallback(() => {
    if (step === "success") {
      router.push("/tickets")
    } else {
      onOpenChange(false)
      // Reset state when dialog is closed
      setTimeout(() => {
        setStep("style")
        setGeneratedTickets([])
        setSelectedTicket(null)
        setIsProcessing(false)
      }, 300)
    }
  }, [step, router, onOpenChange])

  // Get the selected ticket type details
  const ticketTypeDetails = event.ticketTypes.find((tt) => tt.id === selectedTicketType)

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen: boolean) => {
        // Prevent closing the dialog during processing
        if (isProcessing && !newOpen) {
          return
        }
        onOpenChange(newOpen)
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {step === "style" && "Choose Ticket Style"}
            {step === "generating" && "Generating Tickets"}
            {step === "minting" && "Select & Mint Your Ticket"}
            {step === "success" && "Ticket Minted Successfully"}
          </DialogTitle>
          <DialogDescription>
            {step === "style" && "Select an art style for your AI-generated NFT ticket."}
            {step === "generating" && "Our AI is creating unique ticket designs for you..."}
            {step === "minting" && "Choose your favorite design to mint as an NFT ticket."}
            {step === "success" && "Your NFT ticket has been minted and added to your wallet."}
          </DialogDescription>
        </DialogHeader>

        {step === "style" && (
          <div className="py-6">
            <div className="mb-4">
              <h3 className="text-sm font-medium mb-2">Selected Ticket Type</h3>
              <div className="p-3 rounded-md bg-secondary/30 border border-border">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{ticketTypeDetails?.name || "Standard Ticket"}</span>
                  <Badge variant="outline" className="bg-primary/20 text-primary border-primary/30">
                    {ticketTypeDetails ? (Number(ticketTypeDetails.price) / 100000000).toFixed(2) : "0.00"} ICP
                  </Badge>
                </div>
              </div>
            </div>

            <Select value={selectedStyle} onValueChange={setSelectedStyle}>
              <SelectTrigger>
                <SelectValue placeholder="Select art style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cyberpunk">Cyberpunk</SelectItem>
                <SelectItem value="vintage">Vintage</SelectItem>
                <SelectItem value="minimalist">Minimalist</SelectItem>
                <SelectItem value="abstract">Abstract</SelectItem>
                <SelectItem value="futuristic">Futuristic</SelectItem>
              </SelectContent>
            </Select>
            <div className="mt-4 text-sm text-muted-foreground">
              <p>The selected style will influence how your NFT ticket looks.</p>
            </div>
          </div>
        )}

        {step === "generating" && (
          <div className="py-10 flex flex-col items-center justify-center">
            <Loader2 className="h-16 w-16 text-primary animate-spin mb-4" />
            <p className="text-center text-muted-foreground">Generating unique ticket designs with AI...</p>
          </div>
        )}

        {step === "minting" && (
          <div className="py-4">
            <div className="grid grid-cols-3 gap-3 mb-4">
              {generatedTickets.map((ticket, index) => (
                <div
                  key={index}
                  className={`relative rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                    selectedTicket === index
                      ? "border-primary shadow-lg shadow-primary/20"
                      : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => setSelectedTicket(index)}
                >
                  <img
                    src={ticket || "/placeholder.svg"}
                    alt={`Ticket design ${index + 1}`}
                    className="w-full h-auto"
                    crossOrigin="anonymous"
                  />
                  {selectedTicket === index && (
                    <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                      <Check className="h-4 w-4" />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Click on a design to select it for minting. Each ticket is a unique NFT that serves as your entry pass to
              the event.
            </p>
          </div>
        )}

        {step === "success" && (
          <div className="py-6 flex flex-col items-center">
            <div className="bg-primary/20 rounded-full p-4 mb-4">
              <Ticket className="h-10 w-10 text-primary" />
            </div>
            <p className="text-center text-muted-foreground mb-4">
              Your NFT ticket for <span className="font-medium text-foreground">{event?.name}</span> has been
              successfully minted.
            </p>
            {ticketId && (
              <div className="bg-secondary/30 p-3 rounded-md border border-border w-full text-center">
                <p className="text-sm text-muted-foreground">Ticket ID</p>
                <p className="font-mono font-medium">{ticketId.toString()}</p>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2">
          {step !== "success" && !isProcessing && (
            <Button variant="outline" onClick={handleClose} type="button">
              Cancel
            </Button>
          )}

          {step === "style" && (
            <Button onClick={handleGenerateTickets} type="button" disabled={isProcessing}>
              {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Generate Tickets
            </Button>
          )}

          {step === "minting" && (
            <Button onClick={handleMintTicket} type="button" disabled={isProcessing || selectedTicket === null}>
              {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Mint Ticket
            </Button>
          )}

          {step === "success" && (
            <Button onClick={handleClose} type="button">
              View My Tickets
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

