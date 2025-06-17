
"use client";

import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SpilledMilkPage() {
  return (
    <main className="flex flex-col flex-1 h-full overflow-hidden">
      <PageHeader title="Spilled Milk" />
      <div className="flex-1 p-4 md:p-6 flex flex-col items-center justify-center text-center">
        <Card className="w-full max-w-2xl bg-black/20 border border-white/10 shadow-xl">
          <CardHeader>
            <CardTitle className="text-3xl font-headline text-primary">Spilled Milk</CardTitle>
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
