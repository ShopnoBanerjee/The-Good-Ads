"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { API_URL } from "@/lib/constants";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  Filter,
  Building2,
  ArrowRight,
  ArrowLeft,
  Calendar,
  Users,
} from "lucide-react";
import { Input } from "@/components/ui/input";

// Type definitions
interface Project {
  id: string;
  description: string;
  domains: string[];
  services_offered: string[];
  budget: number;
  created_at: string;
  proposal_count: number;
}

interface ProjectWithProposal extends Project {
  proposalStatus?: {
    has_proposal: boolean;
    status?: string;
    created_at?: string;
  };
}

interface ProjectsResponse {
  projects: Project[];
  total: number;
}

export default function MarketplacePage() {
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectWithProposal[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<ProjectWithProposal[]>([]);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState<number>(9);
  const [total, setTotal] = useState<number>(0);
  const [selectedProject, setSelectedProject] = useState<ProjectWithProposal | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  useEffect(() => {
    const fetchProjects = async (): Promise<void> => {
      setLoading(true);
      setError("");
      const supabase = getSupabaseClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setError("Not authenticated");
        setLoading(false);
        return;
      }

      const token = session.access_token;

      try {
        const res = await fetch(
          `${API_URL}/api/marketplace-projects?page=${page}&page_size=${pageSize}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!res.ok) {
          const err = await res.json();
          setError(err.detail || "Failed to load projects");
        } else {
          const data: ProjectsResponse = await res.json();
          const projectsData = data.projects || [];

          // Check proposal status for each project
          const projectsWithProposalStatus = await Promise.all(
            projectsData.map(async (project) => {
              try {
                const statusRes = await fetch(
                  `${API_URL}/api/check-proposal-status/${project.id}`,
                  {
                    headers: { Authorization: `Bearer ${token}` },
                  }
                );

                if (statusRes.ok) {
                  const statusData = await statusRes.json();
                  return { ...project, proposalStatus: statusData };
                }
              } catch (error) {
                console.error(`Failed to check proposal status for project ${project.id}:`, error);
              }

              return { ...project, proposalStatus: { has_proposal: false } };
            })
          );

          setProjects(projectsWithProposalStatus);
          setTotal(data.total || 0);
        }
      } catch {
        setError("Something went wrong!");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [page, pageSize]);

  useEffect(() => {
    const filtered = projects.filter(
      (project) =>
        project.description
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        project.domains?.some(domain =>
          domain.toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        project.services_offered?.some(service =>
          service.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );
    setFilteredProjects(filtered);
  }, [searchTerm, projects]);

  const getProjectName = (description?: string): string => {
    if (!description || description.trim() === "") {
      return "Untitled Project";
    }
    const firstLine = description.split('\n')[0];
    return firstLine.includes('—') ? firstLine.split('—')[0].replace('Project:', '').trim() : firstLine.trim();
  };

  const getProjectDescription = (description?: string): string => {
    if (!description || description.trim() === "") {
      return "";
    }
    const lines = description.split('\n');
    if (lines.length > 1) {
      return lines.slice(1).join('\n').trim();
    }
    return description.includes('—') ? description.split('—').slice(1).join('—').trim() : "";
  };

  return (
    <main 
      className="min-h-screen bg-white dark:bg-[#15325a] transition-colors duration-200 ease-in-out font-outfit"
      style={{
        transition: 'background-color 0.2s ease-in-out',
      }}
    >
      {/* Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-accent via-accent/90 to-blue-600 dark:from-accent dark:via-accent/80 dark:to-blue-700">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          {/* Back Button */}
          <div className="mb-4 sm:mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/society')}
              className="text-white hover:bg-white/20 -ml-2 rounded-2xl font-outfit transition-all"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
          <div className="text-center space-y-6">
            <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-2 sm:px-4 text-sm font-medium text-white font-outfit">
              <Building2 className="w-4 h-4" />
              <span>Business Marketplace</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight font-outfit">
              Discover Amazing
              <span className="block text-white/90 mt-2">
                Business Opportunities
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed px-4 font-outfit">
              Connect with forward-thinking businesses looking for innovative
              college societies to create impactful collaborations
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 relative z-10">
        {/* Search and Filter Section */}
        <div 
          className="bg-white dark:bg-[#15325a]/90 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8 transition-all duration-200 ease-in-out"
          style={{
            transition: 'background-color 0.2s ease-in-out, border-color 0.2s ease-in-out',
          }}
        >
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
              <Input
                placeholder="Search projects, domains, or services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 sm:pl-12 h-11 sm:h-12 bg-gray-50 dark:bg-[#15325a]/50 border-gray-200 dark:border-white/20 text-[#15325a] dark:text-white focus:border-blue-600 dark:focus:border-accent transition-all duration-200 ease-in-out font-outfit rounded-2xl"
                style={{
                  transition: 'background-color 0.2s ease-in-out, border-color 0.2s ease-in-out, color 0.2s ease-in-out',
                }}
              />
            </div>
            <Button 
              variant="outline" 
              className="h-11 sm:h-12 px-4 sm:px-6 whitespace-nowrap bg-white dark:bg-[#15325a] border-2 border-[#15325a] dark:border-white text-[#15325a] dark:text-white hover:bg-[#15325a] hover:text-white dark:hover:bg-white dark:hover:text-[#15325a] transition-all duration-200 ease-in-out font-outfit rounded-2xl"
              style={{
                transition: 'color 0.2s ease-in-out, background-color 0.2s ease-in-out, border-color 0.2s ease-in-out',
              }}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div
            className="bg-white dark:bg-[#15325a]/90 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-4 sm:p-6 transition-all duration-200 ease-in-out"
            style={{
              transition: 'background-color 0.2s ease-in-out, border-color 0.2s ease-in-out',
            }}
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 sm:p-3 bg-accent/10 dark:bg-accent/20 rounded-lg transition-colors duration-200 ease-in-out">
                <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-[#15325a] dark:text-white font-outfit transition-colors duration-200 ease-in-out">
                  {total}
                </p>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 font-outfit transition-colors duration-200 ease-in-out">Active Businesses</p>
              </div>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div 
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 transition-all duration-200 ease-in-out"
            style={{
              transition: 'background-color 0.2s ease-in-out, border-color 0.2s ease-in-out',
            }}
          >
            <p className="text-red-600 dark:text-red-400 text-center font-medium font-outfit transition-colors duration-200 ease-in-out">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-12 sm:pb-16">
            {Array.from({ length: pageSize }).map((_, i) => (
              <Card
                key={i}
                className="bg-white dark:bg-[#15325a]/95 backdrop-blur-sm border border-gray-100 dark:border-white/5 rounded-2xl overflow-hidden"
              >
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-3">
                    <Skeleton className="h-6 w-3/4 bg-gray-200 dark:bg-gray-700" />
                    <Skeleton className="h-4 w-full bg-gray-200 dark:bg-gray-700" />
                    <Skeleton className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700" />
                  </div>
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-16 bg-gray-200 dark:bg-gray-700" />
                    <div className="flex gap-2">
                      <Skeleton className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-full" />
                      <Skeleton className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded-full" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-20 bg-gray-200 dark:bg-gray-700" />
                    <div className="flex gap-2">
                      <Skeleton className="h-6 w-28 bg-gray-200 dark:bg-gray-700 rounded-full" />
                      <Skeleton className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded-full" />
                    </div>
                  </div>
                  <Skeleton className="h-11 w-full bg-gray-200 dark:bg-gray-700 rounded-xl mt-6" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-12 sm:py-16 px-4">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-accent/10 dark:bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 transition-colors duration-200 ease-in-out">
              <Building2 className="w-10 h-10 sm:w-12 sm:h-12 text-accent" />
            </div>
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#15325a] dark:text-white mb-2 font-outfit transition-colors duration-200 ease-in-out">
              {searchTerm
                ? "No businesses found"
                : "No businesses available yet"}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto text-sm sm:text-base leading-relaxed font-outfit transition-colors duration-200 ease-in-out">
              {searchTerm
                ? "Try adjusting your search terms or filters to find what you're looking for."
                : "Check back soon for new business opportunities and collaborations."}
            </p>
            {searchTerm && (
              <Button
                onClick={() => setSearchTerm("")}
                variant="outline"
                className="mt-4 sm:mt-6 border-2 border-[#15325a] dark:border-white text-[#15325a] dark:text-white hover:bg-[#15325a] hover:text-white dark:hover:bg-white dark:hover:text-[#15325a] transition-all duration-200 ease-in-out font-outfit rounded-2xl"
                style={{
                  transition: 'color 0.2s ease-in-out, background-color 0.2s ease-in-out, border-color 0.2s ease-in-out',
                }}
              >
                Clear Search
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-6 sm:pb-8">
              {filteredProjects.map((project) => (
                <Card
                  key={project.id}
                  className="group bg-slate-50/95 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/60 dark:border-slate-700/50 hover:border-accent/40 dark:hover:border-accent/50 hover:shadow-xl dark:hover:shadow-2xl rounded-2xl overflow-hidden transition-all duration-300 ease-out h-full"
                >
                  <CardContent className="p-6 font-outfit h-full flex flex-col">
                    {/* Project Title */}
                    <div className="mb-4">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-xl font-semibold text-[#15325a] dark:text-white leading-tight line-clamp-2 mb-2 flex-1">
                          {getProjectName(project.description)}
                        </h3>
                        {project.proposalStatus?.has_proposal && (
                          <span className="text-xs font-medium text-green-600 dark:text-green-400 whitespace-nowrap mt-1">
                            Request Sent
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed line-clamp-2">
                        {getProjectDescription(project.description)}
                      </p>
                    </div>

                    {/* Domains and Services */}
                    <div className="space-y-4 flex-1 mb-6">
                      {project.domains && project.domains.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-[#15325a]/70 dark:text-white/70 uppercase tracking-wide mb-2">
                            Domains
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {project.domains.slice(0, 2).map((domain, index) => (
                              <Badge
                                key={index}
                                variant="secondary"
                                className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800/30 border-0 text-xs px-3 py-1 font-medium"
                              >
                                {domain.length > 15 ? `${domain.substring(0, 15)}...` : domain}
                              </Badge>
                            ))}
                            {project.domains.length > 2 && (
                              <Badge
                                variant="outline"
                                className="border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 text-xs px-3 py-1"
                              >
                                +{project.domains.length - 2}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {project.services_offered && project.services_offered.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-[#15325a]/70 dark:text-white/70 uppercase tracking-wide mb-2">
                            Services
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {project.services_offered.slice(0, 3).map((service, index) => (
                              <Badge
                                key={index}
                                className="bg-accent/5 dark:bg-accent/10 text-accent hover:bg-accent/10 dark:hover:bg-accent/20 border border-accent/10 text-xs px-3 py-1 font-medium"
                              >
                                {service.length > 18 ? `${service.substring(0, 18)}...` : service}
                              </Badge>
                            ))}
                            {project.services_offered.length > 3 && (
                              <Badge
                                variant="outline"
                                className="border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 text-xs px-3 py-1"
                              >
                                +{project.services_offered.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Budget Display */}
                    <div className="bg-green-50/80 dark:bg-green-900/10 border border-green-200/50 dark:border-green-800/20 rounded-lg p-3 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-green-700 dark:text-green-300">Project Budget</span>
                        <span className="text-lg font-bold text-green-600 dark:text-green-400">
                          ₹{project.budget.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="mt-auto pt-4 border-t border-gray-100 dark:border-white/5">
                      <Button
                        onClick={() => {
                          setSelectedProject(project);
                          setIsDialogOpen(true);
                        }}
                        className="w-full h-11 bg-accent hover:bg-accent/90 text-white border-0 rounded-xl font-medium text-sm transition-all duration-300 ease-out hover:shadow-lg"
                      >
                        {project.proposalStatus?.has_proposal ? 'View Details' : 'View Project'}
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300 ease-out" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Project Details Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-[#15325a] border border-gray-200 dark:border-white/10">
                <DialogHeader className="space-y-4">
                  <DialogTitle className="text-2xl font-bold text-[#15325a] dark:text-white font-outfit">
                    {selectedProject && getProjectName(selectedProject.description)}
                  </DialogTitle>
                  <DialogDescription className="text-gray-600 dark:text-gray-300 text-base leading-relaxed">
                    {selectedProject && getProjectDescription(selectedProject.description)}
                  </DialogDescription>
                </DialogHeader>

                {selectedProject && (
                  <div className="space-y-6 mt-6">
                    {/* Project Metadata */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-[#15325a]/50 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <Calendar className="w-5 h-5 text-accent" />
                        <div>
                          <p className="text-sm font-medium text-[#15325a] dark:text-white">Created</p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {new Date(selectedProject.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Users className="w-5 h-5 text-accent" />
                        <div>
                          <p className="text-sm font-medium text-[#15325a] dark:text-white">Proposals</p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {selectedProject.proposal_count} received
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">₹</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#15325a] dark:text-white">Budget</p>
                          <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                            ₹{selectedProject.budget.toLocaleString('en-IN')}
                          </p>
                        </div>
                      </div>
                    </div>


                    {/* Domains */}
                    {selectedProject.domains && selectedProject.domains.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="text-lg font-semibold text-[#15325a] dark:text-white">Domains</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedProject.domains.map((domain, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-0 px-4 py-2 text-sm font-medium"
                            >
                              {domain}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Services Offered */}
                    {selectedProject.services_offered && selectedProject.services_offered.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="text-lg font-semibold text-[#15325a] dark:text-white">Services Offered</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedProject.services_offered.map((service, index) => (
                            <Badge
                              key={index}
                              className="bg-accent/5 dark:bg-accent/10 text-accent border border-accent/10 px-4 py-2 text-sm font-medium"
                            >
                              {service}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Proposal Status */}
                    {selectedProject.proposalStatus?.has_proposal && (
                      <div className="p-4 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800/30 rounded-xl">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <div>
                            <p className="font-medium text-green-800 dark:text-green-400">
                              {selectedProject.proposalStatus.status === 'accepted' ? 'Proposal Accepted' :
                               selectedProject.proposalStatus.status === 'rejected' ? 'Proposal Rejected' :
                               'Proposal Submitted'}
                            </p>
                            {selectedProject.proposalStatus.status === 'submitted' && (
                              <p className="text-sm text-green-600 dark:text-green-500">
                                Awaiting business response
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-white/10">
                      {!selectedProject.proposalStatus?.has_proposal ? (
                        <Button
                          onClick={async () => {
                            try {
                              const supabase = getSupabaseClient();
                              const { data: { session } } = await supabase.auth.getSession();
                              if (!session) {
                                alert('Not authenticated. Please log in again.');
                                return;
                              }
                              // Fetch the society_id from the profile API
                              const profileRes = await fetch(`${API_URL}/api/society-profile`, {
                                headers: { 'Authorization': `Bearer ${session.access_token}` }
                              });
                              if (!profileRes.ok) {
                                alert('Could not fetch society profile.');
                                return;
                              }
                              const profile = await profileRes.json();
                              const society_id = profile.id;

                              const response = await fetch(`${API_URL}/api/express-interest`, {
                                method: 'POST',
                                headers: {
                                  'Content-Type': 'application/json',
                                  'Authorization': `Bearer ${session.access_token}`,
                                },
                                body: JSON.stringify({
                                  project_id: selectedProject.id,
                                  society_id,
                                }),
                              });

                              if (response.ok) {
                                setIsDialogOpen(false);
                                // Refresh the page to update proposal status
                                window.location.reload();
                              } else {
                                const error = await response.json();
                                alert(`Failed to express interest: ${error.detail}`);
                              }
                            } catch (error) {
                              console.error('Error expressing interest:', error);
                              alert('Failed to express interest. Please try again.');
                            }
                          }}
                          className="flex-1 h-12 bg-accent hover:bg-accent/90 text-white rounded-xl font-medium text-base transition-all duration-300"
                        >
                          Send Request
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                      ) : (
                        <div className="flex-1 p-4 bg-gray-50 dark:bg-[#15325a]/50 rounded-xl text-center">
                          <p className="text-gray-600 dark:text-gray-400 font-medium">
                            {selectedProject.proposalStatus.status === 'accepted' ? 'Request Accepted' :
                             selectedProject.proposalStatus.status === 'rejected' ? 'Request Rejected' :
                             'Request Pending'}
                          </p>
                        </div>
                      )}
                      <Button
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                        className="flex-1 sm:flex-none h-12 border-2 border-gray-200 dark:border-white/20 text-[#15325a] dark:text-white hover:bg-gray-50 dark:hover:bg-[#15325a]/50 rounded-xl font-medium text-base"
                      >
                        Close
                      </Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>

            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4 pb-8 sm:pb-12">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="w-full sm:w-auto border-2 border-[#15325a] dark:border-white text-[#15325a] dark:text-white hover:bg-[#15325a] hover:text-white dark:hover:bg-white dark:hover:text-[#15325a] transition-all duration-200 ease-in-out font-outfit rounded-2xl"
                style={{
                  transition: 'color 0.2s ease-in-out, background-color 0.2s ease-in-out, border-color 0.2s ease-in-out',
                }}
              >
                Previous
              </Button>
              <span className="font-medium text-[#15325a] dark:text-white text-sm sm:text-base order-first sm:order-none font-outfit transition-colors duration-200 ease-in-out">
                Page {page} of {Math.max(1, Math.ceil(total / pageSize))}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= Math.ceil(total / pageSize)}
                onClick={() => setPage((p) => p + 1)}
                className="w-full sm:w-auto border-2 border-[#15325a] dark:border-white text-[#15325a] dark:text-white hover:bg-[#15325a] hover:text-white dark:hover:bg-white dark:hover:text-[#15325a] transition-all duration-200 ease-in-out font-outfit rounded-2xl"
                style={{
                  transition: 'color 0.2s ease-in-out, background-color 0.2s ease-in-out, border-color 0.2s ease-in-out',
                }}
              >
                Next
              </Button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
