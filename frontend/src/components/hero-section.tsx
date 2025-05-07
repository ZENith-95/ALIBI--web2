import { Button } from "./ui/button"
import { ArrowRight, Calendar } from "lucide-react"
import Link from "next/link"

export function HeroSection() {
  return (
    <div className="relative overflow-hidden">
      <div className="bg-grid">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Experience Events with <span className="text-gradient">AI-Generated NFT Tickets</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8">
              Discover, RSVP, and attend events with unique digital collectibles that unlock exclusive content.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild>
                <Link href="#upcoming-events">
                  Explore Events <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/organizer">
                  <Calendar className="mr-2 h-5 w-5" />
                  Create Your Event
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div
        className="absolute inset-0 bg-gradient-to-t from-background to-transparent pointer-events-none"
        style={{ top: "70%" }}
      ></div>
    </div>
  )
}

