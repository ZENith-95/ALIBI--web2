import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Progress } from "../ui/progress"

interface EventAnalyticsProps {
  events: any[]
}

export function EventAnalytics({ events }: EventAnalyticsProps) {
  // Calculate total stats
  const totalTicketsSold = events.reduce((sum, event) => sum + event.ticketsSold, 0)
  const totalCapacity = events.reduce((sum, event) => sum + event.capacity, 0)

  // Mock data for analytics
  const ticketTypes = [
    { name: "General Admission", sold: 450, percentage: 60 },
    { name: "VIP", sold: 150, percentage: 20 },
    { name: "Early Bird", sold: 100, percentage: 15 },
    { name: "Last Minute", sold: 40, percentage: 5 },
  ]

  const timeDistribution = [
    { time: "1-4 weeks before", percentage: 45 },
    { time: "1 week before", percentage: 30 },
    { time: "1-3 days before", percentage: 20 },
    { time: "Day of event", percentage: 5 },
  ]

  const checkInStats = {
    checkedIn: 324,
    noShow: 56,
    total: 380,
    percentage: 85,
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Event Analytics</h2>
        <Select>
          <div className="w-[180px]">
            <SelectTrigger>
              <SelectValue placeholder="Select Event" />
            </SelectTrigger>
          </div>
          <SelectContent>
            <SelectItem value="all">All Events</SelectItem>
            {events.map((event) => (
              <SelectItem key={event.id} value={event.id}>
                {event.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="sales">
        <TabsList className="mb-6">
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
        </TabsList>

        <TabsContent value="sales">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Ticket Sales by Type</CardTitle>
                <CardDescription>Distribution of ticket sales across different ticket types</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {ticketTypes.map((type, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{type.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {type.sold} tickets ({type.percentage}%)
                        </span>
                      </div>
                      <Progress value={type.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sales Timeline</CardTitle>
                <CardDescription>When tickets were purchased relative to event date</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {timeDistribution.map((item, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{item.time}</span>
                        <span className="text-sm text-muted-foreground">{item.percentage}%</span>
                      </div>
                      <Progress value={item.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Overall Sales Performance</CardTitle>
                <CardDescription>Total ticket sales across all events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="bg-secondary/30 rounded-lg p-4 border border-border">
                    <div className="text-sm text-muted-foreground mb-1">Total Tickets Sold</div>
                    <div className="text-2xl font-bold">{totalTicketsSold}</div>
                  </div>
                  <div className="bg-secondary/30 rounded-lg p-4 border border-border">
                    <div className="text-sm text-muted-foreground mb-1">Total Capacity</div>
                    <div className="text-2xl font-bold">{totalCapacity}</div>
                  </div>
                  <div className="bg-secondary/30 rounded-lg p-4 border border-border">
                    <div className="text-sm text-muted-foreground mb-1">Fill Rate</div>
                    <div className="text-2xl font-bold">{Math.round((totalTicketsSold / totalCapacity) * 100)}%</div>
                  </div>
                </div>

                <div className="w-full bg-secondary h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-primary h-full rounded-full"
                    style={{ width: `${Math.round((totalTicketsSold / totalCapacity) * 100)}%` }}
                  ></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="attendance">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Check-in Statistics</CardTitle>
                <CardDescription>Attendance rate for events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center mb-6">
                  <div className="relative w-40 h-40 mb-4">
                    <div className="w-full h-full rounded-full bg-secondary"></div>
                    <div
                      className="absolute top-0 left-0 w-full h-full rounded-full border-8 border-primary"
                      style={{
                        clipPath: `polygon(50% 50%, 50% 0%, ${checkInStats.percentage > 50 ? "100% 0%" : `${50 + (checkInStats.percentage / 100) * 50}% 0%`}, ${checkInStats.percentage > 50 ? `${50 + ((checkInStats.percentage - 50) / 50) * 50}% 100%` : "50% 50%"})`,
                      }}
                    ></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                      <div className="text-3xl font-bold">{checkInStats.percentage}%</div>
                      <div className="text-xs text-muted-foreground">Check-in Rate</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 w-full">
                    <div className="bg-secondary/30 rounded-lg p-3 border border-border text-center">
                      <div className="text-sm text-muted-foreground mb-1">Checked In</div>
                      <div className="text-xl font-bold">{checkInStats.checkedIn}</div>
                    </div>
                    <div className="bg-secondary/30 rounded-lg p-3 border border-border text-center">
                      <div className="text-sm text-muted-foreground mb-1">No Shows</div>
                      <div className="text-xl font-bold">{checkInStats.noShow}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Check-in Timeline</CardTitle>
                <CardDescription>When attendees arrived at the event</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">30+ minutes early</span>
                      <span className="text-sm text-muted-foreground">15%</span>
                    </div>
                    <Progress value={15} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">0-30 minutes early</span>
                      <span className="text-sm text-muted-foreground">40%</span>
                    </div>
                    <Progress value={40} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">0-30 minutes late</span>
                      <span className="text-sm text-muted-foreground">35%</span>
                    </div>
                    <Progress value={35} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">30+ minutes late</span>
                      <span className="text-sm text-muted-foreground">10%</span>
                    </div>
                    <Progress value={10} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Attendance by Event</CardTitle>
                <CardDescription>Check-in rates for individual events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {events.map((event, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{event.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {Math.floor(event.ticketsSold * 0.85)} / {event.ticketsSold} ({Math.floor(0.85 * 100)}%)
                        </span>
                      </div>
                      <Progress value={85} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

