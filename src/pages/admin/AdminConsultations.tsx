/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { dataService } from '../../lib/supabase';
import { ConsultationLead, ConsultationLeadStatus } from '../../types';
import Icon from '../../components/Icons';
import KpiCard from '../../components/KpiCard';

export function AdminConsultations() {
  const [leads, setLeads] = useState<ConsultationLead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<ConsultationLead[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedLead, setSelectedLead] = useState<ConsultationLead | null>(null);
  const [leadNotes, setLeadNotes] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const loadLeads = () => {
    const data = dataService.getConsultationLeads();
    setLeads(data);
  };

  useEffect(() => {
    loadLeads();
  }, []);

  useEffect(() => {
    let result = leads;
    if (statusFilter !== 'all') {
      result = result.filter(l => l.status === statusFilter);
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(l => 
        l.full_name.toLowerCase().includes(q) ||
        l.email.toLowerCase().includes(q) ||
        l.phone.toLowerCase().includes(q) ||
        l.loan_type.toLowerCase().includes(q)
      );
    }
    setFilteredLeads(result);
  }, [leads, statusFilter, searchTerm]);

  const handleStatusChange = (id: string, newStatus: ConsultationLeadStatus) => {
    dataService.updateConsultationLeadStatus(id, newStatus);
    loadLeads();
    if (selectedLead && selectedLead.id === id) {
      setSelectedLead(prev => prev ? { ...prev, status: newStatus } : null);
    }
    setFeedbackMessage('Estado de la consulta actualizado correctamente.');
    setTimeout(() => setFeedbackMessage(''), 3000);
  };

  const handleSaveNotes = (id: string) => {
    dataService.updateConsultationLeadStatus(id, selectedLead?.status || 'new', leadNotes);
    loadLeads();
    if (selectedLead && selectedLead.id === id) {
      setSelectedLead(prev => prev ? { ...prev, notes: leadNotes } : null);
    }
    setFeedbackMessage('Notas guardadas con éxito.');
    setTimeout(() => setFeedbackMessage(''), 3000);
  };

  const handleDeleteLead = (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta consulta?')) {
      dataService.deleteConsultationLead(id);
      loadLeads();
      if (selectedLead?.id === id) {
        setSelectedLead(null);
      }
      setFeedbackMessage('Consulta eliminada del registro.');
      setTimeout(() => setFeedbackMessage(''), 3000);
    }
  };

  const openLeadModal = (lead: ConsultationLead) => {
    setSelectedLead(lead);
    setLeadNotes(lead.notes || '');
  };

  const getStatusBadge = (status: ConsultationLeadStatus) => {
    switch (status) {
      case 'new':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            Nueva Consulta
          </span>
        );
      case 'contacted':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
            Contactado
          </span>
        );
      case 'converted':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
            Convertido
          </span>
        );
      case 'archived':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
            Archivado
          </span>
        );
    }
  };

  const getLoanTypeName = (typeSlug: string) => {
    const map: Record<string, string> = {
      'prestamo-personal': 'Préstamo Personal Rápido',
      'microcredito-emergencia': 'Microcrédito de Emergencia',
      'prestamo-hogar': 'Remodelación de Hogar',
      'prestamo-vehiculo': 'Préstamo Vehicular',
      'prestamo-educativo': 'Préstamo Educativo'
    };
    return map[typeSlug] || typeSlug;
  };

  const totalLeads = leads.length;
  const newLeads = leads.filter(l => l.status === 'new').length;
  const contactedLeads = leads.filter(l => l.status === 'contacted').length;
  const convertedLeads = leads.filter(l => l.status === 'converted').length;

  return (
    <div className="space-y-8 font-sans pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 tracking-tight">
            Consultas Web / Leads
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Gestiona y contacta a los clientes potenciales que solicitaron asesoría desde la página de inicio.
          </p>
        </div>
      </div>

      {feedbackMessage && (
        <div className="bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-semibold px-4 py-3 rounded-2xl animate-in fade-in flex items-center gap-2">
          <Icon name="CheckCircle" size={16} className="text-indigo-600 shrink-0" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Consultas"
          value={totalLeads}
          icon="Users"
          color="brand"
        />
        <KpiCard
          title="Nuevas / Pendientes"
          value={newLeads}
          icon="Clock"
          color="accent"
        />
        <KpiCard
          title="En Seguimiento"
          value={contactedLeads}
          icon="PhoneCall"
          color="brand"
        />
        <KpiCard
          title="Clientes Convertidos"
          value={convertedLeads}
          icon="CheckCircle"
          color="accent"
        />
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-80">
          <Icon name="Search" size={16} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, email o teléfono..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200/80 rounded-xl pl-9 pr-4 py-2.5 text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'Todos' },
            { id: 'new', label: 'Nuevos' },
            { id: 'contacted', label: 'Contactados' },
            { id: 'converted', label: 'Convertidos' },
            { id: 'archived', label: 'Archivados' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === f.id
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table / List */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {filteredLeads.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mx-auto">
              <Icon name="Inbox" size={24} />
            </div>
            <p className="text-xs font-semibold text-slate-500">No se encontraron consultas con los filtros seleccionados.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-sans text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-6">Cliente Potencial</th>
                  <th className="py-3.5 px-4">Contacto</th>
                  <th className="py-3.5 px-4">Tipo de Préstamo</th>
                  <th className="py-3.5 px-4">Estado</th>
                  <th className="py-3.5 px-4">Fecha</th>
                  <th className="py-3.5 px-6 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredLeads.map(lead => (
                  <tr key={lead.id} className="hover:bg-slate-50/60 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
                          {lead.full_name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block">{lead.full_name}</span>
                          {lead.notes && (
                            <span className="text-[10px] text-slate-400 truncate max-w-xs block mt-0.5">
                              Nota: {lead.notes}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 space-y-1">
                      <a
                        href={`mailto:${lead.email}`}
                        className="text-slate-600 hover:text-indigo-600 font-semibold block flex items-center gap-1.5"
                      >
                        <Icon name="Mail" size={12} className="text-slate-400" />
                        {lead.email}
                      </a>
                      <a
                        href={`tel:${lead.phone}`}
                        className="text-slate-600 hover:text-indigo-600 font-mono text-[11px] block flex items-center gap-1.5"
                      >
                        <Icon name="Phone" size={12} className="text-slate-400" />
                        {lead.phone}
                      </a>
                    </td>

                    <td className="py-4 px-4">
                      <span className="font-semibold text-slate-700 block">
                        {getLoanTypeName(lead.loan_type)}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      {getStatusBadge(lead.status)}
                    </td>

                    <td className="py-4 px-4 text-slate-400 text-[11px]">
                      {new Date(lead.created_at).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>

                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        onClick={() => openLeadModal(lead)}
                        className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl font-bold text-[11px] transition-colors"
                      >
                        Ver Detalles
                      </button>
                      <button
                        onClick={() => handleDeleteLead(lead.id)}
                        className="p-1.5 text-slate-300 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Eliminar"
                      >
                        <Icon name="Trash2" size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Detail View */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 animate-in zoom-in-95 duration-200 relative">
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 block">
                  Detalle de la Consulta
                </span>
                <h3 className="font-display font-bold text-xl text-slate-900 mt-1">
                  {selectedLead.full_name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedLead(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <Icon name="X" size={20} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Correo</span>
                  <a href={`mailto:${selectedLead.email}`} className="font-bold text-slate-800 hover:text-indigo-600 mt-0.5 block break-all">
                    {selectedLead.email}
                  </a>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Teléfono</span>
                  <a href={`tel:${selectedLead.phone}`} className="font-bold text-slate-800 hover:text-indigo-600 mt-0.5 block">
                    {selectedLead.phone}
                  </a>
                </div>
                <div className="col-span-2 pt-2 border-t border-slate-200/50">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Tipo de Préstamo Solicitado</span>
                  <span className="font-bold text-indigo-700 text-sm mt-0.5 block">
                    {getLoanTypeName(selectedLead.loan_type)}
                  </span>
                </div>
              </div>

              {/* Status Updater */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Cambiar Estado del Lead
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'new', label: 'Nuevo' },
                    { id: 'contacted', label: 'Contactado' },
                    { id: 'converted', label: 'Convertido' },
                    { id: 'archived', label: 'Archivado' }
                  ].map(st => (
                    <button
                      key={st.id}
                      onClick={() => handleStatusChange(selectedLead.id, st.id as ConsultationLeadStatus)}
                      className={`py-2 px-3 rounded-xl font-bold text-[11px] transition-all ${
                        selectedLead.status === st.id
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Notas de Asesoría / Seguimiento
                </label>
                <textarea
                  rows={3}
                  value={leadNotes}
                  onChange={(e) => setLeadNotes(e.target.value)}
                  placeholder="Escribe notas sobre la conversación con el cliente, monto pactado, etc..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-indigo-600 focus:bg-white"
                ></textarea>
                <button
                  onClick={() => handleSaveNotes(selectedLead.id)}
                  className="mt-2 btn-primary-purple font-bold px-4 py-2 rounded-xl text-xs"
                >
                  Guardar Notas
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <a
                  href={`tel:${selectedLead.phone}`}
                  className="flex-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold py-2.5 rounded-xl text-center flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Icon name="Phone" size={14} /> Llamar
                </a>
                <a
                  href={`mailto:${selectedLead.email}`}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-center flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Icon name="Mail" size={14} /> Enviar Correo
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
