// stores/useProjectStore.ts
import { create } from 'zustand';
import { Milestone, Task, ProjectWithTracking, MilestoneWithTasks } from '@/types/project-tracking';

interface ProjectState {
  projects: ProjectWithTracking[];
  currentProject: ProjectWithTracking | null;
  milestones: MilestoneWithTasks[];
  loading: boolean;
  error: string | null;

  // Actions
  setProjects: (projects: ProjectWithTracking[]) => void;
  setCurrentProject: (project: ProjectWithTracking | null) => void;
  setMilestones: (milestones: MilestoneWithTasks[]) => void;
  addMilestone: (milestone: MilestoneWithTasks) => void;
  updateMilestone: (id: string, updates: Partial<Milestone>) => void;
  updateTask: (milestoneId: string, taskId: string, updates: Partial<Task>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  projects: [],
  currentProject: null,
  milestones: [],
  loading: false,
  error: null,
};

export const useProjectStore = create<ProjectState>((set, get) => ({
  ...initialState,

  setProjects: (projects) => set({ projects }),

  setCurrentProject: (project) => set({ currentProject: project }),

  setMilestones: (milestones) => set({ milestones }),

  addMilestone: (milestone) =>
    set((state) => ({
      milestones: [...state.milestones, milestone],
    })),

  updateMilestone: (id, updates) =>
    set((state) => ({
      milestones: state.milestones.map((m) =>
        m.id === id ? { ...m, ...updates } : m
      ),
    })),

  updateTask: (milestoneId, taskId, updates) =>
    set((state) => ({
      milestones: state.milestones.map((m) =>
        m.id === milestoneId
          ? {
              ...m,
              tasks: m.tasks.map((t) =>
                t.id === taskId ? { ...t, ...updates } : t
              ),
            }
          : m
      ),
    })),

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error }),

  reset: () => set(initialState),
}));
