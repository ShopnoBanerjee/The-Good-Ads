"use client"

import { useState, ChangeEvent, FormEvent, useEffect, Suspense, useCallback } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabaseClient"
import { API_URL } from "@/lib/constants"
import { DOMAINS } from "@/lib/constants"
import { z } from "zod"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Building2, CheckCircle, FileText, Plus, Globe, Settings, DollarSign } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Form shape
interface ProjectForm {
  description: string
  domains: string[]
  servicesOffered: string[]
  budget: string
}

// Error shape
interface ProjectFormErrors {
  description?: string
  domains?: string
  servicesOffered?: string
  budget?: string
}

// Project interface for edit mode
interface Project {
  id: string
  description: string
  domains: string[]
  services_offered: string[]
  budget: number
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
    description: "",
    domains: [],
    servicesOffered: [],
    budget: "",
  })
  const [errors, setErrors] = useState<ProjectFormErrors>({})
  const [loading, setLoading] = useState<boolean>(false)
  const [apiError, setApiError] = useState<string>("")
  const [isEditMode, setIsEditMode] = useState<boolean>(false)
  const [currentProject, setCurrentProject] = useState<Project | null>(null)
  const [fieldErrors, setFieldErrors] = useState<ProjectFormErrors>({})

  // ✅ Zod schema for validation
  const schema = z.object({
    description: z.string().min(10, "Description must be at least 10 characters"),
    domains: z.array(z.string()).min(1, "At least one domain is required"),
    servicesOffered: z.array(z.string()).min(1, "At least one service is required"),
    budget: z.string().refine((val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num > 1000;
    }, "Budget must be a number greater than 1000"),
  })

  // ✅ Fetch project data if in edit mode
  const fetchProjectForEdit = useCallback(async () => {
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
        description: project.description,
        domains: project.domains,
        servicesOffered: project.services_offered,
        budget: project.budget.toString(),
      })
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : "Failed to load project for editing")
    }
  }, [projectId])

  useEffect(() => {
    if (projectId) {
      setIsEditMode(true)
      fetchProjectForEdit()
    }
  }, [projectId, fetchProjectForEdit])

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleDomainChange = (domain: string, checked: boolean) => {
    setForm(prev => ({
      ...prev,
      domains: checked ? [...prev.domains, domain] : prev.domains.filter(d => d !== domain)
    }))
    setFieldErrors(prev => {
      if (prev.domains) {
        const newErrors = { ...prev }
        delete newErrors.domains
        return newErrors
      }
      return prev
    })
  }

  const handleServiceChange = (service: string, checked: boolean) => {
    setForm(prev => ({
      ...prev,
      servicesOffered: checked ? [...prev.servicesOffered, service] : prev.servicesOffered.filter(s => s !== service)
    }))
    setFieldErrors(prev => {
      if (prev.servicesOffered) {
        const newErrors = { ...prev }
        delete newErrors.servicesOffered
        return newErrors
      }
      return prev
    })
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
            description: form.description,
            domains: form.domains,
            services_offered: form.servicesOffered,
            budget: parseFloat(form.budget),
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
            description: form.description,
            domains: form.domains,
            services_offered: form.servicesOffered,
            budget: parseFloat(form.budget),
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
          `/business/preview?project_id=${currentProject!.id}`,
        )
      } else {
        // For create, redirect to preview with new project data
        router.push(
          `/business/preview?project_id=${responseData.project_id}`,
        )
      }
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  const isFormValid =
    !!form.description &&
    form.domains.length > 0 &&
    form.servicesOffered.length > 0 &&
    !!form.budget

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
                  <Label className="text-sm font-medium text-text flex items-center gap-2">
                    <Globe className="w-4 h-4 text-accent" />
                    Domains *
                  </Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full h-12 font-outfit text-text bg-gray-700 border border-gray-700 rounded-xl px-4 py-3 justify-start hover:bg-gray-600 transition-all duration-300"
                      >
                        {form.domains.length > 0 ? `${form.domains.length} selected` : "Select Domains"}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-full bg-[#15325a] border-gray-700 max-h-48 overflow-auto">
                      <DropdownMenuLabel className="text-gray-300">Choose Domains</DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-gray-700" />
                      {Object.keys(DOMAINS).map(domain => (
                        <DropdownMenuCheckboxItem
                          key={domain}
                          checked={form.domains.includes(domain)}
                          onCheckedChange={(checked) => handleDomainChange(domain, checked as boolean)}
                          className="text-white focus:bg-[#11aad4] focus:text-white"
                        >
                          {domain}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  {form.domains.length > 0 && (
                    <p className="text-xs text-gray-400 font-outfit">
                      Selected: {form.domains.join(", ")}
                    </p>
                  )}
                  {fieldErrors.domains && (
                    <div className="flex items-center gap-1 text-xs text-red-400 animate-in slide-in-from-top-1 duration-200 font-outfit">
                      <div className="w-3 h-3 rounded-full bg-red-500 flex items-center justify-center text-white text-xs">!</div>
                      {fieldErrors.domains}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="budget" className="text-sm font-medium text-text flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-accent" />
                    Project Budget *
                  </Label>
                  <Input
                    id="budget"
                    name="budget"
                    type="number"
                    value={form.budget}
                    onChange={handleChange}
                    placeholder="Enter project budget (minimum ₹1001)"
                    className="input h-12"
                    min="1001"
                    step="0.01"
                    required
                  />
                  {errors.budget && <p className="text-xs text-error font-medium">{errors.budget}</p>}
                  <p className="text-xs text-text-muted">
                    Budget must be greater than ₹1000. This helps societies understand project scope.
                  </p>
                </div>

                <div className="space-y-6">
                  <Label className="text-sm font-medium text-text flex items-center gap-2">
                    <Settings className="w-4 h-4 text-accent" />
                    Services Required *
                  </Label>
                  {form.domains.map(domain => {
                    const domainServices = DOMAINS[domain] || []
                    const selectedForDomain = form.servicesOffered.filter(service => domainServices.includes(service))
                    return (
                      <div key={domain} className="space-y-2">
                        <h3 className="text-sm font-medium text-gray-300 font-outfit">{domain}</h3>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full h-11 font-outfit text-white bg-gray-700 border border-gray-700 rounded-xl px-4 py-3 justify-start hover:bg-gray-600 transition-all duration-300"
                            >
                              {selectedForDomain.length > 0 ? `${selectedForDomain.length} selected` : "Select Services"}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-full bg-[#15325a] border-gray-700 max-h-64 overflow-auto">
                            <DropdownMenuLabel className="text-gray-300">Choose Services</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-gray-700" />
                            {domainServices.map(service => (
                              <DropdownMenuCheckboxItem
                                key={service}
                                checked={form.servicesOffered.includes(service)}
                                onCheckedChange={(checked) => handleServiceChange(service, checked as boolean)}
                                className="text-white focus:bg-[#11aad4] focus:text-white"
                              >
                                {service}
                              </DropdownMenuCheckboxItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                        {selectedForDomain.length > 0 && (
                          <p className="text-xs text-gray-400 font-outfit">
                            Selected: {selectedForDomain.join(", ")}
                          </p>
                        )}
                      </div>
                    )
                  })}
                  {fieldErrors.servicesOffered && (
                    <div className="flex items-center gap-1 text-xs text-red-400 animate-in slide-in-from-top-1 duration-200 font-outfit">
                      <div className="w-3 h-3 rounded-full bg-red-500 flex items-center justify-center text-white text-xs">!</div>
                      {fieldErrors.servicesOffered}
                    </div>
                  )}
                </div>

                {form.domains.length === 0 && (
                  <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex items-center justify-center">
                      <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                        Select domains first
                      </p>
                      <p className="text-xs text-blue-700 dark:text-blue-300">
                        Choose your project domains above to see available services
                      </p>
                    </div>
                  </div>
                )}
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
