
"use client";

import React from 'react';
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings as SettingsIcon, TvMinimalPlay, ListFilter, FastForward } from "lucide-react";
import { useSettingsContext } from "@/contexts/SettingsContext";
import type { TickerSpeed } from '@/types';

export default function SettingsPage() {
  const {
    showManualTicker, setShowManualTicker,
    showAIAssistedTicker, setShowAIAssistedTicker,
    showFullyAITicker, setShowFullyAITicker,
    tickerSpeed, setTickerSpeed
  } = useSettingsContext();

  return (
    <main className="flex flex-col flex-1 h-full overflow-hidden">
      <PageHeader title="Settings" />
      <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-headline flex items-center">
              <SettingsIcon className="mr-2 h-6 w-6 text-primary"/>
              Application Settings
            </CardTitle>
            <CardDescription>Configure your MILK preferences and integrations. Market Insight. Liquidity. Knowledge.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
             <Card>
              <CardHeader>
                <CardTitle className="text-lg font-headline flex items-center">
                  <TvMinimalPlay className="mr-2 h-5 w-5 text-accent" />
                  Ticker Display Settings
                </CardTitle>
                <CardDescription>Customize the real-time trade ticker behavior and content.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-base font-medium text-foreground mb-3 block flex items-center">
                    <ListFilter className="mr-2 h-4 w-4 text-muted-foreground" />
                    Select Trade Types to Display in Ticker
                  </Label>
                  <div className="space-y-3">
                    <div className="flex flex-row items-center justify-between rounded-lg border border-white/5 p-4 shadow-sm bg-black/10">
                      <div className="space-y-0.5">
                          <Label htmlFor="manualTradeTickerSwitch" className="font-medium text-foreground cursor-pointer">
                              Show Manual Trades
                          </Label>
                          <p className="text-xs text-muted-foreground">
                              Display your manually placed trades in the ticker.
                          </p>
                      </div>
                      <Switch
                          id="manualTradeTickerSwitch"
                          checked={showManualTicker}
                          onCheckedChange={setShowManualTicker}
                          aria-label="Toggle manual trade ticker"
                      />
                    </div>
                     <div className="flex flex-row items-center justify-between rounded-lg border border-white/5 p-4 shadow-sm bg-black/10">
                      <div className="space-y-0.5">
                          <Label htmlFor="aiAssistedTickerSwitch" className="font-medium text-foreground cursor-pointer">
                              Show AI-Assisted Trades
                          </Label>
                          <p className="text-xs text-muted-foreground">
                              Display trades placed with AI assistance in the ticker.
                          </p>
                      </div>
                      <Switch
                          id="aiAssistedTickerSwitch"
                          checked={showAIAssistedTicker}
                          onCheckedChange={setShowAIAssistedTicker}
                          aria-label="Toggle AI-assisted trade ticker"
                      />
                    </div>
                     <div className="flex flex-row items-center justify-between rounded-lg border border-white/5 p-4 shadow-sm bg-black/10">
                      <div className="space-y-0.5">
                          <Label htmlFor="fullyAITickerSwitch" className="font-medium text-foreground cursor-pointer">
                              Show Fully AI Trades
                          </Label>
                          <p className="text-xs text-muted-foreground">
                              Display trades automatically placed by AI in the ticker.
                          </p>
                      </div>
                      <Switch
                          id="fullyAITickerSwitch"
                          checked={showFullyAITicker}
                          onCheckedChange={setShowFullyAITicker}
                          aria-label="Toggle fully AI trade ticker"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <Label htmlFor="tickerSpeedSelect" className="text-base font-medium text-foreground mb-3 block flex items-center">
                    <FastForward className="mr-2 h-4 w-4 text-muted-foreground" />
                    Ticker Speed
                  </Label>
                  <Select value={tickerSpeed} onValueChange={(value) => setTickerSpeed(value as TickerSpeed)}>
                    <SelectTrigger id="tickerSpeedSelect" className="w-full md:w-[280px]">
                        <SelectValue placeholder="Select ticker speed..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="slow">Slow (40s loop)</SelectItem>
                        <SelectItem value="medium">Medium (30s loop)</SelectItem>
                        <SelectItem value="fast">Fast (15s loop)</SelectItem>
                    </SelectContent>
                  </Select>
                   <p className="text-xs text-muted-foreground mt-2">
                      Adjust the scrolling speed of the trade ticker.
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="p-8 text-center text-muted-foreground">
              <SettingsIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">More settings are currently under construction.</p>
              <p>Future options will include API key management for brokers, notification preferences, and theme adjustments.</p>
            </div>
            
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
