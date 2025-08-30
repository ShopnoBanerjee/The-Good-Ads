"use client"

import { useState, useEffect } from "react"
import { ConversationList } from "@/components/ConversationList"
import { ChatInterface } from "@/components/ChatInterface"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, MessageSquare } from "lucide-react"
import { getSupabaseClient } from "@/lib/supabaseClient"

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

export default function ChatPage() {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string>("")
  const [currentUserType, setCurrentUserType] = useState<'business' | 'college_society'>('business')
  const [isLoading, setIsLoading] = useState(true)
  const supabase = getSupabaseClient()

  useEffect(() => {
    loadUserProfile()
  }, [])

  const loadUserProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', session.user.id)
        .single()

      if (profile) {
        setCurrentUserId(session.user.id)
        setCurrentUserType(profile.user_type)
      }
    } catch (error) {
      console.error('Failed to load user profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getOtherUserName = (conversation: Conversation) => {
    if (currentUserType === 'business') {
      return `Society ${conversation.society_id.slice(0, 8)}...`
    } else {
      return `Business ${conversation.business_id.slice(0, 8)}...`
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading chat...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center space-x-2">
          <MessageSquare className="h-8 w-8" />
          <span>Messages</span>
        </h1>
        <p className="text-muted-foreground mt-2">
          Chat with {currentUserType === 'business' ? 'societies' : 'businesses'} about your projects
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[700px]">
        {/* Conversation List */}
        <div className="lg:col-span-1">
          <ConversationList
            currentUserId={currentUserId}
            currentUserType={currentUserType}
            onSelectConversation={setSelectedConversation}
            selectedConversationId={selectedConversation?.id}
          />
        </div>

        {/* Chat Interface */}
        <div className="lg:col-span-2">
          {selectedConversation ? (
            <div className="h-full">
              <div className="mb-4">
                <Button
                  variant="outline"
                  onClick={() => setSelectedConversation(null)}
                  className="mb-2"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Conversations
                </Button>
              </div>
              <ChatInterface
                conversationId={selectedConversation.id}
                currentUserId={currentUserId}
                otherUserName={getOtherUserName(selectedConversation)}
              />
            </div>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <CardContent className="text-center">
                <MessageSquare className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Select a Conversation</h3>
                <p className="text-muted-foreground">
                  Choose a conversation from the list to start chatting
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
