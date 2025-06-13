
"use client";

import React, { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import type { AlertRule } from "@/types";
import { PlusCircle, Edit3, Trash2, ListFilter } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const ruleSchema = z.object({
  name: z.string().min(1, "Rule name is required"),
  changePercentThreshold: z.coerce.number().min(-100).max(1000, "Must be between -100 and 1000"),
  floatThreshold: z.coerce.number().min(0, "Must be positive").max(100000, "Max float 100,000M (100B)"),
  isActive: z.boolean().default(true),
});

type RuleFormData = z.infer<typeof ruleSchema>;

const mockRules: AlertRule[] = [
  { id: '1', name: 'High Gainer Low Float', changePercentThreshold: 5, floatThreshold: 10, isActive: true },
  { id: '2', name: 'Significant Drop', changePercentThreshold: -10, floatThreshold: 50000, isActive: true },
  { id: '3', name: 'Volume Spike Premarket', changePercentThreshold: 3, floatThreshold: 20, isActive: false },
];

export default function RulesPage() {
  const [rules, setRules] = useState<AlertRule[]>(mockRules);
  const [editingRule, setEditingRule] = useState<AlertRule | null>(null);
  const { toast } = useToast();

  const form = useForm<RuleFormData>({
    resolver: zodResolver(ruleSchema),
    defaultValues: {
      name: '',
      changePercentThreshold: 5,
      floatThreshold: 10,
      isActive: true,
    },
  });

  const onSubmit: SubmitHandler<RuleFormData> = (data) => {
    if (editingRule) {
      setRules(rules.map(r => r.id === editingRule.id ? { ...editingRule, ...data } : r));
      toast({ title: "Rule Updated", description: `Rule "${data.name}" has been updated.` });
      setEditingRule(null);
    } else {
      const newRule: AlertRule = { id: String(Date.now()), ...data };
      setRules([...rules, newRule]);
      toast({ title: "Rule Created", description: `New rule "${data.name}" has been added.` });
    }
    form.reset();
  };

  const handleEdit = (rule: AlertRule) => {
    setEditingRule(rule);
    form.reset(rule);
  };

  const handleDelete = (ruleId: string) => {
    setRules(rules.filter(r => r.id !== ruleId));
    toast({ title: "Rule Deleted", description: "The rule has been deleted.", variant: "destructive" });
  };
  
  const toggleRuleStatus = (ruleId: string) => {
    setRules(rules.map(r => r.id === ruleId ? { ...r, isActive: !r.isActive } : r));
  };

  return (
    <main className="flex flex-col flex-1 h-full overflow-hidden">
      <PageHeader title="Alert Rules Engine" />
      <div className="flex-1 p-4 md:p-6 space-y-6 overflow-y-auto">
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-headline flex items-center">
              <ListFilter className="mr-2 h-6 w-6 text-primary"/>
              {editingRule ? 'Edit Rule' : 'Create New Alert Rule'}
            </CardTitle>
            <CardDescription>Define conditions to trigger custom trade alerts.</CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rule Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Premarket Spike Low Float" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="changePercentThreshold"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>% Change Threshold</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="e.g., 5 for +5%" {...field} />
                        </FormControl>
                        <FormDescription>Trigger if % change is greater than or equal to this value.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="floatThreshold"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Float Threshold (Millions)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="e.g., 10 for <10M float" {...field} />
                        </FormControl>
                        <FormDescription>Trigger if float is less than or equal to this value (in millions).</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                 <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                                <FormLabel>Activate Rule</FormLabel>
                                <FormDescription>
                                    Enable or disable this rule from triggering alerts.
                                </FormDescription>
                            </div>
                            <FormControl>
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                {editingRule && <Button type="button" variant="outline" onClick={() => { setEditingRule(null); form.reset(); }}>Cancel Edit</Button>}
                <Button type="submit" className="text-primary-foreground bg-primary hover:bg-primary/90">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  {editingRule ? 'Save Changes' : 'Add Rule'}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>

        <Separator />

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl font-headline">Active Rules</CardTitle>
            <CardDescription>Manage your existing alert rules.</CardDescription>
          </CardHeader>
          <CardContent>
            {rules.length > 0 ? (
              <ul className="space-y-4">
                {rules.map((rule) => (
                  <li key={rule.id} className="flex items-center justify-between p-4 rounded-lg border bg-card/50 hover:shadow-md transition-shadow">
                    <div>
                      <p className="font-semibold">{rule.name} <Badge variant={rule.isActive ? "default" : "secondary"}>{rule.isActive ? 'Active' : 'Inactive'}</Badge></p>
                      <p className="text-sm text-muted-foreground">
                        % Change &ge; {rule.changePercentThreshold}%, Float &le; {rule.floatThreshold}M
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                       <Switch
                          checked={rule.isActive}
                          onCheckedChange={() => toggleRuleStatus(rule.id)}
                          aria-label={rule.isActive ? "Deactivate rule" : "Activate rule"}
                        />
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(rule)} className="text-accent hover:text-accent-foreground">
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(rule.id)} className="text-destructive hover:text-destructive/80">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No rules defined yet. Create one above!</p>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
