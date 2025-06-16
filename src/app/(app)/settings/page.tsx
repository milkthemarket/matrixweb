
"use client";

import React from 'react';
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings as SettingsIcon, TvMinimalPlay, ListFilter, FastForward, Volume2, PlayCircle } from "lucide-react";
import { useSettingsContext } from "@/contexts/SettingsContext";
import type { TickerSpeed, SoundOption, NotificationSoundEvent } from '@/types';

const soundOptions: { value: SoundOption; label: string }[] = [
  { value: 'default', label: 'Default System Sound' },
  { value: 'chime', label: 'Chime' },
  { value: 'bell', label: 'Bell' },
  { value: 'moo', label: 'Moo (Cow Sound)' },
  { value: 'off', label: 'Sound Off' },
];

const notificationEvents: { event: NotificationSoundEvent; label: string }[] = [
  { event: 'mooAlert', label: 'Moo Alert Triggers' },
  { event: 'tradePlaced', label: 'Trade Placed Confirmation' },
  { event: 'tradeClosed', label: 'Trade Closed Confirmation' },
];

export default function SettingsPage() {
  const {
    showManualTicker, setShowManualTicker,
    showAIAssistedTicker, setShowAIAssistedTicker,
    showAutopilotTicker, setShowAutopilotTicker,
    tickerSpeed, setTickerSpeed,
    notificationSounds, setNotificationSound, playSound
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
          <CardContent className="space-y-8"> {/* Increased spacing between cards */}
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
                          <Label htmlFor="autopilotTickerSwitch" className="font-medium text-foreground cursor-pointer">
                              Show Autopilot Trades
                          </Label>
                          <p className="text-xs text-muted-foreground">
                              Display trades automatically placed by AI in the ticker.
                          </p>
                      </div>
                      <Switch
                          id="autopilotTickerSwitch"
                          checked={showAutopilotTicker}
                          onCheckedChange={setShowAutopilotTicker}
                          aria-label="Toggle Autopilot trade ticker"
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

            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-headline flex items-center">
                  <Volume2 className="mr-2 h-5 w-5 text-accent" />
                  Sound & Notification Preferences
                </CardTitle>
                <CardDescription>Choose custom sounds for different platform events.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {notificationEvents.map(({ event, label }) => (
                  <div key={event} className="space-y-2 p-4 rounded-lg border border-white/5 bg-black/10">
                    <Label htmlFor={`${event}-sound-select`} className="text-base font-medium text-foreground block">
                      {label}
                    </Label>
                    <div className="flex items-center space-x-3">
                      <Select
                        value={notificationSounds[event]}
                        onValueChange={(value) => setNotificationSound(event, value as SoundOption)}
                      >
                        <SelectTrigger id={`${event}-sound-select`} className="flex-1">
                          <SelectValue placeholder="Select sound..." />
                        </SelectTrigger>
                        <SelectContent>
                          {soundOptions.map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => playSound(notificationSounds[event])}
                        className="text-accent border-accent hover:bg-accent/10 hover:text-accent"
                        aria-label={`Preview ${label} sound`}
                      >
                        <PlayCircle className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                ))}
                <div className="pt-2 text-center">
                    <Button 
                        variant="outline" 
                        onClick={() => {
                            notificationEvents.forEach(({event}, index) => {
                                setTimeout(() => {
                                     if (notificationSounds[event] !== 'off') {
                                        playSound(notificationSounds[event]);
                                     }
                                }, index * 700); // Play sounds with a small delay
                            });
                        }}
                        className="text-sm"
                    >
                        Test All Sounds
                    </Button>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Note: Sound playback is simulated in this environment. Actual sounds require audio files.
                </p>
              </CardContent>
            </Card>
            
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
