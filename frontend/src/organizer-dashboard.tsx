"use client"

import { useState } from "react"
import {
  Activity,
  Calendar,
  Clock,
  CreditCard,
  DollarSign,
  Download,
  Gift,
  Globe,
  HelpCircle,
  Image,
  LineChart,
  ListFilter,
  MapPin,
  Menu,
  Plus,
  QrCode,
  RefreshCw,
  Search,
  Settings,
  Ticket,
  Trash,
  TrendingUp,
  Upload,
  Users,
  Wallet,
  X,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "./components/ui/avatar"
import { Badge } from "./components/ui/badge"
import { Button } from "./components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./components/ui/card"
import { Input } from "./components/ui/input"
import { Progress } from "./components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select"
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
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "./components/ui/sidebar"

export default function OrganizerDashboard() {
  const [isCreatingEvent, setIsCreatingEvent] = useState(false)
  const [isGeneratingTickets, setIsGeneratingTickets] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null)

  // Mock data for events
  const events = [
    {
      id: "1",
      name: "Neon Nights 2024",
      date: "2024-06-15",
      location: "Quantum Arena, San Francisco",
      ticketsSold: 380,
      ticketsTotal: 500,
      revenue: 1240,
      status: "active",
    },
    {
      id: "2",
      name: "Blockchain Summit",
      date: "2024-07-22",
      location: "Tech Center, New York",
      ticketsSold: 210,
      ticketsTotal: 300,
      revenue: 4200,
      status: "active",
    },
    {
      id: "3",
      name: "Digital Art Exhibition",
      date: "2024-05-10",
      location: "Modern Gallery, Los Angeles",
      ticketsSold: 150,
      ticketsTotal: 150,
      revenue: 3000,
      status: "completed",
    },
  ]

  // Mock data for ticket types
  const ticketTypes = [
    { name: "General Admission", price: 0.01, available: 100, sold: 80 },
    { name: "VIP Access", price: 0.05, available: 50, sold: 20 },
    { name: "Early Bird", price: 0.008, available: 50, sold: 50 },
  ]

  // Mock data for recent sales
  const recentSales = [
    { id: "T-1234", buyer: "0x1a2...3b4c", type: "VIP Access", price: 0.05, time: "10 min ago" },
    { id: "T-1235", buyer: "0x5d6...7e8f", type: "General Admission", price: 0.01, time: "25 min ago" },
    { id: "T-1236", buyer: "0x9g0...1h2i", type: "General Admission", price: 0.01, time: "42 min ago" },
    { id: "T-1237", buyer: "0x3j4...5k6l", type: "VIP Access", price: 0.05, time: "1 hour ago" },
  ]

  // Mock data for ticket designs
  const ticketDesigns = [
    "/placeholder.svg?height=300&width=200&text=Cyberpunk",
    "/placeholder.svg?height=300&width=200&text=Minimalist",
    "/placeholder.svg?height=300&width=200&text=Abstract",
    "/placeholder.svg?height=300&width=200&text=Futuristic",
    "/placeholder.svg?height=300&width=200&text=Retro",
    "/placeholder.svg?height=300&width=200&text=Vaporwave",
  ]

  const handleGenerateTickets = () => {
    setIsGeneratingTickets(true)
    // Simulate API call
    setTimeout(() => {
      setIsGeneratingTickets(false)
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-slate-100">
      <SidebarProvider>
        <div className="flex">
          <Sidebar className="border-r border-slate-700">
            <SidebarHeader className="border-b border-slate-700 py-4">
              <div className="flex items-center px-4">
                <Ticket className="h-6 w-6 text-cyan-500 mr-2" />
                <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  Alibi
                </span>
              </div>
            </SidebarHeader>
            <SidebarContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton className="flex items-center" isActive>
                    <Activity className="mr-2 h-4 w-4" />
                    Dashboard
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4" />
                    Events
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton className="flex items-center">
                    <Ticket className="mr-2 h-4 w-4" />
                    Tickets
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton className="flex items-center">
                    <QrCode className="mr-2 h-4 w-4" />
                    Scanner
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton className="flex items-center">
                    <Users className="mr-2 h-4 w-4" />
                    Attendees
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton className="flex items-center">
                    <LineChart className="mr-2 h-4 w-4" />
                    Analytics
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton className="flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarContent>
            <SidebarFooter className="border-t border-slate-700 p-4">
              <div className="flex items-center">
                <Avatar className="h-8 w-8 mr-2">
                  <AvatarImage src="/placeholder.svg?height=32&width=32" />
                  <AvatarFallback className="bg-slate-700 text-cyan-500">JD</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">John Doe</span>
                  <span className="text-xs text-slate-400">Organizer</span>
                </div>
              </div>
            </SidebarFooter>
          </Sidebar>

          <div className="flex-1">
            <header className="border-b border-slate-700 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <SidebarTrigger className="mr-2 lg:hidden" />
                  <h1 className="text-xl font-bold">Organizer Dashboard</h1>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                    <Input type="search" placeholder="Search..." className="w-64 pl-8 bg-slate-800 border-slate-700" />
                  </div>
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
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
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

            <main className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold">Welcome back, John!</h2>
                <Button onClick={() => setIsCreatingEvent(true)} className="bg-gradient-to-r from-cyan-500 to-blue-500">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Event
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-slate-400">Total Revenue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 text-cyan-500 mr-2" />
                      <span className="text-2xl font-bold">8,440 ICP</span>
                    </div>
                    <div className="flex items-center mt-1 text-xs text-green-500">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      <span>+12.5% from last month</span>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-slate-400">Total Tickets Sold</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <Ticket className="h-4 w-4 text-purple-500 mr-2" />
                      <span className="text-2xl font-bold">740</span>
                    </div>
                    <div className="flex items-center mt-1 text-xs text-green-500">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      <span>+8.3% from last month</span>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-slate-400">Active Events</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-blue-500 mr-2" />
                      <span className="text-2xl font-bold">2</span>
                    </div>
                    <div className="flex items-center mt-1 text-xs text-slate-400">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>1 upcoming event</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Tabs defaultValue="events" className="mb-8">
                <TabsList className="bg-slate-800 border border-slate-700">
                  <TabsTrigger value="events" className="data-[state=active]:bg-slate-700">
                    Events
                  </TabsTrigger>
                  <TabsTrigger value="tickets" className="data-[state=active]:bg-slate-700">
                    Ticket Management
                  </TabsTrigger>
                  <TabsTrigger value="distribution" className="data-[state=active]:bg-slate-700">
                    Distribution
                  </TabsTrigger>
                  <TabsTrigger value="analytics" className="data-[state=active]:bg-slate-700">
                    Analytics
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="events" className="mt-4">
                  <Card className="bg-slate-800 border-slate-700">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Your Events</CardTitle>
                        <div className="flex items-center space-x-2">
                          <Select defaultValue="all">
                            <SelectTrigger className="w-32 bg-slate-700 border-slate-600">
                              <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-700">
                              <SelectItem value="all">All Events</SelectItem>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="draft">Draft</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button variant="outline" size="icon" className="border-slate-700">
                            <ListFilter className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {events.map((event) => (
                          <div
                            key={event.id}
                            className={`p-4 rounded-lg border ${
                              selectedEvent === event.id
                                ? "border-cyan-500 bg-slate-700/50"
                                : "border-slate-700 bg-slate-800/50"
                            } hover:border-cyan-500/50 transition-colors cursor-pointer`}
                            onClick={() => setSelectedEvent(event.id)}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-medium text-lg">{event.name}</h3>
                              <Badge
                                variant="outline"
                                className={
                                  event.status === "active"
                                    ? "bg-green-500/20 text-green-400 border-green-500/50"
                                    : "bg-blue-500/20 text-blue-400 border-blue-500/50"
                                }
                              >
                                {event.status === "active" ? "Active" : "Completed"}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <div className="text-slate-400">Date</div>
                                <div className="flex items-center">
                                  <Calendar className="h-3 w-3 mr-1 text-cyan-500" />
                                  {new Date(event.date).toLocaleDateString()}
                                </div>
                              </div>
                              <div>
                                <div className="text-slate-400">Location</div>
                                <div className="flex items-center">
                                  <MapPin className="h-3 w-3 mr-1 text-cyan-500" />
                                  {event.location.split(",")[0]}
                                </div>
                              </div>
                              <div>
                                <div className="text-slate-400">Tickets Sold</div>
                                <div className="flex items-center">
                                  <Ticket className="h-3 w-3 mr-1 text-cyan-500" />
                                  {event.ticketsSold} / {event.ticketsTotal}
                                </div>
                              </div>
                              <div>
                                <div className="text-slate-400">Revenue</div>
                                <div className="flex items-center">
                                  <DollarSign className="h-3 w-3 mr-1 text-cyan-500" />
                                  {event.revenue} ICP
                                </div>
                              </div>
                            </div>
                            <div className="mt-3">
                              <div className="flex items-center justify-between mb-1 text-xs">
                                <span>Ticket Sales</span>
                                <span>{Math.round((event.ticketsSold / event.ticketsTotal) * 100)}%</span>
                              </div>
                              <Progress
                                value={(event.ticketsSold / event.ticketsTotal) * 100}
                                className="h-1.5 bg-slate-700"
                              >
                                <div
                                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                                  style={{ width: `${(event.ticketsSold / event.ticketsTotal) * 100}%` }}
                                />
                              </Progress>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="tickets" className="mt-4">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                      <Card className="bg-slate-800 border-slate-700">
                        <CardHeader>
                          <CardTitle>Ticket Configuration</CardTitle>
                          <CardDescription className="text-slate-400">
                            Configure and manage ticket types for your events
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {ticketTypes.map((type, index) => (
                              <div
                                key={index}
                                className="p-4 rounded-lg border border-slate-700 bg-slate-800/50 hover:border-cyan-500/50 transition-colors"
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <h3 className="font-medium">{type.name}</h3>
                                  <Badge variant="outline" className="bg-slate-700 border-slate-600">
                                    {type.price} ICP
                                  </Badge>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <div className="text-slate-400">Available</div>
                                    <div>{type.available}</div>
                                  </div>
                                  <div>
                                    <div className="text-slate-400">Sold</div>
                                    <div>{type.sold}</div>
                                  </div>
                                </div>
                                <div className="mt-3">
                                  <div className="flex items-center justify-between mb-1 text-xs">
                                    <span>Sales Progress</span>
                                    <span>{Math.round((type.sold / (type.available + type.sold)) * 100)}%</span>
                                  </div>
                                  <Progress
                                    value={(type.sold / (type.available + type.sold)) * 100}
                                    className="h-1.5 bg-slate-700"
                                  >
                                    <div
                                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                                      style={{ width: `${(type.sold / (type.available + type.sold)) * 100}%` }}
                                    />
                                  </Progress>
                                </div>
                                <div className="flex items-center justify-end mt-3 space-x-2">
                                  <Button variant="outline" size="sm" className="border-slate-700">
                                    Edit
                                  </Button>
                                  <Button variant="destructive" size="sm">
                                    <Trash className="h-3.5 w-3.5 mr-1" />
                                    Delete
                                  </Button>
                                </div>
                              </div>
                            ))}

                            <Button variant="outline" className="w-full border-dashed border-slate-700">
                              <Plus className="h-4 w-4 mr-2" />
                              Add Ticket Type
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div>
                      <Card className="bg-slate-800 border-slate-700 mb-6">
                        <CardHeader>
                          <CardTitle>AI Ticket Design</CardTitle>
                          <CardDescription className="text-slate-400">
                            Generate unique NFT ticket designs with AI
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <Select defaultValue="cyberpunk">
                              <SelectTrigger className="bg-slate-700 border-slate-600">
                                <SelectValue placeholder="Select art style" />
                              </SelectTrigger>
                              <SelectContent className="bg-slate-800 border-slate-700">
                                <SelectItem value="cyberpunk">Cyberpunk</SelectItem>
                                <SelectItem value="minimalist">Minimalist</SelectItem>
                                <SelectItem value="abstract">Abstract</SelectItem>
                                <SelectItem value="futuristic">Futuristic</SelectItem>
                                <SelectItem value="retro">Retro</SelectItem>
                                <SelectItem value="vaporwave">Vaporwave</SelectItem>
                              </SelectContent>
                            </Select>

                            <Button
                              onClick={handleGenerateTickets}
                              disabled={isGeneratingTickets}
                              className="w-full bg-gradient-to-r from-purple-500 to-blue-500"
                            >
                              {isGeneratingTickets ? (
                                <>
                                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                  Generating...
                                </>
                              ) : (
                                <>
                                  <Image className="h-4 w-4 mr-2" />
                                  Generate Designs
                                </>
                              )}
                            </Button>

                            <div className="grid grid-cols-2 gap-2 pt-2">
                              {ticketDesigns.slice(0, 4).map((design, index) => (
                                <div
                                  key={index}
                                  className="aspect-[2/3] rounded-md overflow-hidden border border-slate-700 hover:border-cyan-500 transition-colors cursor-pointer"
                                >
                                  <img
                                    src={design || "/placeholder.svg"}
                                    alt={`Ticket design ${index + 1}`}
                                    className="w-full h-full object-cover"
                                    crossOrigin="anonymous"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-slate-800 border-slate-700">
                        <CardHeader>
                          <CardTitle>Batch Operations</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <Button variant="outline" className="w-full justify-start border-slate-700">
                              <Upload className="h-4 w-4 mr-2" />
                              Batch Mint Tickets
                            </Button>
                            <Button variant="outline" className="w-full justify-start border-slate-700">
                              <Download className="h-4 w-4 mr-2" />
                              Export Ticket Data
                            </Button>
                            <Button variant="outline" className="w-full justify-start border-slate-700">
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Sync with Blockchain
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="distribution" className="mt-4">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                      <Card className="bg-slate-800 border-slate-700">
                        <CardHeader>
                          <CardTitle>Distribution Options</CardTitle>
                          <CardDescription className="text-slate-400">
                            Choose how to distribute your NFT tickets
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 rounded-lg border border-slate-700 bg-slate-800/50 hover:border-cyan-500/50 transition-colors cursor-pointer">
                              <div className="flex items-center mb-2">
                                <CreditCard className="h-5 w-5 text-cyan-500 mr-2" />
                                <h3 className="font-medium">Direct Sale</h3>
                              </div>
                              <p className="text-sm text-slate-400 mb-3">
                                Sell tickets directly to attendees through the platform
                              </p>
                              <Button size="sm" className="w-full">
                                Configure
                              </Button>
                            </div>

                            <div className="p-4 rounded-lg border border-slate-700 bg-slate-800/50 hover:border-cyan-500/50 transition-colors cursor-pointer">
                              <div className="flex items-center mb-2">
                                <Gift className="h-5 w-5 text-purple-500 mr-2" />
                                <h3 className="font-medium">Airdrop</h3>
                              </div>
                              <p className="text-sm text-slate-400 mb-3">
                                Send tickets directly to specific wallet addresses
                              </p>
                              <Button size="sm" variant="outline" className="w-full border-slate-700">
                                Configure
                              </Button>
                            </div>

                            <div className="p-4 rounded-lg border border-slate-700 bg-slate-800/50 hover:border-cyan-500/50 transition-colors cursor-pointer">
                              <div className="flex items-center mb-2">
                                <Globe className="h-5 w-5 text-blue-500 mr-2" />
                                <h3 className="font-medium">Public Mint</h3>
                              </div>
                              <p className="text-sm text-slate-400 mb-3">
                                Allow users to mint tickets directly from the blockchain
                              </p>
                              <Button size="sm" variant="outline" className="w-full border-slate-700">
                                Configure
                              </Button>
                            </div>

                            <div className="p-4 rounded-lg border border-slate-700 bg-slate-800/50 hover:border-cyan-500/50 transition-colors cursor-pointer">
                              <div className="flex items-center mb-2">
                                <Users className="h-5 w-5 text-green-500 mr-2" />
                                <h3 className="font-medium">Whitelist</h3>
                              </div>
                              <p className="text-sm text-slate-400 mb-3">
                                Create a whitelist of addresses that can purchase tickets
                              </p>
                              <Button size="sm" variant="outline" className="w-full border-slate-700">
                                Configure
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-slate-800 border-slate-700 mt-6">
                        <CardHeader>
                          <CardTitle>Recent Sales</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {recentSales.map((sale, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between border-b border-slate-700 pb-3 last:border-0 last:pb-0"
                              >
                                <div className="flex items-center">
                                  <Ticket className="h-4 w-4 text-cyan-500 mr-2" />
                                  <div>
                                    <div className="font-medium">{sale.id}</div>
                                    <div className="text-xs text-slate-400">{sale.buyer}</div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="font-medium">{sale.price} ICP</div>
                                  <div className="text-xs text-slate-400">{sale.time}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div>
                      <Card className="bg-slate-800 border-slate-700">
                        <CardHeader>
                          <CardTitle>Distribution Settings</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div>
                              <label className="text-sm text-slate-400 mb-1 block">Transfer Restrictions</label>
                              <Select defaultValue="allow">
                                <SelectTrigger className="bg-slate-700 border-slate-600">
                                  <SelectValue placeholder="Select option" />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-800 border-slate-700">
                                  <SelectItem value="allow">Allow Transfers</SelectItem>
                                  <SelectItem value="restrict">Restrict Transfers</SelectItem>
                                  <SelectItem value="approval">Require Approval</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <label className="text-sm text-slate-400 mb-1 block">Secondary Market Fee</label>
                              <Select defaultValue="5">
                                <SelectTrigger className="bg-slate-700 border-slate-600">
                                  <SelectValue placeholder="Select percentage" />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-800 border-slate-700">
                                  <SelectItem value="0">0%</SelectItem>
                                  <SelectItem value="2.5">2.5%</SelectItem>
                                  <SelectItem value="5">5%</SelectItem>
                                  <SelectItem value="10">10%</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <label className="text-sm text-slate-400 mb-1 block">Distribution Schedule</label>
                              <Select defaultValue="immediate">
                                <SelectTrigger className="bg-slate-700 border-slate-600">
                                  <SelectValue placeholder="Select schedule" />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-800 border-slate-700">
                                  <SelectItem value="immediate">Immediate</SelectItem>
                                  <SelectItem value="scheduled">Scheduled Release</SelectItem>
                                  <SelectItem value="phased">Phased Distribution</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <Separator className="bg-slate-700" />

                            <div className="pt-2">
                              <Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-500">
                                Save Distribution Settings
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="analytics" className="mt-4">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                      <Card className="bg-slate-800 border-slate-700">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle>Sales Analytics</CardTitle>
                            <Select defaultValue="7d">
                              <SelectTrigger className="w-[120px] bg-slate-700 border-slate-600">
                                <SelectValue placeholder="Select period" />
                              </SelectTrigger>
                              <SelectContent className="bg-slate-800 border-slate-700">
                                <SelectItem value="24h">Last 24 hours</SelectItem>
                                <SelectItem value="7d">Last 7 days</SelectItem>
                                <SelectItem value="30d">Last 30 days</SelectItem>
                                <SelectItem value="90d">Last 90 days</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="h-80 w-full bg-slate-700/30 rounded-lg border border-slate-700 flex items-center justify-center">
                            <div className="text-center">
                              <LineChart className="h-12 w-12 text-slate-500 mx-auto mb-2" />
                              <p className="text-slate-400">Sales analytics chart would appear here</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                            <div className="bg-slate-700/30 p-3 rounded-lg border border-slate-700">
                              <div className="text-xs text-slate-400">Total Sales</div>
                              <div className="text-xl font-bold">740</div>
                            </div>
                            <div className="bg-slate-700/30 p-3 rounded-lg border border-slate-700">
                              <div className="text-xs text-slate-400">Revenue</div>
                              <div className="text-xl font-bold">8,440 ICP</div>
                            </div>
                            <div className="bg-slate-700/30 p-3 rounded-lg border border-slate-700">
                              <div className="text-xs text-slate-400">Avg. Price</div>
                              <div className="text-xl font-bold">11.4 ICP</div>
                            </div>
                            <div className="bg-slate-700/30 p-3 rounded-lg border border-slate-700">
                              <div className="text-xs text-slate-400">Conversion Rate</div>
                              <div className="text-xl font-bold">68%</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div>
                      <Card className="bg-slate-800 border-slate-700 mb-6">
                        <CardHeader>
                          <CardTitle>Attendance Stats</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="text-sm text-slate-400">Check-ins</div>
                              <div className="text-sm font-medium">324 / 380</div>
                            </div>
                            <Progress value={85} className="h-2 bg-slate-700">
                              <div
                                className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                                style={{ width: "85%" }}
                              />
                            </Progress>

                            <div className="flex items-center justify-between mt-2">
                              <div className="text-sm text-slate-400">No-shows</div>
                              <div className="text-sm font-medium">56 (15%)</div>
                            </div>
                            <Progress value={15} className="h-2 bg-slate-700">
                              <div
                                className="h-full bg-gradient-to-r from-amber-500 to-red-500 rounded-full"
                                style={{ width: "15%" }}
                              />
                            </Progress>

                            <Separator className="bg-slate-700 my-2" />

                            <div className="pt-2">
                              <Button variant="outline" className="w-full border-slate-700">
                                <Download className="h-4 w-4 mr-2" />
                                Export Attendance Data
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-slate-800 border-slate-700">
                        <CardHeader>
                          <CardTitle>Ticket Types Breakdown</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <div className="text-sm">General Admission</div>
                                <div className="text-sm text-slate-400">80 sold</div>
                              </div>
                              <Progress value={53} className="h-2 bg-slate-700">
                                <div className="h-full bg-cyan-500 rounded-full" style={{ width: "53%" }} />
                              </Progress>
                            </div>

                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <div className="text-sm">VIP Access</div>
                                <div className="text-sm text-slate-400">20 sold</div>
                              </div>
                              <Progress value={13} className="h-2 bg-slate-700">
                                <div className="h-full bg-purple-500 rounded-full" style={{ width: "13%" }} />
                              </Progress>
                            </div>

                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <div className="text-sm">Early Bird</div>
                                <div className="text-sm text-slate-400">50 sold</div>
                              </div>
                              <Progress value={34} className="h-2 bg-slate-700">
                                <div className="h-full bg-blue-500 rounded-full" style={{ width: "34%" }} />
                              </Progress>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              {isCreatingEvent && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                  <Card className="bg-slate-800 border-slate-700 w-full max-w-2xl">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Create New Event</CardTitle>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setIsCreatingEvent(false)}
                          className="text-slate-400"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm text-slate-400 mb-1 block">Event Name</label>
                          <Input placeholder="Enter event name" className="bg-slate-700 border-slate-600" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm text-slate-400 mb-1 block">Date</label>
                            <Input type="date" className="bg-slate-700 border-slate-600" />
                          </div>
                          <div>
                            <label className="text-sm text-slate-400 mb-1 block">Time</label>
                            <Input type="time" className="bg-slate-700 border-slate-600" />
                          </div>
                        </div>

                        <div>
                          <label className="text-sm text-slate-400 mb-1 block">Location</label>
                          <Input placeholder="Enter event location" className="bg-slate-700 border-slate-600" />
                        </div>

                        <div>
                          <label className="text-sm text-slate-400 mb-1 block">Description</label>
                          <textarea
                            placeholder="Enter event description"
                            className="w-full h-24 px-3 py-2 rounded-md bg-slate-700 border border-slate-600 text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                          ></textarea>
                        </div>

                        <div>
                          <label className="text-sm text-slate-400 mb-1 block">Ticket Types</label>
                          <div className="space-y-2">
                            <div className="p-3 rounded-md bg-slate-700 border border-slate-600">
                              <div className="flex items-center justify-between mb-2">
                                <Input
                                  placeholder="Ticket name (e.g. General Admission)"
                                  className="bg-slate-600 border-slate-500 w-48"
                                />
                                <Input
                                  type="number"
                                  placeholder="Price in ICP"
                                  className="bg-slate-600 border-slate-500 w-32"
                                />
                              </div>
                              <div className="flex items-center justify-between">
                                <Input
                                  type="number"
                                  placeholder="Quantity"
                                  className="bg-slate-600 border-slate-500 w-32"
                                />
                                <Button variant="ghost" size="icon" className="text-slate-400">
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>

                            <Button variant="outline" className="w-full border-dashed border-slate-600">
                              <Plus className="h-4 w-4 mr-2" />
                              Add Ticket Type
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between border-t border-slate-700 pt-4">
                      <Button variant="outline" onClick={() => setIsCreatingEvent(false)} className="border-slate-700">
                        Cancel
                      </Button>
                      <Button className="bg-gradient-to-r from-cyan-500 to-blue-500">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Event
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              )}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </div>
  )
}

