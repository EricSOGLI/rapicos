/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  className?: string;
  variant?: 'default' | 'white' | 'dark' | 'icon-only';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  withLink?: boolean;
  to?: string;
  subtitle?: string;
}

export function LogoMark({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg' | 'xl'; className?: string }) {
  const sizeMap = {
    sm: 'h-7 w-7',
    md: 'h-9 w-9',
    lg: 'h-11 w-11',
    xl: 'h-14 w-14'
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32
  };

  return (
    <div
      className={`relative ${sizeMap[size]} rounded-2xl bg-gradient-to-tr from-indigo-700 via-indigo-600 to-purple-500 flex items-center justify-center shadow-md shadow-indigo-500/25 shrink-0 overflow-hidden group ${className}`}
    >
      {/* Subtle shine highlight */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none"></div>

      {/* Modern Fintech Geometric Emblem */}
      <svg
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-3/5 h-3/5 text-white transform transition-transform duration-300 group-hover:scale-110"
      >
        {/* Dynamic credit arch / upward path */}
        <path
          d="M8 22C8 16.4772 12.4772 12 18 12H24"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Dynamic lightning / credit speed spark */}
        <path
          d="M20 7L25 12L20 17"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Foundation point / currency node */}
        <circle cx="9" cy="22" r="2.5" fill="currentColor" />
        {/* Accent glow spark */}
        <circle cx="21" cy="22" r="2.5" fill="#a5b4fc" />
      </svg>
    </div>
  );
}

export default function Logo({
  className = '',
  variant = 'default',
  size = 'md',
  withLink = true,
  to = '/',
  subtitle
}: LogoProps) {
  const textSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl sm:text-2xl',
    xl: 'text-2xl sm:text-3xl'
  };

  const isWhite = variant === 'white';
  const isDark = variant === 'dark';

  const textClasses = isWhite
    ? 'text-white'
    : isDark
    ? 'text-slate-900'
    : 'text-slate-900';

  const accentColor = isWhite ? 'text-indigo-300' : 'text-indigo-600';
  const subtitleColor = isWhite ? 'text-slate-400' : 'text-indigo-600';

  const content = (
    <div className={`inline-flex items-center gap-2.5 font-sans select-none ${className}`}>
      <LogoMark size={size} />

      {variant !== 'icon-only' && (
        <div className="flex flex-col">
          <div className={`font-display font-extrabold ${textSizes[size]} ${textClasses} tracking-tight leading-none`}>
            Rapi<span className={accentColor}>Credito</span>
          </div>
          {subtitle && (
            <span className={`text-[9px] font-bold uppercase tracking-wider ${subtitleColor} mt-0.5`}>
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (withLink) {
    return (
      <Link to={to} className="inline-flex items-center focus:outline-none hover:opacity-95 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
}
