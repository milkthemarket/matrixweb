
"use client";

import React, { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';
import { Lightbulb, ThumbsUp, Trophy, Flame, Construction, CheckCircle, MessageSquare, Send, Filter } from "lucide-react";

const suggestionSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters long.").max(100, "Title must be 100 characters or less."),
  description: z.string().min(20, "Description must be at least 20 characters long.").max(1000, "Description must be 1000 characters or less."),
  category: z.string().optional(),
});

type SuggestionFormData = z.infer<typeof suggestionSchema>;

type SuggestionStatus = "New" | "Planned" | "In Progress" | "Completed" | "Not Planned";

interface Suggestion {
  id: string;
  title: string;
  description: string;
  author?: string; // User ID or name
  upvotes: number;
  userHasUpvoted?: boolean;
  status: SuggestionStatus;
  createdAt: string; // ISO Date string
  category?: string;
  progress?: number; // For "In Progress" items
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
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-base font-semibold text-foreground">{suggestion.title}</CardTitle>
          <Badge variant="outline" className={cn("text-xs whitespace-nowrap", getStatusBadgeColor(suggestion.status))}>
            {suggestion.status}
          </Badge>
        </div>
        {suggestion.category && <CardDescription className="text-xs text-primary">{suggestion.category}</CardDescription>}
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-sm text-muted-foreground mb-3 line-clamp-3">{suggestion.description}</p>
        {suggestion.status === 'In Progress' && suggestion.progress !== undefined && (
          <div className="mb-3">
            <Progress value={suggestion.progress} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">{suggestion.progress}% complete</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <Button 
          variant={suggestion.userHasUpvoted ? "default" : "outline"} 
          size="sm" 
          onClick={() => onUpvote(suggestion.id)}
          className={cn("text-sm", suggestion.userHasUpvoted ? "bg-primary text-primary-foreground hover:bg-primary/90" : "text-accent border-accent hover:bg-accent/10 hover:text-accent")}
        >
          <ThumbsUp className="mr-1.5 h-4 w-4" /> {suggestion.upvotes} Upvotes
        </Button>
        <p className="text-xs text-muted-foreground">
          {new Date(suggestion.createdAt).toLocaleDateString()}
        </p>
      </CardFooter>
    </Card>
  );
};


export default function SuggestionsPage() {
  const { toast } = useToast();
  const [suggestions, setSuggestions] = useState<Suggestion[]>(mockSuggestions);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<SuggestionFormData>({
    resolver: zodResolver(suggestionSchema),
    defaultValues: { title: '', description: '', category: '' },
  });

  const onSubmitSuggestion: SubmitHandler<SuggestionFormData> = async (data) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newSuggestion: Suggestion = {
      id: `s${suggestions.length + 1}`,
      title: data.title,
      description: data.description,
      category: data.category || 'General',
      upvotes: 1, // Initial upvote from submitter
      userHasUpvoted: true,
      status: 'New',
      createdAt: new Date().toISOString(),
    };
    setSuggestions(prev => [newSuggestion, ...prev]);

    toast({
      title: "Suggestion Submitted!",
      description: "Thanks for your feedback. We'll review it soon.",
    });
    form.reset();
    setIsLoading(false);
    // TODO: Save to Firestore (userID, timestamp, etc.)
  };

  const handleUpvote = (id: string) => {
    setSuggestions(prev => 
      prev.map(s => 
        s.id === id 
          ? { ...s, upvotes: s.userHasUpvoted ? s.upvotes -1 : s.upvotes + 1, userHasUpvoted: !s.userHasUpvoted } 
          : s
      )
    );
    // TODO: Update Firestore with upvote (ensure user can only upvote once)
    console.log(`Upvoted suggestion ${id}`);
  };
  
