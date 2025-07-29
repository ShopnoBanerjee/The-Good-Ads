"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { Moon, Sun, LogOut, Building2 } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export default function SocietyHeader() {
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
    <header className="w-full bg-primary text-white shadow-sm border-b border-primary/20 sticky top-0 z-50 backdrop-blur-sm">
      <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo/Brand */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl text-gray-600">Society Portal</span>
        </div>

        {/* Navigation Links */}
        <div className="flex items-center space-x-8">
          <Link
            href="/society/marketplace"
            className="font-medium text-lg hover:text-accent transition-colors duration-200 relative group"
          >
            Marketplace
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all duration-200 group-hover:w-full"></span>
          </Link>
          <Link
            href="/society/portfolio"
            className="font-medium text-lg hover:text-accent transition-colors duration-200 relative group"
          >
            Portfolio
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
            className="text-gray-600 hover:bg-white/10 hover:text-accent transition-colors duration-200"
          >
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>

          {/* Sign Out Button */}
          <Button
            onClick={handleSignOut}
            className="bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </Button>
        </div>
      </nav>
    </header>
  )
}
