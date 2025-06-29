"use client";

import * as React from 'react';
import { PlaceholderCard } from '@/components/dashboard/PlaceholderCard';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import {
  PlusCircle,
  FileSearch2,
  Users,
  StickyNote,
  ListChecks,
  DollarSign as OpportunityIconLucide,
  Workflow,
  KanbanSquare,
  StepForward,
  FileText,
  CalendarDays,
  Landmark,
  Plus,
  Minus,
  ChevronRight,
  ChevronLeft,
  ArrowUp,
  ArrowDown,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SampleReport {
  id: string;
  name: string;
}

const sampleReportsData: SampleReport[] = [
  { id: 'sr1', name: 'Q3 Performance Overview' },
  { id: 'sr2', name: 'Client Activity Log - Last 30 Days' },
  { id: 'sr3', name: 'Top Traded Securities YTD' },
  { id: 'sr4', name: 'Household AUM Summary' },
  { id: 'sr5', name: 'Fee Billing Statement - August' },
  { id: 'sr6', name: 'Compliance Alert Summary' },
  { id: 'sr7', name: 'Upcoming RMD Report' },
];

interface ReportCategory {
  id: string;
  title: string;
  icon: React.ElementType;
  iconClassName: string;
}

const reportCategories: ReportCategory[] = [
  { id: 'contact', title: 'Contact Reports', icon: Users, iconClassName: 'text-blue-400' },
  { id: 'note', title: 'Note Reports', icon: StickyNote, iconClassName: 'text-yellow-400' },
  { id: 'task', title: 'Task Reports', icon: ListChecks, iconClassName: 'text-orange-400' },
  { id: 'opportunity', title: 'Opportunity Reports', icon: OpportunityIconLucide, iconClassName: 'text-green-400' },
  { id: 'workflow', title: 'Workflow Reports', icon: Workflow, iconClassName: 'text-orange-400' },
  { id: 'project', title: 'Project Reports', icon: KanbanSquare, iconClassName: 'text-lime-400' },
  { id: 'workflow_step', title: 'Workflow Step Reports', icon: StepForward, iconClassName: 'text-blue-600' },
  { id: 'file', title: 'File Reports', icon: FileText, iconClassName: 'text-gray-400' },
  { id: 'event', title: 'Event Reports', icon: CalendarDays, iconClassName: 'text-red-400' },
  { id: 'investment_account', title: 'Investment Account Reports', icon: Landmark, iconClassName: 'text-purple-400' },
];

interface ReportFilter {
  id: string;
  field: string;
  operator: string;
  value: string;
}

const reportObjectOptions = [
  { value: "Contact", label: "Contact" },
  { value: "Opportunity", label: "Opportunity" },
  { value: "Project", label: "Project" },
  { value: "Task", label: "Task" },
  { value: "Event", label: "Event" },
];

const toCamelCase = (str: string) => {
  return str
    .replace(/[^a-zA-Z0-9 ]/g, "") // Remove special characters
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) =>
      index === 0 ? word.toLowerCase() : word.toUpperCase()
    )
    .replace(/\s+/g, "");
};

