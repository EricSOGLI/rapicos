/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { dataService, initializeApplication } from '../../lib/supabase';
import { LoanRequest, Profile, LoanType } from '../../types';
import Icon from '../../components/Icons';
import StatusBadge from '../../components/StatusBadge';
import ResponsiveTable, { TableColumn } from '../../components/ResponsiveTable';

export function AdminLoanRequests() {
  const [requests, setRequests] = useState<LoanRequest[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loanTypes, setLoanTypes] = useState<LoanType[]>([]);
  
  const [selectedRequest, setSelectedRequest] = useState<LoanRequest | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [activeFilter, setActiveFilter] = useState('Todos');

  const refreshData = async () => {
    await initializeApplication();
    setRequests(dataService.getLoanRequests());
    setProfiles(dataService.getProfiles());
    setLoanTypes(dataService.getAllLoanTypesAdmin());
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleUpdateStatus = (id: string, status: any) => {
    dataService.updateLoanRequestStatus(id, status, adminNote);
    setAdminNote('');
    setSelectedRequest(null);
    refreshData();
  };

  const getStatusFromFilter = (filter: string) => {
    switch (filter) {
      case 'Pendientes': return 'pending';
      case 'Aprobados': return 'approved';
      case 'Firmados': return 'signed';
      case 'Desembolsados': return 'disbursed';
      case 'Rechazados': return 'rejected';
      default: return 'all';
    }
  };

  const filteredRequests = activeFilter === 'Todos'
    ? requests
    : requests.filter(r => r.status === getStatusFromFilter(activeFilter));

  const columns: TableColumn<LoanRequest>[] = [
    {
      header: 'Cliente',
      render: (req) => {
        const client = profiles.find(p => p.id === req.user_id);
        return (
          <div>
            <span className="font-semibold text-slate-900 block">{client?.full_name || 'Cliente sin nombre'}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">{client?.phone || client?.email}</span>
          </div>
        );
      }
    },
    {
      header: 'Modelo / Monto',
      render: (req) => {
        const type = loanTypes.find(t => t.id === req.loan_type_id);
        return (
          <div>
            <span className="font-semibold text-slate-800 block">{type?.name}</span>
            <span className="text-[10px] text-brand-600 block font-bold mt-0.5">
              {req.amount_requested.toLocaleString()} € • {req.duration_months} meses
            </span>
          </div>
        );
      }
    },
    {
      header: 'Estado',
      render: (req) => <StatusBadge status={req.status} />
    },
    {
      header: 'Gestión',
      className: 'text-right',
      render: (req) => (
        <button
          onClick={() => { setSelectedRequest(req); setAdminNote(req.admin_note || ''); }}
          className="bg-slate-50 hover:bg-slate-100 text-slate-700 px-3 py-2 rounded-xl font-bold w-full md:w-auto text-xs transition-colors"
        >
          Gestionar
        </button>
      )
    }
  ];

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'under_review': return 'En revisión';
      case 'approved': return 'Aprobado';
      case 'signed': return 'Firmado';
      case 'disbursed': return 'Desembolsado';
      case 'rejected': return 'Rechazado';
      default: return status;
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-10 font-sans">
      <div>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 leading-tight">Solicitudes de Crédito</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">Revisa los documentos de los clientes y aprueba o rechaza sus solicitudes de financiamiento.</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-4 text-xs font-semibold">
        {['Todos', 'Pendientes', 'Aprobados', 'Firmados', 'Desembolsados', 'Rechazados'].map(filter => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeFilter === filter
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-100 hover:bg-slate-50'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Requests Table Wrapper */}
        <div className="lg:col-span-7">
          <ResponsiveTable
            columns={columns}
            data={filteredRequests}
            keyExtractor={(req) => req.id}
            emptyMessage="No hay solicitudes de crédito en esta categoría."
          />
        </div>

        {/* Request Details Decision Drawer */}
        {selectedRequest && (
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6 animate-in fade-in duration-200">
            <div className="flex justify-between items-center border-b border-slate-50 pb-3">
              <h3 className="font-display font-bold text-base text-slate-900">Detalles y Decisión</h3>
              <button 
                onClick={() => setSelectedRequest(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <Icon name="X" size={18} />
              </button>
            </div>
            
            <div className="space-y-4 text-xs font-medium text-slate-600">
              <div className="flex justify-between">
                <span className="text-slate-400">Cliente solicitante:</span>
                <strong className="text-slate-900">{profiles.find(p => p.id === selectedRequest.user_id)?.full_name}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Ingreso mensual:</span>
                <strong className="text-emerald-600 font-bold">{selectedRequest.monthly_income.toLocaleString()} € / mes</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Motivo del préstamo:</span>
                <strong className="text-slate-900">{selectedRequest.purpose}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Estado actual:</span>
                <strong className="text-slate-900">{getStatusLabel(selectedRequest.status)}</strong>
              </div>

              {selectedRequest.documents.length > 0 && (
                <div className="space-y-2 pt-3 border-t border-slate-50">
                  <span className="block font-bold text-slate-700">Documentos adjuntos:</span>
                  <div className="grid grid-cols-1 gap-2">
                    {selectedRequest.documents.map((doc, i) => (
                      <a
                        key={i}
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex flex-col gap-1.5 hover:bg-slate-100 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Icon name="FileText" size={14} className="text-brand-600" />
                          <span className="truncate flex-1 font-semibold text-slate-700">{doc.name}</span>
                          <Icon name="ExternalLink" size={12} className="text-slate-400" />
                        </div>
                        {doc.url && !doc.name.toLowerCase().includes('.pdf') && (
                          <img 
                            src={doc.url} 
                            className="mt-2 w-full max-h-48 object-contain rounded-lg border border-slate-200 bg-white" 
                            alt={doc.name} 
                          />
                        )}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Decision Section based on current status */}
              <div className="pt-4 border-t border-slate-50 space-y-4">
                {(selectedRequest.status === 'pending' || selectedRequest.status === 'under_review') && (
                  <>
                    <div className="space-y-2">
                      <label className="block font-bold text-slate-700">Decisión del administrador (visible para el cliente)</label>
                      <textarea
                        value={adminNote}
                        onChange={(e) => setAdminNote(e.target.value)}
                        placeholder="Ingresa una nota o justificación de la decisión..."
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs font-semibold focus:outline-none focus:border-brand-500 h-24 font-sans text-slate-800"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-bold">
                      <button
                        onClick={() => handleUpdateStatus(selectedRequest.id, 'approved')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl text-xs transition-colors"
                      >
                        Aprobar préstamo
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(selectedRequest.id, 'rejected')}
                        className="bg-rose-600 hover:bg-rose-700 text-white py-3 rounded-xl text-xs transition-colors"
                      >
                        Rechazar préstamo
                      </button>
                    </div>
                  </>
                )}

                {selectedRequest.status === 'approved' && (
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 text-amber-700 text-center font-bold text-[11px]">
                    La solicitud fue aprobada y el contrato fue generado. Se espera la firma del cliente.
                  </div>
                )}

                {selectedRequest.status === 'signed' && (
                  <div className="space-y-3">
                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-700 text-center font-bold text-[11px]">
                      El cliente firmó el contrato. Los fondos están listos para desembolso.
                    </div>
                    <button
                      onClick={() => handleUpdateStatus(selectedRequest.id, 'disbursed')}
                      className="w-full bg-brand-600 hover:bg-brand-700 text-white py-3 rounded-xl text-xs transition-colors font-bold shadow-sm"
                    >
                      Desembolsar fondos al cliente
                    </button>
                  </div>
                )}

                {selectedRequest.status === 'disbursed' && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-slate-600 text-center font-bold text-[11px]">
                    Los fondos fueron acreditados exitosamente en el saldo del cliente.
                  </div>
                )}

                {selectedRequest.status === 'rejected' && (
                  <div className="p-3 bg-rose-50 rounded-xl border border-rose-100 text-rose-700 text-center font-bold text-[11px]">
                    Esta solicitud fue rechazada.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
