/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { dataService, realtimeService, SessionUser } from '../lib/supabase';
import Icon from './Icons';

interface BottomNavProps {
  user: SessionUser;
}

export default function BottomNav({ user }: BottomNavProps) {
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);

  const fetchUnreadCounts = () => {
    // Fetch notifications
    const notifs = dataService.getNotifications(user.id);
    setUnreadNotifs(notifs.filter(n => !n.is_read).length);

    // Fetch messages
    const msgs = dataService.getMessagesBetween(user.id, 'user-admin-1');
    setUnreadMessages(msgs.filter(m => m.is_from_admin && !m.is_read).length);
  };

  useEffect(() => {
    fetchUnreadCounts();

    // Subscribe to realtime updates
    const subNotif = realtimeService.subscribe('notifications', fetchUnreadCounts);
    const subNotifRead = realtimeService.subscribe('notifications_read', fetchUnreadCounts);
    const subChat = realtimeService.subscribe(`chat_activity`, fetchUnreadCounts);

    return () => {
      subNotif();
      subNotifRead();
      subChat();
    };
  }, [user.id]);

  const items = [
    { to: '/app/dashboard', label: 'Inicio', icon: 'LayoutDashboard', badge: 0 },
    { to: '/app/prestamos', label: 'Préstamos', icon: 'FileText', badge: 0 },
    { to: '/app/documentos', label: 'Documentos', icon: 'FolderOpen', badge: 0 },
    { to: '/app/mensajes', label: 'Mensajes', icon: 'MessageCircle', badge: unreadMessages },
    { to: '/app/configuracion', label: 'Ajustes', icon: 'Settings', badge: unreadNotifs },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-100 flex items-center justify-around px-2 pb-safe z-40 shadow-[0_-4px_16px_rgba(0,0,0,0.03)] font-sans">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center flex-1 h-full py-1 text-[10px] font-medium transition-all duration-150 relative ${
              isActive ? 'text-brand-600 font-semibold' : 'text-slate-400 hover:text-slate-600'
            }`
          }
        >
          <div className="relative mb-0.5">
            <Icon name={item.icon} size={20} />
            {item.badge > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white ring-2 ring-white">
                {item.badge > 9 ? '9+' : item.badge}
              </span>
            )}
          </div>
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
