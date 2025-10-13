'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import {
  Building2,
  Users,
  Camera,
  ArrowRight,
  Eye,
  FileText,
  Calendar,
} from "lucide-react";
import { ChatWidget } from "@/components/ChatWidget";
import { FloatingChatButton } from "@/components/FloatingChatButton";

// Types
interface Profile {
  id: string;
  society_name: string;
  domain: string;
  services_offered: string;
  description?: string;
  logo_url?: string;
}

interface Project {
  id: string;
  business_id: string;
  description: string;
  status: string;
  created_at: string;
  proposal_count: number;
  society_id: string;
  domains: string[];
  services_offered: string[];
  budget: number;
}

export default function SocietyDashboard() {
  const router = useRouter();
  const supabase = getSupabaseClient();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [mounted, setMounted] = useState(false);
  const [activeProjects, setActiveProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState<boolean>(true);

  // Chat state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [currentUserType, setCurrentUserType] = useState<'business' | 'college_society'>('college_society');
  const [unreadCount, setUnreadCount] = useState(0);

  const { theme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const loadProfile = async (): Promise<void> => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) return;

        const token = session.access_token;
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/society-profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const profileData = await res.json();
          setProfile(profileData);
        } else {
          // Handle error silently
        }
      } catch {
        // Handle error silently
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [supabase]);

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setCurrentUserId(session.user.id);
          setCurrentUserType('college_society');
        }
      } catch (error) {
        console.error('Failed to load user profile:', error);
      }
    };

    loadUserProfile();
  }, [supabase]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Open/close chat with Ctrl/Cmd + K
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        setIsChatOpen(!isChatOpen);
        if (!isChatOpen) {
          setUnreadCount(0);
        }
      }
      // Close chat with Escape
      if (event.key === 'Escape' && isChatOpen) {
        setIsChatOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isChatOpen]);

  useEffect(() => {
    const loadActiveProjects = async (): Promise<void> => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) return;

        const token = session.access_token;
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/society-projects`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const projects: Project[] = await res.json();
          setActiveProjects(projects);
        } else {
          toast.error("Failed to load active projects");
        }
      } catch {
        toast.error("Error loading active projects");
      } finally {
        setProjectsLoading(false);
      }
    };

    loadActiveProjects();
  }, [supabase]);

  const quickActions = [
    {
      title: "Browse Marketplace",
      description: "Find new business opportunities",
      icon: Building2,
      link: "/society/marketplace",
      color: "from-accent to-blue-600",
      badge: "New Projects",
    },
    {
      title: "Manage Portfolio",
      description: "Showcase your work and achievements",
      icon: Camera,
      link: "/society/portfolio",
      color: "from-blue-600 to-accent",
      badge: "Showcase Work",
    },
  ];

  if (!mounted) {
    return <div className="min-h-screen bg-white"></div>;
  }

  if (loading) {
    return (
      <main 
        className="min-h-screen bg-white dark:bg-[#15325a] transition-colors duration-200 ease-in-out font-outfit flex items-center justify-center"
        style={{
          transition: 'background-color 0.2s ease-in-out',
        }}
      >
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-accent/30 border-t-accent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#15325a] dark:text-white font-outfit">Loading Dashboard...</p>
        </div>
      </main>
    );
  }

  return (
    <>
      <main 
        className="min-h-screen bg-white dark:bg-[#15325a] transition-colors duration-200 ease-in-out font-outfit"
        style={{
          transition: 'background-color 0.2s ease-in-out',
        }}
      >
      {/* Header Section */}
      <div 
        className="transition-colors duration-200 ease-in-out text-white"
        style={{
          background: theme === "dark" 
            ? "linear-gradient(135deg, #1a4b6b 0%, #15325a 50%, #0d2847 100%)"
            : "linear-gradient(135deg, #1679A8 0%, #1A97BA 50%, #63C3DD 100%)"
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-6 lg:space-y-0">
            {/* Welcome Section */}
            <div className="space-y-4">
              <div className="inline-flex items-center space-x-2 bg-white/20 dark:bg-white/30 backdrop-blur-sm rounded-full px-3 py-2 sm:px-4 text-sm font-medium">
                <Users className="w-4 h-4" />
                <span>Society Dashboard</span>
              </div>
              <div>
                <h1 className="text-4xl lg:text-6xl font-bold text-white font-outfit">
                  Welcome back,
                  <span className="block text-white/90 mt-2">
                    {profile?.society_name || "Society"}
                  </span>
                </h1>
                <p className="text-lg sm:text-xl text-white/80 mt-4 max-w-2xl leading-relaxed">
                  Manage your collaborations, showcase your work, and grow your impact
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 relative z-10 pb-12 sm:pb-16">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-8">
          {quickActions.map((action, index) => {
            const IconComponent = action.icon;
            return (
              <Card
                key={index}
                className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-blue-600 dark:hover:border-blue-400 hover:shadow-xl rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 ease-in-out transform hover:-translate-y-1 shadow-lg"
                onClick={() => router.push(action.link)}
                role="button"
                tabIndex={0}
                aria-label={`${action.title}: ${action.description}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    router.push(action.link);
                  }
                }}
              >
                <CardContent className="p-6 sm:p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div className={`w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br ${action.color} rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg`}>
                      <IconComponent className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                    </div>
                    <Badge className="bg-accent/10 dark:bg-accent/20 text-accent rounded-xl">
                      {action.badge}
                    </Badge>
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-xl sm:text-2xl font-bold text-[#15325a] dark:text-white group-hover:text-blue-600 dark:group-hover:text-accent transition-colors duration-200 ease-in-out">
                      {action.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed transition-colors duration-200 ease-in-out">
                      {action.description}
                    </p>
                    <div className="flex items-center text-accent font-medium">
                      <span className="mr-2">Get Started</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200 ease-in-out" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Active Projects Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-[#15325a] dark:text-white font-outfit transition-colors duration-200">
              Active Projects
            </h2>
            <Button asChild variant="outline" className="border-accent text-accent hover:bg-accent hover:text-white focus:ring-2 focus:ring-accent focus:ring-offset-2">
              <Link href="/society/marketplace">
                Browse More Projects
              </Link>
            </Button>
          </div>

          {projectsLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-3 flex-1">
                        <Skeleton className="h-6 w-64 bg-gray-200 dark:bg-gray-700" />
                        <Skeleton className="h-4 w-48 bg-gray-200 dark:bg-gray-700" />
                        <Skeleton className="h-4 w-32 bg-gray-200 dark:bg-gray-700" />
                      </div>
                      <Skeleton className="h-10 w-32 bg-gray-200 dark:bg-gray-700" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : activeProjects.length > 0 ? (
            <div className="space-y-6">
              {activeProjects.map((project) => (
                <Card
                  key={project.id}
                  className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700/50 overflow-hidden relative"
                >
                  <CardContent className="p-8">
                    <div className="flex items-start justify-between">
                      <div className="space-y-4 flex-1">
                        <div className="min-w-0 flex-1">
                          <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white leading-tight">
                            {project.description.split('\n')[0] || 'Project Title'}
                          </h3>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-xl">
                              Active
                            </Badge>
                            <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                              {new Date(project.created_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                          <div className="flex items-center mt-3">
                            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/30 rounded-lg px-4 py-2">
                              <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-sm font-semibold text-green-700 dark:text-green-300">
                                  ₹{project.budget.toLocaleString('en-IN')}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-base line-clamp-3 transition-colors duration-300">
                          {project.description}
                        </p>

                        {project.services_offered && project.services_offered.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {project.services_offered.slice(0, 10).map((service, index) => (
                              <Badge
                                key={index}
                                variant="secondary"
                                className="text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700 px-3 py-1 rounded-full"
                              >
                                {service}
                              </Badge>
                            ))}
                            {project.services_offered.length > 10 && (
                              <Badge
                                variant="secondary"
                                className="text-xs font-medium bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600 px-3 py-1 rounded-full"
                              >
                                +{project.services_offered.length - 10} more
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col space-y-6 mt-6">
                      {/* Enhanced Metadata Section */}
                      <div className="bg-gray-50/50 dark:bg-gray-700/20 rounded-2xl p-6 border border-gray-100 dark:border-gray-600/30">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-green-500 flex items-center justify-center shadow-sm">
                              <Users className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <p className="text-2xl font-bold text-gray-900 dark:text-white">{project.proposal_count || 0}</p>
                              <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Proposals</p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-purple-500 flex items-center justify-center shadow-sm">
                              <FileText className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <p className="text-2xl font-bold text-gray-900 dark:text-white">{project.services_offered?.length || 0}</p>
                              <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Services</p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center shadow-sm">
                              <Calendar className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-900 dark:text-white">
                                {new Date(project.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Created</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="flex gap-3">
                        <Button 
                          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 flex-1 h-12 rounded-xl font-semibold group/btn"
                          onClick={() => router.push(`/society/project/${project.id}`)}
                        >
                          <Eye className="w-5 h-5 mr-2 group-hover/btn:scale-110 transition-transform" />
                          Manage Project
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-dashed border-blue-200 dark:border-blue-700 shadow-lg">
              <CardContent className="p-8 text-center">
                <div 
                  className="w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-6 transition-colors duration-200"
                  style={{
                    background: theme === "dark" 
                      ? "linear-gradient(135deg, #1a4b6b 0%, #15325a 50%, #0d2847 100%)"
                      : "linear-gradient(135deg, #1679A8 0%, #1A97BA 50%, #63C3DD 100%)"
                  }}
                >
                  <Building2 className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white font-outfit mb-2">
                  No Active Projects
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  You don&apos;t have any active projects yet. Browse the marketplace to find exciting opportunities and start collaborating with businesses.
                </p>
                <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                  <Link href="/society/marketplace">
                    Explore Marketplace
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </main>

    {/* Chat Integration */}
    <ChatWidget
      currentUserId={currentUserId}
      currentUserType={currentUserType}
      isOpen={isChatOpen}
      onClose={() => setIsChatOpen(false)}
      onUnreadCountChange={(updater) => setUnreadCount(updater)}
    />

    <FloatingChatButton
      onClick={() => {
        setIsChatOpen(!isChatOpen);
        if (!isChatOpen) {
          setUnreadCount(0); // Reset unread count when opening chat
        }
      }}
      isOpen={isChatOpen}
      unreadCount={unreadCount}
    />
    </>
  );
}
