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

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [completingProject, setCompletingProject] = useState(false);

  const { setCurrentProject } = useProjectStore();
  const { ratings } = useRatings(projectId);
  const { milestones } = useMilestones(projectId);

  const supabase = getSupabaseClient();

  useEffect(() => {
    const fetchProject = async () => {
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push('/auth');
        return;
      }

      setCurrentUserId(session.user.id);
      const token = session.access_token;

      try {
        // Fetch the specific project for the business
        const res = await fetch(`${API_URL}/api/business-projects/${projectId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          if (res.status === 403) {
            toast.error('You don\'t have access to this project');
            router.push('/business');
            return;
          }
          throw new Error('Failed to fetch project');
        }

        const project: Project = await res.json();

        // Transform for compatibility with ProjectWithTracking
        const transformedProject = {
          ...project,
          compliant_name: project.description.split('\n')[0] || 'Project Title',
          compliant_description: project.description,
        };

        setProject(transformedProject);
        setCurrentProject(transformedProject);
        console.log('Fetched id:', project.society_id);
      } catch {
        toast.error('Failed to load project');
        router.push('/business');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId, router, setCurrentProject]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return null;
  }

  const hasUserRated = ratings.some(rating => rating.rater_id === currentUserId);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  // Check if all milestones are completed
  const allMilestonesCompleted = milestones.length > 0 && milestones.every(milestone => milestone.status === 'completed');

  const handleCompleteProject = async () => {
    if (!project || completingProject) return;

    setCompletingProject(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/business">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Projects
            </Button>
          </Link>

          {/* Project Title and Description */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">
              {project.description.split('\n')[0] || 'Project Title'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg">
              {project.description}
            </p>
          </div>

          {/* Project Status and Metadata Row */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div className="flex flex-wrap items-center gap-4">
              <Badge className={getStatusColor(project.status)}>
                {project.status}
              </Badge>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Calendar className="w-4 h-4" />
                Started: {new Date(project.created_at).toLocaleDateString()}
              </div>
              {project.budget && (
                <div className="inline-flex items-center px-4 py-2 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200/50 dark:border-green-800/30">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-sm font-semibold text-green-700 dark:text-green-300">
                      ₹{project.budget.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              {project.status !== 'completed' && allMilestonesCompleted && (
                <Button
                  onClick={handleCompleteProject}
                  disabled={completingProject}
                  className="bg-green-600 hover:bg-green-700 text-white"
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
                    <Button className="bg-yellow-600 hover:bg-yellow-700 text-white">
                      <Star className="w-4 h-4 mr-2" />
                      Rate Society
                    </Button>
                  }
                />
              )}
              {project.status === 'completed' && project.society_id && hasUserRated && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                  <div className="flex items-center space-x-2 text-green-800 dark:text-green-300">
                    <Star className="w-4 h-4" />
                    <span className="text-sm font-medium">Rating Submitted</span>
                  </div>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    You have already rated this collaboration
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Additional metadata */}
          <div className="bg-white/50 dark:bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left side - Domains and Services */}
              <div className="space-y-4">
                {project.domains && project.domains.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      Domains
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {project.domains.map((domain, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-700"
                        >
                          {domain}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {project.services_offered && project.services_offered.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      Technologies & Services
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {project.services_offered.map((service, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700"
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
                        <div className="text-xs text-blue-700 dark:text-blue-300">
                          {milestones.reduce((sum, m) => sum + m.tasks.filter(t => t.is_completed).length, 0)} of{' '}
                          {milestones.reduce((sum, m) => sum + m.tasks.length, 0)} tasks
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
        <Tabs defaultValue="milestones" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="milestones">Milestones & Tasks</TabsTrigger>
            <TabsTrigger value="ratings">Ratings & Reviews</TabsTrigger>
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
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Collaboration Ratings
            </h2>

            {ratings.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <div className="text-gray-500 dark:text-gray-400">
                    <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">No ratings yet</p>
                    <p className="text-sm">Ratings will appear here after project completion</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {ratings.map((rating) => (
                  <Card key={rating.id}>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Communication</p>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < rating.communication_rating
                                      ? 'text-yellow-400 fill-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                              <span className="text-sm ml-1">{rating.communication_rating}/5</span>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Quality</p>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < rating.quality_rating
                                      ? 'text-yellow-400 fill-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                              <span className="text-sm ml-1">{rating.quality_rating}/5</span>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Timeliness</p>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < rating.timeliness_rating
                                      ? 'text-yellow-400 fill-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                              <span className="text-sm ml-1">{rating.timeliness_rating}/5</span>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Overall</p>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < rating.overall_rating
                                      ? 'text-yellow-400 fill-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                              <span className="text-sm ml-1">{rating.overall_rating}/5</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">
                            {new Date(rating.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        {rating.review_text && (
                          <p className="text-gray-700 dark:text-gray-300">{rating.review_text}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
