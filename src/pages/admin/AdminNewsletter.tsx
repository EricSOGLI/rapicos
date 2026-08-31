/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { dataService, initializeApplication } from '../../lib/supabase';
import { NewsletterSubscriber } from '../../types';
import ResponsiveTable, { TableColumn } from '../../components/ResponsiveTable';

export function AdminNewsletter() {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);

  useEffect(() => {
    const fetchSubs = async () => {
      await initializeApplication();
      const list = dataService.getNewsletterSubscribers();
      setSubscribers(list);
    };
    fetchSubs();
  }, []);

  const columns: TableColumn<NewsletterSubscriber>[] = [
    {
      header: "E-mail del usuario",
      render: (sub) => <span className="font-semibold text-slate-900">{sub.email}</span>
    },
    {
      header: "Fecha de suscripción",
      render: (sub) => <span>{new Date(sub.subscribed_at).toLocaleDateString('es-ES')}</span>
    },
    {
      header: 'Estado',
      render: () => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px]">
          Activo
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6 sm:space-y-8 pb-10 font-sans">
      <div>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 leading-tight">Base de datos Newsletter</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">Consulte la lista de correos electrónicos suscritos a notificaciones y campañas.</p>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Total de contactos: {subscribers.length}</span>
          <button
            onClick={() => alert('Exportando... Generando archivo Excel / CSV con todos los contactos.')}
            className="w-full sm:w-auto bg-brand-50 hover:bg-brand-100 text-brand-700 px-4 py-2 rounded-xl font-bold text-xs transition-colors text-center"
          >
            Exportar CSV
          </button>
        </div>

        <ResponsiveTable
          columns={columns}
          data={subscribers}
          keyExtractor={(sub) => sub.id}
          emptyMessage="No hay suscriptores registrados."
        />
      </div>
    </div>
  );
}
