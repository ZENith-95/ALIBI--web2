"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface WalletContextType {
  isConnected: boolean
  address: string | null
  connect: (type: "plug" | "ii") => Promise<void>
  disconnect: () => Promise<void>
  isConnecting: boolean
}

const WalletContext = createContext<WalletContextType>({
  isConnected: false,
  address: null,
  connect: async () => {},
  disconnect: async () => {},
  isConnecting: false,
})

export function WalletProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)

  // Check if wallet is already connected on mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        // In a real implementation, we would check if the user is already connected
        // For now, we'll just use localStorage as a simple example
        const savedAddress = localStorage.getItem("walletAddress")
        const walletType = localStorage.getItem("walletType")

        if (savedAddress && walletType) {
          setIsConnected(true)
          setAddress(savedAddress)
        }
      } catch (error) {
        console.error("Failed to check wallet connection:", error)
        // Don't throw here, just log the error
      }
    }

    checkConnection()
  }, [])

  const connect = async (type: "plug" | "ii") => {
    try {
      setIsConnecting(true)
      // In a real implementation, we would connect to the actual wallet
      // For ICP wallets, we would use their specific APIs

      let mockAddress = ""

      if (type === "plug") {
        // Simulate Plug wallet connection
        mockAddress = "aaaaa-bbbbb-ccccc-ddddd-eeeee-fffff-ggggg-hhhhh-iiiii"

        // In a real implementation, we would use something like:
        // const connected = await window.ic?.plug?.requestConnect({
        //   whitelist: ['canister-id-1', 'canister-id-2'],
        // });
      } else if (type === "ii") {
        // Simulate Internet Identity connection
        mockAddress = "2vxsx-fae"

        // In a real implementation, we would use the Internet Identity SDK
      }

      setIsConnected(true)
      setAddress(mockAddress)
      localStorage.setItem("walletAddress", mockAddress)
      localStorage.setItem("walletType", type)
      return Promise.resolve()
    } catch (error) {
      console.error("Failed to connect wallet:", error)
      return Promise.reject(error)
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnect = async () => {
    try {
      // In a real implementation, we would disconnect from the actual wallet
      setIsConnected(false)
      setAddress(null)
      localStorage.removeItem("walletAddress")
      localStorage.removeItem("walletType")
      return Promise.resolve()
    } catch (error) {
      console.error("Failed to disconnect wallet:", error)
      return Promise.reject(error)
    }
  }

  return (
    <WalletContext.Provider value={{ isConnected, address, connect, disconnect, isConnecting }}>
      {children}
    </WalletContext.Provider>
  )
}

export const useWallet = () => useContext(WalletContext)

