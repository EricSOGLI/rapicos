/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import Icon from './Icons';

interface KpiCardProps {
  title: string;
  value: string | number;
  subText?: string;
  icon: string;
  color?: 'brand' | 'emerald' | 'amber' | 'blue' | 'rose' | 'indigo' | 'slate';
}

export default function KpiCard({ title, value, subText, icon, color = 'brand' }: KpiCardProps) {
  const colorMaps = {
    brand: {
      bg: 'bg-brand-50 border-brand-100/50 text-brand-600',
      iconBg: 'bg-brand-100/50 text-brand-700',
    },
    emerald: {
      bg: 'bg-emerald-50 border-emerald-100/50 text-emerald-600',
      iconBg: 'bg-emerald-100/50 text-emerald-700',
    },
    amber: {
      bg: 'bg-amber-50 border-amber-100/50 text-amber-600',
      iconBg: 'bg-amber-100/50 text-amber-700',
    },
    blue: {
      bg: 'bg-blue-50 border-blue-100/50 text-blue-600',
      iconBg: 'bg-blue-100/50 text-blue-700',
    },
    rose: {
      bg: 'bg-rose-50 border-rose-100/50 text-rose-600',
      iconBg: 'bg-rose-100/50 text-rose-700',
    },
    indigo: {
      bg: 'bg-indigo-50 border-indigo-100/50 text-indigo-600',
      iconBg: 'bg-indigo-100/50 text-indigo-700',
    },
    slate: {
      bg: 'bg-slate-50 border-slate-100/50 text-slate-600',
      iconBg: 'bg-slate-100/50 text-slate-700',
    },
  };

  const scheme = colorMaps[color] || colorMaps.brand;

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center justify-between group hover:scale-[1.01] hover:shadow-md transition-all duration-300">
      <div className="space-y-2 min-w-0">
        <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block truncate">
          {title}
        </span>
        <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display block truncate">
          {value}
        </span>
        {subText && (
          <span className="text-[10px] text-slate-400 block truncate font-medium">
            {subText}
          </span>
        )}
      </div>
      <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform ${scheme.iconBg}`}>
        <Icon name={icon} size={22} />
      </div>
    </div>
  );
}
