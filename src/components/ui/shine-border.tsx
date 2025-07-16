'use client';

import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface ShineBorderProps {
  children: ReactNode;
  className?: string;
  borderWidth?: number;
  borderRadius?: number;
  duration?: number;
  color?: string[];
}

export function ShineBorder({
  children,
  className,
  borderWidth = 2,
  borderRadius = 8,
  duration = 14,
  color = ['#A07CFE', '#FE8FB5', '#FFBE7B'],
}: ShineBorderProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg',
        className
      )}
      style={{
        borderRadius: `${borderRadius}px`,
        padding: `${borderWidth}px`,
      }}
    >
      {/* Animated gradient border */}
      <div
        className="absolute inset-0 overflow-hidden rounded-lg"
        style={{
          borderRadius: `${borderRadius}px`,
        }}
      >
        <div
          className={cn(
            'absolute inset-[-100%] animate-[spin_var(--duration)_linear_infinite]'
          )}
          style={{
            '--duration': `${duration}s`,
            background: `conic-gradient(from 0deg, ${color.join(', ')}, ${color[0]})`,
          } as React.CSSProperties}
        />
      </div>

      {/* Inner content container */}
      <div
        className="relative z-10 h-full w-full rounded-lg bg-background"
        style={{
          borderRadius: `${borderRadius - borderWidth}px`,
        }}
      >
        {children}
      </div>
    </div>
  );
}