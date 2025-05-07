"use client"

import { useState } from "react"
import { Calendar, Clock, DollarSign, Menu, Plus, Search, Ticket, TrendingUp, Wallet } from "lucide-react"
import { Badge } from "./components/ui/badge"
import { Button } from "./components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card"
import { Input } from "./components/ui/input"
import { Progress } from "./components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs"

export default function OrganizerDashboardPreview() {
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

  return (
    <div className="border-2 border-slate-700 rounded-lg overflow-hidden">
      <div className="bg-slate-800 text-slate-100">
        <header className="border-b border-slate-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex items-center">
                <Ticket className="h-6 w-6 text-cyan-500 mr-2" />
                <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  Alibi
                </span>
              </div>
              <span className="ml-4 text-xl font-bold">Organizer Dashboard</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <Input type="search" placeholder="Search..." className="w-64 pl-8 bg-slate-700 border-slate-600" />
              </div>
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

        <main className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Welcome back, John!</h2>
            <Button className="bg-gradient-to-r from-cyan-500 to-blue-500">
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
            <TabsList className="bg-slate-700 border border-slate-600">
              <TabsTrigger value="events" className="data-[state=active]:bg-slate-600">
                Events
              </TabsTrigger>
              <TabsTrigger value="tickets" className="data-[state=active]:bg-slate-600">
                Ticket Management
              </TabsTrigger>
              <TabsTrigger value="distribution" className="data-[state=active]:bg-slate-600">
                Distribution
              </TabsTrigger>
              <TabsTrigger value="analytics" className="data-[state=active]:bg-slate-600">
                Analytics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="events" className="mt-4">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Your Events</CardTitle>
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
                            <div className="flex items-center">{event.location.split(",")[0]}</div>
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
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tickets" className="mt-4">
              <div className="p-4 bg-slate-800 border border-slate-700 rounded-lg">
                <h3 className="text-lg font-medium mb-2">Ticket Management</h3>
                <p className="text-slate-400">
                  Configure and manage ticket types, generate designs with AI, and handle batch operations.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="distribution" className="mt-4">
              <div className="p-4 bg-slate-800 border border-slate-700 rounded-lg">
                <h3 className="text-lg font-medium mb-2">Distribution Options</h3>
                <p className="text-slate-400">
                  Choose how to distribute your NFT tickets: direct sale, airdrop, public mint, or whitelist.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="mt-4">
              <div className="p-4 bg-slate-800 border border-slate-700 rounded-lg">
                <h3 className="text-lg font-medium mb-2">Analytics Dashboard</h3>
                <p className="text-slate-400">
                  Track sales, monitor attendance, and analyze revenue metrics for your events.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}

