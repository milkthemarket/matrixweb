
"use client";

import { PageHeader } from "@/components/PageHeader";

export default function ClientAnalyticsPage() {
  return (
    <main className="flex flex-col flex-1 h-full overflow-hidden">
      <PageHeader title="Client Analytics" />
      <div className="flex items-center justify-center flex-1">
        <p className="text-muted-foreground">Client Analytics Page Content</p>
      </div>
    </main>
  );
}
