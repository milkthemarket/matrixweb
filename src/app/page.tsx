"use client";

import Link from 'next/link';
import { Sun } from 'lucide-react';
import { MiloAvatarIcon } from '@/components/icons/MiloAvatarIcon';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col font-body">
      {/* Header */}
      <header className="flex justify-between items-center p-6">
        {/* Logo */}
        <Link href="/trading/dashboard" legacyBehavior>
          <a className="flex items-center gap-2 group">
            <MiloAvatarIcon size={32} className="text-gray-800" />
            <span className="font-bold text-xl text-gray-800">MILK</span>
          </a>
        </Link>
        {/* Navigation */}
        <nav className="flex gap-8 items-center text-gray-700 text-lg">
          <Link href="/trading/dashboard" legacyBehavior><a className="hover:text-black transition-colors">Login</a></Link>
          <Link href="/trading/dashboard" legacyBehavior><a className="hover:text-black transition-colors">Sign up</a></Link>
          <Link href="/trading/suggestions" legacyBehavior><a className="hover:text-black transition-colors">Review</a></Link>
          <button title="Toggle theme (placeholder)">
            <Sun className="h-6 w-6 text-gray-700 hover:text-black transition-colors" />
          </button>
        </nav>
      </header>
      
      {/* Main Content */}
      <main className="flex flex-1 flex-col items-center justify-center text-center">
        <h1 className="text-[10rem] font-black text-[#222] leading-none" style={{ textShadow: '8px 8px 24px #aaaaaa' }}>
          milk
        </h1>
        <p className="text-2xl font-bold tracking-[0.2em] text-gray-500 mt-2">
          MILK THE NEWS. TRADE THE MOVES.
        </p>
      </main>
    </div>
  );
}
