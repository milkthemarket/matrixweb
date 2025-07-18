
"use client";

import React, { useState, useEffect } from 'react'; 
import type { MiloTradeIdea } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RefreshCw, Lightbulb, MessageSquare, AlertTriangle, Info } from 'lucide-react';
import { MiloAvatarIcon } from '@/components/icons/MiloAvatarIcon'; // Changed Bot to MiloAvatarIcon
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton'; 

interface MilosTradeIdeasCardProps {
  ideas: MiloTradeIdea[];
  onRefresh: () => void;
  isLoading?: boolean;
  onIdeaSelect: (idea: MiloTradeIdea) => void;
}

export function MilosTradeIdeasCard({ ideas, onRefresh, isLoading = false, onIdeaSelect }: MilosTradeIdeasCardProps) {
  const { toast } = useToast();
  const [clientTimestamps, setClientTimestamps] = useState<Record<string, string>>({});

  useEffect(() => {
    const newTimestamps: Record<string, string> = {};
    if (ideas && Array.isArray(ideas)) {
      ideas.forEach(idea => {
        if (idea && idea.id && idea.timestamp) {
          try {
            newTimestamps[idea.id] = formatDistanceToNow(new Date(idea.timestamp), { addSuffix: true });
          } catch (e) {
            console.error(`Failed to parse timestamp for idea ${idea.id}:`, idea.timestamp, e);
            newTimestamps[idea.id] = 'Error'; 
          }
        }
      });
    }
    setClientTimestamps(newTimestamps);
  }, [ideas]); 

  const handleRefreshClick = () => {
    onRefresh();
    toast({
      title: "Milo's Ideas Refreshed",
      description: "Fetching latest trade suggestions...",
    });
  };

  return (
    <Card className="shadow-md mt-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl font-headline flex items-center text-foreground">
            <MiloAvatarIcon size={20} className="mr-2 text-primary" /> {/* Changed Bot to MiloAvatarIcon */}
            Milo's Trade Ideas
          </CardTitle>
          <CardDescription>AI-powered trade suggestions. Click an idea to load it.</CardDescription>
        </div>
        <Button variant="ghost" size="icon" onClick={handleRefreshClick} disabled={isLoading} className="text-primary hover:bg-primary/10">
          <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          <span className="sr-only">Refresh Suggestions</span>
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading && ideas.length === 0 ? (
           <div className="text-center text-sm text-muted-foreground py-10 px-6">
             <MiloAvatarIcon size={40} className="mx-auto mb-2 opacity-50 animate-pulse text-primary" /> {/* Changed Bot to MiloAvatarIcon */}
             <p>Milo is thinking...</p>
           </div>
        ) : !isLoading && ideas.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground py-10 px-6">
            <AlertTriangle className="mx-auto h-10 w-10 mb-2 opacity-50" />
            No trade ideas from Milo at the moment. Try refreshing.
          </div>
        ) : (
          <ScrollArea className="h-[400px] px-6 pb-6">
            <div className="space-y-3">
              {ideas.map((idea) => (
                <button 
                  key={idea.id} 
                  onClick={() => onIdeaSelect(idea)}
                  className={cn(
                    "w-full text-left bg-black/20 border border-white/10 p-3 rounded-lg shadow-sm hover:bg-primary/10 hover:border-primary/30 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card"
                  )}
                  aria-label={`Select trade idea for ${idea.ticker}`}
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
                </button>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
      {ideas.length > 0 && !isLoading && (
         <CardFooter className="pt-3 pb-4 flex-col items-start space-y-2">
             <p className="text-xs text-muted-foreground italic text-center w-full">
                Click an idea to load it into your trade panel.
            </p>
            <p className="text-xs text-muted-foreground italic text-center w-full">
                Milo's suggestions are AI-generated and for informational purposes only. Not financial advice.
            </p>
        </CardFooter>
      )}
    </Card>
  );
}
