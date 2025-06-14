
"use client";

import React, { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// Using Label from ui/label directly as FormLabel is tied to react-hook-form context
import { Label } from "@/components/ui/label"; 
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
// FormField, FormItem etc are removed if not using Form context for basic switch
// import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import type { AlertRule, RuleCriterion } from "@/types";
import { PlusCircle, Edit3, Trash2, ListFilter, Terminal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from '@/lib/utils';

const simpleRuleSchema = z.object({
  name: z.string().min(1, "Rule name is required"),
  isActive: z.boolean().default(true),
});

type SimpleRuleFormData = z.infer<typeof simpleRuleSchema>;

export const mockRules: AlertRule[] = [
  { 
    id: 'rule1', 
    name: 'Low Float Breakout', 
    isActive: true, 
    criteria: [
      { metric: 'changePercent', operator: '>=', value: 5 },
      { metric: 'float', operator: '<=', value: 20 }, 
      { metric: 'volume', operator: '>=', value: 1 }, 
      { metric: 'price', operator: '>=', value: 1 },
      { metric: 'price', operator: '<=', value: 20 },
    ]
  },
  { 
    id: 'rule2', 
    name: 'High Volume Movers', 
    isActive: true, 
    criteria: [
      { metric: 'volume', operator: '>=', value: 10 }, 
      { metric: 'avgVolume', operator: '>=', value: 5 }, 
      { metric: 'changePercent', operator: '>=', value: 3 },
    ]
  },
  { 
    id: 'rule3', 
    name: 'Potential Squeezers', 
    isActive: false, 
    criteria: [
      { metric: 'shortFloat', operator: '>=', value: 20 }, 
      { metric: 'float', operator: '<=', value: 50 }, 
      { metric: 'changePercent', operator: '>=', value: 2 },
    ]
  },
   {
    id: 'rule4',
    name: 'Pre-Market Gappers',
    isActive: true,
    criteria: [
      { metric: 'premarketChange', operator: '>=', value: 4 },
      { metric: 'volume', operator: '>=', value: 0.2 }, 
      { metric: 'float', operator: '<=', value: 100 },
    ],
  },
  {
    id: 'rule5',
    name: 'RSI Oversold Bounce Play',
    isActive: true,
    criteria: [
      { metric: 'rsi', operator: '<=', value: 30 },
      { metric: 'changePercent', operator: '<=', value: -2 }, 
      { metric: 'volume', operator: '>=', value: 0.5 },
    ],
  },
];

const formatCriterion = (criterion: RuleCriterion): string => {
  const metricLabel = criterion.metric.toString().replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  let valueDisplay = criterion.value;
  if (Array.isArray(criterion.value)) {
    valueDisplay = `${criterion.value[0]} and ${criterion.value[1]}`;
  }
  return `${metricLabel} ${criterion.operator} ${valueDisplay}`;
};

export default function RulesPage() {
  const [rules, setRules] = useState<AlertRule[]>(mockRules);
  const [editingRule, setEditingRule] = useState<AlertRule | null>(null);
  const { toast } = useToast();

  // Using react-hook-form's useForm hook
  const form = useForm<SimpleRuleFormData>({
    resolver: zodResolver(simpleRuleSchema),
    defaultValues: {
      name: '',
      isActive: true,
    },
  });

  const onSubmit: SubmitHandler<SimpleRuleFormData> = (data) => {
    if (editingRule) {
      setRules(rules.map(r => r.id === editingRule.id ? { ...r, name: data.name, isActive: data.isActive } : r));
      toast({ title: "Rule Updated", description: `Rule "${data.name}" has been updated.` });
      setEditingRule(null);
    } else {
      const newRule: AlertRule = { 
        id: String(Date.now()), 
        name: data.name, 
        isActive: data.isActive, 
        criteria: [] 
      };
      setRules([...rules, newRule]);
      toast({ title: "Rule Created", description: `New rule "${data.name}" has been added (with no criteria).` });
    }
    form.reset({ name: '', isActive: true });
  };

  const handleEdit = (rule: AlertRule) => {
    setEditingRule(rule);
    form.reset({ name: rule.name, isActive: rule.isActive });
  };

  const handleDelete = (ruleId: string) => {
    setRules(rules.filter(r => r.id !== ruleId));
    toast({ title: "Rule Deleted", description: "The rule has been deleted.", variant: "destructive" });
  };
  
  const toggleRuleStatus = (ruleId: string) => {
    setRules(rules.map(r => r.id === ruleId ? { ...r, isActive: !r.isActive } : r));
     const rule = rules.find(r => r.id === ruleId);
    if (rule) {
      toast({
        title: `Rule ${!rule.isActive ? "Activated" : "Deactivated"}`,
        description: `Rule "${rule.name}" is now ${!rule.isActive ? "active" : "inactive"}.`,
      });
    }
  };

  return (
    <main className="flex flex-col flex-1 h-full overflow-hidden">
      <PageHeader title="Alert Rules Engine" />
      <div className="flex-1 p-4 md:p-6 space-y-6 overflow-y-auto">
        <Card> {/* This Card will inherit new global style */}
          <CardHeader>
            <CardTitle className="text-2xl font-headline flex items-center">
              <ListFilter className="mr-2 h-6 w-6 text-primary"/>
              {editingRule ? 'Edit Rule Info' : 'Create New Rule (Basic)'}
            </CardTitle>
            <CardDescription>Define rule name and status. Complex criteria are managed via predefined rules for now.</CardDescription>
          </CardHeader>
          {/* Reverted to basic form handling without react-hook-form Form provider for simplicity here */}
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="ruleName">Rule Name</Label>
                <Input 
                  id="ruleName" 
                  placeholder="e.g., Premarket Spike Low Float" 
                  {...form.register("name")} 
                  className="bg-transparent"
                />
                {form.formState.errors.name && <p className="text-xs text-destructive mt-1">{form.formState.errors.name.message}</p>}
              </div>
              
              <div className="flex flex-row items-center justify-between rounded-lg border border-white/5 p-3 shadow-sm bg-black/10">
                <div className="space-y-0.5">
                    <Label htmlFor="isActiveSwitch" className="font-medium text-foreground cursor-pointer">Activate Rule</Label>
                    <p className="text-xs text-muted-foreground">
                        Enable or disable this rule from triggering alerts and appearing in dashboard.
                    </p>
                </div>
                <Switch
                    id="isActiveSwitch"
                    checked={form.watch("isActive")}
                    onCheckedChange={(checked) => form.setValue("isActive", checked)}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              {editingRule && <Button type="button" variant="outline" onClick={() => { setEditingRule(null); form.reset({name: '', isActive: true }); }}>Cancel Edit</Button>}
              <Button type="submit" className="text-primary-foreground bg-primary hover:bg-primary/90">
                <PlusCircle className="mr-2 h-4 w-4" />
                {editingRule ? 'Save Changes' : 'Add Basic Rule'}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <Separator className="border-white/5"/>

        <Card> {/* This Card will inherit new global style */}
          <CardHeader>
            <CardTitle className="text-xl font-headline">Defined Rules</CardTitle>
            <CardDescription>Manage your existing alert rules. Dashboard filters based on these.</CardDescription>
          </CardHeader>
          <CardContent>
            {rules.length > 0 ? (
              <ul className="space-y-4">
                {rules.map((rule) => (
                  <li 
                    key={rule.id} 
                    className={cn(
                      "flex items-start md:items-center justify-between p-4 rounded-xl shadow-none flex-col md:flex-row border border-white/5", 
                      "bg-black/10 backdrop-blur-md", 
                      "hover:bg-white/10 transition-colors duration-200"
                    )}
                  >
                    <div className="flex-1 mb-3 md:mb-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-foreground">{rule.name} </p>
                        <Badge 
                            variant={rule.isActive ? "default" : "secondary"}
                            className={cn(
                              "text-xs h-5",
                              rule.isActive ? "bg-[hsl(var(--confirm-green))] text-[hsl(var(--confirm-green-foreground))]" : "bg-muted text-muted-foreground"
                            )}
                          >
                            {rule.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                      </div>
                      {rule.criteria.length > 0 ? (
                        <div className="text-xs text-muted-foreground space-y-0.5">
                          {rule.criteria.map((crit, index) => (
                            <div key={index} className="flex items-center">
                              <Terminal className="h-3 w-3 mr-1.5 text-accent flex-shrink-0"/> 
                              <span>{formatCriterion(crit)}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground italic">No criteria defined for this rule.</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                       <Switch
                          checked={rule.isActive}
                          onCheckedChange={() => toggleRuleStatus(rule.id)}
                          aria-label={rule.isActive ? "Deactivate rule" : "Activate rule"}
                        />
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(rule)} className="text-accent hover:text-accent-foreground hover:bg-accent/10">
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(rule.id)} className="text-destructive hover:text-destructive-foreground hover:bg-destructive/10">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No rules defined yet. Create one above or use the predefined ones.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
