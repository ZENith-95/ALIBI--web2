"use client"

import { Button } from "./ui/button"
import { useState } from "react"
import { testAuthentication, logout } from "../lib/auth-test"

export function DebugAuthButton() {
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async () => {
    try {
      setIsLoading(true)
      await testAuthentication()
    } catch (error) {
      console.error("Authentication error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      setIsLoading(true)
      await logout()
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex space-x-4">
      <Button onClick={handleLogin} disabled={isLoading}>
        {isLoading ? "Loading..." : "Debug Login"}
      </Button>
      <Button onClick={handleLogout} disabled={isLoading} variant="outline">
        Debug Logout
      </Button>
    </div>
  )
} 