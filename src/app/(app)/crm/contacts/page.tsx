
"use client";

import * as React from 'react';
import { PlaceholderCard } from '@/components/dashboard/PlaceholderCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Filter, UserPlus, MoreHorizontal, Tags as TagsIcon, UploadCloud, Trash2 } from 'lucide-react';
import { cn } from "@/lib/utils";

interface Contact {
  id: string;
  name: string;
  phone: string;
  email: string;
  tags: string[];
}

const mockContacts: Contact[] = [
  { id: '1', name: 'John Smith', phone: '555-123-4567', email: 'john.smith@email.com', tags: ['Client'] },
  { id: '2', name: 'Jane Doe', phone: '555-234-5678', email: 'jane.doe@email.com', tags: ['Prospect'] },
  { id: '3', name: 'Alex Johnson', phone: '555-345-6789', email: 'alexj@email.com', tags: ['Lead', 'VIP'] },
  { id: '4', name: 'Emily Brown', phone: '555-456-7890', email: 'emilyb@email.com', tags: ['Client'] },
  { id: '5', name: 'Michael Davis', phone: '555-567-8901', email: 'mike.davis@email.com', tags: ['Prospect'] },
  { id: '6', name: 'Sarah Miller', phone: '555-678-9012', email: 'sarahm@email.com', tags: ['Client', 'Referred'] },
  { id: '7', name: 'Chris Wilson', phone: '555-789-0123', email: 'chrisw@email.com', tags: [] },
  { id: '8', name: 'Lisa Anderson', phone: '555-890-1234', email: 'lisa.a@email.com', tags: ['Lead'] },
  { id: '9', name: 'David Lee', phone: '555-901-2345', email: 'david.lee@email.com', tags: ['Client'] },
  { id: '10', name: 'Anna Kim', phone: '555-012-3456', email: 'annak@email.com', tags: ['Prospect', 'New'] },
  { id: '11', name: 'Mark Taylor', phone: '555-135-2468', email: 'markt@email.com', tags: ['Client'] },
  { id: '12', name: 'Rachel Harris', phone: '555-246-3579', email: 'rachelh@email.com', tags: ['Lead'] },
  { id: '13', name: 'Steve Young', phone: '555-357-4680', email: 'stevey@email.com', tags: [] },
  { id: '14', name: 'Megan Clark', phone: '555-468-5791', email: 'meganc@email.com', tags: ['Prospect'] },
  { id: '15', name: 'Tom Martinez', phone: '555-579-6802', email: 'tomm@email.com', tags: ['Client'] },
];

const tagColorMap: Record<string, string> = {
  Client: 'bg-green-600 text-white',
  Prospect: 'bg-blue-600 text-white',
  Lead: 'bg-purple-600 text-white',
  Referred: 'bg-orange-500 text-white',
  VIP: 'bg-yellow-400 text-black',
  New: 'bg-cyan-600 text-white',
  Default: 'bg-gray-500 text-white', // Default for unmapped tags
};


