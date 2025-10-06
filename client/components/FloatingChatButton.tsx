"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, X } from "lucide-react"

interface FloatingChatButtonProps {
  onClick: () => void
  isOpen: boolean
  unreadCount?: number
  className?: string
}

export function FloatingChatButton({
  onClick,
  isOpen,
  unreadCount = 0,
  className = ""
}: FloatingChatButtonProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Show button after component mounts
    const timer = setTimeout(() => setIsVisible(true), 1000)
    return () => clearTimeout(timer)
  }, [])

  if (!isVisible) return null

  return (
    <div className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 ${className}`}>
      <div className="relative">
        <Button
          onClick={onClick}
          size="lg"
          className={`
            h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out
            bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700
            dark:from-blue-600 dark:to-indigo-700 dark:hover:from-blue-700 dark:hover:to-indigo-800
            ${isOpen ? 'rotate-180 scale-110' : 'hover:scale-105'}
          `}
          aria-label={isOpen ? 'Close chat' : unreadCount > 0 ? `Open chat with ${unreadCount} unread message${unreadCount > 1 ? 's' : ''}` : 'Open chat'}
          aria-expanded={isOpen}
          aria-describedby="chat-tooltip"
        >
          {isOpen ? (
            <X className="h-6 w-6 text-white" />
          ) : (
            <MessageSquare className="h-6 w-6 text-white" />
          )}
        </Button>

        {/* Unread indicator */}
        {unreadCount > 0 && !isOpen && (
          <Badge
            variant="destructive"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs font-bold animate-pulse"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}

        {/* Pulse animation when there are unread messages */}
        {unreadCount > 0 && !isOpen && (
          <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-20" />
        )}

        {/* Tooltip */}
        <div
          id="chat-tooltip"
          className={`
            absolute bottom-full right-0 mb-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg
            whitespace-nowrap opacity-0 pointer-events-none transition-opacity duration-200
            ${!isOpen ? 'group-hover:opacity-100' : ''}
          `}
        >
          {isOpen ? 'Close chat' : unreadCount > 0 ? `${unreadCount} unread message${unreadCount > 1 ? 's' : ''}` : 'Open messages'}
          <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
        </div>
      </div>
    </div>
  )
}