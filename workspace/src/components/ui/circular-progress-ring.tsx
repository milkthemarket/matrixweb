
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface CircularProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  circleClassName?: string;
  progressClassName?: string;
}

export function CircularProgressRing({
  progress,
  size = 100,
  strokeWidth = 10,
  className,
  circleClassName,
  progressClassName,
}: CircularProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  const getProgressColor = () => {
    if (progress >= 95) return "hsl(var(--confirm-green))";
    if (progress >= 50) return "hsl(var(--chart-4))";
    return "hsl(var(--destructive))";
  };
  const progressColor = getProgressColor();

  return (
    <div
      className={cn("relative flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      <svg className="absolute" width={size} height={size}>
        <circle
          className={cn("text-muted/20", circleClassName)}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className={cn("transition-all duration-500 ease-out", progressClassName)}
          stroke={progressColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: offset,
            transform: "rotate(-90deg)",
            transformOrigin: "50% 50%",
          }}
        />
      </svg>
      <span
        className="text-sm font-bold text-foreground"
        style={{ color: progressColor }}
      >
        {`${Math.round(progress)}%`}
      </span>
    </div>
  );
}
