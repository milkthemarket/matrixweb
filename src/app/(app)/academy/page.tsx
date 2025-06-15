
"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from '@/lib/utils';
import { GraduationCap, BookOpen, Film, HelpCircle, Hand, Handshake, Rocket, Tag } from "lucide-react";

const learningModules = [
  {
    id: "getting-started",
    title: "Getting Started with MILK",
    description: "Learn the basics of navigating the MILK platform and setting up your workspace.",
    icon: BookOpen,
    image: "https://placehold.co/600x400.png",
    aiHint: "onboarding platform",
    comingSoon: false,
    tags: ["getting-started", "platform-tips"]
  },
  {
    id: "advanced-charting",
    title: "Advanced Charting Techniques",
    description: "Dive deep into technical analysis and charting tools available in MILK.",
    icon: Film,
    image: "https://placehold.co/600x400.png",
    aiHint: "stock chart",
    comingSoon: true,
    tags: ["charting", "trade-strategies"]
  },
  {
    id: "alert-rules",
    title: "Understanding Alert Rules",
    description: "Master the rule engine to create powerful, custom trade alerts.",
    icon: HelpCircle,
    image: "https://placehold.co/600x400.png",
    aiHint: "notification bell",
    comingSoon: true,
    tags: ["alerts-rules", "platform-tips"]
  },
  {
    id: "milo-ai",
    title: "Milo AI: Tips & Tricks",
    description: "Leverage Milo, your AI assistant, for smarter trading decisions and automation.",
    icon: GraduationCap,
    image: "https://placehold.co/600x400.png",
    aiHint: "ai robot",
    comingSoon: true,
    tags: ["ai-assist", "autopilot", "milo-ai"]
  },
  {
    id: "manual-trading",
    title: "Mastering Manual Trading",
    description: "Take full control. Learn to execute and manage your trades with precision using MILK's manual trading tools.",
    icon: Hand,
    image: "https://placehold.co/600x400.png",
    aiHint: "manual control",
    comingSoon: true,
    tags: ["manual-trading", "trade-strategies", "order-types"]
  },
  {
    id: "ai-assist-trading",
    title: "Leveraging AI Assist",
    description: "Combine your insights with Milo's AI-generated trade ideas. You review, AI helps, you decide.",
    icon: Handshake,
    image: "https://placehold.co/600x400.png",
    aiHint: "ai collaboration",
    comingSoon: true,
    tags: ["ai-assist", "milo-ai", "trade-strategies"]
  },
  {
    id: "autopilot-trading",
    title: "Exploring Autopilot Mode",
    description: "Set your strategy and let Milo manage trades automatically based on your risk parameters and predefined rules.",
    icon: Rocket,
    image: "https://placehold.co/600x400.png",
    aiHint: "autopilot rocket",
    comingSoon: true,
    tags: ["autopilot", "milo-ai", "trade-strategies"]
  }
];

const popularTopics = [
  { id: "all", label: "All Topics" },
  { id: "getting-started", label: "Getting Started" },
  { id: "manual-trading", label: "Manual Trading" },
  { id: "ai-assist", label: "AI Assist" },
  { id: "autopilot", label: "Autopilot" },
  { id: "milo-ai", label: "Milo AI" },
  { id: "charting", label: "Charting" },
  { id: "trade-strategies", label: "Trade Strategies" },
  { id: "alerts-rules", label: "Alerts & Rules" },
  { id: "platform-tips", label: "Platform Tips" },
  { id: "order-types", label: "Order Types" },
];


export default function AcademyPage() {
  const [selectedTopicId, setSelectedTopicId] = useState<string>("all");

  // Filtering logic can be added here later if needed based on selectedTopicId and module.tags
  const filteredModules = learningModules; // For now, shows all modules

  return (
    <main className="flex flex-col flex-1 h-full overflow-hidden">
      <PageHeader title="Milk Academy" />
      <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-6">
        
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold text-muted-foreground">
            Your hub for tutorials, trading tips, and platform walkthroughs.
          </h2>
        </div>

        <div className="mb-8">
          <div className="flex items-center mb-3">
            <Tag className="h-5 w-5 mr-2 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Popular Topics</h3>
          </div>
          <ScrollArea className="w-full whitespace-nowrap pb-2.5">
            <div className="flex space-x-2">
              {popularTopics.map((topic) => (
                <Button
                  key={topic.id}
                  variant={selectedTopicId === topic.id ? "default" : "outline"}
                  className={cn(
                    "rounded-full px-4 py-1.5 h-auto text-sm font-medium",
                    selectedTopicId === topic.id 
                      ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                      : "border-border text-muted-foreground hover:bg-white/5 hover:text-foreground"
                  )}
                  onClick={() => setSelectedTopicId(topic.id)}
                >
                  {topic.label}
                </Button>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredModules.map((module, index) => (
            <Card key={index} className="flex flex-col">
              <CardHeader>
                <div className="flex items-center mb-2">
                  <module.icon className="h-6 w-6 mr-3 text-primary" />
                  <CardTitle className="text-lg font-headline">{module.title}</CardTitle>
                </div>
                <CardDescription>{module.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between">
                <div className="relative aspect-video w-full rounded-md overflow-hidden mb-4">
                  <Image 
                    src={module.image} 
                    alt={module.title} 
                    layout="fill" 
                    objectFit="cover" 
                    data-ai-hint={module.aiHint}
                  />
                </div>
                {module.comingSoon && (
                  <div className="text-center text-sm text-primary font-semibold p-2 bg-primary/10 rounded-md">
                    Coming Soon
                  </div>
                )}
                {!module.comingSoon && (
                   <div className="text-center text-sm text-muted-foreground font-semibold p-2 bg-muted/10 rounded-md">
                    Available Now
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}
