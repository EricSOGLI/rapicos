/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { authService, SessionUser } from '../lib/supabase';
import Icon from './Icons';

interface SidebarProps {
  user: SessionUser;
  onLogout: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ user, onLogout, isOpen = false, onClose }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = user.role === 'admin';

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
    { to: '/admin/solicitudes', label: 'Solicitudes de Crédito', icon: 'FileText' },
    { to: '/admin/usuarios', label: 'Usuarios', icon: 'Users' },
    { to: '/admin/transacciones', label: 'Transacciones', icon: 'RefreshCw' },
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
        <div className="p-6 border-b border-slate-50 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-brand-600 to-accent-500 flex items-center justify-center text-white font-display font-bold text-lg shadow-sm shadow-brand-500/20">
              R
            </div>
            <div>
              <span className="font-display font-bold text-slate-800 text-base block tracking-tight">RapiCredito</span>
              <span className="text-[10px] text-accent-600 font-semibold uppercase tracking-wider">
                {isAdmin ? 'Panel de Administración' : 'Portal de Cliente'}
              </span>
            </div>
          </div>
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
        <div className="px-4 py-4 border-b border-slate-50/60 bg-slate-50/30 flex items-center gap-3">
          <img
            src={user.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(user.full_name)}`}
            alt={user.full_name}
            className="h-10 w-10 rounded-xl object-cover bg-brand-50"
            referrerPolicy="no-referrer"
          />
          <div className="flex-1 min-w-0">
            <span className="text-xs font-semibold text-slate-800 block truncate leading-tight">
              {user.full_name}
            </span>
            <span className="text-[10px] text-slate-400 block truncate mt-0.5">
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
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-brand-50 text-brand-600 shadow-sm shadow-brand-500/5 font-semibold'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`
              }
            >
              <Icon name={link.icon} size={18} />
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-50 flex flex-col gap-2">
          <button
            onClick={() => {
              navigate('/');
              handleLinkClick();
            }}
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-all duration-200"
          >
            <Icon name="Home" size={16} />
            <span>Sitio Público</span>
          </button>
          <button
            onClick={() => {
              onLogout();
              handleLinkClick();
            }}
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-rose-500 hover:text-rose-600 hover:bg-rose-50 transition-all duration-200"
          >
            <Icon name="LogOut" size={16} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
}
