"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabaseClient"
import { API_URL } from "@/lib/constants"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, Building2, ArrowRight, Users, Briefcase } from "lucide-react"
import { Input } from "@/components/ui/input"

export default function MarketplacePage() {
  const router = useRouter()
  const [projects, setProjects] = useState([])
  const [filteredProjects, setFilteredProjects] = useState([])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const fetchProjects = async () => {
      const supabase = getSupabaseClient()
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
        const res = await fetch(`${API_URL}/api/marketplace-projects`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!res.ok) {
          const err = await res.json()
          setError(err.detail || "Failed to load projects")
        } else {
          const data = await res.json()
          setProjects(data)
          setFilteredProjects(data)
        }
      } catch (err) {
        setError("Something went wrong!")
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [])

  useEffect(() => {
    const filtered = projects.filter(
      (project) =>
        project.compliant_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.compliant_description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.services_required?.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredProjects(filtered)
  }, [searchTerm, projects])

  const getInitials = (name) => {
    return (
      name
        ?.split(" ")
        .map((word) => word[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "B"
    )
  }

  return (
    <main className="min-h-screen bg-primary">
      {/* Header Section */}
      <div className="bg-brand-gradient text-white">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium">
              <Building2 className="w-4 h-4" />
              <span>Business Marketplace</span>
            </div>
            <h1 className="h1 text-white">
              Discover Amazing
              <span className="block text-white/90">Business Opportunities</span>
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
              Connect with forward-thinking businesses looking for innovative college societies to create impactful
              collaborations
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-8 relative z-10">
        {/* Search and Filter Section */}
        <div className="card rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted w-5 h-5" />
              <Input
                placeholder="Search businesses, services, or descriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10 h-12"
              />
            </div>
            <Button className="btn-secondary h-12 px-6">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card rounded-xl p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-accent/10 rounded-lg">
                <Building2 className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text">{projects.length}</p>
                <p className="text-text-muted">Active Businesses</p>
              </div>
            </div>
          </div>
          <div className="card rounded-xl p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-accent/10 rounded-lg">
                <Users className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text">500+</p>
                <p className="text-text-muted">College Societies</p>
              </div>
            </div>
          </div>
          <div className="card rounded-xl p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-accent/10 rounded-lg">
                <Briefcase className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text">1.2k+</p>
                <p className="text-text-muted">Successful Projects</p>
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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 pb-16">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="card rounded-2xl overflow-hidden">
                <CardContent className="p-0">
                  <Skeleton className="h-48 w-full bg-primary" />
                  <div className="p-6 space-y-4">
                    <div className="flex items-center space-x-3">
                      <Skeleton className="w-12 h-12 rounded-full bg-primary" />
                      <Skeleton className="h-6 w-32 bg-primary" />
                    </div>
                    <Skeleton className="h-4 w-full bg-primary" />
                    <Skeleton className="h-4 w-3/4 bg-primary" />
                    <Skeleton className="h-10 w-full bg-primary" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Building2 className="w-12 h-12 text-accent" />
            </div>
            <h3 className="h3 text-text mb-2">{searchTerm ? "No businesses found" : "No businesses available yet"}</h3>
            <p className="text-text-muted max-w-md mx-auto">
              {searchTerm
                ? "Try adjusting your search terms or filters to find what you're looking for."
                : "Check back soon for new business opportunities and collaborations."}
            </p>
            {searchTerm && (
              <Button onClick={() => setSearchTerm("")} className="btn-secondary mt-4">
                Clear Search
              </Button>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 pb-16">
            {filteredProjects.map((project, index) => (
              <Card
                key={project.id}
                className="group card rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <CardContent className="p-0">
                  {/* Card Header with Gradient */}
                  <div className="h-32 bg-brand-gradient relative overflow-hidden">
                    <div className="absolute inset-0 bg-black/10"></div>
                    <div className="absolute bottom-4 left-6">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-white font-bold text-xl border border-white/30">
                        {getInitials(project.compliant_name)}
                      </div>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-6 space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-text group-hover:text-accent transition-colors">
                        {project.compliant_name}
                      </h3>
                      <p className="text-text-muted line-clamp-3 leading-relaxed">{project.compliant_description}</p>
                    </div>

                    {/* Services Badge */}
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-text">Services Required:</p>
                      <Badge className="badge">{project.services_required}</Badge>
                    </div>

                    {/* Action Button */}
                    <Button
                      className="btn-primary w-full h-12 rounded-xl group/btn"
                      onClick={() => router.push(`/society/proposal?project_id=${project.id}`)}
                    >
                      <span>Send Proposal</span>
                      <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
