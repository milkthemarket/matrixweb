
"use client";

import { PageHeader } from "@/components/PageHeader";

export default function DocumentationPage() {
  return (
    <main className="flex flex-col flex-1 h-full overflow-hidden">
      <PageHeader title="Documentation" />
      <div className="flex items-center justify-center flex-1">
        <p className="text-muted-foreground">Documentation Page Content</p>
      </div>
    </main>
  );
}
