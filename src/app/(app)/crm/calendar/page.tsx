
"use client";

import * as React from 'react';
import { PlaceholderCard } from '@/components/dashboard/PlaceholderCard';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from '@/components/ui/textarea';
import { useToast } from "@/hooks/use-toast";
import {
  CalendarDays,
  MoreHorizontal,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  Bold,
  Italic,
  Underline,
  ListChecks,
  ListOrdered,
  Link2,
  Table as TableIcon, 
  Smile,
  Mic,
  Trash2,
  UploadCloud,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  format, 
  subDays, 
  addDays, 
  subMonths, 
  addMonths, 
  startOfWeek, 
  endOfWeek, 
  getDay, 
  getDate, 
  getDaysInMonth, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isToday, 
  isSameMonth, 
  setHours, 
  setMinutes, 
  getHours, 
  getMinutes, 
  isSameDay, 
  addWeeks, 
  subWeeks, 
  isValid, 
  addHours,
  parse as parseDateFns // For robust date parsing
} from 'date-fns';

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const hoursToDisplay = Array.from({ length: 24 }, (_, i) => {
  const hour = i % 12 === 0 ? 12 : i % 12;
  const ampm = i < 12 || i === 24 ? "AM" : "PM";
  if (i === 0) return "12 AM"; 
  if (i === 12) return "12 PM"; 
  return `${hour} ${ampm}`;
});

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  color?: string; // Optional for styling
}

const getMonthDays = (year: number, month: number): { day: number | null; isCurrentMonth: boolean; fullDate: Date | null }[] => {
  const firstDayOfMonth = startOfMonth(new Date(year, month));
  const lastDayOfMonth = endOfMonth(new Date(year, month));
  const daysInCurrentMonth = getDaysInMonth(new Date(year, month));
  const daysArray = [];

  const firstDayOfWeekOffset = getDay(firstDayOfMonth); 
  for (let i = 0; i < firstDayOfWeekOffset; i++) {
    const prevMonthDay = subDays(firstDayOfMonth, firstDayOfWeekOffset - i);
    daysArray.push({ day: getDate(prevMonthDay), isCurrentMonth: false, fullDate: prevMonthDay });
  }

  for (let i = 1; i <= daysInCurrentMonth; i++) {
    daysArray.push({ day: i, isCurrentMonth: true, fullDate: new Date(year, month, i) });
  }

  const totalCells = Math.ceil((firstDayOfWeekOffset + daysInCurrentMonth) / 7) * 7;
  let nextMonthDayCounter = 1;
  while (daysArray.length < totalCells) {
    const nextMonthDay = addDays(lastDayOfMonth, nextMonthDayCounter++);
    daysArray.push({ day: getDate(nextMonthDay), isCurrentMonth: false, fullDate: nextMonthDay });
  }
  return daysArray;
};

const getWeekDates = (currentDate: Date): { dayName: string; dateNumber: number; fullDate: Date }[] => {
  const start = startOfWeek(currentDate, { weekStartsOn: 0 }); 
  return Array.from({ length: 7 }).map((_, i) => {
    const day = addDays(start, i);
    return {
      dayName: format(day, 'EEE'),
      dateNumber: getDate(day),
      fullDate: day,
    };
  });
};

// Helper function to parse time string "HH:MM AM/PM" and combine with a base date
const parseTimeStringToDate = (baseDate: Date, timeString: string): Date => {
  const timeParts = timeString.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!timeParts) return baseDate; // Return baseDate if parsing fails

  let hours = parseInt(timeParts[1], 10);
  const minutes = parseInt(timeParts[2], 10);
  const period = timeParts[3].toUpperCase();

  if (period === "PM" && hours < 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0; // Midnight case

  const newDate = new Date(baseDate);
  newDate.setHours(hours, minutes, 0, 0);
  return newDate;
};


