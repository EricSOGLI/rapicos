/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { dataService, realtimeService, SessionUser } from '../lib/supabase';
import { Notification } from '../types';
import Icon from './Icons';

interface NotificationBellProps {
  user: SessionUser;
}

export default function NotificationBell({ user }: NotificationBellProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const fetchNotifications = () => {
    const list = dataService.getNotifications(user.id);
    setNotifications(list);
  };

  useEffect(() => {
    fetchNotifications();

    // Subscribe to realtime notification events
    const unsubscribe = realtimeService.subscribe('notifications', (newNotif: Notification) => {
      if (newNotif.user_id === user.id) {
        setNotifications(prev => [newNotif, ...prev]);
      }
    });

    const unsubscribeRead = realtimeService.subscribe('notifications_read', () => {
      fetchNotifications();
    });

    return () => {
      unsubscribe();
      unsubscribeRead();
    };
  }, [user.id]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleMarkAllRead = () => {
    dataService.markAllNotificationsRead(user.id);
    fetchNotifications();
  };

  const handleNotificationClick = (notifId: string) => {
    dataService.markNotificationRead(notifId);
    setIsOpen(false);
    navigate('/app/notificaciones');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition-all duration-200 focus:outline-none"
        aria-label="Notificaciones"
      >
        <Icon name="Bell" size={22} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-slate-100 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-3 duration-200">
          <div className="flex items-center justify-between px-4 py-2 border-b border-slate-50">
            <h4 className="font-display font-semibold text-slate-800 text-sm">Notificaciones</h4>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-brand-600 hover:text-brand-700 font-medium"
              >
                Marcar todas como leídas
              </button>
            )}
          </div>

          <div className="max-h-72 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No tienes notificaciones nuevas.
              </div>
            ) : (
              notifications.slice(0, 5).map(notif => (
                <button
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif.id)}
                  className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors duration-150 flex items-start gap-3 border-b border-slate-50/50 ${
                    !notif.is_read ? 'bg-blue-50/30' : ''
                  }`}
                >
                  <div className={`mt-0.5 p-1.5 rounded-lg ${
                    !notif.is_read ? 'bg-brand-50 text-brand-600' : 'bg-slate-50 text-slate-400'
                  }`}>
                    <Icon name={notif.type.startsWith('loan_') ? 'FileText' : notif.type === 'chat_message' ? 'MessageCircle' : 'Bell'} size={15} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-xs font-semibold ${!notif.is_read ? 'text-slate-800' : 'text-slate-500'}`}>
                        {notif.title}
                      </span>
                      <span className="text-[10px] text-slate-400 font-sans">
                        {new Date(notif.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{notif.message}</p>
                  </div>
                </button>
              ))
            )}
          </div>

          <div className="border-t border-slate-50 pt-2 px-4 flex justify-center">
            <Link
              to="/app/notificaciones"
              onClick={() => setIsOpen(false)}
              className="text-xs text-brand-600 hover:text-brand-700 font-semibold py-1 block w-full text-center"
            >
              Ver todas las notificaciones
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
