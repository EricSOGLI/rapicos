/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dataService, initializeApplication } from '../../lib/supabase';
import { LoanRequest, Profile } from '../../types';
import Icon from '../../components/Icons';
import StatusBadge from '../../components/StatusBadge';
import KpiCard from '../../components/KpiCard';

export function AdminDashboard() {
  const [stats, setStats] = useState({
    pendingLoans: 0,
    totalDisbursed: 0,
    totalClients: 0,
    activeSubscribers: 0
  });
  const [requests, setRequests] = useState<LoanRequest[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);

  useEffect(() => {
    const init = async () => {
      await initializeApplication();
      const loanReqs = dataService.getLoanRequests();
      setRequests(loanReqs.slice(0, 5));

      const prs = dataService.getProfiles();
      setProfiles(prs.filter(p => p.role === 'client'));

      // Compute stats
      const pending = loanReqs.filter(r => r.status === 'pending' || r.status === 'under_review').length;
      
      let disbursedSum = 0;
      const txs = dataService.getTransactions();
      txs.forEach(t => {
        if (t.type === 'disbursement' && t.status === 'completed') {
          disbursedSum += t.amount;
        }
      });

      setStats({
        pendingLoans: pending,
        totalDisbursed: disbursedSum,
        totalClients: prs.filter(p => p.role === 'client').length,
        activeSubscribers: dataService.getNewsletterSubscribers().length
      });
    };
    init();
  }, []);

  return (
    <div className="space-y-6 sm:space-y-8 pb-10 font-sans">
      <div>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 leading-tight">Panel de Control General</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">Resumen de operaciones en la plataforma RapiCredito, análisis de solicitudes e indicadores financieros.</p>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <KpiCard
          title="Solicitudes en curso"
          value={stats.pendingLoans}
          subText="Atención requerida"
          icon="Clock"
          color="amber"
        />
        <KpiCard
          title="Total desembolsado"
          value={`${stats.totalDisbursed.toLocaleString()} €`}
          subText="Transferido a clientes"
          icon="TrendingUp"
          color="emerald"
        />
        <KpiCard
          title="Clientes registrados"
          value={stats.totalClients}
          subText="Perfiles activos"
          icon="Users"
          color="brand"
        />
        <KpiCard
          title="Suscriptores al boletín"
          value={stats.activeSubscribers}
          subText="Registrados al boletín"
          icon="Mail"
          color="blue"
        />
      </div>

      {/* Main split view */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Recent loan requests */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-50 pb-3">
            <h3 className="font-display font-bold text-base text-slate-900">Solicitudes recientes de préstamo</h3>
            <Link to="/admin/solicitudes" className="text-xs text-brand-600 hover:text-brand-700 font-semibold transition-colors">Ver todas</Link>
          </div>

          {requests.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">No hay solicitudes recientes.</div>
          ) : (
            <div className="divide-y divide-slate-50">
              {requests.map(req => {
                const client = profiles.find(p => p.id === req.user_id);
                return (
                  <div key={req.id} className="py-3.5 flex items-center justify-between text-xs gap-4 hover:bg-slate-50/20 px-2 rounded-xl transition-colors">
                     <div className="min-w-0">
                      <span className="font-semibold text-slate-800 block truncate">{client?.full_name || 'Cliente no identificado'}</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">{req.amount_requested.toLocaleString()} € • {req.duration_months} meses</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <StatusBadge status={req.status} />
                      <Link
                        to={`/admin/solicitudes?ver=${req.id}`}
                        className="p-1.5 text-slate-400 hover:text-brand-600 transition-colors"
                        title="Detalles de la solicitud"
                      >
                        <Icon name="Eye" size={16} />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Shortcuts */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-4">
          <h3 className="font-display font-bold text-base text-slate-800">Acciones Rápidas</h3>
          <div className="grid grid-cols-1 gap-2 text-xs font-semibold">
            <Link
              to="/admin/solicitudes"
              className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 transition-all"
            >
              <span>Gestión de solicitudes de crédito</span>
              <Icon name="ChevronRight" size={14} className="text-slate-400" />
            </Link>
            <Link
              to="/admin/transacciones"
              className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 transition-all"
            >
              <span>Aprobación y retiro de fondos</span>
              <Icon name="ChevronRight" size={14} className="text-slate-400" />
            </Link>
            <Link
              to="/admin/tipos-prestamos"
              className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 transition-all"
            >
              <span>Configurar tipos de préstamo</span>
              <Icon name="ChevronRight" size={14} className="text-slate-400" />
            </Link>
            <Link
              to="/admin/mensajes"
              className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 transition-all"
            >
              <span>Atención al cliente y mensajes</span>
              <Icon name="ChevronRight" size={14} className="text-slate-400" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
