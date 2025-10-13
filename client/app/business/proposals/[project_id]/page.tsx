"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { getSupabaseClient } from "@/lib/supabaseClient"
import { API_URL } from "@/lib/constants"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import {
  ArrowLeft,
  Users,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  Building2,
  Target,
  MessageSquare,
  ImageIcon,
  File,
  Video,
  X,
  ExternalLink,
  Lock,
  Award,
} from "lucide-react"

// Type definitions
interface Proposal {
  id: string | number
  society_id: string | number
  society_name?: string
  poc_name?: string
  establishment_date?: string
  state?: string
  city?: string
  society_domains?: string[]
  society_services_offered?: string[]
  total_member_count?: number
  college_name?: string
  status?: "pending" | "accepted" | "rejected" | "submitted"
  created_at?: string
  project_id?: string
}

interface ProjectDetails {
  id: number
  compliant_name: string
  compliant_description: string
  services_required: string
  status: string
  has_accepted_proposal?: boolean
}

interface PortfolioItem {
  id: number
  file_path: string
  caption: string
}

interface SocietyProfile {
  id: string
  society_name: string
  poc_name?: string
  phone_number?: string
  domain?: string | null
  services_offered: string[]
  created_at?: string
  logo_url?: string | null
  description?: string | null
  average_rating?: number | null
  total_ratings?: number
  rating_breakdown?: any
  establishment_date?: string
  college_name?: string
  state?: string
  city?: string
  domains?: string[]
  total_member_count?: number
}

interface SocietyPortfolio {
  portfolio_items: PortfolioItem[]
  society_profile: SocietyProfile
}

type StatusType = "pending" | "accepted" | "rejected" | "submitted"

