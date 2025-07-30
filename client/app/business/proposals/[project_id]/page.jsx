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
} from "lucide-react"

export default function ProjectProposalsPage() {
  const params = useParams()
  const project_id = params?.project_id
  const router = useRouter()
  const supabase = getSupabaseClient()

  const [proposals, setProposals] = useState([])
  const [projectDetails, setProjectDetails] = useState(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const [acceptingId, setAcceptingId] = useState(null)

  useEffect(() => {
    if (!project_id) return

    const fetchData = async () => {
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

        const proposalsData = await proposalsRes.json()
        setProposals(proposalsData)

        // Fetch project details
        const projectRes = await fetch(`${API_URL}/api/business-projects`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (projectRes.ok) {
          const projectsData = await projectRes.json()
          const project = projectsData.find((p) => p.id === Number.parseInt(project_id))
          setProjectDetails(project)
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [project_id, supabase])

  const handleAccept = async (proposalId) => {
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
      setError(err.message)
      toast("Error", {
        description: err.message,
      })
    } finally {
      setAcceptingId(null)
    }
  }

  const getStatusBadge = (status) => {
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

    return (
      <Badge className={`${variants[status] || variants.pending} capitalize font-medium flex items-center`}>
        {icons[status] || icons.pending}
        {status || "pending"}
      </Badge>
    )
  }

  const getInitials = (name) => {
    return (
      name
        ?.split(" ")
        .map((word) => word[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "S"
    )
  }

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
                      <p className="text-sm text-text-muted">What you're looking for</p>
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
                    {getStatusBadge(projectDetails.status)}
                  </div>
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
                              {getInitials(proposal.societyName || proposal.society_name)}
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-text">
                                {proposal.societyName || proposal.society_name || `Society ${proposal.society_id}`}
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

                        {/* Action Button */}
                        {proposal.status !== "accepted" && (
                          <div className="pt-4 border-t border-border">
                            <Button
                              onClick={() => handleAccept(proposal.id)}
                              disabled={acceptingId === proposal.id}
                              className="btn-primary px-6 py-3 h-auto group"
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
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
