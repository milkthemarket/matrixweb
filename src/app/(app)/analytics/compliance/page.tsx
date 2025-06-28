
"use client";

import { PageHeader } from "@/components/PageHeader";

export default function ComplianceMatrixPage() {
  return (
    <main className="flex flex-col flex-1 h-full overflow-hidden">
      <PageHeader title="Compliance Matrix" />
      <div className="flex items-center justify-center flex-1">
        <p className="text-muted-foreground">Compliance Matrix Page Content</p>
      </div>
    </main>
  );
}
