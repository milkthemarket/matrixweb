
"use client";

import * as React from 'react';
import { PlaceholderCard } from '@/components/dashboard/PlaceholderCard';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Filter,
  UserCircle,
  PlayCircle,
  PlusCircle,
  Cog,
  Bold,
  Italic,
  Underline,
  ListChecks,
  ListOrdered,
  Link2,
  Table as TableIcon,
  Smile,
  Mic,
  UploadCloud,
  X,
  Settings,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
}

const dummyWorkflowTemplates: WorkflowTemplate[] = [
  { id: 'wt1', name: 'New Client Onboarding', description: 'Step-by-step onboarding of new clients.' },
  { id: 'wt2', name: 'Annual Portfolio Review', description: 'Yearly review of client portfolios.' },
  { id: 'wt3', name: 'Compliance Document Collection', description: 'Gather all compliance docs for client accounts.' },
  { id: 'wt4', name: 'Investment Proposal Approval', description: 'Review and approval process for investment proposals.' },
  { id: 'wt5', name: 'Risk Assessment Update', description: 'Update risk tolerance and suitability forms.' },
  { id: 'wt6', name: 'Beneficiary Update', description: 'Confirm and update account beneficiaries.' },
  { id: 'wt7', name: 'Account Closure Process', description: 'Checklist for closing accounts and final communications.' },
];