const contactFieldsList = [
  "Accessible by", "Active", "Adjusted Gross Income", "Age", "Anniversary", "Assets", "Assigned to", "Assistant", "Attorney", "Background Info", "Birth Place", "Birthday", "Business Manager", "City", "Client Since", "Company Name", "Confirmed by Tax Return", "Contact Source", "Contact Type", "Country", "CPA", "Created At", "Creator", "Date of Birth", "Date of Death", "Doctor", "Drivers License Expires Date", "Drivers License Issued Date", "Drivers License Number", "Drivers License State", "Email Address", "Estimated Net Worth", "Estimated Taxes", "Experience Mutual Funds", "Experience Other", "Experience Partnerships", "Experience Stocks Bonds", "External Unique ID", "Family Officer", "First Name", "Gender", "Green Card Number", "Gross Annual Income", "Household", "Household ID", "Household Title", "ID", "Important Information", "Initial CRS Offering Date", "Insurance", "Investment Objective", "Job Title", "Last Activity Date", "Last ADV Offering Date", "Last CRS Offering Date", "Last Dropbox Email Date", "Last Event Date", "Last Mail Merge Date", "Last Name", "Last Note Date", "Last Phone Call", "Last Privacy Offering Date", "Last Task Date", "Liabilities", "LinkedIn URL", "Maiden Name", "Mailing City", "Mailing Country", "Mailing State", "Mailing Street Line 1", "Mailing Street Line 2", "Mailing Zip Code", "Manual Investment Accounts", "Marital Status", "Middle Name", "Name", "Net Worth", "Nickname", "Non Liquid Assets", "Occupation", "Occupation Start Date", "Organization", "Other", "Passport Number", "Personal Interest", "Phone Number", "Prefix", "Primary Email Address", "Primary Phone Number", "Referred By", "Retirement Date", "Risk Tolerance", "Signed Fee Agreement", "Signed FP Agreement Date", "Signed IPS Agreement", "Spouse First Name", "Spouse Full Name", "Spouse Last Name", "Spouse Middle Name", "Spouse Nickname", "Spouse Salutation", "SSN", "State", "Street Line 1", "Street Line 2", "Suffix", "Tags", "Tax Bracket", "Tax Year", "Time Horizon", "Trusted Contact", "Twitter Name", "Type", "Updated At", "Viewed At", "Zip Code"
];

const fieldOptionsByObject: Record<string, { value: string; label: string }[]> = {
  Contact: contactFieldsList.map(field => ({ value: toCamelCase(field), label: field })),
  Opportunity: [
    { value: "opportunityName", label: "Opportunity Name" },
    { value: "stage", label: "Stage" },
    { value: "amount", label: "Amount" },
    { value: "closeDate", label: "Target Close Date" },
    { value: "probability", label: "Probability" },
    { value: "contactName", label: "Contact Name" },
    { value: "pipeline", label: "Pipeline" },
    { value: "createdAt", label: "Created Date" },
    { value: "updatedAt", label: "Updated Date" },
  ],
  Project: [
    { value: "projectName", label: "Project Name" },
    { value: "status", label: "Status" },
    { value: "dueDate", label: "Due Date" },
    { value: "assignedTo", label: "Assigned To" },
    { value: "relatedContact", label: "Related Contact" },
    { value: "createdAt", label: "Created Date" },
  ],
  Task: [
    { value: "taskName", label: "Task Name" },
    { value: "dueDate", label: "Due Date" },
    { value: "status", label: "Status" },
    { value: "priority", label: "Priority" },
    { value: "assignedTo", label: "Assigned To" },
    { value: "relatedTo", label: "Related To" },
    { value: "createdAt", label: "Created Date" },
  ],
  Event: [
    { value: "eventName", label: "Event Name" },
    { value: "eventDate", label: "Event Date" },
    { value: "startTime", label: "Start Time" },
    { value: "endTime", label: "End Time" },
    { value: "location", label: "Location" },
    { value: "relatedTo", label: "Related To" },
    { value: "attendees", label: "Attendees" },
    { value: "createdAt", label: "Created Date" },
  ],
};

const operatorOptions = [
  { value: "equals", label: "Equals" },
  { value: "notEquals", label: "Not Equals" },
  { value: "contains", label: "Contains" },
  { value: "doesNotContain", label: "Does Not Contain" },
  { value: "startsWith", label: "Starts With" },
  { value: "endsWith", label: "Ends With" },
  { value: "greaterThan", label: "Greater Than" },
  { value: "lessThan", label: "Less Than" },
  { value: "greaterThanOrEqual", label: "Greater Than or Equal To" },
  { value: "lessThanOrEqual", label: "Less Than or Equal To" },
  { value: "isEmpty", label: "Is Empty" },
  { value: "isNotEmpty", label: "Is Not Empty" },
  { value: "isTrue", label: "Is True" },
  { value: "isFalse", label: "Is False" },
  { value: "on", label: "On" },
  { value: "before", label: "Before" },
  { value: "after", label: "After" },
  { value: "between", label: "Between" },
];


