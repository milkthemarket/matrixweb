"use client";

import * as React from 'react';
import { PlaceholderCard } from '@/components/dashboard/PlaceholderCard';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from "@/hooks/use-toast";
import { format, formatDistanceToNowStrict, parseISO, isValid as isValidDate } from 'date-fns';
import { 
  MoreHorizontal, 
  ListChecks, 
  Filter as FilterIcon, 
  UserCircle, 
  Tag, 
  FilePenLine, 
  Bold, 
  Italic, 
  Underline, 
  Link2, 
  Table as TableIcon, 
  Smile, 
  Mic, 
  UploadCloud, 
  ListOrdered,
  Trash2,
  CalendarDays,
  Loader2 // Added Loader2 import
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskItem {
  id: string;
  name: string;
  repeats: boolean;
  dueDate: string; 
  dueTime?: string;
  priority: string;
  category: string;
  description: string;
  relatedTo: string;
  createdAt: Date;
}

const getPriorityBadgeClass = (priority: string): string => {
  switch (priority.toLowerCase()) {
    case "high":
      return "bg-red-500/20 border-red-500/50 text-red-400";
    case "medium":
      return "bg-yellow-500/20 border-yellow-500/50 text-yellow-400";
    case "low":
      return "bg-green-500/20 border-green-500/50 text-green-400";
    default:
      return "bg-muted text-muted-foreground";
  }
};

export default function ClientPortalTasksPage() {
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = React.useState(false);
  const [tasks, setTasks] = React.useState<TaskItem[]>([]);
  const { toast } = useToast();

  // State for Add Task Dialog fields
  const [taskName, setTaskName] = React.useState('');
  const [taskRepeats, setTaskRepeats] = React.useState(false);
  const [taskDue, setTaskDue] = React.useState('today');
  const [taskDueCustomDate, setTaskDueCustomDate] = React.useState('');
  const [taskDueCustomTime, setTaskDueCustomTime] = React.useState('');
  const [taskPriority, setTaskPriority] = React.useState('medium');
  const [taskCategory, setTaskCategory] = React.useState('');
  const [taskDescription, setTaskDescription] = React.useState('');
  const [taskRelatedTo, setTaskRelatedTo] = React.useState('');
  const [isSavingTask, setIsSavingTask] = React.useState(false);

  const resetTaskForm = () => {
    setTaskName('');
    setTaskRepeats(false);
    setTaskDue('today');
    setTaskDueCustomDate('');
    setTaskDueCustomTime('');
    setTaskPriority('medium');
    setTaskCategory('');
    setTaskDescription('');
    setTaskRelatedTo('');
  };

  const handleAddTask = async () => {
    if (!taskName.trim()) {
      toast({
        title: "Validation Error",
        description: "Task Name is required.",
        variant: "destructive",
      });
      return;
    }

    setIsSavingTask(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 700));

    let finalDueDate = taskDue;
    if (taskDue === 'custom' && taskDueCustomDate && isValidDate(parseISO(taskDueCustomDate))) {
      finalDueDate = taskDueCustomDate;
    } else if (taskDue === 'custom' && !taskDueCustomDate) {
      finalDueDate = 'No Due Date'; // Handle case where custom is selected but no date is provided
    }


    const newTask: TaskItem = {
      id: Date.now().toString(),
      name: taskName,
      repeats: taskRepeats,
      dueDate: finalDueDate,
      dueTime: taskDue === 'custom' ? taskDueCustomTime : undefined,
      priority: taskPriority,
      category: taskCategory || 'Uncategorized',
      description: taskDescription,
      relatedTo: taskRelatedTo,
      createdAt: new Date(),
    };

    setTasks(prevTasks => [newTask, ...prevTasks].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
    toast({
      title: "Task Created",
      description: `"${newTask.name}" has been successfully added.`,
    });
    resetTaskForm();
    setIsAddTaskDialogOpen(false);
    setIsSavingTask(false);
  };
  
  const formatDueDateDisplay = (task: TaskItem) => {
    if (task.dueDate === 'today') return 'Today';
    if (task.dueDate === 'tomorrow') return 'Tomorrow';
    if (task.dueDate === 'next_week') return 'Next Week';
    if (task.dueDate === 'No Due Date') return 'No Due Date';
    
    try {
      if (isValidDate(parseISO(task.dueDate))) {
        let dateStr = format(parseISO(task.dueDate), 'MMM dd, yyyy');
        if (task.dueTime) {
          // Basic time formatting, can be enhanced with date-fns if more complex parsing/formatting is needed
          const [hour, minute] = task.dueTime.split(':');
          const hourNum = parseInt(hour, 10);
          const ampm = hourNum >= 12 ? 'PM' : 'AM';
          const displayHour = hourNum % 12 || 12;
          dateStr += ` at ${displayHour}:${minute} ${ampm}`;
        }
        return dateStr;
      }
    } catch (e) {
      // Fallback for any unexpected date string format
      return task.dueDate; 
    }
    return task.dueDate; // Fallback
  };


  return (
    <>
      <main className="min-h-screen bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#5b21b6]/10 to-[#000104] flex-1 p-6 space-y-8 md:p-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Tasks</h1>
            <span className="text-muted-foreground">({tasks.length} tasks)</span>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-auto py-1.5 px-3">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Options</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Manage Task Types</DropdownMenuItem>
                <DropdownMenuItem>Archived Tasks</DropdownMenuItem>
                <DropdownMenuItem>Export Tasks</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button 
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={() => setIsAddTaskDialogOpen(true)}
            >
              <ListChecks className="mr-2 h-4 w-4" /> Add Task
            </Button>
          </div>
        </div>

        {/* Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Select defaultValue="upcoming">
            <SelectTrigger className="w-full bg-card border-none text-foreground shadow-white-glow-soft hover:shadow-white-glow-hover transition-shadow duration-200 ease-out">
              <FilterIcon className="mr-2 h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Filter by date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="all">All Tasks</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="this_week">This Week</SelectItem>
            </SelectContent>
          </Select>

          <Select defaultValue="all_tasks">
            <SelectTrigger className="w-full bg-card border-none text-foreground shadow-white-glow-soft hover:shadow-white-glow-hover transition-shadow duration-200 ease-out">
              <ListChecks className="mr-2 h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all_tasks">All Tasks</SelectItem>
              <SelectItem value="calls">Calls</SelectItem>
              <SelectItem value="emails">Emails</SelectItem>
              <SelectItem value="meetings">Meetings</SelectItem>
              <SelectItem value="follow_ups">Follow-ups</SelectItem>
            </SelectContent>
          </Select>

          <Select defaultValue="current_user">
            <SelectTrigger className="w-full bg-card border-none text-foreground shadow-white-glow-soft hover:shadow-white-glow-hover transition-shadow duration-200 ease-out">
              <UserCircle className="mr-2 h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Assigned to" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current_user">Josh Bajorek (Me)</SelectItem>
              <SelectItem value="user_a">User A</SelectItem>
              <SelectItem value="user_b">User B</SelectItem>
            </SelectContent>
          </Select>

          <Select defaultValue="all_categories">
            <SelectTrigger className="w-full bg-card border-none text-foreground shadow-white-glow-soft hover:shadow-white-glow-hover transition-shadow duration-200 ease-out">
              <Tag className="mr-2 h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="In category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all_categories">All Categories</SelectItem>
              <SelectItem value="category_1">Client Review</SelectItem>
              <SelectItem value="category_2">Prospecting</SelectItem>
              <SelectItem value="category_3">Compliance</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Main Card - Task List Area */}
        <PlaceholderCard title="" className="flex-grow p-0 bg-card/90 backdrop-blur-md border border-white/10">
          {tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[40vh] text-center p-6">
              <ListChecks className="w-20 h-20 text-muted-foreground/50 mb-6" strokeWidth={1.5} />
              <h3 className="text-xl font-semibold text-foreground mb-2">No tasks match the selected criteria.</h3>
              <p className="text-muted-foreground">Try adjusting your filters or adding a new task.</p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {tasks.map(task => (
                <div key={task.id} className="p-3 rounded-md border border-border/20 hover:bg-muted/10 transition-colors bg-black/30">
                  <div className="flex justify-between items-start">
                    <h4 className="text-md font-semibold text-foreground">{task.name}</h4>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Due: {formatDueDateDisplay(task)} | Category: <span className="font-medium">{task.category}</span>
                  </p>
                  {task.description && <p className="text-sm text-foreground/80 mt-1 truncate">{task.description}</p>}
                  {task.relatedTo && <p className="text-xs text-muted-foreground mt-0.5">Related to: {task.relatedTo}</p>}
                   <div className="flex items-center justify-between mt-2">
                     <span className={cn("px-2 py-0.5 text-xs font-semibold rounded-full border", getPriorityBadgeClass(task.priority))}>
                        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                    </span>
                    <p className="text-xs text-muted-foreground/70">
                        Created {formatDistanceToNowStrict(task.createdAt, { addSuffix: true })}
                    </p>
                   </div>
                </div>
              ))}
            </div>
          )}
        </PlaceholderCard>
      </main>

      <Dialog open={isAddTaskDialogOpen} onOpenChange={setIsAddTaskDialogOpen}>
        <DialogContent className="sm:max-w-xl md:max-w-2xl lg:max-w-3xl max-h-[90vh] flex flex-col bg-card/95 backdrop-blur-md border-border/50">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground">New Task</DialogTitle>
          </DialogHeader>
          <div className="flex-grow overflow-y-auto pr-2 py-4 space-y-6">
            <div>
              <Label htmlFor="taskName-dialog">Task Name</Label>
              <div className="relative">
                <Input 
                  id="taskName-dialog" 
                  placeholder="Enter task name..." 
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
                  className="bg-input border-border/50 text-foreground placeholder-muted-foreground focus:ring-primary pr-10" 
                />
                <FilePenLine className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="repeatsTask-dialog" 
                checked={taskRepeats}
                onCheckedChange={(checked) => setTaskRepeats(!!checked)}
              />
              <Label htmlFor="repeatsTask-dialog" className="font-normal text-muted-foreground">Repeats?</Label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
              <div>
                <Label htmlFor="taskDue-dialog">Due</Label>
                <div className="flex items-center gap-2">
                  <Select value={taskDue} onValueChange={setTaskDue}>
                    <SelectTrigger id="taskDue-dialog" className="bg-input border-border/50 text-foreground focus:ring-primary flex-grow">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="tomorrow">Tomorrow</SelectItem>
                      <SelectItem value="next_week">Next Week</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="link" className="p-0 h-auto text-primary hover:text-primary/80 whitespace-nowrap">Set Date/Time</Button>
                </div>
                 {taskDue === 'custom' && (
                    <div className="grid grid-cols-2 gap-2 mt-2">
                        <Input type="date" value={taskDueCustomDate} onChange={(e) => setTaskDueCustomDate(e.target.value)} className="bg-input border-border/50"/>
                        <Input type="time" value={taskDueCustomTime} onChange={(e) => setTaskDueCustomTime(e.target.value)} className="bg-input border-border/50"/>
                    </div>
                 )}
              </div>
              <div>
                <Label htmlFor="taskPriority-dialog">Priority</Label>
                <Select value={taskPriority} onValueChange={setTaskPriority}>
                  <SelectTrigger id="taskPriority-dialog" className="bg-input border-border/50 text-foreground focus:ring-primary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="taskCategory-dialog">Category</Label>
              <div className="flex items-center gap-2">
                <Select value={taskCategory} onValueChange={setTaskCategory}>
                  <SelectTrigger id="taskCategory-dialog" className="bg-input border-border/50 text-foreground focus:ring-primary flex-grow">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="meeting_prep">Meeting Prep</SelectItem>
                    <SelectItem value="follow_up">Follow Up</SelectItem>
                    <SelectItem value="paperwork">Paperwork</SelectItem>
                    <SelectItem value="documentation">Documentation</SelectItem>
                    <SelectItem value="client_communication">Client Communication</SelectItem>
                    <SelectItem value="internal_review">Internal Review</SelectItem>
                    <SelectItem value="uncategorized">Uncategorized</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="link" className="p-0 h-auto text-primary hover:text-primary/80 whitespace-nowrap">Edit Categories</Button>
              </div>
            </div>

            <div>
              <Label htmlFor="taskDescription-dialog">Description</Label>
              <Textarea 
                id="taskDescription-dialog" 
                rows={5} 
                placeholder="Add more details..." 
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                className="bg-input border-border/50 text-foreground placeholder-muted-foreground focus:ring-primary resize-none" 
              />
              <div className="flex items-center space-x-1 text-muted-foreground mt-2">
                <Button variant="ghost" size="icon" className="hover:bg-muted/50 h-8 w-8" aria-label="Bold"><Bold className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="hover:bg-muted/50 h-8 w-8" aria-label="Italic"><Italic className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="hover:bg-muted/50 h-8 w-8" aria-label="Underline"><Underline className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="hover:bg-muted/50 h-8 w-8" aria-label="Bulleted List"><ListChecks className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="hover:bg-muted/50 h-8 w-8" aria-label="Numbered List"><ListOrdered className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="hover:bg-muted/50 h-8 w-8" aria-label="Insert Table"><TableIcon className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="hover:bg-muted/50 h-8 w-8" aria-label="Insert Link"><Link2 className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="hover:bg-muted/50 h-8 w-8" aria-label="Insert Emoji"><Smile className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="hover:bg-muted/50 h-8 w-8" aria-label="Voice Note"><Mic className="h-4 w-4" /></Button>
              </div>
            </div>

            <div>
              <Label htmlFor="taskAttachments-dialog">Attachments</Label>
              <div className="mt-1 flex justify-center items-center px-6 pt-5 pb-6 border-2 border-border/50 border-dashed rounded-md bg-input/50 cursor-pointer hover:border-primary/70 transition-colors">
                <div className="space-y-1 text-center">
                  <UploadCloud className="mx-auto h-10 w-10 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-primary">Drag files here</span> or click to upload
                  </p>
                  <p className="text-xs text-muted-foreground/70">PNG, JPG, PDF up to 10MB</p>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="taskRelatedTo-dialog">Related To</Label>
              <Input 
                id="taskRelatedTo-dialog" 
                placeholder="Contact, project, or opportunity..." 
                value={taskRelatedTo}
                onChange={(e) => setTaskRelatedTo(e.target.value)}
                className="bg-input border-border/50 text-foreground placeholder-muted-foreground focus:ring-primary" 
              />
            </div>
          </div>
          <DialogFooter className="pt-4 border-t border-border/30">
            <DialogClose asChild>
              <Button variant="outline" onClick={resetTaskForm}>Cancel</Button>
            </DialogClose>
            <Button 
              className="bg-primary hover:bg-primary/90 text-primary-foreground" 
              onClick={handleAddTask}
              disabled={isSavingTask}
            >
              {isSavingTask && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

    
