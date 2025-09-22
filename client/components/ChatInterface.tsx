"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import {
  Send,
  Paperclip,
  MoreVertical,
  Phone,
  Video,
  User,
  FileText,
  Image,
  Download,
  Loader2
} from "lucide-react"
import { getSupabaseClient } from "@/lib/supabaseClient"
import { API_URL } from "@/lib/constants"

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

interface ChatInterfaceProps {
  conversationId: string
  currentUserId: string
  otherUserName: string
  onClose?: () => void
}

export function ChatInterface({
  conversationId,
  currentUserId,
  otherUserName,
  onClose
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
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

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Set new timeout to stop typing indicator
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
    loadMessages()
    connectWebSocket()

    return () => {
      if (ws) {
        ws.close()
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [conversationId])

  const loadMessages = async (loadMore = false) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const currentOffset = loadMore ? offset : 0
      const response = await fetch(
        `${API_URL}/api/chat/messages/${conversationId}?limit=50&offset=${currentOffset}`,
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
    } catch (error) {
      toast.error("Failed to load messages")
    } finally {
      setIsLoading(false)
    }
  }

  const connectWebSocket = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session || !API_URL) return

      const websocket = new WebSocket(
        `${API_URL.replace('http', 'ws')}/ws/chat/${conversationId}`
      )

      // Send authorization header as first message
      websocket.onopen = () => {
        console.log("WebSocket connected")
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
            // Check if this is a response to our own message
            const tempMessageIndex = prev.findIndex(m => m.id.startsWith('temp-') && m.content === data.message.content && m.sender_id === currentUserId)
            if (tempMessageIndex !== -1) {
              // Replace the temporary message with the real one
              const newMessages = [...prev]
              newMessages[tempMessageIndex] = { ...data.message, status: 'sent' as const }
              return newMessages
            }

            // Check if message already exists
            const exists = prev.find(m => m.id === data.message.id)
            if (exists) return prev

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
        console.log("WebSocket disconnected")
        setIsConnected(false)
        setWs(null)
        // Attempt to reconnect after 5 seconds
        setTimeout(connectWebSocket, 5000)
      }

      websocket.onerror = (error) => {
        console.error("WebSocket error:", error)
      }
    } catch (error) {
      console.error("Failed to connect WebSocket:", error)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || isSending) return

    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      conversation_id: conversationId,
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
        // Send via WebSocket
        ws.send(JSON.stringify({
          type: "message",
          content: newMessage,
          message_type: "text"
        }))

        // Clear input immediately
        setNewMessage("")

        // Update status to sent
        setMessages(prev => prev.map(msg =>
          msg.id === tempMessage.id ? { ...msg, status: 'sent' as const } : msg
        ))
      } else {
        // Fallback to HTTP
        const response = await fetch(`${API_URL}/api/chat/messages`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            conversation_id: conversationId,
            content: newMessage,
            message_type: "text"
          }),
        })

        if (response.ok) {
          const message = await response.json()
          // Replace temp message with real message
          setMessages(prev => prev.map(msg =>
            msg.id === tempMessage.id ? { ...message, status: 'sent' as const } : msg
          ))
        } else {
          // Remove temp message on error
          setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id))
        }
      }

      setNewMessage("")
    } catch (error) {
      // Remove temp message on error
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id))
      toast.error("Failed to send message")
    } finally {
      setIsSending(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setUploadProgress(0)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      // First upload the file
      const formData = new FormData()
      formData.append("file", file)
      formData.append("conversation_id", conversationId)

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

      // Then send the file message
      const messageFormData = new FormData()
      messageFormData.append("file_url", uploadData.file_url)
      messageFormData.append("file_name", uploadData.file_name)
      messageFormData.append("file_type", uploadData.file_type)
      messageFormData.append("file_size", uploadData.file_size.toString())
      messageFormData.append("conversation_id", conversationId)

      const messageResponse = await fetch(`${API_URL}/api/chat/send-file-message`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: messageFormData,
      })

      if (messageResponse.ok) {
        const data = await messageResponse.json()
        setUploadProgress(100)
        // Message will be added via WebSocket broadcast
        toast.success("File uploaded successfully")
      }
    } catch (error) {
      toast.error("Failed to upload file")
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
      // Clear the file input
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

  if (isLoading) {
    return (
      <Card className="h-[600px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading chat...</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="h-[600px] sm:h-[500px] md:h-[600px] flex flex-col max-w-full overflow-hidden">
      <CardHeader className="flex flex-row items-center space-y-0 pb-2 px-3 sm:px-4 flex-shrink-0">
        <div className="flex items-center space-x-2 min-w-0 flex-1">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-primary-foreground font-medium text-sm">
              {otherUserName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <CardTitle className="text-sm font-medium truncate">
              {otherUserName}
            </CardTitle>
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
                <span className="text-xs text-muted-foreground">typing...</span>
              )}
            </div>
          </div>
        </div>
        <div className="ml-auto flex items-center space-x-1 flex-shrink-0">
          <Button variant="ghost" size="sm" className="hidden sm:flex">
            <Phone className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="hidden sm:flex">
            <Video className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <Separator />

      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        <ScrollArea className="flex-1 p-4 overflow-y-auto">
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
          <div className="space-y-4 pb-4">
            {messages.map((message, index) => (
              <div
                key={`${message.id}-${index}`}
                className={`flex ${
                  message.sender_id === currentUserId ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[70%] rounded-lg p-3 break-words overflow-hidden ${
                    message.sender_id === currentUserId
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  {message.message_type === "file" && message.message_attachments?.[0] ? (
                    <div className="space-y-2">
                      {message.message_attachments[0].file_type.startsWith('image/') ? (
                        <div className="space-y-2">
                          <div className="relative">
                            <img
                              src={message.message_attachments[0].file_url}
                              alt={message.message_attachments[0].file_name}
                              className="max-w-full h-auto rounded-lg max-h-64 object-contain"
                              onLoad={() => console.log('Image loaded')}
                              onError={(e) => {
                                e.currentTarget.style.display = 'none'
                                const parent = e.currentTarget.parentElement
                                if (parent) {
                                  const errorDiv = document.createElement('div')
                                  errorDiv.className = 'flex items-center justify-center h-32 bg-muted rounded-lg'
                                  errorDiv.innerHTML = '<span class="text-sm text-muted-foreground">Failed to load image</span>'
                                  parent.appendChild(errorDiv)
                                }
                              }}
                            />
                          </div>
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
                    <p className="text-sm break-words whitespace-pre-wrap overflow-wrap-anywhere word-break-break-word">
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
        </ScrollArea>

        <div className="p-3 sm:p-4 border-t flex-shrink-0">
          {isUploading && (
            <div className="mb-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
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
      </CardContent>
    </Card>
  )
}
