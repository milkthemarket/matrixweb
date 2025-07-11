
"use client";

import React, { useState, useEffect } from 'react';
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

const RULES_STORAGE_KEY = 'tradeflow-alert-rules';

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
  const [rules, setRules] = useState<AlertRule[]>([]);
  const [editingRule, setEditingRule] = useState<AlertRule | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const savedRulesJSON = localStorage.getItem(RULES_STORAGE_KEY);
      if (savedRulesJSON) {
        setRules(JSON.parse(savedRulesJSON));
      } else {
        setRules(mockRules);
        localStorage.setItem(RULES_STORAGE_KEY, JSON.stringify(mockRules));
      }
    } catch (error) {
      console.error("Failed to load rules from localStorage", error);
      setRules(mockRules);
    }
  }, []);

  const updateRulesAndNotify = (newRules: AlertRule[]) => {
      setRules(newRules);
      localStorage.setItem(RULES_STORAGE_KEY, JSON.stringify(newRules));
      window.dispatchEvent(new Event('rules-updated'));
  };

  const form = useForm<SimpleRuleFormData>({
    resolver: zodResolver(simpleRuleSchema),
    defaultValues: {
      name: '',
      isActive: true,
    },
  });

  const onSubmit: SubmitHandler<SimpleRuleFormData> = (data) => {
    if (editingRule) {
      const newRules = rules.map(r => r.id === editingRule.id ? { ...r, name: data.name, isActive: data.isActive } : r)
      updateRulesAndNotify(newRules);
      toast({ title: "Rule Updated", description: `Rule "${data.name}" has been updated.` });
      setEditingRule(null);
    } else {
      const newRule: AlertRule = { 
        id: String(Date.now()), 
        name: data.name, 
        isActive: data.isActive, 
        criteria: [] // Basic rule creation doesn't set criteria from this form
      };
      updateRulesAndNotify([...rules, newRule]);
      toast({ title: "Rule Created", description: `New rule "${data.name}" has been added (with no criteria).` });
    }
    form.reset({ name: '', isActive: true });
  };

  const handleEdit = (rule: AlertRule) => {
    setEditingRule(rule);
    form.reset({ name: rule.name, isActive: rule.isActive });
  };

  const handleDelete = (ruleId: string) => {
    const newRules = rules.filter(r => r.id !== ruleId);
    updateRulesAndNotify(newRules);
    toast({ title: "Rule Deleted", description: "The rule has been deleted.", variant: "destructive" });
  };
  
  const toggleRuleStatus = (ruleId: string) => {
    const newRules = rules.map(r => r.id === ruleId ? { ...r, isActive: !r.isActive } : r)
    updateRulesAndNotify(newRules);
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
      <div className="flex-1 p-1 md:p-1.5 space-y-1.5 overflow-y-auto">
        <Card> 
          <CardHeader>
            <CardTitle className="text-xl font-headline flex items-center">
              <ListFilter className="mr-1.5 h-5 w-5 text-primary"/>
              {editingRule ? 'Edit Rule Info' : 'Create New Rule'}
            </CardTitle>
            <CardDescription>Create, manage, and toggle your custom alert rules. Active rules will generate Moo Alerts.</CardDescription>
          </CardHeader>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-1.5">
              <div>
                <Label htmlFor="ruleName">Rule Name</Label>
                <Input 
                  id="ruleName" 
                  placeholder="e.g., Premarket Spike Low Float" 
                  {...form.register("name")} 
                  className="bg-transparent text-base h-9"
                />
                {form.formState.errors.name && <p className="text-sm text-destructive mt-0.5">{form.formState.errors.name.message}</p>}
              </div>
              
              <div className="flex flex-row items-center justify-between rounded-lg border border-white/5 p-1 shadow-sm bg-black/10">
                <div className="space-y-0.5">
                    <Label htmlFor="isActiveSwitch" className="font-medium text-foreground cursor-pointer">Activate Rule</Label>
                    <p className="text-sm text-muted-foreground">
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
            <CardFooter className="flex justify-end gap-0.5">
              {editingRule && <Button type="button" variant="outline" size="sm" onClick={() => { setEditingRule(null); form.reset({name: '', isActive: true }); }}>Cancel Edit</Button>}
              <Button type="submit" size="sm" className="text-primary-foreground bg-primary hover:bg-primary/90">
                <PlusCircle className="mr-1 h-3.5 w-3.5" />
                {editingRule ? 'Save Changes' : 'Add Rule'}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <Separator className="border-white/5 my-1.5"/>

        <Card> 
          <CardHeader>
            <CardTitle className="text-lg font-headline">Defined Rules</CardTitle>
            <CardDescription>Manage your existing alert rules. Dashboard filters based on these.</CardDescription>
          </CardHeader>
          <CardContent>
            {rules.length > 0 ? (
              <ul className="space-y-1">
                {rules.map((rule) => (
                  <li 
                    key={rule.id} 
                    className={cn(
                      "flex items-start md:items-center justify-between p-2 rounded-lg shadow-none flex-col md:flex-row border border-white/5", 
                      "bg-black/10 backdrop-blur-md", 
                      "hover:bg-white/10 transition-colors duration-200"
                    )}
                  >
                    <div className="flex-1 mb-1 md:mb-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-foreground text-base">{rule.name} </p>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-sm h-5 px-1.5 py-0.5 border",
                            rule.isActive 
                              ? "border-[hsl(var(--confirm-green))] text-[hsl(var(--confirm-green))] bg-transparent shadow-[0_0_8px_hsl(var(--confirm-green)/0.5)]" 
                              : "border-muted/50 text-muted-foreground bg-muted/20"
                          )}
                        >
                          {rule.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      {rule.criteria.length > 0 ? (
                        <div className="text-sm text-muted-foreground space-y-px">
                          {rule.criteria.map((crit, index) => (
                            <div key={index} className="flex items-center">
                              <Terminal className="h-3 w-3 mr-1 text-accent flex-shrink-0"/>
                              <span>{formatCriterion(crit)}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">No criteria defined for this rule.</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-0.5 flex-shrink-0">
                       <Switch
                          checked={rule.isActive}
                          onCheckedChange={() => toggleRuleStatus(rule.id)}
                          aria-label={rule.isActive ? "Deactivate rule" : "Activate rule"}
                          className="h-5 w-9 data-[state=checked]:[&>span]:translate-x-4 [&>span]:h-4 [&>span]:w-4"
                        />
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(rule)} className="text-accent hover:text-accent-foreground hover:bg-accent/10 h-6 w-6">
                        <Edit3 className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(rule.id)} className="text-destructive hover:text-destructive-foreground hover:bg-destructive/10 h-6 w-6">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-base text-muted-foreground">No rules defined yet. Create one above or use the predefined ones.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
    
