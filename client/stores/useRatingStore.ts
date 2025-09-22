// stores/useRatingStore.ts
import { create } from 'zustand';
import { ProjectRating, CreateRatingData } from '@/types/project-tracking';

interface RatingState {
  ratings: ProjectRating[];
  submitting: boolean;
  error: string | null;

  // Actions
  setRatings: (ratings: ProjectRating[]) => void;
  addRating: (rating: ProjectRating) => void;
  setSubmitting: (submitting: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  ratings: [],
  submitting: false,
  error: null,
};

export const useRatingStore = create<RatingState>((set) => ({
  ...initialState,

  setRatings: (ratings) => set({ ratings }),

  addRating: (rating) =>
    set((state) => ({
      ratings: [...state.ratings, rating],
    })),

  setSubmitting: (submitting) => set({ submitting }),

  setError: (error) => set({ error }),

  reset: () => set(initialState),
}));
