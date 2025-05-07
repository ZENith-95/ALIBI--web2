"use client"

import { useState } from "react"
import {
  ArrowLeft,
  Calendar,
  Check,
  Clock,
  Download,
  ExternalLink,
  Globe,
  HelpCircle,
  Info,
  Lock,
  MapPin,
  Menu,
  MessageSquare,
  QrCode,
  Share,
  ShieldCheck,
  Tag,
  Ticket,
  Wallet,
} from "lucide-react"
import { Badge } from "./components/ui/badge"
import { Button } from "./components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card"
import { Input } from "./components/ui/input"
import { Separator } from "./components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./components/ui/tooltip"

export default function UserTicketInterface() {
  const [showQR, setShowQR] = useState(false)
  const [showResaleOptions, setShowResaleOptions] = useState(false)

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
        url: "https://discord.gg/example",
        unlocked: true,
      },
      {
        name: "Merchandise Discount",
        description: "20% off on event merchandise",
        code: "NEON20",
        unlocked: true,
      },
      {
        name: "Afterparty Access",
        description: "Access to the exclusive afterparty",
        url: "https://example.com/afterparty",
        unlocked: false,
      },
    ],
    nftDetails: {
      tokenId: "12345",
      contract: "rrkah-fqaaa-aaaaa-aaaaq-cai",
      owner: "2vxsx-fae",
      mintDate: "May 10, 2024",
    },
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-slate-100 p-4 md:p-8">
      <header className="max-w-6xl mx-auto mb-8">
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-slate-800 border-slate-700 text-slate-100">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-700" />
                <DropdownMenuItem className="hover:bg-slate-700">
                  <Ticket className="mr-2 h-4 w-4" />
                  <span>My Tickets</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-slate-700">
                  <Calendar className="mr-2 h-4 w-4" />
                  <span>Upcoming Events</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-slate-700">
                  <HelpCircle className="mr-2 h-4 w-4" />
                  <span>Help</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-700" />
                <DropdownMenuItem className="hover:bg-slate-700">
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto">
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
                      style={{ maxHeight: "500px" }}
                      crossOrigin="anonymous"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <Badge
                        variant="outline"
                        className={
                          ticket.status === "active"
                            ? "bg-green-500/20 text-green-400 border-green-500/50"
                            : "bg-amber-500/20 text-amber-400 border-amber-500/50"
                        }
                      >
                        {ticket.status === "active" ? "Active" : "Used"}
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
                      <TabsList className="bg-slate-800 border border-slate-700">
                        <TabsTrigger value="details" className="data-[state=active]:bg-slate-700">
                          Details
                        </TabsTrigger>
                        <TabsTrigger value="history" className="data-[state=active]:bg-slate-700">
                          History
                        </TabsTrigger>
                        <TabsTrigger value="resale" className="data-[state=active]:bg-slate-700">
                          Resale
                        </TabsTrigger>
                      </TabsList>
                      <TabsContent value="details" className="mt-4">
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-800/50 p-3 rounded-md border border-slate-700/50">
                              <div className="text-xs text-slate-500 mb-1">Token ID</div>
                              <div className="font-mono text-sm">{ticket.nftDetails.tokenId}</div>
                            </div>
                            <div className="bg-slate-800/50 p-3 rounded-md border border-slate-700/50">
                              <div className="text-xs text-slate-500 mb-1">Contract</div>
                              <div className="font-mono text-sm truncate">{ticket.nftDetails.contract}</div>
                            </div>
                            <div className="bg-slate-800/50 p-3 rounded-md border border-slate-700/50">
                              <div className="text-xs text-slate-500 mb-1">Owner</div>
                              <div className="font-mono text-sm">{ticket.nftDetails.owner}</div>
                            </div>
                            <div className="bg-slate-800/50 p-3 rounded-md border border-slate-700/50">
                              <div className="text-xs text-slate-500 mb-1">Minted</div>
                              <div className="text-sm">{ticket.nftDetails.mintDate}</div>
                            </div>
                          </div>

                          <Button variant="outline" size="sm" className="w-full border-slate-700">
                            <ExternalLink className="mr-2 h-4 w-4" />
                            View on Explorer
                          </Button>
                        </div>
                      </TabsContent>
                      <TabsContent value="history" className="mt-4">
                        <div className="space-y-4">
                          <div className="bg-slate-800/50 p-4 rounded-md border border-slate-700/50">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center">
                                <Badge variant="outline" className="bg-cyan-500/20 text-cyan-400 border-cyan-500/50">
                                  Mint
                                </Badge>
                              </div>
                              <div className="text-xs text-slate-500">May 10, 2024</div>
                            </div>
                            <div className="text-sm">
                              Minted by <span className="font-mono text-cyan-400">{ticket.nftDetails.owner}</span>
                            </div>
                          </div>

                          <div className="bg-slate-800/50 p-4 rounded-md border border-slate-700/50">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center">
                                <Badge
                                  variant="outline"
                                  className="bg-purple-500/20 text-purple-400 border-purple-500/50"
                                >
                                  Unlockable
                                </Badge>
                              </div>
                              <div className="text-xs text-slate-500">May 12, 2024</div>
                            </div>
                            <div className="text-sm">Discord access unlocked</div>
                          </div>

                          <div className="bg-slate-800/50 p-4 rounded-md border border-slate-700/50">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center">
                                <Badge
                                  variant="outline"
                                  className="bg-purple-500/20 text-purple-400 border-purple-500/50"
                                >
                                  Unlockable
                                </Badge>
                              </div>
                              <div className="text-xs text-slate-500">May 15, 2024</div>
                            </div>
                            <div className="text-sm">Merchandise discount unlocked</div>
                          </div>
                        </div>
                      </TabsContent>
                      <TabsContent value="resale" className="mt-4">
                        {showResaleOptions ? (
                          <div className="space-y-4">
                            <div className="bg-slate-800/50 p-4 rounded-md border border-slate-700/50">
                              <h3 className="font-medium mb-2">List Ticket for Resale</h3>
                              <div className="space-y-3">
                                <div>
                                  <label className="text-sm text-slate-400 mb-1 block">Listing Price (ICP)</label>
                                  <Input
                                    type="number"
                                    placeholder="Enter price"
                                    className="bg-slate-700 border-slate-600"
                                  />
                                </div>
                                <div>
                                  <label className="text-sm text-slate-400 mb-1 block">Duration</label>
                                  <select className="w-full px-3 py-2 rounded-md bg-slate-700 border border-slate-600 text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500">
                                    <option value="3">3 days</option>
                                    <option value="7">7 days</option>
                                    <option value="14">14 days</option>
                                    <option value="30">30 days</option>
                                  </select>
                                </div>
                              </div>
                              <div className="flex items-center justify-between mt-4">
                                <Button
                                  variant="outline"
                                  onClick={() => setShowResaleOptions(false)}
                                  className="border-slate-700"
                                >
                                  Cancel
                                </Button>
                                <Button className="bg-gradient-to-r from-cyan-500 to-blue-500">List for Sale</Button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="bg-slate-800/50 p-4 rounded-md border border-slate-700/50">
                              <div className="flex items-center mb-3">
                                <Tag className="h-5 w-5 text-cyan-500 mr-2" />
                                <h3 className="font-medium">Resale Options</h3>
                              </div>
                              <p className="text-sm text-slate-400 mb-4">
                                You can list this ticket for resale on the marketplace or transfer it directly to
                                another wallet.
                              </p>
                              <div className="flex flex-col space-y-2">
                                <Button
                                  onClick={() => setShowResaleOptions(true)}
                                  className="bg-gradient-to-r from-cyan-500 to-blue-500"
                                >
                                  List for Sale
                                </Button>
                                <Button variant="outline" className="border-slate-700">
                                  Transfer to Wallet
                                </Button>
                              </div>
                            </div>

                            <div className="bg-slate-800/50 p-4 rounded-md border border-slate-700/50">
                              <div className="flex items-center mb-3">
                                <Info className="h-5 w-5 text-amber-500 mr-2" />
                                <h3 className="font-medium">Resale Information</h3>
                              </div>
                              <ul className="text-sm text-slate-400 space-y-2">
                                <li className="flex items-start">
                                  <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                                  Resale royalty: 5% to event organizer
                                </li>
                                <li className="flex items-start">
                                  <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                                  Platform fee: 2.5% on successful sales
                                </li>
                                <li className="flex items-start">
                                  <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                                  Instant settlement in ICP tokens
                                </li>
                              </ul>
                            </div>
                          </div>
                        )}
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
                          {unlockable.url ? (
                            <Button variant="outline" size="sm" className="w-full h-7" asChild>
                              <a href={unlockable.url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="mr-2 h-3.5 w-3.5" />
                                Access Now
                              </a>
                            </Button>
                          ) : unlockable.code ? (
                            <div className="bg-slate-800 rounded p-1.5 text-center text-sm text-cyan-400 font-mono">
                              {unlockable.code}
                            </div>
                          ) : null}
                        </div>
                      )}
                    </div>
                  ))}

                  <div className="text-xs text-slate-500">
                    <p>Additional unlockables will be available after event check-in.</p>
                  </div>
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
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              <Info className="h-4 w-4 text-slate-400" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>This ticket has been verified as authentic</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <div className="text-sm">
                      This ticket is authentic and has been verified on the Internet Computer blockchain.
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <Globe className="h-4 w-4 text-cyan-500 mr-2" />
                      <span>Blockchain</span>
                    </div>
                    <span className="text-slate-300">Internet Computer</span>
                  </div>

                  <Separator className="bg-slate-700/50" />

                  <Button variant="outline" className="w-full border-slate-700">
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    Verify Authenticity
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-slate-100 flex items-center text-base">
                  <MessageSquare className="mr-2 h-5 w-5 text-cyan-500" />
                  Event Updates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="bg-slate-800/50 p-3 rounded-md border border-slate-700/50">
                    <div className="text-xs text-slate-500 mb-1">May 20, 2024</div>
                    <p className="text-sm">
                      Lineup announcement! Check out the full artist schedule for Neon Nights 2024.
                    </p>
                  </div>
                  <div className="bg-slate-800/50 p-3 rounded-md border border-slate-700/50">
                    <div className="text-xs text-slate-500 mb-1">May 15, 2024</div>
                    <p className="text-sm">
                      VIP ticket holders: Your exclusive merchandise discount code is now available!
                    </p>
                  </div>
                  <div className="bg-slate-800/50 p-3 rounded-md border border-slate-700/50">
                    <div className="text-xs text-slate-500 mb-1">May 10, 2024</div>
                    <p className="text-sm">Thank you for purchasing a ticket to Neon Nights 2024!</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

