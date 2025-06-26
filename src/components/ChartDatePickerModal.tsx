
"use client";

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Clock, ArrowRight } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from '@/lib/utils';
import type { DateRange } from "react-day-picker";
import { addDays, format } from "date-fns";

interface ChartDatePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGo: (date: Date | DateRange) => void;
}

export function ChartDatePickerModal({ isOpen, onClose, onGo }: ChartDatePickerModalProps) {
  const [activeTab, setActiveTab] = useState("date");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState("09:30");
  const [range, setRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 4),
  });

  if (!isOpen) {
    return null;
  }

  const handleGo = () => {
    if (activeTab === "date" && date) {
      const [hours, minutes] = time.split(':').map(Number);
      const combinedDate = new Date(date);
      combinedDate.setHours(hours, minutes);
      onGo(combinedDate);
    } else if (activeTab === "custom-range" && range) {
      onGo(range);
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-black/15 backdrop-blur-md border border-white/5 text-foreground">
        <DialogHeader>
          <DialogTitle className="text-lg font-headline text-primary">Go to</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="date" onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="date">Date</TabsTrigger>
                <TabsTrigger value="custom-range">Custom range</TabsTrigger>
            </TabsList>
            <TabsContent value="date" className="py-4 space-y-4">
                 <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md border border-border/10 p-2"
                />
                <div className="space-y-1">
                    <Label htmlFor="time-input" className="text-xs text-muted-foreground">Time</Label>
                    <div className="relative">
                        <Clock className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <Input
                            id="time-input"
                            type="time"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            className="pl-7 bg-transparent h-9"
                        />
                    </div>
                </div>
            </TabsContent>
            <TabsContent value="custom-range" className="py-4 space-y-4">
                 <Calendar
                    mode="range"
                    defaultMonth={range?.from}
                    selected={range}
                    onSelect={setRange}
                    numberOfMonths={1}
                    className="rounded-md border border-border/10 p-2"
                />
                 <div className="flex items-center justify-center text-sm text-muted-foreground">
                    {range?.from ? format(range.from, "LLL dd, y") : <span>Pick a start date</span>}
                    <ArrowRight className="mx-2 h-4 w-4" />
                    {range?.to ? format(range.to, "LLL dd, y") : <span>Pick an end date</span>}
                </div>
            </TabsContent>
        </Tabs>
        
        <DialogFooter className="sm:justify-end gap-2">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleGo}>
            Go to
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
