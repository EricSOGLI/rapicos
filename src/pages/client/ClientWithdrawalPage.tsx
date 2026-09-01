/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { dataService, SessionUser } from '../../lib/supabase';
import { BankAccount } from '../../types';
import { SPANISH_SPEAKING_BANKS, OTHER_BANK_OPTION } from '../../lib/banks';
import Icon from '../../components/Icons';

export function ClientWithdrawalPage({ user }: { user: SessionUser }) {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [balance, setBalance] = useState(0);
  const [useExistingAccount, setUseExistingAccount] = useState(true);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  // New Bank Form State (Direct in withdrawal flow)
  const [selectedCountry, setSelectedCountry] = useState('España');
  const [selectedBank, setSelectedBank] = useState('Banco Santander');
  const [customBankName, setCustomBankName] = useState('');
  const [isCustomBank, setIsCustomBank] = useState(false);
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolder, setAccountHolder] = useState(user.full_name);

  useEffect(() => {
    const acs = dataService.getBankAccounts(user.id);
    setAccounts(acs);
    if (acs.length > 0) {
      setSelectedAccountId(acs[0].id);
      setUseExistingAccount(true);
    } else {
      setUseExistingAccount(false);
    }

    // Calculate virtual wallet balance based on transactions
    const txs = dataService.getTransactions(user.id);
    let currentBalance = 0;
    txs.forEach(t => {
      if (t.status === 'completed') {
        if (t.type === 'disbursement') {
          currentBalance += t.amount;
        } else if (t.type === 'withdrawal') {
          currentBalance -= t.amount;
        }
      }
    });
    setBalance(currentBalance);
  }, [user.id]);

  const currentCountryObj = SPANISH_SPEAKING_BANKS.find(c => c.name === selectedCountry) || SPANISH_SPEAKING_BANKS[0];

  const handleCountryChange = (countryName: string) => {
    setSelectedCountry(countryName);
    const country = SPANISH_SPEAKING_BANKS.find(c => c.name === countryName);
    if (country && country.banks.length > 0) {
      setSelectedBank(country.banks[0]);
      setIsCustomBank(false);
      setCustomBankName('');
    }
  };

  const handleBankChange = (bankName: string) => {
    setSelectedBank(bankName);
    if (bankName === OTHER_BANK_OPTION) {
      setIsCustomBank(true);
    } else {
      setIsCustomBank(false);
    }
  };

  const handleWithdrawal = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setIsSuccess(false);

    const amt = Number(withdrawAmount);
    if (!amt || amt <= 0) {
      setMessage('Ingresa un monto válido para el retiro.');
      return;
    }

    if (amt > balance) {
      setMessage('El monto supera tu saldo disponible en cuenta.');
      return;
    }

    let finalBankName = '';
    let finalIban = '';

    if (useExistingAccount) {
      if (!selectedAccountId) {
        setMessage('Por favor selecciona una cuenta bancaria.');
        return;
      }
      const acc = accounts.find(a => a.id === selectedAccountId);
      if (!acc) return;
      finalBankName = acc.bank_name;
      finalIban = acc.iban;
    } else {
      // Validate new bank
      finalBankName = isCustomBank ? customBankName.trim() : selectedBank;
      if (isCustomBank && !customBankName.trim()) {
        setMessage('Por favor escribe el nombre de tu banco o entidad financiera.');
        return;
      }
      if (!accountNumber.trim() || accountNumber.trim().length < 6) {
        setMessage('Por favor ingresa un número de cuenta / IBAN válido.');
        return;
      }
      finalIban = accountNumber.trim();

      // Save this bank account for the user so it's remembered
      dataService.addBankAccount({
        user_id: user.id,
        account_holder: accountHolder || user.full_name,
        iban: finalIban,
        bank_name: `${finalBankName} (${selectedCountry})`,
        country: selectedCountry
      });
    }

    // Create withdrawal transaction
    dataService.createTransaction(user.id, 'withdrawal', amt, 'pending');

    setIsSuccess(true);
    setMessage(`¡Solicitud de retiro de ${amt.toLocaleString()} € enviada con éxito a ${finalBankName}! Nuestro equipo procesará la transferencia a tu cuenta en breve.`);
    setWithdrawAmount('');
    
    setTimeout(() => {
      navigate('/app/dashboard');
    }, 3500);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 font-sans">
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-100 shadow-xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto shadow-sm">
            <Icon name="ArrowDownRight" size={24} />
          </div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-900">
            Retiro de Fondos a Cuenta Bancaria
          </h1>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Transfiere tus fondos disponibles a tu cuenta bancaria en España o cualquier país de habla hispana.
          </p>
        </div>

        {/* Balance Card */}
        <div className="bg-gradient-to-tr from-indigo-900 to-slate-900 text-white p-6 rounded-3xl text-center space-y-1 shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none"></div>
          <span className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest block">
            Saldo Disponible para Retiro
          </span>
          <span className="text-3xl sm:text-4xl font-extrabold font-display block">
            {balance.toLocaleString()} €
          </span>
        </div>

        <form onSubmit={handleWithdrawal} className="space-y-6 pt-2">
          
          {/* Account Selection Mode (Existing vs New) */}
          {accounts.length > 0 && (
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-700 block">
                Destino de los fondos
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setUseExistingAccount(true)}
                  className={`p-3 rounded-2xl text-xs font-bold transition-all border ${
                    useExistingAccount
                      ? 'bg-indigo-50 border-indigo-600 text-indigo-900 shadow-sm'
                      : 'bg-slate-50 border-slate-200/80 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Icon name="CreditCard" size={16} className="mx-auto mb-1" />
                  Cuenta Guardada ({accounts.length})
                </button>
                <button
                  type="button"
                  onClick={() => setUseExistingAccount(false)}
                  className={`p-3 rounded-2xl text-xs font-bold transition-all border ${
                    !useExistingAccount
                      ? 'bg-indigo-50 border-indigo-600 text-indigo-900 shadow-sm'
                      : 'bg-slate-50 border-slate-200/80 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Icon name="PlusCircle" size={16} className="mx-auto mb-1" />
                  Nueva Cuenta / Otro Banco
                </button>
              </div>
            </div>
          )}

          {/* Option A: Select Existing Verified Account */}
          {useExistingAccount && accounts.length > 0 ? (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                Selecciona tu cuenta bancaria
              </label>
              <select
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
              >
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.bank_name} • {acc.iban.substring(0, 8)}...{acc.iban.substring(acc.iban.length - 4)} ({acc.account_holder})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            /* Option B: Choose Bank from Spanish Speaking Countries or Enter Custom */
            <div className="space-y-4 bg-slate-50 p-5 rounded-3xl border border-slate-200/70 animate-in fade-in duration-200">
              
              <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs border-b border-slate-200/60 pb-2">
                <Icon name="Globe" size={16} className="text-indigo-600" />
                <span>Datos de la Cuenta Bancaria</span>
              </div>

              {/* Country Selector */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  País de la Entidad Bancaria
                </label>
                <select
                  value={selectedCountry}
                  onChange={(e) => handleCountryChange(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-600"
                >
                  {SPANISH_SPEAKING_BANKS.map(c => (
                    <option key={c.code} value={c.name}>
                      {c.name} ({c.currency})
                    </option>
                  ))}
                </select>
              </div>

              {/* Bank Selector for the Country */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Banco / Entidad Financiera en {selectedCountry}
                </label>
                <select
                  value={selectedBank}
                  onChange={(e) => handleBankChange(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-600"
                >
                  {currentCountryObj.banks.map((b, idx) => (
                    <option key={idx} value={b}>{b}</option>
                  ))}
                  <option value={OTHER_BANK_OPTION}>
                    ➕ {OTHER_BANK_OPTION}
                  </option>
                </select>
              </div>

              {/* Custom Bank Input (if "Otro Banco" chosen) */}
              {isCustomBank && (
                <div className="space-y-1 animate-in fade-in duration-200">
                  <label className="text-xs font-bold text-slate-700 block">
                    Nombre de tu Banco / Caja / Cooperativa
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ej. Cooperativa San Francisco, Banco Agrícola..."
                    value={customBankName}
                    onChange={(e) => setCustomBankName(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-600"
                  />
                </div>
              )}

              {/* Account Number / IBAN / CLABE */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {currentCountryObj.accountLabel}
                </label>
                <input
                  type="text"
                  required
                  placeholder={currentCountryObj.accountPlaceholder}
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value.toUpperCase())}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-mono font-semibold text-slate-800 focus:outline-none focus:border-indigo-600"
                />
              </div>

              {/* Account Holder */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Titular de la Cuenta
                </label>
                <input
                  type="text"
                  required
                  value={accountHolder}
                  onChange={(e) => setAccountHolder(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-600"
                />
              </div>
            </div>
          )}

          {/* Amount to withdraw */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Monto a retirar (€)
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                max={balance}
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                required
                placeholder="ej. 5000"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-12 py-3 text-base font-bold text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
              />
              <span className="absolute right-4 top-3.5 text-slate-400 font-bold text-xs">
                EUR (€)
              </span>
            </div>
            <div className="flex justify-between text-[11px] text-slate-400 mt-1.5 font-medium">
              <span>Monto mínimo: 1 €</span>
              <button
                type="button"
                onClick={() => setWithdrawAmount(balance.toString())}
                className="text-indigo-600 font-bold hover:underline"
              >
                Retirar Todo ({balance.toLocaleString()} €)
              </button>
            </div>
          </div>

          {/* Message Alert */}
          {message && (
            <div className={`p-4 rounded-2xl text-xs font-semibold leading-relaxed animate-in fade-in flex items-start gap-2.5 ${
              isSuccess 
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}>
              <Icon name={isSuccess ? 'CheckCircle' : 'AlertCircle'} size={18} className="shrink-0 mt-0.5" />
              <span>{message}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={balance <= 0}
            className="w-full btn-primary-purple font-bold py-3.5 rounded-2xl text-xs sm:text-sm transition-all shadow-md shadow-indigo-500/25 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Icon name="ArrowDownRight" size={18} />
            Confirmar y Retirar Fondos
          </button>
        </form>

      </div>
    </div>
  );
}
