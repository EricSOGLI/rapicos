/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { LoanType } from '../types';
import { authService } from '../lib/supabase';
import Icon from './Icons';

interface LoanCardProps {
  loanType: LoanType;
  showCta?: boolean;
}

export default function LoanCard({ loanType, showCta = true }: LoanCardProps) {
  const categoryTag = 
    loanType.slug === 'microcredito-emergencia' || loanType.slug === 'mikrokredit' ? 'DESEMBOLSO EXPRESS • 15 MINUTOS' :
    loanType.slug === 'prestamo-personal' || loanType.slug === 'osobni-kredit' ? 'PRÉSTAMO LIBRE E INMEDIATO' :
    loanType.slug === 'prestamo-hogar' || loanType.slug === 'stambeni-kredit' ? 'REMODELACIÓN • TASA PREFERENCIAL' :
    loanType.slug === 'prestamo-vehiculo' || loanType.slug === 'auto-kredit' ? 'VEHÍCULOS • FINANCIAMIENTO RÁPIDO' :
    loanType.slug === 'prestamo-educativo' || loanType.slug === 'studentski-kredit' ? 'EDUCACIÓN • CONDICIONES FLEXIBLES' :
    loanType.slug === 'prestamo-libre-inversion' || loanType.slug === 'turisticki-kredit' ? 'LIBRE INVERSIÓN Y PROYECTOS' : 'LÍNEA DE CRÉDITO';

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-md hover:border-slate-200 transition-all duration-300 flex flex-col h-full">
      {/* Visual illustration with absolute icon badge */}
      <div className="relative">
        <img
          src={loanType.image_url || 'https://images.unsplash.com/photo-1434626881859-194d67b2b86f?auto=format&fit=crop&w=800&q=80'}
          alt={loanType.name}
          className="h-48 w-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-4 right-4 h-10 w-10 rounded-xl bg-white/95 backdrop-blur-sm shadow-md flex items-center justify-center text-brand-600">
          <Icon name={loanType.icon} size={20} />
        </div>
      </div>

      <div className="p-6 flex flex-col flex-grow justify-between">
        <div>
          <span className="text-[10px] font-bold text-accent-600 uppercase tracking-wider block mb-2">
            {categoryTag}
          </span>
          
          <h3 className="font-display text-lg font-semibold text-slate-900 mb-2 leading-snug">
            {loanType.name}
          </h3>
          
          <p className="text-slate-500 text-xs sm:text-sm mb-6 leading-relaxed line-clamp-3">
            {loanType.description}
          </p>

          <div className="grid grid-cols-3 gap-2 py-4 border-t border-b border-slate-50 mb-6 font-sans text-xs">
            <div>
              <span className="text-[10px] text-slate-400 block uppercase tracking-wider mb-0.5">Monto</span>
              <span className="text-slate-800 font-bold block text-[11px] sm:text-xs">
                {loanType.min_amount.toLocaleString()} - {loanType.max_amount.toLocaleString()} €
              </span>
            </div>
            <div className="text-center border-l border-r border-slate-50 px-1">
              <span className="text-[10px] text-slate-400 block uppercase tracking-wider mb-0.5">Interés</span>
              <span className="text-brand-600 font-extrabold block text-[11px] sm:text-xs">
                {loanType.interest_rate}% <span className="text-[9px] text-slate-400 font-normal">TNA</span>
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block uppercase tracking-wider mb-0.5">Plazo</span>
              <span className="text-slate-800 font-semibold block text-[11px] sm:text-xs">
                {loanType.min_duration_months}-{loanType.max_duration_months} meses
              </span>
            </div>
          </div>
        </div>

        {showCta && (
          <div className="flex flex-col gap-2 mt-auto">
            <Link
              to={authService.getCurrentUser() ? `/app/solicitud/${loanType.slug}` : `/solicitud/${loanType.slug}`}
              className="w-full text-center btn-primary-green font-medium py-2.5 rounded-xl text-xs sm:text-sm transition-all duration-200 shadow-sm"
            >
              Solicitar Préstamo
            </Link>
            <Link
              to={`/prestamos/${loanType.slug}`}
              className="w-full text-center bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium py-2.5 rounded-xl text-xs sm:text-sm transition-colors duration-200"
            >
              Ver detalles
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
