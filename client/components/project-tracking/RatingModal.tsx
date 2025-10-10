// components/project-tracking/RatingModal.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
  communication_rating: z.number().min(1, 'Please select a communication rating').max(5),
  quality_rating: z.number().min(1, 'Please select a quality rating').max(5),
  timeliness_rating: z.number().min(1, 'Please select a timeliness rating').max(5),
  overall_rating: z.number().min(1, 'Please select an overall rating').max(5),
  review_text: z.string().optional(),
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
  const [hoveredCommunication, setHoveredCommunication] = useState(0);
  const [hoveredQuality, setHoveredQuality] = useState(0);
  const [hoveredTimeliness, setHoveredTimeliness] = useState(0);
  const [hoveredOverall, setHoveredOverall] = useState(0);
  const { submitRating } = useRatings(projectId);
  const { submitting } = useRatingStore();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
  } = useForm<RatingFormData>({
    resolver: zodResolver(ratingSchema),
    defaultValues: {
      communication_rating: 0,
      quality_rating: 0,
      timeliness_rating: 0,
      overall_rating: 0,
      review_text: '',
    },
  });

  const communication_rating = watch('communication_rating');
  const quality_rating = watch('quality_rating');
  const timeliness_rating = watch('timeliness_rating');
  const overall_rating = watch('overall_rating');

  const onSubmit = async (data: RatingFormData) => {
    try {
      await submitRating({
        project_id: projectId,
        ratee_id: rateeId,
        communication_rating: data.communication_rating,
        quality_rating: data.quality_rating,
        timeliness_rating: data.timeliness_rating,
        overall_rating: data.overall_rating,
        review_text: data.review_text,
      });

      reset();
      setOpen(false);
    } catch {
      // Error is handled in the hook
    }
  };

  const handleCommunicationClick = (value: number) => {
    setValue('communication_rating', value);
  };

  const handleQualityClick = (value: number) => {
    setValue('quality_rating', value);
  };

  const handleTimelinessClick = (value: number) => {
    setValue('timeliness_rating', value);
  };

  const handleOverallClick = (value: number) => {
    setValue('overall_rating', value);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm bg-white dark:bg-gray-900 p-4">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-lg font-semibold text-center">
            Rate Collaboration
          </DialogTitle>
          <DialogDescription className="text-xs text-gray-600 dark:text-gray-400 text-center">
            How was your experience with {rateeName}?
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Ratings Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Communication Rating */}
            <div className="space-y-1">
              <Label className="text-xs font-medium">Communication</Label>
              <div className="flex justify-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleCommunicationClick(star)}
                    onMouseEnter={() => setHoveredCommunication(star)}
                    onMouseLeave={() => setHoveredCommunication(0)}
                    className="p-0.5 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-6 h-6 sm:w-5 sm:h-5 ${
                        star <= (hoveredCommunication || communication_rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300 dark:text-gray-600'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Quality Rating */}
            <div className="space-y-1">
              <Label className="text-xs font-medium">Quality</Label>
              <div className="flex justify-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleQualityClick(star)}
                    onMouseEnter={() => setHoveredQuality(star)}
                    onMouseLeave={() => setHoveredQuality(0)}
                    className="p-0.5 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-6 h-6 sm:w-5 sm:h-5 ${
                        star <= (hoveredQuality || quality_rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300 dark:text-gray-600'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Timeliness Rating */}
            <div className="space-y-1">
              <Label className="text-xs font-medium">Timeliness</Label>
              <div className="flex justify-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleTimelinessClick(star)}
                    onMouseEnter={() => setHoveredTimeliness(star)}
                    onMouseLeave={() => setHoveredTimeliness(0)}
                    className="p-0.5 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-6 h-6 sm:w-5 sm:h-5 ${
                        star <= (hoveredTimeliness || timeliness_rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300 dark:text-gray-600'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Overall Rating */}
            <div className="space-y-1">
              <Label className="text-xs font-medium">Overall</Label>
              <div className="flex justify-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleOverallClick(star)}
                    onMouseEnter={() => setHoveredOverall(star)}
                    onMouseLeave={() => setHoveredOverall(0)}
                    className="p-0.5 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-6 h-6 sm:w-5 sm:h-5 ${
                        star <= (hoveredOverall || overall_rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300 dark:text-gray-600'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Review */}
          <div className="space-y-1">
            <Label htmlFor="review_text" className="text-xs font-medium">
              Review (Optional)
            </Label>
            <Textarea
              id="review_text"
              {...register('review_text')}
              placeholder="Share your thoughts..."
              className="min-h-[60px] text-sm"
            />
          </div>

          {/* Submit Button */}
          <DialogFooter className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1 text-xs py-1.5"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting || communication_rating === 0 || quality_rating === 0 || timeliness_rating === 0 || overall_rating === 0}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs py-1.5"
            >
              {submitting ? 'Submitting...' : 'Submit'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
