/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService, SessionUser } from '../../lib/supabase';
import Icon from '../../components/Icons';

export function ClientSettings({ user }: { user: SessionUser }) {
  const [fullName, setFullName] = useState(user.full_name || 'Carlos Mendoza');
  const [phone, setPhone] = useState(user.phone || '+34 612 345 678');
  const [address, setAddress] = useState(user.address || 'Calle Mayor 14, 28013 Madrid');
  const [message, setMessage] = useState('');

  // Password Change States
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    await authService.updateProfile(user.id, {
      full_name: fullName,
      phone,
      address
    });

    setMessage('¡Perfil actualizado con éxito!');
    setTimeout(() => setMessage(''), 3000);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg('');
    setPasswordError('');

    if (newPassword.length < 6) {
      setPasswordError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Las contraseñas no coinciden.');
      return;
    }

    setIsUpdatingPassword(true);
    const res = await authService.updatePassword(newPassword);
    setIsUpdatingPassword(false);

    if (res.error) {
      setPasswordError(res.error);
    } else {
      setPasswordMsg('¡Tu contraseña ha sido actualizada con éxito!');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordMsg(''), 4000);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 font-sans space-y-8 animate-fade-in">
      <div>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-900">Configuración de la Cuenta</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">Administra tus datos personales, seguridad y accesos del portal.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        
        {/* Left pane: Profile & Security forms */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Profile Edit Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
            <div>
              <h2 className="font-display font-bold text-lg text-slate-900 flex items-center gap-2">
                <Icon name="User" size={18} className="text-indigo-600" />
                Datos Personales
              </h2>
              <p className="text-xs text-slate-400 mt-1">Revisa y actualiza tu información de contacto.</p>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4 pt-2">
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Correo electrónico (no modificable)</label>
                <input
                  type="email"
                  value={user.email || 'cliente@rapicreditofinance.com'}
                  disabled
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-xs text-slate-400 font-semibold cursor-not-allowed"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Nombre y Apellidos</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-indigo-600 transition-all text-slate-800"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Número de teléfono móvil</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-indigo-600 transition-all text-slate-800"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Dirección de residencia</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-indigo-600 transition-all text-slate-800"
                />
              </div>

              {message && (
                <p className="text-xs text-indigo-700 font-semibold bg-indigo-50 p-2.5 text-center rounded-xl border border-indigo-100 animate-pulse">
                  {message}
                </p>
              )}

              <button
                type="submit"
                className="w-full btn-primary-purple font-semibold py-2.5 rounded-xl text-xs transition-colors shadow-sm cursor-pointer"
              >
                Guardar cambios del perfil
              </button>
            </form>
          </div>

          {/* Security & Password Change Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
            <div>
              <h2 className="font-display font-bold text-lg text-slate-900 flex items-center gap-2">
                <Icon name="Shield" size={18} className="text-indigo-600" />
                Seguridad & Cambio de Contraseña
              </h2>
              <p className="text-xs text-slate-400 mt-1">Establece una nueva contraseña segura para tu cuenta.</p>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-4 pt-2">
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Nueva contraseña</label>
                <input
                  type="password"
                  required
                  placeholder="Mínimo 6 caracteres"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-indigo-600 transition-all text-slate-800"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Confirmar nueva contraseña</label>
                <input
                  type="password"
                  required
                  placeholder="Repite la nueva contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-indigo-600 transition-all text-slate-800"
                />
              </div>

              {passwordMsg && (
                <p className="text-xs text-emerald-800 font-semibold bg-emerald-50 p-2.5 text-center rounded-xl border border-emerald-200 animate-fade-in">
                  {passwordMsg}
                </p>
              )}

              {passwordError && (
                <p className="text-xs text-rose-700 font-semibold bg-rose-50 p-2.5 text-center rounded-xl border border-rose-200 animate-fade-in">
                  {passwordError}
                </p>
              )}

              <button
                type="submit"
                disabled={isUpdatingPassword}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 rounded-xl text-xs transition-colors shadow-sm cursor-pointer"
              >
                {isUpdatingPassword ? 'Actualizando contraseña...' : 'Actualizar contraseña'}
              </button>
            </form>
          </div>

        </div>

        {/* Right pane: Quick navigation settings */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
          <div>
            <h2 className="font-display font-bold text-lg text-slate-900 flex items-center gap-2">
              <Icon name="Sliders" size={18} className="text-indigo-600" />
              Accesos Rápidos
            </h2>
            <p className="text-xs text-slate-400 mt-1">Acceso directo a las funciones y servicios principales.</p>
          </div>

          <div className="space-y-4 pt-2">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Gestión Financiera</span>
            <div className="space-y-3">
              <Link
                to="/app/retiro"
                className="flex items-center gap-4 p-4 rounded-2xl border border-slate-50 bg-slate-50/50 hover:bg-indigo-50/30 hover:border-indigo-100 transition-all duration-200 group text-left"
              >
                <div className="h-11 w-11 rounded-xl flex items-center justify-center border bg-emerald-50 text-emerald-600 border-emerald-100 group-hover:scale-110 transition-transform shadow-sm">
                  <Icon name="ArrowDownRight" size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs sm:text-sm font-bold text-slate-900 block group-hover:text-indigo-600 transition-colors">
                    Retiro de Fondos
                  </span>
                  <span className="text-[10px] sm:text-xs text-slate-400 block truncate font-medium">
                    Transfiere el saldo disponible a tu cuenta bancaria
                  </span>
                </div>
                <Icon name="ChevronRight" size={16} className="text-slate-300 group-hover:text-indigo-600 transition-colors ml-auto shrink-0" />
              </Link>

              <Link
                to="/app/cuentas"
                className="flex items-center gap-4 p-4 rounded-2xl border border-slate-50 bg-slate-50/50 hover:bg-indigo-50/30 hover:border-indigo-100 transition-all duration-200 group text-left"
              >
                <div className="h-11 w-11 rounded-xl flex items-center justify-center border bg-indigo-50 text-indigo-600 border-indigo-100 group-hover:scale-110 transition-transform shadow-sm">
                  <Icon name="CreditCard" size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs sm:text-sm font-bold text-slate-900 block group-hover:text-indigo-600 transition-colors">
                    Cuentas Bancarias
                  </span>
                  <span className="text-[10px] sm:text-xs text-slate-400 block truncate font-medium">
                    Administra tus cuentas IBAN vinculadas
                  </span>
                </div>
                <Icon name="ChevronRight" size={16} className="text-slate-300 group-hover:text-indigo-600 transition-colors ml-auto shrink-0" />
              </Link>
            </div>

            <div className="border-t border-slate-50 pt-4 space-y-3">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Información y Notificaciones</span>
              <div className="space-y-3">
                <Link
                  to="/app/notificaciones"
                  className="flex items-center gap-4 p-4 rounded-2xl border border-slate-50 bg-slate-50/50 hover:bg-indigo-50/30 hover:border-indigo-100 transition-all duration-200 group text-left"
                >
                  <div className="h-11 w-11 rounded-xl flex items-center justify-center border bg-blue-50 text-blue-600 border-blue-100 group-hover:scale-110 transition-transform shadow-sm">
                    <Icon name="Bell" size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs sm:text-sm font-bold text-slate-900 block group-hover:text-indigo-600 transition-colors">
                      Centro de Notificaciones
                    </span>
                    <span className="text-[10px] sm:text-xs text-slate-400 block truncate font-medium">
                      Consulta avisos importantes y mensajes
                    </span>
                  </div>
                  <Icon name="ChevronRight" size={16} className="text-slate-300 group-hover:text-indigo-600 transition-colors ml-auto shrink-0" />
                </Link>

                <Link
                  to="/app/transacciones"
                  className="flex items-center gap-4 p-4 rounded-2xl border border-slate-50 bg-slate-50/50 hover:bg-indigo-50/30 hover:border-indigo-100 transition-all duration-200 group text-left"
                >
                  <div className="h-11 w-11 rounded-xl flex items-center justify-center border bg-purple-50 text-purple-600 border-purple-100 group-hover:scale-110 transition-transform shadow-sm">
                    <Icon name="History" size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs sm:text-sm font-bold text-slate-900 block group-hover:text-indigo-600 transition-colors">
                      Historial de Transacciones
                    </span>
                    <span className="text-[10px] sm:text-xs text-slate-400 block truncate font-medium">
                      Revisa todos tus desembolsos y retiros
                    </span>
                  </div>
                  <Icon name="ChevronRight" size={16} className="text-slate-300 group-hover:text-indigo-600 transition-colors ml-auto shrink-0" />
                </Link>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
