
'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SlidersHorizontal, Save } from 'lucide-react';
import type { Stock, AlertRule, RuleCriterion } from '@/types';
import { useToast } from "@/hooks/use-toast";

type FilterValue = { min?: string; max?: string; };
export type ActiveScreenerFilters = Record<string, FilterValue & { active: boolean }>;

interface ScreenerFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeFilters: Partial<ActiveScreenerFilters>;
  onApplyFilters: (filters: Partial<ActiveScreenerFilters>) => void;
}

const filterConfig: Record<string, Array<{ key: keyof Stock; label: string; unit?: string; }>> = {
  'Market': [
    { key: 'marketCap', label: 'Market Cap', unit: 'B' },
    { key: 'float', label: 'Float', unit: 'M' },
  ],
  'Quotes Indicator': [
    { key: 'price', label: 'Price', unit: '$' },
    { key: 'changePercent', label: '% Change', unit: '%' },
    { key: 'volume', label: 'Volume', unit: 'M' },
    { key: 'avgVolume', label: 'Avg Vol', unit: 'M' },
  ],
  'Financial Indicator': [
    { key: 'peRatio', label: 'P/E Ratio' },
    { key: 'dividendYield', label: 'Div Yield', unit: '%' },
    { key: 'shortFloat', label: 'Short Float', unit: '%' },
    { key: 'instOwn', label: 'Inst. Own', unit: '%' },
  ],
  'Technical Indicators and Signals': [
    { key: 'rsi', label: 'RSI' },
    { key: 'atr', label: 'ATR' },
    { key: 'beta', label: 'Beta' },
  ],
};

const RULES_STORAGE_KEY = 'tradeflow-alert-rules';

