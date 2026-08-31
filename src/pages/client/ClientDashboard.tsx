/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dataService, initializeApplication, SessionUser } from '../../lib/supabase';
import { LoanRequest, Transaction, Notification, LoanType } from '../../types';
import Icon from '../../components/Icons';
import StatusBadge from '../../components/StatusBadge';
import { calculateMonthlyPayment } from '../../lib/payment';

export function ClientDashboard({ user }: { user: SessionUser }) {
  const [loanRequests, setLoanRequests] = useState<LoanRequest[]>([]);
  const [loanTypes, setLoanTypes] = useState<LoanType[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    const init = async () => {
      await initializeApplication();
      const lts = dataService.getLoanTypes();
      setLoanTypes(lts);

      const reqs = dataService.getLoanRequests(user.id);
      setLoanRequests(reqs);

      const txs = dataService.getTransactions(user.id);
      setTransactions(txs);

      setNotifications(dataService.getNotifications(user.id).slice(0, 3));

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
    };
    init();
  }, [user.id]);

  const activeLoan = loanRequests.find(r => r.status === 'disbursed' || r.status === 'approved');

  return (
    <div className="space-y-8 pb-10">
      {/* Welcome banner with Balance Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-8 bg-brand-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col justify-between relative overflow-hidden shadow-sm">
          <div className="space-y-2 relative z-10">
            <span className="text-[11px] font-bold text-accent-400 uppercase tracking-widest block">Cuenta de cliente</span>
            <h1 className="font-display font-bold text-2xl sm:text-3xl">Bienvenido de nuevo, {user.full_name}</h1>
            <p className="text-brand-100/70 text-xs leading-relaxed max-w-md">
              Tu portal RapiCredito está activo. Monitorea montos aprobados, retira fondos y gestiona tu cuenta en un solo lugar.
            </p>
          </div>
          
          <div className="flex gap-4 pt-6 relative z-10">
            <Link
              to="/app/prestamos"
              className="btn-primary-green font-semibold px-4 py-2 rounded-xl text-xs transition-colors"
            >
              Nueva solicitud de préstamo
            </Link>
            <Link
              to="/app/mensajes"
              className="bg-brand-800 hover:bg-brand-700 text-brand-100 font-semibold px-4 py-2 rounded-xl text-xs transition-colors"
            >
              Hablar con un agente
            </Link>
          </div>
          
          {/* Decorative design elements */}
          <div className="absolute -bottom-16 -right-16 w-52 h-52 bg-brand-600 rounded-full blur-3xl opacity-30"></div>
        </div>

        {/* Balance Card */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between relative">
          <div>
            <span className="text-xs text-slate-400 block font-semibold uppercase tracking-wider mb-2">Saldo Disponible</span>
            <span className="text-4xl font-extrabold text-slate-900 font-display block">
              {balance.toLocaleString()} €
            </span>
            <span className="text-[10px] text-emerald-600 font-semibold block mt-1.5 flex items-center gap-1">
              <Icon name="CheckCircle" size={12} /> Fondos listos para retiro
            </span>
          </div>

          <div className="pt-4 border-t border-slate-50 mt-4 flex gap-2">
            <Link
              to="/app/retiro"
              className="flex-1 text-center btn-primary-green font-semibold py-2.5 rounded-xl text-xs transition-colors flex items-center justify-center gap-1"
            >
              <Icon name="ArrowDownRight" size={14} /> Retirar a mi IBAN
            </Link>
          </div>
        </div>
      </div>

      {/* Main Grid: Active loan state vs quick shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Active Loan status */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-50 pb-4">
            <h3 className="font-display font-bold text-lg text-slate-900">Solicitud activa</h3>
            {activeLoan ? (
              <StatusBadge status={activeLoan.status} />
            ) : (
              <span className="text-xs text-slate-400">No hay solicitudes activas</span>
            )}
          </div>

          {activeLoan ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-medium">Monto</span>
                  <span className="text-base font-bold text-slate-800">{activeLoan.amount_requested.toLocaleString()} €</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-medium">Plazo</span>
                  <span className="text-base font-bold text-slate-800">{activeLoan.duration_months} meses</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-medium">Pagado</span>
                  <span className="text-base font-bold text-slate-800">0 €</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-medium">Próxima cuota</span>
                  <span className="text-base font-bold text-brand-600">
                    {calculateMonthlyPayment(activeLoan.amount_requested, activeLoan.duration_months, 5.49).monthly} €
                  </span>
                </div>
              </div>

              {activeLoan.status === 'approved' && (
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <Icon name="FileWarning" className="text-amber-600 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-amber-900">Se requiere tu firma digital</h4>
                      <p className="text-[11px] text-amber-700 mt-0.5">El contrato está listo. Por favor fírmalo para activar el desembolso.</p>
                    </div>
                  </div>
                  <Link
                    to={`/app/prestamos/${activeLoan.id}`}
                    className="btn-primary-green font-semibold px-4 py-2 rounded-xl text-xs transition-colors self-stretch sm:self-auto text-center"
                  >
                    Revisar y firmar
                  </Link>
                </div>
              )}

              {activeLoan.status === 'disbursed' && (
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200/50 flex items-center gap-3">
                  <Icon name="CheckCircle" className="text-emerald-600" />
                  <div>
                    <h4 className="text-xs font-bold text-emerald-900">Préstamo desembolsado con éxito</h4>
                    <p className="text-[11px] text-emerald-700 mt-0.5">Los fondos están acreditados en tu saldo virtual. Puedes transferirlos a tu cuenta bancaria.</p>
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <Link
                  to={`/app/prestamos/${activeLoan.id}`}
                  className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                >
                  Ver detalles de la cuota <Icon name="ChevronRight" size={14} />
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400 text-xs">
              En este momento no tienes un préstamo activo. Usa nuestro simulador para enviar una solicitud.
              <div className="mt-4">
                <Link
                  to="/app/prestamos"
                  className="inline-flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold px-4 py-2 rounded-xl"
                >
                  <Icon name="Plus" size={15} /> Iniciar nueva solicitud
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Quick activity and recent notifs */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-display font-bold text-base text-slate-800">Notificaciones recientes</h3>
            <div className="space-y-3">
              {notifications.map(notif => (
                <div key={notif.id} className="flex gap-3 items-start text-xs border-b border-slate-50/50 pb-2.5 last:border-0 last:pb-0">
                  <div className={`p-1 rounded bg-slate-50 text-slate-400 mt-0.5 ${!notif.is_read ? 'bg-brand-50 text-brand-600' : ''}`}>
                    <Icon name="Bell" size={14} />
                  </div>
                  <div>
                    <span className={`font-semibold block ${!notif.is_read ? 'text-slate-800' : 'text-slate-500'}`}>
                      {notif.title}
                    </span>
                    <p className="text-slate-400 text-[11px] mt-0.5 line-clamp-2">{notif.message}</p>
                  </div>
                </div>
              ))}
              <Link
                to="/app/notificaciones"
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 block text-center pt-2 border-t border-slate-50"
              >
                Ver todas las notificaciones
              </Link>
            </div>
          </div>
        </div>

      </div>

      {/* Transaction table widget */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
        <h3 className="font-display font-bold text-lg text-slate-900">Transacciones recientes</h3>
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">No tienes transacciones registradas.</div>
        ) : (
          <>
            {/* Mobile View: Cards */}
            <div className="space-y-3 sm:hidden">
              {transactions.map(tx => (
                <div key={tx.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/20 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-[10px] text-slate-400 uppercase"># {tx.id.substring(0, 8).toUpperCase()}</span>
                    <StatusBadge status={tx.status} />
                  </div>
                  <div className="flex justify-between items-end">
                    <div>
                      <span className="font-bold text-xs text-slate-800 block">
                        {tx.type === 'disbursement' ? 'Desembolso a saldo' : tx.type === 'withdrawal' ? 'Retiro a cuenta bancaria' : 'Pago de cuota'}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {new Date(tx.created_at).toLocaleDateString('es-ES')} • {new Date(tx.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <span className={`text-sm font-bold ${tx.type === 'disbursement' ? 'text-emerald-600' : 'text-slate-800'}`}>
                      {tx.type === 'disbursement' ? '+' : '-'} {tx.amount.toLocaleString()} €
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop View: Table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="py-3">ID transacción</th>
                    <th className="py-3">Fecha y hora</th>
                    <th className="py-3">Descripción / Tipo</th>
                    <th className="py-3">Monto</th>
                    <th className="py-3">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 font-sans text-slate-600">
                  {transactions.map(tx => (
                    <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 font-mono text-slate-400">{tx.id.toUpperCase()}</td>
                      <td className="py-3">{new Date(tx.created_at).toLocaleDateString('es-ES')} • {new Date(tx.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</td>
                      <td className="py-3 font-medium text-slate-800">
                        {tx.type === 'disbursement' ? 'Desembolso a saldo' : tx.type === 'withdrawal' ? 'Retiro a cuenta bancaria' : 'Pago de cuota'}
                      </td>
                      <td className={`py-3 font-bold ${tx.type === 'disbursement' ? 'text-emerald-600' : 'text-slate-800'}`}>
                        {tx.type === 'disbursement' ? '+' : '-'} {tx.amount.toLocaleString()} €
                      </td>
                      <td className="py-3">
                        <StatusBadge status={tx.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
