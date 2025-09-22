// components/project-tracking/MilestoneTimeline.tsx
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, AlertCircle, Calendar } from 'lucide-react';
import { MilestoneWithTasks } from '@/types/project-tracking';

interface MilestoneTimelineProps {
  milestones: MilestoneWithTasks[];
}

export default function MilestoneTimeline({ milestones }: MilestoneTimelineProps) {
  if (milestones.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <div className="text-gray-500 dark:text-gray-400">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No milestones yet</p>
            <p className="text-sm">Milestones will appear here as they are created</p>
          </div>
        </CardContent>
      </Card>
    );
  }

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
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'awaiting_confirmation':
        return <Clock className="w-5 h-5 text-amber-600" />;
      case 'in_progress':
        return <AlertCircle className="w-5 h-5 text-blue-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-4">
      <h3 id="timeline-heading" className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Milestone Timeline
      </h3>

      <div className="relative" role="list" aria-labelledby="timeline-heading">
        {/* Timeline line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>

        <div className="space-y-6">
          {milestones.map((milestone, index) => {
            const completedTasks = milestone.tasks.filter(t => t.is_completed).length;
            const totalTasks = milestone.tasks.length;
            const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

            return (
              <div key={milestone.id} className="relative flex items-start gap-4" role="listitem">
                {/* Timeline dot */}
                <div className="relative z-10 flex-shrink-0">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 ${
                    milestone.status === 'completed'
                      ? 'bg-green-100 border-green-300 dark:bg-green-900/30 dark:border-green-700'
                      : milestone.status === 'awaiting_confirmation'
                      ? 'bg-amber-100 border-amber-300 dark:bg-amber-900/30 dark:border-amber-700'
                      : 'bg-blue-100 border-blue-300 dark:bg-blue-900/30 dark:border-blue-700'
                  }`}>
                    {getStatusIcon(milestone.status)}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pb-8">
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                            {milestone.title}
                          </h4>
                          {milestone.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              {milestone.description}
                            </p>
                          )}
                        </div>
                        <Badge className={`${getStatusColor(milestone.status)} ml-4`}>
                          {milestone.status.replace('_', ' ')}
                        </Badge>
                      </div>

                      {/* Progress */}
                      <div className="mb-3" role="region" aria-labelledby={`progress-label-${milestone.id}`}>
                        <div className="flex justify-between items-center mb-1">
                          <span id={`progress-label-${milestone.id}`} className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Progress
                          </span>
                          <span className="text-sm text-gray-600 dark:text-gray-400" aria-live="polite">
                            {progress}% ({completedTasks}/{totalTasks} tasks)
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
                            className={`h-2 rounded-full transition-all duration-500 ${
                              milestone.status === 'completed'
                                ? 'bg-green-600'
                                : milestone.status === 'awaiting_confirmation'
                                ? 'bg-amber-600'
                                : 'bg-blue-600'
                            }`}
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Due date */}
                      {milestone.due_date && (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar className="w-4 h-4" aria-hidden="true" />
                          <time dateTime={milestone.due_date}>
                            Due: {new Date(milestone.due_date).toLocaleDateString()}
                          </time>
                        </div>
                      )}

                      {/* Tasks summary */}
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {completedTasks} of {totalTasks} tasks completed
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
