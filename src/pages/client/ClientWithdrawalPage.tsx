/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { dataService, SessionUser } from '../../lib/supabase';
import { BankAccount } from '../../types';
import Icon from '../../components/Icons';

export function ClientWithdrawalPage({ user }: { user: SessionUser }) {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [balance, setBalance] = useState(0);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const acs = dataService.getBankAccounts(user.id).filter(a => a.is_verified);
    setAccounts(acs);
    if (acs.length > 0) setSelectedAccountId(acs[0].id);

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

  const handleWithdrawal = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    const amt = Number(withdrawAmount);
    if (!amt || amt <= 0) {
      setMessage('Ingresa un monto válido para el retiro.');
      return;
    }

    if (amt > balance) {
      setMessage('El monto supera tu saldo disponible.');
      return;
    }

    if (!selectedAccountId) {
      setMessage('Por favor selecciona una cuenta bancaria verificada.');
      return;
    }

    const selectedAcc = accounts.find(a => a.id === selectedAccountId);
    if (!selectedAcc) return;

    // Create withdrawal transaction with pending status
    dataService.createTransaction(user.id, 'withdrawal', amt, 'pending');

    setMessage('¡Solicitud de retiro recibida! El administrador procesará la transferencia en breve.');
    setWithdrawAmount('');
    
    setTimeout(() => {
      navigate('/app/dashboard');
    }, 2500);
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8 font-sans">
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-100 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <h1 className="font-display font-bold text-2xl text-slate-900">Retiro de fondos a cuenta bancaria</h1>
          <p className="text-xs text-slate-400">Transfiere los fondos aprobados de tu saldo RapiCredito a tu cuenta bancaria.</p>
        </div>

        <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl text-center space-y-1">
          <span className="text-xs text-slate-400 font-semibold block uppercase">Saldo disponible</span>
          <span className="text-3xl font-extrabold text-slate-900 font-display block">{balance.toLocaleString()} €</span>
        </div>

        {accounts.length === 0 ? (
          <div className="space-y-4 pt-2">
            <p className="text-xs text-slate-400 text-center leading-relaxed">
              No tienes ninguna cuenta bancaria verificada en el sistema. Para retirar fondos, primero debes agregar y verificar tu IBAN.
            </p>
            <Link
              to="/app/cuentas"
              className="w-full block text-center btn-primary-green font-semibold py-2.5 rounded-xl text-xs"
            >
              Agregar cuenta bancaria
            </Link>
          </div>
        ) : (
          <form onSubmit={handleWithdrawal} className="space-y-5 pt-2">
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">Selecciona la cuenta para el pago</label>
              <select
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-brand-500"
              >
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.bank_name} • {acc.iban.substring(0, 10)}...
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">Monto a retirar (€)</label>
              <input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:border-brand-500"
                placeholder="ej. 5000"
              />
            </div>

            {message && (
              <p className="text-xs text-brand-600 font-semibold bg-brand-50 p-2.5 rounded-lg text-center leading-normal">
                {message}
              </p>
            )}

            <button
              type="submit"
              className="w-full btn-primary-green font-semibold py-3 rounded-xl text-xs transition-colors shadow-sm flex items-center justify-center gap-1.5"
            >
              <Icon name="ArrowDownRight" size={16} /> Retirar ahora
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
