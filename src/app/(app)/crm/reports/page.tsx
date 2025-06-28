
"use client";

import { PageHeader } from "@/components/PageHeader";

export default function CrmReportsPage() {
  return (
    <main className="flex flex-col flex-1 h-full overflow-hidden">
      <PageHeader title="Reports" />
      <div className="flex items-center justify-center flex-1">
        <p className="text-muted-foreground">Reports Page Content</p>
      </div>
    </main>
  );
}
