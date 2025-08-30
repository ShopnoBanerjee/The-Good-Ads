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
  Download
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
  const [isSending, setIsSending] = useState(false)
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = getSupabaseClient()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
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
            const exists = prev.find(m => m.id === data.message.id)
            if (exists) return prev
            return [...prev, data.message]
          })
        } else if (data.type === "typing") {
          setIsTyping(data.is_typing)
        } else if (data.type === "user_left") {
          setIsOnline(false)
        }
      }

      websocket.onclose = () => {
        console.log("WebSocket disconnected")
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
          setMessages(prev => [...prev, message])
        }
      }

      setNewMessage("")
    } catch (error) {
      toast.error("Failed to send message")
    } finally {
      setIsSending(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

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
        // Message will be added via WebSocket broadcast
      }
    } catch (error) {
      toast.error("Failed to upload file")
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
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="flex flex-row items-center space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <span className="text-primary-foreground font-medium">{otherUserName.charAt(0).toUpperCase()}</span>
          </div>
          <div>
            <CardTitle className="text-sm font-medium">{otherUserName}</CardTitle>
            <div className="flex items-center space-x-1">
              <Badge variant={isOnline ? "default" : "secondary"} className="text-xs">
                {isOnline ? "Online" : "Offline"}
              </Badge>
              {isTyping && (
                <span className="text-xs text-muted-foreground">typing...</span>
              )}
            </div>
          </div>
        </div>
        <div className="ml-auto flex items-center space-x-1">
          <Button variant="ghost" size="sm">
            <Phone className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Video className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <Separator />

      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4">
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
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={`${message.id}-${index}`}
                className={`flex ${
                  message.sender_id === currentUserId ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    message.sender_id === currentUserId
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  {message.message_type === "file" && message.message_attachments?.[0] ? (
                    <div className="space-y-2">
                      {message.message_attachments[0].file_type.startsWith('image/') ? (
                        <div className="space-y-2">
                          <img
                            src={message.message_attachments[0].file_url}
                            alt={message.message_attachments[0].file_name}
                            className="max-w-full h-auto rounded-lg max-h-64 object-contain"
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
                    <p className="text-sm">{message.content}</p>
                  )}
                  <div className="text-xs opacity-70 mt-1">
                    {new Date(message.created_at).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="p-4 border-t">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              onKeyPress={(e) => {
                if (e.key === "Enter" && !isSending) {
                  e.preventDefault()
                  sendMessage()
                }
              }}
              className="flex-1"
            />
            <Button onClick={sendMessage} disabled={isSending || !newMessage.trim()}>
              <Send className="h-4 w-4" />
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
