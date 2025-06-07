'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { authClient } from "@/lib/auth-client"

export default function DashboardPage() {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: session } = await authClient.getSession();
        if (!session) {
          router.push("/auth");
          return;
        }
        setUser(session.user);
      } catch (error) {
        router.push("/auth");
      } finally {
        setIsLoading(false);
      }
    };

    getSession();
  }, [router]);

  const handleSignOut = async () => {
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push('/auth')
          },
        },
      })
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">Welcome, {user.name}</span>
              <Button 
                variant="outline" 
                onClick={handleSignOut}
                className="border-[#11aad4] text-[#11aad4] hover:bg-[#11aad4] hover:text-white transition duration-300"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Welcome Card */}
          <Card className="bg-white text-gray-900">
            <CardHeader>
              <CardTitle className="text-gray-900">Welcome to your Dashboard</CardTitle>
              <CardDescription className="text-gray-600">
                You have successfully signed in to The Good Ads platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <strong className="text-gray-900">Name:</strong>
                  <span className="text-gray-700">{user.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <strong className="text-gray-900">Email:</strong>
                  <span className="text-gray-700">{user.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <strong className="text-gray-900">Status:</strong>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Active
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <strong className="text-gray-900">Member since:</strong>
                  <span className="text-gray-700">{new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-md transition-shadow border-l-4 border-l-[#11aad4] bg-white">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900">Business Ads</CardTitle>
                <CardDescription className="text-gray-600">
                  Manage your business advertising campaigns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full bg-[#11aad4] border border-[#11aad4] text-white hover:text-[#11aad4] hover:bg-white hover:border-[#11aad4] transition duration-300"
                  onClick={() => router.push('/business')}
                >
                  Go to Business
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow border-l-4 border-l-[#11aad4] bg-white">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900">Society Impact</CardTitle>
                <CardDescription className="text-gray-600">
                  View society-focused advertising initiatives
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full border-[#11aad4] text-[#11aad4] bg-white hover:bg-[#11aad4] hover:text-white transition duration-300"
                  variant="outline"
                  onClick={() => router.push('/society')}
                >
                  Go to Society
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow bg-white">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900">Account Settings</CardTitle>
                <CardDescription className="text-gray-600">
                  Update your profile and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full text-gray-700" variant="secondary" disabled>
                  Coming Soon
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-white">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#11aad4]">0</div>
                  <div className="text-sm text-gray-600">Active Campaigns</div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#11aad4]">0</div>
                  <div className="text-sm text-gray-600">Completed Projects</div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#11aad4]">New</div>
                  <div className="text-sm text-gray-600">Account Status</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}