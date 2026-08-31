/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';

export function AdminParameters() {
  const [siteName, setSiteName] = useState('RapiCredito Financial Services');
  const [email, setEmail] = useState('soporte@rapicredito.com');
  const [interest, setInterest] = useState('3.25');
  const [message, setMessage] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('¡Parámetros del sistema guardados con éxito!');
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8 font-sans">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
        <div>
          <h1 className="font-display font-bold text-xl text-slate-900">Parámetros del Sistema</h1>
          <p className="text-xs text-slate-400 font-sans">Configura las direcciones de contacto, las tasas de interés de referencia y el nombre del servicio.</p>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs font-semibold text-slate-600">
          <div>
            <label className="block mb-1">Nombre de la plataforma</label>
            <input type="text" value={siteName} onChange={(e) => setSiteName(e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5 text-xs focus:outline-none" />
          </div>

          <div>
            <label className="block mb-1">Correo de soporte al cliente</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5 text-xs focus:outline-none" />
          </div>

          <div>
            <label className="block mb-1">Tasa de interés de referencia estándar (%)</label>
            <input type="text" value={interest} onChange={(e) => setInterest(e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5 text-xs focus:outline-none" />
          </div>

          {message && (
            <p className="text-xs text-brand-600 font-bold bg-brand-50 p-2 text-center rounded-lg">{message}</p>
          )}

          <button type="submit" className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-2.5 rounded-xl text-xs">
            Guardar configuración
          </button>
        </form>
      </div>
    </div>
  );
}
