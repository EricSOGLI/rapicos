/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dataService, initializeApplication } from '../../lib/supabase';
import { LoanRequest, Profile, ConsultationLead } from '../../types';
import Icon from '../../components/Icons';
import StatusBadge from '../../components/StatusBadge';
import KpiCard from '../../components/KpiCard';

export function AdminDashboard() {
  const [stats, setStats] = useState({
    pendingLoans: 0,
    newLeads: 0,
    totalDisbursed: 0,
    totalClients: 0
  });
  const [requests, setRequests] = useState<LoanRequest[]>([]);
  const [recentLeads, setRecentLeads] = useState<ConsultationLead[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);

  useEffect(() => {
    const init = async () => {
      await initializeApplication();
      const loanReqs = dataService.getLoanRequests();
      setRequests(loanReqs.slice(0, 5));

      const leads = dataService.getConsultationLeads();
      setRecentLeads(leads.slice(0, 4));

      const prs = dataService.getProfiles();
      setProfiles(prs.filter(p => p.role === 'client'));

      // Compute stats
      const pending = loanReqs.filter(r => r.status === 'pending' || r.status === 'under_review').length;
      const uncontactedLeads = leads.filter(l => l.status === 'new').length;
      
      let disbursedSum = 0;
      const txs = dataService.getTransactions();
      txs.forEach(t => {
        if (t.type === 'disbursement' && t.status === 'completed') {
          disbursedSum += t.amount;
        }
      });

      setStats({
        pendingLoans: pending,
        newLeads: uncontactedLeads,
        totalDisbursed: disbursedSum,
        totalClients: prs.filter(p => p.role === 'client').length
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
          title="Consultas Web (Leads)"
          value={stats.newLeads}
          subText={`${stats.newLeads} nuevas por contactar`}
          icon="Users"
          color="brand"
        />
        <KpiCard
          title="Solicitudes de crédito"
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
          icon="UserCheck"
          color="brand"
        />
      </div>

      {/* Main split view */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Recent loan requests */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-50 pb-3">
            <h3 className="font-display font-bold text-base text-slate-900">Solicitudes recientes de préstamo</h3>
            <Link to="/admin/solicitudes" className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold transition-colors">Ver todas →</Link>
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
                        className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors"
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

        {/* Shortcuts & Recent Leads */}
        <div className="lg:col-span-4 space-y-6">
          {/* Recent Consultation Leads Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-50 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-indigo-600"></span>
                <h3 className="font-display font-bold text-sm text-slate-900">Nuevas Consultas</h3>
              </div>
              <Link to="/admin/consultas" className="text-[11px] text-indigo-600 font-bold hover:underline">
                Gestionar ({recentLeads.length}) →
              </Link>
            </div>

            <div className="space-y-2.5">
              {recentLeads.length === 0 ? (
                <p className="text-xs text-slate-400 py-2">No hay consultas registradas aún.</p>
              ) : (
                recentLeads.map(lead => (
                  <div key={lead.id} className="p-2.5 bg-slate-50 rounded-2xl flex items-center justify-between text-xs">
                    <div className="min-w-0">
                      <span className="font-bold text-slate-900 block truncate">{lead.full_name}</span>
                      <span className="text-[10px] text-slate-400 block truncate">{lead.phone}</span>
                    </div>
                    <Link
                      to="/admin/consultas"
                      className="px-2.5 py-1 bg-white hover:bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-bold shadow-2xs shrink-0"
                    >
                      Ver
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick links */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-display font-bold text-base text-slate-800">Acciones Rápidas</h3>
            <div className="grid grid-cols-1 gap-2 text-xs font-semibold">
              <Link
                to="/admin/consultas"
                className="flex items-center justify-between p-3 rounded-xl bg-indigo-50/60 hover:bg-indigo-50 text-indigo-900 transition-all border border-indigo-100"
              >
                <span>Consultas Web / Leads</span>
                <Icon name="ChevronRight" size={14} className="text-indigo-400" />
              </Link>
              <Link
                to="/admin/solicitudes"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 transition-all"
              >
                <span>Gestión de solicitudes</span>
                <Icon name="ChevronRight" size={14} className="text-slate-400" />
              </Link>
              <Link
                to="/admin/transacciones"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 transition-all"
              >
                <span>Aprobación y retiro de fondos</span>
                <Icon name="ChevronRight" size={14} className="text-slate-400" />
              </Link>
              <Link
                to="/admin/tipos-prestamos"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 transition-all"
              >
                <span>Configurar tipos de préstamo</span>
                <Icon name="ChevronRight" size={14} className="text-slate-400" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
