
"use client";

import React from 'react';
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SlidersHorizontal } from "lucide-react";

export default function OptionsPage() {
  return (
    <main className="flex flex-col flex-1 h-full overflow-hidden">
      <PageHeader title="Options Trading" />
      <div className="flex-1 p-4 md:p-6 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="items-center">
            <SlidersHorizontal className="h-12 w-12 text-primary mb-4" />
            <CardTitle className="text-2xl font-headline text-center">
              Options Trading Tools
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-lg text-muted-foreground">
              Advanced options analysis and trading features are coming soon to MILK!
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Stay tuned for updates.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
