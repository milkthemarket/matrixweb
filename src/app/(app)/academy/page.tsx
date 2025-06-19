
"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from '@/lib/utils';
import { GraduationCap, BookOpen, Film, HelpCircle, Hand, Handshake, Rocket, Tag } from "lucide-react";
import { LearningModuleModal } from '@/components/LearningModuleModal';

const learningModules = [
  {
    id: "getting-started",
    title: "Getting Started with MILK",
    description: "Learn the basics of navigating the MILK platform and setting up your workspace.",
    icon: BookOpen,
    image: "https://placehold.co/600x400.png",
    aiHint: "animated cow",
    comingSoon: false,
    tags: ["getting-started", "platform-tips"]
  },
  {
    id: "advanced-charting",
    title: "Advanced Charting Techniques",
    description: "Dive deep into technical analysis and charting tools available in MILK.",
    icon: Film,
    image: "https://placehold.co/600x400.png",
    aiHint: "cartoon cow",
    comingSoon: true,
    tags: ["charting", "trade-strategies"]
  },
  {
    id: "alert-rules",
    title: "Understanding Alert Rules",
    description: "Master the rule engine to create powerful, custom trade alerts.",
    icon: HelpCircle,
    image: "https://placehold.co/600x400.png",
    aiHint: "happy cow",
    comingSoon: true,
    tags: ["alerts-rules", "platform-tips"]
  },
  {
    id: "milo-ai",
    title: "Milo AI: Tips & Tricks",
    description: "Leverage Milo, your AI assistant, for smarter trading decisions and automation.",
    icon: GraduationCap,
    image: "https://placehold.co/600x400.png",
    aiHint: "dancing cow",
    comingSoon: true,
    tags: ["ai-assist", "autopilot", "milo-ai"]
  },
  {
    id: "manual-trading",
    title: "Mastering Manual Trading",
    description: "Take full control. Learn to execute and manage your trades with precision using MILK's manual trading tools.",
    icon: Hand,
    image: "https://placehold.co/600x400.png",
    aiHint: "jumping cow",
    comingSoon: true,
    tags: ["manual-trading", "trade-strategies", "order-types"]
  },
  {
    id: "ai-assist-trading",
    title: "Leveraging AI Assist",
    description: "Combine your insights with Milo's AI-generated trade ideas. You review, AI helps, you decide.",
    icon: Handshake,
    image: "https://placehold.co/600x400.png",
    aiHint: "funny cow",
    comingSoon: true,
    tags: ["ai-assist", "milo-ai", "trade-strategies"]
  },
  {
    id: "autopilot-trading",
    title: "Exploring Autopilot Mode",
    description: "Set your strategy and let Milo manage trades automatically based on your risk parameters and predefined rules.",
    icon: Rocket,
    image: "https://placehold.co/600x400.png",
    aiHint: "cute cow",
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

const articles: Record<string, { title: string; paragraphs: string[] }> = {
  "getting-started": {
    title: "Getting Started with MILK",
    paragraphs: [
      "Welcome to MILK! This platform is designed to give you complete control and clarity over your trading journey. Whether you’re a beginner or an experienced trader, MILK’s streamlined interface makes it easy to navigate, explore, and customize your workspace.",
      "Start by exploring the main dashboard, where you can access your real-time screener, alerts, rules, trade history, and settings. Each section is organized for quick access and offers powerful features without unnecessary clutter.",
      "To personalize your workspace, visit the settings page. Here, you can tailor notifications, manage your account preferences, and connect your trading accounts. Don’t forget to check out the sidebar for quick navigation!",
      "Getting comfortable with MILK takes just a few clicks. Dive in, explore the tools, and you’ll be ready to trade smarter in no time!",
    ],
  },
  "advanced-charting": {
    title: "Advanced Charting Techniques",
    paragraphs: [
      "MILK’s charting tools offer advanced technical analysis features to help you identify market trends, support and resistance levels, and potential trade setups. Charts are fully interactive, allowing you to zoom, pan, and apply indicators in real time.",
      "To get started, open a chart from the screener or your watchlist. Use the toolbar to add moving averages, RSI, Bollinger Bands, and more. You can also draw trend lines, mark price levels, and annotate with custom notes.",
      "Customize the chart’s appearance by adjusting colors, timeframes, and overlays. You can save your favorite chart templates for quick access in the future.",
      "Whether you’re backtesting strategies or scanning for new opportunities, MILK’s charting tools put robust technical analysis at your fingertips.",
    ],
  },
  "alert-rules": {
    title: "Understanding Alert Rules",
    paragraphs: [
      "Alert Rules in MILK are designed to keep you ahead of market moves. Create custom alerts based on price, volume, technical indicators, or even complex multi-criteria conditions.",
      "To set up an alert, head to the Rules section and choose your trigger—price crossing a level, volume spike, or any indicator signal. Combine multiple rules for highly targeted alerts.",
      "Alerts can be delivered via platform notifications or email, ensuring you never miss an opportunity. You can also view your alert history and edit rules on the fly.",
      "Powerful alerting means you can step away from the screen and let MILK watch the markets for you!",
    ],
  },
  "milo-ai": {
    title: "Milo AI: Tips & Tricks",
    paragraphs: [
      "Milo is your AI trading assistant within MILK, providing insights, trade ideas, and automation options to help you stay ahead. Milo scans the market using technical and sentiment data to surface actionable opportunities.",
      "You can ask Milo for trade ideas, have it flag unusual market activity, or get explanations on technical concepts. Use Milo’s suggestions as a second opinion before making your trades.",
      "Milo also learns from your preferences, adapting its suggestions to your trading style and risk tolerance. The more you use Milo, the more personalized its tips become.",
      "Leverage Milo for smarter, faster trading decisions—and don’t hesitate to experiment with its full range of capabilities!",
    ],
  },
  "manual-trading": {
    title: "Mastering Manual Trading",
    paragraphs: [
      "Manual trading in MILK puts you in the driver’s seat. Place orders, manage positions, and set your own stops and targets, all through an intuitive, high-speed trade panel.",
      "Select your account, enter your ticker, choose the order type, and specify quantity or dollar amount. MILK makes it easy to review your order before you send it.",
      "Manual mode is ideal for traders who want maximum control and flexibility. You can monitor all your open positions in real time and exit whenever you choose.",
      "Use manual trading to refine your skills and develop your own edge—MILK gives you the tools, you make the calls.",
    ],
  },
  "ai-assist-trading": {
    title: "Leveraging AI Assist",
    paragraphs: [
      "AI Assist combines your market expertise with Milo’s advanced analytics. Here, you review the AI’s suggestions and decide whether to execute, modify, or ignore them.",
      "AI-generated trade ideas are based on your selected strategies and risk parameters. Review the rationale, suggested entries, and exits before you act.",
      "This hybrid approach lets you blend human intuition with machine learning, creating a unique edge. You remain in control, with Milo providing support and context.",
      "With AI Assist, you’ll never have to trade alone—Milo’s always ready to back you up with data-driven insights.",
    ],
  },
  "autopilot-trading": {
    title: "Exploring Autopilot Mode",
    paragraphs: [
      "Autopilot Mode is for those who want to set their strategy and let Milo take care of execution. Define your risk tolerance, rules, and preferred setups, and Milo will automatically place and manage trades for you.",
      "You can monitor Autopilot’s activity at any time, pause or stop automation, and tweak your rules as your goals evolve.",
      "Autopilot follows your guidance, freeing you from having to watch the market 24/7. It’s ideal for busy traders who want consistency and discipline.",
      "Sit back, relax, and let Milo manage trades—while you focus on the big picture!",
    ],
  },
};


export default function AcademyPage() {
  const [selectedTopicId, setSelectedTopicId] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<{ title: string; paragraphs: string[] } | null>(null);

  // Filtering logic can be added here later if needed based on selectedTopicId and module.tags
  const filteredModules = learningModules; // For now, shows all modules

  const handleModuleClick = (moduleId: string) => {
    const articleContent = articles[moduleId];
    if (articleContent) {
      setSelectedArticle(articleContent);
      setIsModalOpen(true);
    } else {
      setSelectedArticle({
        title: learningModules.find(m => m.id === moduleId)?.title || "Content Not Available",
        paragraphs: ["Detailed content for this module is coming soon or not yet available."]
      });
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedArticle(null);
  };

  return (
    <>
      <main className="flex flex-col flex-1 h-full overflow-hidden">
        <PageHeader title="Milk Academy" />
        <div className="flex-1 p-1 md:p-1.5 overflow-y-auto space-y-1.5"> {/* Reduced padding and space */}
          
          <div className="text-center mb-1.5"> {/* Reduced mb-6 */}
            <h2 className="text-lg font-semibold text-muted-foreground"> {/* Reduced text-xl */}
              Your hub for tutorials, trading tips, and platform walkthroughs.
            </h2>
          </div>

          <div className="mb-2"> {/* Reduced mb-8 */}
            <div className="flex items-center mb-1"> {/* Reduced mb-3 */}
              <Tag className="h-4 w-4 mr-1.5 text-primary" /> {/* Reduced icon size and margin */}
              <h3 className="text-md font-semibold text-foreground">Popular Topics</h3> {/* Reduced text-lg */}
            </div>
            <ScrollArea className="w-full whitespace-nowrap pb-1"> {/* Reduced pb-2.5 */}
              <div className="flex space-x-0.5"> {/* Reduced space-x-2 */}
                {popularTopics.map((topic) => (
                  <Button
                    key={topic.id}
                    variant={selectedTopicId === topic.id ? "default" : "outline"}
                    className={cn(
                      "rounded-full px-2 py-1 h-auto text-xs font-medium", // Reduced px-4, py-1.5, text-sm
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1.5"> {/* Reduced gap-6 */}
            {filteredModules.map((module, index) => (
              <div 
                key={index} 
                onClick={() => handleModuleClick(module.id)} 
                className="cursor-pointer rounded-xl overflow-hidden focus:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-1 focus-visible:ring-offset-background transition-shadow hover:shadow-lg hover:shadow-primary/10" // Adjusted focus ring
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleModuleClick(module.id);}}
              >
                <Card className="flex flex-col h-full">
                  <CardHeader className="pb-0.5"> {/* Reduced default CardHeader padding */}
                    <div className="flex items-center mb-0.5"> {/* Reduced mb-2 */}
                      <module.icon className="h-5 w-5 mr-1.5 text-primary" /> {/* Reduced icon size and margin */}
                      <CardTitle className="text-md font-headline">{module.title}</CardTitle> {/* Reduced from text-lg */}
                    </div>
                    <CardDescription className="text-xs">{module.description}</CardDescription> {/* Ensure CardDescription is smaller */}
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-between pt-1"> {/* Reduced default CardContent padding-top */}
                    <div className="relative aspect-video w-full rounded-md overflow-hidden mb-1"> {/* Reduced mb-4 */}
                      <Image 
                        src={module.image} 
                        alt={module.title} 
                        layout="fill" 
                        objectFit="cover" 
                        data-ai-hint={module.aiHint}
                      />
                    </div>
                    {module.comingSoon && (
                      <div className="text-center text-xs text-primary font-semibold p-0.5 bg-primary/10 rounded-md"> {/* Reduced text-sm, p-2 */}
                        Coming Soon
                      </div>
                    )}
                    {!module.comingSoon && (
                       <div className="text-center text-xs text-muted-foreground font-semibold p-0.5 bg-muted/10 rounded-md"> {/* Reduced text-sm, p-2 */}
                        Available Now
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </main>
      {selectedArticle && (
        <LearningModuleModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={selectedArticle.title}
          paragraphs={selectedArticle.paragraphs}
        />
      )}
    </>
  );
}
