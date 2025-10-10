"use client"

import { useState, useEffect, FormEvent, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabaseClient"
import { API_URL } from "@/lib/constants"
import { format } from "date-fns"
import { DateRange } from "react-day-picker"
import { cn } from "@/lib/utils" // Make sure you have this utility

// Shadcn UI & Lucide Icons
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Send,
  Users,
  Calendar as CalendarIcon,
  Target,
  Award,
  CheckCircle,
  Building2,
} from "lucide-react"

// Types
interface FormData {
  societyName: string
  contactPerson: string
  email: string
  phone: string
  pitch: string
  teamSize: string
  timeline: DateRange | undefined
  budget: string
  experience: string
  deliverables: string
  previousWork: string
}

interface ProjectDetails {
  id: number
  compliant_name: string
  compliant_description: string
  services_required: string
}

// Separate component that uses useSearchParams
function SendProposalContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const projectId = searchParams.get("project_id")
  const supabase = getSupabaseClient()

  // Form state with updated timeline type
  const [formData, setFormData] = useState<FormData>({
    societyName: "",
    contactPerson: "",
    email: "",
    phone: "",
    pitch: "",
    teamSize: "",
    timeline: undefined,
    budget: "",
    experience: "",
    deliverables: "",
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
          const data = await res.json()
          const projects = Array.isArray(data) ? data : data.data || []
          const project = projects.find(
            (p: ProjectDetails) => p.id === Number.parseInt(projectId),
          )
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

  // Generic handler for most inputs
  const handleInputChange = (
    field: keyof Omit<FormData, "timeline">,
    value: string,
  ): void => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Specific handler for the DateRange picker
  const handleDateChange = (date: DateRange | undefined) => {
    setFormData(prev => ({ ...prev, timeline: date }))
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    setError("")
    setLoading(true)

    // Format timeline to a string before sending
    const timelineString = formData.timeline?.from
      ? formData.timeline.to
        ? `${format(formData.timeline.from, "LLL dd, y")} - ${format(
            formData.timeline.to,
            "LLL dd, y",
          )}`
        : format(formData.timeline.from, "LLL dd, y")
      : ""

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
          timeline: timelineString, // Send the formatted string
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || "Proposal failed")
      }

      router.push("/society/marketplace")
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const isFormValid =
    formData.societyName && formData.contactPerson && formData.email && formData.pitch

  return (
    <main className="min-h-screen bg-white dark:bg-[#15325a] font-outfit transition-colors duration-200">
      {/* Header */}
      <div className="bg-gradient-to-br from-accent via-accent/90 to-blue-600 dark:from-accent dark:via-accent/80 dark:to-blue-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
          <div className="mb-4 sm:mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="text-white hover:bg-white/20 -ml-2 rounded-2xl font-outfit transition-all"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Marketplace
            </Button>
          </div>

          <div className="space-y-4 sm:space-y-6">
            <div className="inline-flex items-center space-x-2 bg-white/20 dark:bg-white/30 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium">
              <Send className="w-4 h-4" />
              <span>Send Proposal</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
              Submit Your
              <span className="block mt-2 text-white/90">Collaboration Proposal</span>
            </h1>
            <p className="text-lg sm:text-xl text-white/80 max-w-2xl leading-relaxed">
              Showcase your society&apos;s capabilities and create an impactful partnership.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10 pb-16">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Project Details Sidebar */}
          {projectDetails && (
            <div className="lg:col-span-1 order-2 lg:order-1">
              <Card className="rounded-2xl shadow-xl border-gray-200 dark:border-white/10 bg-white dark:bg-[#15325a]/90 lg:sticky lg:top-8 transition-colors">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-accent to-blue-600 rounded-xl flex items-center justify-center text-white">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-[#15325a] dark:text-white">
                        Project Details
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        What you&apos;re applying for
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-[#15325a] dark:text-white mb-2">
                      {projectDetails.compliant_name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                      {projectDetails.compliant_description}
                    </p>
                  </div>
                  <Separator className="bg-gray-200 dark:bg-white/20" />
                  <div>
                    <p className="text-sm font-medium text-[#15325a] dark:text-white mb-2">
                      Services Required:
                    </p>
                    <Badge className="bg-accent/10 dark:bg-accent/20 text-accent rounded-xl">
                      {projectDetails.services_required}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Proposal Form */}
          <div
            className={`${projectDetails ? "lg:col-span-2 order-1 lg:order-2" : "lg:col-span-3"}`}
          >
            <Card className="rounded-2xl shadow-xl border-gray-200 dark:border-white/10 bg-white dark:bg-[#15325a]/90 transition-colors">
              <CardContent className="p-6 lg:p-8">
                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-xl p-4 mb-6">
                    <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Society Information */}
                  <div className="space-y-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-accent/10 dark:bg-accent/20 rounded-lg flex items-center justify-center">
                        <Users className="w-4 h-4 text-accent" />
                      </div>
                      <h2 className="text-xl font-bold text-[#15325a] dark:text-white">
                        Society Information
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="societyName">Society Name *</Label>
                        <Input
                          id="societyName"
                          value={formData.societyName}
                          onChange={e => handleInputChange("societyName", e.target.value)}
                          placeholder="e.g., Marketing Society"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contactPerson">Contact Person *</Label>
                        <Input
                          id="contactPerson"
                          value={formData.contactPerson}
                          onChange={e =>
                            handleInputChange("contactPerson", e.target.value)
                          }
                          placeholder="Your full name"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={e => handleInputChange("email", e.target.value)}
                          placeholder="your.email@university.edu"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={e => handleInputChange("phone", e.target.value)}
                          placeholder="+91 12345-67890"
                        />
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-gray-200 dark:bg-white/20" />

                  {/* Project Proposal */}
                  <div className="space-y-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-accent/10 dark:bg-accent/20 rounded-lg flex items-center justify-center">
                        <Target className="w-4 h-4 text-accent" />
                      </div>
                      <h2 className="text-xl font-bold text-[#15325a] dark:text-white">
                        Project Proposal
                      </h2>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pitch">Your Proposal Pitch *</Label>
                      <Textarea
                        id="pitch"
                        value={formData.pitch}
                        onChange={e => handleInputChange("pitch", e.target.value)}
                        placeholder="Describe why your society is the perfect fit. Include your unique approach, relevant experience, and the value you'll bring..."
                        className="min-h-32"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="deliverables">Key Deliverables</Label>
                      <Textarea
                        id="deliverables"
                        value={formData.deliverables}
                        onChange={e => handleInputChange("deliverables", e.target.value)}
                        placeholder="List specific outcomes: social media content, event organization, marketing campaigns..."
                        className="min-h-24"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="teamSize">Team Size</Label>
                        <Input
                          id="teamSize"
                          value={formData.teamSize}
                          onChange={e => handleInputChange("teamSize", e.target.value)}
                          placeholder="e.g., 5-8 members"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="timeline">Timeline</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              id="timeline"
                              variant={"outline"}
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !formData.timeline && "text-muted-foreground",
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {formData.timeline?.from ? (
                                formData.timeline.to ? (
                                  <>
                                    {format(formData.timeline.from, "LLL dd, y")}{" "}
                                    - {format(formData.timeline.to, "LLL dd, y")}
                                  </>
                                ) : (
                                  format(formData.timeline.from, "LLL dd, y")
                                )
                              ) : (
                                <span>Pick a date range</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              initialFocus
                              mode="range"
                              defaultMonth={formData.timeline?.from}
                              selected={formData.timeline}
                              onSelect={handleDateChange}
                              numberOfMonths={2}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="budget">Budget Range</Label>
                        <Input
                          id="budget"
                          value={formData.budget}
                          onChange={e => handleInputChange("budget", e.target.value)}
                          placeholder="e.g., $500-1000"
                        />
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-gray-200 dark:bg-white/20" />

                  {/* Experience */}
                  <div className="space-y-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-accent/10 dark:bg-accent/20 rounded-lg flex items-center justify-center">
                        <Award className="w-4 h-4 text-accent" />
                      </div>
                      <h2 className="text-xl font-bold text-[#15325a] dark:text-white">
                        Your Experience
                      </h2>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="experience">Relevant Experience</Label>
                      <Textarea
                        id="experience"
                        value={formData.experience}
                        onChange={e => handleInputChange("experience", e.target.value)}
                        placeholder="Describe past projects, achievements, or similar collaborations..."
                        className="min-h-24"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="previousWork">Portfolio/Previous Work</Label>
                      <Input
                        id="previousWork"
                        value={formData.previousWork}
                        onChange={e => handleInputChange("previousWork", e.target.value)}
                        placeholder="Links to your portfolio, campaigns, etc."
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-6">
                    <Button
                      type="submit"
                      disabled={loading || !isFormValid}
                      className="w-full bg-gradient-to-r from-accent to-blue-600 hover:from-accent/90 hover:to-blue-600/90 text-white font-medium h-14 rounded-2xl text-lg group"
                    >
                      {loading ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Sending...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                          <span>Submit Proposal</span>
                        </div>
                      )}
                    </Button>
                    {!isFormValid && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 text-center mt-2">
                        Please fill in all required fields (*).
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
        <div className="p-6 min-h-screen flex items-center justify-center bg-white dark:bg-[#15325a] transition-colors">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-[#15325a] dark:text-white">Loading Form...</p>
          </div>
        </div>
      }
    >
      <SendProposalContent />
    </Suspense>
  )
}