export default function ClientPortalWorkflowsPage() {
  const [isAddTemplateDialogOpen, setIsAddTemplateDialogOpen] = React.useState(false);
  const [isAddStepDrawerOpen, setIsAddStepDrawerOpen] = React.useState(false);
  const [templates, setTemplates] = React.useState<WorkflowTemplate[]>(dummyWorkflowTemplates);

  return (
    <>
      <main className="min-h-screen bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#5b21b6]/10 to-[#000104] flex-1 p-6 space-y-8 md:p-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Workflows</h1>
          <div className="flex items-center gap-2">
            <Button variant="link" className="text-primary hover:text-primary/80 p-0 h-auto">
              <Settings className="mr-2 h-4 w-4" /> Manage Templates
            </Button>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <PlayCircle className="mr-2 h-4 w-4" /> Start Workflow
            </Button>
          </div>
        </div>

        {/* Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <Select defaultValue="active">
            <SelectTrigger className="w-full bg-input border-none text-foreground shadow-white-glow-soft hover:shadow-white-glow-hover transition-shadow duration-200 ease-out">
              <Filter className="mr-2 h-4 w-4 text-primary" />
              <SelectValue placeholder="Filtering by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active Workflows</SelectItem>
              <SelectItem value="completed">Completed Workflows</SelectItem>
              <SelectItem value="all_statuses">All Statuses</SelectItem>
            </SelectContent>
          </Select>

          <Select defaultValue="all_workflows">
            <SelectTrigger className="w-full bg-input border-none text-foreground shadow-white-glow-soft hover:shadow-white-glow-hover transition-shadow duration-200 ease-out">
              <PlayCircle className="mr-2 h-4 w-4 text-primary" />
              <SelectValue placeholder="For workflow template" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all_workflows">All Templates</SelectItem>
              {templates.map(template => (
                <SelectItem key={template.id} value={template.id}>{template.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select defaultValue="all_users">
            <SelectTrigger className="w-full bg-input border-none text-foreground shadow-white-glow-soft hover:shadow-white-glow-hover transition-shadow duration-200 ease-out">
              <UserCircle className="mr-2 h-4 w-4 text-primary" />
              <SelectValue placeholder="Assigned to" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all_users">All Users</SelectItem>
              <SelectItem value="josh_b">Josh Bajorek</SelectItem>
              <SelectItem value="user_b">User B</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Main Card Area - Workflow Templates List */}
        <PlaceholderCard title="Workflow Templates" icon={FileText} className="flex-grow p-0">
          <ScrollArea className="h-[calc(50vh-theme(spacing.16))]"> {/* Adjust height as needed */}
            <div className="p-4 md:p-6 space-y-3">
              {templates.length > 0 ? (
                templates.map((template) => (
                  <div key={template.id} className="p-3 rounded-md border border-border/20 hover:bg-muted/10 transition-colors bg-black/30">
                    <h4 className="text-md font-semibold text-foreground">{template.name}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{template.description}</p>
                    <div className="flex justify-end mt-2 space-x-2">
                      <Button variant="ghost" size="sm" className="text-xs h-auto py-1">Edit</Button>
                      <Button variant="default" size="sm" className="text-xs h-auto py-1">Start</Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center py-10">
                  <PlayCircle className="w-16 h-16 text-muted-foreground/50 mb-4" strokeWidth={1.5} />
                  <h3 className="text-lg font-semibold text-foreground mb-1">
                    No workflow templates found.
                  </h3>
                  <p className="text-sm text-muted-foreground">Create one to get started.</p>
                </div>
              )}
            </div>
          </ScrollArea>
           <div className="p-4 md:p-6 border-t border-border/30 flex justify-center">
             <Button
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={() => setIsAddTemplateDialogOpen(true)}
              >
                <PlusCircle className="mr-2 h-4 w-4" /> Add Template
              </Button>
           </div>
        </PlaceholderCard>
      </main>

      {/* Add Workflow Template Dialog */}
      <Dialog open={isAddTemplateDialogOpen} onOpenChange={setIsAddTemplateDialogOpen}>
        <DialogContent className="sm:max-w-xl md:max-w-2xl lg:max-w-3xl max-h-[90vh] flex flex-col bg-card/95 backdrop-blur-md border-border/50">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground">Add a Workflow Template</DialogTitle>
          </DialogHeader>
          <ScrollArea className="flex-grow pr-2 py-4">
            <div className="space-y-6 px-1"> {/* Added px-1 to prevent scrollbar overlap */}
                <div>
                <Label htmlFor="workflowName-dialog">Workflow Name <span className="text-destructive">*</span></Label>
                <Input id="workflowName-dialog" placeholder="Enter workflow name..." className="bg-input border-border/50 text-foreground placeholder-muted-foreground focus:ring-primary" />
                </div>

                <div>
                <Label htmlFor="sequential-dialog">Sequential?</Label>
                <RadioGroup defaultValue="yes" id="sequential-dialog" className="flex items-center space-x-4 mt-1">
                    <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="seq-yes" />
                    <Label htmlFor="seq-yes" className="font-normal text-muted-foreground">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="seq-no" />
                    <Label htmlFor="seq-no" className="font-normal text-muted-foreground">No</Label>
                    </div>
                </RadioGroup>
                </div>

                <div>
                <Label htmlFor="workflowFor-dialog">Workflow For</Label>
                <Select defaultValue="contact">
                    <SelectTrigger id="workflowFor-dialog" className="bg-input border-border/50 text-foreground placeholder-muted-foreground focus:ring-primary">
                    <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="contact">Contact</SelectItem>
                    <SelectItem value="opportunity">Opportunity</SelectItem>
                    <SelectItem value="project">Project</SelectItem>
                    <SelectItem value="service_request">Service Request</SelectItem>
                    </SelectContent>
                </Select>
                </div>

                <div>
                <Label htmlFor="workflowDescription-dialog">Description</Label>
                <Textarea id="workflowDescription-dialog" rows={4} placeholder="Add a description for this workflow..." className="bg-input border-border/50 text-foreground placeholder-muted-foreground focus:ring-primary resize-none" />
                <div className="flex items-center space-x-1 text-muted-foreground mt-2">
                    <Button variant="ghost" size="icon" className="hover:bg-muted/50 h-8 w-8" aria-label="Bold"><Bold className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="hover:bg-muted/50 h-8 w-8" aria-label="Italic"><Italic className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="hover:bg-muted/50 h-8 w-8" aria-label="Underline"><Underline className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="hover:bg-muted/50 h-8 w-8" aria-label="Bulleted List"><ListChecks className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="hover:bg-muted/50 h-8 w-8" aria-label="Numbered List"><ListOrdered className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="hover:bg-muted/50 h-8 w-8" aria-label="Insert Table"><TableIcon className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="hover:bg-muted/50 h-8 w-8" aria-label="Insert Link"><Link2 className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="hover:bg-muted/50 h-8 w-8" aria-label="Insert Emoji"><Smile className="h-4 w-4" /></Button>
                </div>
                </div>

                <div className="pt-4 border-t border-border/30">
                <Label className="text-base font-semibold text-foreground">STEPS</Label>
                <div className="mt-2">
                    <Button
                        variant="link"
                        className="p-0 h-auto text-primary hover:text-primary/80"
                        onClick={() => setIsAddStepDrawerOpen(true)}
                    >
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Step
                    </Button>
                    <p className="text-sm text-muted-foreground mt-2 italic">No steps added yet.</p>
                </div>
                </div>
            </div>
          </ScrollArea>
          <DialogFooter className="pt-4 border-t border-border/30 flex justify-between items-center w-full">
            <div className="flex items-center space-x-2">
              <Checkbox id="published-dialog" defaultChecked />
              <Label htmlFor="published-dialog" className="font-normal text-muted-foreground">Published?</Label>
            </div>
            <div className="space-x-2">
              <DialogClose asChild>
                 <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Save Template</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Workflow Step Drawer */}
      <Sheet open={isAddStepDrawerOpen} onOpenChange={setIsAddStepDrawerOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md md:max-w-lg lg:max-w-xl bg-card/95 backdrop-blur-md border-border/50 text-foreground">
          <SheetHeader>
            <SheetTitle className="text-xl font-bold text-foreground">Add Workflow Step</SheetTitle>
            <SheetClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </SheetClose>
          </SheetHeader>
          <ScrollArea className="h-[calc(100vh-140px)] mt-4 pr-4"> {/* Adjust height as needed */}
            <div className="space-y-6 py-2">
              <div>
                <Label htmlFor="stepName-drawer">Step Name</Label>
                <Input id="stepName-drawer" placeholder="Enter step name..." className="bg-input border-border/50 text-foreground placeholder-muted-foreground focus:ring-primary" />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="setDueDate-drawer" defaultChecked />
                <Label htmlFor="setDueDate-drawer" className="font-normal text-muted-foreground">Set Due Date</Label>
              </div>

              <div>
                <Label htmlFor="basedOn-drawer">Based On</Label>
                <Select defaultValue="default_start">
                  <SelectTrigger id="basedOn-drawer" className="bg-input border-border/50 text-foreground placeholder-muted-foreground focus:ring-primary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default_start">Default (Workflow Start or Previous Step Completed)</SelectItem>
                    <SelectItem value="event_date">Event Date</SelectItem>
                    <SelectItem value="custom_date_field">Custom Date Field</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Due</Label>
                <div className="flex items-center space-x-2">
                  <Input type="number" defaultValue="1" className="w-16 bg-input border-border/50 text-foreground placeholder-muted-foreground focus:ring-primary" />
                  <Select defaultValue="days">
                    <SelectTrigger className="w-[100px] bg-input border-border/50 text-foreground focus:ring-primary"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="days">days</SelectItem><SelectItem value="hours">hours</SelectItem>
                      <SelectItem value="weeks">weeks</SelectItem><SelectItem value="months">months</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select defaultValue="after">
                    <SelectTrigger className="w-[100px] bg-input border-border/50 text-foreground focus:ring-primary"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="after">after</SelectItem><SelectItem value="before">before</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input type="text" placeholder="12:30 PM" className="w-24 bg-input border-border/50 text-foreground placeholder-muted-foreground focus:ring-primary" />
                </div>
              </div>

              <div>
                <Label htmlFor="stepAssignedTo-drawer">Step Assigned To</Label>
                <Select defaultValue="contact_owner">
                  <SelectTrigger id="stepAssignedTo-drawer" className="bg-input border-border/50 text-foreground placeholder-muted-foreground focus:ring-primary"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="contact_owner">Contact Owner</SelectItem>
                    <SelectItem value="specific_user">Specific User</SelectItem>
                    <SelectItem value="role">Role</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="stepPriority-drawer">Step Priority</Label>
                <Select defaultValue="none">
                  <SelectTrigger id="stepPriority-drawer" className="bg-input border-border/50 text-foreground placeholder-muted-foreground focus:ring-primary"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="stepCategory-drawer">Category</Label>
                <Select>
                  <SelectTrigger id="stepCategory-drawer" className="bg-input border-border/50 text-foreground placeholder-muted-foreground focus:ring-primary"><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="client_communication">Client Communication</SelectItem>
                    <SelectItem value="internal_review">Internal Review</SelectItem>
                    <SelectItem value="documentation">Documentation</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="stepDescription-drawer">Step Description</Label>
                <Textarea id="stepDescription-drawer" rows={4} placeholder="Enter step description..." className="bg-input border-border/50 text-foreground placeholder-muted-foreground focus:ring-primary resize-none" />
                <div className="flex items-center space-x-1 text-muted-foreground mt-2">
                    <Button variant="ghost" size="icon" className="hover:bg-muted/50 h-8 w-8" aria-label="Bold"><Bold className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="hover:bg-muted/50 h-8 w-8" aria-label="Italic"><Italic className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="hover:bg-muted/50 h-8 w-8" aria-label="Underline"><Underline className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="hover:bg-muted/50 h-8 w-8" aria-label="Bulleted List"><ListChecks className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="hover:bg-muted/50 h-8 w-8" aria-label="Numbered List"><ListOrdered className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="hover:bg-muted/50 h-8 w-8" aria-label="Insert Link"><Link2 className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="hover:bg-muted/50 h-8 w-8" aria-label="Insert Emoji"><Smile className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="hover:bg-muted/50 h-8 w-8" aria-label="Voice Note"><Mic className="h-4 w-4" /></Button>
                </div>
              </div>

              <div>
                <Label htmlFor="stepAttachments-drawer">File Attachments</Label>
                <div className="mt-1 flex justify-center items-center px-6 pt-5 pb-6 border-2 border-border/50 border-dashed rounded-md bg-input/50 cursor-pointer hover:border-primary/70 transition-colors">
                  <div className="space-y-1 text-center">
                    <UploadCloud className="mx-auto h-10 w-10 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium text-primary">Drag files here</span> or click to upload
                    </p>
                    <p className="text-xs text-muted-foreground/70">PDF, DOCX, JPG up to 10MB</p>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
          <SheetFooter className="pt-4 border-t border-border/30">
            <SheetClose asChild>
                <Button variant="outline">Cancel</Button>
            </SheetClose>
            <Button className="bg-green-600 hover:bg-green-700 text-white">Add Step</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