  const topSuggestions = suggestions.filter(s => s.upvotes > 100 && s.status !== 'Completed').sort((a, b) => b.upvotes - a.upvotes).slice(0, 3);
  const trendingSuggestions = suggestions.filter(s => s.status === 'New').sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 6);
  const inProgressSuggestions = suggestions.filter(s => s.status === 'In Progress').slice(0, 3);
  const recentlyReleasedSuggestions = suggestions.filter(s => s.status === 'Completed').sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 3);


  return (
    <main className="flex flex-col flex-1 h-full overflow-hidden">
      <PageHeader title="Suggestions & Community Upgrades" />
      <ScrollArea className="flex-1 p-4 md:p-6">
        <div className="space-y-8">
          
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-headline flex items-center">
                <MessageSquare className="mr-2 h-5 w-5 text-primary"/>
                Submit Your Idea
              </CardTitle>
              <CardDescription>Have a feature request or an improvement idea? Let us know!</CardDescription>
            </CardHeader>
            <form onSubmit={form.handleSubmit(onSubmitSuggestion)}>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Short Title</Label>
                  <Input id="title" placeholder="e.g., Add Trailing Stop Loss for AI Trades" {...form.register("title")} disabled={isLoading} />
                  {form.formState.errors.title && <p className="text-xs text-destructive mt-1">{form.formState.errors.title.message}</p>}
                </div>
                <div>
                  <Label htmlFor="description">Detailed Description</Label>
                  <Textarea id="description" placeholder="Explain your suggestion in detail. What problem does it solve? How would it work?" {...form.register("description")} rows={4} disabled={isLoading} />
                  {form.formState.errors.description && <p className="text-xs text-destructive mt-1">{form.formState.errors.description.message}</p>}
                </div>
                <div>
                  <Label htmlFor="category">Category (Optional)</Label>
                  <Input id="category" placeholder="e.g., Charting, AI, UI/UX" {...form.register("category")} disabled={isLoading} />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isLoading} className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <Send className="mr-2 h-4 w-4" />
                  {isLoading ? "Submitting..." : "Submit Suggestion"}
                </Button>
              </CardFooter>
            </form>
          </Card>

          {topSuggestions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-headline flex items-center">
                  <Trophy className="mr-2 h-5 w-5 text-yellow-400"/>Top Suggestions
                </CardTitle>
                <CardDescription>Most upvoted ideas from the community. Some may be prioritized!</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {topSuggestions.map(suggestion => (
                  <SuggestionCard key={suggestion.id} suggestion={suggestion} onUpvote={handleUpvote} />
                ))}
              </CardContent>
            </Card>
          )}
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-headline flex items-center">
                  <Flame className="mr-2 h-5 w-5 text-destructive"/>Trending & New Ideas
                </CardTitle>
                <CardDescription>Freshly submitted ideas. Upvote your favorites!</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {trendingSuggestions.length > 0 ? (
                  trendingSuggestions.map(suggestion => (
                    <SuggestionCard key={suggestion.id} suggestion={suggestion} onUpvote={handleUpvote} />
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm text-center py-4">No new suggestions right now. Be the first!</p>
                )}
              </CardContent>
            </Card>

            <div className="space-y-6">
              {inProgressSuggestions.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl font-headline flex items-center">
                      <Construction className="mr-2 h-5 w-5 text-accent"/>Currently Being Built
                    </CardTitle>
                    <CardDescription>Features the dev team is actively working on.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {inProgressSuggestions.map(suggestion => (
                      <SuggestionCard key={suggestion.id} suggestion={suggestion} onUpvote={handleUpvote} />
                    ))}
                  </CardContent>
                </Card>
              )}

              {recentlyReleasedSuggestions.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl font-headline flex items-center">
                      <CheckCircle className="mr-2 h-5 w-5 text-[hsl(var(--confirm-green))]"/>Recently Released
                    </CardTitle>
                    <CardDescription>Check out what's new in MILK!</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                     {recentlyReleasedSuggestions.map(suggestion => (
                      <SuggestionCard key={suggestion.id} suggestion={suggestion} onUpvote={handleUpvote} />
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
          <div className="text-center text-sm text-muted-foreground py-4">
            <p>Your feedback helps shape the future of MILK. Thank you for your contributions!</p>
            <p className="mt-1">Tip: Suggestions with more community upvotes are more likely to be prioritized.</p>
          </div>
        </div>
      </ScrollArea>
    </main>
  );
}
