/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dataService, initializeApplication, SessionUser } from '../../lib/supabase';
import { LoanRequest, LoanType } from '../../types';
import Icon from '../../components/Icons';
import StatusBadge from '../../components/StatusBadge';

export function ClientLoansHistory({ user }: { user: SessionUser }) {
  const [loanRequests, setLoanRequests] = useState<LoanRequest[]>([]);
  const [loanTypes, setLoanTypes] = useState<LoanType[]>([]);

  useEffect(() => {
    const fetchHistory = async () => {
      await initializeApplication();
      setLoanTypes(dataService.getLoanTypes());
      setLoanRequests(dataService.getLoanRequests(user.id));
    };
    fetchHistory();
  }, [user.id]);

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-slate-900">Historial de préstamos</h1>
          <p className="text-xs text-slate-400">Lista de todas las solicitudes enviadas y su estado actual en el sistema.</p>
        </div>
        <Link
          to="/prestamos"
          className="btn-primary-green px-5 py-2.5 rounded-xl text-xs font-semibold shadow-sm flex items-center gap-1"
        >
          <Icon name="Plus" size={16} /> Nueva solicitud de préstamo
        </Link>
      </div>

      {loanRequests.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm text-slate-400 text-xs">
          No has presentado ninguna solicitud de préstamo. Abre nuestro simulador y elige un modelo.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 font-sans">
          {loanRequests.map(req => {
            const type = loanTypes.find(t => t.id === req.loan_type_id);
            return (
              <div key={req.id} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md hover:border-slate-200 transition-all">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600">
                    <Icon name={type?.icon || 'FileText'} size={24} />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-slate-900 text-base">{type?.name || 'Préstamo'}</h3>
                    <span className="text-[11px] text-slate-400 block mt-0.5">Enviado: {new Date(req.created_at).toLocaleDateString('es-ES')}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6 text-xs text-slate-500">
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase font-medium">Monto solicitado</span>
                    <span className="font-bold text-slate-800 text-sm">{req.amount_requested.toLocaleString()} €</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase font-medium">Plazo</span>
                    <span className="font-semibold text-slate-800 text-sm">{req.duration_months} meses</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase font-medium">Tasa de interés</span>
                    <span className="font-bold text-brand-600 text-sm">{type?.interest_rate || 5.49}%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-4 border-t border-slate-50 md:border-0 pt-4 md:pt-0">
                  <StatusBadge status={req.status} />
                  <Link
                    to={`/app/prestamos/${req.id}`}
                    className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 p-1"
                  >
                    Ver detalles <Icon name="ArrowRight" size={14} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
