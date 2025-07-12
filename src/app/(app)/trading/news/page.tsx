
"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Loader2 } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function NewsPage() {
  return (
    <main className="flex flex-col flex-1 h-full overflow-hidden p-4 md:p-6 space-y-4">
        {/* Header Section */}
        <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-foreground">News</h1>
        </div>
        
        {/* Filters and Search Section */}
        <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
                <Select defaultValue="all_sources">
                    <SelectTrigger className="w-auto h-9 text-xs">
                        <SelectValue placeholder="Source" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all_sources">All Sources</SelectItem>
                        <SelectItem value="reuters">Reuters</SelectItem>
                        <SelectItem value="bloomberg">Bloomberg</SelectItem>
                        <SelectItem value="wsj">Wall Street Journal</SelectItem>
                    </SelectContent>
                </Select>
                <Select defaultValue="us_market">
                    <SelectTrigger className="w-auto h-9 text-xs">
                        <SelectValue placeholder="Market" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="us_market">US Market</SelectItem>
                        <SelectItem value="global">Global</SelectItem>
                        <SelectItem value="crypto">Crypto</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="relative w-full max-w-xs">
                <Input
                    placeholder="Search symbol..."
                    className="h-9 w-full pl-8 rounded-full"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
        </div>

        {/* Table Section */}
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
                   {/* Table body is intentionally left empty for now */}
                </TableBody>
            </Table>
        </div>
    </main>
  );
}
