/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { dataService } from '../../lib/supabase';
import { ApprovedClientShowcase } from '../../types';
import Icon from '../../components/Icons';
import ResponsiveTable, { TableColumn } from '../../components/ResponsiveTable';

export function AdminShowcaseCoordinator() {
  const [showcaseList, setShowcaseList] = useState<ApprovedClientShowcase[]>([]);
  const [formMsg, setFormMsg] = useState('');
  const [editingItem, setEditingItem] = useState<Partial<ApprovedClientShowcase> | null>(null);

  const refreshShowcase = () => {
    setShowcaseList(dataService.getAllShowcaseClientsAdmin());
  };

  useEffect(() => {
    refreshShowcase();
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setFormMsg('');

    if (!editingItem?.display_name || !editingItem.testimonial || !editingItem.amount_range) {
      setFormMsg('Por favor, completa todos los campos.');
      return;
    }

    dataService.saveShowcaseClient(editingItem);
    setFormMsg('¡Testimonio de cliente guardado con éxito!');
    setEditingItem(null);
    refreshShowcase();
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este testimonio?')) {
      dataService.deleteShowcaseClient(id);
      refreshShowcase();
    }
  };

  const columns: TableColumn<ApprovedClientShowcase>[] = [
    {
      header: 'Foto',
      render: (item) => (
        <img
          src={item.photo_url}
          className="h-8 w-8 rounded-full object-cover bg-slate-100 border border-slate-100"
          alt={item.display_name}
        />
      )
    },
    {
      header: 'Cliente / Ciudad',
      render: (item) => <span className="font-semibold text-slate-900">{item.display_name}</span>
    },
    {
      header: 'Tipo de crédito',
      render: (item) => (
        <span className="font-semibold text-slate-500">
          {item.loan_type} • <strong className="text-brand-600 font-bold">{item.amount_range}</strong>
        </span>
      )
    },
    {
      header: 'Acción',
      className: 'text-right',
      render: (item) => (
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => setEditingItem(item)}
            className="p-1 text-slate-400 hover:text-brand-600 transition-colors"
          >
            <Icon name="Edit" size={15} />
          </button>
          <button
            onClick={() => handleDelete(item.id)}
            className="p-1 text-rose-400 hover:text-rose-600 transition-colors"
          >
            <Icon name="Trash" size={15} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 sm:space-y-8 pb-10 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 leading-tight">Historias de Éxito / Testimonios</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">Gestiona los testimonios y fotos de los clientes aprobados que se muestran en la página principal.</p>
        </div>
        <button
          onClick={() => setEditingItem({ display_name: '', loan_type: 'Préstamo Personal', amount_range: '5.000 € - 10.000 €', testimonial: '', photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80', is_public: true })}
          className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 shadow-sm transition-colors"
        >
          <Icon name="Plus" size={15} /> Nuevo testimonio
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Table of items Wrapper */}
        <div className="lg:col-span-7">
          <ResponsiveTable
            columns={columns}
            data={showcaseList}
            keyExtractor={(item) => item.id}
            emptyMessage="No hay testimonios de clientes registrados."
          />
        </div>

        {/* Form panel */}
        {editingItem && (
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6 animate-in fade-in duration-200">
            <div className="flex justify-between items-center border-b border-slate-50 pb-3">
              <h3 className="font-display font-bold text-base text-slate-900">
                {editingItem.id ? 'Editar testimonio' : 'Crear testimonio'}
              </h3>
              <button 
                onClick={() => setEditingItem(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <Icon name="X" size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs font-semibold text-slate-600">
              <div>
                <label className="block mb-1">Nombre mostrado (ej. Carlos M. de Madrid)</label>
                <input
                  type="text"
                  required
                  value={editingItem.display_name || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, display_name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block mb-1">Categoría de crédito</label>
                <input
                  type="text"
                  required
                  value={editingItem.loan_type || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, loan_type: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block mb-1">Rango de monto (ej. 5 000 € - 10 000 €)</label>
                <input
                  type="text"
                  required
                  value={editingItem.amount_range || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, amount_range: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block mb-1">Experiencia del cliente (texto del testimonio)</label>
                <textarea
                  required
                  value={editingItem.testimonial || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, testimonial: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs focus:outline-none h-24 font-medium"
                />
              </div>

              {formMsg && (
                <p className="text-xs text-brand-600 bg-brand-50 p-2 text-center rounded-lg font-bold animate-pulse">
                  {formMsg}
                </p>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
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
