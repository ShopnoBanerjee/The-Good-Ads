// types/project-tracking.ts

export interface Milestone {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  due_date?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'awaiting_confirmation';
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  milestone_id: string;
  description: string;
  is_completed: boolean;
  completed_at?: string;
  created_at: string;
}

export interface ProjectRating {
  id: string;
  project_id: string;
  rater_id: string;
  ratee_id: string;
  rating: number;
  review?: string;
  created_at: string;
}

export interface ProjectWithTracking extends Project {
  milestones?: Milestone[];
  ratings?: ProjectRating[];
  society_id?: string;
}

export interface MilestoneWithTasks extends Milestone {
  tasks: Task[];
}

export interface CreateMilestoneData {
  project_id: string;
  title: string;
  description?: string;
  due_date?: string;
  tasks: string[]; // array of task descriptions
}

export interface UpdateTaskData {
  id: string;
  is_completed: boolean;
  completed_at?: string;
}

export interface CreateRatingData {
  project_id: string;
  ratee_id: string;
  rating: number;
  review?: string;
}

// Existing Project interface (from business page)
export interface Project {
  id: string;
  compliant_name: string;
  compliant_description: string;
  status: "active" | "completed" | "paused" | "cancelled" | "draft" | string;
  proposal_count?: number;
  services_required?: string;
  created_at: string;
}
