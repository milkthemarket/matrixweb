"use client";

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { PlaceholderCard } from '@/components/dashboard/PlaceholderCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from "@/hooks/use-toast";
import { MoreHorizontal, PlusCircle, KanbanSquare as ProjectsIcon, Briefcase, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
}

export default function ClientPortalProjectsPage() {
  const [activeSort, setActiveSort] = React.useState("Recent");
  const [isAddProjectDialogOpen, setIsAddProjectDialogOpen] = React.useState(false);
  const [projectName, setProjectName] = React.useState("");
  const [projectDescription, setProjectDescription] = React.useState("");
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [isSavingProject, setIsSavingProject] = React.useState(false);
  const { toast } = useToast();

  const resetProjectForm = () => {
    setProjectName("");
    setProjectDescription("");
  };

  const handleAddProject = async () => {
    if (!projectName.trim()) {
      toast({
        title: "Validation Error",
        description: "Project Name is required.",
        variant: "destructive",
      });
      return;
    }

    setIsSavingProject(true);
    // Simulate API call/save
    await new Promise(resolve => setTimeout(resolve, 700));

    const newProject: Project = {
      id: Date.now().toString(),
      name: projectName.trim(),
      description: projectDescription.trim(),
      createdAt: new Date(),
    };

    setProjects(prevProjects => [newProject, ...prevProjects]);
    toast({
      title: "Project Created",
      description: `"${newProject.name}" has been successfully added.`,
    });
    resetProjectForm();
    setIsAddProjectDialogOpen(false);
    setIsSavingProject(false);
  };


  return (
    <>
      <main className="min-h-screen bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#5b21b6]/10 to-[#000104] flex-1 p-6 space-y-6 md:p-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Projects</h1>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-auto py-1.5 px-3">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Options</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Manage Project Types</DropdownMenuItem>
                <DropdownMenuItem>Import Projects</DropdownMenuItem>
                <DropdownMenuItem>Export Projects</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button 
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={() => setIsAddProjectDialogOpen(true)}
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Add Project
            </Button>
          </div>
        </div>

        {/* Tabs and Sort Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <Tabs defaultValue="active" className="w-full sm:w-auto">
            <TabsList className="bg-muted/30">
              <TabsTrigger value="active" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                Active
              </TabsTrigger>
              <TabsTrigger value="archived" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                Archived
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <span>Order:</span>
            {["Recent", "A-Z", "Z-A"].map((sort) => (
              <Button
                key={sort}
                variant={activeSort === sort ? "default" : "ghost"}
                size="sm"
                className={`px-2 py-1 h-auto text-xs ${activeSort === sort ? 'bg-primary/80 text-primary-foreground' : 'hover:bg-muted/50'}`}
                onClick={() => setActiveSort(sort)}
              >
                {sort}
              </Button>
            ))}
          </div>
        </div>
        
        <Tabs defaultValue="active" className="w-full">
          <TabsContent value="active">
            {projects.length === 0 ? (
               <PlaceholderCard title="" className="flex-grow p-0 min-h-[40vh] md:min-h-[50vh]">
                 <div className="flex flex-col items-center justify-center h-full text-center p-6">
                    <ProjectsIcon className="w-20 h-20 text-muted-foreground/50 mb-6" strokeWidth={1.5} />
                    <h3 className="text-xl font-semibold text-foreground mb-2">To get started, add a project.</h3>
                    <Button 
                        className="mt-4 bg-primary hover:bg-primary/90 text-primary-foreground"
                        onClick={() => setIsAddProjectDialogOpen(true)}
                    >
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Project
                    </Button>
                 </div>
               </PlaceholderCard>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map(project => (
                  <PlaceholderCard key={project.id} title={project.name} icon={ProjectsIcon}>
                    <p className="text-sm text-muted-foreground mb-2 truncate">{project.description || "No description."}</p>
                    <p className="text-xs text-muted-foreground/70">Created: {format(project.createdAt, "MMM dd, yyyy")}</p>
                  </PlaceholderCard>
                ))}
              </div>
            )}
          </TabsContent>
          <TabsContent value="archived">
             <PlaceholderCard title="" className="flex-grow p-0 min-h-[40vh] md:min-h-[50vh]">
               <div className="flex flex-col items-center justify-center h-full text-center p-6">
                  <ProjectsIcon className="w-20 h-20 text-muted-foreground/50 mb-6" strokeWidth={1.5} />
                  <h3 className="text-xl font-semibold text-foreground mb-2">No archived projects found.</h3>
               </div>
             </PlaceholderCard>
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={isAddProjectDialogOpen} onOpenChange={setIsAddProjectDialogOpen}>
        <DialogContent className="sm:max-w-lg bg-card/95 backdrop-blur-md border-border/50">
          <DialogHeader className="flex-row items-center space-x-2">
            <Briefcase className="h-5 w-5 text-primary" />
            <DialogTitle className="text-xl font-bold text-foreground">Add a new project</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-6">
            <div>
              <Label htmlFor="projectName-dialog">Project Name <span className="text-destructive">*</span></Label>
              <Input 
                id="projectName-dialog" 
                placeholder="Enter project name..." 
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="bg-input border-border/50 text-foreground placeholder-muted-foreground focus:ring-primary text-lg" 
              />
            </div>
            <div>
              <Label htmlFor="projectDescription-dialog">Project Description</Label>
              <Textarea 
                id="projectDescription-dialog" 
                rows={5} 
                placeholder="Add a description for this project (optional)..." 
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                className="bg-input border-border/50 text-foreground placeholder-muted-foreground focus:ring-primary resize-none" 
              />
            </div>
          </div>
          <DialogFooter className="pt-4 border-t border-border/30">
            <DialogClose asChild>
              <Button variant="outline" onClick={resetProjectForm}>Cancel</Button>
            </DialogClose>
            <Button 
              className="bg-primary hover:bg-primary/90 text-primary-foreground" 
              onClick={handleAddProject}
              disabled={!projectName.trim() || isSavingProject}
            >
              {isSavingProject && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
