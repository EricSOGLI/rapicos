/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { dataService } from '../../lib/supabase';

export function ClientShowcaseGallery() {
  const [showcase, setShowcase] = useState<any[]>([]);

  useEffect(() => {
    setShowcase(dataService.getShowcaseClients());
  }, []);

  return (
    <div className="space-y-8 pb-10 font-sans">
      <div>
        <h1 className="font-display font-bold text-2xl text-slate-900">Testimonios de Clientes</h1>
        <p className="text-xs text-slate-400">Historial de financiamientos otorgados y experiencias de nuestros clientes.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {showcase.map((item) => (
          <div key={item.id} className="bg-white rounded-2xl p-6 border border-slate-100 flex flex-col justify-between h-full shadow-sm hover:shadow-md transition-all">
            <p className="text-slate-600 text-xs leading-relaxed italic mb-6">
              "{item.testimonial}"
            </p>
            <div className="flex items-center gap-3 border-t border-slate-50 pt-4">
              <img
                src={item.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80'}
                alt={item.display_name}
                className="h-10 w-10 rounded-full object-cover bg-slate-50"
                referrerPolicy="no-referrer"
              />
              <div>
                <h4 className="font-semibold text-xs text-slate-900">{item.display_name}</h4>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Tipo: {item.loan_type} • <strong className="text-brand-600">{item.amount_range}</strong>
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
