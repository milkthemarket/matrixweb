
"use client";

import { PageHeader } from "@/components/PageHeader";

export default function CrmHomePage() {
  return (
    <main className="flex flex-col flex-1 h-full overflow-hidden">
      <PageHeader title="Home" />
      <div className="flex items-center justify-center flex-1">
        <p className="text-muted-foreground">CRM Home Page Content</p>
      </div>
    </main>
  );
}
