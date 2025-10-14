// app/business/project/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSupabaseClient } from '@/lib/supabaseClient';
import { API_URL } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Plus, Calendar, CheckCircle, Star, TrendingUp } from 'lucide-react';
import { CircularProgress } from '@/components/ui/circular-progress';
import { toast } from 'sonner';
import MilestoneForm from '@/components/project-tracking/MilestoneForm';
import MilestoneList from '@/components/project-tracking/MilestoneList';
import RatingModal from '@/components/project-tracking/RatingModal';
import MilestoneTimeline from '@/components/project-tracking/MilestoneTimeline';
import { useProjectStore } from '@/stores/useProjectStore';
import { useRatings } from '@/hooks/useRatings';
import { useMilestones } from '@/hooks/useMilestones';

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
  has_accepted_proposal: boolean;
}

export default function Page() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);
  const [completingProject, setCompletingProject] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>('');

  const { milestones } = useMilestones(projectId);
  const { ratings } = useRatings(projectId);
  const { setCurrentProject } = useProjectStore();

  const allMilestonesCompleted = milestones.length > 0 && milestones.every(milestone =>
    milestone.tasks.length > 0 && milestone.tasks.every(task => task.is_completed)
  );

  const hasUserRated = ratings.some(rating => rating.rater_id === currentUserId);

  useEffect(() => {
    const fetchProject = async () => {
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push('/auth');
        return;
      }

      setCurrentUserId(session.user.id);

      try {
        const response = await fetch(`${API_URL}/api/business-projects/${projectId}`, {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch project');
        }

        const projectData = await response.json();
        setProject(projectData);
        setCurrentProject(projectData);
      } catch (error) {
        console.error('Error fetching project:', error);
        toast('Error', {
          description: 'Failed to load project details',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId, router, setCurrentProject]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'completed':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const handleCompleteProject = async () => {
    const supabase = getSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      toast('Error', {
        description: 'You must be logged in to complete a project',
      });
      return;
    }

    setCompletingProject(true);

    try {
      const token = session.access_token;
      const res = await fetch(`${API_URL}/api/complete-project`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ project_id: projectId }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Failed to complete project');
      }

      toast('Success', {
        description: 'Project completed successfully!',
      });

      // Update the project status locally
      setProject(prev => prev ? { ...prev, status: 'completed' } : null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      toast('Error', {
        description: errorMessage,
      });
    } finally {
      setCompletingProject(false);
    }
  };

  if (loading || !project) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading project details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="space-y-6">
          {/* Navigation and Title Section */}
          <div className="flex flex-col space-y-4">
            <Link href="/business">
              <Button variant="ghost" className="w-fit">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Projects
              </Button>
            </Link>

            <div className="space-y-3">
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
                {project.description.split('\n')[0] || 'Project Title'}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed max-w-4xl">
                {project.description}
              </p>
            </div>
          </div>

          {/* Status and Quick Info Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-white/60 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50">
            <div className="flex flex-wrap items-center gap-3">
              <Badge className={`${getStatusColor(project.status)} text-xs font-medium px-3 py-1`}>
                {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
              </Badge>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Calendar className="w-4 h-4" />
                Started {new Date(project.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </div>
              {project.budget && (
                <div className="inline-flex items-center px-3 py-1.5 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200/50 dark:border-green-800/30">
                  <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                  <span className="text-sm font-semibold text-green-700 dark:text-green-300">
                    ₹{project.budget.toLocaleString('en-IN')}
                  </span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              {project.status !== 'completed' && allMilestonesCompleted && (
                <Button
                  onClick={handleCompleteProject}
                  disabled={completingProject}
                  className="bg-green-600 hover:bg-green-700 text-white shadow-sm"
                >
                  {completingProject ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Completing...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4" />
                      <span>Complete Project</span>
                    </div>
                  )}
                </Button>
              )}

              {project.status === 'completed' && project.society_id && !hasUserRated && (
                <RatingModal
                  projectId={projectId}
                  rateeId={project.society_id}
                  rateeName="Society"
                  trigger={
                    <Button className="bg-yellow-600 hover:bg-yellow-700 text-white shadow-sm">
                      <Star className="w-4 h-4 mr-2" />
                      Rate Society
                    </Button>
                  }
                />
              )}
              {project.status === 'completed' && project.society_id && hasUserRated && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg px-4 py-2">
                  <div className="flex items-center space-x-2 text-green-800 dark:text-green-300">
                    <Star className="w-4 h-4" />
                    <span className="text-sm font-medium">Rating Submitted</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Detailed Metadata Section */}
          <div className="bg-white/50 dark:bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left side - Domains and Services */}
              <div className="lg:col-span-2 space-y-6">
                {project.domains && project.domains.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Domains
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {project.domains.map((domain, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-700 transition-colors hover:bg-purple-200 dark:hover:bg-purple-900/50"
                        >
                          {domain}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {project.services_offered && project.services_offered.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Technologies & Services
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {project.services_offered.map((service, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700 transition-colors hover:bg-emerald-200 dark:hover:bg-emerald-900/50"
                        >
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right side - Project Progress */}
              <div className="flex items-center justify-center lg:justify-end">
                <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800 w-full max-w-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100 text-sm">
                      <TrendingUp className="w-4 h-4" />
                      Project Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center gap-4">
                      <CircularProgress
                        value={milestones.length > 0 ? Math.round(
                          (milestones.reduce((sum, m) => sum + m.tasks.filter(t => t.is_completed).length, 0) /
                           milestones.reduce((sum, m) => sum + m.tasks.length, 0)) * 100
                        ) : 0}
                        size={60}
                        color={
                          milestones.length > 0 && milestones.every(m => m.tasks.every(t => t.is_completed))
                            ? 'green'
                            : milestones.reduce((sum, m) => sum + m.tasks.filter(t => t.is_completed).length, 0) /
                              Math.max(milestones.reduce((sum, m) => sum + m.tasks.length, 0), 1) > 0.5
                            ? 'blue'
                            : 'amber'
                        }
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                          {milestones.length > 0 ? Math.round(
                            (milestones.reduce((sum, m) => sum + m.tasks.filter(t => t.is_completed).length, 0) /
                             Math.max(milestones.reduce((sum, m) => sum + m.tasks.length, 0), 1)) * 100
                          ) : 0}%
                        </div>
                        <div className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                          {milestones.reduce((sum, m) => sum + m.tasks.filter(t => t.is_completed).length, 0)} of{' '}
                          {milestones.reduce((sum, m) => sum + m.tasks.length, 0)} tasks completed
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <Tabs defaultValue="milestones" className="space-y-6 mt-4">
          <TabsList className="grid w-full grid-cols-2 bg-white/60 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-1">
            <TabsTrigger
              value="milestones"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm"
            >
              Milestones & Tasks
            </TabsTrigger>
            <TabsTrigger
              value="ratings"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm"
            >
              Ratings & Reviews
            </TabsTrigger>
          </TabsList>

          <TabsContent value="milestones" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Project Milestones
              </h2>
              {project.status === 'published' || project.status === 'active' ? (
                <Button
                  onClick={() => setShowMilestoneForm(!showMilestoneForm)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {showMilestoneForm ? 'Cancel' : 'Add Milestone'}
                </Button>
              ) : null}
            </div>

            {showMilestoneForm && (
              <MilestoneForm
                projectId={projectId}
                onSuccess={() => setShowMilestoneForm(false)}
              />
            )}

            <MilestoneList projectId={projectId} />
          </TabsContent>

          <TabsContent value="timeline" className="space-y-6">
            <MilestoneTimeline milestones={milestones} />
          </TabsContent>

          <TabsContent value="ratings" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Collaboration Ratings
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Feedback from societies who collaborated on this project
                </p>
              </div>
              {ratings.length > 0 && (
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {ratings.length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Total Rating{ratings.length !== 1 ? 's' : ''}
                  </div>
                </div>
              )}
            </div>

            {ratings.length === 0 ? (
              <Card className="text-center py-16">
                <CardContent>
                  <div className="text-gray-500 dark:text-gray-400">
                    <CheckCircle className="w-16 h-16 mx-auto mb-6 opacity-50" />
                    <p className="text-xl font-medium mb-2">No ratings yet</p>
                    <p className="text-sm max-w-md mx-auto">
                      Ratings will appear here after project completion. Societies who collaborated on this project can provide feedback on communication, quality, timeliness, and overall experience.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {ratings.map((rating) => {
                  // If the rater_id matches the current project's business_id, it's "Your Review" (from this business)
                  // Otherwise, it's a review from a society
                  const isBusinessReview = rating.rater_id === project.business_id;
                  return (
                    <Card key={rating.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
                      <CardHeader className={isBusinessReview
                        ? "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-b border-blue-100 dark:border-blue-800"
                        : "bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-b border-green-100 dark:border-green-800"
                      }>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className={isBusinessReview
                              ? "w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center"
                              : "w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center"
                            }>
                              <Star className={isBusinessReview ? "w-6 h-6 text-blue-600 dark:text-blue-400" : "w-6 h-6 text-green-600 dark:text-green-400"} />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                {isBusinessReview ? 'Your Review (Business)' : 'Society Review'}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {new Date(rating.created_at).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center space-x-1 mb-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-5 h-5 ${
                                    i < Math.floor(rating.overall_rating)
                                      ? 'text-yellow-400 fill-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {rating.overall_rating}/5 Overall
                            </div>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Communication
                              </span>
                              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                {rating.communication_rating}/5
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${(rating.communication_rating / 5) * 100}%` }}
                              ></div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Quality
                              </span>
                              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                {rating.quality_rating}/5
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${(rating.quality_rating / 5) * 100}%` }}
                              ></div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Timeliness
                              </span>
                              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                {rating.timeliness_rating}/5
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${(rating.timeliness_rating / 5) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>

                        {rating.review_text && (
                          <div className={isBusinessReview
                            ? "bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border-l-4 border-blue-500"
                            : "bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border-l-4 border-green-500"
                          }>
                            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                              Review Comments
                            </h4>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                              "{rating.review_text}"
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
