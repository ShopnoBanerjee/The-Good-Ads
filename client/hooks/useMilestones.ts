import { useEffect, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabaseClient';
import { MilestoneWithTasks, CreateMilestoneData } from '@/types/project-tracking';
import { useProjectStore } from '@/stores/useProjectStore';
import { useNotificationStore } from '@/stores/useNotificationStore';
import { API_URL } from '@/lib/constants';

export const useMilestones = (projectId: string) => {
  const supabase = getSupabaseClient();
  const { milestones, setMilestones, addMilestone, updateMilestone, updateTask, setLoading, setError } = useProjectStore();
  const { addNotification } = useNotificationStore();

  const fetchMilestones = async () => {
    if (!projectId) return;

    setLoading(true);
    try {
      // Get the current session from Supabase
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session) {
        throw new Error('No authentication session found');
      }

      const token = sessionData.session.access_token;

      // Fetch milestones through the API
      const response = await fetch(`/api/milestones?project_id=${projectId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch milestones');
      }

      const milestonesData = await response.json();

      const milestonesWithTasks: MilestoneWithTasks[] = milestonesData.map((milestone: any) => ({
        ...milestone,
        tasks: milestone.tasks || [],
      }));

      setMilestones(milestonesWithTasks);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch milestones');
      addNotification({
        type: 'error',
        message: 'Failed to load milestones',
      });
    } finally {
      setLoading(false);
    }
  };

  const createMilestone = async (data: CreateMilestoneData) => {
    setLoading(true);
    try {
      // Get the current session from Supabase
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session) {
        throw new Error('No authentication session found');
      }

      const token = sessionData.session.access_token;

      const response = await fetch('/api/milestones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create milestone');
      }

      const newMilestone = await response.json();

      addMilestone(newMilestone);
      addNotification({
        type: 'success',
        message: 'Milestone created successfully',
      });

      return newMilestone;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create milestone';
      setError(message);
      addNotification({
        type: 'error',
        message,
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const confirmMilestone = async (milestoneId: string) => {
    setLoading(true);
    try {
      // Get the current session from Supabase
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session) {
        throw new Error('No authentication session found');
      }

      const token = sessionData.session.access_token;

      const response = await fetch(`${API_URL}/api/milestones/${milestoneId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: 'completed' }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to confirm milestone');
      }

      const updatedMilestone = await response.json();

      updateMilestone(milestoneId, { status: 'completed' });
      addNotification({
        type: 'success',
        message: 'Milestone confirmed successfully',
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to confirm milestone';
      setError(message);
      addNotification({
        type: 'error',
        message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMilestones();
  }, [projectId]);

  // Real-time subscriptions
  useEffect(() => {
    if (!projectId) return;

    // Subscribe to milestone changes
    const milestoneSubscription = supabase
      .channel(`milestones-${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'milestones',
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          fetchMilestones(); // Refetch all milestones when any change occurs
        }
      )
      .subscribe();

    // Subscribe to task changes
    const taskSubscription = supabase
      .channel(`tasks-${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
        },
        (payload) => {
          // Check if this task belongs to our project
          if (payload.new && milestones.some(m => m.tasks.some(t => t.id === payload.new.id))) {
            fetchMilestones(); // Refetch milestones when tasks in our project change
          }
          if (payload.old && milestones.some(m => m.tasks.some(t => t.id === payload.old.id))) {
            fetchMilestones(); // Refetch milestones when tasks in our project change
          }
        }
      )
      .subscribe();

    return () => {
      milestoneSubscription.unsubscribe();
      taskSubscription.unsubscribe();
    };
  }, [projectId, milestones]);

  return {
    milestones,
    fetchMilestones,
    createMilestone,
    confirmMilestone,
  };
};
