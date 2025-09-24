"use client"

import { useState, ChangeEvent, FormEvent, useEffect, Suspense } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabaseClient"
import { API_URL } from "@/lib/constants"
import { z } from "zod"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Building2, CheckCircle, Plus, FileText, Shield } from "lucide-react"

// Form shape
interface ProjectForm {
  name: string
  services: string
  description: string
  hideDetails: boolean
}

// Error shape
interface ProjectFormErrors {
  name?: string
  services?: string
  description?: string
}

// Project interface for edit mode
interface Project {
  id: string
  raw_name: string
  raw_description: string
  services_required: string
}

// Loading fallback component
function AddProjectFallback() {
  return (
    <main className="min-h-screen bg-primary">
      <div className="bg-brand-gradient text-white">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="space-y-4">
            <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium">
              <Plus className="w-4 h-4" />
              <span>Loading...</span>
            </div>
            <h1 className="h1 text-white">
              Loading Project Form
            </h1>
          </div>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-6 -mt-8 relative z-10 pb-16">
        <Card className="card rounded-2xl shadow-xl">
          <CardContent className="p-8">
            <div className="animate-pulse space-y-6">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

// Component that uses useSearchParams - wrapped in Suspense
function AddProjectForm() {
  const router = useRouter()
  const [searchParams, setSearchParams] = useState<URLSearchParams | null>(null)

  // Initialize searchParams on client side
  useEffect(() => {
    // This will only run on the client
    const url = new URL(window.location.href)
    setSearchParams(url.searchParams)
  }, [])

  const projectId = searchParams?.get("project_id")

  const [form, setForm] = useState<ProjectForm>({
    name: "",
    services: "",
    description: "",
    hideDetails: false,
  })
  const [errors, setErrors] = useState<ProjectFormErrors>({})
  const [loading, setLoading] = useState<boolean>(false)
  const [apiError, setApiError] = useState<string>("")
  const [isEditMode, setIsEditMode] = useState<boolean>(false)
  const [currentProject, setCurrentProject] = useState<Project | null>(null)

  // ✅ Zod schema for validation
  const schema = z.object({
    name: z.string().min(2, "Project name is required"),
    services: z.string().min(2, "Services required is required"),
    description: z.string().min(10, "Description must be at least 10 characters"),
  })

  // ✅ Fetch project data if in edit mode
  useEffect(() => {
    if (projectId) {
      setIsEditMode(true)
      fetchProjectForEdit()
    }
  }, [projectId])

  const fetchProjectForEdit = async () => {
    if (!projectId) return

    try {
      const supabase = getSupabaseClient()
      const {
        data: { session },
        error: supabaseError,
      } = await supabase.auth.getSession()

      if (supabaseError || !session) throw new Error("Not authenticated")

      const token = session.access_token
      const res = await fetch(`${API_URL}/api/get-project?project_id=${projectId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || "Failed to load project")
      }

      const project: Project = await res.json()
      setCurrentProject(project)

      // Populate form with existing data
      setForm({
        name: project.raw_name,
        services: project.services_required,
        description: project.raw_description,
        hideDetails: false, // Default to false for existing projects
      })
    } catch (err: any) {
      setApiError(err.message || "Failed to load project for editing")
    }
  }

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrors({})
    setApiError("")
    setLoading(true)

    const result = schema.safeParse(form)
    if (!result.success) {
      const fieldErrors: ProjectFormErrors = {}
      // result.error.format() always returns an object: { field: { _errors: [...] }, ... }
      const formatted = result.error.format()
      for (const key of Object.keys(form)) {
        const item = formatted[key as keyof ProjectForm]
        if (item && item._errors.length > 0) {
          fieldErrors[key as keyof ProjectForm] = item._errors[0]
        }
      }
      setErrors(fieldErrors)
      setLoading(false)
      return
    }

    try {
      const supabase = getSupabaseClient()
      const {
        data: { session },
        error: supabaseError,
      } = await supabase.auth.getSession()

      if (supabaseError || !session) throw new Error("Not authenticated")

      const token = session.access_token

      let res: Response
      let requestBody: any

      if (isEditMode && currentProject) {
        // Edit mode - call edit API
        res = await fetch(`${API_URL}/api/edit-project`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            project_id: currentProject.id,
            name: form.name,
            services_required: form.services,
            description: form.description,
            hide_details: form.hideDetails,
          }),
        })
      } else {
        // Create mode - call create API
        res = await fetch(`${API_URL}/api/create-project`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: form.name,
            services_required: form.services,
            description: form.description,
            hide_details: form.hideDetails,
          }),
        })
      }

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || `Failed to ${isEditMode ? 'update' : 'create'} project`)
      }

      const responseData = await res.json()

      if (isEditMode) {
        // For edit, redirect back to preview with updated data
        router.push(
          `/business/preview?project_id=${currentProject!.id}&compliant=${encodeURIComponent(responseData.compliant_description)}`,
        )
      } else {
        // For create, redirect to preview with new project data
        router.push(
          `/business/preview?project_id=${responseData.project_id}&compliant=${encodeURIComponent(responseData.compliant_description)}`,
        )
      }
    } catch (err: any) {
      setApiError(err.message || "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  const isFormValid =
    !!form.name &&
    !!form.services &&
    !!form.description

  return (
    <main className="min-h-screen bg-primary">
      {/* Header */}
      <div className="bg-brand-gradient text-white">
        <div className="max-w-4xl mx-auto px-6 py-8">
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
              <Plus className="w-4 h-4" />
              <span>{isEditMode ? 'Edit Project' : 'Create Project'}</span>
            </div>
            <h1 className="h1 text-white">
              {isEditMode ? 'Edit' : 'Create New'}
              <span className="block text-white/90">Business Project</span>
            </h1>
            <p className="text-xl text-white/80 max-w-2xl leading-relaxed">
              {isEditMode
                ? 'Update your project details and review changes before publishing'
                : 'Post your project to connect with talented college societies and receive innovative proposals'
              }
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 -mt-8 relative z-10 pb-16">
        <Card className="card rounded-2xl shadow-xl">
          <CardContent className="p-8">
            {apiError && (
              <div className="error-bg rounded-xl p-4 mb-6">
                <p className="text-error font-medium">{apiError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-accent" />
                  </div>
                  <h2 className="h3 text-text">Project Information</h2>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-text">
                    Project Name *
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g., Social Media Marketing Campaign"
                    className="input h-12"
                    required
                  />
                  {errors.name && <p className="text-xs text-error font-medium">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="services" className="text-sm font-medium text-text">
                    Services Required *
                  </Label>
                  <Input
                    id="services"
                    name="services"
                    value={form.services}
                    onChange={handleChange}
                    placeholder="e.g., Social Media Management, Event Planning, Content Creation"
                    className="input h-12"
                    required
                  />
                  {errors.services && <p className="text-xs text-error font-medium">{errors.services}</p>}
                </div>
              </div>

              <Separator className="bg-border" />

              {/* Project Details */}
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4 text-accent" />
                  </div>
                  <h2 className="h3 text-text">Project Description</h2>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium text-text">
                    Detailed Description *
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Describe your project in detail. What are you looking to achieve? What's the scope of work? Include any specific requirements or expectations..."
                    className="input min-h-32 resize-none"
                    rows={6}
                    required
                  />
                  {errors.description && <p className="text-xs text-error font-medium">{errors.description}</p>}
                  <p className="text-xs text-text-muted">
                    Minimum 10 characters. Be specific about your needs to attract the right societies.
                  </p>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-accent/5 rounded-lg border border-accent/20">
                  <Checkbox
                    id="hideDetails"
                    checked={form.hideDetails}
                    onCheckedChange={(checked) => setForm({ ...form, hideDetails: checked as boolean })}
                    className="data-[state=checked]:bg-accent data-[state=checked]:border-accent"
                  />
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-accent" />
                    <Label htmlFor="hideDetails" className="text-sm font-medium text-text cursor-pointer">
                      Hide sensitive details for privacy compliance
                    </Label>
                  </div>
                </div>
                <p className="text-xs text-text-muted ml-7">
                  When enabled, our AI will automatically redact company names, emails, phone numbers, and personal information from your project before publishing.
                </p>
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <Button
                  type="submit"
                  disabled={loading || !isFormValid}
                  className="btn-primary w-full h-14 rounded-xl text-lg group"
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>{isEditMode ? 'Updating Project...' : 'Creating Project...'}</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      <span>{isEditMode ? 'Update Project' : 'Create Project'}</span>
                    </div>
                  )}
                </Button>

                {!isFormValid && (
                  <p className="text-sm text-text-muted text-center mt-2">
                    Please fill in all required fields (marked with *)
                  </p>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

// Main page component with Suspense boundary
export default function AddProjectPage() {
  return (
    <Suspense fallback={<AddProjectFallback />}>
      <AddProjectForm />
    </Suspense>
  )
}
