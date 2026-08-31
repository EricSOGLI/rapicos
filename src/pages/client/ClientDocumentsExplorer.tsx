/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dataService, initializeApplication, SessionUser } from '../../lib/supabase';
import { Contract, LoanRequest, LoanType } from '../../types';
import Icon from '../../components/Icons';

export function ClientDocumentsExplorer({ user }: { user: SessionUser }) {
  const [contracts, setContracts] = useState<{ contract: Contract; loanRequest: LoanRequest; loanType: LoanType }[]>([]);

  useEffect(() => {
    const fetchDocs = async () => {
      await initializeApplication();
      setContracts(dataService.getContracts(user.id));
    };
    fetchDocs();
  }, [user.id]);

  return (
    <div className="space-y-8 pb-10 font-sans">
      <div>
        <h1 className="font-display font-bold text-2xl text-slate-900">Mis Documentos</h1>
        <p className="text-xs text-slate-400 font-sans">Caja fuerte digital para tus contratos y documentos de préstamo.</p>
      </div>

      {contracts.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-slate-100 shadow-sm text-center text-slate-400 text-xs">
          Actualmente no hay documentos generados. Los contratos se crean tras la aprobación del préstamo.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {contracts.map(({ contract, loanRequest, loanType }) => (
            <div key={contract.id} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-full">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                  <div className="flex items-center gap-2">
                    <Icon name="FileText" className="text-brand-600" />
                    <span className="font-semibold text-slate-800 text-sm">Contrato de Préstamo</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">{contract.id.toUpperCase()}</span>
                </div>

                <div className="space-y-2 text-xs text-slate-500">
                  <div className="flex justify-between">
                    <span>Modelo:</span>
                    <strong className="text-slate-800">{loanType.name}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Monto acordado:</span>
                    <strong className="text-slate-800">{loanRequest.amount_requested.toLocaleString()} €</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Estado de firma:</span>
                    <strong className={contract.signed_at ? 'text-emerald-600' : 'text-amber-500'}>
                      {contract.signed_at ? 'Firmado' : 'Pendiente de firma'}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-4 border-t border-slate-50">
                {contract.signed_at ? (
                  <button
                    onClick={() => alert('Iniciando descarga segura del PDF...')}
                    className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Icon name="Download" size={14} /> Descargar contrato (PDF)
                  </button>
                ) : (
                  <Link
                    to={`/app/prestamos/${loanRequest.id}`}
                    className="w-full block text-center btn-primary-green py-2.5 rounded-xl text-xs font-bold transition-colors"
                  >
                    Abrir y firmar
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
