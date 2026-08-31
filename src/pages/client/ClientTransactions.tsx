/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { dataService, initializeApplication, SessionUser } from '../../lib/supabase';
import { Transaction } from '../../types';
import ResponsiveTable, { TableColumn } from '../../components/ResponsiveTable';
import StatusBadge from '../../components/StatusBadge';

export function ClientTransactions({ user }: { user: SessionUser }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const fetchTxs = async () => {
      await initializeApplication();
      setTransactions(dataService.getTransactions(user.id));
    };
    fetchTxs();
  }, [user.id]);

  const columns: TableColumn<Transaction>[] = [
    {
      header: 'ID Transacción',
      render: (t) => <span className="font-mono text-slate-400 text-[10px]">{t.id.toUpperCase()}</span>
    },
    {
      header: 'Fecha',
      render: (t) => <span>{new Date(t.created_at).toLocaleDateString('es-ES')}</span>
    },
    {
      header: 'Tipo',
      render: (t) => {
        const isDeposit = t.type === 'disbursement';
        return (
          <span className={`font-semibold ${isDeposit ? 'text-emerald-600' : 'text-rose-600'}`}>
            {isDeposit ? 'Abono (Desembolso)' : 'Retiro'}
          </span>
        );
      }
    },
    {
      header: 'Monto',
      render: (t) => (
        <span className="font-bold text-slate-900">
          {t.amount.toLocaleString()} €
        </span>
      )
    },
    {
      header: 'Estado',
      render: (t) => <StatusBadge status={t.status} />
    }
  ];

  return (
    <div className="space-y-8 pb-10 font-sans">
      <div>
        <h1 className="font-display font-bold text-2xl text-slate-900">Historial de transacciones</h1>
        <p className="text-xs text-slate-400">Registro de todos los abonos y retiros de fondos en la plataforma RapiCredito.</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <ResponsiveTable
          columns={columns}
          data={transactions}
          keyExtractor={(t) => t.id}
          emptyMessage="No tienes transacciones registradas."
        />
      </div>
    </div>
  );
}