export default function ClientPortalContactsPage() {
  const [contacts, setContacts] = React.useState<Contact[]>(mockContacts);
  const [activeSort, setActiveSort] = React.useState("Recent");
  const [isAddContactDialogOpen, setIsAddContactDialogOpen] = React.useState(false);

  const contactCount = contacts.length;

  return (
    <>
      <main className="min-h-screen bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#5b21b6]/10 to-[#000104] flex-1 p-6 space-y-8 md:p-8">
        {/* Top Control Bar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Contacts</h1>
            <Select defaultValue="all">
              <SelectTrigger className="w-auto bg-card border-none text-foreground shadow-white-glow-soft hover:shadow-white-glow-hover transition-shadow duration-200 ease-out">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Contacts</SelectItem>
                <SelectItem value="clients">Clients</SelectItem>
                <SelectItem value="prospects">Prospects</SelectItem>
                <SelectItem value="leads">Leads</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-muted-foreground">({contactCount} contacts)</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <span>Order:</span>
              {["Recent", "Created", "A-Z", "Z-A"].map((sort) => (
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-auto py-1.5 px-3">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Options</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Manage Columns</DropdownMenuItem>
                <DropdownMenuItem>Merge Duplicates</DropdownMenuItem>
                <DropdownMenuItem>Recycle Bin</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button 
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={() => setIsAddContactDialogOpen(true)}
            >
              <UserPlus className="mr-2 h-4 w-4" /> Add Contact
            </Button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Contacts Table Card (Left) */}
          <div className="lg:col-span-2">
            <PlaceholderCard title="" className="p-0 overflow-x-hidden">
              <div className="p-4 border-b border-border/30">
                <div className="flex items-center justify-between">
                   <div className="flex items-center space-x-2">
                      <Checkbox id="select-all-contacts" aria-label="Select all contacts" />
                      <Label htmlFor="select-all-contacts" className="text-sm font-medium text-muted-foreground">Select All</Label>
                   </div>
                   <Button variant="ghost" size="sm" disabled={contacts.length === 0} className="text-xs">Bulk Actions</Button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b-border/20"><TableHead className="w-10 px-6 py-4 whitespace-nowrap"></TableHead><TableHead className="px-6 py-4 whitespace-nowrap">Name</TableHead><TableHead className="px-6 py-4 whitespace-nowrap">Phone</TableHead><TableHead className="px-6 py-4 whitespace-nowrap">Email</TableHead><TableHead className="px-6 py-4 whitespace-nowrap">Tags</TableHead></TableRow>
                  </TableHeader>
                  <TableBody>
                    {contactCount === 0 ? (
                      <TableRow className="border-b-border/20">
                        <TableCell colSpan={5} className="h-24 text-center text-muted-foreground px-6 py-4">
                          <span>{'No contacts found. Add a new contact to get started.'}</span>
                        </TableCell>
                      </TableRow>
                    ) : (
                      contacts.map(contact => (
                        <TableRow key={contact.id} className="hover:bg-muted/10 border-b-border/20"><TableCell className="px-6 py-4">
                            <Checkbox id={`contact-${contact.id}`} aria-label={`Select contact ${contact.name}`} />
                          </TableCell><TableCell className="font-medium text-foreground px-6 py-4 whitespace-nowrap truncate">
                             <a href={`/client-portal/contacts/${contact.id}`} className="hover:underline hover:text-primary">
                              {contact.name}
                            </a>
                          </TableCell><TableCell className="text-muted-foreground px-6 py-4 whitespace-nowrap truncate">{contact.phone}</TableCell><TableCell className="text-muted-foreground px-6 py-4 whitespace-nowrap truncate">{contact.email}</TableCell><TableCell className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-wrap gap-1">
                              {contact.tags.map(tag => (
                                <Badge 
                                  key={tag} 
                                  className={cn("text-xs", tagColorMap[tag] || tagColorMap.Default)}
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </TableCell></TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
               {contactCount > 0 && (
                <div className="p-4 border-t border-border/30 flex justify-end">
                  <Select defaultValue="100">
                    <SelectTrigger className="w-[180px] bg-card border-none text-foreground shadow-white-glow-soft hover:shadow-white-glow-hover transition-shadow duration-200 ease-out">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="25">25 per page</SelectItem>
                      <SelectItem value="50">50 per page</SelectItem>
                      <SelectItem value="100">100 per page</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </PlaceholderCard>
          </div>

          {/* Right Column Cards */}
          <div className="lg:col-span-1 space-y-6 lg:space-y-8">
            <PlaceholderCard
              title="Tags"
              icon={TagsIcon}
              headerActions={
                <Button variant="link" size="sm" className="text-primary hover:text-primary/80 p-0 h-auto">Manage Tags</Button>
              }
            >
              <p className="text-muted-foreground text-sm text-center py-4">You have no tags.</p>
            </PlaceholderCard>

            <PlaceholderCard title="Import / Export" icon={UploadCloud}>
              <div className="space-y-3">
                <Button variant="link" className="text-primary hover:text-primary/80 p-0 h-auto justify-start w-full">
                  Import from CSV, Excel, Outlook...
                </Button>
                <Button variant="link" className="text-primary hover:text-primary/80 p-0 h-auto justify-start w-full">
                  Export filtered contacts to CSV
                </Button>
              </div>
            </PlaceholderCard>
          </div>
        </div>
      </main>

      <Dialog open={isAddContactDialogOpen} onOpenChange={setIsAddContactDialogOpen}>
        <DialogContent className="sm:max-w-xl md:max-w-2xl lg:max-w-3xl max-h-[90vh] flex flex-col bg-card/95 backdrop-blur-md border-border/50">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground">Add a new Person</DialogTitle>
            <div className="text-sm text-muted-foreground">
              – or – add a new
              <Button variant="link" className="p-0 h-auto text-primary hover:text-primary/80 mx-1 text-sm">Household</Button> |
              <Button variant="link" className="p-0 h-auto text-primary hover:text-primary/80 mx-1 text-sm">Company</Button> |
              <Button variant="link" className="p-0 h-auto text-primary hover:text-primary/80 ml-1 text-sm">Trust</Button>
            </div>
          </DialogHeader>
          <div className="flex-grow overflow-y-auto pr-2 py-4 space-y-6">
            {/* Name Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 items-end">
              <div>
                <Label htmlFor="prefix-dialog">Prefix</Label>
                <Select>
                  <SelectTrigger id="prefix-dialog" className="bg-input border-border/50 text-foreground placeholder-muted-foreground focus:ring-primary">
                    <SelectValue placeholder="Prefix" />
                  </SelectTrigger>
                  <SelectContent><SelectItem value="mr">Mr.</SelectItem><SelectItem value="ms">Ms.</SelectItem><SelectItem value="mrs">Mrs.</SelectItem><SelectItem value="dr">Dr.</SelectItem></SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="firstName-dialog">First Name</Label>
                <Input id="firstName-dialog" placeholder="First" className="bg-input border-border/50 text-foreground placeholder-muted-foreground focus:ring-primary" />
              </div>
              <div>
                <Label htmlFor="middleName-dialog">Middle</Label>
                <Input id="middleName-dialog" placeholder="Middle" className="bg-input border-border/50 text-foreground placeholder-muted-foreground focus:ring-primary" />
              </div>
              <div>
                <Label htmlFor="lastName-dialog">Last Name</Label>
                <Input id="lastName-dialog" placeholder="Last" className="bg-input border-border/50 text-foreground placeholder-muted-foreground focus:ring-primary" />
              </div>
              <div>
                <Label htmlFor="suffix-dialog">Suffix</Label>
                <Input id="suffix-dialog" placeholder="Suffix" className="bg-input border-border/50 text-foreground placeholder-muted-foreground focus:ring-primary" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nickname-dialog">Nickname</Label>
                <Input id="nickname-dialog" placeholder="Nickname" className="bg-input border-border/50 text-foreground placeholder-muted-foreground focus:ring-primary" />
              </div>
              <div>
                <Label htmlFor="maritalStatus-dialog">Marital Status</Label>
                <Select>
                  <SelectTrigger id="maritalStatus-dialog" className="bg-input border-border/50 text-foreground placeholder-muted-foreground focus:ring-primary">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent><SelectItem value="single">Single</SelectItem><SelectItem value="married">Married</SelectItem><SelectItem value="divorced">Divorced</SelectItem><SelectItem value="widowed">Widowed</SelectItem></SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="jobTitle-dialog">Job Title</Label>
                <Input id="jobTitle-dialog" placeholder="Job Title" className="bg-input border-border/50 text-foreground placeholder-muted-foreground focus:ring-primary" />
              </div>
              <div>
                <Label htmlFor="companyName-dialog">Company</Label>
                <Input id="companyName-dialog" placeholder="Company Name" className="bg-input border-border/50 text-foreground placeholder-muted-foreground focus:ring-primary" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="householdSelect-dialog">Household</Label>
                <Select>
                  <SelectTrigger id="householdSelect-dialog" className="bg-input border-border/50 text-foreground placeholder-muted-foreground focus:ring-primary">
                    <SelectValue placeholder="Select or Create Household" />
                  </SelectTrigger>
                  <SelectContent><SelectItem value="existing">Existing Household A</SelectItem><SelectItem value="new">Create New Household</SelectItem></SelectContent>
                </Select>
              </div>
               <div>
                <Label htmlFor="householdName-dialog">Household Name</Label>
                <Input id="householdName-dialog" placeholder="Household Name (if new)" className="bg-input border-border/50 text-foreground placeholder-muted-foreground focus:ring-primary" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Email Address</Label>
              <div className="flex items-center space-x-2">
                <Input type="email" id="email-dialog" placeholder="Email" className="flex-grow bg-input border-border/50 text-foreground placeholder-muted-foreground focus:ring-primary" />
                <Select>
                  <SelectTrigger id="emailType-dialog" className="w-[120px] bg-input border-border/50 text-foreground focus:ring-primary">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent><SelectItem value="home">Home</SelectItem><SelectItem value="work">Work</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent>
                </Select>
                <div className="flex items-center space-x-2">
                  <Checkbox id="emailPrimary-dialog" />
                  <Label htmlFor="emailPrimary-dialog" className="text-sm text-muted-foreground font-normal">Primary?</Label>
                </div>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Phone Number</Label>
              <div className="flex items-center space-x-2">
                <Input type="tel" id="phone-dialog" placeholder="Phone Number" className="flex-grow bg-input border-border/50 text-foreground placeholder-muted-foreground focus:ring-primary" />
                <Input id="phoneExt-dialog" placeholder="Ext." className="w-[70px] bg-input border-border/50 text-foreground placeholder-muted-foreground focus:ring-primary" />
                <Select>
                  <SelectTrigger id="phoneType-dialog" className="w-[120px] bg-input border-border/50 text-foreground focus:ring-primary">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent><SelectItem value="mobile">Mobile</SelectItem><SelectItem value="home">Home</SelectItem><SelectItem value="work">Work</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent>
                </Select>
                <div className="flex items-center space-x-2">
                  <Checkbox id="phonePrimary-dialog" />
                  <Label htmlFor="phonePrimary-dialog" className="text-sm text-muted-foreground font-normal">Primary?</Label>
                </div>
                 <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>

            <div>
              <Label htmlFor="tags-dialog">Tags</Label>
              <Input id="tags-dialog" placeholder="Add tags (e.g., Prospect, CPA Referral)" className="bg-input border-border/50 text-foreground placeholder-muted-foreground focus:ring-primary" />
            </div>

            <div>
              <Label htmlFor="backgroundInfo-dialog">Background Information</Label>
              <Textarea id="backgroundInfo-dialog" rows={3} placeholder="Enter background details..." className="bg-input border-border/50 text-foreground placeholder-muted-foreground focus:ring-primary" />
            </div>
          </div>
          <DialogFooter className="pt-4 border-t border-border/30">
            <div className="flex justify-between items-center w-full">
                <Button variant="link" className="p-0 h-auto text-primary hover:text-primary/80">Show Additional Fields</Button>
                <div className="space-x-2">
                     <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Add Person</Button>
                </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
