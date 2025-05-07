"use client"

import { useState } from "react"
import {
  ArrowLeft,
  Calendar,
  Clock,
  Download,
  ExternalLink,
  Info,
  Lock,
  MapPin,
  Menu,
  QrCode,
  Share,
  ShieldCheck,
  Ticket,
  Wallet,
} from "lucide-react"
import { Badge } from "./components/ui/badge"
import { Button } from "./components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card"
import { Separator } from "./components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs"

export default function UserTicketInterfacePreview() {
  const [showQR, setShowQR] = useState(false)

  // Mock ticket data
  const ticket = {
    id: "T-1234",
    eventName: "Neon Nights 2024",
    eventDate: "June 15, 2024",
    eventTime: "8:00 PM",
    eventLocation: "Quantum Arena, San Francisco",
    ticketType: "VIP Access",
    price: 0.05,
    status: "active",
    qrCode: "/placeholder.svg?height=300&width=300&text=QR+Code",
    imageUrl: "/placeholder.svg?height=600&width=400&text=NFT+Ticket",
    traits: ["VIP", "Early Entry", "Backstage Access"],
    unlockables: [
      {
        name: "Discord Access",
        description: "Exclusive access to the event's Discord channel",
        unlocked: true,
      },
      {
        name: "Merchandise Discount",
        description: "20% off on event merchandise",
        unlocked: true,
      },
      {
        name: "Afterparty Access",
        description: "Access to the exclusive afterparty",
        unlocked: false,
      },
    ],
  }

  return (
    <div className="bg-slate-800 text-slate-100 p-4 md:p-6 border-2 border-slate-700 rounded-lg">
      <header className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Ticket className="h-6 w-6 text-cyan-500 mr-2" />
            <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Alibi
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" className="border-slate-700">
              <Wallet className="mr-2 h-4 w-4" />
              Connect Wallet
            </Button>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button variant="outline" size="sm" className="mr-4 border-slate-700">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to My Tickets
          </Button>
          <h1 className="text-2xl font-bold">Ticket Details</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" className="border-slate-700">
            <Share className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" size="sm" className="border-slate-700">
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm overflow-hidden">
            <div className="relative">
              {showQR ? (
                <div className="flex flex-col items-center justify-center p-8 bg-white">
                  <img
                    src={ticket.qrCode || "/placeholder.svg"}
                    alt="Ticket QR Code"
                    className="w-64 h-64"
                    crossOrigin="anonymous"
                  />
                  <Button
                    variant="outline"
                    className="mt-4 bg-slate-800 text-slate-200 border-slate-700"
                    onClick={() => setShowQR(false)}
                  >
                    Hide QR Code
                  </Button>
                </div>
              ) : (
                <>
                  <img
                    src={ticket.imageUrl || "/placeholder.svg"}
                    alt={ticket.eventName}
                    className="w-full object-cover"
                    style={{ maxHeight: "400px" }}
                    crossOrigin="anonymous"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/50">
                      Active
                    </Badge>
                    <h2 className="text-2xl font-bold text-slate-100 mt-2">{ticket.eventName}</h2>
                    <div className="flex items-center text-sm text-slate-300 mt-1">
                      <Ticket className="mr-2 h-4 w-4 text-cyan-500" />
                      <span>{ticket.ticketType}</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="flex flex-wrap gap-2">
                  {ticket.traits.map((trait, index) => (
                    <Badge key={index} variant="outline" className="bg-slate-800/50 text-cyan-400 border-cyan-500/50">
                      {trait}
                    </Badge>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-400">
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4 text-cyan-500" />
                    <span>{ticket.eventDate}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4 text-cyan-500" />
                    <span>{ticket.eventTime}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="mr-2 h-4 w-4 text-cyan-500" />
                    <span>{ticket.eventLocation}</span>
                  </div>
                </div>

                <div className="flex justify-center">
                  <Button
                    size="lg"
                    onClick={() => setShowQR(true)}
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                  >
                    <QrCode className="mr-2 h-5 w-5" />
                    Show QR Code
                  </Button>
                </div>

                <Separator className="bg-slate-700/50" />

                <div>
                  <Tabs defaultValue="details">
                    <TabsList className="bg-slate-700 border border-slate-600">
                      <TabsTrigger value="details" className="data-[state=active]:bg-slate-600">
                        Details
                      </TabsTrigger>
                      <TabsTrigger value="history" className="data-[state=active]:bg-slate-600">
                        History
                      </TabsTrigger>
                      <TabsTrigger value="resale" className="data-[state=active]:bg-slate-600">
                        Resale
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="details" className="mt-4">
                      <div className="p-4 bg-slate-800/50 border border-slate-700/50 rounded-lg">
                        <h3 className="font-medium mb-2">NFT Ticket Details</h3>
                        <p className="text-sm text-slate-400">
                          This ticket is an NFT on the Internet Computer blockchain. It provides secure access to the
                          event and unlocks exclusive content.
                        </p>
                      </div>
                    </TabsContent>
                    <TabsContent value="history" className="mt-4">
                      <div className="p-4 bg-slate-800/50 border border-slate-700/50 rounded-lg">
                        <h3 className="font-medium mb-2">Ticket History</h3>
                        <p className="text-sm text-slate-400">
                          View the complete history of this ticket, including minting, transfers, and unlockable
                          activations.
                        </p>
                      </div>
                    </TabsContent>
                    <TabsContent value="resale" className="mt-4">
                      <div className="p-4 bg-slate-800/50 border border-slate-700/50 rounded-lg">
                        <h3 className="font-medium mb-2">Resale Options</h3>
                        <p className="text-sm text-slate-400">
                          You can list this ticket for resale on the marketplace or transfer it directly to another
                          wallet.
                        </p>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-slate-100 flex items-center text-base">
                <Lock className="mr-2 h-5 w-5 text-cyan-500" />
                Unlockables
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {ticket.unlockables.map((unlockable, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-md border ${
                      unlockable.unlocked
                        ? "border-green-500/30 bg-green-500/10"
                        : "border-slate-700/50 bg-slate-800/50"
                    }`}
                  >
                    <h4 className={`font-medium ${unlockable.unlocked ? "text-green-400" : "text-slate-400"}`}>
                      {unlockable.name}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">{unlockable.description}</p>

                    {unlockable.unlocked && (
                      <div className="mt-2">
                        <Button variant="outline" size="sm" className="w-full h-7">
                          <ExternalLink className="mr-2 h-3.5 w-3.5" />
                          Access Now
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-slate-100 flex items-center text-base">
                <ShieldCheck className="mr-2 h-5 w-5 text-cyan-500" />
                Verification
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-slate-800/50 p-4 rounded-md border border-slate-700/50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/50">
                        Verified
                      </Badge>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <Info className="h-4 w-4 text-slate-400" />
                    </Button>
                  </div>
                  <div className="text-sm">
                    This ticket is authentic and has been verified on the Internet Computer blockchain.
                  </div>
                </div>

                <Button variant="outline" className="w-full border-slate-700">
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  Verify Authenticity
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

