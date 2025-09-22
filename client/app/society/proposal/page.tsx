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
    <main 
      className="min-h-screen bg-white dark:bg-[#15325a] transition-colors duration-200 ease-in-out font-outfit"
      style={{
        transition: 'background-color 0.2s ease-in-out',
      }}
    >
      {/* Header */}
      <div className="bg-gradient-to-br from-accent via-accent/90 to-blue-600 dark:from-accent dark:via-accent/80 dark:to-blue-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
          <div className="flex items-center space-x-4 mb-4 sm:mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="text-white hover:bg-white/20 -ml-2 rounded-2xl font-outfit transition-all duration-200 ease-in-out"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Marketplace
            </Button>
          </div>

          <div className="space-y-4 sm:space-y-6">
            <div className="inline-flex items-center space-x-2 bg-white/20 dark:bg-white/30 backdrop-blur-sm rounded-full px-3 py-2 sm:px-4 text-sm font-medium font-outfit">
              <Send className="w-4 h-4" />
              <span>Send Proposal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white leading-tight font-outfit">
              Submit Your
              <span className="block mt-2 text-white/90">
                Collaboration Proposal
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-white/80 max-w-2xl leading-relaxed font-outfit">
              Showcase your society's capabilities and create an impactful partnership
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 relative z-10 pb-12 sm:pb-16">
        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Project Details Sidebar */}
          {projectDetails && (
            <div className="lg:col-span-1 order-2 lg:order-1">
              <Card 
                className="rounded-2xl shadow-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#15325a]/90 lg:sticky lg:top-8 transition-all duration-200 ease-in-out"
                style={{
                  transition: 'background-color 0.2s ease-in-out, border-color 0.2s ease-in-out',
                }}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-accent to-blue-600 rounded-xl flex items-center justify-center text-white font-bold">
                      <Building2 className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-[#15325a] dark:text-white font-outfit transition-colors duration-200 ease-in-out">
                        Project Details
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 font-outfit transition-colors duration-200 ease-in-out">
                        What you're applying for
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-[#15325a] dark:text-white mb-2 font-outfit transition-colors duration-200 ease-in-out">
                      {projectDetails.compliant_name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-outfit transition-colors duration-200 ease-in-out">
                      {projectDetails.compliant_description}
                    </p>
                  </div>
                  <Separator className="bg-gray-200 dark:bg-white/20 transition-colors duration-200 ease-in-out" />
                  <div>
                    <p className="text-sm font-medium text-[#15325a] dark:text-white mb-2 font-outfit transition-colors duration-200 ease-in-out">
                      Services Required:
                    </p>
                    <Badge className="bg-accent/10 dark:bg-accent/20 text-accent rounded-xl font-outfit">
                      {projectDetails.services_required}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Proposal Form */}
          <div className={`${projectDetails ? "lg:col-span-2 order-1 lg:order-2" : "lg:col-span-3"}`}>
            <Card 
              className="rounded-2xl shadow-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#15325a]/90 transition-all duration-200 ease-in-out"
              style={{
                transition: 'background-color 0.2s ease-in-out, border-color 0.2s ease-in-out',
              }}
            >
              <CardContent className="p-4 sm:p-6 lg:p-8">
                {error && (
                  <div 
                    className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-xl p-4 mb-6 transition-all duration-200 ease-in-out"
                    style={{
                      transition: 'background-color 0.2s ease-in-out, border-color 0.2s ease-in-out',
                    }}
                  >
                    <p className="text-red-600 dark:text-red-400 font-medium font-outfit transition-colors duration-200 ease-in-out">
                      {error}
                    </p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
                  {/* Society Information */}
                  <div className="space-y-4 sm:space-y-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-8 h-8 bg-accent/10 dark:bg-accent/20 rounded-lg flex items-center justify-center transition-colors duration-200 ease-in-out">
                        <Users className="w-4 h-4 text-accent" />
                      </div>
                      <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#15325a] dark:text-white font-outfit transition-colors duration-200 ease-in-out">
                        Society Information
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="societyName" className="text-sm font-medium text-[#15325a] dark:text-white font-outfit transition-colors duration-200 ease-in-out">
                          Society Name *
                        </Label>
                        <Input
                          id="societyName"
                          value={formData.societyName}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange("societyName", e.target.value)}
                          placeholder="e.g., Marketing Society"
                          className="h-11 sm:h-12 border-gray-200 dark:border-white/20 focus:border-blue-600 dark:focus:border-accent bg-gray-50 dark:bg-[#15325a]/50 text-[#15325a] dark:text-white rounded-2xl font-outfit transition-all duration-200 ease-in-out"
                          style={{
                            transition: 'background-color 0.2s ease-in-out, border-color 0.2s ease-in-out, color 0.2s ease-in-out',
                          }}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="contactPerson" className="text-sm font-medium text-[#15325a] dark:text-white font-outfit transition-colors duration-200 ease-in-out">
                          Contact Person *
                        </Label>
                        <Input
                          id="contactPerson"
                          value={formData.contactPerson}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange("contactPerson", e.target.value)}
                          placeholder="Your full name"
                          className="h-11 sm:h-12 border-gray-200 dark:border-white/20 focus:border-blue-600 dark:focus:border-accent bg-gray-50 dark:bg-[#15325a]/50 text-[#15325a] dark:text-white rounded-2xl font-outfit transition-all duration-200 ease-in-out"
                          style={{
                            transition: 'background-color 0.2s ease-in-out, border-color 0.2s ease-in-out, color 0.2s ease-in-out',
                          }}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium text-[#15325a] dark:text-white font-outfit transition-colors duration-200 ease-in-out">
                          Email Address *
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange("email", e.target.value)}
                          placeholder="your.email@university.edu"
                          className="h-11 sm:h-12 border-gray-200 dark:border-white/20 focus:border-blue-600 dark:focus:border-accent bg-gray-50 dark:bg-[#15325a]/50 text-[#15325a] dark:text-white rounded-2xl font-outfit transition-all duration-200 ease-in-out"
                          style={{
                            transition: 'background-color 0.2s ease-in-out, border-color 0.2s ease-in-out, color 0.2s ease-in-out',
                          }}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-sm font-medium text-[#15325a] dark:text-white font-outfit transition-colors duration-200 ease-in-out">
                          Phone Number
                        </Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange("phone", e.target.value)}
                          placeholder="+1 (555) 123-4567"
                          className="h-11 sm:h-12 border-gray-200 dark:border-white/20 focus:border-blue-600 dark:focus:border-accent bg-gray-50 dark:bg-[#15325a]/50 text-[#15325a] dark:text-white rounded-2xl font-outfit transition-all duration-200 ease-in-out"
                          style={{
                            transition: 'background-color 0.2s ease-in-out, border-color 0.2s ease-in-out, color 0.2s ease-in-out',
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-gray-200 dark:bg-white/20 transition-colors duration-200 ease-in-out" />

                  {/* Project Details */}
                  <div className="space-y-4 sm:space-y-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-8 h-8 bg-accent/10 dark:bg-accent/20 rounded-lg flex items-center justify-center transition-colors duration-200 ease-in-out">
                        <Target className="w-4 h-4 text-accent" />
                      </div>
                      <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#15325a] dark:text-white font-outfit transition-colors duration-200 ease-in-out">
                        Project Proposal
                      </h2>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pitch" className="text-sm font-medium text-[#15325a] dark:text-white font-outfit transition-colors duration-200 ease-in-out">
                        Your Proposal Pitch *
                      </Label>
                      <Textarea
                        id="pitch"
                        value={formData.pitch}
                        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => handleInputChange("pitch", e.target.value)}
                        placeholder="Describe why your society is the perfect fit for this project. Include your unique approach, relevant experience, and what value you'll bring..."
                        className="min-h-32 border-gray-200 dark:border-white/20 focus:border-blue-600 dark:focus:border-accent resize-none bg-gray-50 dark:bg-[#15325a]/50 text-[#15325a] dark:text-white rounded-2xl font-outfit transition-all duration-200 ease-in-out"
                        style={{
                          transition: 'background-color 0.2s ease-in-out, border-color 0.2s ease-in-out, color 0.2s ease-in-out',
                        }}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="deliverables" className="text-sm font-medium text-[#15325a] dark:text-white font-outfit transition-colors duration-200 ease-in-out">
                        Key Deliverables
                      </Label>
                      <Textarea
                        id="deliverables"
                        value={formData.deliverables}
                        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => handleInputChange("deliverables", e.target.value)}
                        placeholder="List the specific outcomes and deliverables you'll provide (e.g., social media content, event organization, marketing campaigns...)"
                        className="min-h-24 border-gray-200 dark:border-white/20 focus:border-blue-600 dark:focus:border-accent resize-none bg-gray-50 dark:bg-[#15325a]/50 text-[#15325a] dark:text-white rounded-2xl font-outfit transition-all duration-200 ease-in-out"
                        style={{
                          transition: 'background-color 0.2s ease-in-out, border-color 0.2s ease-in-out, color 0.2s ease-in-out',
                        }}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="teamSize" className="text-sm font-medium text-[#15325a] dark:text-white font-outfit transition-colors duration-200 ease-in-out">
                          <Users className="w-4 h-4 inline mr-1" />
                          Team Size
                        </Label>
                        <Input
                          id="teamSize"
                          value={formData.teamSize}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange("teamSize", e.target.value)}
                          placeholder="e.g., 5-8 members"
                          className="h-11 sm:h-12 border-gray-200 dark:border-white/20 focus:border-blue-600 dark:focus:border-accent bg-gray-50 dark:bg-[#15325a]/50 text-[#15325a] dark:text-white rounded-2xl font-outfit transition-all duration-200 ease-in-out"
                          style={{
                            transition: 'background-color 0.2s ease-in-out, border-color 0.2s ease-in-out, color 0.2s ease-in-out',
                          }}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="timeline" className="text-sm font-medium text-[#15325a] dark:text-white font-outfit transition-colors duration-200 ease-in-out">
                          <Calendar className="w-4 h-4 inline mr-1" />
                          Timeline
                        </Label>
                        <Input
                          id="timeline"
                          value={formData.timeline}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange("timeline", e.target.value)}
                          placeholder="e.g., 2-3 weeks"
                          className="h-11 sm:h-12 border-gray-200 dark:border-white/20 focus:border-blue-600 dark:focus:border-accent bg-gray-50 dark:bg-[#15325a]/50 text-[#15325a] dark:text-white rounded-2xl font-outfit transition-all duration-200 ease-in-out"
                          style={{
                            transition: 'background-color 0.2s ease-in-out, border-color 0.2s ease-in-out, color 0.2s ease-in-out',
                          }}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="budget" className="text-sm font-medium text-[#15325a] dark:text-white font-outfit transition-colors duration-200 ease-in-out">
                          <DollarSign className="w-4 h-4 inline mr-1" />
                          Budget Range
                        </Label>
                        <Input
                          id="budget"
                          value={formData.budget}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange("budget", e.target.value)}
                          placeholder="e.g., $500-1000"
                          className="h-11 sm:h-12 border-gray-200 dark:border-white/20 focus:border-blue-600 dark:focus:border-accent bg-gray-50 dark:bg-[#15325a]/50 text-[#15325a] dark:text-white rounded-2xl font-outfit transition-all duration-200 ease-in-out"
                          style={{
                            transition: 'background-color 0.2s ease-in-out, border-color 0.2s ease-in-out, color 0.2s ease-in-out',
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-gray-200 dark:bg-white/20 transition-colors duration-200 ease-in-out" />

                  {/* Experience & Social Reach */}
                  <div className="space-y-4 sm:space-y-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-8 h-8 bg-accent/10 dark:bg-accent/20 rounded-lg flex items-center justify-center transition-colors duration-200 ease-in-out">
                        <Award className="w-4 h-4 text-accent" />
                      </div>
                      <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#15325a] dark:text-white font-outfit transition-colors duration-200 ease-in-out">
                        Experience & Reach
                      </h2>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="experience" className="text-sm font-medium text-[#15325a] dark:text-white font-outfit transition-colors duration-200 ease-in-out">
                        Relevant Experience
                      </Label>
                      <Textarea
                        id="experience"
                        value={formData.experience}
                        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => handleInputChange("experience", e.target.value)}
                        placeholder="Describe your society's relevant experience, past projects, achievements, or similar collaborations..."
                        className="min-h-24 border-gray-200 dark:border-white/20 focus:border-blue-600 dark:focus:border-accent resize-none bg-gray-50 dark:bg-[#15325a]/50 text-[#15325a] dark:text-white rounded-2xl font-outfit transition-all duration-200 ease-in-out"
                        style={{
                          transition: 'background-color 0.2s ease-in-out, border-color 0.2s ease-in-out, color 0.2s ease-in-out',
                        }}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="socialReach" className="text-sm font-medium text-[#15325a] dark:text-white font-outfit transition-colors duration-200 ease-in-out">
                          Social Media Reach
                        </Label>
                        <Input
                          id="socialReach"
                          value={formData.socialReach}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange("socialReach", e.target.value)}
                          placeholder="e.g., 5K Instagram, 2K LinkedIn"
                          className="h-11 sm:h-12 border-gray-200 dark:border-white/20 focus:border-blue-600 dark:focus:border-accent bg-gray-50 dark:bg-[#15325a]/50 text-[#15325a] dark:text-white rounded-2xl font-outfit transition-all duration-200 ease-in-out"
                          style={{
                            transition: 'background-color 0.2s ease-in-out, border-color 0.2s ease-in-out, color 0.2s ease-in-out',
                          }}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="instagramHandle" className="text-sm font-medium text-[#15325a] dark:text-white font-outfit transition-colors duration-200 ease-in-out">
                          <Instagram className="w-4 h-4 inline mr-1" />
                          Instagram Handle
                        </Label>
                        <Input
                          id="instagramHandle"
                          value={formData.instagramHandle}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange("instagramHandle", e.target.value)}
                          placeholder="@yoursociety"
                          className="h-11 sm:h-12 border-gray-200 dark:border-white/20 focus:border-blue-600 dark:focus:border-accent bg-gray-50 dark:bg-[#15325a]/50 text-[#15325a] dark:text-white rounded-2xl font-outfit transition-all duration-200 ease-in-out"
                          style={{
                            transition: 'background-color 0.2s ease-in-out, border-color 0.2s ease-in-out, color 0.2s ease-in-out',
                          }}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="previousWork" className="text-sm font-medium text-[#15325a] dark:text-white font-outfit transition-colors duration-200 ease-in-out">
                        Portfolio/Previous Work Links
                      </Label>
                      <Input
                        id="previousWork"
                        value={formData.previousWork}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange("previousWork", e.target.value)}
                        placeholder="Links to your portfolio, previous campaigns, or work samples"
                        className="h-11 sm:h-12 border-gray-200 dark:border-white/20 focus:border-blue-600 dark:focus:border-accent bg-gray-50 dark:bg-[#15325a]/50 text-[#15325a] dark:text-white rounded-2xl font-outfit transition-all duration-200 ease-in-out"
                        style={{
                          transition: 'background-color 0.2s ease-in-out, border-color 0.2s ease-in-out, color 0.2s ease-in-out',
                        }}
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4 sm:pt-6">
                    <Button
                      type="submit"
                      disabled={loading || !isFormValid}
                      className="w-full bg-gradient-to-r from-accent to-blue-600 hover:from-accent/90 hover:to-blue-600/90 text-white font-medium h-12 sm:h-14 rounded-2xl text-base sm:text-lg group font-outfit transition-all duration-200 ease-in-out"
                      style={{
                        transition: 'background 0.2s ease-in-out',
                      }}
                    >
                      {loading ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Sending Proposal...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" />
                          <span>Submit Proposal</span>
                        </div>
                      )}
                    </Button>

                    {!isFormValid && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 text-center mt-2 font-outfit transition-colors duration-200 ease-in-out">
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
    <Suspense 
      fallback={
        <div 
          className="p-6 min-h-screen flex items-center justify-center bg-white dark:bg-[#15325a] transition-colors duration-200 ease-in-out"
          style={{
            transition: 'background-color 0.2s ease-in-out',
          }}
        >
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-[#15325a] dark:text-white font-outfit transition-colors duration-200 ease-in-out">
              Loading Form...
            </p>
          </div>
        </div>
      }
    >
      <SendProposalContent />
    </Suspense>
  )
}
