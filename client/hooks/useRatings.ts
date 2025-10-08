// hooks/useRatings.ts
import { useEffect } from 'react';
import { getSupabaseClient } from '@/lib/supabaseClient';
import { ProjectRating, CreateRatingData } from '@/types/project-tracking';
import { useRatingStore } from '@/stores/useRatingStore';
import { useNotificationStore } from '@/stores/useNotificationStore';

export const useRatings = (projectId: string) => {
  const supabase = getSupabaseClient();
  const { ratings, setRatings, addRating, setSubmitting, setError } = useRatingStore();
  const { addNotification } = useNotificationStore();

  const fetchRatings = async () => {
    if (!projectId) return;

    try {
      const { data, error } = await supabase
        .from('project_ratings')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setRatings(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch ratings');
    }
  };

  const submitRating = async (data: CreateRatingData) => {
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Validate that the user is involved in this project
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('business_id, society_id, status')
        .eq('id', data.project_id)
        .single();

      if (projectError) throw new Error('Project not found');
      if (project.business_id !== user.id && project.society_id !== user.id) {
        throw new Error('You are not authorized to rate this project');
      }
      if (project.status !== 'completed') {
        throw new Error('You can only rate completed projects');
      }

      // Check if user has already rated this project
      const { data: existingRating } = await supabase
        .from('project_ratings')
        .select('id')
        .eq('project_id', data.project_id)
        .eq('rater_id', user.id)
        .single();

      if (existingRating) {
        throw new Error('You have already rated this project');
      }

      const ratingData = {
        project_id: data.project_id,
        rater_id: user.id,
        ratee_id: data.ratee_id,
        rating: data.rating,
        review: data.review,
      };

      const { data: newRating, error } = await supabase
        .from('project_ratings')
        .insert(ratingData)
        .select()
        .single();

      if (error) throw error;

      addRating(newRating);
      addNotification({
        type: 'success',
        message: 'Rating submitted successfully',
      });

      return newRating;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to submit rating';
      setError(message);
      addNotification({
        type: 'error',
        message,
      });
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetchRatings();
  }, [projectId]);

  // Real-time subscriptions for ratings
  useEffect(() => {
    if (!projectId) return;

    const ratingSubscription = supabase
      .channel(`ratings-${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'project_ratings',
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          console.log('Rating change:', payload);
          fetchRatings(); // Refetch ratings when any change occurs
        }
      )
      .subscribe();

    return () => {
      ratingSubscription.unsubscribe();
    };
  }, [projectId]);

  return {
    ratings,
    submitRating,
  };
};
