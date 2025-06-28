
"use client";

import { PageHeader } from "@/components/PageHeader";

export default function ContributionMatrixPage() {
  return (
    <main className="flex flex-col flex-1 h-full overflow-hidden">
      <PageHeader title="Contribution Matrix" />
      <div className="flex items-center justify-center flex-1">
        <p className="text-muted-foreground">Contribution Matrix Page Content</p>
      </div>
    </main>
  );
}
