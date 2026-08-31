/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate, Link } from 'react-router-dom';
import { authService, dataService, realtimeService, initializeApplication, SessionUser } from './lib/supabase';
import Icon from './components/Icons';

// Public pages imports
import {
  PublicLayout,
  LandingPage,
  BlogPage,
  BlogPostDetailPage,
  AllLoansPage,
  LoanDetailPage,
  SimulatorPage,
  ApplicationFormPage,
  PrivacyPolicyPage,
  TermsOfUsePage,
  LegalInfoPage
} from './pages/public';

// Client pages imports
import {
  ClientDashboard,
  ClientLoansHistory,
  ClientLoanDetailPage,
  ClientBankAccounts,
  ClientWithdrawalPage,
  ClientMessengerPage,
  ClientSettings,
  ClientDocumentsExplorer,
  ClientShowcaseGallery,
  ClientNotificationsList,
  ClientTransactions
} from './pages/client';

// Admin pages imports
import {
  AdminDashboard,
  AdminLoanTypes,
  AdminLoanRequests,
  AdminUsersDirectory,
  AdminTransactions,
  AdminMessengerHub,
  AdminNotificationDispatch,
  AdminBlogManager,
  AdminNewsletter,
  AdminContractsCabinet,
  AdminParameters
} from './pages/admin';

import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';

