
"use client";

import { PageHeader } from "@/components/PageHeader";

export default function CrmEmailPage() {
  return (
    <main className="flex flex-col flex-1 h-full overflow-hidden">
      <PageHeader title="Email" />
      <div className="flex items-center justify-center flex-1">
        <p className="text-muted-foreground">Email Page Content</p>
      </div>
    </main>
  );
}
