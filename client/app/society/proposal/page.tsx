"use client"

import { useState, useEffect, ChangeEvent, FormEvent, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabaseClient"
import { API_URL } from "@/lib/constants"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Send,
  Users,
  Calendar,
  DollarSign,
  Target,
  Award,
  Instagram,
  CheckCircle,
  Building2,
} from "lucide-react"

// Types
interface FormData {
  societyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  pitch: string;
  teamSize: string;
  timeline: string;
  budget: string;
  experience: string;
  deliverables: string;
  socialReach: string;
  instagramHandle: string;
  previousWork: string;
}

interface ProjectDetails {
  id: number;
  compliant_name: string;
  compliant_description: string;
  services_required: string;
}

// Separate component that uses useSearchParams
function SendProposalContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const projectId = searchParams.get("project_id")
  const supabase = getSupabaseClient()

  // Form state
  const [formData, setFormData] = useState<FormData>({
    societyName: "",
    contactPerson: "",
    email: "",
    phone: "",
    pitch: "",
    teamSize: "",
    timeline: "",
    budget: "",
    experience: "",
    deliverables: "",
    socialReach: "",
    instagramHandle: "",
    previousWork: "",
  })

  const [error, setError] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)
  const [projectDetails, setProjectDetails] = useState<ProjectDetails | null>(null)

  // Fetch project details
  useEffect(() => {
    const fetchProjectDetails = async (): Promise<void> => {
      if (!projectId) return

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        if (!session) return

        const token = session.access_token
        const res = await fetch(`${API_URL}/api/marketplace-projects`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (res.ok) {
          const projects: ProjectDetails[] = await res.json()
          const project = projects.find((p: ProjectDetails) => p.id === Number.parseInt(projectId))
          if (project) {
            setProjectDetails(project)
          }
        }
      } catch (err) {
        console.error("Failed to fetch project details:", err)
      }
    }

    fetchProjectDetails()
  }, [projectId, supabase])

  const handleInputChange = (field: keyof FormData, value: string): void => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) throw new Error("Not authenticated")

      const token = session.access_token
      const res = await fetch(`${API_URL}/api/send-proposal`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          project_id: projectId,
          ...formData,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || "Proposal failed")
      }

      router.push("/society/marketplace")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const isFormValid = formData.societyName && formData.contactPerson && formData.email && formData.pitch

  return (
    <main className="min-h-screen bg-primary">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary via-secondary to-accent text-white">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-center space-x-4 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="text-white hover:bg-white/20 -ml-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Marketplace
            </Button>
          </div>

          <div className="space-y-4">
            <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium">
              <Send className="w-4 h-4" />
              <span>Send Proposal</span>
            </div>
            <h1 className="h1">
              Submit Your
              <span className="block bg-gradient-to-r from-accent to-secondary bg-clip-text text-transparent">
                Collaboration Proposal
              </span>
            </h1>
            <p className="text-xl text-white/80 max-w-2xl leading-relaxed">
              Showcase your society's capabilities and create an impactful partnership
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 -mt-8 relative z-10 pb-16">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Project Details Sidebar */}
          {projectDetails && (
            <div className="lg:col-span-1">
              <Card className="rounded-2xl shadow-xl border-0 bg-white dark:bg-secondary sticky top-8">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-accent to-secondary rounded-xl flex items-center justify-center text-white font-bold">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-text">Project Details</h3>
                      <p className="text-sm text-text/60">What you're applying for</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-text mb-2">{projectDetails.compliant_name}</h4>
                    <p className="text-sm text-text/60 leading-relaxed">{projectDetails.compliant_description}</p>
                  </div>
                  <Separator className="bg-primary/20" />
                  <div>
                    <p className="text-sm font-medium text-text mb-2">Services Required:</p>
                    <Badge variant="secondary" className="bg-accent/10 text-accent">
                      {projectDetails.services_required}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Proposal Form */}
          <div className={projectDetails ? "lg:col-span-2" : "lg:col-span-3"}>
            <Card className="rounded-2xl shadow-xl border-0 bg-white dark:bg-secondary">
              <CardContent className="p-8">
                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
                    <p className="text-red-400 font-medium">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Society Information */}
                  <div className="space-y-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center">
                        <Users className="w-4 h-4 text-accent" />
                      </div>
                      <h2 className="h3 text-text">Society Information</h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="societyName" className="text-sm font-medium text-text">
                          Society Name *
                        </Label>
                        <Input
                          id="societyName"
                          value={formData.societyName}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange("societyName", e.target.value)}
                          placeholder="e.g., Marketing Society"
                          className="h-12 border-primary/20 focus:border-accent focus:ring-accent bg-primary text-white"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="contactPerson" className="text-sm font-medium text-text">
                          Contact Person *
                        </Label>
                        <Input
                          id="contactPerson"
                          value={formData.contactPerson}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange("contactPerson", e.target.value)}
                          placeholder="Your full name"
                          className="h-12 border-primary/20 focus:border-accent focus:ring-accent bg-primary text-white"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium text-text">
                          Email Address *
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange("email", e.target.value)}
                          placeholder="your.email@university.edu"
                          className="h-12 border-primary/20 focus:border-accent focus:ring-accent bg-primary text-white"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-sm font-medium text-text">
                          Phone Number
                        </Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange("phone", e.target.value)}
                          placeholder="+1 (555) 123-4567"
                          className="h-12 border-primary/20 focus:border-accent focus:ring-accent bg-primary text-white"
                        />
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-primary/20" />

                  {/* Project Details */}
                  <div className="space-y-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-8 h-8 bg-secondary/10 rounded-lg flex items-center justify-center">
                        <Target className="w-4 h-4 text-accent" />
                      </div>
                      <h2 className="h3 text-text">Project Proposal</h2>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pitch" className="text-sm font-medium text-text">
                        Your Proposal Pitch *
                      </Label>
                      <Textarea
                        id="pitch"
                        value={formData.pitch}
                        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => handleInputChange("pitch", e.target.value)}
                        placeholder="Describe why your society is the perfect fit for this project. Include your unique approach, relevant experience, and what value you'll bring..."
                        className="min-h-32 border-primary/20 focus:border-accent focus:ring-accent resize-none bg-primary text-white"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="deliverables" className="text-sm font-medium text-text">
                        Key Deliverables
                      </Label>
                      <Textarea
                        id="deliverables"
                        value={formData.deliverables}
                        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => handleInputChange("deliverables", e.target.value)}
                        placeholder="List the specific outcomes and deliverables you'll provide (e.g., social media content, event organization, marketing campaigns...)"
                        className="min-h-24 border-primary/20 focus:border-accent focus:ring-accent resize-none bg-primary text-white"
                      />
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="teamSize" className="text-sm font-medium text-text">
                          <Users className="w-4 h-4 inline mr-1" />
                          Team Size
                        </Label>
                        <Input
                          id="teamSize"
                          value={formData.teamSize}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange("teamSize", e.target.value)}
                          placeholder="e.g., 5-8 members"
                          className="h-12 border-primary/20 focus:border-accent focus:ring-accent bg-primary text-white"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="timeline" className="text-sm font-medium text-text">
                          <Calendar className="w-4 h-4 inline mr-1" />
                          Timeline
                        </Label>
                        <Input
                          id="timeline"
                          value={formData.timeline}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange("timeline", e.target.value)}
                          placeholder="e.g., 2-3 weeks"
                          className="h-12 border-primary/20 focus:border-accent focus:ring-accent bg-primary text-white"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="budget" className="text-sm font-medium text-text">
                          <DollarSign className="w-4 h-4 inline mr-1" />
                          Budget Range
                        </Label>
                        <Input
                          id="budget"
                          value={formData.budget}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange("budget", e.target.value)}
                          placeholder="e.g., $500-1000"
                          className="h-12 border-primary/20 focus:border-accent focus:ring-accent bg-primary text-white"
                        />
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-primary/20" />

                  {/* Experience & Social Reach */}
                  <div className="space-y-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Award className="w-4 h-4 text-accent" />
                      </div>
                      <h2 className="h3 text-text">Experience & Reach</h2>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="experience" className="text-sm font-medium text-text">
                        Relevant Experience
                      </Label>
                      <Textarea
                        id="experience"
                        value={formData.experience}
                        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => handleInputChange("experience", e.target.value)}
                        placeholder="Describe your society's relevant experience, past projects, achievements, or similar collaborations..."
                        className="min-h-24 border-primary/20 focus:border-accent focus:ring-accent resize-none bg-primary text-white"
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="socialReach" className="text-sm font-medium text-text">
                          Social Media Reach
                        </Label>
                        <Input
                          id="socialReach"
                          value={formData.socialReach}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange("socialReach", e.target.value)}
                          placeholder="e.g., 5K Instagram, 2K LinkedIn"
                          className="h-12 border-primary/20 focus:border-accent focus:ring-accent bg-primary text-white"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="instagramHandle" className="text-sm font-medium text-text">
                          <Instagram className="w-4 h-4 inline mr-1" />
                          Instagram Handle
                        </Label>
                        <Input
                          id="instagramHandle"
                          value={formData.instagramHandle}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange("instagramHandle", e.target.value)}
                          placeholder="@yoursociety"
                          className="h-12 border-primary/20 focus:border-accent focus:ring-accent bg-primary text-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="previousWork" className="text-sm font-medium text-text">
                        Portfolio/Previous Work Links
                      </Label>
                      <Input
                        id="previousWork"
                        value={formData.previousWork}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange("previousWork", e.target.value)}
                        placeholder="Links to your portfolio, previous campaigns, or work samples"
                        className="h-12 border-primary/20 focus:border-accent focus:ring-accent bg-primary text-white"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-6">
                    <Button
                      type="submit"
                      disabled={loading || !isFormValid}
                      className="w-full bg-gradient-to-r from-accent to-secondary hover:from-accent-hover hover:to-secondary text-white font-medium h-14 rounded-xl text-lg group"
                    >
                      {loading ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Sending Proposal...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                          <span>Submit Proposal</span>
                        </div>
                      )}
                    </Button>

                    {!isFormValid && (
                      <p className="text-sm text-text/60 text-center mt-2">
                        Please fill in all required fields (marked with *)
                      </p>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}

// Main component that wraps the content in Suspense
export default function SendProposalPage() {
  return (
    <Suspense fallback={<div className="p-6 min-h-screen flex items-center justify-center">Loading Form...</div>}>
      <SendProposalContent />
    </Suspense>
  )
}
