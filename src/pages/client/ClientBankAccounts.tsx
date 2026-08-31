/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { dataService, SessionUser } from '../../lib/supabase';
import { BankAccount } from '../../types';
import Icon from '../../components/Icons';
import StatusBadge from '../../components/StatusBadge';

export function ClientBankAccounts({ user }: { user: SessionUser }) {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [holder, setHolder] = useState(user.full_name);
  const [iban, setIban] = useState('');
  const [bank, setBank] = useState('Banco Santander');
  const [customBank, setCustomBank] = useState('');
  const [isCustomBank, setIsCustomBank] = useState(false);
  const [message, setMessage] = useState('');

  const fetchAccounts = () => {
    setAccounts(dataService.getBankAccounts(user.id));
  };

  useEffect(() => {
    fetchAccounts();
  }, [user.id]);

  const handleBankChange = (val: string) => {
    setBank(val);
    if (val === 'Otro') {
      setIsCustomBank(true);
      setCustomBank('');
    } else {
      setIsCustomBank(false);
    }
  };

  const handleAddAccount = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    if (iban.length < 10) {
      setMessage('Formato de IBAN no válido. Por favor ingresa un número de IBAN válido.');
      return;
    }

    const finalBankName = isCustomBank ? customBank.trim() : bank;
    if (isCustomBank && !customBank.trim()) {
      setMessage('Por favor escribe el nombre de tu banco.');
      return;
    }

    dataService.addBankAccount({
      user_id: user.id,
      account_holder: holder,
      iban,
      bank_name: finalBankName
    });

    setMessage('¡Cuenta agregada con éxito! La verificación automática está en curso...');
    setIban('');
    setCustomBank('');
    setIsCustomBank(false);
    setBank('Banco Santander');
    fetchAccounts();

    setTimeout(fetchAccounts, 16000);
  };

  return (
    <div className="space-y-8 pb-10 font-sans">
      <div>
        <h1 className="font-display font-bold text-2xl text-slate-900">Cuentas bancarias verificadas</h1>
        <p className="text-xs text-slate-400">Cuentas a las que desembolsamos los fondos y desde donde se gestionan tus pagos.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Account list */}
        <div className="lg:col-span-7 space-y-4">
          <h3 className="font-display font-semibold text-sm text-slate-500 uppercase tracking-wider">Mis cuentas</h3>
          
          {accounts.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 border border-slate-100 text-center text-slate-400 text-xs shadow-sm">
              No has agregado ninguna cuenta bancaria. Agrégala usando el formulario.
            </div>
          ) : (
            accounts.map(acc => (
              <div key={acc.id} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-brand-50 rounded-xl flex items-center justify-center text-brand-600 shrink-0">
                    <Icon name="CreditCard" size={20} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-slate-800 text-sm truncate">{acc.bank_name}</h4>
                    <span className="text-[11px] font-mono text-slate-500 block mt-0.5 break-all">{acc.iban}</span>
                    <span className="text-[9px] text-slate-400 block mt-0.5">Titular: {acc.account_holder}</span>
                  </div>
                </div>

                <div className="self-start sm:self-auto">
                  <StatusBadge status={acc.is_verified ? 'verified' : 'unverified'} />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add account form */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6">
          <h3 className="font-display font-bold text-base text-slate-900">Agregar cuenta bancaria</h3>
          
          <form onSubmit={handleAddAccount} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">Titular de la cuenta</label>
              <input
                type="text"
                required
                value={holder}
                onChange={(e) => setHolder(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">Banco</label>
              <select
                value={bank}
                onChange={(e) => handleBankChange(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-brand-500"
              >
                <option value="Banco Santander">Banco Santander</option>
                <option value="BBVA">BBVA</option>
                <option value="CaixaBank">CaixaBank</option>
                <option value="Banco Sabadell">Banco Sabadell</option>
                <option value="Bankinter">Bankinter</option>
                <option value="Abanca">Abanca</option>
                <option value="Otro">Otro (Escribe el nombre de tu banco)</option>
              </select>
            </div>

            {isCustomBank && (
              <div className="animate-in fade-in duration-200">
                <label className="text-xs font-bold text-slate-500 block mb-1">Escribe el nombre del banco</label>
                <input
                  type="text"
                  required
                  placeholder="Nombre de tu banco..."
                  value={customBank}
                  onChange={(e) => setCustomBank(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-brand-500"
                />
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">Número IBAN</label>
              <input
                type="text"
                required
                placeholder="ES00 0000 0000 0000..."
                value={iban}
                onChange={(e) => setIban(e.target.value.toUpperCase())}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-xs font-mono font-semibold focus:outline-none focus:border-brand-500"
              />
            </div>

            {message && (
              <p className="text-xs text-brand-600 font-semibold bg-brand-50 p-2.5 rounded-lg animate-pulse leading-normal">
                {message}
              </p>
            )}

            <button
              type="submit"
              className="w-full btn-primary-green font-semibold py-2.5 rounded-xl text-xs transition-colors shadow-sm"
            >
              Agregar y verificar cuenta
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
