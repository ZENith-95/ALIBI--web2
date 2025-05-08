"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs"
import { Lightbulb, Check, X, RefreshCw, QrCode, Ticket, Loader2, AlertCircle } from "lucide-react"
import { toast } from "./ui/use-toast"
import { Badge } from "./ui/badge"
import jsQR from "jsqr";
import { supabaseApi } from "../lib/supabaseApi"; // Import Supabase API

// Define the structure for scan results, including potential ticket info
interface ScanResultData {
  valid: boolean;
  message: string;
  ticketId?: string; 
  details?: string; // e.g., Event name if needed later
}

export function QRScanner() {
  const [scanning, setScanning] = useState(false)
  const [torchOn, setTorchOn] = useState(false)
  const [scanResult, setScanResult] = useState<ScanResultData | null>(null)
  const [scanHistory, setScanHistory] = useState<Array<{ id: string; time: string; valid: boolean }>>([])
  const [isStartingScanner, setIsStartingScanner] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false); // State for verification loading
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null); // Ref for canvas element
  const streamRef = useRef<MediaStream | null>(null)
  const animationFrameRef = useRef<number | null>(null); // Ref for animation frame

  // Function to draw video frame onto canvas and scan for QR code
  const scanFrame = useCallback(() => {
    if (!scanning || !videoRef.current || !canvasRef.current || videoRef.current.readyState !== videoRef.current.HAVE_ENOUGH_DATA) {
      if (scanning) animationFrameRef.current = requestAnimationFrame(scanFrame); // Keep scanning if active
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d", { willReadFrequently: true });

    if (!context) {
       console.error("Could not get 2D context from canvas");
       animationFrameRef.current = requestAnimationFrame(scanFrame);
       return;
    }

    // Set canvas dimensions to match video
    canvas.height = video.videoHeight;
    canvas.width = video.videoWidth;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Get image data from canvas
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    
    // Attempt to decode QR code
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: "dontInvert",
    });

    if (code) {
      console.log("QR Code detected:", code.data);
      setScanning(false); // Stop scanning animation loop
      setIsVerifying(true); // Show verification spinner
      
      // Assume code.data is the ticketId (UUID string)
      const ticketId = code.data;

      // Call Supabase to verify the ticket
      supabaseApi.verifyTicket(ticketId)
        .then(result => {
          let scanData: ScanResultData;
          if ('data' in result && result.data === true) {
            // Ticket verified successfully
            scanData = { valid: true, message: "Valid Ticket", ticketId: ticketId };
            toast({ title: "Valid Ticket", description: `Ticket ${ticketId} verified.` });
            setScanHistory(prev => [{ id: ticketId, time: new Date().toLocaleTimeString(), valid: true }, ...prev].slice(0, 10));
          } else if ('data' in result && result.data === false) {
             // Ticket was valid but already used
             scanData = { valid: false, message: "Ticket Already Used", ticketId: ticketId };
             toast({ title: "Already Used", description: `Ticket ${ticketId} has already been used.`, variant: "destructive" });
             setScanHistory(prev => [{ id: ticketId, time: new Date().toLocaleTimeString(), valid: false }, ...prev].slice(0, 10));
          } else {
            // Error occurred during verification (NotFound, SystemError, etc.)
            const errorType = ('error' in result) ? result.error.type : 'Unknown';
            scanData = { valid: false, message: `Verification Failed (${errorType})`, ticketId: ticketId };
            toast({ title: "Verification Failed", description: `Could not verify ticket ${ticketId}. Error: ${errorType}`, variant: "destructive" });
            setScanHistory(prev => [{ id: ticketId, time: new Date().toLocaleTimeString(), valid: false }, ...prev].slice(0, 10));
          }
          setScanResult(scanData);
          stopScanner(false); // Stop camera but keep result displayed
        })
        .catch(err => {
           console.error("Error calling verifyTicket:", err);
           setScanResult({ valid: false, message: "Verification Error", ticketId: ticketId });
           toast({ title: "Verification Error", description: "An unexpected error occurred during verification.", variant: "destructive" });
           setScanHistory(prev => [{ id: ticketId, time: new Date().toLocaleTimeString(), valid: false }, ...prev].slice(0, 10));
           stopScanner(false);
        })
        .finally(() => {
           setIsVerifying(false);
        });

    } else {
      // No QR code found in this frame, continue scanning
      animationFrameRef.current = requestAnimationFrame(scanFrame);
    }
  }, [scanning]); // Dependency array includes scanning state

  const startScanner = async () => {
    if (scanning || isStartingScanner) return;
    
    try {
      setIsStartingScanner(true);
      setScanResult(null); // Clear previous result
      const constraints = {
        video: {
          facingMode: "environment", // Use rear camera
          width: { ideal: 640 }, // Smaller resolution might be faster
          height: { ideal: 480 },
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // Ensure video plays before starting scan loop
        videoRef.current.onloadedmetadata = () => {
           if (videoRef.current) {
              videoRef.current.play().then(() => {
                 setScanning(true);
                 // Create canvas element dynamically if it doesn't exist
                 if (!canvasRef.current) {
                    canvasRef.current = document.createElement('canvas');
                 }
                 // Start the scanning loop
                 animationFrameRef.current = requestAnimationFrame(scanFrame);
              }).catch(err => {
                 console.error("Error playing video:", err);
                 toast({ title: "Camera Error", description: "Could not play video stream.", variant: "destructive" });
                 stopScanner();
              });
           }
        };
      } else {
         throw new Error("Video element not available");
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      let message = "Unable to access camera. Please check permissions.";
      if (error instanceof Error && error.name === "NotAllowedError") {
         message = "Camera access denied. Please grant permission in your browser settings.";
      } else if (error instanceof Error && error.name === "NotFoundError") {
         message = "No suitable camera found. Ensure a rear camera is available.";
      }
      toast({ title: "Camera Error", description: message, variant: "destructive" });
      stopScanner(); // Ensure cleanup if start fails
    } finally {
      setIsStartingScanner(false);
    }
  };

  // Modified stopScanner to optionally keep the result displayed
  const stopScanner = (clearResult = true) => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.onloadedmetadata = null; // Clean up listener
    }

    setScanning(false);
    setTorchOn(false);
    setIsVerifying(false); // Ensure verification spinner stops
    if (clearResult) {
       setScanResult(null); // Clear result only if requested
    }
  };

  const toggleTorch = async () => {
    // Torch toggle logic remains largely the same
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (!track) return;
    const capabilities = track.getCapabilities();
    if ('torch' in capabilities && capabilities.torch) {
      try {
        await track.applyConstraints({ advanced: [{ torch: !torchOn }] as any });
        setTorchOn(!torchOn);
      } catch (error) {
        console.error("Error toggling torch:", error);
        toast({ title: "Torch Error", description: "Failed to toggle torch.", variant: "destructive" });
      }
    } else {
      toast({ title: "Torch Unavailable", description: "Torch control not supported." });
    }
  };

  const resetScan = () => {
    stopScanner(true); // Stop scanner and clear result
  };

  // Clean up on unmount
  useEffect(() => {
    return () => stopScanner(true);
  }, []);

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
                {/* Video Element */}
                <video ref={videoRef} className={`absolute inset-0 w-full h-full object-cover ${!scanning && !scanResult ? 'hidden' : ''}`} playsInline muted />
                
                {/* Scanning Indicator */}
                {scanning && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-64 h-64 border-2 border-primary rounded-lg opacity-70 animate-pulse"></div>
                  </div>
                )}

                {/* Verification Loading Indicator */}
                {isVerifying && (
                   <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70">
                      <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                      <p className="text-primary">Verifying Ticket...</p>
                   </div>
                )}

                {/* Scan Result Display */}
                {!scanning && !isVerifying && scanResult && (
                  <div
                    className={`absolute inset-0 flex flex-col items-center justify-center p-4 ${
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
                    <div className="text-center">
                       <h3 className={`text-xl font-bold ${scanResult.valid ? "text-green-500" : "text-red-500"} mb-1`}>{scanResult.message}</h3>
                       {scanResult.ticketId && <p className="text-muted-foreground mb-1">ID: {scanResult.ticketId}</p>}
                       {/* Add more details if needed */}
                    </div>
                  </div>
                )}

                {/* Initial State Prompt */}
                {!scanning && !scanResult && !isVerifying && (
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
                  <Button variant="destructive" onClick={() => stopScanner(true)} type="button">
                    Stop Scanning
                  </Button>
                </>
              ) : scanResult || isVerifying ? ( // Show reset button if showing result OR verifying
                <Button className="w-full" onClick={resetScan} type="button" disabled={isVerifying}>
                   {isVerifying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                   {isVerifying ? "Verifying..." : "Scan Another Ticket"}
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
                          <p className="font-medium truncate max-w-[150px] sm:max-w-xs" title={scan.id}>{scan.id}</p> {/* Truncate long IDs */}
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
