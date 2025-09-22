// components/project-tracking/TaskTracker.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, AlertCircle, Calendar, TrendingUp } from 'lucide-react';
import { MilestoneWithTasks } from '@/types/project-tracking';
import { useTasks } from '@/hooks/useTasks';
import { useProjectStore } from '@/stores/useProjectStore';
import { CircularProgress } from '@/components/ui/circular-progress';

interface TaskTrackerProps {
  milestones: MilestoneWithTasks[];
}

export default function TaskTracker({ milestones }: TaskTrackerProps) {
  const { updateTaskCompletion } = useTasks();
  const { loading } = useProjectStore();
  const [updatingTasks, setUpdatingTasks] = useState<Set<string>>(new Set());

  const handleTaskToggle = async (taskId: string, milestoneId: string, currentStatus: boolean) => {
    setUpdatingTasks(prev => new Set(prev).add(taskId));
    try {
      await updateTaskCompletion(taskId, milestoneId, !currentStatus);
    } finally {
      setUpdatingTasks(prev => {
        const newSet = new Set(prev);
        newSet.delete(taskId);
        return newSet;
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'awaiting_confirmation':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const calculateOverallProgress = () => {
    if (milestones.length === 0) return 0;

    const totalTasks = milestones.reduce((sum, m) => sum + m.tasks.length, 0);
    const completedTasks = milestones.reduce((sum, m) =>
      sum + m.tasks.filter(t => t.is_completed).length, 0
    );

    return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  };

  const overallProgress = calculateOverallProgress();

  if (loading && milestones.length === 0) {
    return (
      <div className="space-y-6">
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          </CardHeader>
          <CardContent>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-4"></div>
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (milestones.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <div className="text-gray-500 dark:text-gray-400">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No milestones available</p>
            <p className="text-sm">The business team will create milestones for this project</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800" role="region" aria-labelledby="project-progress">
        <CardHeader>
          <CardTitle id="project-progress" className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
            <TrendingUp className="w-5 h-5" aria-hidden="true" />
            Project Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <CircularProgress
                value={overallProgress}
                size={100}
                color={overallProgress === 100 ? 'green' : overallProgress > 50 ? 'blue' : 'amber'}
              />
              <div>
                <div className="text-2xl font-bold text-blue-900 dark:text-blue-100 mb-1">
                  Project Progress
                </div>
                <div className="text-sm text-blue-700 dark:text-blue-300">
                  {milestones.reduce((sum, m) => sum + m.tasks.filter(t => t.is_completed).length, 0)} of{' '}
                  {milestones.reduce((sum, m) => sum + m.tasks.length, 0)} tasks completed
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Milestones */}
      <div className="space-y-4">
        {milestones.map((milestone) => {
          const completedTasks = milestone.tasks.filter(t => t.is_completed).length;
          const totalTasks = milestone.tasks.length;
          const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

          return (
            <Card key={milestone.id} className="overflow-hidden">
              <CardHeader className="bg-gray-50 dark:bg-gray-800/50">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {milestone.title}
                    </CardTitle>
                    {milestone.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {milestone.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={`${getStatusColor(milestone.status)} flex items-center gap-1`}>
                      {milestone.status === 'completed' && <CheckCircle className="w-3 h-3" />}
                      {milestone.status === 'awaiting_confirmation' && <Clock className="w-3 h-3" />}
                      {milestone.status === 'in_progress' && <AlertCircle className="w-3 h-3" />}
                      {milestone.status.replace('_', ' ')}
                    </Badge>
                    {milestone.due_date && (
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        {new Date(milestone.due_date).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Progress: {progress}%
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {completedTasks}/{totalTasks} tasks
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        progress === 100 ? 'bg-green-600' : 'bg-blue-600'
                      }`}
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-4">
                <div className="space-y-3">
                  {milestone.tasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 animate-in fade-in-0 slide-in-from-left-2"
                    >
                      <Checkbox
                        checked={task.is_completed}
                        onCheckedChange={() =>
                          handleTaskToggle(task.id, milestone.id, task.is_completed)
                        }
                        disabled={updatingTasks.has(task.id) || milestone.status === 'completed'}
                        className="mt-0.5"
                        aria-label={`Mark task "${task.description}" as ${task.is_completed ? 'incomplete' : 'complete'}`}
                      />
                      <div className="flex-1">
                        <p
                          className={`text-sm ${
                            task.is_completed
                              ? 'line-through text-gray-500 dark:text-gray-400'
                              : 'text-gray-900 dark:text-gray-100'
                          }`}
                        >
                          {task.description}
                        </p>
                        {task.completed_at && (
                          <p className="text-xs text-gray-500 mt-1">
                            Completed on {new Date(task.completed_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      {updatingTasks.has(task.id) && (
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      )}
                    </div>
                  ))}
                </div>

                {milestone.status === 'awaiting_confirmation' && (
                  <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                      <Clock className="w-4 h-4 inline mr-2" />
                      All tasks completed! Waiting for business confirmation.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
