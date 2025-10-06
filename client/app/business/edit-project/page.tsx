"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

// Loading fallback component
function EditProjectFallback() {
  return (
    <main className="min-h-screen bg-primary">
      <div className="bg-brand-gradient text-white">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="space-y-4">
            <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium">
              <ArrowLeft className="w-4 h-4" />
              <span>Loading...</span>
            </div>
            <h1 className="h1 text-white">
              Loading Project Editor
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
function EditProjectForm() {
  const searchParams = useSearchParams()
  const projectId = searchParams.get("project_id")

  if (!projectId) {
    return (
      <main className="min-h-screen bg-primary">
        <div className="bg-brand-gradient text-white">
          <div className="max-w-4xl mx-auto px-6 py-8">
            <div className="space-y-4">
              <Link href="/business">
                <Button variant="ghost" className="text-white hover:bg-white/20">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <h1 className="h1 text-white">
                Project Not Found
              </h1>
            </div>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-6 -mt-8 relative z-10 pb-16">
          <Card className="card rounded-2xl shadow-xl">
            <CardContent className="p-8">
              <p className="text-center text-muted-foreground">
                No project ID provided. Please select a project to edit.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    )
  }

  // For now, redirect to add-project with edit mode
  // This can be expanded later with a proper edit form
  return (
    <main className="min-h-screen bg-primary">
      <div className="bg-brand-gradient text-white">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="space-y-4">
            <Link href="/business">
              <Button variant="ghost" className="text-white hover:bg-white/20">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <h1 className="h1 text-white">
              Edit Project
            </h1>
          </div>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-6 -mt-8 relative z-10 pb-16">
        <Card className="card rounded-2xl shadow-xl">
          <CardContent className="p-8">
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                Edit functionality is currently being implemented.
              </p>
              <p className="text-sm text-muted-foreground">
                Project ID: {projectId}
              </p>
              <Link href={`/business/add-project?project_id=${projectId}`}>
                <Button>
                  Use Add Project Form (Temporary)
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

export default function EditProjectPage() {
  return (
    <Suspense fallback={<EditProjectFallback />}>
      <EditProjectForm />
    </Suspense>
  )
}