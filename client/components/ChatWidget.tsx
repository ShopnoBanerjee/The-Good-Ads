"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import {
  Send,
  Paperclip,
  FileText,
  Image,
  Download,
  Loader2,
  Search,
  X,
  MessageSquare,
  Minimize2,
  User
} from "lucide-react"
import { getSupabaseClient } from "@/lib/supabaseClient"
import { API_URL } from "@/lib/constants"
import ImageComponent from "next/image"

interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  message_type: string
  created_at: string
  is_read: boolean
  status?: 'sending' | 'sent' | 'delivered' | 'read'
  message_attachments?: Attachment[]
}

interface Attachment {
  id: string
  file_url: string
  file_name: string
  file_type: string
  file_size: number
}

interface Conversation {
  id: string
  project_id: string
  business_id: string
  society_id: string
  created_at: string
  updated_at: string
  projects: {
    compliant_name: string
    compliant_description: string
  }
}

interface ChatWidgetProps {
  currentUserId: string
  currentUserType: 'business' | 'college_society'
  isOpen: boolean
  onClose: () => void
  onMinimize?: () => void
  onUnreadCountChange?: (updater: (prev: number) => number) => void
  className?: string
}

export function ChatWidget({
  currentUserId,
  currentUserType,
  isOpen,
  onClose,
  onMinimize,
  onUnreadCountChange,
  className = ""
}: ChatWidgetProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoadingConversations, setIsLoadingConversations] = useState(true)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [isOnline, setIsOnline] = useState(false)
  const [ws, setWs] = useState<WebSocket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [currentUserTyping, setCurrentUserTyping] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const supabase = getSupabaseClient()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleTyping = () => {
    if (!currentUserTyping && ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: "typing_start" }))
      setCurrentUserTyping(true)
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "typing_stop" }))
      }
      setCurrentUserTyping(false)
    }, 1000)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value)
    handleTyping()
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (activeConversation) {
      loadMessages()
      connectWebSocket()
    }

    return () => {
      if (ws) {
        ws.close()
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [activeConversation]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadConversations = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const response = await fetch(`${API_URL}/api/chat/conversations`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setConversations(data)
      } else {
        toast.error("Failed to load conversations")
      }
    } catch {
      toast.error("Failed to load conversations")
    } finally {
      setIsLoadingConversations(false)
    }
  }, [supabase.auth])

  useEffect(() => {
    if (isOpen) {
      loadConversations()
    }
  }, [isOpen, loadConversations])

  const loadMessages = async (loadMore = false) => {
    if (!activeConversation) return

    setIsLoadingMessages(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const currentOffset = loadMore ? offset : 0
      const response = await fetch(
        `${API_URL}/api/chat/messages/${activeConversation.id}?limit=50&offset=${currentOffset}`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      )

      if (response.ok) {
        const data = await response.json()
        if (loadMore) {
          setMessages(prev => [...data.reverse(), ...prev])
          setOffset(prev => prev + 50)
        } else {
          setMessages(data.reverse())
          setOffset(50)
        }
        if (data.length < 50) {
          setHasMore(false)
        }
      }
    } catch {
      toast.error("Failed to load messages")
    } finally {
      setIsLoadingMessages(false)
    }
  }

  const connectWebSocket = async () => {
    if (!activeConversation) return

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session || !API_URL) return

      const websocket = new WebSocket(
        `${API_URL.replace('http', 'ws')}/ws/chat/${activeConversation.id}`
      )

      websocket.onopen = () => {
        setIsConnected(true)
        websocket.send(JSON.stringify({
          type: "auth",
          token: session.access_token
        }))
        setWs(websocket)
      }

      websocket.onmessage = (event) => {
        const data = JSON.parse(event.data)

        if (data.type === "new_message") {
          setMessages(prev => {
            const tempMessageIndex = prev.findIndex(m => m.id.startsWith('temp-') && m.content === data.message.content && m.sender_id === currentUserId)
            if (tempMessageIndex !== -1) {
              const newMessages = [...prev]
              newMessages[tempMessageIndex] = { ...data.message, status: 'sent' as const }
              return newMessages
            }

            const exists = prev.find(m => m.id === data.message.id)
            if (exists) return prev

            // If chat is not open, increment unread count
            if (!isOpen && onUnreadCountChange) {
              onUnreadCountChange((prev: number) => prev + 1)
            }

            return [...prev, data.message]
          })
        } else if (data.type === "typing_start") {
          setIsTyping(true)
        } else if (data.type === "typing_stop") {
          setIsTyping(false)
        } else if (data.type === "user_left") {
          setIsOnline(false)
          setIsTyping(false)
        } else if (data.type === "user_joined") {
          setIsOnline(true)
        }
      }

      websocket.onclose = () => {
        setIsConnected(false)
        setWs(null)
        setTimeout(() => activeConversation && connectWebSocket(), 5000)
      }

      websocket.onerror = (error) => {
        console.error("WebSocket error:", error)
      }
    } catch (error) {
      console.error("Failed to connect WebSocket:", error)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || isSending || !activeConversation) return

    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      conversation_id: activeConversation.id,
      sender_id: currentUserId,
      content: newMessage,
      message_type: "text",
      created_at: new Date().toISOString(),
      is_read: false,
      status: 'sending'
    }

    setMessages(prev => [...prev, tempMessage])
    setIsSending(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: "message",
          content: newMessage,
          message_type: "text"
        }))

        setNewMessage("")
        setMessages(prev => prev.map(msg =>
          msg.id === tempMessage.id ? { ...msg, status: 'sent' as const } : msg
        ))
      } else {
        const response = await fetch(`${API_URL}/api/chat/messages`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            conversation_id: activeConversation.id,
            content: newMessage,
            message_type: "text"
          }),
        })

        if (response.ok) {
          const message = await response.json()
          setMessages(prev => prev.map(msg =>
            msg.id === tempMessage.id ? { ...message, status: 'sent' as const } : msg
          ))
        } else {
          setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id))
        }
      }

      setNewMessage("")
    } catch {
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id))
      toast.error("Failed to send message")
    } finally {
      setIsSending(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !activeConversation) return

    setIsUploading(true)
    setUploadProgress(0)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const formData = new FormData()
      formData.append("file", file)
      formData.append("conversation_id", activeConversation.id)

      const uploadResponse = await fetch(`${API_URL}/api/chat/upload-attachment`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: formData,
      })

      if (!uploadResponse.ok) {
        throw new Error("Upload failed")
      }

      setUploadProgress(50)
      const uploadData = await uploadResponse.json()

      const messageFormData = new FormData()
      messageFormData.append("file_url", uploadData.file_url)
      messageFormData.append("file_name", uploadData.file_name)
      messageFormData.append("file_type", uploadData.file_type)
      messageFormData.append("file_size", uploadData.file_size.toString())
      messageFormData.append("conversation_id", activeConversation.id)

      const messageResponse = await fetch(`${API_URL}/api/chat/send-file-message`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: messageFormData,
      })

      if (messageResponse.ok) {
        setUploadProgress(100)
        toast.success("File uploaded successfully")
      }
    } catch {
      toast.error("Failed to upload file")
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (fileType: string) => {
    // eslint-disable-next-line jsx-a11y/alt-text
    if (fileType.startsWith('image/')) return <Image className="h-4 w-4" />
    return <FileText className="h-4 w-4" />
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return 'now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`

    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h ago`

    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`

    return date.toLocaleDateString()
  }

  const getMessageStatusIcon = (status?: string, isRead?: boolean) => {
    if (status === 'sending') return <Loader2 className="h-3 w-3 animate-spin" />
    if (isRead) return <span className="text-blue-500">✓✓</span>
    if (status === 'delivered') return <span className="text-muted-foreground">✓✓</span>
    if (status === 'sent') return <span className="text-muted-foreground">✓</span>
    return null
  }

  const getOtherUserId = (conversation: Conversation) => {
    return currentUserType === 'business' ? conversation.society_id : conversation.business_id
  }

  const getOtherUserType = () => {
    return currentUserType === 'business' ? 'Society' : 'Business'
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else if (diffInHours < 168) {
      return date.toLocaleDateString([], { weekday: 'short' })
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
    }
  }

  const filteredConversations = conversations.filter(conversation =>
    conversation.projects.compliant_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    getOtherUserId(conversation).toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (!isOpen) return null

  return (
    <div className={`fixed bottom-4 right-4 w-96 max-w-[calc(100vw-2rem)] h-[600px] max-h-[calc(100vh-2rem)] bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 flex flex-col transition-all duration-300 ease-in-out ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-t-xl">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <MessageSquare className="h-4 w-4 text-primary-foreground" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white">
            {activeConversation ? `Chat - ${activeConversation.projects.compliant_name}` : 'Messages'}
          </h3>
        </div>
        <div className="flex items-center space-x-1">
          {onMinimize && (
            <Button variant="ghost" size="sm" onClick={onMinimize}>
              <Minimize2 className="h-4 w-4" />
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {!activeConversation ? (
        /* Conversations List */
        <div className="flex-1 flex flex-col">
          {/* Search */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Conversations */}
          <ScrollArea className="flex-1 overflow-y-auto">
            {isLoadingConversations ? (
              <div className="p-4 space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">
                  {searchQuery ? 'No conversations found' : 'No conversations yet'}
                </p>
                {!searchQuery && (
                  <p className="text-xs mt-1">Accept a proposal to start chatting</p>
                )}
              </div>
            ) : (
              <div className="p-2">
                {filteredConversations.map((conversation) => (
                  <Button
                    key={conversation.id}
                    variant="ghost"
                    className="w-full justify-start h-auto p-3 mb-1 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => setActiveConversation(conversation)}
                  >
                    <div className="flex items-center space-x-3 w-full">
                      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="h-4 w-4 text-primary-foreground" />
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium truncate text-gray-900 dark:text-white">
                            {conversation.projects.compliant_name}
                          </p>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatTime(conversation.updated_at)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-600 dark:text-gray-300 truncate">
                            {getOtherUserType()}: {getOtherUserId(conversation).slice(0, 8)}...
                          </p>
                          <Badge variant="secondary" className="text-xs">
                            Active
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      ) : (
        /* Chat Interface */
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Chat Header */}
          <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            <div className="flex items-center space-x-2 min-w-0 flex-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveConversation(null)}
                className="p-1"
              >
                <X className="h-4 w-4" />
              </Button>
              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-primary-foreground font-medium text-xs">
                  {getOtherUserId(activeConversation).charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate text-gray-900 dark:text-white">
                  {getOtherUserType()} {getOtherUserId(activeConversation).slice(0, 8)}...
                </p>
                <div className="flex items-center space-x-1">
                  <Badge variant={isOnline ? "default" : "secondary"} className="text-xs">
                    {isOnline ? "Online" : "Offline"}
                  </Badge>
                  {!isConnected && (
                    <Badge variant="destructive" className="text-xs">
                      Reconnecting...
                    </Badge>
                  )}
                  {isTyping && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">typing...</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4 overflow-y-auto">
            {isLoadingMessages ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                    <div className="max-w-[70%] rounded-lg p-3 bg-gray-200 dark:bg-gray-700 animate-pulse">
                      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-2" />
                      <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {hasMore && (
                  <Button
                    onClick={() => loadMessages(true)}
                    variant="outline"
                    size="sm"
                    className="w-full mb-4"
                  >
                    Load More Messages
                  </Button>
                )}
                {messages.map((message, index) => (
                  <div
                    key={`${message.id}-${index}`}
                    className={`flex ${
                      message.sender_id === currentUserId ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-lg p-3 break-words overflow-hidden ${
                        message.sender_id === currentUserId
                          ? "bg-primary text-primary-foreground"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                      }`}
                    >
                      {message.message_type === "file" && message.message_attachments?.[0] ? (
                        <div className="space-y-2">
                          {message.message_attachments[0].file_type.startsWith('image/') ? (
                            <div className="space-y-2 max-w-full">
                              <ImageComponent
                                fill
                                src={message.message_attachments[0].file_url}
                                alt={message.message_attachments[0].file_name}
                                className="object-contain"
                              />
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium">
                                  {message.message_attachments[0].file_name}
                                </span>
                              </div>
                              <div className="text-xs opacity-70">
                                {formatFileSize(message.message_attachments[0].file_size)}
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                {getFileIcon(message.message_attachments[0].file_type)}
                                <span className="text-sm font-medium">
                                  {message.message_attachments[0].file_name}
                                </span>
                              </div>
                              <div className="text-xs opacity-70">
                                {formatFileSize(message.message_attachments[0].file_size)}
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => message.message_attachments?.[0] && window.open(message.message_attachments[0].file_url, '_blank')}
                              >
                                <Download className="h-3 w-3 mr-1" />
                                Download
                              </Button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm break-words whitespace-pre-wrap">
                          {message.content}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-1">
                        <div className="text-xs opacity-70">
                          {formatTimestamp(message.created_at)}
                        </div>
                        {message.sender_id === currentUserId && (
                          <div className="text-xs opacity-70 ml-2">
                            {getMessageStatusIcon(message.status, message.is_read)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </ScrollArea>

          {/* Message Input */}
          <div className="p-3 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
            {isUploading && (
              <div className="mb-2">
                <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300 mb-1">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex-shrink-0"
              >
                {isUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Paperclip className="h-4 w-4" />
                )}
              </Button>
              <Input
                value={newMessage}
                onChange={handleInputChange}
                placeholder="Type a message..."
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !isSending) {
                    e.preventDefault()
                    sendMessage()
                  }
                }}
                className="flex-1 min-w-0"
              />
              <Button
                onClick={sendMessage}
                disabled={isSending || !newMessage.trim()}
                className="flex-shrink-0"
              >
                {isSending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileUpload}
              accept="image/*,.pdf,.doc,.docx,.txt"
            />
          </div>
        </div>
      )}
    </div>
  )
}