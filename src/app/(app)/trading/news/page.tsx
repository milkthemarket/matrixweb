"use client";

import * as React from 'react';
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Newspaper, Rss, Search, SlidersHorizontal } from 'lucide-react';

export default function NewsPage() {
  const [activeTab, setActiveTab] = React.useState('news');

  return (
    <main className="flex flex-col flex-1 h-full overflow-hidden">
      <PageHeader title="News" />
      <div className="flex-1 p-4 md:p-6 space-y-4 flex flex-col">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-1 bg-muted/30 p-1 rounded-md w-full sm:w-auto">
                <Button
                    variant={activeTab === 'news' ? 'default' : 'ghost'}
                    onClick={() => setActiveTab('news')}
                    className="flex-1 sm:flex-initial"
                >
                    <Newspaper className="mr-2 h-4 w-4" /> News
                </Button>
                <Button
                    variant={activeTab === 'alerts' ? 'default' : 'ghost'}
                    onClick={() => setActiveTab('alerts')}
                    className="flex-1 sm:flex-initial"
                >
                   <Rss className="mr-2 h-4 w-4" /> Alerts
                </Button>
            </div>
            <div className="flex items-center gap-2">
                <Input
                    placeholder="Search headlines..."
                    className="h-9 w-full sm:w-64 bg-transparent"
                />
                <Button variant="outline" size="icon" className="h-9 w-9">
                    <Search className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="h-9 w-9">
                    <SlidersHorizontal className="h-4 w-4" />
                </Button>
            </div>
        </div>

        <div className="rounded-lg overflow-auto flex-1 border border-border/10">
            <Table>
                <TableHeader className="sticky top-0 bg-card/[.05] backdrop-blur-md z-10">
                    <TableRow>
                        <TableHead className="w-[120px]">Time</TableHead>
                        <TableHead className="w-[100px]">Symbol</TableHead>
                        <TableHead>Headline</TableHead>
                        <TableHead className="w-[120px]">Sentiment</TableHead>
                        <TableHead className="w-[150px]">Provider</TableHead>
                        <TableHead className="w-[100px] text-center">Alerts</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                   {/* Rows will be populated later */}
                </TableBody>
            </Table>
        </div>
      </div>
    </main>
  );
}