"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { getSupabaseClient } from "@/lib/supabaseClient"
import { API_URL } from "@/lib/constants"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import {
  Plus,
  Building2,
  Eye,
  Users,
  Calendar,
  TrendingUp,
  FileText,
  CheckCircle,
  Pencil,
  Trash2,
} from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { ChatWidget } from "@/components/ChatWidget"
import { FloatingChatButton } from "@/components/FloatingChatButton"

// Define the type for each project
interface Project {
  id: string
  business_id: string
  description: string
  status: "draft" | "published" | string
  created_at: string
  proposal_count?: number
  society_id?: string | null
  domains: string[]
  services_offered: string[]
  budget: number
}

interface Stats {
  totalProjects: number
  activeProjects: number
  totalProposals: number
  completedProjects: number
}

export default function BusinessDashboard() {
  const [projects, setProjects] = useState<Project[]>([])
  const [error, setError] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(true)
  const [mounted, setMounted] = useState(false)
  const [stats, setStats] = useState<Stats>({
    totalProjects: 0,
    activeProjects: 0,
    totalProposals: 0,
    completedProjects: 0,
  })
  // Chat state
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string>("")
  const [currentUserType, setCurrentUserType] = useState<'business' | 'college_society'>('business')
  const [unreadCount, setUnreadCount] = useState(0)

  const router = useRouter()
  const { theme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const supabase = getSupabaseClient()
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('user_type')
            .eq('id', session.user.id)
            .single()

          if (profile) {
            setCurrentUserId(session.user.id)
            setCurrentUserType(profile.user_type)
          }
        }
      } catch (error) {
        console.error('Failed to load user profile:', error)
      }
    }

    loadUserProfile()
  }, [])

  useEffect(() => {
    const fetchProjects = async () => {
      const supabase = getSupabaseClient()
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        setError("Not authenticated")
        setLoading(false)
        return
      }

      const token = session.access_token

      try {
        const res = await fetch(`${API_URL}/api/business-projects`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!res.ok) {
          const err = await res.json()
          setError(err.detail || "Failed to load projects")
        } else {
          const data: Project[] = await res.json()
          setProjects(data)

          // Calculate stats
          const totalProjects = data.length
          const activeProjects = data.filter((p) => p.status === "published").length
          const completedProjects = data.filter((p) => p.status === "completed").length
          const totalProposals = data.reduce((sum, p) => sum + (p.proposal_count || 0), 0)

          setStats({
            totalProjects,
            activeProjects,
            totalProposals,
            completedProjects,
          })
        }
      } catch {
        setError("Something went wrong!")
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Open/close chat with Ctrl/Cmd + K
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault()
        setIsChatOpen(!isChatOpen)
        if (!isChatOpen) {
          setUnreadCount(0)
        }
      }
      // Close chat with Escape
      if (event.key === 'Escape' && isChatOpen) {
        setIsChatOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isChatOpen])

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      published: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-700",
      draft: "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-700",
    }

    return (
      <Badge className={`${variants[status] || variants.draft} capitalize font-medium transition-colors duration-200`}>
        {status || "draft"}
      </Badge>
    )
  }

  const handleDeleteProject = async (projectId: string) => {
    try {
      const supabase = getSupabaseClient()
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) throw new Error("Not authenticated")

      const token = session.access_token
      const res = await fetch(`${API_URL}/api/delete-project`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ project_id: projectId }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || "Failed to delete project")
      }

      // Remove from state
      setProjects((prev) => prev.filter((p) => p.id !== projectId))

      toast("Project deleted", {
        description: "Your project has been successfully deleted.",
      })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unknown error occurred"
      setError(message)
      toast.error("Error", {
        description: message,
      })
    }
  }

  if (!mounted) {
    return <div className="min-h-screen bg-white"></div>
  }

  return (
    <>
      
      <main className="min-h-screen bg-white dark:bg-[#15325a] transition-colors duration-200 ease-in-out">
        {/* Header Section */}
        <div 
          className="transition-colors duration-200 ease-in-out text-white"
          style={{
            background: theme === "dark" 
              ? "linear-gradient(135deg, #1a4b6b 0%, #15325a 50%, #0d2847 100%)"
              : "linear-gradient(135deg, #1679A8 0%, #1A97BA 50%, #63C3DD 100%)"
          }}
        >
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-16">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-6 lg:space-y-0">
              <div className="space-y-3 md:space-y-4">
                <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-3 md:px-4 py-2 text-xs md:text-sm font-medium">
                  <Building2 className="w-4 h-4" />
                  <span>Business Dashboard</span>
                </div>
                <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold text-white font-outfit">
                  Manage Your
                  <span className="block text-white/90">Business Projects</span>
                </h1>
                <p className="text-lg md:text-xl text-white/80 max-w-2xl leading-relaxed">
                  Create projects, review proposals from college societies, and manage your collaborations
                </p>
              </div>

              <Button asChild className="bg-white text-blue-600 hover:bg-white/90 px-8 py-3 h-auto w-full sm:w-auto transition-colors duration-200">
                <Link href="/business/add-project" className="flex items-center justify-center space-x-2">
                  <Plus className="w-5 h-5" />
                  <span className="font-semibold">Create New Project</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-6 -mt-6 md:-mt-8 relative z-10 pb-12 md:pb-16">
          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 md:p-6 shadow-lg transition-colors duration-200 ease-in-out">
              <div className="flex items-center space-x-2 md:space-x-3">
                <div className="p-2 md:p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <FileText className="w-4 h-4 md:w-6 md:h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-200">{stats.totalProjects}</p>
                  <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300 transition-colors duration-200">Total Projects</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 md:p-6 shadow-lg transition-colors duration-200 ease-in-out">
              <div className="flex items-center space-x-2 md:space-x-3">
                <div className="p-2 md:p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <TrendingUp className="w-4 h-4 md:w-6 md:h-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-200">{stats.activeProjects}</p>
                  <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300 transition-colors duration-200">Active</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 md:p-6 shadow-lg transition-colors duration-200 ease-in-out">
              <div className="flex items-center space-x-2 md:space-x-3">
                <div className="p-2 md:p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Users className="w-4 h-4 md:w-6 md:h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-200">{stats.totalProposals}</p>
                  <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300 transition-colors duration-200">Proposals</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 md:p-6 shadow-lg transition-colors duration-200 ease-in-out">
              <div className="flex items-center space-x-2 md:space-x-3">
                <div className="p-2 md:p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <CheckCircle className="w-4 h-4 md:w-6 md:h-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-200">{stats.completedProjects}</p>
                  <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300 transition-colors duration-200">Completed</p>
                </div>
              </div>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-xl p-6 mb-8 transition-colors duration-200">
              <p className="text-red-800 dark:text-red-300 text-center font-medium transition-colors duration-200">{error}</p>
            </div>
          )}

          {/* Projects Section */}
          <div className="space-y-4 md:space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white font-outfit transition-colors duration-200">Your Projects</h2>
              {projects.length > 0 && (
                <Button asChild className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 w-full sm:w-auto">
                  <Link href="/business/add-project" className="flex items-center justify-center space-x-2">
                    <Plus className="w-4 h-4" />
                    <span>Add Project</span>
                  </Link>
                </Button>
              )}
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg transition-colors duration-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-3 flex-1">
                          <Skeleton className="h-6 w-64 bg-gray-200 dark:bg-gray-700" />
                          <Skeleton className="h-4 w-48 bg-gray-200 dark:bg-gray-700" />
                          <Skeleton className="h-4 w-32 bg-gray-200 dark:bg-gray-700" />
                        </div>
                        <Skeleton className="h-10 w-32 bg-gray-200 dark:bg-gray-700" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : projects.length === 0 ? (
              /* Empty State */
              <Card className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-dashed border-blue-200 dark:border-blue-700 shadow-lg transition-colors duration-200">
                <CardContent className="p-8 md:p-16 text-center">
                  <div 
                    className="w-20 h-20 md:w-24 md:h-24 rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6 transition-colors duration-200"
                    style={{
                      background: theme === "dark" 
                        ? "linear-gradient(135deg, #1a4b6b 0%, #15325a 50%, #0d2847 100%)"
                        : "linear-gradient(135deg, #1679A8 0%, #1A97BA 50%, #63C3DD 100%)"
                    }}
                  >
                    <Building2 className="w-10 h-10 md:w-12 md:h-12 text-white" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white font-outfit mb-2 transition-colors duration-200">No projects yet</h3>
                  <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto transition-colors duration-200">
                    Create your first project to start collaborating with college societies and receive proposals for your
                    business needs.
                  </p>
                  <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white px-6 md:px-8 py-3 h-auto w-full sm:w-auto transition-colors duration-200">
                    <Link href="/business/add-project" className="flex items-center justify-center space-x-2">
                      <Plus className="w-5 h-5" />
                      <span className="font-semibold">Create Your First Project</span>
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              /* Projects List */
              <div className="space-y-6">
                {projects.map((project) => (
                  <Card
                    key={project.id}
                    className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700/50 overflow-hidden relative"
                  >

                    <CardHeader className="pb-6 pt-8 px-8 relative z-10">
                      <div className="flex items-start justify-between">
                        <div className="space-y-4 flex-1">
                          <div className="min-w-0 flex-1">
                            <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white leading-tight">
                              {project.description.split('\n')[0] || 'Project Title'}
                            </h3>
                            <div className="flex items-center space-x-2 mt-2">
                              {getStatusBadge(project.status)}
                              <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                                {new Date(project.created_at).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </span>
                            </div>
                            <div className="flex items-center mt-3">
                              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/30 rounded-lg px-4 py-2">
                                <div className="flex items-center space-x-2">
                                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                  <span className="text-sm font-semibold text-green-700 dark:text-green-300">
                                    ₹{project.budget.toLocaleString('en-IN')}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-base line-clamp-3 transition-colors duration-300">
                            {project.description}
                          </p>

                          {project.services_offered.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {project.services_offered.slice(0, 10).map((service, index) => (
                                <Badge
                                  key={index}
                                  variant="secondary"
                                  className="text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700 px-3 py-1 rounded-full"
                                >
                                  {service}
                                </Badge>
                              ))}
                              {project.services_offered.length > 10 && (
                                <Badge
                                  variant="secondary"
                                  className="text-xs font-medium bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600 px-3 py-1 rounded-full"
                                >
                                  +{project.services_offered.length - 10} more
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-0 px-8 pb-8 relative z-10">
                      <div className="flex flex-col space-y-6">
                        {/* Enhanced Metadata Section */}
                        <div className="bg-gray-50/50 dark:bg-gray-700/20 rounded-2xl p-6 border border-gray-100 dark:border-gray-600/30">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-green-500 flex items-center justify-center shadow-sm">
                                <Users className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{project.proposal_count || 0}</p>
                                <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Proposals</p>
                              </div>
                            </div>

                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-purple-500 flex items-center justify-center shadow-sm">
                                <FileText className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{project.services_offered.length}</p>
                                <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Services</p>
                              </div>
                            </div>

                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center shadow-sm">
                                <Calendar className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-gray-900 dark:text-white">
                                  {new Date(project.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Created</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Enhanced Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3">
                          <Button asChild className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 flex-1 sm:flex-initial h-12 rounded-xl font-semibold group/btn">
                            <Link href={`/business/project/${project.id}`} className="flex items-center justify-center space-x-2">
                              <Eye className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                              <span className="sm:inline hidden">Manage Project</span>
                              <span className="sm:hidden inline">Manage</span>
                            </Link>
                          </Button>

                          <Button asChild className="bg-gray-100 dark:bg-gray-700/50 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600 shadow-lg hover:shadow-xl transition-all duration-300 flex-1 sm:flex-initial h-12 rounded-xl font-semibold border border-gray-200 dark:border-gray-600 group/btn">
                            <Link href={`/business/proposals/${project.id}`} className="flex items-center justify-center space-x-2">
                              <Eye className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                              <span className="sm:inline hidden">View Proposals</span>
                              <span className="sm:hidden inline">Proposals</span>
                            </Link>
                          </Button>

                          <div className="flex gap-3">
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-blue-200 dark:border-blue-600/50 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 bg-transparent shadow-lg hover:shadow-xl transition-all duration-300 flex-1 sm:flex-initial h-12 px-4 rounded-xl font-semibold group/btn"
                              onClick={() => router.push(`/business/add-project?project_id=${project.id}`)}
                            >
                              <Pencil className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                              <span className="sr-only sm:not-sr-only sm:ml-2">Edit</span>
                            </Button>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-red-200 dark:border-red-600/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 bg-transparent shadow-lg hover:shadow-xl transition-all duration-300 flex-1 sm:flex-initial h-12 px-4 rounded-xl font-semibold group/btn"
                                >
                                  <Trash2 className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                                  <span className="sr-only sm:not-sr-only sm:ml-2">Delete</span>
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="bg-white dark:bg-gray-800 rounded-2xl border-gray-200 dark:border-gray-700 shadow-2xl">
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="text-gray-900 dark:text-white font-semibold text-xl">Delete Project</AlertDialogTitle>
                                  <AlertDialogDescription className="text-gray-600 dark:text-gray-300 text-base leading-relaxed">
                                    Are you sure you want to delete this project? This action cannot be undone and will permanently remove the project and all associated data.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter className="gap-3">
                                  <AlertDialogCancel className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 h-11 px-6 rounded-xl font-semibold">Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 h-11 px-6 rounded-xl font-semibold"
                                    onClick={() => handleDeleteProject(project.id)}
                                  >
                                    Delete Project
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Chat Integration */}
      <ChatWidget
        currentUserId={currentUserId}
        currentUserType={currentUserType}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        onUnreadCountChange={(updater) => setUnreadCount(updater)}
      />

      <FloatingChatButton
        onClick={() => {
          setIsChatOpen(!isChatOpen)
          if (!isChatOpen) {
            setUnreadCount(0) // Reset unread count when opening chat
          }
        }}
        isOpen={isChatOpen}
        unreadCount={unreadCount}
      />
    </>
  )
}
