
"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SettingsContextState {
  showManualTicker: boolean;
  setShowManualTicker: (show: boolean) => void;
}

const SettingsContext = createContext<SettingsContextState | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [showManualTicker, setShowManualTicker] = useState(false); // Default to false

  return (
    <SettingsContext.Provider 
      value={{ 
        showManualTicker, 
        setShowManualTicker,
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
