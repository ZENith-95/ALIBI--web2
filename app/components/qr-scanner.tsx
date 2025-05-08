"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs"
import { Lightbulb, Check, X, RefreshCw, QrCode, Ticket, Loader2 } from "lucide-react"
import { toast } from "./ui/use-toast"
import { Badge } from "./ui/badge"

export function QRScanner() {
  const [scanning, setScanning] = useState(false)
  const [torchOn, setTorchOn] = useState(false)
  const [scanResult, setScanResult] = useState<null | { valid: boolean; ticket?: any }>(null)
  const [scanHistory, setScanHistory] = useState<Array<{ id: string; time: string; valid: boolean }>>([])
  const [isStartingScanner, setIsStartingScanner] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const scanTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const startScanner = async () => {
    try {
      setIsStartingScanner(true)
      const constraints = {
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }

      setScanning(true)

      // Simulate scanning for demo purposes
      scanTimeoutRef.current = setTimeout(() => {
        // Randomly determine if the scan is valid (for demo)
        const isValid = Math.random() > 0.3

        if (isValid) {
          const mockTicket = {
            id: "T-" + Math.floor(Math.random() * 10000),
            eventName: "Neon Nights 2024",
            eventDate: "June 15, 2024",
            status: "active",
          }

          setScanResult({ valid: true, ticket: mockTicket })

          // Add to scan history
          setScanHistory((prev) =>
            [
              {
                id: mockTicket.id,
                time: new Date().toLocaleTimeString(),
                valid: true,
              },
              ...prev,
            ].slice(0, 10),
          )

          toast({
            title: "Valid Ticket",
            description: `Ticket ${mockTicket.id} for ${mockTicket.eventName} has been verified.`,
          })
        } else {
          setScanResult({ valid: false })

          // Add to scan history
          setScanHistory((prev) =>
            [
              {
                id: "Invalid QR",
                time: new Date().toLocaleTimeString(),
                valid: false,
              },
              ...prev,
            ].slice(0, 10),
          )

          toast({
            title: "Invalid Ticket",
            description: "This QR code is not a valid ticket or has already been used.",
            variant: "destructive",
          })
        }

        stopScanner()
      }, 3000)
    } catch (error) {
      console.error("Error accessing camera:", error)
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions.",
        variant: "destructive",
      })
    } finally {
      setIsStartingScanner(false)
    }
  }

  const stopScanner = () => {
    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current)
      scanTimeoutRef.current = null
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null
    }

    setScanning(false)
    setTorchOn(false)
  }

  const toggleTorch = async () => {
    if (!streamRef.current) return

    try {
      const track = streamRef.current.getVideoTracks()[0]
      if (!track) {
        toast({
          title: "Torch Unavailable",
          description: "No video track available.",
          variant: "destructive",
        })
        return
      }

      const capabilities = track.getCapabilities()

      if ('torch' in capabilities && capabilities.torch) {
        await track.applyConstraints({
          advanced: [{ torch: !torchOn }] as any,
        })
        setTorchOn(!torchOn)
      } else {
        toast({
          title: "Torch Unavailable",
          description: "Your device does not support torch control.",
        })
      }
    } catch (error) {
      console.error("Error toggling torch:", error)
      toast({
        title: "Torch Error",
        description: "Failed to toggle torch. Please try again.",
        variant: "destructive",
      })
    }
  }

  const resetScan = () => {
    setScanResult(null)
  }

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current)
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  return (
    <div className="max-w-md mx-auto">
      <Tabs defaultValue="scanner">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="scanner">Scanner</TabsTrigger>
          <TabsTrigger value="history">Scan History</TabsTrigger>
        </TabsList>

        <TabsContent value="scanner">
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Scan Ticket QR Code</CardTitle>
              <CardDescription>Point your camera at a ticket QR code to verify entry.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-black mb-4">
                {scanning ? (
                  <>
                    <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" playsInline />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-64 h-64 border-2 border-primary rounded-lg opacity-70"></div>
                    </div>
                  </>
                ) : scanResult ? (
                  <div
                    className={`absolute inset-0 flex flex-col items-center justify-center ${
                      scanResult.valid ? "bg-green-900/20" : "bg-red-900/20"
                    }`}
                  >
                    <div className={`rounded-full p-4 ${scanResult.valid ? "bg-green-500/20" : "bg-red-500/20"} mb-4`}>
                      {scanResult.valid ? (
                        <Check className="h-12 w-12 text-green-500" />
                      ) : (
                        <X className="h-12 w-12 text-red-500" />
                      )}
                    </div>
                    {scanResult.valid ? (
                      <div className="text-center">
                        <h3 className="text-xl font-bold text-green-500 mb-1">Valid Ticket</h3>
                        <p className="text-muted-foreground mb-1">ID: {scanResult.ticket?.id}</p>
                        <p className="text-muted-foreground mb-1">Event: {scanResult.ticket?.eventName}</p>
                        <p className="text-muted-foreground">Date: {scanResult.ticket?.eventDate}</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <h3 className="text-xl font-bold text-red-500 mb-2">Invalid Ticket</h3>
                        <p className="text-muted-foreground">This QR code is not valid or has already been used.</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-secondary/50">
                    <QrCode className="h-16 w-16 text-muted-foreground mb-4" />
                    <p className="text-center text-muted-foreground">Ready to scan ticket QR codes</p>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              {scanning ? (
                <>
                  <Button variant="outline" onClick={toggleTorch} type="button">
                    <Lightbulb className={`mr-2 h-4 w-4 ${torchOn ? "text-yellow-400" : ""}`} />
                    {torchOn ? "Torch On" : "Torch Off"}
                  </Button>
                  <Button variant="destructive" onClick={stopScanner} type="button">
                    Stop Scanning
                  </Button>
                </>
              ) : scanResult ? (
                <Button className="w-full" onClick={resetScan} type="button">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Scan Another Ticket
                </Button>
              ) : (
                <Button className="w-full" onClick={startScanner} type="button" disabled={isStartingScanner}>
                  {isStartingScanner ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <QrCode className="mr-2 h-4 w-4" />
                  )}
                  {isStartingScanner ? "Starting Camera..." : "Start Scanning"}
                </Button>
              )}
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Scan History</CardTitle>
              <CardDescription>Recent ticket scans and their results.</CardDescription>
            </CardHeader>
            <CardContent>
              {scanHistory.length > 0 ? (
                <div className="space-y-4">
                  {scanHistory.map((scan, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        {scan.valid ? (
                          <div className="bg-green-500/20 rounded-full p-1 mr-3">
                            <Check className="h-4 w-4 text-green-500" />
                          </div>
                        ) : (
                          <div className="bg-red-500/20 rounded-full p-1 mr-3">
                            <X className="h-4 w-4 text-red-500" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{scan.id}</p>
                          <p className="text-xs text-muted-foreground">{scan.time}</p>
                        </div>
                      </div>
                      <Badge variant={scan.valid ? "default" : "destructive"}>{scan.valid ? "Valid" : "Invalid"}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Ticket className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Scan History</h3>
                  <p className="text-muted-foreground">Scan a ticket QR code to see the history here.</p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => setScanHistory([])} type="button">
                Clear History
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

