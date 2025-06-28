
"use client";

import * as React from 'react';
import { PlaceholderCard } from '@/components/dashboard/PlaceholderCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from '@/components/ui/textarea';
import { PageHeader } from '@/components/PageHeader';

import {
  MessageSquare,
  UserPlus,
  ListChecks,
  CalendarPlus,
  Briefcase,
  FilePenLine,
  Trash2,
  UploadCloud,
  CalendarDays,
  Clock,
  PlayCircle,
  Star,
  CircleDollarSign,
  UserCircle2,
  Settings,
  MoreHorizontal,
  Filter as FilterIcon,
  Tag as TagIcon,
  KanbanSquare,
  FileText,
  BarChart2,
  ChevronDown,
} from "lucide-react";


export default function CrmHomePage() {
  const [updatePostText, setUpdatePostText] = React.useState("");

  return (
    <div className="flex flex-col flex-1 h-full overflow-hidden">
      <PageHeader title="Home" />
      <div className="flex-1 p-4 md:p-6 space-y-6 overflow-y-auto">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2 w-full">
            <PlaceholderCard title="Create New">
              <Tabs defaultValue="update" className="w-full">
                <TabsList className="grid w-full grid-cols-5 bg-muted/10">
                  <TabsTrigger value="update">
                    <MessageSquare className="mr-2 h-4 w-4" /> Update
                  </TabsTrigger>
                  <TabsTrigger value="contact">
                    <UserPlus className="mr-2 h-4 w-4" /> Contact
                  </TabsTrigger>
                  <TabsTrigger value="task">
                    <ListChecks className="mr-2 h-4 w-4" /> Task
                  </TabsTrigger>
                  <TabsTrigger value="event">
                    <CalendarPlus className="mr-2 h-4 w-4" /> Event
                  </TabsTrigger>
                  <TabsTrigger value="opportunity">
                    <Briefcase className="mr-2 h-4 w-4" /> Opportunity
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="update" className="pt-4">
                    <div className="space-y-4">
                        <Textarea 
                            placeholder="Share an update with your team..."
                            value={updatePostText}
                            onChange={(e) => setUpdatePostText(e.target.value)}
                            rows={4}
                        />
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="icon" className="h-8 w-8"><UploadCloud className="h-4 w-4" /></Button>
                                <Button variant="outline" size="icon" className="h-8 w-8"><TagIcon className="h-4 w-4" /></Button>
                            </div>
                            <Button>Post Update</Button>
                        </div>
                    </div>
                </TabsContent>
                <TabsContent value="contact" className="pt-4">
                   <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label htmlFor="firstName">First Name</Label>
                                <Input id="firstName" placeholder="John" />
                            </div>
                             <div className="space-y-1">
                                <Label htmlFor="lastName">Last Name</Label>
                                <Input id="lastName" placeholder="Doe" />
                            </div>
                        </div>
                         <div className="space-y-1">
                            <Label htmlFor="email">Email Address</Label>
                            <Input id="email" type="email" placeholder="john.doe@example.com" />
                        </div>
                         <div className="space-y-1">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input id="phone" type="tel" placeholder="(555) 123-4567" />
                        </div>
                        <div className="flex justify-end">
                            <Button>Create Contact</Button>
                        </div>
                   </div>
                </TabsContent>
                 <TabsContent value="task" className="pt-4">
                    <div className="space-y-4">
                         <div className="space-y-1">
                            <Label htmlFor="taskName">Task Name</Label>
                            <Input id="taskName" placeholder="Follow up with..." />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-1">
                                <Label htmlFor="assignee">Assign To</Label>
                                <Select>
                                    <SelectTrigger id="assignee"><SelectValue placeholder="Select team member" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="josh">Josh</SelectItem>
                                        <SelectItem value="sarah">Sarah</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="dueDate">Due Date</Label>
                                <Input id="dueDate" type="date" />
                            </div>
                        </div>
                         <div className="space-y-1">
                            <Label htmlFor="taskDescription">Description</Label>
                            <Textarea id="taskDescription" placeholder="Add details about the task..." />
                        </div>
                         <div className="flex justify-end">
                            <Button>Create Task</Button>
                        </div>
                    </div>
                 </TabsContent>
                <TabsContent value="event" className="pt-4">
                     <div className="space-y-4">
                         <div className="space-y-1">
                            <Label htmlFor="eventName">Event Name</Label>
                            <Input id="eventName" placeholder="Client Meeting" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-1">
                                <Label htmlFor="eventDate">Date</Label>
                                <Input id="eventDate" type="date" />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="eventTime">Time</Label>
                                <Input id="eventTime" type="time" />
                            </div>
                        </div>
                         <div className="space-y-1">
                            <Label htmlFor="attendees">Attendees</Label>
                            <Input id="attendees" placeholder="Invite by email..." />
                        </div>
                         <div className="flex justify-end">
                            <Button>Schedule Event</Button>
                        </div>
                    </div>
                </TabsContent>
                 <TabsContent value="opportunity" className="pt-4">
                    <div className="space-y-4">
                         <div className="space-y-1">
                            <Label htmlFor="oppName">Opportunity Name</Label>
                            <Input id="oppName" placeholder="e.g., Q3 Portfolio Review" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-1">
                                <Label htmlFor="oppStage">Stage</Label>
                                <Select>
                                    <SelectTrigger id="oppStage"><SelectValue placeholder="Select stage" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="prospecting">Prospecting</SelectItem>
                                        <SelectItem value="proposal">Proposal Sent</SelectItem>
                                        <SelectItem value="negotiation">Negotiation</SelectItem>
                                         <SelectItem value="closed-won">Closed Won</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="oppValue">Value ($)</Label>
                                <Input id="oppValue" type="number" placeholder="5,000" />
                            </div>
                        </div>
                         <div className="space-y-1">
                            <Label htmlFor="relatedContact">Related Contact</Label>
                            <Input id="relatedContact" placeholder="Search contacts..." />
                        </div>
                         <div className="flex justify-end">
                            <Button>Create Opportunity</Button>
                        </div>
                    </div>
                 </TabsContent>

              </Tabs>
            </PlaceholderCard>
          </div>

          <div className="lg:col-span-1 space-y-6 lg:space-y-8">
            <PlaceholderCard title="Events" icon={CalendarDays} headerActions={<Button variant="link" size="sm" className="text-primary hover:text-primary/80 p-0 h-auto">View All</Button>}>
              <div className="flex flex-col items-center justify-center h-full text-center p-6">
                <CalendarDays className="w-16 h-16 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">You have no events for today or tomorrow.</p>
              </div>
            </PlaceholderCard>
            <PlaceholderCard title="Workflows" icon={PlayCircle} headerActions={ <Button variant="link" size="sm" className="text-primary hover:text-primary/80 p-0 h-auto"> View All </Button> } >
              <div className="flex flex-col items-center justify-center h-full text-center p-6">
                <PlayCircle className="w-16 h-16 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">You have no workflows in progress.</p>
              </div>
            </PlaceholderCard>
            <PlaceholderCard title="Tasks" icon={ListChecks} headerActions={<Button variant="link" size="sm" className="text-primary hover:text-primary/80 p-0 h-auto">View All</Button>}>
              <div className="flex flex-col items-center justify-center h-full text-center p-6">
                <ListChecks className="w-16 h-16 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">You have no tasks for this week.</p>
              </div>
            </PlaceholderCard>
            <PlaceholderCard title="Special Dates (next 7 days)" icon={Star} headerActions={<Button variant="link" size="sm" className="text-primary hover:text-primary/80 p-0 h-auto">View Calendar</Button>}>
              <div className="flex flex-col items-center justify-center h-full text-center p-6">
                <Star className="w-16 h-16 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">You have no contacts with special dates in the next week.</p>
              </div>
            </PlaceholderCard>
            <PlaceholderCard title="Opportunities (next 30 days)" icon={CircleDollarSign} headerActions={<Button variant="link" size="sm" className="text-primary hover:text-primary/80 p-0 h-auto">View Pipeline</Button>}>
              <div className="flex flex-col items-center justify-center h-full text-center p-6">
                <CircleDollarSign className="w-16 h-16 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">You have no open opportunities in the next 30 days.</p>
              </div>
            </PlaceholderCard>
          </div>
        </div>
      </div>
    </div>
  );
}
