
"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { TickerSpeed } from '@/types';

interface SettingsContextState {
  showManualTicker: boolean;
  setShowManualTicker: (show: boolean) => void;
  showAIAssistedTicker: boolean;
  setShowAIAssistedTicker: (show: boolean) => void;
  showAutopilotTicker: boolean; // Renamed from showFullyAITicker
  setShowAutopilotTicker: (show: boolean) => void; // Renamed from setShowFullyAITicker
  tickerSpeed: TickerSpeed;
  setTickerSpeed: (speed: TickerSpeed) => void;
}

const SettingsContext = createContext<SettingsContextState | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [showManualTicker, setShowManualTicker] = useState(false); 
  const [showAIAssistedTicker, setShowAIAssistedTicker] = useState(true); 
  const [showAutopilotTicker, setShowAutopilotTicker] = useState(true); // Renamed state variable
  const [tickerSpeed, setTickerSpeed] = useState<TickerSpeed>('medium'); 

  return (
    <SettingsContext.Provider
      value={{
        showManualTicker,
        setShowManualTicker,
        showAIAssistedTicker,
        setShowAIAssistedTicker,
        showAutopilotTicker, // Updated
        setShowAutopilotTicker, // Updated
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
