
"use client";

import React, { useState } from 'react';
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings as SettingsIcon, TvMinimalPlay, ListFilter, FastForward, Volume2, PlayCircle, MailOpen } from "lucide-react";
import { useSettingsContext } from "@/contexts/SettingsContext";
import type { TickerSpeed, SoundOption, NotificationSoundEvent } from '@/types';
import { Checkbox } from "@/components/ui/checkbox";
import { AlertMethodsModal } from '@/components/AlertMethodsModal';

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

  // State for Alert Delivery Settings
  const [receiveInAppAlerts, setReceiveInAppAlerts] = useState(true);
  const [sendSmsAlerts, setSendSmsAlerts] = useState(false);
  const [sendEmailAlerts, setSendEmailAlerts] = useState(false);
  const [isAlertMethodsModalOpen, setIsAlertMethodsModalOpen] = useState(false);

  return (
    <>
    <main className="flex flex-col flex-1 h-full overflow-hidden">
      <PageHeader title="Settings" />
      <div className="flex-1 p-1 md:p-1.5 overflow-y-auto space-y-1.5"> {/* Reduced padding and space */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-headline flex items-center"> {/* Reduced from 2xl */}
              <SettingsIcon className="mr-1.5 h-5 w-5 text-primary"/> {/* Reduced icon size */}
              Application Settings
            </CardTitle>
            <CardDescription>Configure your MILK preferences and integrations. Market Insight. Liquidity. Knowledge.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2"> {/* Reduced space-y-8 */}
            
            <Card>
              <CardHeader className="pb-0.5"> {/* Reduced pb-2 */}
                <CardTitle className="text-lg font-headline flex items-center"> {/* Reduced text-lg, h-5 */}
                  <MailOpen className="mr-1.5 h-4 w-4 text-accent" /> {/* Reduced icon size */}
                  Alert Delivery Settings
                </CardTitle>
                <CardDescription>Choose how you want to receive your trade alerts.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-1.5"> {/* Reduced space-y-6 */}
                <div className="flex items-start space-x-1 p-1 rounded-lg bg-black/5 border border-white/5"> {/* Reduced space, p-3 */}
                  <Checkbox
                    id="inAppAlerts"
                    checked={receiveInAppAlerts}
                    onCheckedChange={(checked) => setReceiveInAppAlerts(Boolean(checked))}
                    className="mt-0.5" // Align checkbox
                  />
                  <div className="grid gap-0.5 leading-none"> {/* Reduced gap-1.5 */}
                    <Label htmlFor="inAppAlerts" className="font-medium text-foreground cursor-pointer text-base">
                      Receive alerts within MILK
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Notifications will appear in the Alerts Panel on the Alerts page.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-1 p-1 rounded-lg bg-black/5 border border-white/5"> {/* Reduced space, p-3 */}
                  <Checkbox
                    id="smsAlerts"
                    checked={sendSmsAlerts}
                    onCheckedChange={(checked) => setSendSmsAlerts(Boolean(checked))}
                    className="mt-0.5"
                  />
                  <div className="grid gap-0.5 leading-none"> {/* Reduced gap-1.5 */}
                    <Label htmlFor="smsAlerts" className="font-medium text-foreground cursor-pointer text-base">
                      Send alerts via text message
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Requires a verified phone number. Standard messaging rates may apply.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-1 p-1 rounded-lg bg-black/5 border border-white/5"> {/* Reduced space, p-3 */}
                  <Checkbox
                    id="emailAlerts"
                    checked={sendEmailAlerts}
                    onCheckedChange={(checked) => setSendEmailAlerts(Boolean(checked))}
                    className="mt-0.5"
                  />
                  <div className="grid gap-0.5 leading-none"> {/* Reduced gap-1.5 */}
                    <Label htmlFor="emailAlerts" className="font-medium text-foreground cursor-pointer text-base">
                      Send alerts via email
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Requires a verified email address. Alerts sent to your primary email.
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  size="sm" /* Made button smaller */
                  className="text-accent border-accent hover:bg-accent/10 hover:text-accent h-8 px-2 text-sm"
                  onClick={() => setIsAlertMethodsModalOpen(true)}
                >
                  <SettingsIcon className="mr-1 h-3.5 w-3.5" /> {/* Reduced icon size */}
                  Manage Alert Methods
                </Button>
              </CardFooter>
            </Card>

             <Card>
              <CardHeader className="pb-0.5"> {/* Reduced pb-2 */}
                <CardTitle className="text-lg font-headline flex items-center"> {/* Reduced text-lg, h-5 */}
                  <TvMinimalPlay className="mr-1.5 h-4 w-4 text-accent" /> {/* Reduced icon size */}
                  Ticker Display Settings
                </CardTitle>
                <CardDescription>Customize the real-time trade ticker behavior and content.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-1.5"> {/* Reduced space-y-6 */}
                <div>
                  <Label className="text-base font-medium text-foreground mb-1 block flex items-center"> {/* Reduced text-base, mb-3 */}
                    <ListFilter className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" /> {/* Reduced icon size */}
                    Select Trade Types to Display in Ticker
                  </Label>
                  <div className="space-y-1"> {/* Reduced space-y-3 */}
                    <div className="flex flex-row items-center justify-between rounded-lg border border-white/5 p-1 shadow-sm bg-black/10"> {/* Reduced p-4 */}
                      <div className="space-y-0.5">
                          <Label htmlFor="manualTradeTickerSwitch" className="font-medium text-foreground cursor-pointer text-base">
                              Show Manual Trades
                          </Label>
                          <p className="text-sm text-muted-foreground">
                              Display your manually placed trades in the ticker.
                          </p>
                      </div>
                      <Switch
                          id="manualTradeTickerSwitch"
                          checked={showManualTicker}
                          onCheckedChange={setShowManualTicker}
                          aria-label="Toggle manual trade ticker"
                          className="h-5 w-9 data-[state=checked]:[&>span]:translate-x-4 [&>span]:h-4 [&>span]:w-4"
                      />
                    </div>
                     <div className="flex flex-row items-center justify-between rounded-lg border border-white/5 p-1 shadow-sm bg-black/10"> {/* Reduced p-4 */}
                      <div className="space-y-0.5">
                          <Label htmlFor="aiAssistedTickerSwitch" className="font-medium text-foreground cursor-pointer text-base">
                              Show AI-Assisted Trades
                          </Label>
                          <p className="text-sm text-muted-foreground">
                              Display trades placed with AI assistance in the ticker.
                          </p>
                      </div>
                      <Switch
                          id="aiAssistedTickerSwitch"
                          checked={showAIAssistedTicker}
                          onCheckedChange={setShowAIAssistedTicker}
                          aria-label="Toggle AI-assisted trade ticker"
                          className="h-5 w-9 data-[state=checked]:[&>span]:translate-x-4 [&>span]:h-4 [&>span]:w-4"
                      />
                    </div>
                     <div className="flex flex-row items-center justify-between rounded-lg border border-white/5 p-1 shadow-sm bg-black/10"> {/* Reduced p-4 */}
                      <div className="space-y-0.5">
                          <Label htmlFor="autopilotTickerSwitch" className="font-medium text-foreground cursor-pointer text-base">
                              Show Autopilot Trades
                          </Label>
                          <p className="text-sm text-muted-foreground">
                              Display trades automatically placed by AI in the ticker.
                          </p>
                      </div>
                      <Switch
                          id="autopilotTickerSwitch"
                          checked={showAutopilotTicker}
                          onCheckedChange={setShowAutopilotTicker}
                          aria-label="Toggle Autopilot trade ticker"
                          className="h-5 w-9 data-[state=checked]:[&>span]:translate-x-4 [&>span]:h-4 [&>span]:w-4"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-1"> {/* Reduced pt-4 */}
                  <Label htmlFor="tickerSpeedSelect" className="text-base font-medium text-foreground mb-1 block flex items-center"> {/* Reduced text-base, mb-3 */}
                    <FastForward className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" /> {/* Reduced icon size */}
                    Ticker Speed
                  </Label>
                  <Select value={tickerSpeed} onValueChange={(value) => setTickerSpeed(value as TickerSpeed)}>
                    <SelectTrigger id="tickerSpeedSelect" className="w-full md:w-[280px] h-8 text-sm"> {/* Reduced h-9 */}
                        <SelectValue placeholder="Select ticker speed..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="slow" className="text-sm">Slow (40s loop)</SelectItem>
                        <SelectItem value="medium" className="text-sm">Medium (30s loop)</SelectItem>
                        <SelectItem value="fast" className="text-sm">Fast (15s loop)</SelectItem>
                    </SelectContent>
                  </Select>
                   <p className="text-sm text-muted-foreground mt-0.5"> {/* Reduced mt-2 */}
                      Adjust the scrolling speed of the trade ticker.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-0.5"> {/* Reduced pb-2 */}
                <CardTitle className="text-lg font-headline flex items-center"> {/* Reduced text-lg, h-5 */}
                  <Volume2 className="mr-1.5 h-4 w-4 text-accent" /> {/* Reduced icon size */}
                  Sound & Notification Preferences
                </CardTitle>
                <CardDescription>Choose custom sounds for different platform events.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-1.5"> {/* Reduced space-y-6 */}
                {notificationEvents.map(({ event, label }) => (
                  <div key={event} className="space-y-0.5 p-1 rounded-lg border border-white/5 bg-black/10"> {/* Reduced space-y-2, p-4 */}
                    <Label htmlFor={`${event}-sound-select`} className="text-base font-medium text-foreground block"> {/* Reduced text-base */}
                      {label}
                    </Label>
                    <div className="flex items-center space-x-1"> {/* Reduced space-x-3 */}
                      <Select
                        value={notificationSounds[event]}
                        onValueChange={(value) => setNotificationSound(event, value as SoundOption)}
                      >
                        <SelectTrigger id={`${event}-sound-select`} className="flex-1 h-8 text-sm"> {/* Reduced h-9 */}
                          <SelectValue placeholder="Select sound..." />
                        </SelectTrigger>
                        <SelectContent>
                          {soundOptions.map(opt => (
                            <SelectItem key={opt.value} value={opt.value} className="text-sm">{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => playSound(notificationSounds[event])}
                        className="text-accent border-accent hover:bg-accent/10 hover:text-accent h-8 w-8" // Reduced size
                        aria-label={`Preview ${label} sound`}
                      >
                        <PlayCircle className="h-4 w-4" /> {/* Reduced icon size */}
                      </Button>
                    </div>
                  </div>
                ))}
                <div className="pt-0.5 text-center"> {/* Reduced pt-2 */}
                    <Button 
                        variant="outline" 
                        size="sm" /* Made button smaller */
                        onClick={() => {
                            notificationEvents.forEach(({event}, index) => {
                                setTimeout(() => {
                                     if (notificationSounds[event] !== 'off') {
                                        playSound(notificationSounds[event]);
                                     }
                                }, index * 700); 
                            });
                        }}
                        className="text-sm h-7 px-2"
                    >
                        Test All Sounds
                    </Button>
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  Note: Sound playback is simulated in this environment. Actual sounds require audio files.
                </p>
              </CardContent>
            </Card>
            
          </CardContent>
        </Card>
      </div>
    </main>
    <AlertMethodsModal
        isOpen={isAlertMethodsModalOpen}
        onClose={() => setIsAlertMethodsModalOpen(false)}
    />
    </>
  );
}
