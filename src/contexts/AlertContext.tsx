
"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

export type RefreshInterval = 15000 | 30000 | 60000; // 15s, 30s, 1m in milliseconds

interface AlertContextState {
  autoRefreshEnabled: boolean;
  setAutoRefreshEnabled: (enabled: boolean) => void;
  refreshInterval: RefreshInterval;
  setRefreshInterval: (interval: RefreshInterval) => void;
}

const AlertContext = createContext<AlertContextState | undefined>(undefined);

export function AlertProvider({ children }: { children: ReactNode }) {
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState<RefreshInterval>(30000); // Default to 30s

  return (
    <AlertContext.Provider 
      value={{ 
        autoRefreshEnabled, 
        setAutoRefreshEnabled, 
        refreshInterval, 
        setRefreshInterval 
      }}
    >
      {children}
    </AlertContext.Provider>
  );
}

export function useAlertContext() {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error('useAlertContext must be used within an AlertProvider');
  }
  return context;
}
