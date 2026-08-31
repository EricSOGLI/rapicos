/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { dataService } from '../../lib/supabase';
import { Profile } from '../../types';
import Icon from '../../components/Icons';

export function AdminNotificationDispatch() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('all');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [isPopup, setIsPopup] = useState(false);
  const [formMsg, setFormMsg] = useState('');

  useEffect(() => {
    setProfiles(dataService.getProfiles().filter(p => p.role === 'client'));
  }, []);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    setFormMsg('');

    if (!title.trim() || !message.trim()) {
      setFormMsg('El título y el mensaje son obligatorios.');
      return;
    }

    if (selectedUserId === 'all') {
      profiles.forEach(p => {
        dataService.createNotification(p.id, title, message, 'admin_broadcast', isPopup);
      });
      setFormMsg('¡La notificación se envió con éxito a TODOS los clientes!');
    } else {
      dataService.createNotification(selectedUserId, title, message, 'admin_direct', isPopup);
      setFormMsg('La notificación fue enviada al cliente seleccionado con éxito.');
    }

    setTitle('');
    setMessage('');
    setIsPopup(false);
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8 font-sans">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
        <div>
          <h1 className="font-display font-bold text-xl text-slate-900">Enviar Nueva Notificación</h1>
          <p className="text-xs text-slate-400">Envía una notificación en tiempo real a un cliente individual o a todos en una campaña masiva.</p>
        </div>

        <form onSubmit={handleSend} className="space-y-4 text-xs font-semibold text-slate-650">
          <div>
            <label className="block mb-1">Destinatario</label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-brand-500 text-slate-800"
            >
              <option value="all">Todos los clientes activos (Difusión general)</option>
              {profiles.map(p => (
                <option key={p.id} value={p.id}>{p.full_name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1">Título de la notificación</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ej. Oferta especial: Préstamo con tasa preferencial del 2.99% anual 🎉"
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5 text-xs focus:outline-none text-slate-800"
            />
          </div>

          <div>
            <label className="block mb-1">Mensaje (texto completo)</label>
            <textarea
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Escribe la descripción y los detalles de la notificación..."
              className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs focus:outline-none h-32 font-medium text-slate-850"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none py-1">
            <input
              type="checkbox"
              checked={isPopup}
              onChange={(e) => setIsPopup(e.target.checked)}
              className="h-4 w-4 rounded border-slate-200 text-brand-600 focus:ring-brand-500 cursor-pointer"
            />
            <span className="text-slate-700">Mostrar como ventana emergente (Pop-up) en la pantalla del cliente</span>
          </label>

          {formMsg && (
            <p className="text-xs text-brand-605 bg-brand-50 p-2.5 rounded-xl text-center font-bold">
              {formMsg}
            </p>
          )}

          <button
            type="submit"
            className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 rounded-xl text-xs transition-colors shadow-sm flex items-center justify-center gap-1"
          >
            <Icon name="Send" size={15} /> Enviar notificación
          </button>
        </form>
      </div>
    </div>
  );
}