export default function ClientPortalCalendarPage() {
  const { toast } = useToast();
  const [isAddEventDialogOpen, setIsAddEventDialogOpen] = React.useState(false);
  const [isQuickAddEventDialogOpen, setIsQuickAddEventDialogOpen] = React.useState(false);
  const [quickAddEventSelectedDate, setQuickAddEventSelectedDate] = React.useState<Date | null>(null);
  const [quickAddEventTitle, setQuickAddEventTitle] = React.useState('');
  const [quickAddEventAllDay, setQuickAddEventAllDay] = React.useState(false);
  const [quickAddEventStartTime, setQuickAddEventStartTime] = React.useState('09:00 AM');
  const [quickAddEventEndTime, setQuickAddEventEndTime] = React.useState('10:00 AM');

  const [fullEventTitle, setFullEventTitle] = React.useState('');
  const [fullEventAllDay, setFullEventAllDay] = React.useState(false);
  const [fullEventStartDate, setFullEventStartDate] = React.useState('');
  const [fullEventStartTime, setFullEventStartTime] = React.useState('');
  const [fullEventEndDate, setFullEventEndDate] = React.useState('');
  const [fullEventEndTime, setFullEventEndTime] = React.useState('');

  const [events, setEvents] = React.useState<CalendarEvent[]>([]);

  const [activeView, setActiveView] = React.useState("month"); 
  const [currentDateForCalendar, setCurrentDateForCalendar] = React.useState(new Date());
  const [currentTimePosition, setCurrentTimePosition] = React.useState<number | null>(null);


  const currentYearForMonthView = currentDateForCalendar.getFullYear();
  const currentMonthIndexForMonthView = currentDateForCalendar.getMonth();
  const monthDays = getMonthDays(currentYearForMonthView, currentMonthIndexForMonthView);
  const weekDates = getWeekDates(currentDateForCalendar);

  React.useEffect(() => {
    if (activeView === 'week' || activeView === 'day') {
      const updateLine = () => {
        const now = new Date();
        if (activeView === 'day' && !isSameDay(now, currentDateForCalendar)) {
          setCurrentTimePosition(null);
          return;
        }
        if (activeView === 'week') {
          const currentWeekStart = startOfWeek(now, { weekStartsOn: 0 });
          const displayedWeekStart = startOfWeek(currentDateForCalendar, { weekStartsOn: 0 });
          if (!isSameDay(currentWeekStart, displayedWeekStart)) { // Check if it's the current week
            setCurrentTimePosition(null);
            return;
          }
        }

        const currentHour = getHours(now);
        const currentMinute = getMinutes(now);
        const totalMinutesInDay = 24 * 60;
        const minutesPastMidnight = currentHour * 60 + currentMinute;
        const percentageOfDay = (minutesPastMidnight / totalMinutesInDay) * 100;
        setCurrentTimePosition(percentageOfDay);
      };
      updateLine(); 
      const interval = setInterval(updateLine, 60000); 
      return () => clearInterval(interval);
    } else {
      setCurrentTimePosition(null); 
    }
  }, [activeView, currentDateForCalendar]);


  const getFormattedHeaderDate = () => {
    if (activeView === 'month') return format(currentDateForCalendar, "MMMM yyyy");
    if (activeView === 'week') {
      const start = startOfWeek(currentDateForCalendar, { weekStartsOn: 0 });
      const end = endOfWeek(currentDateForCalendar, { weekStartsOn: 0 });
      if (format(start, 'MMMM') === format(end, 'MMMM')) {
        return `${format(start, 'MMMM d')} – ${format(end, 'd, yyyy')}`;
      }
      return `${format(start, 'MMM d')} – ${format(end, 'MMM d, yyyy')}`;
    }
    return format(currentDateForCalendar, "MMMM d, yyyy");
  };
  const headerDateDisplay = getFormattedHeaderDate();

  const handlePrevious = () => {
    if (activeView === 'month') setCurrentDateForCalendar(prev => subMonths(prev, 1));
    else if (activeView === 'week') setCurrentDateForCalendar(prev => subWeeks(prev, 1));
    else setCurrentDateForCalendar(prev => subDays(prev, 1));
  };

  const handleNext = () => {
    if (activeView === 'month') setCurrentDateForCalendar(prev => addMonths(prev, 1));
    else if (activeView === 'week') setCurrentDateForCalendar(prev => addWeeks(prev, 1));
    else setCurrentDateForCalendar(prev => addDays(prev, 1));
  };

  const handleToday = () => setCurrentDateForCalendar(new Date());

  const openQuickAddDialogForDate = (dayDate: Date, hourIndex?: number) => {
    if (dayDate && isValid(dayDate)) {
      setQuickAddEventSelectedDate(dayDate);
      setQuickAddEventTitle('');
      
      let newStartTimeDate;
      let newEndTimeDate;

      if (typeof hourIndex === 'number') {
        setQuickAddEventAllDay(false);
        newStartTimeDate = setMinutes(setHours(new Date(dayDate), hourIndex), 0);
        newEndTimeDate = addHours(newStartTimeDate, 1);
      } else { // Month view click or default
        setQuickAddEventAllDay(true); // Default to all-day for month click
        const now = new Date();
        newStartTimeDate = setMinutes(setHours(new Date(dayDate), getHours(now) +1 ), 0); // Default to next hour
        newEndTimeDate = addHours(newStartTimeDate, 1);
      }

      setQuickAddEventStartTime(format(newStartTimeDate, 'hh:mm a'));
      setQuickAddEventEndTime(format(newEndTimeDate, 'hh:mm a'));
      setIsQuickAddEventDialogOpen(true);
    }
  };
  
  const openFullEventFormFromQuickAdd = () => {
    if (quickAddEventSelectedDate) {
      setFullEventTitle(quickAddEventTitle);
      setFullEventAllDay(quickAddEventAllDay);
      setFullEventStartDate(format(quickAddEventSelectedDate, 'MM/dd/yyyy'));
      setFullEventStartTime(quickAddEventAllDay ? '' : quickAddEventStartTime);
      setFullEventEndDate(format(quickAddEventSelectedDate, 'MM/dd/yyyy')); // Default to same day
      setFullEventEndTime(quickAddEventAllDay ? '' : quickAddEventEndTime);
    }
    setIsQuickAddEventDialogOpen(false);
    setIsAddEventDialogOpen(true);
  };

  const handleSaveQuickEvent = () => {
    if (!quickAddEventTitle.trim()) {
      toast({
        title: "Event Title Required",
        description: "Please enter a title for your event.",
        variant: "destructive",
      });
      return;
    }
    if (!quickAddEventSelectedDate) {
      toast({ title: "No date selected for quick add", variant: "destructive"});
      return;
    }

    let eventStart: Date;
    let eventEnd: Date;

    if (quickAddEventAllDay) {
      eventStart = startOfDay(quickAddEventSelectedDate);
      eventEnd = endOfDay(quickAddEventSelectedDate); // For rendering, might adjust for display
    } else {
      eventStart = parseTimeStringToDate(quickAddEventSelectedDate, quickAddEventStartTime);
      eventEnd = parseTimeStringToDate(quickAddEventSelectedDate, quickAddEventEndTime);
      if (eventEnd <= eventStart) { // Ensure end time is after start time
         eventEnd = addHours(eventStart, 1);
      }
    }
    
    const newEvent: CalendarEvent = {
      id: Date.now().toString(),
      title: quickAddEventTitle,
      start: eventStart,
      end: eventEnd,
      allDay: quickAddEventAllDay,
      color: 'hsl(var(--primary))' // Default color
    };

    setEvents(prevEvents => [...prevEvents, newEvent]);
    toast({
      title: "Event Added!",
      description: `"${newEvent.title}" has been added to your calendar.`,
    });
    setIsQuickAddEventDialogOpen(false);
    // Reset quick add form
    setQuickAddEventTitle('');
    setQuickAddEventAllDay(false);
    setQuickAddEventSelectedDate(null);
  };

  // Helper to get events for a specific day (month view)
  const getEventsForDay = (day: Date | null) => {
    if (!day) return [];
    return events.filter(event => 
      (event.allDay && isSameDay(event.start, day)) ||
      (!event.allDay && isSameDay(event.start, day)) 
    );
  };

  // Helper to get events for a specific timeslot (week/day view)
  const getEventsForSlot = (slotStart: Date, slotEnd: Date) => {
    return events.filter(event => 
      !event.allDay && event.start < slotEnd && event.end > slotStart
    );
  };

  const getEventsForAllDaySlot = (day: Date | null) => {
    if (!day) return [];
    return events.filter(event => event.allDay && isSameDay(event.start, day));
  }

  const startOfDay = (date: Date) => setMinutes(setHours(new Date(date), 0), 0);
  const endOfDay = (date: Date) => setMinutes(setHours(new Date(date), 23), 59);


  return (
    <>
      <main className="flex flex-col flex-1 h-full overflow-hidden p-6 space-y-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Calendar</h1>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-auto py-1.5 px-3">
                  <MoreHorizontal className="h-4 w-4" /> <span className="sr-only">Options</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Import Calendar</DropdownMenuItem>
                <DropdownMenuItem>Export Calendar</DropdownMenuItem>
                <DropdownMenuItem>Calendar Settings</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={() => setIsAddEventDialogOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Event
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 lg:gap-8"> {/* Main layout grid */}
          <div className="flex-1 space-y-6"> 
            <PlaceholderCard title="" className="p-0 bg-card/80 backdrop-blur-sm border border-white/10">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" aria-label="Previous period" onClick={handlePrevious}><ChevronLeft className="h-4 w-4" /></Button>
                  <Button variant="outline" size="icon" aria-label="Next period" onClick={handleNext}><ChevronRight className="h-4 w-4" /></Button>
                  <Button variant="outline" onClick={handleToday}>Today</Button>
                </div>
                <div className="text-lg font-semibold text-foreground">{headerDateDisplay}</div>
                <div className="flex items-center gap-1 bg-black/20 p-1 rounded-md">
                  {["month", "week", "day"].map((view) => (
                    <Button key={view} variant={activeView === view ? "default" : "ghost"} size="sm"
                      className={`px-3 py-1 h-auto text-xs capitalize ${activeView === view ? 'bg-primary/80 text-primary-foreground' : 'hover:bg-white/10'}`}
                      onClick={() => setActiveView(view)}>{view}</Button>
                  ))}
                </div>
              </div>

              {activeView === 'month' && (
                <div className="grid grid-cols-7 gap-px border-l border-t border-white/10 bg-white/10">
                  {daysOfWeek.map((day) => (
                    <div key={day} className="py-2 px-1 text-center text-xs font-medium text-muted-foreground bg-transparent border-r border-b border-white/10">{day}</div>
                  ))}
                  {monthDays.map((dayObj, index) => {
                    const dayEvents = getEventsForDay(dayObj.fullDate);
                    return (
                    <div key={index}
                      className={cn("h-24 sm:h-28 md:h-32 p-1.5 text-xs bg-transparent border-r border-b border-white/10 overflow-hidden relative cursor-pointer hover:bg-white/5",
                        dayObj.isCurrentMonth ? "text-foreground" : "text-muted-foreground/50",
                        dayObj.fullDate && isToday(dayObj.fullDate) && dayObj.isCurrentMonth && "bg-primary/10 ring-1 ring-inset ring-primary/50"
                      )}
                      onClick={() => dayObj.fullDate && dayObj.isCurrentMonth && openQuickAddDialogForDate(dayObj.fullDate)}
                    >
                      {dayObj.day && (
                        <span className={cn("absolute top-1.5 right-1.5 flex items-center justify-center w-5 h-5 rounded-full",
                          dayObj.fullDate && isToday(dayObj.fullDate) && dayObj.isCurrentMonth ? "bg-primary text-primary-foreground font-semibold" : "")}>
                          {dayObj.day}
                        </span>
                      )}
                       <div className="mt-5 space-y-0.5 max-h-[calc(100%-1.75rem)] overflow-y-auto no-scrollbar">
                        {dayEvents.map(event => (
                          <div key={event.id} className="text-[10px] bg-primary/80 text-primary-foreground p-0.5 rounded-sm truncate">
                            {event.title}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                  })}
                </div>
              )}
              {activeView === 'week' && (
                 <div className="overflow-x-auto relative">
                    <table className="w-full border-collapse bg-transparent">
                        <thead>
                            <tr>
                                <th className="w-16 p-2 border-r border-b border-white/10 text-xs text-muted-foreground font-normal sticky left-0 bg-card/80 backdrop-blur-sm z-10"></th>
                                {weekDates.map(day => (
                                    <th key={day.dateNumber} className="p-2 border-r border-b border-white/10 text-center">
                                        <div className={cn("text-xs font-medium", isToday(day.fullDate) ? "text-primary" : "text-muted-foreground")}>{day.dayName}</div>
                                        <div className={cn("text-2xl font-semibold mt-1", isToday(day.fullDate) ? "text-primary bg-primary/10 rounded-full w-8 h-8 flex items-center justify-center mx-auto" : "text-foreground")}>{day.dateNumber}</div>
                                    </th>
                                ))}
                            </tr>
                            <tr>
                                <td className="w-16 p-2 border-r border-b border-white/10 text-xs text-muted-foreground sticky left-0 bg-card/80 backdrop-blur-sm z-10 text-center">all-day</td>
                                {weekDates.map((day, i) => {
                                  const allDayEvents = getEventsForAllDaySlot(day.fullDate);
                                  return (
                                    <td key={`all-day-${i}`} className="h-10 border-r border-b border-white/10 hover:bg-white/5 cursor-pointer p-1 align-top" onClick={() => openQuickAddDialogForDate(weekDates[i].fullDate)}>
                                      <div className="space-y-0.5">
                                        {allDayEvents.map(event => (
                                          <div key={event.id} className="text-[10px] bg-primary/80 text-primary-foreground p-0.5 rounded-sm truncate">{event.title}</div>
                                        ))}
                                      </div>
                                    </td>
                                  );
                                })}
                            </tr>
                        </thead>
                        <tbody className="relative">
                            {hoursToDisplay.map((hourLabel, hourIndex) => (
                                <tr key={hourLabel}>
                                    <td className="w-16 p-2 border-r border-b border-white/10 text-xs text-muted-foreground align-top text-right sticky left-0 bg-card/80 backdrop-blur-sm z-10">
                                        {hourIndex > 0 && hourLabel}
                                    </td>
                                    {weekDates.map((day, dayIndex) => {
                                      const slotStart = setMinutes(setHours(new Date(day.fullDate), hourIndex), 0);
                                      const slotEnd = addHours(slotStart, 1);
                                      const slotEvents = getEventsForSlot(slotStart, slotEnd);
                                      return (
                                        <td key={`${hourLabel}-${dayIndex}`} className="h-16 border-r border-b border-white/10 hover:bg-white/5 cursor-pointer p-1 align-top" onClick={() => openQuickAddDialogForDate(weekDates[dayIndex].fullDate, hourIndex)}>
                                          <div className="space-y-0.5">
                                            {slotEvents.map(event => (
                                              <div key={event.id} className="text-[10px] bg-primary/80 text-primary-foreground p-0.5 rounded-sm truncate">{event.title}</div>
                                            ))}
                                          </div>
                                        </td>
                                      );
                                    })}
                                </tr>
                            ))}
                             {currentTimePosition !== null && isSameDay(startOfWeek(currentDateForCalendar, { weekStartsOn: 0 }), startOfWeek(new Date(), { weekStartsOn: 0 })) && (
                              <div className="absolute w-[calc(100%-4rem)] h-0.5 bg-primary z-10 right-0" style={{ top: `${currentTimePosition}%` }}>
                                <div className="absolute -left-1.5 -top-1.5 w-3.5 h-3.5 bg-primary rounded-full ring-2 ring-background"></div>
                              </div>
                            )}
                        </tbody>
                    </table>
                </div>
              )}
              {activeView === 'day' && (
                <div className="flex flex-1 h-[calc(24*4rem+2.5rem)] border-t border-white/10 relative"> 
                    <div className="w-16 border-r border-white/10 shrink-0 bg-card/80 backdrop-blur-sm">
                        <div className="h-10 flex items-center justify-center text-xs text-muted-foreground border-b border-white/10"> 
                           {format(currentDateForCalendar, 'EEE')}
                        </div>
                        <div className="h-10 flex items-center justify-center text-xs text-muted-foreground border-b border-white/10 hover:bg-white/5 cursor-pointer p-1 align-top" onClick={() => openQuickAddDialogForDate(currentDateForCalendar)}>
                           {getEventsForAllDaySlot(currentDateForCalendar).map(event => (
                              <div key={event.id} className="text-[10px] bg-primary/80 text-primary-foreground p-0.5 rounded-sm truncate w-full">{event.title}</div>
                            ))}
                            {getEventsForAllDaySlot(currentDateForCalendar).length === 0 && <span>all-day</span>}
                        </div>
                        {hoursToDisplay.map((hourLabel, index) => (
                            <div key={`time-${hourLabel}`} className="h-16 pr-1 text-xs text-muted-foreground text-right border-b border-white/10 flex items-start justify-end pt-1">
                                {index > 0 && hourLabel}
                            </div>
                        ))}
                    </div>
                    <div className="flex-1">
                        <div className="h-10 flex flex-col items-center justify-center border-b border-white/10">
                            <div className={cn("text-2xl font-semibold", isToday(currentDateForCalendar) ? "text-primary bg-primary/10 rounded-full w-10 h-10 flex items-center justify-center" : "text-foreground")}>
                                {format(currentDateForCalendar, 'd')}
                            </div>
                        </div>
                         <div className="h-10 border-b border-white/10 hover:bg-white/5 cursor-pointer" onClick={() => openQuickAddDialogForDate(currentDateForCalendar)}></div> 
                        {hoursToDisplay.map((_, hourIndex) => {
                            const slotStart = setMinutes(setHours(new Date(currentDateForCalendar), hourIndex), 0);
                            const slotEnd = addHours(slotStart, 1);
                            const slotEvents = getEventsForSlot(slotStart, slotEnd);
                            return (
                              <div key={`slot-${hourIndex}`} className="h-16 border-b border-white/10 hover:bg-white/5 cursor-pointer p-1 align-top" onClick={() => openQuickAddDialogForDate(currentDateForCalendar, hourIndex)}>
                                <div className="space-y-0.5">
                                   {slotEvents.map(event => (
                                    <div key={event.id} className="text-[10px] bg-primary/80 text-primary-foreground p-0.5 rounded-sm truncate">{event.title}</div>
                                  ))}
                                </div>
                              </div>
                            );
                        })}
                    </div>
                     {currentTimePosition !== null && isSameDay(currentDateForCalendar, new Date()) && (
                        <div className="absolute w-[calc(100%-4rem)] h-0.5 bg-primary z-10 right-0" style={{ top: `calc(${currentTimePosition}% + 2.5rem - 1px)`}}> 
                           <div className="absolute -left-1.5 -top-1.5 w-3.5 h-3.5 bg-primary rounded-full ring-2 ring-background"></div>
                        </div>
                      )}
                </div>
              )}
            </PlaceholderCard>
          </div>

          <aside className="lg:w-72 xl:w-80 space-y-6 shrink-0">
            <PlaceholderCard title="" className="p-0 bg-card/80 backdrop-blur-sm border border-white/10"> 
                <Tabs defaultValue="calendars" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-black/20">
                    <TabsTrigger value="calendars" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">Calendars</TabsTrigger>
                    <TabsTrigger value="tasks" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">Tasks</TabsTrigger>
                </TabsList>
                <TabsContent value="calendars" className="p-4 space-y-4">
                    <div>
                    <h4 className="font-semibold text-foreground mb-2">USERS</h4>
                    <div className="space-y-1.5 text-sm">
                        <div className="flex items-center space-x-2"><Checkbox id="selectAllUsers" /><Label htmlFor="selectAllUsers" className="font-normal text-muted-foreground">Select All</Label></div>
                        <div className="flex items-center space-x-2"><Checkbox id="userJosh" defaultChecked /><Label htmlFor="userJosh" className="font-normal text-muted-foreground">Josh Bajorek</Label></div>
                    </div>
                    </div>
                    <div>
                    <h4 className="font-semibold text-foreground mb-2">EVENT CATEGORIES</h4>
                    <div className="space-y-1.5 text-sm">
                        <div className="flex items-center space-x-2"><Checkbox id="selectAllCategories" /><Label htmlFor="selectAllCategories" className="font-normal text-muted-foreground">Select All</Label></div>
                        <div className="flex items-center space-x-2"><Checkbox id="catUncategorized" /><Label htmlFor="catUncategorized" className="font-normal text-muted-foreground">Uncategorized</Label></div>
                        <div className="flex items-center space-x-2"><Checkbox id="catMeeting" defaultChecked /><Label htmlFor="catMeeting" className="font-normal text-muted-foreground">Meeting</Label></div>
                        <div className="flex items-center space-x-2"><Checkbox id="catClientReview" /><Label htmlFor="catClientReview" className="font-normal text-muted-foreground">Client Review</Label></div>
                        <div className="flex items-center space-x-2"><Checkbox id="catProspectIntro" /><Label htmlFor="catProspectIntro" className="font-normal text-muted-foreground">Prospect Introduction</Label></div>
                        <div className="flex items-center space-x-2"><Checkbox id="catSocialEvent" /><Label htmlFor="catSocialEvent" className="font-normal text-muted-foreground">Social Event</Label></div>
                        <div className="flex items-center space-x-2"><Checkbox id="catConference" /><Label htmlFor="catConference" className="font-normal text-muted-foreground">Conference</Label></div>
                    </div>
                    </div>
                     <div>
                    <h4 className="font-semibold text-foreground mb-2">OTHER CALENDARS</h4>
                    <div className="space-y-1.5 text-sm">
                        <div className="flex items-center space-x-2"><Checkbox id="calSpecialDates" defaultChecked /><Label htmlFor="calSpecialDates" className="font-normal text-muted-foreground">Special Dates</Label></div>
                        <div className="flex items-center space-x-2"><Checkbox id="calHolidays" defaultChecked /><Label htmlFor="calHolidays" className="font-normal text-muted-foreground">US Holidays</Label></div>
                    </div>
                    </div>
                </TabsContent>
                <TabsContent value="tasks" className="p-4">
                    <p className="text-muted-foreground text-sm">Task filtering options will go here.</p>
                </TabsContent>
                </Tabs>
            </PlaceholderCard>
          </aside>
        </div>
      </main>

      <Dialog open={isQuickAddEventDialogOpen} onOpenChange={setIsQuickAddEventDialogOpen}>
        <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-md border-border/50">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground">Quick Add Event</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="grid grid-cols-[1fr_auto] items-center gap-4">
                <div className="col-span-1">
                    <Label htmlFor="quickEventTitle" className="sr-only">Title</Label>
                    <Input 
                        id="quickEventTitle" 
                        placeholder="Event Title"
                        value={quickAddEventTitle} 
                        onChange={(e) => setQuickAddEventTitle(e.target.value)} 
                        className="bg-input border-border/50" 
                    />
                </div>
                <div className="col-span-1 flex items-center space-x-2 justify-end">
                    <Checkbox id="quickAllDayEvent" checked={quickAddEventAllDay} onCheckedChange={(checked) => setQuickAddEventAllDay(!!checked)} />
                    <Label htmlFor="quickAllDayEvent" className="font-normal text-muted-foreground text-xs">All day?</Label>
                </div>
            </div>
            <div className="space-y-2">
                <div className="flex items-center text-sm">
                    <CalendarDays className="h-4 w-4 mr-2 text-muted-foreground"/>
                    <span className="text-foreground">
                        {quickAddEventSelectedDate ? format(quickAddEventSelectedDate, 'MMMM d, yyyy') : 'N/A'}
                    </span>
                </div>
                {!quickAddEventAllDay && (
                <div className="flex items-center space-x-2 text-sm">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground"/>
                    <Input 
                        id="quickStartTime" 
                        type="text" 
                        placeholder="Start" 
                        value={quickAddEventStartTime} 
                        onChange={(e) => setQuickAddEventStartTime(e.target.value)} 
                        className="w-28 bg-input border-border/50 h-8 text-xs" 
                    />
                    <span>-</span>
                    <Input 
                        id="quickEndTime" 
                        type="text" 
                        placeholder="End" 
                        value={quickAddEventEndTime} 
                        onChange={(e) => setQuickAddEventEndTime(e.target.value)} 
                        className="w-28 bg-input border-border/50 h-8 text-xs" 
                    />
                </div>
                )}
            </div>
          </div>
          <DialogFooter className="justify-between sm:justify-between">
            <Button variant="link" className="p-0 h-auto text-primary hover:text-primary/80 text-xs" onClick={openFullEventFormFromQuickAdd}>
              Include more details?
            </Button>
            <div className="flex gap-2">
              <DialogClose asChild>
                <Button variant="outline" size="sm">Cancel</Button>
              </DialogClose>
              <Button 
                size="sm"
                className="bg-primary hover:bg-primary/90 text-primary-foreground" 
                onClick={handleSaveQuickEvent}
              >
                Add Event
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddEventDialogOpen} onOpenChange={setIsAddEventDialogOpen}>
        <DialogContent className="sm:max-w-xl md:max-w-2xl lg:max-w-3xl max-h-[90vh] flex flex-col bg-card/95 backdrop-blur-md border-border/50">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground">New Event</DialogTitle>
          </DialogHeader>
          <div className="flex-grow overflow-y-auto pr-2 py-4 space-y-6"> 
            <div><Label htmlFor="eventName-dialog">Event Name</Label><Input id="eventName-dialog" value={fullEventTitle} onChange={(e) => setFullEventTitle(e.target.value)} placeholder="Enter event name..." className="bg-input border-border/50 text-foreground placeholder-muted-foreground focus:ring-primary" /></div>
            <div><Label htmlFor="eventCategory-dialog">Category</Label><div className="flex items-center gap-2"><Select><SelectTrigger id="eventCategory-dialog" className="bg-input border-border/50 text-foreground focus:ring-primary flex-grow"><SelectValue placeholder="Uncategorized" /></SelectTrigger><SelectContent><SelectItem value="uncategorized">Uncategorized</SelectItem><SelectItem value="meeting">Meeting</SelectItem><SelectItem value="client_review">Client Review</SelectItem><SelectItem value="prospect_introduction">Prospect Introduction</SelectItem><SelectItem value="social_event">Social Event</SelectItem><SelectItem value="conference">Conference</SelectItem></SelectContent></Select><Button variant="link" className="p-0 h-auto text-primary hover:text-primary/80 whitespace-nowrap">Edit Categories</Button></div></div>
            <div className="space-y-3"><Label>Date &amp; Time</Label><div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-x-3 gap-y-2 items-center">
              <div className="md:col-span-2"><Input type="text" placeholder="Start Date" value={fullEventStartDate} onChange={(e) => setFullEventStartDate(e.target.value)} aria-label="Start Date" className="bg-input border-border/50 text-foreground placeholder-muted-foreground focus:ring-primary" /></div>
              <div className="sm:col-span-1"><Input type="text" placeholder="Start Time" value={fullEventStartTime} onChange={(e) => setFullEventStartTime(e.target.value)} aria-label="Start Time" className="bg-input border-border/50 text-foreground placeholder-muted-foreground focus:ring-primary" /></div>
              <div className="text-center text-muted-foreground hidden md:block">to</div>
              <div className="md:col-span-2"><Input type="text" placeholder="End Date" value={fullEventEndDate} onChange={(e) => setFullEventEndDate(e.target.value)} aria-label="End Date" className="bg-input border-border/50 text-foreground placeholder-muted-foreground focus:ring-primary" /></div>
              <div className="sm:col-span-1"><Input type="text" placeholder="End Time" value={fullEventEndTime} onChange={(e) => setFullEventEndTime(e.target.value)} aria-label="End Time" className="bg-input border-border/50 text-foreground placeholder-muted-foreground focus:ring-primary" /></div>
            </div></div>
            <div className="flex items-center justify-between sm:justify-start space-x-6">
              <div className="flex items-center space-x-2"><Checkbox id="allDayEvent-dialog" checked={fullEventAllDay} onCheckedChange={(checked) => setFullEventAllDay(!!checked)} /><Label htmlFor="allDayEvent-dialog" className="font-normal text-muted-foreground">All day?</Label></div>
              <div className="flex items-center space-x-2"><Checkbox id="repeatsEvent-dialog" /><Label htmlFor="repeatsEvent-dialog" className="font-normal text-muted-foreground">Repeats?</Label></div>
            </div>
            <div><Label htmlFor="eventStatus-dialog">Status</Label><Select><SelectTrigger id="eventStatus-dialog" className="bg-input border-border/50 text-foreground focus:ring-primary"><SelectValue placeholder="Select status" /></SelectTrigger><SelectContent><SelectItem value="busy">Busy</SelectItem><SelectItem value="free">Free</SelectItem><SelectItem value="tentative">Tentative</SelectItem><SelectItem value="out_of_office">Out of Office</SelectItem></SelectContent></Select></div>
            <div><Label htmlFor="eventLocation-dialog">Location</Label><Input id="eventLocation-dialog" placeholder="Enter location (e.g., Zoom, Office, Conference Room A)" className="bg-input border-border/50 text-foreground placeholder-muted-foreground focus:ring-primary" /></div>
            <div><Label htmlFor="eventDescription-dialog">Description</Label><Textarea id="eventDescription-dialog" rows={5} placeholder="Add event details, agenda, notes..." className="bg-input border-border/50 text-foreground placeholder-muted-foreground focus:ring-primary resize-none" /><div className="flex items-center space-x-1 text-muted-foreground mt-2"><Button variant="ghost" size="icon" className="hover:bg-muted/50 h-8 w-8" aria-label="Bold"><Bold className="h-4 w-4" /></Button><Button variant="ghost" size="icon" className="hover:bg-muted/50 h-8 w-8" aria-label="Italic"><Italic className="h-4 w-4" /></Button><Button variant="ghost" size="icon" className="hover:bg-muted/50 h-8 w-8" aria-label="Underline"><Underline className="h-4 w-4" /></Button><Button variant="ghost" size="icon" className="hover:bg-muted/50 h-8 w-8" aria-label="Bulleted List"><ListChecks className="h-4 w-4" /></Button><Button variant="ghost" size="icon" className="hover:bg-muted/50 h-8 w-8" aria-label="Numbered List"><ListOrdered className="h-4 w-4" /></Button><Button variant="ghost" size="icon" className="hover:bg-muted/50 h-8 w-8" aria-label="Insert Table"><TableIcon className="h-4 w-4" /></Button><Button variant="ghost" size="icon" className="hover:bg-muted/50 h-8 w-8" aria-label="Insert Link"><Link2 className="h-4 w-4" /></Button><Button variant="ghost" size="icon" className="hover:bg-muted/50 h-8 w-8" aria-label="Insert Emoji"><Smile className="h-4 w-4" /></Button><Button variant="ghost" size="icon" className="hover:bg-muted/50 h-8 w-8" aria-label="Voice Note"><Mic className="h-4 w-4" /></Button></div></div>
            <div><Label htmlFor="eventRelatedTo-dialog">Related To</Label><Input id="eventRelatedTo-dialog" placeholder="Contact, project, or opportunity..." className="bg-input border-border/50 text-foreground placeholder-muted-foreground focus:ring-primary" /></div>
            <div><Label htmlFor="eventAttending-dialog">Attending</Label><Input id="eventAttending-dialog" placeholder="Search users or resources..." className="bg-input border-border/50 text-foreground placeholder-muted-foreground focus:ring-primary" /></div>
            <div><Label htmlFor="eventInvite-dialog">Invite</Label><Input id="eventInvite-dialog" placeholder="Search contacts to invite..." className="bg-input border-border/50 text-foreground placeholder-muted-foreground focus:ring-primary" /></div>
            <div className="flex flex-wrap items-center justify-between gap-2"><div className="flex items-center space-x-2"><Checkbox id="sendEventInvitations-dialog" /><Label htmlFor="sendEventInvitations-dialog" className="text-sm font-normal text-muted-foreground">Send email invitations to new invitees and BCC the event creator</Label></div><Button variant="link" className="p-0 h-auto text-primary hover:text-primary/80 text-sm whitespace-nowrap">Preview Invite</Button></div>
          </div>
          <DialogFooter className="pt-4 border-t border-border/30">
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Add Event</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
