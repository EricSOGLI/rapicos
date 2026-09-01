/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { dataService, SessionUser } from '../lib/supabase';
import Icon from './Icons';
import Logo from './Logo';

interface SidebarProps {
  user: SessionUser;
  onLogout: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ user, onLogout, isOpen = false, onClose }: SidebarProps) {
  const navigate = useNavigate();
  const isAdmin = user.role === 'admin';
  const [newLeadsCount, setNewLeadsCount] = useState(0);

  useEffect(() => {
    if (isAdmin) {
      const leads = dataService.getConsultationLeads();
      setNewLeadsCount(leads.filter(l => l.status === 'new').length);
    }
  }, [isAdmin]);

  const clientLinks = [
    { to: '/app/dashboard', label: 'Inicio', icon: 'LayoutDashboard' },
    { to: '/app/prestamos', label: 'Mis Préstamos', icon: 'FileText' },
    { to: '/app/cuentas', label: 'Cuentas Bancarias', icon: 'CreditCard' },
    { to: '/app/retiro', label: 'Retirar Fondos', icon: 'ArrowDownRight' },
    { to: '/app/mensajes', label: 'Mensajes', icon: 'MessageCircle' },
    { to: '/app/transacciones', label: 'Historial de Transacciones', icon: 'History' },
    { to: '/app/documentos', label: 'Documentos', icon: 'FolderOpen' },
    { to: '/app/configuracion', label: 'Configuración', icon: 'Settings' },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Panel de Control', icon: 'LayoutDashboard' },
    { to: '/admin/consultas', label: 'Consultas Web / Leads', icon: 'Users', badge: newLeadsCount },
    { to: '/admin/solicitudes', label: 'Solicitudes de Crédito', icon: 'FileText' },
    { to: '/admin/usuarios', label: 'Usuarios', icon: 'UserCheck' },
    { to: '/admin/transacciones', label: 'Transacciones & Retiros', icon: 'RefreshCw' },
    { to: '/admin/tipos-prestamos', label: 'Tipos de Préstamo', icon: 'Sliders' },
    { to: '/admin/blog', label: 'Gestión del Blog', icon: 'BookOpen' },
    { to: '/admin/mensajes', label: 'Atención al Cliente', icon: 'MessageSquare' },
    { to: '/admin/notificaciones', label: 'Notificaciones', icon: 'Bell' },
    { to: '/admin/boletin', label: 'Boletín Informativo', icon: 'Mail' },
    { to: '/admin/contratos', label: 'Contratos Digitales', icon: 'Paperclip' },
    { to: '/admin/configuracion', label: 'Parámetros del Sistema', icon: 'Wrench' },
  ];

  const links = isAdmin ? adminLinks : clientLinks;

  const handleLinkClick = () => {
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm md:hidden transition-opacity duration-300"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 border-r border-slate-100 bg-white flex-col h-screen font-sans transform transition-transform duration-300 ease-in-out md:sticky md:top-0 md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand logo */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between gap-3">
          <Logo
            size="md"
            withLink={false}
            subtitle={isAdmin ? 'Panel de Administración' : 'Portal de Cliente'}
          />
          {/* Close button inside sidebar on mobile */}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-600 md:hidden focus:outline-none"
            >
              <Icon name="X" size={18} />
            </button>
          )}
        </div>

        {/* User profile widget */}
        <div className="px-4 py-3.5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
          <img
            src={user.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(user.full_name)}`}
            alt={user.full_name}
            className="h-10 w-10 rounded-2xl object-cover bg-indigo-50 border border-slate-200/60"
            referrerPolicy="no-referrer"
          />
          <div className="flex-1 min-w-0">
            <span className="text-xs font-bold text-slate-900 block truncate leading-tight">
              {user.full_name}
            </span>
            <span className="text-[10px] text-slate-400 block truncate mt-0.5 font-medium">
              {user.email}
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={handleLinkClick}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-500/10 font-bold border-l-2 border-indigo-600'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon name={link.icon} size={17} />
                <span>{link.label}</span>
              </div>
              {'badge' in link && (link.badge as number) > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500 text-white animate-pulse">
                  {link.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 flex flex-col gap-1.5 bg-slate-50/30">
          <button
            onClick={() => {
              navigate('/');
              handleLinkClick();
            }}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-indigo-600 hover:bg-white transition-all duration-200"
          >
            <Icon name="Home" size={15} />
            <span>Sitio Público</span>
          </button>
          <button
            onClick={() => {
              onLogout();
              handleLinkClick();
            }}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-500 hover:text-rose-600 hover:bg-rose-50 transition-all duration-200"
          >
            <Icon name="LogOut" size={15} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
}
