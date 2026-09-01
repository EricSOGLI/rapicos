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
  onOpenSidebar?: () => void;
}

export default function BottomNav({ user, onOpenSidebar }: BottomNavProps) {
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [newLeadsCount, setNewLeadsCount] = useState(0);
  const [pendingLoansCount, setPendingLoansCount] = useState(0);

  const fetchCounts = () => {
    if (user.role === 'admin') {
      const leads = dataService.getConsultationLeads();
      setNewLeadsCount(leads.filter(l => l.status === 'new').length);

      const loans = dataService.getLoanRequests();
      setPendingLoansCount(loans.filter(l => l.status === 'pending' || l.status === 'under_review').length);

      const msgs = dataService.getAllAdminMessages();
      setUnreadMessages(msgs.filter(m => !m.is_from_admin && !m.is_read).length);

      const notifs = dataService.getNotifications(user.id);
      setUnreadNotifs(notifs.filter(n => !n.is_read).length);
    } else {
      const notifs = dataService.getNotifications(user.id);
      setUnreadNotifs(notifs.filter(n => !n.is_read).length);

      const msgs = dataService.getMessagesBetween(user.id, 'user-admin-1');
      setUnreadMessages(msgs.filter(m => m.is_from_admin && !m.is_read).length);
    }
  };

  useEffect(() => {
    fetchCounts();

    const subNotif = realtimeService.subscribe('notifications', fetchCounts);
    const subNotifRead = realtimeService.subscribe('notifications_read', fetchCounts);
    const subChat = realtimeService.subscribe('chat_activity', fetchCounts);
    const subLeads = realtimeService.subscribe('consultation_leads', fetchCounts);

    return () => {
      subNotif();
      subNotifRead();
      subChat();
      subLeads();
    };
  }, [user.id, user.role]);

  // Dynamic Navigation Items based on Role
  const items = user.role === 'admin' ? [
    { to: '/admin/dashboard', label: 'Panel', icon: 'LayoutDashboard', badge: 0 },
    { to: '/admin/consultas', label: 'Leads Web', icon: 'Users', badge: newLeadsCount },
    { to: '/admin/solicitudes', label: 'Solicitudes', icon: 'FileText', badge: pendingLoansCount },
    { to: '/admin/mensajes', label: 'Mensajes', icon: 'MessageCircle', badge: unreadMessages },
    { to: '#menu', label: 'Menú', icon: 'Menu', badge: unreadNotifs, isMenu: true }
  ] : [
    { to: '/app/dashboard', label: 'Inicio', icon: 'LayoutDashboard', badge: 0 },
    { to: '/app/prestamos', label: 'Préstamos', icon: 'FileText', badge: 0 },
    { to: '/app/documentos', label: 'Documentos', icon: 'FolderOpen', badge: 0 },
    { to: '/app/mensajes', label: 'Mensajes', icon: 'MessageCircle', badge: unreadMessages },
    { to: '/app/configuracion', label: 'Ajustes', icon: 'Settings', badge: unreadNotifs }
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-t border-slate-200/80 flex items-center justify-around px-2 pb-safe z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] font-sans">
      {items.map((item) => {
        if (item.isMenu) {
          return (
            <button
              key={item.to}
              onClick={onOpenSidebar}
              className="flex flex-col items-center justify-center flex-1 h-full py-1 text-[10px] font-medium text-slate-500 hover:text-indigo-600 transition-all cursor-pointer relative"
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
            </button>
          );
        }

        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 h-full py-1 text-[10px] font-medium transition-all duration-150 relative ${
                isActive ? 'text-indigo-600 font-bold scale-105' : 'text-slate-400 hover:text-slate-600'
              }`
            }
          >
            <div className="relative mb-0.5">
              <Icon name={item.icon} size={20} />
              {item.badge > 0 && (
                <span className="absolute -top-1 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white ring-2 ring-white animate-pulse">
                  {item.badge > 9 ? '9+' : item.badge}
                </span>
              )}
            </div>
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
