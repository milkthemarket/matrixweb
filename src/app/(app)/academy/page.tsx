
"use client";

import React from 'react';
import Image from 'next/image';
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { GraduationCap, Construction, BookOpen, Film, HelpCircle } from "lucide-react";

const learningModules = [
  {
    title: "Getting Started with MILK",
    description: "Learn the basics of navigating the MILK platform and setting up your workspace.",
    icon: BookOpen,
    image: "https://placehold.co/600x400.png",
    aiHint: "education platform",
    comingSoon: false,
  },
  {
    title: "Advanced Charting Techniques",
    description: "Dive deep into technical analysis and charting tools available in MILK.",
    icon: Film,
    image: "https://placehold.co/600x400.png",
    aiHint: "tutorial chart",
    comingSoon: true,
  },
  {
    title: "Understanding Alert Rules",
    description: "Master the rule engine to create powerful, custom trade alerts.",
    icon: HelpCircle,
    image: "https://placehold.co/600x400.png",
    aiHint: "guide alerts",
    comingSoon: true,
  },
  {
    title: "Milo AI: Tips & Tricks",
    description: "Leverage Milo, your AI assistant, for smarter trading decisions and automation.",
    icon: GraduationCap,
    image: "https://placehold.co/600x400.png",
    aiHint: "ai assistant",
    comingSoon: true,
  }
];

export default function AcademyPage() {
  return (
    <main className="flex flex-col flex-1 h-full overflow-hidden">
      <PageHeader title="Milk Academy" />
      <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-6">
        
        <div className="text-center mb-8">
          <h2 className="text-xl font-semibold text-muted-foreground">
            Your hub for tutorials, trading tips, and platform walkthroughs.
          </h2>
        </div>

        <Alert className="border-accent bg-accent/5 text-accent-foreground">
          <Construction className="h-5 w-5 text-accent" />
          <AlertTitle className="font-semibold text-accent">Under Construction!</AlertTitle>
          <AlertDescription>
            The Milk Academy is currently being developed. More content coming soon!
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {learningModules.map((module, index) => (
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

