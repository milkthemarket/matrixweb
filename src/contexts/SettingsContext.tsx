
"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { TickerSpeed } from '@/types';

interface SettingsContextState {
  showManualTicker: boolean;
  setShowManualTicker: (show: boolean) => void;
  showAIAssistedTicker: boolean;
  setShowAIAssistedTicker: (show: boolean) => void;
  showFullyAITicker: boolean;
  setShowFullyAITicker: (show: boolean) => void;
  tickerSpeed: TickerSpeed;
  setTickerSpeed: (speed: TickerSpeed) => void;
}

const SettingsContext = createContext<SettingsContextState | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [showManualTicker, setShowManualTicker] = useState(false); // Default to false
  const [showAIAssistedTicker, setShowAIAssistedTicker] = useState(true); // Default to true
  const [showFullyAITicker, setShowFullyAITicker] = useState(true); // Default to true
  const [tickerSpeed, setTickerSpeed] = useState<TickerSpeed>('medium'); // Default to medium

  return (
    <SettingsContext.Provider
      value={{
        showManualTicker,
        setShowManualTicker,
        showAIAssistedTicker,
        setShowAIAssistedTicker,
        showFullyAITicker,
        setShowFullyAITicker,
        tickerSpeed,
        setTickerSpeed,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettingsContext() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettingsContext must be used within a SettingsProvider');
  }
  return context;
}
