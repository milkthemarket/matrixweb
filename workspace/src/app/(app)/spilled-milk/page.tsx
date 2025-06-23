
"use client";

import React from 'react';
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArchiveX } from 'lucide-react';

export default function SpilledMilkPage() {

  return (
    <main className="flex flex-col flex-1 h-full overflow-hidden">
      <PageHeader title="Spilled Milk" />
      <div className="flex-1 p-2 md:p-4 flex items-center justify-center">
        
        <Card className="w-full max-w-2xl bg-black/20 border border-white/10 shadow-xl text-center">
          <CardHeader>
            <CardTitle className="text-2xl font-headline text-primary flex items-center justify-center">
              <ArchiveX className="mr-2 h-6 w-6" />
              Analyze & Learn
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg text-muted-foreground">
              Review your trades, spot what went wrong, and turn mistakes into momentum.
            </p>
            <p className="mt-6 text-sm text-muted-foreground/70">
              (Content and analysis tools coming soon!)
            </p>
          </CardContent>
        </Card>

      </div>
    </main>
  );
}
