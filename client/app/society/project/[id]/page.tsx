// app/society/project/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSupabaseClient } from '@/lib/supabaseClient';
import { API_URL } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Building2, Calendar, Star } from 'lucide-react';
import { toast } from 'sonner';
import TaskTracker from '@/components/project-tracking/TaskTracker';
import RatingModal from '@/components/project-tracking/RatingModal';
import { useMilestones } from '@/hooks/useMilestones';
import { useRatings } from '@/hooks/useRatings';
import { useProjectStore } from '@/stores/useProjectStore';

interface Project {
  id: string;
  compliant_name: string;
  compliant_description: string;
  status: string;
  created_at: string;
  business_id: string;
}

export default function SocietyProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [businessName, setBusinessName] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const { milestones } = useMilestones(projectId);
  const { ratings } = useRatings(projectId);
  const { setCurrentProject } = useProjectStore();

  useEffect(() => {
    const fetchProject = async () => {
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push('/auth');
        return;
      }

      const token = session.access_token;

      try {
        // For society, we need to get projects they're assigned to
        // This might need a new API endpoint, for now let's assume we can get it
        // You might need to adjust this based on your API
        const res = await fetch(`${API_URL}/api/society-projects`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          throw new Error('Failed to fetch projects');
        }

        const projects: Project[] = await res.json();
        const currentProject = projects.find(p => p.id === projectId);

        if (!currentProject) {
          toast.error('Project not found');
          router.push('/society');
          return;
        }

        setProject(currentProject);
        setCurrentProject(currentProject);

        // Fetch business name
        const { data: business } = await supabase
          .from('profiles')
          .select('company_name')
          .eq('id', currentProject.business_id)
          .single();

        if (business) {
          setBusinessName(business.company_name || 'Business Partner');
        }
      } catch {
        toast.error('Failed to load project');
        router.push('/society');
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link href="/society">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {project.compliant_name}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {project.compliant_description}
              </p>

              <div className="flex items-center gap-4">
                <Badge className={getStatusColor(project.status)}>
                  {project.status}
                </Badge>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Building2 className="w-4 h-4" />
                  Client: {businessName}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Calendar className="w-4 h-4" />
                  Started: {new Date(project.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>

            {project.status === 'completed' && businessName && (
              <RatingModal
                projectId={projectId}
                rateeId={project.business_id}
                rateeName={businessName}
                trigger={
                  <Button className="bg-yellow-600 hover:bg-yellow-700 text-white">
                    <Star className="w-4 h-4 mr-2" />
                    Rate Business
                  </Button>
                }
              />
            )}
          </div>
        </div>

        {/* Content */}
        <Tabs defaultValue="tasks" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="tasks">Tasks & Progress</TabsTrigger>
            <TabsTrigger value="ratings">Ratings & Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="tasks" className="space-y-6">
            <TaskTracker milestones={milestones} />
          </TabsContent>

          <TabsContent value="ratings" className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Collaboration Ratings
            </h2>

            {ratings.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <div className="text-gray-500 dark:text-gray-400">
                    <Star className="w-12 h-12 mx-auto mb-4 opacity-50" />
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
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-5 h-5 ${
                                i < rating.rating
                                  ? 'text-yellow-400 fill-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                          <span className="font-medium ml-2">{rating.rating}/5</span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(rating.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {rating.review && (
                        <p className="text-gray-700 dark:text-gray-300">{rating.review}</p>
                      )}
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
