
"use client";

import React, { useState, useEffect } from 'react';
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { TradeAlert } from "@/types";
import { formatDistanceToNow } from 'date-fns';
import { BellRing, Info, MailOpen, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const mockAlerts: TradeAlert[] = [
  { id: '1', symbol: 'TSLA', message: 'TSLA broke above $185.00 resistance.', timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), source: 'Rule Engine' },
  { id: '2', symbol: 'AAPL', message: 'Unusual volume spike in AAPL.', timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), source: 'Volume Scanner' },
  { id: '3', symbol: 'NVDA', message: 'NVDA approaching 52-week high.', timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), source: 'Market Scanner' },
  { id: '4', symbol: 'AMD', message: 'Positive news catalyst for AMD reported.', timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), source: 'News Feed' },
];

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<TradeAlert[]>(mockAlerts);
  const [currentTime, setCurrentTime] = useState(new Date());

  const [receiveInAppAlerts, setReceiveInAppAlerts] = useState(true);
  const [sendSmsAlerts, setSendSmsAlerts] = useState(false);
  const [sendEmailAlerts, setSendEmailAlerts] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000); // Update time every minute for relative timestamps
    return () => clearInterval(timer);
  }, []);

  // Simulate new alerts
  useEffect(() => {
    const newAlertInterval = setInterval(() => {
      const newAlert: TradeAlert = {
        id: String(Date.now()),
        symbol: ['BTC', 'ETH', 'SPY', 'QQQ'][Math.floor(Math.random() * 4)],
        message: `Random alert: Price movement detected.`,
        timestamp: new Date().toISOString(),
        source: 'System Generated'
      };
      setAlerts(prevAlerts => [newAlert, ...prevAlerts].slice(0, 20)); // Keep max 20 alerts
    }, 30000); // New alert every 30 seconds
    return () => clearInterval(newAlertInterval);
  }, []);


  return (
    <main className="flex flex-col flex-1 h-full overflow-hidden">
      <PageHeader title="Trade Alerts & Settings" />
      <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-6">
        
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-headline flex items-center">
              <MailOpen className="mr-2 h-5 w-5 text-primary" />
              Alert Delivery Settings
            </CardTitle>
            <CardDescription>Choose how you want to receive your trade alerts.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-start space-x-3">
              <Checkbox 
                id="inAppAlerts" 
                checked={receiveInAppAlerts} 
                onCheckedChange={(checked) => setReceiveInAppAlerts(Boolean(checked))} 
              />
              <div className="grid gap-1.5 leading-none">
                <Label htmlFor="inAppAlerts" className="font-medium text-foreground cursor-pointer">
                  Receive alerts within MILK
                </Label>
                <p className="text-xs text-muted-foreground">
                  Notifications will appear in the Alerts Panel below.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox 
                id="smsAlerts" 
                checked={sendSmsAlerts} 
                onCheckedChange={(checked) => setSendSmsAlerts(Boolean(checked))} 
              />
              <div className="grid gap-1.5 leading-none">
                <Label htmlFor="smsAlerts" className="font-medium text-foreground cursor-pointer">
                  Send alerts via text message
                </Label>
                <p className="text-xs text-muted-foreground">
                  Requires a verified phone number. Standard messaging rates may apply.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Checkbox 
                id="emailAlerts" 
                checked={sendEmailAlerts} 
                onCheckedChange={(checked) => setSendEmailAlerts(Boolean(checked))} 
              />
              <div className="grid gap-1.5 leading-none">
                <Label htmlFor="emailAlerts" className="font-medium text-foreground cursor-pointer">
                  Send alerts via email
                </Label>
                <p className="text-xs text-muted-foreground">
                  Requires a verified email address. Alerts sent to your primary email.
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="text-accent border-accent hover:bg-accent/10 hover:text-accent">
              <Settings className="mr-2 h-4 w-4" />
              Manage Alert Methods
            </Button>
          </CardFooter>
        </Card>

        <Card className="flex-1 flex flex-col bg-transparent shadow-none rounded-none backdrop-blur-none border-none min-h-[400px]"> {/* Ensure alerts panel has enough height */}
          <CardHeader>
            <CardTitle className="text-2xl font-headline flex items-center">
              <BellRing className="mr-2 h-6 w-6 text-primary" />
              Alerts Panel
            </CardTitle>
            <CardDescription>Real-time notifications based on your rules and market events.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden">
            <ScrollArea className="h-[calc(100%-0rem)] pr-4"> {/* Adjusted height to be relative */}
              {alerts.length > 0 ? (
                <ul className="space-y-4">
                  {alerts.map((alert) => (
                    <li 
                      key={alert.id} 
                      className={cn(
                        "p-4 rounded-xl shadow-none",
                        "bg-transparent backdrop-blur-md", 
                        "hover:bg-white/5 transition-colors duration-200"
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                           <Info className="h-5 w-5 text-accent" />
                           <div>
                            <p className="font-semibold text-base text-foreground">
                              {alert.symbol}: <span className="font-normal">{alert.message}</span>
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}
                            </p>
                           </div>
                        </div>
                        {alert.source && <Badge variant="outline" className="text-xs border-accent text-accent">{alert.source}</Badge>}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <BellRing className="h-12 w-12 mb-4" />
                  <p className="text-lg">No alerts yet.</p>
                  <p>Alerts will appear here when triggered.</p>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

