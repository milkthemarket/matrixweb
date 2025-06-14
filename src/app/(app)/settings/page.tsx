

"use client";

import React from 'react';
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Settings as SettingsIcon, TvMinimalPlay } from "lucide-react";
import { useSettingsContext } from "@/contexts/SettingsContext";

export default function SettingsPage() {
  const { showManualTicker, setShowManualTicker } = useSettingsContext();

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
                  Ticker Settings
                </CardTitle>
                <CardDescription>Customize the real-time trade ticker behavior.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-row items-center justify-between rounded-lg border border-white/5 p-4 shadow-sm bg-black/10">
                  <div className="space-y-0.5">
                      <Label htmlFor="manualTradeTickerSwitch" className="font-medium text-foreground cursor-pointer">
                          Enable Manual Trade Ticker
                      </Label>
                      <p className="text-xs text-muted-foreground">
                          Show a scrolling notification of your manual trades across the top of the platform.
                      </p>
                  </div>
                  <Switch
                      id="manualTradeTickerSwitch"
                      checked={showManualTicker}
                      onCheckedChange={setShowManualTicker}
                      aria-label="Toggle manual trade ticker"
                  />
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
