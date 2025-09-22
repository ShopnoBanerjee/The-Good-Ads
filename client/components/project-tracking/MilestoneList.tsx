// components/project-tracking/MilestoneList.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight, CheckCircle, Clock, AlertCircle, Calendar } from 'lucide-react';
import { MilestoneWithTasks } from '@/types/project-tracking';
import { useMilestones } from '@/hooks/useMilestones';
import { useProjectStore } from '@/stores/useProjectStore';

interface MilestoneListProps {
  projectId: string;
}

export default function MilestoneList({ projectId }: MilestoneListProps) {
  const { milestones, confirmMilestone } = useMilestones(projectId);
  const { loading } = useProjectStore();
  const [expandedMilestones, setExpandedMilestones] = useState<Set<string>>(new Set());

  const toggleMilestone = (milestoneId: string) => {
    const newExpanded = new Set(expandedMilestones);
    if (newExpanded.has(milestoneId)) {
      newExpanded.delete(milestoneId);
    } else {
      newExpanded.add(milestoneId);
    }
    setExpandedMilestones(newExpanded);
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'awaiting_confirmation':
        return <Clock className="w-4 h-4" />;
      case 'in_progress':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const calculateProgress = (tasks: any[]) => {
    if (!tasks || tasks.length === 0) return 0;
    const completedTasks = tasks.filter(task => task.is_completed).length;
    return Math.round((completedTasks / tasks.length) * 100);
  };

  if (loading && milestones.length === 0) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            </CardHeader>
            <CardContent>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (milestones.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <div className="text-gray-500 dark:text-gray-400">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No milestones yet</p>
            <p className="text-sm">Create your first milestone to get started</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {milestones.map((milestone) => {
        const progress = calculateProgress(milestone.tasks);
        const isExpanded = expandedMilestones.has(milestone.id);

        return (
          <Card key={milestone.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 animate-in fade-in-0 slide-in-from-bottom-4">
            <CardHeader
              className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              onClick={() => toggleMilestone(milestone.id)}
              role="button"
              tabIndex={0}
              aria-expanded={isExpanded}
              aria-controls={`milestone-content-${milestone.id}`}
              aria-label={`Toggle details for milestone: ${milestone.title}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  toggleMilestone(milestone.id);
                }
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-500" />
                  )}
                  <div>
                    <CardTitle id={`milestone-title-${milestone.id}`} className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {milestone.title}
                    </CardTitle>
                    {milestone.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {milestone.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={`${getStatusColor(milestone.status)} flex items-center gap-1`}>
                    {getStatusIcon(milestone.status)}
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
            </CardHeader>

            {isExpanded && (
              <CardContent id={`milestone-content-${milestone.id}`} className="pt-0" role="region" aria-labelledby={`milestone-title-${milestone.id}`}>
                <div className="space-y-4">
                  <div role="region" aria-labelledby={`progress-label-${milestone.id}`}>
                    <div className="flex justify-between items-center mb-2">
                      <span id={`progress-label-${milestone.id}`} className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Progress
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400" aria-live="polite">
                        {progress}% ({milestone.tasks.filter(t => t.is_completed).length}/{milestone.tasks.length} tasks)
                      </span>
                    </div>
                    <div
                      className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2"
                      role="progressbar"
                      aria-valuenow={progress}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-labelledby={`progress-label-${milestone.id}`}
                    >
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">Tasks</h4>
                    <ul role="list" aria-label={`Tasks for milestone: ${milestone.title}`}>
                      {milestone.tasks.map((task) => (
                        <li
                          key={task.id}
                          className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                          aria-label={`Task: ${task.description}, ${task.is_completed ? 'completed' : 'not completed'}`}
                        >
                          <CheckCircle
                            className={`w-5 h-5 ${task.is_completed ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}
                            aria-hidden="true"
                          />
                          <span
                            className={`flex-1 text-sm ${task.is_completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-gray-100'}`}
                          >
                            {task.description}
                          </span>
                          {task.completed_at && (
                            <time className="text-xs text-gray-500" dateTime={task.completed_at}>
                              {new Date(task.completed_at).toLocaleDateString()}
                            </time>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {milestone.status === 'awaiting_confirmation' && (
                    <div className="pt-4 border-t">
                      <Button
                        onClick={() => confirmMilestone(milestone.id)}
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                        aria-label={`Confirm completion of milestone: ${milestone.title}`}
                      >
                        Confirm Milestone Completion
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}
