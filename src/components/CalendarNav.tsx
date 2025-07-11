"use client";

import * as React from 'react';
import { Button } from "@/components/ui/button";
import { format } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { subMonths, addMonths } from 'date-fns';

interface CalendarNavProps {
  currentMonth: Date;
  onMonthChange: (newMonth: Date) => void;
  onTodayClick: () => void;
  activeView: string;
  onActiveViewChange: (view: string) => void;
}

export function CalendarNav({
  currentMonth,
  onMonthChange,
  onTodayClick,
  activeView,
  onActiveViewChange
}: CalendarNavProps) {

  const handlePreviousMonth = () => {
    onMonthChange(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    onMonthChange(addMonths(currentMonth, 1));
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-b border-white/10">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" aria-label="Previous period" onClick={handlePreviousMonth}><ChevronLeft className="h-4 w-4" /></Button>
        <Button variant="outline" size="icon" aria-label="Next period" onClick={handleNextMonth}><ChevronRight className="h-4 w-4" /></Button>
        <Button variant="outline" onClick={onTodayClick}>Today</Button>
      </div>
      <div className="text-lg font-semibold text-foreground">{format(currentMonth, "MMMM yyyy")}</div>
      <div className="flex items-center gap-1 bg-black/30 p-1 rounded-md">
        {["month", "week", "day"].map((view) => (
          <Button key={view} variant={activeView === view ? "default" : "ghost"} size="sm"
            className={cn(
                "px-3 py-1 h-auto text-xs capitalize", 
                activeView === view ? 'bg-primary text-primary-foreground' : 'hover:bg-white/10'
            )}
            onClick={() => onActiveViewChange(view)}>{view}
          </Button>
        ))}
      </div>
    </div>
  );
}
