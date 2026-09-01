/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { SessionUser } from '../../lib/supabase';
import Icon from '../../components/Icons';
import Logo from '../../components/Logo';

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
          <Logo size="md" to="/" />
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <Link to="/" className="hover:text-indigo-600 transition-colors">Inicio</Link>
            <Link to="/prestamos" className="hover:text-indigo-600 transition-colors">Préstamos</Link>
            <Link to="/simulador" className="hover:text-indigo-600 transition-colors">Simulador</Link>
            <Link to="/blog" className="hover:text-indigo-600 transition-colors">Consejos Financieros</Link>
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
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-xs text-slate-700 hover:text-indigo-600 font-bold px-4 py-2 rounded-full transition-colors"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  to="/solicitud/prestamo-personal"
                  className="btn-primary-purple font-semibold px-6 py-2.5 rounded-full text-xs transition-all flex items-center gap-1.5"
                >
                  Solicitar Préstamo <Icon name="ArrowRight" size={14} />
                </Link>
              </div>
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
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 rounded-full text-sm transition-colors"
                  >
                    Iniciar Sesión
                  </Link>
                  <Link
                    to="/solicitud/prestamo-personal"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center btn-primary-purple font-semibold py-2.5 rounded-full text-sm shadow-md"
                  >
                    Solicitar Préstamo
                  </Link>
                </>
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
      <footer className="bg-[#0b081e] text-slate-400 py-16 border-t border-indigo-950/60 font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-4">
            <Logo size="md" variant="white" to="/" />
            <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
              Plataforma digital líder para préstamos rápidos en línea. Proceso seguro, procesamiento inmediato y aprobación sin burocracia.
            </p>
            <div className="flex gap-3 text-slate-400 pt-2">
              <span className="h-8 w-8 rounded-full bg-slate-900 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-colors cursor-pointer"><Icon name="Facebook" size={14} /></span>
              <span className="h-8 w-8 rounded-full bg-slate-900 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-colors cursor-pointer"><Icon name="Instagram" size={14} /></span>
              <span className="h-8 w-8 rounded-full bg-slate-900 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-colors cursor-pointer"><Icon name="Linkedin" size={14} /></span>
            </div>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Servicios</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/solicitud/microcredito-emergencia" className="hover:text-indigo-400 transition-colors">Microcréditos Rápidos</Link></li>
              <li><Link to="/solicitud/prestamo-personal" className="hover:text-indigo-400 transition-colors">Préstamos Personales</Link></li>
              <li><Link to="/solicitud/prestamo-hogar" className="hover:text-indigo-400 transition-colors">Remodelación de Hogar</Link></li>
              <li><Link to="/solicitud/prestamo-vehiculo" className="hover:text-indigo-400 transition-colors">Crédito Vehicular</Link></li>
              <li><Link to="/simulador" className="hover:text-indigo-400 transition-colors">Simulador Informativo</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Información Legal</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/politica-privacidad" className="hover:text-indigo-400 transition-colors">Política de Privacidad & GDPR</Link></li>
              <li><Link to="/terminos-uso" className="hover:text-indigo-400 transition-colors">Términos y Condiciones</Link></li>
              <li><Link to="/informacion-legal" className="hover:text-indigo-400 transition-colors">Aviso Legal</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Contacto & Soporte</h4>
            <p className="text-xs mb-1 font-bold text-slate-300">RapiCredito Financial Services S.A.</p>
            <p className="text-xs text-slate-400 mb-1">contacto@rapicreditofinance.com</p>
            <p className="text-xs text-slate-400 mb-2">contacto@rapicreditofinance.com</p>
            <p className="text-xs text-slate-500">Lun - Vie: 08:00 - 18:00 h</p>
          </div>
        </div>

        {/* 4 Trust Highlights Ribbon from designe.jpg */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-900 mt-12 pt-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 text-xs font-semibold text-slate-400">
            <div className="flex items-center gap-2">
              <Icon name="CheckCircle" size={16} className="text-indigo-400" />
              <span>Experiencia Comprobada</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon name="Sliders" size={16} className="text-indigo-400" />
              <span>Soluciones a Medida</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon name="TrendingUp" size={16} className="text-indigo-400" />
              <span>Resultados Medibles</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon name="Users" size={16} className="text-indigo-400" />
              <span>Acompañamiento Continuo</span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-900/60 mt-4 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>
            © 2026 RapiCredito Technologies S.A. Todos los derechos reservados.
          </p>
          <p className="text-slate-600">
            Préstamos rápidos y seguros en línea • 100% Digital
          </p>
        </div>
      </footer>
    </div>
  );
}
