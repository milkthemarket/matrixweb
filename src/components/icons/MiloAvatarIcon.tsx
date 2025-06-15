
"use client";

import React from 'react';

interface MiloAvatarIconProps {
  size?: number | string;
  className?: string;
  strokeWidth?: number | string;
}

export function MiloAvatarIcon({ 
  size = 24, 
  className,
  strokeWidth = 1.5 
}: MiloAvatarIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-labelledby="miloAvatarTitle"
    >
      <title id="miloAvatarTitle">Milo AI Assistant Icon (Cow)</title>
      {/* Simplified cow head outline */}
      <path d="M12 5C8.68629 5 6 7.68629 6 11V15C6 16.1046 6.89543 17 8 17H16C17.1046 17 18 16.1046 18 15V11C18 7.68629 15.3137 5 12 5Z" />
      {/* Simplified horns */}
      <path d="M7 5C7 3.34315 5.65685 2 4 2" />
      <path d="M17 5C17 3.34315 18.3431 2 20 2" />
      {/* Optional: Simple snout lines or nostrils if desired for more detail, keeping it minimal */}
      {/* <line x1="9" y1="14" x2="9" y2="14.01" /> */}
      {/* <line x1="15" y1="14" x2="15" y2="14.01" /> */}
    </svg>
  );
}
