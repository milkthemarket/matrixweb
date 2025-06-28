"use client";
import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface PlaceholderCardProps {
  children?: React.ReactNode;
  title: string;
  value?: string;
  description?: React.ReactNode;
  icon?: React.ElementType;
  iconClassName?: string;
}

export function PlaceholderCard({ children, title, value, description, icon: Icon, iconClassName }: PlaceholderCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
            {Icon && <Icon className={cn("h-4 w-4 text-muted-foreground", iconClassName)} />}
        </div>
      </CardHeader>
      <CardContent>
        {value && <div className="text-2xl font-bold text-foreground">{value}</div>}
        {description && <div className="text-xs text-muted-foreground">{description}</div>}
        {children}
      </CardContent>
    </Card>
  );
}
