"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
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
  Mail,
  Phone,
  Instagram,
  Calendar,
  DollarSign,
  Award,
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
} from "lucide-react"

// Type definitions
interface Proposal {
  id: number
  society_id: number
  societyName?: string
  society_name?: string
  contactPerson?: string
  contact_person?: string
  email?: string
  phone?: string
  instagramHandle?: string
  pitch: string
  teamSize?: string
  timeline?: string
  budget?: string
  socialReach?: string
  experience?: string
  deliverables?: string
  status?: "pending" | "accepted" | "rejected"
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
  user_id: string
  society_name: string
  domain: string
  services_offered: string
  description?: string
  logo_url?: string
  average_rating?: number
}

interface SocietyPortfolio {
  portfolio_items: PortfolioItem[]
  society_profile: SocietyProfile
}

type StatusType = "pending" | "accepted" | "rejected"

export default function ProjectProposalsPage() {
  const params = useParams()
  const project_id = params?.project_id as string
  const router = useRouter()
  const supabase = getSupabaseClient()

  const [proposals, setProposals] = useState<Proposal[]>([])
  const [projectDetails, setProjectDetails] = useState<ProjectDetails | null>(null)
  const [error, setError] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(true)
  const [acceptingId, setAcceptingId] = useState<number | null>(null)
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

  const handleAccept = async (proposalId: number): Promise<void> => {
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

  const handleViewPortfolio = async (societyId: number): Promise<void> => {
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
            <p className="text-xl text-white/80 max-w-2xl leading-relaxed">
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
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="card rounded-xl p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-accent/10 rounded-lg">
                    <MessageSquare className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-text">{proposals.length}</p>
                    <p className="text-text-muted">Total Proposals</p>
                  </div>
                </div>
              </div>
              <div className="card rounded-xl p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-warning/10 rounded-lg">
                    <Clock className="w-6 h-6 text-warning" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-text">
                      {proposals.filter((p) => p.status === "pending" || !p.status).length}
                    </p>
                    <p className="text-text-muted">Pending Review</p>
                  </div>
                </div>
              </div>
              <div className="card rounded-xl p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-success/10 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-success" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-text">
                      {proposals.filter((p) => p.status === "accepted").length}
                    </p>
                    <p className="text-text-muted">Accepted</p>
                  </div>
                </div>
              </div>
            </div>

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
                    className="group card rounded-2xl hover:shadow-lg transition-all duration-200"
                  >
                    <CardContent className="p-6">
                      <div className="space-y-6">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 bg-brand-gradient rounded-2xl flex items-center justify-center text-white font-bold text-xl">
                              {getInitials(proposal.society_name || proposal.societyName)}
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-text">
                                {proposal.society_name || proposal.societyName || `Society ${proposal.society_id}`}
                              </h3>
                              <p className="text-text-muted">
                                Contact: {proposal.contactPerson || proposal.contact_person || "Not provided"}
                              </p>
                            </div>
                          </div>
                          {getStatusBadge(proposal.status)}
                        </div>

                        {/* Contact Information */}
                        {(proposal.email || proposal.phone || proposal.instagramHandle) && (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-primary rounded-xl">
                            {proposal.email && (
                              <div className="flex items-center space-x-2">
                                <Mail className="w-4 h-4 text-accent" />
                                <span className="text-sm text-text">{proposal.email}</span>
                              </div>
                            )}
                            {proposal.phone && (
                              <div className="flex items-center space-x-2">
                                <Phone className="w-4 h-4 text-accent" />
                                <span className="text-sm text-text">{proposal.phone}</span>
                              </div>
                            )}
                            {proposal.instagramHandle && (
                              <div className="flex items-center space-x-2">
                                <Instagram className="w-4 h-4 text-accent" />
                                <span className="text-sm text-text">{proposal.instagramHandle}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Proposal Content */}
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold text-text mb-2 flex items-center">
                              <Target className="w-4 h-4 mr-2 text-accent" />
                              Proposal Pitch
                            </h4>
                            <p className="text-text-muted leading-relaxed">{proposal.pitch}</p>
                          </div>

                          {/* Additional Details */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {proposal.teamSize && (
                              <div className="flex items-center space-x-2">
                                <Users className="w-4 h-4 text-accent" />
                                <div>
                                  <p className="text-xs text-text-muted">Team Size</p>
                                  <p className="text-sm font-medium text-text">{proposal.teamSize}</p>
                                </div>
                              </div>
                            )}
                            {proposal.timeline && (
                              <div className="flex items-center space-x-2">
                                <Calendar className="w-4 h-4 text-accent" />
                                <div>
                                  <p className="text-xs text-text-muted">Timeline</p>
                                  <p className="text-sm font-medium text-text">{proposal.timeline}</p>
                                </div>
                              </div>
                            )}
                            {proposal.budget && (
                              <div className="flex items-center space-x-2">
                                <DollarSign className="w-4 h-4 text-accent" />
                                <div>
                                  <p className="text-xs text-text-muted">Budget</p>
                                  <p className="text-sm font-medium text-text">{proposal.budget}</p>
                                </div>
                              </div>
                            )}
                            {proposal.socialReach && (
                              <div className="flex items-center space-x-2">
                                <Award className="w-4 h-4 text-accent" />
                                <div>
                                  <p className="text-xs text-text-muted">Social Reach</p>
                                  <p className="text-sm font-medium text-text">{proposal.socialReach}</p>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Experience and Deliverables */}
                          {(proposal.experience || proposal.deliverables) && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {proposal.experience && (
                                <div>
                                  <h5 className="font-medium text-text mb-2">Experience</h5>
                                  <p className="text-sm text-text-muted leading-relaxed">{proposal.experience}</p>
                                </div>
                              )}
                              {proposal.deliverables && (
                                <div>
                                  <h5 className="font-medium text-text mb-2">Deliverables</h5>
                                  <p className="text-sm text-text-muted leading-relaxed">{proposal.deliverables}</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-4 border-t border-border">
                          <div className="flex flex-col sm:flex-row gap-3">
                            <Button
                              onClick={() => handleViewPortfolio(proposal.society_id)}
                              variant="outline"
                              className="flex-1 px-4 py-3 h-auto group border-accent/20 hover:border-accent/40 hover:bg-accent/5"
                            >
                              <div className="flex items-center space-x-2">
                                <Eye className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                <span>View Portfolio</span>
                              </div>
                            </Button>
                            {proposal.status !== "accepted" && !hasAcceptedProposal && (
                              <Button
                                onClick={() => handleAccept(proposal.id)}
                                disabled={acceptingId === proposal.id}
                                className="flex-1 btn-primary px-4 py-3 h-auto group"
                              >
                                {acceptingId === proposal.id ? (
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
                              <div className="flex-1 px-4 py-3 h-auto bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg flex items-center justify-center">
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
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {selectedSocietyPortfolio?.society_profile?.logo_url ? (
                    <img
                      src={selectedSocietyPortfolio.society_profile.logo_url}
                      alt={selectedSocietyPortfolio.society_profile.society_name}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-brand-gradient rounded-lg flex items-center justify-center text-white font-bold">
                      {getInitials(selectedSocietyPortfolio?.society_profile?.society_name)}
                    </div>
                  )}
                  <div>
                    <h3 className="text-xl font-bold text-text">
                      {selectedSocietyPortfolio?.society_profile?.society_name || "Society Portfolio"}
                    </h3>
                    <p className="text-sm text-text-muted">
                      {selectedSocietyPortfolio?.society_profile?.domain || "College Society"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={closePortfolioModal}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
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
                <div className="p-6 space-y-6">
                  {/* Society Info */}
                  <div className="bg-primary rounded-xl p-6">
                    <h4 className="font-semibold text-text mb-3">About</h4>
                    <p className="text-text-muted leading-relaxed mb-4">
                      {selectedSocietyPortfolio.society_profile?.description || "No description available."}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-text">Services Offered</p>
                        <p className="text-sm text-text-muted">
                          {selectedSocietyPortfolio.society_profile?.services_offered || "Not specified"}
                        </p>
                      </div>
                      {selectedSocietyPortfolio.society_profile?.average_rating && (
                        <div>
                          <p className="text-sm font-medium text-text">Average Rating</p>
                          <div className="flex items-center space-x-1">
                            <Award className="w-4 h-4 text-yellow-500" />
                            <span className="text-sm text-text-muted">
                              {selectedSocietyPortfolio.society_profile.average_rating.toFixed(1)}/5.0
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Portfolio Items */}
                  <div>
                    <h4 className="font-semibold text-text mb-4">
                      Portfolio ({selectedSocietyPortfolio.portfolio_items.length} items)
                    </h4>
                    {selectedSocietyPortfolio.portfolio_items.length === 0 ? (
                      <div className="text-center py-12 bg-primary rounded-xl">
                        <File className="w-12 h-12 text-text-muted mx-auto mb-4" />
                        <p className="text-text-muted">No portfolio items available</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {selectedSocietyPortfolio.portfolio_items.map((item) => {
                          const url = supabase.storage.from("society-portfolio").getPublicUrl(item.file_path).data.publicUrl
                          const ext = item.file_path.split(".").pop()?.toLowerCase() || ""
                          const isImage = ["jpg", "jpeg", "png", "gif", "webp"].includes(ext)
                          const isVideo = ["mp4", "mov", "avi", "webm"].includes(ext)
                          const FileIcon = getFileIcon(ext)

                          return (
                            <Card key={item.id} className="group card rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200">
                              <div className="aspect-video bg-primary relative overflow-hidden">
                                {isImage ? (
                                  <img
                                    src={url}
                                    alt={item.caption}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                  />
                                ) : isVideo ? (
                                  <video
                                    src={url}
                                    className="w-full h-full object-cover"
                                    controls={false}
                                    muted
                                    onMouseEnter={(e) => e.currentTarget.play()}
                                    onMouseLeave={(e) => e.currentTarget.pause()}
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <FileIcon className="w-12 h-12 text-text-muted" />
                                  </div>
                                )}
                                <div className="absolute top-2 right-2">
                                  <Badge className="badge text-xs">
                                    {getFileTypeLabel(ext)}
                                  </Badge>
                                </div>
                              </div>
                              <CardContent className="p-4">
                                <p className="text-sm text-text-muted line-clamp-2">{item.caption}</p>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="mt-2 p-0 h-auto text-accent hover:text-accent/80"
                                  onClick={() => window.open(url, "_blank")}
                                >
                                  <ExternalLink className="w-4 h-4 mr-1" />
                                  View Full Size
                                </Button>
                              </CardContent>
                            </Card>
                          )
                        })}
                      </div>
                    )}
                  </div>
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
