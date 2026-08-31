/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { dataService, realtimeService, SessionUser } from '../../lib/supabase';
import { Notification } from '../../types';
import Icon from '../../components/Icons';

export function ClientNotificationsList({ user }: { user: SessionUser }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const fetchNotifs = () => {
    setNotifications(dataService.getNotifications(user.id));
  };

  useEffect(() => {
    fetchNotifs();
    const sub = realtimeService.subscribe('notifications', fetchNotifs);
    const subRead = realtimeService.subscribe('notifications_read', fetchNotifs);
    return () => {
      sub();
      subRead();
    };
  }, [user.id]);

  const handleMarkRead = (id: string) => {
    dataService.markNotificationRead(id);
    fetchNotifs();
  };

  const handleMarkAllRead = () => {
    dataService.markAllNotificationsRead(user.id);
    fetchNotifs();
  };

  return (
    <div className="max-w-2xl mx-auto py-8 font-sans space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-slate-900">Centro de Notificaciones</h1>
          <p className="text-xs text-slate-400">Consulta actualizaciones importantes sobre tus solicitudes y actividades.</p>
        </div>
        {notifications.some(n => !n.is_read) && (
          <button
            onClick={handleMarkAllRead}
            className="text-xs text-brand-600 hover:text-brand-700 font-semibold"
          >
            Marcar todas como leídas
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-sm text-slate-400 text-xs">
          No tienes notificaciones recibidas.
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map(notif => (
            <div
              key={notif.id}
              className={`bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-start gap-4 transition-all relative ${
                !notif.is_read ? 'bg-brand-50/20 border-brand-100/50' : ''
              }`}
            >
              <div className={`p-2 rounded-xl mt-0.5 ${!notif.is_read ? 'bg-brand-50 text-brand-600' : 'bg-slate-50 text-slate-400'}`}>
                <Icon name={notif.type.startsWith('loan_') ? 'FileText' : 'Bell'} size={18} />
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between gap-4">
                  <h4 className="font-semibold text-slate-800 text-sm">{notif.title}</h4>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(notif.created_at).toLocaleDateString('es-ES')}
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{notif.message}</p>
                
                {!notif.is_read && (
                  <button
                    onClick={() => handleMarkRead(notif.id)}
                    className="text-[10px] text-brand-600 hover:text-brand-700 font-semibold pt-1 block"
                  >
                    Marcar como leída
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
