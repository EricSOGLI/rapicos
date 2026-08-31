/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { dataService, initializeApplication } from '../../lib/supabase';
import { Profile } from '../../types';
import Icon from '../../components/Icons';
import ResponsiveTable, { TableColumn } from '../../components/ResponsiveTable';

export function AdminUsersDirectory() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [fundingAmount, setFundingAmount] = useState('');
  const [message, setMessage] = useState('');

  const refreshProfiles = async () => {
    await initializeApplication();
    setProfiles(dataService.getProfiles().filter(p => p.role === 'client'));
  };

  useEffect(() => {
    refreshProfiles();
  }, []);

  const handleCrediting = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    if (!selectedUser) return;

    const amt = Number(fundingAmount);
    if (!amt || amt <= 0) {
      setMessage('Por favor, ingresa un monto válido.');
      return;
    }

    // Insert direct completed transaction type disbursement
    dataService.createTransaction(selectedUser.id, 'disbursement', amt, 'completed');
    
    // Also notify client in Spanish
    dataService.createNotification(
      selectedUser.id,
      '¡Fondos abonados! 💸',
      `El administrador ha abonado un importe de ${amt.toLocaleString()} € directamente a tu billetera RapiCredito.`,
      'info',
      true // pop-up immediately on screen
    );

    setMessage(`¡Abono de ${amt.toLocaleString()} € realizado con éxito en la cuenta de ${selectedUser.full_name}!`);
    setFundingAmount('');
    setTimeout(() => setSelectedUser(null), 2500);
  };

  const columns: TableColumn<Profile>[] = [
    {
      header: 'Foto',
      render: (p) => (
        <img
          src={p.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(p.full_name)}`}
          className="h-8 w-8 rounded-xl object-cover bg-slate-50 border border-slate-100"
          alt={p.full_name}
        />
      )
    },
    {
      header: 'Nombre y Apellidos',
      render: (p) => <span className="font-semibold text-slate-900">{p.full_name}</span>
    },
    {
      header: 'Correo electrónico',
      render: (p) => <span className="text-slate-500 font-medium">{p.email || `${p.id.substring(0, 8)}...`}</span>
    },
    {
      header: 'Fecha de registro',
      render: (p) => {
        const date = new Date(p.created_at);
        return (
          <div className="space-y-0.5">
            <span className="text-slate-800 font-semibold block">
              {date.toLocaleDateString('es-ES')}
            </span>
            <span className="text-[10px] text-slate-400 block font-mono">
              {date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        );
      }
    },
    {
      header: 'Acción',
      className: 'text-right',
      render: (p) => (
        <button
          onClick={() => { setSelectedUser(p); setMessage(''); }}
          className="bg-brand-50 hover:bg-brand-100 text-brand-700 px-3 py-1.5 rounded-xl font-bold w-full md:w-auto text-xs transition-colors"
        >
          Abonar
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6 sm:space-y-8 pb-10 font-sans">
      <div>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 leading-tight">Directorio de Clientes</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">Consulta la base de datos de clientes, revisa sus fechas de registro y abona fondos directamente a su billetera virtual.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Table list Wrapper */}
        <div className="lg:col-span-7">
          <ResponsiveTable
            columns={columns}
            data={profiles}
            keyExtractor={(p) => p.id}
            emptyMessage="No hay clientes registrados por el momento."
          />
        </div>

        {/* Instant fund card form */}
        {selectedUser && (
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6 animate-in fade-in duration-200">
            <div className="flex justify-between items-center border-b border-slate-50 pb-3">
              <h3 className="font-display font-bold text-base text-slate-900">
                Abono Directo de Fondos
              </h3>
              <button 
                onClick={() => setSelectedUser(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <Icon name="X" size={18} />
              </button>
            </div>

            <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-2xl text-xs space-y-1">
              <span className="text-slate-400 block font-semibold">Cliente seleccionado:</span>
              <strong className="text-slate-800 text-sm block">{selectedUser.full_name}</strong>
              <span className="text-slate-400 block font-semibold">Dirección:</span>
              <span className="text-slate-500 block">{selectedUser.address || 'No registrada'}</span>
            </div>

            <form onSubmit={handleCrediting} className="space-y-4 text-xs font-semibold text-slate-600">
              <div>
                <label className="text-slate-500 block mb-1">Monto a abonar a la billetera (€)</label>
                <input
                  type="number"
                  required
                  value={fundingAmount}
                  onChange={(e) => setFundingAmount(e.target.value)}
                  placeholder="ej. 5000"
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-brand-500 text-slate-800"
                />
              </div>

              {message && (
                <p className="text-xs text-brand-600 font-bold bg-brand-50 p-2.5 rounded-xl text-center leading-normal animate-pulse">
                  {message}
                </p>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="flex-1 border border-slate-100 hover:bg-slate-50 text-slate-500 py-3 rounded-xl font-bold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-brand-600 hover:bg-brand-700 text-white py-3 rounded-xl font-bold transition-colors shadow-sm"
                >
                  Realizar Abono
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