export default function ProjectProposalsPage() {
  const params = useParams()
  const project_id = params?.project_id as string
  const router = useRouter()
  const supabase = getSupabaseClient()

  const [proposals, setProposals] = useState<Proposal[]>([])
  const [projectDetails, setProjectDetails] = useState<ProjectDetails | null>(null)
  const [error, setError] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(true)
  const [acceptingId, setAcceptingId] = useState<string | number | null>(null)
  const [portfolioModalOpen, setPortfolioModalOpen] = useState<boolean>(false)
  const [selectedSocietyPortfolio, setSelectedSocietyPortfolio] = useState<SocietyPortfolio | null>(null)
  const [portfolioLoading, setPortfolioLoading] = useState<boolean>(false)

  useEffect(() => {
    if (!project_id) return

    const fetchData = async (): Promise<void> => {
      setLoading(true)
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
        // Fetch proposals
        const proposalsRes = await fetch(`${API_URL}/api/project-proposals?project_id=${project_id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!proposalsRes.ok) {
          const err = await proposalsRes.json()
          throw new Error(err.detail || "Failed to load proposals")
        }

        const proposalsData: Proposal[] = await proposalsRes.json()
        setProposals(proposalsData)

        // Fetch project details
        const projectRes = await fetch(`${API_URL}/api/business-projects`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (projectRes.ok) {
          const projectsData: ProjectDetails[] = await projectRes.json()
          const project = projectsData.find((p) => p.id === Number.parseInt(project_id))
          setProjectDetails(project || null)
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An error occurred"
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [project_id, supabase])

  const handleAccept = async (proposalId: string | number): Promise<void> => {
    setAcceptingId(proposalId)
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) throw new Error("Not authenticated")

      const token = session.access_token
      const res = await fetch(`${API_URL}/api/accept-proposal`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ proposal_id: proposalId }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || "Failed to accept proposal")
      }

      toast("Success", {
        description: "Proposal accepted successfully!",
      })

      // Update the proposal status locally
      setProposals((prev) =>
        prev.map((proposal) => (proposal.id === proposalId ? { ...proposal, status: "accepted" } : proposal)),
      )
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred"
      setError(errorMessage)
      toast("Error", {
        description: errorMessage,
      })
    } finally {
      setAcceptingId(null)
    }
  }

  const handleViewPortfolio = async (societyId: string | number): Promise<void> => {
    setPortfolioLoading(true)
    setPortfolioModalOpen(true)
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) throw new Error("Not authenticated")

      const token = session.access_token
      const res = await fetch(`${API_URL}/api/get-society-portfolio/${societyId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || "Failed to load portfolio")
      }

      const portfolioData: SocietyPortfolio = await res.json()
      setSelectedSocietyPortfolio(portfolioData)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred"
      toast("Error", {
        description: errorMessage,
      })
      setPortfolioModalOpen(false)
    } finally {
      setPortfolioLoading(false)
    }
  }

  const closePortfolioModal = (): void => {
    setPortfolioModalOpen(false)
    setSelectedSocietyPortfolio(null)
  }

  const getStatusBadge = (status?: StatusType) => {
    const variants = {
      pending: "bg-warning/10 text-warning border-warning/20",
      accepted: "bg-success/10 text-success border-success/20",
      rejected: "bg-error/10 text-error border-error/20",
    }

    const icons = {
      pending: <Clock className="w-3 h-3 mr-1" />,
      accepted: <CheckCircle className="w-3 h-3 mr-1" />,
      rejected: <XCircle className="w-3 h-3 mr-1" />,
    }

    const currentStatus = status || "pending"

    return (
      <Badge className={`${variants[currentStatus]} capitalize font-medium flex items-center`}>
        {icons[currentStatus]}
        {currentStatus}
      </Badge>
    )
  }

  const getInitials = (name?: string): string => {
    return (
      name
        ?.split(" ")
        .map((word) => word[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "S"
    )
  }

  const getFileIcon = (ext: string) => {
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) return ImageIcon
    if (["mp4", "mov", "avi", "webm"].includes(ext)) return Video
    return File
  }

  const getFileTypeLabel = (ext: string): string => {
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) return "Image"
    if (["mp4", "mov", "avi", "webm"].includes(ext)) return "Video"
    return ext.toUpperCase()
  }

  const hasAcceptedProposal = proposals.some(proposal => proposal.status === "accepted")

  return (
    <main className="min-h-screen bg-primary">
      {/* Header */}
      <div className="bg-brand-gradient text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center space-x-4 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="text-white hover:bg-white/20 -ml-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>

          <div className="space-y-4">
            <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium">
              <Eye className="w-4 h-4" />
              <span>Project Proposals</span>
            </div>
            <h1 className="h1 text-white">
              {projectDetails ? (
                <>
                  Proposals for
                  <span className="block text-white/90">{projectDetails.compliant_name}</span>
                </>
              ) : (
                <>
                  Project
                  <span className="block text-white/90">Proposals</span>
                </>
              )}
            </h1>
            <p className="text-xl text-white/80 max-w-2xl leading-relaxed mb-4">
              Review and manage proposals from college societies interested in your project
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-8 relative z-10 pb-16">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Project Details Sidebar */}
          {projectDetails && (
            <div className="lg:col-span-1">
              <Card className="card rounded-2xl shadow-xl sticky top-8">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-brand-gradient rounded-xl flex items-center justify-center text-white font-bold">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-text">Project Details</h3>
                      <p className="text-sm text-text-muted">What you&apos;re looking for</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-text mb-2">{projectDetails.compliant_name}</h4>
                    <p className="text-sm text-text-muted leading-relaxed">{projectDetails.compliant_description}</p>
                  </div>
                  <Separator className="bg-border" />
                  <div>
                    <p className="text-sm font-medium text-text mb-2">Services Required:</p>
                    <Badge className="badge">{projectDetails.services_required}</Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text mb-2">Status:</p>
                    {getStatusBadge(projectDetails.status as StatusType)}
                  </div>
                  {projectDetails.has_accepted_proposal && (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                        <span className="text-sm font-medium text-green-800 dark:text-green-300">Proposal Accepted</span>
                      </div>
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                        You have accepted a proposal for this project. No further proposals can be accepted.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Proposals List */}
          <div className={projectDetails ? "lg:col-span-3" : "lg:col-span-4"}>
            {/* Accepted Proposal Notification */}
            {hasAcceptedProposal && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 mb-6">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-green-800 dark:text-green-300">Proposal Accepted</h4>
                    <p className="text-sm text-green-700 dark:text-green-400">
                      You have accepted a proposal for this project. The collaboration can now begin!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="error-bg rounded-xl p-6 mb-8">
                <p className="text-error text-center font-medium">{error}</p>
              </div>
            )}

            {/* Loading State */}
            {loading ? (
              <div className="space-y-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="card rounded-2xl">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <Skeleton className="w-16 h-16 rounded-full bg-primary" />
                        <div className="flex-1 space-y-3">
                          <Skeleton className="h-6 w-48 bg-primary" />
                          <Skeleton className="h-4 w-full bg-primary" />
                          <Skeleton className="h-4 w-3/4 bg-primary" />
                          <Skeleton className="h-10 w-32 bg-primary" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : proposals.length === 0 ? (
              /* Empty State */
              <Card className="card rounded-2xl border-2 border-dashed border-accent/20 bg-accent/5">
                <CardContent className="p-16 text-center">
                  <div className="w-24 h-24 bg-brand-gradient rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <MessageSquare className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="h3 text-text mb-2">No proposals yet</h3>
                  <p className="text-text-muted max-w-md mx-auto">
                    Your project is live on the marketplace. College societies will start sending proposals soon. Check
                    back later!
                  </p>
                </CardContent>
              </Card>
            ) : (
              /* Proposals List */
              <div className="space-y-6">
                {proposals.map((proposal) => (
                  <Card
                    key={proposal.id}
                    className="group card rounded-2xl hover:shadow-xl transition-all duration-200 border border-border/50 overflow-hidden"
                  >
                    <CardContent className="p-0">
                      <div className="space-y-0">
                        {/* Hero Section */}
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 p-4 border-b border-blue-100 dark:border-blue-900/50">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                {getInitials(proposal.society_name)}
                              </div>
                              <div className="space-y-1">
                                <h3 className="text-lg font-bold text-text">
                                  {proposal.society_name || `Society ${proposal.society_id}`}
                                </h3>
                                <p className="text-sm text-text-muted flex items-center">
                                  <Building2 className="w-4 h-4 mr-2" />
                                  {proposal.college_name || "College Society"}
                                </p>
                                {proposal.city && proposal.state && (
                                  <p className="text-sm text-text-muted">
                                    {proposal.city}, {proposal.state}
                                  </p>
                                )}
                              </div>
                            </div>
                            {getStatusBadge(proposal.status)}
                          </div>

                          {/* Key Stats */}
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                            {proposal.establishment_date && (
                              <div className="bg-white/70 dark:bg-gray-800/70 rounded-lg p-2 text-center">
                                <Calendar className="w-3 h-3 text-blue-600 mx-auto mb-1" />
                                <p className="text-xs text-text-muted">Established</p>
                                <p className="font-semibold text-text text-sm">
                                  {new Date(proposal.establishment_date).getFullYear()}
                                </p>
                              </div>
                            )}
                            {proposal.total_member_count && (
                              <div className="bg-white/70 dark:bg-gray-800/70 rounded-lg p-2 text-center">
                                <Users className="w-3 h-3 text-green-600 mx-auto mb-1" />
                                <p className="text-xs text-text-muted">Members</p>
                                <p className="font-semibold text-text text-sm">{proposal.total_member_count}</p>
                              </div>
                            )}
                            <div className="bg-white/70 dark:bg-gray-800/70 rounded-lg p-2 text-center">
                              <Target className="w-3 h-3 text-purple-600 mx-auto mb-1" />
                              <p className="text-xs text-text-muted">Services</p>
                              <p className="font-semibold text-text text-sm">
                                {proposal.society_services_offered?.length || 0}
                              </p>
                            </div>
                            <div className="bg-white/70 dark:bg-gray-800/70 rounded-lg p-2 text-center">
                              <Eye className="w-3 h-3 text-orange-600 mx-auto mb-1" />
                              <p className="text-xs text-text-muted">Domains</p>
                              <p className="font-semibold text-text text-sm">
                                {proposal.society_domains?.length || 0}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Domains Section */}
                        {proposal.society_domains && proposal.society_domains.length > 0 && (
                          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 p-4 border-b border-purple-100 dark:border-purple-900/50">
                            <div className="flex items-center space-x-2 mb-3">
                              <div className="w-5 h-5 bg-purple-500 rounded-lg flex items-center justify-center">
                                <Award className="w-3 h-3 text-white" />
                              </div>
                              <h4 className="font-semibold text-text">Domains</h4>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {proposal.society_domains.map((domain, index) => (
                                <Badge key={index} variant="secondary" className="bg-purple-100 text-purple-800 hover:bg-purple-200 text-xs">
                                  {domain}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Services Section */}
                        {proposal.society_services_offered && proposal.society_services_offered.length > 0 && (
                          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 p-4 border-b border-green-100 dark:border-green-900/50">
                            <div className="flex items-center space-x-2 mb-3">
                              <div className="w-5 h-5 bg-green-500 rounded-lg flex items-center justify-center">
                                <Target className="w-3 h-3 text-white" />
                              </div>
                              <h4 className="font-semibold text-text">Services Offered</h4>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {proposal.society_services_offered.slice(0, 6).map((service, index) => (
                                <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-2 shadow-sm border border-green-100 dark:border-green-900/50">
                                  <div className="flex items-center space-x-2">
                                    <div className="w-5 h-5 bg-green-100 dark:bg-green-900/30 rounded-md flex items-center justify-center">
                                      <span className="text-green-600 dark:text-green-400 font-bold text-xs">{index + 1}</span>
                                    </div>
                                    <span className="text-sm font-medium text-text">{service}</span>
                                  </div>
                                </div>
                              ))}
                              {proposal.society_services_offered.length > 6 && (
                                <div className="bg-white dark:bg-gray-800 rounded-lg p-2 shadow-sm border border-green-100 dark:border-green-900/50 flex items-center justify-center">
                                  <span className="text-sm font-medium text-green-600 dark:text-green-400">
                                    +{proposal.society_services_offered.length - 6} more services
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="p-4">
                          <div className="flex flex-col sm:flex-row gap-3">
                            <Button
                              onClick={() => handleViewPortfolio(proposal.society_id)}
                              variant="outline"
                              className="flex-1 px-4 py-2.5 h-auto group border-border hover:border-blue-300 hover:bg-blue-50/50"
                            >
                              <div className="flex items-center space-x-2">
                                <Eye className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                <span>View Portfolio</span>
                              </div>
                            </Button>
                            {proposal.status !== "accepted" && !hasAcceptedProposal && (
                            <Button
                              onClick={() => handleAccept(proposal.id)}
                              disabled={acceptingId === Number(proposal.id)}
                              className="flex-1 px-4 py-2.5 h-auto group bg-green-600 hover:bg-green-700 text-white border-green-600 hover:border-green-700"
                            >
                                {acceptingId === Number(proposal.id) ? (
                                  <div className="flex items-center space-x-2">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Accepting...</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center space-x-2">
                                    <CheckCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                    <span>Accept Proposal</span>
                                  </div>
                                )}
                              </Button>
                            )}
                            {hasAcceptedProposal && proposal.status !== "accepted" && (
                              <div className="flex-1 px-4 py-2.5 h-auto bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg flex items-center justify-center">
                                <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                                  <Lock className="w-4 h-4" />
                                  <span className="text-sm font-medium">Another proposal accepted</span>
                                </div>
                              </div>
                            )}
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
      </div>

      {/* Portfolio Modal */}
      {portfolioModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-text">Society Portfolio</h2>
                  <p className="text-sm text-text-muted">Explore their work and services</p>
                </div>
                <button
                  onClick={closePortfolioModal}
                  className="p-2 hover:bg-white/70 dark:hover:bg-gray-800/70 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto max-h-[calc(90vh-80px)]">
              {portfolioLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
                  <span className="ml-3 text-text-muted">Loading portfolio...</span>
                </div>
              ) : selectedSocietyPortfolio ? (
                <div className="p-8">
                  {/* Portfolio Header */}
                  <div className="text-center mb-8">
                    <div className="flex items-center justify-center space-x-4 mb-4">
                      {selectedSocietyPortfolio.society_profile.logo_url ? (
                        <Image
                          src={selectedSocietyPortfolio.society_profile.logo_url}
                          alt={selectedSocietyPortfolio.society_profile.society_name}
                          width={60}
                          height={60}
                          className="w-15 h-15 rounded-2xl object-cover shadow-lg"
                        />
                      ) : (
                        <div className="w-15 h-15 bg-brand-gradient rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                          {getInitials(selectedSocietyPortfolio.society_profile.society_name)}
                        </div>
                      )}
                      <div>
                        <h2 className="text-2xl font-bold text-text">
                          {selectedSocietyPortfolio.society_profile.society_name}
                        </h2>
                        <p className="text-text-muted">
                          {selectedSocietyPortfolio.society_profile.college_name || "College Society"}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200 text-sm px-4 py-2">
                      <ImageIcon className="w-4 h-4 mr-2" />
                      {selectedSocietyPortfolio.portfolio_items.length} Portfolio Items
                    </Badge>
                  </div>

                  {/* Portfolio Items - Enhanced Media Gallery */}
                  {selectedSocietyPortfolio.portfolio_items.length === 0 ? (
                    <div className="text-center py-20 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-2xl border-2 border-dashed border-purple-200 dark:border-purple-800">
                      <div className="w-20 h-20 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <File className="w-10 h-10 text-purple-600 dark:text-purple-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-text mb-3">No Portfolio Items Yet</h3>
                      <p className="text-text-muted max-w-md mx-auto leading-relaxed">
                        This society hasn't uploaded any portfolio items yet. Check back later to see their work!
                      </p>
                      <div className="mt-6 p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl">
                        <h4 className="font-semibold text-text mb-2">What they offer:</h4>
                        <div className="flex flex-wrap gap-2 justify-center">
                          {selectedSocietyPortfolio.society_profile.services_offered.slice(0, 6).map((service, index) => (
                            <Badge key={index} className="bg-green-100 text-green-800 hover:bg-green-200">
                              {service}
                            </Badge>
                          ))}
                          {selectedSocietyPortfolio.society_profile.services_offered.length > 6 && (
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                              +{selectedSocietyPortfolio.society_profile.services_offered.length - 6} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {selectedSocietyPortfolio.portfolio_items.map((item) => {
                        const url = supabase.storage.from("society-portfolio").getPublicUrl(item.file_path).data.publicUrl
                        const ext = item.file_path.split(".").pop()?.toLowerCase() || ""
                        const isImage = ["jpg", "jpeg", "png", "gif", "webp"].includes(ext)
                        const isVideo = ["mp4", "mov", "avi", "webm"].includes(ext)
                        const FileIcon = getFileIcon(ext)

                        return (
                          <Card key={item.id} className="group card rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 border-0 shadow-lg hover:-translate-y-1">
                            <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 relative overflow-hidden">
                              {isImage ? (
                                <Image
                                  src={url}
                                  alt={item.caption}
                                  fill
                                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                              ) : isVideo ? (
                                <video
                                  src={url}
                                  className="w-full h-full object-cover"
                                  controls={false}
                                  muted
                                  loop
                                  onMouseEnter={(e) => e.currentTarget.play()}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.pause()
                                    e.currentTarget.currentTime = 0
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center p-6">
                                  <FileIcon className="w-16 h-16 text-text-muted mb-4" />
                                  <p className="text-sm text-text-muted text-center">{getFileTypeLabel(ext)} File</p>
                                </div>
                              )}

                              {/* Overlay with type badge */}
                              <div className="absolute top-3 right-3">
                                <Badge className={`badge text-xs font-semibold ${
                                  isImage ? 'bg-blue-500/90 text-white' :
                                  isVideo ? 'bg-red-500/90 text-white' :
                                  'bg-gray-500/90 text-white'
                                }`}>
                                  {isImage && <ImageIcon className="w-3 h-3 mr-1" />}
                                  {isVideo && <Video className="w-3 h-3 mr-1" />}
                                  {!isImage && !isVideo && <File className="w-3 h-3 mr-1" />}
                                  {getFileTypeLabel(ext)}
                                </Badge>
                              </div>

                              {/* Hover overlay */}
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  className="bg-white/90 hover:bg-white text-black font-medium"
                                  onClick={() => window.open(url, "_blank")}
                                >
                                  <ExternalLink className="w-4 h-4 mr-2" />
                                  View Full Size
                                </Button>
                              </div>
                            </div>

                            <CardContent className="p-4">
                              <p className="text-sm text-text line-clamp-2 font-medium">{item.caption}</p>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center py-12">
                  <p className="text-text-muted">No portfolio data available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
