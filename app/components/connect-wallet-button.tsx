"use client"

import { useState } from "react"
import { Button } from "./ui/button"
import { Wallet, Loader2 } from "lucide-react"
import { useWallet } from "./wallet-provider"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog"
import { toast } from "./ui/use-toast"

export function ConnectWalletButton() {
  const { isConnected, connect, disconnect, address, isConnecting: isWalletConnecting } = useWallet()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isDisconnecting, setIsDisconnecting] = useState(false)

  const handleConnect = async (type: "plug" | "ii") => {
    try {
      setIsConnecting(true)
      await connect(type)
      setIsDialogOpen(false)
      toast({
        title: "Wallet connected",
        description: `You have successfully connected your ${type === "plug" ? "Plug" : "Internet Identity"} wallet.`,
      })
    } catch (error) {
      console.error("Connection error:", error)
      toast({
        title: "Connection failed",
        description: "Failed to connect wallet. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    try {
      setIsDisconnecting(true)
      await disconnect()
      toast({
        title: "Wallet disconnected",
        description: "You have successfully disconnected your wallet.",
      })
    } catch (error) {
      console.error("Disconnection error:", error)
      toast({
        title: "Disconnection failed",
        description: "Failed to disconnect wallet. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDisconnecting(false)
    }
  }

  if (isConnected) {
    return (
      <Button
        variant="outline"
        onClick={handleDisconnect}
        className="border-border/60 hover:bg-secondary"
        disabled={isDisconnecting}
      >
        {isDisconnecting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wallet className="mr-2 h-4 w-4" />}
        {address?.slice(0, 6)}...{address?.slice(-4)}
      </Button>
    )
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-border/60 hover:bg-secondary">
          <Wallet className="mr-2 h-4 w-4" />
          Connect Wallet
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect Wallet</DialogTitle>
          <DialogDescription>Connect your wallet to mint and manage NFT tickets.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Button
            onClick={() => handleConnect("plug")}
            className="w-full"
            disabled={isConnecting || isWalletConnecting}
          >
            {isConnecting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <img
                src="/placeholder.svg?height=24&width=24&text=Plug"
                alt="Plug Wallet"
                className="mr-2 h-6 w-6"
                crossOrigin="anonymous"
              />
            )}
            Connect with Plug
          </Button>
          <Button
            onClick={() => handleConnect("ii")}
            variant="outline"
            className="w-full"
            disabled={isConnecting || isWalletConnecting}
          >
            {isConnecting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <img
                src="/placeholder.svg?height=24&width=24&text=II"
                alt="Internet Identity"
                className="mr-2 h-6 w-6"
                crossOrigin="anonymous"
              />
            )}
            Connect with Internet Identity
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

