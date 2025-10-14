// hooks/useRatings.ts
import { useEffect } from 'react';
import { getSupabaseClient } from '@/lib/supabaseClient';
import { API_URL } from '@/lib/constants';
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
        .from('ratings')
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
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const token = session.access_token;

      const res = await fetch(`${API_URL}/api/submit-rating`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Failed to submit rating');
      }

      const newRating = await res.json();

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
          table: 'ratings',
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
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
