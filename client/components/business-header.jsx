"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { Moon, Sun, LogOut } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export default function BusinessHeader() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  async function handleSignOut() {
    const supabase = getSupabaseClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  if (!mounted) {
    return null
  }

  return (
    <header className="w-full bg-secondary border-b border-border sticky top-0 z-50 backdrop-blur-sm shadow-sm">
      <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo/Brand */}
        <div className="flex items-center space-x-3">
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/bg%20logo%201-ejLH20YesjIfnMx3euEFPYrzarGuy5.png"
            alt="Initialt Logo"
            className="h-8 w-auto"
          />
          <span className="font-bold text-xl text-text">Business Portal</span>
        </div>

        {/* Navigation Links */}
        <div className="flex items-center space-x-8">
          <Link
            href="/dashboard/business"
            className="font-medium text-lg text-text hover:text-accent transition-colors duration-200 relative group"
          >
            Dashboard
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all duration-200 group-hover:w-full"></span>
          </Link>
          <Link
            href="/dashboard/business/add-project"
            className="font-medium text-lg text-text hover:text-accent transition-colors duration-200 relative group"
          >
            Create Project
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all duration-200 group-hover:w-full"></span>
          </Link>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-4">
          {/* Dark Mode Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="text-text hover:bg-primary hover:text-accent transition-colors duration-200 h-10 w-10 p-0"
          >
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>

          {/* Sign Out Button */}
          <Button
            onClick={handleSignOut}
            className="btn-primary px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2 h-10"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </Button>
        </div>
      </nav>
    </header>
  )
}
