
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Settings as SettingsIcon } from "lucide-react";

export default function SettingsPage() {
  return (
    <main className="flex flex-col flex-1 h-full overflow-hidden">
      <PageHeader title="Settings" />
      <div className="flex-1 p-4 md:p-6 overflow-auto">
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-headline flex items-center">
              <SettingsIcon className="mr-2 h-6 w-6 text-primary"/>
              Application Settings
            </CardTitle>
            <CardDescription>Configure your TradePilot preferences and integrations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-8 text-center text-muted-foreground">
              <SettingsIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Settings page is currently under construction.</p>
              <p>Future options will include API key management for brokers, notification preferences, and theme adjustments.</p>
            </div>
            
            {/* Example of a potential settings section */}
            {/*
            <Card>
              <CardHeader>
                <CardTitle>API Keys</CardTitle>
                <CardDescription>Manage your Interactive Brokers API connection.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  API key configuration will be available here.
                </p>
              </CardContent>
            </Card>
            */}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
