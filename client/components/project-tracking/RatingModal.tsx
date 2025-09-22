// components/project-tracking/RatingModal.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star } from 'lucide-react';
import { useRatings } from '@/hooks/useRatings';
import { useRatingStore } from '@/stores/useRatingStore';

const ratingSchema = z.object({
  rating: z.number().min(1, 'Please select a rating').max(5),
  review: z.string().optional(),
});

type RatingFormData = z.infer<typeof ratingSchema>;

interface RatingModalProps {
  projectId: string;
  rateeId: string;
  rateeName: string;
  trigger: React.ReactNode;
}

export default function RatingModal({ projectId, rateeId, rateeName, trigger }: RatingModalProps) {
  const [open, setOpen] = useState(false);
  const [hoveredRating, setHoveredRating] = useState(0);
  const { submitRating } = useRatings(projectId);
  const { submitting } = useRatingStore();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<RatingFormData>({
    resolver: zodResolver(ratingSchema),
    defaultValues: {
      rating: 0,
      review: '',
    },
  });

  const rating = watch('rating');

  const onSubmit = async (data: RatingFormData) => {
    try {
      await submitRating({
        project_id: projectId,
        ratee_id: rateeId,
        rating: data.rating,
        review: data.review,
      });

      reset();
      setOpen(false);
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const handleRatingClick = (value: number) => {
    setValue('rating', value);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-center">
            Rate Your Collaboration
          </DialogTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            How was your experience working with {rateeName}?
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Star Rating */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Rating *</Label>
            <div className="flex justify-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleRatingClick(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= (hoveredRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300 dark:text-gray-600'
                    }`}
                  />
                </button>
              ))}
            </div>
            {errors.rating && (
              <p className="text-sm text-red-600 dark:text-red-400 text-center">
                {errors.rating.message}
              </p>
            )}
          </div>

          {/* Review */}
          <div className="space-y-2">
            <Label htmlFor="review" className="text-sm font-medium">
              Review (Optional)
            </Label>
            <Textarea
              id="review"
              {...register('review')}
              placeholder="Share your thoughts about the collaboration..."
              className="min-h-[100px]"
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting || rating === 0}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {submitting ? 'Submitting...' : 'Submit Rating'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
