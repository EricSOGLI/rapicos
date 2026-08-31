/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { SessionUser } from '../../lib/supabase';
import Icon from '../../components/Icons';

interface PublicLayoutProps {
  user: SessionUser | null;
  onLogout: () => void;
}

export function PublicLayout({ user, onLogout }: PublicLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  return (
    <div className="min-h-screen bg-[#fafaf9] flex flex-col font-sans">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-brand-600 to-accent-500 flex items-center justify-center text-white font-display font-bold text-xl shadow-sm shadow-brand-500/20">
              R
            </div>
            <span className="font-display font-bold text-slate-900 text-xl tracking-tight">RapiCredito</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <Link to="/" className="hover:text-brand-600 transition-colors">Inicio</Link>
            <Link to="/prestamos" className="hover:text-brand-600 transition-colors">Préstamos</Link>
            <Link to="/simulador" className="hover:text-brand-600 transition-colors">Simulador</Link>
            <Link to="/blog" className="hover:text-brand-600 transition-colors">Consejos Financieros</Link>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  to={user.role === 'admin' ? '/admin/dashboard' : '/app/dashboard'}
                  className="bg-slate-950 text-white hover:bg-slate-800 font-semibold px-6 py-2.5 rounded-full text-xs shadow-sm transition-all"
                >
                  {user.role === 'admin' ? 'Consola Admin' : 'Mi Portal'}
                </Link>
                <button
                  onClick={onLogout}
                  className="text-xs text-slate-500 hover:text-slate-800 font-semibold"
                >
                  Cerrar sesión
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="btn-primary-green font-semibold px-6 py-2.5 rounded-full text-xs transition-all flex items-center gap-1.5"
              >
                Iniciar sesión <Icon name="ChevronRight" size={14} />
              </Link>
            )}
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-500 hover:bg-slate-50 rounded-lg"
          >
            <Icon name={mobileMenuOpen ? 'X' : 'Menu'} size={22} />
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-100 px-4 py-4 space-y-3 font-sans animate-in fade-in duration-200">
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-xl hover:bg-slate-50 text-slate-700 font-semibold">Inicio</Link>
            <Link to="/prestamos" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-xl hover:bg-slate-50 text-slate-700 font-semibold">Préstamos</Link>
            <Link to="/simulador" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-xl hover:bg-slate-50 text-slate-700 font-semibold">Simulador</Link>
            <Link to="/blog" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-xl hover:bg-slate-50 text-slate-700 font-semibold">Consejos Financieros</Link>
            <div className="pt-2 border-t border-slate-50 flex flex-col gap-2">
              {user ? (
                <Link
                  to={user.role === 'admin' ? '/admin/dashboard' : '/app/dashboard'}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center bg-slate-950 text-white font-semibold py-2.5 rounded-full text-sm"
                >
                  {user.role === 'admin' ? 'Consola Admin' : 'Mi Portal'}
                </Link>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center btn-primary-green font-semibold py-2.5 rounded-full text-sm"
                >
                  Iniciar sesión
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-16 border-t border-slate-900 font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-brand-600 to-accent-500 flex items-center justify-center text-white font-display font-bold text-lg">
                R
              </div>
              <span className="font-display font-bold text-white text-xl tracking-tight">RapiCredito</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
              Plataforma digital líder para préstamos rápidos en línea. Proceso seguro, procesamiento inmediato y aprobación sin burocracia.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Servicios</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/solicitud/microcredito-emergencia" className="hover:text-white transition-colors">Microcréditos Rápidos</Link></li>
              <li><Link to="/solicitud/prestamo-personal" className="hover:text-white transition-colors">Préstamos Personales</Link></li>
              <li><Link to="/solicitud/prestamo-hogar" className="hover:text-white transition-colors">Remodelación de Hogar</Link></li>
              <li><Link to="/simulador" className="hover:text-white transition-colors">Simulador Informativo</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Información Legal</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/politica-privacidad" className="hover:text-white transition-colors">Política de Privacidad & GDPR</Link></li>
              <li><Link to="/terminos-uso" className="hover:text-white transition-colors">Términos y Condiciones</Link></li>
              <li><Link to="/informacion-legal" className="hover:text-white transition-colors">Aviso Legal</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Contacto & Soporte</h4>
            <p className="text-xs mb-1 font-bold text-slate-300">RapiCredito Financial Services S.A.</p>
            <p className="text-xs text-slate-400 mb-1">soporte@rapicredito.com</p>
            <p className="text-xs text-slate-400 mb-2">contacto@rapicredito.com</p>
            <p className="text-xs text-slate-500">Lun - Vie: 08:00 - 18:00 h</p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-900 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-slate-500">
            © 2026 RapiCredito (rapicredito.com). Todos los derechos reservados. Los cálculos informativos son ilustrativos y no constituyen una oferta vinculante.
          </p>
          <div className="flex gap-4 text-xs text-slate-500">
            <span className="hover:text-white cursor-pointer transition-colors"><Icon name="Facebook" size={16} /></span>
            <span className="hover:text-white cursor-pointer transition-colors"><Icon name="Instagram" size={16} /></span>
            <span className="hover:text-white cursor-pointer transition-colors"><Icon name="Linkedin" size={16} /></span>
          </div>
        </div>
      </footer>
    </div>
  );
}
