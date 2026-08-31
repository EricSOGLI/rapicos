/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { dataService, initializeApplication } from '../../lib/supabase';
import { Transaction, Profile } from '../../types';
import StatusBadge from '../../components/StatusBadge';
import ResponsiveTable, { TableColumn } from '../../components/ResponsiveTable';

export function AdminTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);

  const refreshData = () => {
    setTransactions(dataService.getTransactions());
    setProfiles(dataService.getProfiles());
  };

  useEffect(() => {
    const fetchTxs = async () => {
      await initializeApplication();
      refreshData();
    };
    fetchTxs();
  }, []);

  const handleProcessWithdrawal = (id: string, status: 'completed' | 'failed') => {
    dataService.updateTransactionStatus(id, status);
    refreshData();
  };

  const columns: TableColumn<Transaction>[] = [
    {
      header: 'Transacción',
      render: (tx) => <span className="font-mono text-slate-400 text-[10px]">{tx.id.toUpperCase()}</span>
    },
    {
      header: 'Cliente',
      render: (tx) => {
        const client = profiles.find(p => p.id === tx.user_id);
        return (
          <div>
            <span className="font-semibold text-slate-950 block">{client?.full_name || 'Cliente no identificado'}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">{client?.phone}</span>
          </div>
        );
      }
    },
    {
      header: 'Tipo',
      render: (tx) => (
        <span className="font-medium text-slate-650">
          {tx.type === 'disbursement' ? 'Desembolso de crédito' : tx.type === 'withdrawal' ? 'Retiro de fondos' : 'Pago de cuota'}
        </span>
      )
    },
    {
      header: 'Monto',
      render: (tx) => <span className="font-bold text-slate-800">{tx.amount.toLocaleString()} €</span>
    },
    {
      header: 'Estado',
      render: (tx) => <StatusBadge status={tx.status} />
    },
    {
      header: 'Gestión',
      className: 'text-right',
      render: (tx) => {
        if (tx.type === 'withdrawal' && tx.status === 'pending') {
          return (
            <div className="flex gap-2 justify-end w-full md:w-auto">
              <button
                onClick={() => handleProcessWithdrawal(tx.id, 'completed')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl font-bold text-[10px] transition-colors"
              >
                Aprobar
              </button>
              <button
                onClick={() => handleProcessWithdrawal(tx.id, 'failed')}
                className="bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 rounded-xl font-bold text-[10px] transition-colors"
              >
                Rechazar
              </button>
            </div>
          );
        }
        return <span className="text-[10px] text-slate-450 font-semibold">Procesado</span>;
      }
    }
  ];

  return (
    <div className="space-y-6 sm:space-y-8 pb-10 font-sans">
      <div>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 leading-tight">Transacciones y Retiros</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">Revisa todas las transacciones financieras del sistema y gestiona las solicitudes de retiro de los clientes.</p>
      </div>

      <ResponsiveTable
        columns={columns}
        data={transactions}
        keyExtractor={(tx) => tx.id}
        emptyMessage="No hay transacciones disponibles."
      />
    </div>
  );
}
