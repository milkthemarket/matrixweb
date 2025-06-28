
"use client";

import { PageHeader } from "@/components/PageHeader";

export default function CrmFilesPage() {
  return (
    <main className="flex flex-col flex-1 h-full overflow-hidden">
      <PageHeader title="Files" />
      <div className="flex items-center justify-center flex-1">
        <p className="text-muted-foreground">Files Page Content</p>
      </div>
    </main>
  );
}
