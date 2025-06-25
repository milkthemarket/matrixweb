
"use client";

import React, { useState } from 'react';
import { useForm, type SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from '@/lib/utils';
import { Lightbulb, ThumbsUp, Trophy, Flame, Construction, CheckCircle, MessageSquare, Send } from "lucide-react";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";


const suggestionCategories = [
  "Charting", "AI", "UI/UX", "Order Types", "Notifications", 
  "Data Integrations", "Performance", "Account Management", "Mobile", "Other"
];

const suggestionSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters long.").max(100, "Title must be 100 characters or less."),
  description: z.string().min(20, "Description must be at least 20 characters long.").max(1000, "Description must be 1000 characters or less."),
  category: z.string().optional(),
  customCategory: z.string().optional(),
}).refine(data => {
  if (data.category === 'Other') {
    return data.customCategory && data.customCategory.trim().length > 0;
  }
  return true;
}, {
  message: "Custom category name is required when 'Other' is selected.",
  path: ['customCategory'], 
});

type SuggestionFormData = z.infer<typeof suggestionSchema>;

type SuggestionStatus = "New" | "Planned" | "In Progress" | "Completed" | "Not Planned";

interface Suggestion {
  id: string;
  title: string;
  description: string;
  author?: string; 
  upvotes: number;
  userHasUpvoted?: boolean;
  status: SuggestionStatus;
  createdAt: string; 
  category?: string;
  progress?: number; 
}

const mockSuggestions: Suggestion[] = [
  { id: 's1', title: 'Dark Mode for Charts', description: 'The trading charts should also have a dedicated dark mode toggle, independent of the app theme.', upvotes: 125, status: 'In Progress', createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), category: 'UI/UX', progress: 60, userHasUpvoted: true },
  { id: 's2', title: 'Advanced Real-time Alerts', description: 'Allow setting alerts based on complex conditions like indicator crossovers (e.g., MACD cross Golden Cross).', upvotes: 230, status: 'Planned', createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), category: 'Alerts' },
  { id: 's3', title: 'Gamified Trading Challenges', description: 'Introduce weekly or monthly trading challenges with leaderboards and virtual badges.', upvotes: 78, status: 'New', createdAt: new Date(Date.now() - 86400000 * 1).toISOString(), category: 'Engagement' },
  { id: 's4', title: 'API for Developers', description: 'Provide a public API for developers to build custom tools and integrations with MILK.', upvotes: 190, status: 'New', createdAt: new Date(Date.now() - 86400000 * 3).toISOString(), category: 'Integrations', userHasUpvoted: false },
  { id: 's5', title: 'One-Click Trade Reversal', description: 'A button to quickly reverse a position (e.g., sell what was bought, or cover a short).', upvotes: 95, status: 'Planned', createdAt: new Date(Date.now() - 86400000 * 7).toISOString(), category: 'Trading' },
  { id: 's6', title: 'Option Chain Integration', description: 'Integrate option chain data directly into the stock view for easier options trading decisions.', upvotes: 310, status: 'Completed', createdAt: new Date(Date.now() - 86400000 * 30).toISOString(), category: 'Trading' },
];

