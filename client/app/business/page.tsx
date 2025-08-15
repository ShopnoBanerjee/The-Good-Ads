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
import {
  Plus,
  Building2,
  Eye,
  Users,
  Calendar,
  TrendingUp,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Pencil,
  Trash2,
} from "lucide-react"

// Define the type for each project
interface Project {
  id: string
  compliant_name: string
  compliant_description: string
  status: "active" | "completed" | "paused" | "cancelled" | "draft" | string
  proposal_count?: number
  services_required?: string
  created_at: string
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
  const [stats, setStats] = useState<Stats>({
    totalProjects: 0,
    activeProjects: 0,
    totalProposals: 0,
    completedProjects: 0,
  })

  const router = useRouter()

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
          const activeProjects = data.filter((p) => p.status === "active").length
          const completedProjects = data.filter((p) => p.status === "completed").length
          const totalProposals = data.reduce((sum, p) => sum + (p.proposal_count || 0), 0)

          setStats({
            totalProjects,
            activeProjects,
            totalProposals,
            completedProjects,
          })
        }
      } catch (err) {
        setError("Something went wrong!")
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="w-4 h-4 text-success" />
      case "completed":
        return <CheckCircle className="w-4 h-4 text-success" />
      case "paused":
        return <Clock className="w-4 h-4 text-warning" />
      case "cancelled":
        return <XCircle className="w-4 h-4 text-error" />
      default:
        return <AlertCircle className="w-4 h-4 text-text-muted" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      active: "bg-success/10 text-success border-success/20",
      completed: "bg-success/10 text-success border-success/20",
      paused: "bg-warning/10 text-warning border-warning/20",
      cancelled: "bg-error/10 text-error border-error/20",
      draft: "bg-accent/10 text-accent border-accent/20",
    }

    return (
      <Badge className={`${variants[status] || variants.draft} capitalize font-medium`}>
        {status || "draft"}
      </Badge>
    )
  }

  const handleDeleteProject = async (projectId: string) => {
    if (confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
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
  }

  return (
    <main className="min-h-screen bg-primary">
      {/* Header Section */}
      <div className="bg-brand-gradient text-white">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-6 lg:space-y-0">
            <div className="space-y-4">
              <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium">
                <Building2 className="w-4 h-4" />
                <span>Business Dashboard</span>
              </div>
              <h1 className="h1 text-white">
                Manage Your
                <span className="block text-white/90">Business Projects</span>
              </h1>
              <p className="text-xl text-white/80 max-w-2xl leading-relaxed">
                Create projects, review proposals from college societies, and manage your collaborations
              </p>
            </div>

            <Button asChild className="btn-primary bg-white text-accent hover:bg-white/90 px-8 py-3 h-auto">
              <Link href="/business/add-project" className="flex items-center space-x-2">
                <Plus className="w-5 h-5" />
                <span className="font-semibold">Create New Project</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-8 relative z-10 pb-16">
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card rounded-xl p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-accent/10 rounded-lg">
                <FileText className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text">{stats.totalProjects}</p>
                <p className="text-text-muted">Total Projects</p>
              </div>
            </div>
          </div>

          <div className="card rounded-xl p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-success/10 rounded-lg">
                <TrendingUp className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text">{stats.activeProjects}</p>
                <p className="text-text-muted">Active Projects</p>
              </div>
            </div>
          </div>

          <div className="card rounded-xl p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-accent/10 rounded-lg">
                <Users className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text">{stats.totalProposals}</p>
                <p className="text-text-muted">Total Proposals</p>
              </div>
            </div>
          </div>

          <div className="card rounded-xl p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-success/10 rounded-lg">
                <CheckCircle className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text">{stats.completedProjects}</p>
                <p className="text-text-muted">Completed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="error-bg rounded-xl p-6 mb-8">
            <p className="text-error text-center font-medium">{error}</p>
          </div>
        )}

        {/* Projects Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="h3 text-text">Your Projects</h2>
            {projects.length > 0 && (
              <Button asChild className="btn-secondary">
                <Link href="/business/add-project">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Project
                </Link>
              </Button>
            )}
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="card rounded-2xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-3 flex-1">
                        <Skeleton className="h-6 w-64 bg-primary" />
                        <Skeleton className="h-4 w-48 bg-primary" />
                        <Skeleton className="h-4 w-32 bg-primary" />
                      </div>
                      <Skeleton className="h-10 w-32 bg-primary" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : projects.length === 0 ? (
            /* Empty State */
            <Card className="card rounded-2xl border-2 border-dashed border-accent/20 bg-accent/5">
              <CardContent className="p-16 text-center">
                <div className="w-24 h-24 bg-brand-gradient rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Building2 className="w-12 h-12 text-white" />
                </div>
                <h3 className="h3 text-text mb-2">No projects yet</h3>
                <p className="text-text-muted mb-6 max-w-md mx-auto">
                  Create your first project to start collaborating with college societies and receive proposals for your
                  business needs.
                </p>
                <Button asChild className="btn-primary px-8 py-3 h-auto">
                  <Link href="/business/add-project" className="flex items-center space-x-2">
                    <Plus className="w-5 h-5" />
                    <span className="font-semibold">Create Your First Project</span>
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            /* Projects List */
            <div className="space-y-4">
              {projects.map((project) => (
                <Card
                  key={project.id}
                  className="group card rounded-2xl hover:shadow-lg transition-all duration-200"
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-xl font-bold text-text group-hover:text-accent transition-colors">
                            {project.compliant_name}
                          </h3>
                          {getStatusIcon(project.status)}
                        </div>
                        <p className="text-text-muted leading-relaxed line-clamp-2">
                          {project.compliant_description}
                        </p>
                      </div>
                      {getStatusBadge(project.status)}
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
                      <div className="flex items-center space-x-6 text-sm text-text-muted">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4" />
                          <span>Created {new Date(project.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4" />
                          <span>{project.proposal_count || 0} proposals</span>
                        </div>
                        {project.services_required && (
                          <div className="flex items-center space-x-2">
                            <FileText className="w-4 h-4" />
                            <span className="truncate max-w-32">{project.services_required}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-3">
                        <Button asChild className="btn-secondary">
                          <Link href={`/business/proposals/${project.id}`}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Proposals
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          className="border-accent/20 text-accent hover:bg-accent/10 bg-transparent"
                          onClick={() => router.push(`/business/edit-project/${project.id}`)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          className="border-error/20 text-error hover:bg-error/10 bg-transparent"
                          onClick={() => handleDeleteProject(project.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
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
  )
}
