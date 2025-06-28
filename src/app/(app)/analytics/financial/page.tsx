
"use client";

import { PageHeader } from "@/components/PageHeader";

export default function FinancialAnalyticsPage() {
  return (
    <main className="flex flex-col flex-1 h-full overflow-hidden">
      <PageHeader title="Financial Analytics" />
      <div className="flex items-center justify-center flex-1">
        <p className="text-muted-foreground">Financial Analytics Page Content</p>
      </div>
    </main>
  );
}
