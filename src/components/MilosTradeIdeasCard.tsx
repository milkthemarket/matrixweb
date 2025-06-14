
"use client";

import React, { useState, useEffect } from 'react'; 
import type { MiloTradeIdea } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, RefreshCw, Lightbulb, MessageSquare, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton'; 

interface MilosTradeIdeasCardProps {
  ideas: MiloTradeIdea[];
  onRefresh: () => void;
  isLoading?: boolean;
}

export function MilosTradeIdeasCard({ ideas, onRefresh, isLoading = false }: MilosTradeIdeasCardProps) {
  const { toast } = useToast();
  const [clientTimestamps, setClientTimestamps] = useState<Record<string, string>>({});

  useEffect(() => {
    // This effect runs only on the client, after hydration
    const newTimestamps: Record<string, string> = {};
    if (ideas && Array.isArray(ideas)) {
      ideas.forEach(idea => {
        if (idea && idea.id && idea.timestamp) {
          try {
            newTimestamps[idea.id] = formatDistanceToNow(new Date(idea.timestamp), { addSuffix: true });
          } catch (e) {
            console.error(`Failed to parse timestamp for idea ${idea.id}:`, idea.timestamp, e);
            newTimestamps[idea.id] = 'Error'; // Fallback for bad timestamps
          }
        }
      });
    }
    setClientTimestamps(newTimestamps);
  }, [ideas]); // Dependency array ensures this runs when ideas change

  const handleRefreshClick = () => {
    onRefresh();
    toast({
      title: "MILO's Ideas Refreshed",
      description: "Fetching latest trade suggestions...",
    });
  };

  return (
    <Card className="shadow-md mt-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl font-headline flex items-center text-foreground">
            <Bot className="mr-2 h-5 w-5 text-primary" />
            MILO's Trade Ideas
          </CardTitle>
          <CardDescription>AI-powered trade suggestions based on current trends.</CardDescription>
        </div>
        <Button variant="ghost" size="icon" onClick={handleRefreshClick} disabled={isLoading} className="text-primary hover:bg-primary/10">
          <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          <span className="sr-only">Refresh Suggestions</span>
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading && ideas.length === 0 ? (
           <div className="text-center text-sm text-muted-foreground py-10 px-6">
             <Bot className="mx-auto h-10 w-10 mb-2 opacity-50 animate-pulse" />
             <p>MILO is thinking...</p>
           </div>
        ) : !isLoading && ideas.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground py-10 px-6">
            <AlertTriangle className="mx-auto h-10 w-10 mb-2 opacity-50" />
            No trade ideas from MILO at the moment. Try refreshing.
          </div>
        ) : (
          <ScrollArea className="h-[280px] px-6 pb-6">
            <div className="space-y-3">
              {ideas.map((idea) => (
                <div 
                  key={idea.id} 
                  className="bg-black/20 border border-white/10 p-3 rounded-lg shadow-sm"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <h4 className="text-base font-semibold text-primary">{idea.ticker}</h4>
                    <div className="text-xs text-muted-foreground">
                      {clientTimestamps[idea.id] || <Skeleton className="h-3 w-20 inline-block" />}
                    </div>
                  </div>
                  <div className="mb-2 flex items-start">
                    <Lightbulb className="h-4 w-4 text-yellow-400 mr-2 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-foreground/90">{idea.reason}</p>
                  </div>
                  <div className="flex items-start">
                    <MessageSquare className="h-4 w-4 text-sky-400 mr-2 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-foreground/90">{idea.action}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
      {ideas.length > 0 && !isLoading && (
         <CardFooter className="pt-3 pb-4">
            <p className="text-xs text-muted-foreground italic text-center w-full">
                MILO's suggestions are AI-generated and for informational purposes only. Not financial advice.
            </p>
        </CardFooter>
      )}
    </Card>
  );
}

