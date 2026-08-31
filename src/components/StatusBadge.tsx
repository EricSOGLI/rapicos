/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LoanStatus, TransactionStatus } from '../types';

interface StatusBadgeProps {
  status: LoanStatus | TransactionStatus | 'verified' | 'unverified';
  className?: string;
}

export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  let text: string = status;
  let bgClass = 'bg-slate-100 text-slate-800';
  let dotClass = 'bg-slate-400';

  switch (status) {
    case 'pending':
      text = 'Pendiente';
      bgClass = 'bg-amber-50 text-amber-700 border border-amber-200/60';
      dotClass = 'bg-amber-500';
      break;
    case 'under_review':
      text = 'En Revisión';
      bgClass = 'bg-blue-50 text-blue-700 border border-blue-200/60';
      dotClass = 'bg-blue-500';
      break;
    case 'approved':
      text = 'Aprobado';
      bgClass = 'bg-emerald-50 text-emerald-700 border border-emerald-200/60';
      dotClass = 'bg-emerald-500';
      break;
    case 'signed':
      text = 'Firmado';
      bgClass = 'bg-teal-50 text-teal-700 border border-teal-200/60';
      dotClass = 'bg-teal-500';
      break;
    case 'rejected':
      text = 'Rechazado';
      bgClass = 'bg-rose-50 text-rose-700 border border-rose-200/60';
      dotClass = 'bg-rose-500';
      break;
    case 'disbursed':
      text = 'Desembolsado';
      bgClass = 'bg-indigo-50 text-indigo-700 border border-indigo-200/60';
      dotClass = 'bg-indigo-500';
      break;
    case 'completed':
      text = 'Completado';
      bgClass = 'bg-emerald-50 text-emerald-700 border border-emerald-200/60';
      dotClass = 'bg-emerald-500';
      break;
    case 'failed':
      text = 'Fallido';
      bgClass = 'bg-rose-50 text-rose-700 border border-rose-200/60';
      dotClass = 'bg-rose-500';
      break;
    case 'verified':
      text = 'Verificado';
      bgClass = 'bg-emerald-50 text-emerald-700 border border-emerald-200/60';
      dotClass = 'bg-emerald-500';
      break;
    case 'unverified':
      text = 'Sin Verificar';
      bgClass = 'bg-slate-50 text-slate-600 border border-slate-200/60';
      dotClass = 'bg-slate-400';
      break;
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${bgClass} ${className}`}>
      <span className={`h-1.5 w-1.5 rounded-full mr-1.5 ${dotClass}`}></span>
      {text}
    </span>
  );
}