export function ScreenerFilterModal({ isOpen, onClose, activeFilters, onApplyFilters }: ScreenerFilterModalProps) {
  const [localFilters, setLocalFilters] = useState<Partial<ActiveScreenerFilters>>({});
  const [isSavingRule, setIsSavingRule] = useState(false);
  const [newRuleName, setNewRuleName] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setLocalFilters(JSON.parse(JSON.stringify(activeFilters))); // Deep copy
      setIsSavingRule(false);
      setNewRuleName('');
    }
  }, [isOpen, activeFilters]);

  const handleCheckboxChange = (key: keyof Stock, checked: boolean) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: { ...prev[key], active: checked },
    }));
  };

  const handleInputChange = (key: keyof Stock, type: 'min' | 'max', value: string) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: { ...(prev[key] || { active: false }), active: true, [type]: value },
    }));
  };

  const handleReset = () => {
    setLocalFilters({});
    onApplyFilters({});
  };

  const handleApply = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  const handleSaveAsRule = () => {
    if (!newRuleName.trim()) {
        toast({ variant: "destructive", title: "Rule name cannot be empty." });
        return;
    }

    const criteria: RuleCriterion[] = Object.entries(localFilters)
        .filter(([, filterValue]) => filterValue.active)
        .flatMap(([key, filterValue]) => {
            const rules: RuleCriterion[] = [];
            const keyTyped = key as keyof Stock;
            const config = Object.values(filterConfig).flat().find(f => f.key === keyTyped);

            // Handle market cap conversion from Billions back to raw number
            const toRawValue = (val: string) => {
                let num = parseFloat(val);
                if (keyTyped === 'marketCap' && config?.unit === 'B') {
                    return num * 1e9;
                }
                return num;
            };

            if (filterValue.min && !isNaN(parseFloat(filterValue.min))) {
                rules.push({ metric: key, operator: '>=', value: toRawValue(filterValue.min) });
            }
            if (filterValue.max && !isNaN(parseFloat(filterValue.max))) {
                rules.push({ metric: key, operator: '<=', value: toRawValue(filterValue.max) });
            }
            return rules;
        }).filter(r => !isNaN(r.value as number));

    if (criteria.length === 0) {
        toast({ variant: "destructive", title: "No active filters to save." });
        return;
    }

    const newRule: AlertRule = {
        id: `rule${Date.now()}`,
        name: newRuleName.trim(),
        isActive: true,
        criteria,
    };

    try {
        const savedRulesJSON = localStorage.getItem(RULES_STORAGE_KEY);
        const currentRules: AlertRule[] = savedRulesJSON ? JSON.parse(savedRulesJSON) : [];
        const updatedRules = [...currentRules, newRule];
        localStorage.setItem(RULES_STORAGE_KEY, JSON.stringify(updatedRules));
        window.dispatchEvent(new Event('rules-updated'));
        toast({ title: "Rule Saved", description: `"${newRule.name}" has been added to your rules.` });
        setIsSavingRule(false);
        setNewRuleName("");
    } catch (error) {
        console.error("Failed to save rule", error);
        toast({ variant: "destructive", title: "Error saving rule." });
    }
  };


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl bg-background border-border/20">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <SlidersHorizontal className="mr-2 h-5 w-5 text-primary" />
            Screener Filters
          </DialogTitle>
          <DialogDescription>
            Customize your screener by applying one or more filters.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] p-1 pr-4">
          <div className="space-y-6 py-4">
            {Object.entries(filterConfig).map(([groupTitle, filters]) => (
              <div key={groupTitle} className="space-y-4">
                <h4 className="text-sm font-semibold text-foreground">{groupTitle}</h4>
                <div className="space-y-3 pl-2">
                  {filters.map(({ key, label, unit }) => (
                    <div key={key} className="flex items-center gap-3">
                      <Checkbox
                        id={`filter-${key}`}
                        checked={localFilters[key]?.active || false}
                        onCheckedChange={(checked) => handleCheckboxChange(key, Boolean(checked))}
                      />
                      <Label htmlFor={`filter-${key}`} className="w-32 text-xs text-muted-foreground">
                        {label} {unit && `(${unit})`}
                      </Label>
                      <div className="flex-1 grid grid-cols-2 gap-2">
                        <Input
                          type="number"
                          placeholder="Min"
                          value={localFilters[key]?.min || ''}
                          onChange={(e) => handleInputChange(key, 'min', e.target.value)}
                          disabled={!localFilters[key]?.active}
                          className="h-8 text-xs bg-transparent"
                        />
                        <Input
                          type="number"
                          placeholder="Max"
                          value={localFilters[key]?.max || ''}
                          onChange={(e) => handleInputChange(key, 'max', e.target.value)}
                          disabled={!localFilters[key]?.active}
                          className="h-8 text-xs bg-transparent"
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <Separator className="bg-border/10" />
              </div>
            ))}
          </div>
        </ScrollArea>
        {isSavingRule && (
          <div className="p-4 border-t border-border/20 space-y-2">
            <Label htmlFor="newRuleName" className="text-sm font-medium">Save Filters as New Rule</Label>
            <div className="flex items-center gap-2">
              <Input
                id="newRuleName"
                placeholder="Enter rule name..."
                value={newRuleName}
                onChange={(e) => setNewRuleName(e.target.value)}
                className="h-8 text-xs bg-transparent"
              />
              <Button size="sm" onClick={handleSaveAsRule}>Save</Button>
              <Button size="sm" variant="ghost" onClick={() => setIsSavingRule(false)}>Cancel</Button>
            </div>
          </div>
        )}
        <DialogFooter className="gap-2 sm:gap-0 pt-4 border-t border-border/20">
          <Button type="button" variant="ghost" onClick={handleReset}>
            Reset Filters
          </Button>
          <div className="flex items-center gap-2">
            {!isSavingRule && (
              <Button type="button" variant="outline" onClick={() => setIsSavingRule(true)}>
                <Save className="mr-2 h-4 w-4" /> Save as Rule
              </Button>
            )}
            <Button type="button" onClick={handleApply}>
              Apply Filters
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