export default function ClientPortalReportsPage() {
  const { toast } = useToast();
  const [isCreateReportModalOpen, setIsCreateReportModalOpen] = React.useState(false);

  // Modal State
  const [reportObject, setReportObject] = React.useState<string>(reportObjectOptions[0].value);
  const [reportName, setReportName] = React.useState("");
  const [filters, setFilters] = React.useState<ReportFilter[]>([]);

  const [availableFields, setAvailableFields] = React.useState<{ value: string, label: string }[]>([]);
  const [selectedFields, setSelectedFields] = React.useState<{ value: string, label: string }[]>([]);

  const [highlightedAvailableField, setHighlightedAvailableField] = React.useState<string | null>(null);
  const [highlightedSelectedField, setHighlightedSelectedField] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fields = fieldOptionsByObject[reportObject] || [];
    const currentlySelectedValues = new Set(selectedFields.map(sf => sf.value));
    setAvailableFields(fields.filter(f => !currentlySelectedValues.has(f.value)));
  }, [reportObject, selectedFields]);


  const handleAddFilter = () => {
    const defaultField = (fieldOptionsByObject[reportObject] || [])[0]?.value || "";
    setFilters([...filters, { id: Date.now().toString(), field: defaultField, operator: operatorOptions[0].value, value: "" }]);
  };

  const handleRemoveFilter = (id: string) => {
    setFilters(filters.filter(f => f.id !== id));
  };

  const handleFilterChange = (id: string, key: keyof Omit<ReportFilter, 'id'>, value: string) => {
    setFilters(filters.map(f => f.id === id ? { ...f, [key]: value } : f));
  };

  const handleAddField = () => {
    if (highlightedAvailableField) {
      const fieldToAdd = availableFields.find(f => f.value === highlightedAvailableField);
      if (fieldToAdd && !selectedFields.some(sf => sf.value === fieldToAdd.value)) {
        setSelectedFields([...selectedFields, fieldToAdd]);
        // setAvailableFields(availableFields.filter(f => f.value !== highlightedAvailableField)); // This is now handled by useEffect
        setHighlightedAvailableField(null);
      }
    }
  };

  const handleRemoveField = () => {
    if (highlightedSelectedField) {
      const fieldToRemove = selectedFields.find(f => f.value === highlightedSelectedField);
      if (fieldToRemove) {
        // setAvailableFields([...availableFields, fieldToRemove].sort((a, b) => a.label.localeCompare(b.label))); // This is now handled by useEffect
        setSelectedFields(selectedFields.filter(f => f.value !== highlightedSelectedField));
        setHighlightedSelectedField(null);
      }
    }
  };

  const handleMoveField = (direction: 'up' | 'down') => {
    if (!highlightedSelectedField) return;
    const index = selectedFields.findIndex(f => f.value === highlightedSelectedField);
    if (index === -1) return;

    const newFields = [...selectedFields];
    const item = newFields.splice(index, 1)[0];

    if (direction === 'up' && index > 0) {
      newFields.splice(index - 1, 0, item);
    } else if (direction === 'down' && index < newFields.length -1) { // Check index < newFields.length - 1 for moving down
      newFields.splice(index + 1, 0, item);
    } else {
      // Can't move further, put it back (or simply don't change if at boundary)
      newFields.splice(index, 0, item);
    }
    setSelectedFields(newFields);
  };


  const handleSaveTemplate = () => {
    if (!reportName.trim() || selectedFields.length === 0) {
      toast({
        title: "Validation Error",
        description: "Report Name and at least one Selected Field are required.",
        variant: "destructive",
      });
      return;
    }
    // Mock save
    console.log("Saving Report Template:", { reportObject, reportName, filters, selectedFields });
    toast({
      title: "Template Saved!",
      description: `"${reportName}" has been saved.`,
    });
    setIsCreateReportModalOpen(false);
    // Reset form
    setReportObject(reportObjectOptions[0].value);
    setReportName("");
    setFilters([]);
    setSelectedFields([]);
    setHighlightedAvailableField(null);
    setHighlightedSelectedField(null);
  };

  return (
    <>
      <main className="min-h-screen bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#5b21b6]/10 to-[#000104] flex-1 p-6 space-y-8 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Reports</h1>
          <Button
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={() => setIsCreateReportModalOpen(true)}
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Create New Report
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <PlaceholderCard
            title="Sample Reports"
            icon={FileSearch2}
            iconClassName="text-purple-400"
            className="md:col-span-1 lg:col-span-1"
          >
            <ul className="space-y-3 mt-2">
              {sampleReportsData.map((report) => (
                <li key={report.id} className="flex justify-between items-center text-sm py-1.5 border-b border-border/20 last:border-b-0">
                  <span className="text-foreground truncate">{report.name}</span>
                  <div className="flex items-center space-x-2 shrink-0 ml-2">
                    <Button variant="link" size="sm" className="p-0 h-auto text-primary hover:text-primary/80 text-xs">View</Button>
                    <Button variant="link" size="sm" className="p-0 h-auto text-primary hover:text-primary/80 text-xs">Customize</Button>
                  </div>
                </li>
              ))}
            </ul>
          </PlaceholderCard>

          {reportCategories.map((category) => {
            const IconComponent = category.icon;
            return (
              <PlaceholderCard
                key={category.id}
                title={category.title}
                icon={() => <IconComponent className={cn("h-5 w-5 shrink-0", category.iconClassName)} />}
              >
                <div className="flex flex-col items-center justify-center h-full text-center p-4 min-h-[100px]">
                  <p className="text-sm italic text-muted-foreground">No Reports Found</p>
                </div>
              </PlaceholderCard>
            );
          })}
        </div>
      </main>

      <Dialog open={isCreateReportModalOpen} onOpenChange={setIsCreateReportModalOpen}>
        <DialogContent className="sm:max-w-3xl md:max-w-4xl lg:max-w-5xl max-h-[90vh] flex flex-col bg-card/95 backdrop-blur-md border-border/50">
          <DialogHeader className="flex-row justify-between items-center border-b border-border/30 pb-4">
            <DialogTitle className="text-xl font-bold text-foreground">Create Report Template</DialogTitle>
            <DialogClose asChild>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </Button>
            </DialogClose>
          </DialogHeader>

          <ScrollArea className="flex-grow pr-2 -mr-2 py-4"> {/* Negative margin for scrollbar spacing */}
            <div className="space-y-6 px-1">
              {/* Report Details */}
              <section className="space-y-4 p-4 border border-border/30 rounded-md bg-black/20">
                <h3 className="text-lg font-semibold text-foreground mb-3">Report Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="reportObject">Report Object</Label>
                    <Select value={reportObject} onValueChange={setReportObject}>
                      <SelectTrigger id="reportObject" className="bg-input border-border/50"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {reportObjectOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="reportName">Report Name <span className="text-destructive">*</span></Label>
                    <Input id="reportName" value={reportName} onChange={(e) => setReportName(e.target.value)} placeholder="Enter report name..." className="bg-input border-border/50" />
                  </div>
                </div>
              </section>

              {/* Report Filters */}
              <section className="space-y-4 p-4 border border-border/30 rounded-md bg-black/20">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold text-foreground">Report Filters</h3>
                  <Button variant="outline" size="sm" onClick={handleAddFilter}><Plus className="mr-2 h-4 w-4" /> Add Filter Row</Button>
                </div>
                {filters.map((filter, index) => (
                  <div key={filter.id} className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end p-2 border border-border/20 rounded-sm">
                    <div className="md:col-span-1">
                      <Label htmlFor={`filter-field-${filter.id}`} className="text-xs">Field</Label>
                      <Select value={filter.field} onValueChange={(val) => handleFilterChange(filter.id, 'field', val)}>
                        <SelectTrigger id={`filter-field-${filter.id}`} className="bg-input border-border/50 h-9 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {(fieldOptionsByObject[reportObject] || []).map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="md:col-span-1">
                      <Label htmlFor={`filter-operator-${filter.id}`} className="text-xs">Operator</Label>
                      <Select value={filter.operator} onValueChange={(val) => handleFilterChange(filter.id, 'operator', val)}>
                        <SelectTrigger id={`filter-operator-${filter.id}`} className="bg-input border-border/50 h-9 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {operatorOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="md:col-span-1">
                      <Label htmlFor={`filter-value-${filter.id}`} className="text-xs">Value</Label>
                      <Input id={`filter-value-${filter.id}`} value={filter.value} onChange={(e) => handleFilterChange(filter.id, 'value', e.target.value)} className="bg-input border-border/50 h-9 text-xs" />
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveFilter(filter.id)} className="h-9 w-9 self-end text-muted-foreground hover:text-destructive">
                      <Minus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {filters.length === 0 && <p className="text-xs text-muted-foreground italic text-center py-2">No filters added.</p>}

                <div className="mt-3 pt-3 border-t border-border/20">
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Criteria Summary:</h4>
                  {filters.length > 0 ? (
                    <ul className="text-xs text-muted-foreground list-disc list-inside space-y-0.5">
                      {filters.map(f => <li key={f.id}>{`${(fieldOptionsByObject[reportObject] || []).find(opt => opt.value === f.field)?.label || f.field} ${operatorOptions.find(op => op.value === f.operator)?.label || f.operator} "${f.value}"`}</li>)}
                    </ul>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">No criteria defined.</p>
                  )}
                </div>
              </section>

              {/* Fields to Display */}
              <section className="space-y-4 p-4 border border-border/30 rounded-md bg-black/20">
                <h3 className="text-lg font-semibold text-foreground mb-3">Fields to Display <span className="text-destructive">*</span></h3>
                <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-start">
                  <div>
                    <Label className="text-sm mb-1 block text-center">Available Fields</Label>
                    <ScrollArea className="h-48 border border-border/50 rounded-md bg-input p-2">
                      {availableFields.map(field => (
                        <div key={field.value} onClick={() => setHighlightedAvailableField(field.value)}
                          className={cn("p-1.5 text-xs rounded-sm cursor-pointer hover:bg-primary/20", highlightedAvailableField === field.value && "bg-primary/30 text-primary-foreground")}>
                          {field.label}
                        </div>
                      ))}
                    </ScrollArea>
                  </div>

                  <div className="flex flex-col space-y-2 items-center justify-center h-48 pt-6"> {/* pt-6 to align with lists */}
                    <Button variant="outline" size="icon" onClick={handleAddField} disabled={!highlightedAvailableField} aria-label="Add field"> <ChevronRight className="h-4 w-4" /> </Button>
                    <Button variant="outline" size="icon" onClick={handleRemoveField} disabled={!highlightedSelectedField} aria-label="Remove field"> <ChevronLeft className="h-4 w-4" /> </Button>
                    <Button variant="outline" size="icon" onClick={() => handleMoveField('up')} disabled={!highlightedSelectedField || selectedFields.findIndex(f => f.value === highlightedSelectedField) === 0} aria-label="Move field up"> <ArrowUp className="h-4 w-4" /> </Button>
                    <Button variant="outline" size="icon" onClick={() => handleMoveField('down')} disabled={!highlightedSelectedField || selectedFields.findIndex(f => f.value === highlightedSelectedField) === selectedFields.length - 1} aria-label="Move field down"> <ArrowDown className="h-4 w-4" /> </Button>
                  </div>

                  <div>
                    <Label className="text-sm mb-1 block text-center">Selected Fields</Label>
                    <ScrollArea className="h-48 border border-border/50 rounded-md bg-input p-2">
                      {selectedFields.map(field => (
                        <div key={field.value} onClick={() => setHighlightedSelectedField(field.value)}
                          className={cn("p-1.5 text-xs rounded-sm cursor-pointer hover:bg-primary/20", highlightedSelectedField === field.value && "bg-primary/30 text-primary-foreground")}>
                          {field.label}
                        </div>
                      ))}
                      {selectedFields.length === 0 && <p className="text-xs text-muted-foreground italic text-center py-2">No fields selected.</p>}
                    </ScrollArea>
                  </div>
                </div>
              </section>
            </div>
          </ScrollArea>

          <DialogFooter className="pt-4 border-t border-border/30 flex justify-end items-center w-full">
            <DialogClose asChild>
                <Button variant="outline" onClick={() => {
                    setIsCreateReportModalOpen(false);
                    setReportObject(reportObjectOptions[0].value);
                    setReportName("");
                    setFilters([]);
                    setSelectedFields([]);
                    setHighlightedAvailableField(null);
                    setHighlightedSelectedField(null);
                }}>Cancel</Button>
            </DialogClose>
            <Button
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={handleSaveTemplate}
              disabled={!reportName.trim() || selectedFields.length === 0}
            >
              Save Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
