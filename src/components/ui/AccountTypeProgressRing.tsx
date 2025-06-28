
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type AccountType = 'Traditional IRA' | 'Roth IRA' | 'SEP IRA' | 'SIMPLE IRA';

interface AccountTypeProgressRingProps {
  progress: number;
  accountType: AccountType;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export function AccountTypeProgressRing({
  progress,
  accountType,
  size = 150,
  strokeWidth = 12,
  className,
}: AccountTypeProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  const getProgressColor = (): string => {
    switch (accountType) {
      case "Roth IRA":
        return "hsl(var(--chart-1))"; 
      case "Traditional IRA":
        return "hsl(var(--chart-2))";
      case "SEP IRA":
        return "hsl(var(--chart-3))";
      case "SIMPLE IRA":
        return "hsl(var(--chart-4))";
      default:
        return "hsl(var(--muted-foreground))";
    }
  };

  const progressColor = getProgressColor();

  return (
    <div
      className={cn("relative flex flex-col items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      <svg className="absolute" width={size} height={size}>
        <circle
          className="text-muted/10"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className="transition-all duration-700 ease-in-out"
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
       <div className="text-center">
         <span className="text-2xl font-bold" style={{ color: progressColor }}>
            {`${Math.round(progress)}%`}
        </span>
         <p className="text-xs text-muted-foreground mt-1">{accountType}</p>
      </div>
    </div>
  );
}

  