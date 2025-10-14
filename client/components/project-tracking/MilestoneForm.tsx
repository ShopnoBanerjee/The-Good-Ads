// components/project-tracking/MilestoneForm.tsx
'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, X } from 'lucide-react';
import { useMilestones } from '@/hooks/useMilestones';

const milestoneSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  due_date: z.string().optional().refine((date) => {
    if (!date) return true; // Optional field
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day
    return selectedDate >= today;
  }, {
    message: 'Due date must be today or later'
  }),
  tasks: z.array(z.object({ value: z.string().min(1, 'Task description is required') })).min(1, 'At least one task is required'),
});

type MilestoneFormData = z.infer<typeof milestoneSchema>;

interface MilestoneFormProps {
  projectId: string;
  onSuccess?: () => void;
}

export default function MilestoneForm({ projectId, onSuccess }: MilestoneFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createMilestone } = useMilestones(projectId);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<MilestoneFormData>({
    resolver: zodResolver(milestoneSchema),
    defaultValues: {
      title: '',
      description: '',
      due_date: '',
      tasks: [{ value: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'tasks' as const,
  });

  const onSubmit = async (data: MilestoneFormData) => {
    setIsSubmitting(true);
    try {
      await createMilestone({
        project_id: projectId,
        title: data.title,
        description: data.description,
        due_date: data.due_date,
        tasks: data.tasks.map(task => task.value),
      });

      reset();
      onSuccess?.();
    } catch {
      // Error is handled in the hook
    } finally {
      setIsSubmitting(false);
    }
  };

  const addTask = () => {
    append({ value: '' });
  };

  const removeTask = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-200">
          Create New Milestone
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Milestone Title *
            </Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="Enter milestone title"
              className="w-full"
              aria-describedby={errors.title ? "title-error" : undefined}
            />
            {errors.title && (
              <p id="title-error" className="text-sm text-red-600 dark:text-red-400" role="alert">
                {errors.title.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description
            </Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Describe what this milestone entails"
              className="w-full min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="due_date" className="text-sm font-medium">
              Due Date
            </Label>
            <Input
              id="due_date"
              type="date"
              {...register('due_date')}
              min={new Date().toISOString().split('T')[0]}
              className="w-full"
              aria-describedby={errors.due_date ? "due-date-error" : "due-date-help"}
            />
            {errors.due_date ? (
              <p id="due-date-error" className="text-sm text-red-600 dark:text-red-400" role="alert">
                {errors.due_date.message}
              </p>
            ) : (
              <p id="due-date-help" className="text-xs text-gray-500 dark:text-gray-400">
                Optional: Set a target completion date for this milestone
              </p>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Tasks *</Label>
              <Button
                type="button"
                onClick={addTask}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Task
              </Button>
            </div>

            {fields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-2">
                <Input
                  {...register(`tasks.${index}.value`)}
                  placeholder={`Task ${index + 1} description`}
                  className="flex-1"
                  id={`task-${index}`}
                  aria-label={`Task ${index + 1} description`}
                  aria-describedby={errors.tasks ? `tasks-error` : undefined}
                />
                {fields.length > 1 && (
                  <Button
                    type="button"
                    onClick={() => removeTask(index)}
                    variant="outline"
                    size="sm"
                    className="flex-shrink-0"
                    aria-label={`Remove task ${index + 1}`}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}

            {errors.tasks && (
              <p id="tasks-error" className="text-sm text-red-600 dark:text-red-400" role="alert">
                {errors.tasks.message}
              </p>
            )}
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              aria-describedby={isSubmitting ? "submit-status" : undefined}
            >
              {isSubmitting ? 'Creating...' : 'Create Milestone'}
            </Button>
            {isSubmitting && (
              <span id="submit-status" className="sr-only">
                Creating milestone, please wait
              </span>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
