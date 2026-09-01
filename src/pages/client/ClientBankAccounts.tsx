/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { dataService, SessionUser } from '../../lib/supabase';
import { BankAccount } from '../../types';
import { SPANISH_SPEAKING_BANKS, OTHER_BANK_OPTION } from '../../lib/banks';
import Icon from '../../components/Icons';
import StatusBadge from '../../components/StatusBadge';

export function ClientBankAccounts({ user }: { user: SessionUser }) {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [holder, setHolder] = useState(user.full_name);
  const [iban, setIban] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('España');
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

  const currentCountryObj = SPANISH_SPEAKING_BANKS.find(c => c.name === selectedCountry) || SPANISH_SPEAKING_BANKS[0];

  const handleCountryChange = (cName: string) => {
    setSelectedCountry(cName);
    const country = SPANISH_SPEAKING_BANKS.find(c => c.name === cName);
    if (country && country.banks.length > 0) {
      setBank(country.banks[0]);
      setIsCustomBank(false);
      setCustomBank('');
    }
  };

  const handleBankChange = (val: string) => {
    setBank(val);
    if (val === OTHER_BANK_OPTION) {
      setIsCustomBank(true);
      setCustomBank('');
    } else {
      setIsCustomBank(false);
    }
  };

  const handleAddAccount = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    if (iban.trim().length < 6) {
      setMessage('Por favor ingresa un número de cuenta o código IBAN válido.');
      return;
    }

    const finalBankName = isCustomBank ? customBank.trim() : bank;
    if (isCustomBank && !customBank.trim()) {
      setMessage('Por favor escribe el nombre de tu banco o entidad financiera.');
      return;
    }

    dataService.addBankAccount({
      user_id: user.id,
      account_holder: holder || user.full_name,
      iban: iban.trim(),
      bank_name: `${finalBankName} (${selectedCountry})`,
      country: selectedCountry
    });

    setMessage('¡Cuenta bancaria agregada y verificada exitosamente!');
    setIban('');
    setCustomBank('');
    setIsCustomBank(false);
    fetchAccounts();
  };

  return (
    <div className="space-y-8 pb-10 font-sans">
      <div>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-900">
          Cuentas Bancarias Verificadas
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Cuentas autorizadas a las que desembolsamos los fondos y desde donde se gestionan tus retiros en España e Hispanoamérica.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Account list */}
        <div className="lg:col-span-7 space-y-4">
          <h3 className="font-display font-semibold text-xs text-slate-400 uppercase tracking-wider">
            Mis Cuentas Registradas ({accounts.length})
          </h3>
          
          {accounts.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 border border-slate-100 text-center text-slate-400 text-xs shadow-sm space-y-2">
              <Icon name="CreditCard" size={28} className="mx-auto text-slate-300" />
              <p className="font-semibold">No has registrado ninguna cuenta bancaria aún.</p>
              <p className="text-[11px]">Agrega tu primera cuenta usando el formulario lateral.</p>
            </div>
          ) : (
            accounts.map(acc => (
              <div key={acc.id} className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-indigo-100 transition-all">
                <div className="flex items-center gap-3.5">
                  <div className="h-11 w-11 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shrink-0">
                    <Icon name="CreditCard" size={22} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-900 text-sm truncate">{acc.bank_name}</h4>
                    <span className="text-[11px] font-mono text-slate-500 block mt-0.5 break-all font-semibold">{acc.iban}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Titular: {acc.account_holder}</span>
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
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-md space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-display font-bold text-base text-slate-900">Agregar Cuenta Bancaria</h3>
            <p className="text-[11px] text-slate-400">Compatible con bancos de España y Latinoamérica.</p>
          </div>
          
          <form onSubmit={handleAddAccount} className="space-y-4 text-xs">
            {/* Country */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">País del Banco</label>
              <select
                value={selectedCountry}
                onChange={(e) => handleCountryChange(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-semibold text-slate-800 focus:outline-none focus:border-indigo-600 focus:bg-white"
              >
                {SPANISH_SPEAKING_BANKS.map(c => (
                  <option key={c.code} value={c.name}>{c.name} ({c.currency})</option>
                ))}
              </select>
            </div>

            {/* Bank */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">Banco / Entidad Financiera</label>
              <select
                value={bank}
                onChange={(e) => handleBankChange(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-semibold text-slate-800 focus:outline-none focus:border-indigo-600 focus:bg-white"
              >
                {currentCountryObj.banks.map((b, idx) => (
                  <option key={idx} value={b}>{b}</option>
                ))}
                <option value={OTHER_BANK_OPTION}>
                  ➕ {OTHER_BANK_OPTION}
                </option>
              </select>
            </div>

            {/* Custom Bank */}
            {isCustomBank && (
              <div className="animate-in fade-in duration-200">
                <label className="font-bold text-slate-700 block mb-1">Nombre de tu Banco o Caja</label>
                <input
                  type="text"
                  required
                  placeholder="Escribe el nombre de la entidad..."
                  value={customBank}
                  onChange={(e) => setCustomBank(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-semibold text-slate-800 focus:outline-none focus:border-indigo-600 focus:bg-white"
                />
              </div>
            )}

            {/* Account number / IBAN */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {currentCountryObj.accountLabel}
              </label>
              <input
                type="text"
                required
                placeholder={currentCountryObj.accountPlaceholder}
                value={iban}
                onChange={(e) => setIban(e.target.value.toUpperCase())}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-mono font-semibold text-slate-800 focus:outline-none focus:border-indigo-600 focus:bg-white"
              />
            </div>

            {/* Account Holder */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">Titular de la Cuenta</label>
              <input
                type="text"
                required
                value={holder}
                onChange={(e) => setHolder(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-semibold text-slate-800 focus:outline-none focus:border-indigo-600 focus:bg-white"
              />
            </div>

            {message && (
              <p className="text-xs text-indigo-700 font-semibold bg-indigo-50 border border-indigo-200 p-2.5 rounded-xl text-center animate-in fade-in">
                {message}
              </p>
            )}

            <button
              type="submit"
              className="w-full btn-primary-purple font-bold py-3 rounded-xl text-xs transition-all shadow-md shadow-indigo-500/20"
            >
              Agregar y Validar Cuenta
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