// ============================================================================
// AUTHENTICATION LOGIN & REGISTER PAGES
// ============================================================================
function LoginPage({ setUser, isAdminForm = false }: { setUser: (u: SessionUser | null) => void; isAdminForm?: boolean }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await authService.signIn(email, password);
      if (res.data) {
        // Enforce role separation
        if (isAdminForm && res.data.role !== 'admin') {
          setError('Esta cuenta no tiene permisos de administración. Inicia sesión en el portal de clientes.');
          authService.signOut();
          setLoading(false);
          return;
        }
        if (!isAdminForm && res.data.role === 'admin') {
          setError('Los administradores deben iniciar sesión a través del portal de administración.');
          authService.signOut();
          setLoading(false);
          return;
        }

        setUser(res.data);
        
        // Redirect based on role
        if (res.data.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          const destination = (location.state as any)?.from || '/app/dashboard';
          navigate(destination);
        }
      } else {
        setError(res.error || 'Correo electrónico o contraseña incorrectos.');
      }
    } catch (err) {
      setError('Ocurrió un error al iniciar sesión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans animate-in fade-in duration-200">
      <div className="w-full max-w-md mb-4 flex justify-start">
        <Link 
          to="/" 
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-bold bg-white border border-slate-100 rounded-xl px-4 py-2 shadow-sm transition-all"
        >
          <Icon name="ArrowLeft" size={14} />
          Volver al inicio
        </Link>
      </div>
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-10 border border-slate-100 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 font-display font-bold text-xl text-slate-900">
            <span className="p-1.5 bg-brand-600 rounded-lg text-white">
              <Icon name={isAdminForm ? 'Shield' : 'Briefcase'} size={18} />
            </span>
            RapiCredito
          </Link>
          <h1 className="font-display font-bold text-2xl text-slate-900 pt-3">
            {isAdminForm ? 'Portal de Administración' : 'Bienvenido de nuevo'}
          </h1>
          <p className="text-xs text-slate-400">
            {isAdminForm 
              ? 'Inicia sesión para gestionar solicitudes y configuraciones.' 
              : 'Inicia sesión para acceder a tu portal de usuario.'}
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500 block mb-1">Correo electrónico</label>
            <input
              type="text"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="cliente@rapicredito.com"
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-slate-500 block">Contraseña</label>
              {!isAdminForm && (
                <Link to="/forgot-password" className="text-[11px] text-brand-600 hover:text-brand-700 font-bold transition-colors">
                  ¿Olvidaste tu contraseña?
                </Link>
              )}
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-4 pr-10 py-2.5 text-xs font-semibold focus:outline-none focus:border-brand-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={16} />
              </button>
            </div>
          </div>

          {error && <p className="text-xs text-rose-500 font-semibold bg-rose-50 p-2 text-center rounded-lg">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary-green font-semibold py-3 rounded-xl text-xs transition-colors shadow-sm"
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>
        </form>

        {!isAdminForm && (
          <div className="text-center text-xs text-slate-400 pt-2 space-y-1">
            <p>¿No tienes una cuenta de cliente?</p>
            <Link to="/register" className="text-brand-600 hover:text-brand-700 font-bold block">
              Regístrate ahora gratis
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function RegisterPage({ setUser }: { setUser: (u: SessionUser | null) => void }) {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Email format regex validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Formato de correo electrónico no válido.');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (!fullName.trim()) {
      setError('El nombre completo es obligatorio.');
      return;
    }

    setLoading(true);

    try {
      const res = await authService.signUp(email, password, fullName, 'client', phone);
      if (res.data) {
        setUser(res.data);
        navigate('/app/dashboard');
      } else {
        setError(res.error || 'Ocurrió un error durante el registro.');
      }
    } catch (err) {
      setError('Error durante el registro.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans animate-in fade-in duration-200">
      <div className="w-full max-w-md mb-4 flex justify-start">
        <Link 
          to="/" 
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-bold bg-white border border-slate-100 rounded-xl px-4 py-2 shadow-sm transition-all"
        >
          <Icon name="ArrowLeft" size={14} />
          Volver al inicio
        </Link>
      </div>
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-10 border border-slate-100 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 font-display font-bold text-xl text-slate-900">
            <span className="p-1.5 bg-brand-600 rounded-lg text-white">
              <Icon name="Briefcase" size={18} />
            </span>
            RapiCredito
          </Link>
          <h1 className="font-display font-bold text-2xl text-slate-900 pt-3">Crear una cuenta</h1>
          <p className="text-xs text-slate-400">Regístrate para acceder al portal y solicitar tu préstamo.</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500 block mb-1">Nombre y Apellidos</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Juan Pérez"
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 block mb-1">Número de celular</label>
            <input
              type="text"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+34 600 000 000"
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 block mb-1">Correo electrónico</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="cliente@rapicredito.com"
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 block mb-1">Contraseña</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-4 pr-10 py-2.5 text-xs font-semibold focus:outline-none focus:border-brand-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={16} />
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 block mb-1">Confirmar contraseña</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-4 pr-10 py-2.5 text-xs font-semibold focus:outline-none focus:border-brand-500"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                <Icon name={showConfirmPassword ? 'EyeOff' : 'Eye'} size={16} />
              </button>
            </div>
          </div>

          {error && <p className="text-xs text-rose-500 font-semibold bg-rose-50 p-2 text-center rounded-lg">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary-green font-semibold py-3 rounded-xl text-xs transition-colors shadow-sm"
          >
            {loading ? 'Creando cuenta...' : 'Finalizar registro'}
          </button>
        </form>

        <div className="text-center text-xs text-slate-400 pt-2">
          <p>¿Ya tienes una cuenta?</p>
          <Link to="/login" className="text-brand-600 hover:text-brand-700 font-bold block mt-1">
            Inicia sesión aquí
          </Link>
        </div>
      </div>
    </div>
  );
}

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState(1);
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash;
    if (hash && (hash.includes('access_token=') || hash.includes('type=recovery'))) {
      setStep(2);
      setSuccessMsg('Sesión iniciada mediante enlace de recuperación. Ingresa tu nueva contraseña.');
    }
  }, []);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);
    
    try {
      const res = await authService.resetPasswordForEmail(email);
      if (res.error) {
        setError(res.error);
      } else {
        setStep(2);
        setSuccessMsg('Se ha enviado el enlace de recuperación a tu correo electrónico.');
      }
    } catch (err: any) {
      setError('Ocurrió un error al enviar la solicitud.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    const hash = window.location.hash;
    const isRealReset = hash && (hash.includes('access_token=') || hash.includes('type=recovery'));

    setLoading(true);
    try {
      if (isRealReset) {
        const res = await authService.updatePassword(newPassword);
        if (res.error) {
          setError(res.error);
          setLoading(false);
          return;
        }
      } else {
        if (code !== '123456' && code.length < 4) {
          setError('Código de confirmación no válido (Código demo: 123456).');
          setLoading(false);
          return;
        }
      }
      setStep(3);
    } catch (err: any) {
      setError('Ocurrió un error al cambiar la contraseña.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans animate-in fade-in duration-200">
      <div className="w-full max-w-md mb-4 flex justify-start">
        <Link 
          to="/" 
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-bold bg-white border border-slate-100 rounded-xl px-4 py-2 shadow-sm transition-all"
        >
          <Icon name="ArrowLeft" size={14} />
          Volver al inicio
        </Link>
      </div>
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-10 border border-slate-100 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 font-display font-bold text-xl text-slate-900">
            <span className="p-1.5 bg-brand-600 rounded-lg text-white">
              <Icon name="Briefcase" size={18} />
            </span>
            RapiCredito
          </Link>
          <h1 className="font-display font-bold text-2xl text-slate-900 pt-3">
            {step === 1 && '¿Olvidaste tu contraseña?'}
            {step === 2 && 'Establece tu nueva contraseña'}
            {step === 3 && '¡Contraseña actualizada!'}
          </h1>
          <p className="text-xs text-slate-400">
            {step === 1 && 'Ingresa tu correo para recibir el código de recuperación.'}
            {step === 2 && 'Ingresa el código de 6 dígitos y tu nueva contraseña.'}
            {step === 3 && 'Ya puedes iniciar sesión con tu nueva contraseña.'}
          </p>
        </div>

        {successMsg && <p className="text-xs text-emerald-600 font-semibold bg-emerald-50 p-3 text-center rounded-xl">{successMsg}</p>}

        {step === 1 && (
          <form onSubmit={handleRequestReset} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">Correo electrónico</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="cliente@rapicredito.com"
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-brand-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary-green font-semibold py-3 rounded-xl text-xs transition-colors shadow-sm"
            >
              {loading ? 'Enviando...' : 'Enviar código de recuperación'}
            </button>
            
            <Link to="/login" className="text-xs text-slate-500 hover:text-brand-600 block text-center font-bold">
              Volver al inicio de sesión
            </Link>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleResetSubmit} className="space-y-4">
            {!window.location.hash.includes('access_token=') && !window.location.hash.includes('type=recovery') && (
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Código de verificación (Demo: 123456)</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="123456"
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-brand-500 text-center font-mono tracking-widest"
                />
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">Nueva contraseña</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-4 pr-10 py-2.5 text-xs font-semibold focus:outline-none focus:border-brand-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={16} />
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">Confirmar contraseña</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-4 pr-10 py-2.5 text-xs font-semibold focus:outline-none focus:border-brand-500"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  <Icon name={showConfirmPassword ? 'EyeOff' : 'Eye'} size={16} />
                </button>
              </div>
            </div>

            {error && <p className="text-xs text-rose-500 font-semibold bg-rose-50 p-2 text-center rounded-lg">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary-green font-semibold py-3 rounded-xl text-xs transition-colors shadow-sm"
            >
              {loading ? 'Guardando...' : 'Cambiar contraseña'}
            </button>
          </form>
        )}

        {step === 3 && (
          <div className="space-y-4 pt-4 text-center">
            <div className="h-12 w-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <Icon name="Check" size={24} />
            </div>
            <button
              onClick={() => navigate('/login')}
              className="w-full btn-primary-green font-semibold py-3 rounded-xl text-xs transition-colors shadow-sm"
            >
              Iniciar sesión ahora
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// WORKSPACE STRUCTURAL LAYOUTS (SIDEBAR + CONTENT + MOBILE NAV)
// ============================================================================
function SecureAppLayout({ user, handleLogout }: { user: SessionUser; handleLogout: () => void }) {
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [popupAlert, setPopupAlert] = useState<any | null>(null);

  const fetchBadges = () => {
    const notifs = dataService.getNotifications(user.id);
    setUnreadNotifications(notifs.filter(n => !n.is_read).length);
    const unreadPopup = notifs.find(n => !n.is_read && n.is_popup);
    if (unreadPopup) {
      setPopupAlert(unreadPopup);
    }
  };

  useEffect(() => {
    fetchBadges();
    const subNotif = realtimeService.subscribe('notifications', fetchBadges);
    return () => {
      subNotif();
    };
  }, [user.id]);

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* Direct alert overlay */}
      {popupAlert && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-100 shadow-2xl text-center space-y-6 animate-in zoom-in-95 duration-200">
            <div className="h-16 w-16 bg-brand-50 text-brand-650 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
              <Icon name="BellRing" size={32} className="text-brand-600 animate-bounce" />
            </div>
            <div className="space-y-2">
              <h3 className="font-display font-bold text-lg text-slate-950">{popupAlert.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed whitespace-pre-wrap">{popupAlert.message}</p>
            </div>
            <button
              onClick={() => {
                dataService.markNotificationRead(popupAlert.id);
                setPopupAlert(null);
                fetchBadges();
              }}
              className="w-full btn-primary-green font-bold py-3 rounded-2xl text-xs transition-all shadow-sm"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Sidebar for Desktop & Drawer for Mobile */}
      <Sidebar user={user} onLogout={handleLogout} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        {/* Secure Workspace Header */}
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 md:hidden">
              <span className="p-1 bg-brand-600 rounded text-white block">
                <Icon name="Briefcase" size={14} />
              </span>
              <span className="font-display font-bold text-sm text-slate-900">RapiCredito</span>
            </div>
          </div>

          <div className="hidden md:block">
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Área de cliente</span>
            <span className="text-xs text-slate-500 font-semibold">{user.full_name} • {user.email}</span>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/app/notificaciones" className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
              <Icon name="Bell" size={18} />
              {unreadNotifications > 0 && (
                <span className="absolute top-1.5 right-1.5 h-4 w-4 bg-rose-500 text-[9px] text-white font-bold rounded-full flex items-center justify-center">
                  {unreadNotifications}
                </span>
              )}
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1 border border-slate-100 hover:bg-slate-50 text-slate-500 font-bold px-2 sm:px-3 py-1.5 rounded-xl text-xs transition-colors"
            >
              <Icon name="LogOut" size={14} />
              <span className="hidden xs:inline">Cerrar sesión</span>
            </button>
          </div>
        </header>

        {/* Secure page contents */}
        <main className="p-4 sm:p-6 max-w-7xl w-full mx-auto flex-1">
          <Routes>
            <Route path="dashboard" element={<ClientDashboard user={user} />} />
            <Route path="prestamos" element={<ClientLoansHistory user={user} />} />
            <Route path="prestamos/:id" element={<ClientLoanDetailPage user={user} />} />
            <Route path="cuentas" element={<ClientBankAccounts user={user} />} />
            <Route path="retiro" element={<ClientWithdrawalPage user={user} />} />
            <Route path="notificaciones" element={<ClientNotificationsList user={user} />} />
            <Route path="mensajes" element={<ClientMessengerPage user={user} />} />
            <Route path="configuracion" element={<ClientSettings user={user} />} />
            <Route path="documentos" element={<ClientDocumentsExplorer user={user} />} />
            <Route path="transacciones" element={<ClientTransactions user={user} />} />
            <Route path="solicitud/:slug" element={<ApplicationFormPage />} />
            <Route path="*" element={<Navigate to="dashboard" replace />} />
          </Routes>
        </main>
      </div>

      {/* Bottom Nav for Mobile */}
      <BottomNav user={user} />
    </div>
  );
}

function SecureAdminLayout({ user, handleLogout }: { user: SessionUser; handleLogout: () => void }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* Sidebar for Desktop & Drawer for Mobile */}
      <Sidebar user={user} onLogout={handleLogout} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Secure Admin Workspace Header */}
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-500 md:hidden focus:outline-none"
            >
              <Icon name="Menu" size={20} />
            </button>
            <div className="flex items-center gap-2 md:hidden">
              <span className="p-1 bg-slate-900 rounded text-white block">
                <Icon name="Briefcase" size={14} />
              </span>
              <span className="font-display font-bold text-sm text-slate-900">RapiCredito Admin</span>
            </div>
          </div>

          <div className="hidden md:block">
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Panel de Administración</span>
            <span className="text-xs text-slate-500 font-semibold">{user.full_name} • Sistema de control</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 border border-slate-100 hover:bg-slate-50 text-slate-500 font-bold px-2 sm:px-3 py-1.5 rounded-xl text-xs transition-colors"
            >
              <Icon name="LogOut" size={14} />
              <span className="hidden xs:inline">Cerrar sesión</span>
            </button>
          </div>
        </header>

        {/* Secure page contents */}
        <main className="p-4 sm:p-6 max-w-7xl w-full mx-auto flex-1 pb-10">
          <Routes>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="tipos-prestamos" element={<AdminLoanTypes />} />
            <Route path="solicitudes" element={<AdminLoanRequests />} />
            <Route path="usuarios" element={<AdminUsersDirectory />} />
            <Route path="transacciones" element={<AdminTransactions />} />
            <Route path="mensajes" element={<AdminMessengerHub />} />
            <Route path="notificaciones" element={<AdminNotificationDispatch />} />
            <Route path="blog" element={<AdminBlogManager />} />
            <Route path="boletin" element={<AdminNewsletter />} />
            <Route path="contratos" element={<AdminContractsCabinet />} />
            <Route path="configuracion" element={<AdminParameters />} />
            <Route path="*" element={<Navigate to="dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN ROOT ROUTER COMPONENT
// ============================================================================
export default function App() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Read current session and load Supabase database cache
    const init = async () => {
      const current = await initializeApplication();
      setUser(current);
      setChecking(false);
    };
    init();
  }, []);

  const handleLogout = async () => {
    await authService.signOut();
    setUser(null);
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center font-sans">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-brand-600 border-t-transparent"></div>
        <p className="text-xs text-slate-400 mt-4 font-semibold">Cargando plataforma RapiCredito...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Landing Site */}
        <Route path="/" element={<PublicLayout user={user} onLogout={handleLogout} />}>
          <Route index element={<LandingPage />} />
          <Route path="blog" element={<BlogPage />} />
          <Route path="blog/:slug" element={<BlogPostDetailPage />} />
          <Route path="prestamos" element={<AllLoansPage />} />
          <Route path="prestamos/:slug" element={<LoanDetailPage />} />
          <Route path="simulador" element={<SimulatorPage />} />
          <Route path="solicitud/:slug" element={<ApplicationFormPage />} />
          <Route path="politica-privacidad" element={<PrivacyPolicyPage />} />
          <Route path="terminos-uso" element={<TermsOfUsePage />} />
          <Route path="informacion-legal" element={<LegalInfoPage />} />
        </Route>

        {/* Authentication Pages */}
        <Route
          path="/login"
          element={
            (() => {
              const current = user || authService.getCurrentUser();
              if (current && !user) {
                setTimeout(() => setUser(current), 0);
              }
              if (current) {
                return current.role === 'admin' ? (
                  <Navigate to="/admin/dashboard" replace />
                ) : (
                  <Navigate to="/app/dashboard" replace />
                );
              }
              return <LoginPage setUser={setUser} isAdminForm={false} />;
            })()
          }
        />
        <Route
          path="/prijava"
          element={
            (() => {
              const current = user || authService.getCurrentUser();
              if (current && !user) {
                setTimeout(() => setUser(current), 0);
              }
              if (current) {
                return current.role === 'admin' ? (
                  <Navigate to="/admin/dashboard" replace />
                ) : (
                  <Navigate to="/app/dashboard" replace />
                );
              }
              return <LoginPage setUser={setUser} isAdminForm={false} />;
            })()
          }
        />
        <Route
          path="/admin-login"
          element={
            (() => {
              const current = user || authService.getCurrentUser();
              if (current && !user) {
                setTimeout(() => setUser(current), 0);
              }
              if (current) {
                return current.role === 'admin' ? (
                  <Navigate to="/admin/dashboard" replace />
                ) : (
                  <Navigate to="/app/dashboard" replace />
                );
              }
              return <LoginPage setUser={setUser} isAdminForm={true} />;
            })()
          }
        />
        <Route
          path="/register"
          element={
            (() => {
              const current = user || authService.getCurrentUser();
              if (current && !user) {
                setTimeout(() => setUser(current), 0);
              }
              if (current) {
                return <Navigate to="/app/dashboard" replace />;
              }
              return <RegisterPage setUser={setUser} />;
            })()
          }
        />
        <Route
          path="/forgot-password"
          element={
            (() => {
              const current = user || authService.getCurrentUser();
              if (current && !user) {
                setTimeout(() => setUser(current), 0);
              }
              if (current) {
                return <Navigate to="/app/dashboard" replace />;
              }
              return <ForgotPasswordPage />;
            })()
          }
        />

        {/* Secure Client Area Route Guards */}
        <Route
          path="/app/*"
          element={
            (() => {
              const current = user || authService.getCurrentUser();
              if (current && !user) {
                setTimeout(() => setUser(current), 0);
              }
              if (current) {
                return current.role === 'admin' ? (
                  <Navigate to="/admin/dashboard" replace />
                ) : (
                  <SecureAppLayout user={current} handleLogout={handleLogout} />
                );
              }
              return <Navigate to="/login" replace />;
            })()
          }
        />

        {/* Secure Admin Back-Office Route Guards */}
        <Route
          path="/admin/*"
          element={
            (() => {
              const current = user || authService.getCurrentUser();
              if (current && !user) {
                setTimeout(() => setUser(current), 0);
              }
              if (current) {
                return current.role === 'admin' ? (
                  <SecureAdminLayout user={current} handleLogout={handleLogout} />
                ) : (
                  <Navigate to="/app/dashboard" replace />
                );
              }
              return <Navigate to="/admin-login" replace />;
            })()
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
