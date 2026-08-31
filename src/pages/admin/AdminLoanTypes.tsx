/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { dataService } from '../../lib/supabase';
import { LoanType } from '../../types';
import Icon from '../../components/Icons';
import ResponsiveTable, { TableColumn } from '../../components/ResponsiveTable';

export function AdminLoanTypes() {
  const [loanTypes, setLoanTypes] = useState<LoanType[]>([]);
  const [editingType, setEditingType] = useState<Partial<LoanType> | null>(null);
  const [formMsg, setFormMsg] = useState('');

  const refreshTypes = () => {
    setLoanTypes(dataService.getAllLoanTypesAdmin());
  };

  useEffect(() => {
    refreshTypes();
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setFormMsg('');

    if (!editingType?.name || !editingType.min_amount || !editingType.max_amount) {
      setFormMsg('Por favor, complete todos los campos obligatorios.');
      return;
    }

    dataService.saveLoanType(editingType);
    setFormMsg('¡Tipo de crédito guardado con éxito!');
    setEditingType(null);
    refreshTypes();
  };

  const columns: TableColumn<LoanType>[] = [
    {
      header: 'Nombre',
      render: (type) => <span className="font-semibold text-slate-900">{type.name}</span>
    },
    {
      header: 'Tasa de interés',
      render: (type) => <span className="font-bold text-brand-600">{type.interest_rate}%</span>
    },
    {
      header: 'Monto (Mín - Máx)',
      render: (type) => <span>{type.min_amount.toLocaleString()} - {type.max_amount.toLocaleString()} €</span>
    },
    {
      header: 'Estado',
      render: (type) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${type.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-50 text-slate-400'}`}>
          {type.is_active ? 'Activo' : 'Desactivado'}
        </span>
      )
    },
    {
      header: 'Action',
      className: 'text-right',
      render: (type) => (
        <button
          onClick={() => setEditingType(type)}
          className="p-2 text-slate-400 hover:text-brand-600 transition-colors"
        >
          <Icon name="Edit" size={15} />
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6 sm:space-y-8 pb-10 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 leading-tight">Gestión de tipos de crédito</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">Cree, modifique o desactive productos de crédito en la plataforma.</p>
        </div>
        <button
          onClick={() => setEditingType({ name: '', slug: '', description: '', icon: 'Zap', min_amount: 1000, max_amount: 10000, min_duration_months: 6, max_duration_months: 36, interest_rate: 4.5, is_active: true })}
          className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 shadow-sm transition-colors"
        >
          <Icon name="Plus" size={15} /> Nuevo tipo de crédito
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Table of Types Wrapper */}
        <div className="lg:col-span-7">
          <ResponsiveTable
            columns={columns}
            data={loanTypes}
            keyExtractor={(type) => type.id || ''}
            emptyMessage="No hay tipos de crédito configurados."
          />
        </div>

        {/* CRUD Form Drawer */}
        {editingType && (
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6 animate-in fade-in duration-200">
            <div className="flex justify-between items-center border-b border-slate-50 pb-3">
              <h3 className="font-display font-bold text-base text-slate-900">
                {editingType.id ? 'Editar tipo de crédito' : 'Crear nuevo tipo de crédito'}
              </h3>
              <button 
                onClick={() => setEditingType(null)}
                className="text-slate-400 hover:text-slate-650 p-1 rounded-lg"
              >
                <Icon name="X" size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="text-slate-500 block mb-1">Nombre del producto</label>
                <input
                  type="text"
                  required
                  value={editingType.name || ''}
                  onChange={(e) => setEditingType({ ...editingType, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-brand-500"
                  placeholder="ej. Mini Crédito Express"
                />
              </div>

              <div>
                <label className="text-slate-500 block mb-1">Slug URL (automático)</label>
                <input
                  type="text"
                  required
                  value={editingType.slug || ''}
                  onChange={(e) => setEditingType({ ...editingType, slug: e.target.value.toLowerCase().replace(/ /g, '-') })}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-brand-500"
                  placeholder="ex. express-mini"
                />
              </div>

              <div>
                <label className="text-slate-500 block mb-1">Descripción breve</label>
                <textarea
                  value={editingType.description || ''}
                  onChange={(e) => setEditingType({ ...editingType, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5 text-xs font-medium focus:outline-none focus:border-brand-500 h-20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-500 block mb-1">Monto Mínimo (€)</label>
                  <input
                    type="number"
                    value={editingType.min_amount || ''}
                    onChange={(e) => setEditingType({ ...editingType, min_amount: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="text-slate-500 block mb-1">Monto Máximo (€)</label>
                  <input
                    type="number"
                    value={editingType.max_amount || ''}
                    onChange={(e) => setEditingType({ ...editingType, max_amount: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-500 block mb-1">Duración Mín (meses)</label>
                  <input
                    type="number"
                    value={editingType.min_duration_months || ''}
                    onChange={(e) => setEditingType({ ...editingType, min_duration_months: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="text-slate-500 block mb-1">Duración Máx (meses)</label>
                  <input
                    type="number"
                    value={editingType.max_duration_months || ''}
                    onChange={(e) => setEditingType({ ...editingType, max_duration_months: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-500 block mb-1">Interés anual (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingType.interest_rate || ''}
                    onChange={(e) => setEditingType({ ...editingType, interest_rate: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="text-slate-500 block mb-1">Estado del producto</label>
                  <select
                    value={editingType.is_active ? 'true' : 'false'}
                    onChange={(e) => setEditingType({ ...editingType, is_active: e.target.value === 'true' })}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none"
                  >
                    <option value="true">Activo</option>
                    <option value="false">Desactivado</option>
                  </select>
                </div>
              </div>

              {formMsg && <p className="text-xs text-brand-600 font-bold text-center animate-pulse">{formMsg}</p>}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingType(null)}
                  className="flex-1 border border-slate-100 hover:bg-slate-50 text-slate-500 py-3 rounded-xl font-bold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-brand-600 hover:bg-brand-700 text-white py-3 rounded-xl font-bold transition-colors"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
