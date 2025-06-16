
"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { TickerSpeed, SoundOption, NotificationSoundEvent } from '@/types';

interface SettingsContextState {
  showManualTicker: boolean;
  setShowManualTicker: (show: boolean) => void;
  showAIAssistedTicker: boolean;
  setShowAIAssistedTicker: (show: boolean) => void;
  showAutopilotTicker: boolean;
  setShowAutopilotTicker: (show: boolean) => void;
  tickerSpeed: TickerSpeed;
  setTickerSpeed: (speed: TickerSpeed) => void;
  notificationSounds: Record<NotificationSoundEvent, SoundOption>;
  setNotificationSound: (event: NotificationSoundEvent, sound: SoundOption) => void;
  playSound: (sound: SoundOption) => void;
}

const SettingsContext = createContext<SettingsContextState | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [showManualTicker, setShowManualTicker] = useState(false);
  const [showAIAssistedTicker, setShowAIAssistedTicker] = useState(true);
  const [showAutopilotTicker, setShowAutopilotTicker] = useState(true);
  const [tickerSpeed, setTickerSpeed] = useState<TickerSpeed>('medium');
  const [notificationSounds, setNotificationSounds] = useState<Record<NotificationSoundEvent, SoundOption>>({
    mooAlert: 'moo',
    tradePlaced: 'chime',
    tradeClosed: 'chime',
  });

  const setNotificationSound = (event: NotificationSoundEvent, sound: SoundOption) => {
    setNotificationSounds(prev => ({ ...prev, [event]: sound }));
  };

  const playSound = (sound: SoundOption) => {
    if (sound === 'off') return;
    // In a real application, you would use the Audio API here.
    // Example:
    // const audio = new Audio(`/sounds/${sound}.mp3`); // Assuming sounds are in public/sounds
    // audio.play().catch(error => console.error("Error playing sound:", error));
    console.log(`Playing sound: ${sound}`);
    // For "moo" specifically:
    if (sound === 'moo') {
        console.log("🐄 Moo! 🐄");
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        showManualTicker,
        setShowManualTicker,
        showAIAssistedTicker,
        setShowAIAssistedTicker,
        showAutopilotTicker,
        setShowAutopilotTicker,
        tickerSpeed,
        setTickerSpeed,
        notificationSounds,
        setNotificationSound,
        playSound,
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
