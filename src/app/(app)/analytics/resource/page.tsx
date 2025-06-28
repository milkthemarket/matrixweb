
"use client";

import { PageHeader } from "@/components/PageHeader";

export default function ResourceMatrixPage() {
  return (
    <main className="flex flex-col flex-1 h-full overflow-hidden">
      <PageHeader title="Resource Matrix" />
      <div className="flex items-center justify-center flex-1">
        <p className="text-muted-foreground">Resource Matrix Page Content</p>
      </div>
    </main>
  );
}
