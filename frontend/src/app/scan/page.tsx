import { QRScanner } from "../../components/qr-scanner"
import { SiteHeader } from "../../components/site-header"
import { MobileNavigation } from "../../components/mobile-navigation"

export default function ScanPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F0F1A] to-[#1A1A2C] text-[#E0E0FF]">
      <SiteHeader />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Scan Tickets</h1>
        <QRScanner />
      </main>
      <MobileNavigation />
    </div>
  )
}

