"use client"

import { useState } from "react"
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
import { ArrowLeft, Building2, CheckCircle, Plus, FileText } from "lucide-react"

export default function AddProjectPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    name: "",
    services: "",
    description: "",
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState("")

  // ✅ Zod schema for validation
  const schema = z.object({
    name: z.string().min(2, "Project name is required"),
    services: z.string().min(2, "Services required is required"),
    description: z.string().min(10, "Description must be at least 10 characters"),
  })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    setApiError("")
    setLoading(true)

    const result = schema.safeParse(form)
    if (!result.success) {
      const fieldErrors = {}
      for (const [key, val] of Object.entries(result.error.format())) {
        if (key !== "_errors") {
          fieldErrors[key] = val._errors[0]
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
      const res = await fetch(`${API_URL}/api/create-project`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name,
          services_required: form.services,
          description: form.description,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || "Failed to create project")
      }

      const { compliant_description, project_id } = await res.json()

      // ✅ Redirect to preview page with query params
      router.push(
        `/business/preview?project_id=${project_id}&compliant=${encodeURIComponent(compliant_description)}`,
      )
    } catch (err) {
      setApiError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const isFormValid = form.name && form.services && form.description

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
              <span>Create Project</span>
            </div>
            <h1 className="h1 text-white">
              Create New
              <span className="block text-white/90">Business Project</span>
            </h1>
            <p className="text-xl text-white/80 max-w-2xl leading-relaxed">
              Post your project to connect with talented college societies and receive innovative proposals
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
                      <span>Creating Project...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      <span>Create Project</span>
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
