// components/ui/circular-progress.tsx
'use client';

import { cn } from '@/lib/utils';

interface CircularProgressProps {
  value: number; // 0-100
  size?: number;
  strokeWidth?: number;
  className?: string;
  showValue?: boolean;
  color?: 'blue' | 'green' | 'amber' | 'red';
  'aria-label'?: string;
  'aria-labelledby'?: string;
}

export function CircularProgress({
  value,
  size = 80,
  strokeWidth = 8,
  className,
  showValue = true,
  color = 'blue',
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  const colorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    amber: 'text-amber-600',
    red: 'text-red-600'
  };

  const bgColorClasses = {
    blue: 'text-blue-100 dark:text-blue-900/30',
    green: 'text-green-100 dark:text-green-900/30',
    amber: 'text-amber-100 dark:text-amber-900/30',
    red: 'text-red-100 dark:text-red-900/30'
  };

  return (
    <div
      className={cn('relative inline-flex items-center justify-center', className)}
      role="progressbar"
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
    >
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className={bgColorClasses[color]}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={cn('transition-all duration-500 ease-out', colorClasses[color])}
        />
      </svg>
      {showValue && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {Math.round(value)}%
          </span>
        </div>
      )}
    </div>
  );
}
