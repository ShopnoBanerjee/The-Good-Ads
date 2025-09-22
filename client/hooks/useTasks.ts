// hooks/useTasks.ts
import { getSupabaseClient } from '@/lib/supabaseClient';
import { UpdateTaskData } from '@/types/project-tracking';
import { useProjectStore } from '@/stores/useProjectStore';
import { useNotificationStore } from '@/stores/useNotificationStore';

export const useTasks = () => {
  const supabase = getSupabaseClient();
  const { milestones, updateTask, updateMilestone, setLoading, setError } = useProjectStore();
  const { addNotification } = useNotificationStore();

  const updateTaskCompletion = async (taskId: string, milestoneId: string, isCompleted: boolean) => {
    setLoading(true);
    try {
      // Get the current session from Supabase
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session) {
        throw new Error('No authentication session found');
      }

      const token = sessionData.session.access_token;

      const response = await fetch(`/api/tasks/${taskId}/toggle`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update task');
      }

      const updatedTask = await response.json();

      updateTask(milestoneId, taskId, {
        is_completed: updatedTask.is_completed,
        completed_at: updatedTask.completed_at,
      });

      // Check if all tasks in the milestone are now completed
      const milestone = milestones.find(m => m.id === milestoneId);
      if (milestone) {
        const allTasksCompleted = milestone.tasks.every(task => task.is_completed);
        if (allTasksCompleted && milestone.status !== 'awaiting_confirmation' && milestone.status !== 'completed') {
          updateMilestone(milestoneId, { status: 'awaiting_confirmation' });
          addNotification({
            type: 'info',
            message: 'All tasks completed! Milestone is now awaiting business confirmation.',
          });
        }
      }

      addNotification({
        type: 'success',
        message: `Task ${isCompleted ? 'completed' : 'marked incomplete'}`,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update task';
      setError(message);
      addNotification({
        type: 'error',
        message,
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    updateTaskCompletion,
  };
};