const SuggestionCard: React.FC<{ suggestion: Suggestion; onUpvote: (id: string) => void }> = ({ suggestion, onUpvote }) => {
  const getStatusBadgeColor = (status: SuggestionStatus) => {
    switch (status) {
      case 'New': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'Planned': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'In Progress': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Completed': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Not Planned': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-0.5"> {/* Reduced CardHeader padding */}
        <div className="flex justify-between items-start">
          <CardTitle className="text-sm font-semibold text-foreground">{suggestion.title}</CardTitle> {/* Reduced from text-base */}
          <Badge variant="outline" className={cn("text-xs whitespace-nowrap py-0 px-1 h-auto", getStatusBadgeColor(suggestion.status))}> {/* Made badge smaller */}
            {suggestion.status}
          </Badge>
        </div>
        {suggestion.category && <CardDescription className="text-xs text-primary">{suggestion.category}</CardDescription>}
      </CardHeader>
      <CardContent className="flex-1 pt-1"> {/* Reduced CardContent padding-top */}
        <p className="text-xs text-muted-foreground mb-1 line-clamp-3">{suggestion.description}</p> {/* Reduced text-sm, mb-3 */}
        {suggestion.status === 'In Progress' && suggestion.progress !== undefined && (
          <div className="mb-1"> {/* Reduced mb-3 */}
            <Progress value={suggestion.progress} className="h-1.5" /> {/* Reduced h-2 */}
            <p className="text-xs text-muted-foreground mt-0.5">{suggestion.progress}% complete</p> {/* Reduced mt-1 */}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <Button 
          variant={suggestion.userHasUpvoted ? "default" : "outline"} 
          size="sm" 
          onClick={() => onUpvote(suggestion.id)}
          className={cn("text-xs h-7 px-2", suggestion.userHasUpvoted ? "bg-primary text-primary-foreground hover:bg-primary/90" : "text-accent border-accent hover:bg-accent/10 hover:text-accent")} // Reduced size
        >
          <ThumbsUp className="mr-1 h-3.5 w-3.5" /> {suggestion.upvotes} Upvotes {/* Reduced icon size, mr-1.5 */}
        </Button>
        <p className="text-xs text-muted-foreground">
          {new Date(suggestion.createdAt).toLocaleDateString()}
        </p>
      </CardFooter>
    </Card>
  );
};


export default function SuggestionsPage() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>(mockSuggestions);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const form = useForm<SuggestionFormData>({
    resolver: zodResolver(suggestionSchema),
    defaultValues: { title: '', description: '', category: '', customCategory: '' },
  });

  const watchedCategory = form.watch("category");

  const onSubmitSuggestion: SubmitHandler<SuggestionFormData> = async (data) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); 
    
    const finalCategory = data.category === 'Other' ? data.customCategory : data.category;

    const newSuggestion: Suggestion = {
      id: `s${Date.now()}`, 
      title: data.title,
      description: data.description,
      category: finalCategory || 'General',
      upvotes: 1, 
      userHasUpvoted: true,
      status: 'New',
      createdAt: new Date().toISOString(),
    };
    setSuggestions(prev => [newSuggestion, ...prev].sort((a, b) => b.upvotes - a.upvotes));

    form.reset();
    setIsLoading(false);
    setShowSuccessDialog(true); 
  };

  const handleUpvote = (id: string) => {
    setSuggestions(prev => 
      prev.map(s => 
        s.id === id 
          ? { ...s, upvotes: s.userHasUpvoted ? s.upvotes -1 : s.upvotes + 1, userHasUpvoted: !s.userHasUpvoted } 
          : s
      ).sort((a, b) => b.upvotes - a.upvotes) 
    );
  };
  
  const topSuggestions = suggestions.filter(s => s.upvotes > 100 && s.status !== 'Completed').sort((a, b) => b.upvotes - a.upvotes).slice(0, 3);
  const trendingSuggestions = suggestions.filter(s => s.status === 'New').sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 6);
  const inProgressSuggestions = suggestions.filter(s => s.status === 'In Progress').slice(0, 3);
  const recentlyReleasedSuggestions = suggestions.filter(s => s.status === 'Completed').sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 3);


  return (
    <>
      <main className="flex flex-col flex-1 h-full overflow-hidden">
        <PageHeader title="Suggestions & Community Upgrades" />
        <ScrollArea className="flex-1 p-1 md:p-1.5"> {/* Reduced padding */}
          <div className="space-y-2"> {/* Reduced space-y-8 */}
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-headline flex items-center"> {/* Reduced text-xl, h-5 */}
                  <MessageSquare className="mr-1.5 h-4 w-4 text-primary"/> {/* Reduced icon size */}
                  Submit Your Idea
                </CardTitle>
                <CardDescription>Have a feature request or an improvement idea? Let us know!</CardDescription>
              </CardHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmitSuggestion)}>
                  <CardContent className="space-y-1"> {/* Reduced space-y-4 */}
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Short Title</FormLabel> {/* Reduced text size */}
                          <FormControl>
                            <Input placeholder="e.g., Add Trailing Stop Loss for AI Trades" {...field} disabled={isLoading} className="h-8 text-xs"/> {/* Reduced height and text */}
                          </FormControl>
                          <FormMessage className="text-xs"/>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Detailed Description</FormLabel> {/* Reduced text size */}
                          <FormControl>
                            <Textarea placeholder="Explain your suggestion in detail. What problem does it solve? How would it work?" rows={3} {...field} disabled={isLoading} className="text-xs min-h-[60px]"/> {/* Reduced rows and text */}
                          </FormControl>
                          <FormMessage className="text-xs"/>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Category (Optional)</FormLabel> {/* Reduced text size */}
                          <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                            <FormControl>
                              <SelectTrigger className="h-8 text-xs"> {/* Reduced height */}
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {suggestionCategories.map(cat => (
                                <SelectItem key={cat} value={cat} className="text-xs">{cat}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-xs"/>
                        </FormItem>
                      )}
                    />
                    {watchedCategory === 'Other' && (
                      <FormField
                        control={form.control}
                        name="customCategory"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Custom Category Name</FormLabel> {/* Reduced text size */}
                            <FormControl>
                              <Input placeholder="Enter your custom category" {...field} disabled={isLoading} className="h-8 text-xs"/> {/* Reduced height and text */}
                            </FormControl>
                            <FormMessage className="text-xs"/>
                          </FormItem>
                        )}
                      />
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" disabled={isLoading} size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 h-8 px-3 text-xs"> {/* Reduced size */}
                      <Send className="mr-1 h-3.5 w-3.5" /> {/* Reduced icon size */}
                      {isLoading ? "Submitting..." : "Submit Suggestion"}
                    </Button>
                  </CardFooter>
                </form>
              </Form>
            </Card>

            {topSuggestions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-headline flex items-center"> {/* Reduced text-xl, h-5 */}
                    <Trophy className="mr-1.5 h-4 w-4 text-yellow-400"/> {/* Reduced icon size */}
                    Top Suggestions
                  </CardTitle>
                  <CardDescription>Most upvoted ideas from the community. Some may be prioritized!</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1"> {/* Reduced gap-4 */}
                  {topSuggestions.map(suggestion => (
                    <SuggestionCard key={suggestion.id} suggestion={suggestion} onUpvote={handleUpvote} />
                  ))}
                </CardContent>
              </Card>
            )}
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-1.5"> {/* Reduced gap-6 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-headline flex items-center"> {/* Reduced text-xl, h-5 */}
                    <Flame className="mr-1.5 h-4 w-4 text-destructive"/> {/* Reduced icon size */}
                    Trending & New Ideas
                  </CardTitle>
                  <CardDescription>Freshly submitted ideas. Upvote your favorites!</CardDescription>
                </CardHeader>
                <CardContent className="space-y-1"> {/* Reduced space-y-4 */}
                  {trendingSuggestions.length > 0 ? (
                    trendingSuggestions.map(suggestion => (
                      <SuggestionCard key={suggestion.id} suggestion={suggestion} onUpvote={handleUpvote} />
                    ))
                  ) : (
                    <p className="text-muted-foreground text-xs text-center py-1">No new suggestions right now. Be the first!</p>
                  )}
                </CardContent>
              </Card>

              <div className="space-y-1.5"> {/* Reduced space-y-6 */}
                {inProgressSuggestions.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg font-headline flex items-center"> {/* Reduced text-xl, h-5 */}
                        <Construction className="mr-1.5 h-4 w-4 text-accent"/> {/* Reduced icon size */}
                        Currently Being Built
                      </CardTitle>
                      <CardDescription>Features the dev team is actively working on.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-1"> {/* Reduced space-y-4 */}
                      {inProgressSuggestions.map(suggestion => (
                        <SuggestionCard key={suggestion.id} suggestion={suggestion} onUpvote={handleUpvote} />
                      ))}
                    </CardContent>
                  </Card>
                )}

                {recentlyReleasedSuggestions.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg font-headline flex items-center"> {/* Reduced text-xl, h-5 */}
                        <CheckCircle className="mr-1.5 h-4 w-4 text-[hsl(var(--confirm-green))]"/> {/* Reduced icon size */}
                        Recently Released
                      </CardTitle>
                      <CardDescription>Check out what's new in MILK!</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-1"> {/* Reduced space-y-4 */}
                       {recentlyReleasedSuggestions.map(suggestion => (
                        <SuggestionCard key={suggestion.id} suggestion={suggestion} onUpvote={handleUpvote} />
                      ))}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
            <div className="text-center text-xs text-muted-foreground py-1"> {/* Reduced text-sm, py-4 */}
              <p>Your feedback helps shape the future of MILK. Thank you for your contributions!</p>
              <p className="mt-0.5">Tip: Suggestions with more community upvotes are more likely to be prioritized.</p> {/* Reduced mt-1 */}
            </div>
          </div>
        </ScrollArea>
      </main>

      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Thank You!</AlertDialogTitle>
            <AlertDialogDescription>
              Thank you for your suggestion! If it moves to the top, we’ll be in touch before the cows come home.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowSuccessDialog(false)}>Okay</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
