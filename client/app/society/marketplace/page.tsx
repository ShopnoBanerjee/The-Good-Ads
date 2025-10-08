"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { API_URL } from "@/lib/constants";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Search,
  Filter,
  Building2,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  X,
  Clock,
} from "lucide-react";
import { Input } from "@/components/ui/input";

// Type definitions
interface Project {
  id: number;
  compliant_name: string;
  compliant_description: string;
  services_required: string;
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
        project.compliant_name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        project.compliant_description
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        project.services_required
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase())
    );
    setFilteredProjects(filtered);
  }, [searchTerm, projects]);

  const getInitials = (name?: string): string => {
    if (!name || name.trim() === "[REDACTED]") {
      return "P";
    }
    return (
      name
        ?.split(" ")
        .map((word) => word[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "B"
    );
  };

  const isRedacted = (name?: string): boolean => {
    return !name || name.trim() === "[REDACTED]";
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
                placeholder="Search businesses, services, or descriptions..."
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 pb-12 sm:pb-16">
            {Array.from({ length: pageSize }).map((_, i) => (
              <Card 
                key={i} 
                className="bg-white dark:bg-[#15325a]/90 border border-gray-200 dark:border-white/10 rounded-xl sm:rounded-2xl overflow-hidden transition-all duration-200 ease-in-out"
                style={{
                  transition: 'background-color 0.2s ease-in-out, border-color 0.2s ease-in-out',
                }}
              >
                <CardContent className="p-0">
                  <Skeleton className="h-32 sm:h-40 lg:h-48 w-full bg-gray-200 dark:bg-gray-700" />
                  <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                    <div className="flex items-center space-x-3">
                      <Skeleton className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-200 dark:bg-gray-700" />
                      <Skeleton className="h-5 sm:h-6 w-24 sm:w-32 bg-gray-200 dark:bg-gray-700" />
                    </div>
                    <Skeleton className="h-4 w-full bg-gray-200 dark:bg-gray-700" />
                    <Skeleton className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700" />
                    <Skeleton className="h-10 sm:h-12 w-full bg-gray-200 dark:bg-gray-700 rounded-lg" />
                  </div>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 pb-6 sm:pb-8">
              {filteredProjects.map((project) => (
                <Card
                  key={project.id}
                  className="group bg-white dark:bg-[#15325a]/90 border border-gray-200 dark:border-white/10 hover:border-blue-600 dark:hover:border-accent hover:shadow-lg dark:hover:shadow-xl rounded-xl sm:rounded-2xl overflow-hidden transition-all duration-200 ease-in-out hover:-translate-y-1"
                  style={{
                    transition: 'background-color 0.2s ease-in-out, border-color 0.2s ease-in-out, transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                  }}
                >
                  <CardContent className="p-0 font-outfit">
                    {/* Card Header with Gradient */}
                    <div className="h-28 sm:h-32 lg:h-36 bg-gradient-to-br from-accent via-accent/90 to-blue-600 relative overflow-hidden">
                      <div className="absolute inset-0 bg-black/10" />
                      <div className="absolute bottom-3 sm:bottom-4 left-4 sm:left-6">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl flex items-center justify-center text-white font-bold text-base sm:text-lg lg:text-xl border border-white/30 font-outfit">
                          {getInitials(project.compliant_name)}
                        </div>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg sm:text-xl font-bold text-[#15325a] dark:text-white group-hover:text-blue-600 dark:group-hover:text-accent line-clamp-2 font-outfit transition-colors duration-200 ease-in-out">
                            {project.compliant_name}
                          </h3>
                          {isRedacted(project.compliant_name) && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button className="flex-shrink-0 w-4 h-4 rounded-full bg-gray-400 hover:bg-gray-500 transition-colors flex items-center justify-center">
                                  <span className="text-xs text-white font-bold">?</span>
                                </button>
                              </TooltipTrigger>
                              <TooltipContent className="bg-blue-600 text-white border-blue-600">
                                <p>This company prefers to maintain privacy</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base line-clamp-3 leading-relaxed font-outfit transition-colors duration-200 ease-in-out">
                          {project.compliant_description}
                        </p>
                      </div>

                      {/* Services Badge */}
                      <div className="space-y-2">
                        <p className="text-xs sm:text-sm font-medium text-[#15325a] dark:text-white font-outfit transition-colors duration-200 ease-in-out">
                          Services Required:
                        </p>
                        <Badge className="bg-accent/10 dark:bg-accent/20 text-accent hover:bg-accent/20 dark:hover:bg-accent/30 border border-accent/20 text-xs sm:text-sm font-outfit transition-colors duration-200 ease-in-out rounded-xl">
                          {project.services_required}
                        </Badge>
                      </div>

                      {/* Action Button */}
                      {project.proposalStatus?.has_proposal ? (
                        <div className="space-y-2">
                          <Badge
                            variant="secondary"
                            className="w-full justify-center py-2 text-sm font-outfit bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800"
                          >
                            {project.proposalStatus.status === 'accepted' ? '✓ Proposal Accepted' :
                             project.proposalStatus.status === 'rejected' ? '✗ Proposal Rejected' :
                             '⏳ Proposal Submitted'}
                          </Badge>
                          {project.proposalStatus.status === 'submitted' && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 text-center font-outfit">
                              Awaiting business response
                            </p>
                          )}
                        </div>
                      ) : (
                        <Button
                          className="w-full h-10 sm:h-12 rounded-2xl group/btn bg-accent text-white border-2 border-transparent hover:bg-transparent hover:border-accent hover:text-accent transition-all duration-200 ease-in-out text-sm sm:text-base font-outfit"
                          onClick={() =>
                            router.push(
                              `/society/proposal?project_id=${project.id}`
                            )
                          }
                          style={{
                            transition: 'color 0.2s ease-in-out, background-color 0.2s ease-in-out, border-color 0.2s ease-in-out',
                          }}
                        >
                          <span>Send Proposal</span>
                          <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform duration-200 ease-in-out" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

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
