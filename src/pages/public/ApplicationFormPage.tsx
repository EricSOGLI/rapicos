/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { dataService, authService, mediaService, SessionUser } from '../../lib/supabase';
import { calculateMonthlyPayment } from '../../lib/payment';
import { LoanType } from '../../types';
import Icon from '../../components/Icons';
import Logo from '../../components/Logo';

export function ApplicationFormPage() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState<SessionUser | null>(null);
  const [loanType, setLoanType] = useState<LoanType | null>(null);
  
  // Steps: 1. Perfil / Auth, 2. Condiciones, 3. Datos Financieros, 4. Documentación, 5. Confirmación
  const [step, setStep] = useState(1);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Auth Form State (Step 1)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Loan Parameters (Step 2)
  const [reqAmount, setReqAmount] = useState(5000);
  const [reqMonths, setReqMonths] = useState(24);
  const [purpose, setPurpose] = useState('Libre inversión / Préstamo personal');

  // Financial & Personal Details (Step 3)
  const [monthlyIncome, setMonthlyIncome] = useState<number | ''>(1500);
  const [employmentStatus, setEmploymentStatus] = useState('Empleado por cuenta ajena (Indefinido)');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  
  // Document Uploads (Step 4) - ONLY ID & SELFIE
  const [idDoc, setIdDoc] = useState<{ name: string; size: number; url: string; uploadedAt: string } | null>(null);
  const [selfieDoc, setSelfieDoc] = useState<{ name: string; size: number; url: string; uploadedAt: string } | null>(null);
  const [uploadProgress, setUploadProgress] = useState<{ id: boolean; selfie: boolean }>({
    id: false,
    selfie: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedRefCode, setGeneratedRefCode] = useState('');

  useEffect(() => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);
    if (user) {
      setFullName(user.full_name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setAddress(user.address || '');
      if (step === 1) {
        setStep(2);
      }
    }
    
    const types = dataService.getLoanTypes();
    const found = types.find(t => t.slug === slug);
    if (found) {
      setLoanType(found);
      
      // Pre-fill parameters from url query params if present
      const amt = Number(searchParams.get('monto') || searchParams.get('iznos'));
      const mth = Number(searchParams.get('meses') || searchParams.get('mjeseci'));
      if (amt && amt >= found.min_amount && amt <= found.max_amount) {
        setReqAmount(amt);
      } else {
        setReqAmount(Math.round((found.min_amount + found.max_amount) / 2));
      }
      
      if (mth && mth >= found.min_duration_months && mth <= found.max_duration_months) {
        setReqMonths(mth);
      } else {
        setReqMonths(Math.min(found.max_duration_months, Math.max(found.min_duration_months, 24)));
      }
    } else {
      navigate('/prestamos');
    }
  }, [slug, searchParams, navigate]);

  const { monthly, totalCost } = calculateMonthlyPayment(
    reqAmount,
    reqMonths,
    loanType?.interest_rate || 5.0
  );

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMsg('Por favor introduce un correo electrónico válido.');
      return;
    }

    setIsAuthenticating(true);

    if (authMode === 'register') {
      if (password.length < 6) {
        setErrorMsg('La contraseña debe tener al menos 6 caracteres.');
        setIsAuthenticating(false);
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Las contraseñas no coinciden.');
        setIsAuthenticating(false);
        return;
      }
      if (!fullName.trim()) {
        setErrorMsg('Por favor escribe tu nombre completo.');
        setIsAuthenticating(false);
        return;
      }
      const { data, error } = await authService.signUp(email, password, fullName, 'client', phone);
      if (error) {
        setErrorMsg(error);
      } else if (data) {
        setCurrentUser(data);
        setStep(2);
      }
    } else {
      if (!password) {
        setErrorMsg('Por favor introduce tu contraseña.');
        setIsAuthenticating(false);
        return;
      }
      const { data, error } = await authService.signIn(email, password);
      if (error) {
        setErrorMsg(error);
      } else if (data) {
        setCurrentUser(data);
        setStep(2);
      }
    }
    setIsAuthenticating(false);
  };

  const handleStep3Next = () => {
    setErrorMsg('');
    if (!monthlyIncome || Number(monthlyIncome) <= 0) {
      setErrorMsg('Por favor ingresa un ingreso mensual estimado válido.');
      return;
    }
    if (!phone.trim() || phone.trim().length < 6) {
      setErrorMsg('Por favor ingresa un número de teléfono de contacto válido.');
      return;
    }
    if (!address.trim()) {
      setErrorMsg('Por favor escribe tu dirección de residencia.');
      return;
    }
    setStep(4);
  };

  const handleFileUpload = async (type: 'id' | 'selfie', e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploadProgress(prev => ({ ...prev, [type]: true }));
    const file = e.target.files[0];
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${currentUser?.id || 'guest'}_${type}_${Date.now()}.${fileExt}`;
      
      const uploadedUrl = await mediaService.uploadFile('loan-documents', fileName, file);
      
      const newDoc = {
        name: file.name,
        size: file.size,
        url: uploadedUrl,
        uploadedAt: new Date().toISOString()
      };
      
      if (type === 'id') setIdDoc(newDoc);
      else if (type === 'selfie') setSelfieDoc(newDoc);
    } catch (err: any) {
      console.error('File upload error:', err);
      // Fallback local preview
      const localUrl = URL.createObjectURL(file);
      const newDoc = {
        name: file.name,
        size: file.size,
        url: localUrl,
        uploadedAt: new Date().toISOString()
      };
      if (type === 'id') setIdDoc(newDoc);
      else if (type === 'selfie') setSelfieDoc(newDoc);
    } finally {
      setUploadProgress(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleFinalSubmit = async () => {
    if (!currentUser || !loanType) return;
    setIsSubmitting(true);
    
    // Update user profile with latest phone/address
    await authService.updateProfile(currentUser.id, {
      phone,
      address: `${address}${city ? `, ${city}` : ''}${postalCode ? ` (${postalCode})` : ''}`,
      full_name: fullName || currentUser.full_name
    });

    const finalDocs = [];
    if (idDoc) finalDocs.push({ ...idDoc, name: `Documento ID: ${idDoc.name}` });
    if (selfieDoc) finalDocs.push({ ...selfieDoc, name: `Selfie con ID: ${selfieDoc.name}` });

    // Generate readable reference
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const refCode = `REQ-2026-${randomSuffix}`;
    setGeneratedRefCode(refCode);

    // Create loan request
    dataService.createLoanRequest({
      user_id: currentUser.id,
      loan_type_id: loanType.id,
      amount_requested: reqAmount,
      duration_months: reqMonths,
      purpose: `${purpose} [Situación: ${employmentStatus}]`,
      monthly_income: Number(monthlyIncome),
      documents: finalDocs
    });

    setTimeout(() => {
      setIsSubmitting(false);
      setStep(5);
    }, 600);
  };

  if (!loanType) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center font-sans">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent"></div>
        <p className="text-xs text-slate-400 mt-4 font-semibold">Cargando formulario de solicitud...</p>
      </div>
    );
  }

  const stepsHeader = [
    { num: 1, title: 'Identificación', subtitle: 'Tu Cuenta' },
    { num: 2, title: 'Condiciones', subtitle: 'Monto y Plazo' },
    { num: 3, title: 'Finanzas', subtitle: 'Ingresos y Domicilio' },
    { num: 4, title: 'Documentación', subtitle: 'Verificación ID' },
    { num: 5, title: 'Confirmación', subtitle: 'Aprobación' },
  ];

  return (
    <div className="min-h-screen bg-slate-50/60 py-8 sm:py-12 font-sans">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Back Link */}
        <div className="flex items-center justify-between">
          <Link
            to="/simulador"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-indigo-600 bg-white border border-slate-200/70 rounded-xl px-4 py-2 shadow-2xs transition-all"
          >
            <Icon name="ArrowLeft" size={14} />
            Volver al Simulador
          </Link>
          <span className="text-[11px] font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
            Solicitud Segura 100% Digital
          </span>
        </div>

        {/* ========================================================================= */}
        {/* TOP LOAN SUMMARY FLOATING CARD */}
        {/* ========================================================================= */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white rounded-3xl p-6 sm:p-7 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
            <div className="sm:col-span-7 space-y-2">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-white/10 text-[11px] font-bold text-indigo-200 backdrop-blur-xs">
                <Icon name="Sparkles" size={13} className="text-amber-300" />
                <span>{loanType.name}</span>
              </div>
              <h1 className="font-display font-bold text-2xl sm:text-3xl text-white tracking-tight">
                Solicitar {reqAmount.toLocaleString()} €
              </h1>
              <p className="text-xs text-indigo-200">
                Plazo estimado: <strong className="text-white">{reqMonths} meses</strong> • Tasa de interés anual fija: <strong className="text-white">{loanType.interest_rate}%</strong>
              </p>
            </div>

            <div className="sm:col-span-5 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-200 block">Cuota Mensual Estimada</span>
              <span className="font-display font-extrabold text-3xl text-white block">
                {monthly.toLocaleString()} €<span className="text-xs font-normal text-indigo-200">/mes</span>
              </span>
              <span className="text-[10px] text-indigo-300 block font-medium">Total a devolver: {totalCost.toLocaleString()} €</span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MODERN 5-STEP STEPPER BAR */}
        {/* ========================================================================= */}
        {step < 5 && (
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-sm">
            <div className="grid grid-cols-4 gap-2 relative">
              {stepsHeader.slice(0, 4).map((s) => {
                const isCurrent = step === s.num;
                const isCompleted = step > s.num;

                return (
                  <div key={s.num} className="flex flex-col items-center text-center relative z-10">
                    <div
                      className={`h-9 w-9 rounded-full flex items-center justify-center font-display font-bold text-xs transition-all duration-300 ${
                        isCompleted
                          ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/30'
                          : isCurrent
                          ? 'bg-indigo-600 text-white ring-4 ring-indigo-100 shadow-md shadow-indigo-600/30'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {isCompleted ? <Icon name="Check" size={16} /> : s.num}
                    </div>
                    <span className={`text-[11px] font-bold mt-2 truncate w-full ${isCurrent ? 'text-indigo-600' : isCompleted ? 'text-slate-800' : 'text-slate-400'}`}>
                      {s.title}
                    </span>
                    <span className="text-[9px] text-slate-400 hidden sm:block truncate">{s.subtitle}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MAIN STEP CARDS */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-100 shadow-xl space-y-6">

          {/* ----------------------------------------------------------------------- */}
          {/* STEP 1: AUTHENTICATION / IDENTITY */}
          {/* ----------------------------------------------------------------------- */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="text-center space-y-2 pb-2">
                <div className="flex justify-center pb-1">
                  <Logo size="md" withLink={false} />
                </div>
                <h2 className="font-display font-bold text-2xl text-slate-900">
                  {currentUser ? 'Perfil de Solicitante Identificado' : 'Identificación del Solicitante'}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                  {currentUser
                    ? 'Tu solicitud se asociará a tu cuenta verificada de cliente.'
                    : 'Crea tu cuenta en 1 minuto sin necesidad de validar correos para continuar al instante.'}
                </p>
              </div>

              {currentUser ? (
                <div className="bg-indigo-50/70 border border-indigo-100 rounded-3xl p-6 text-center space-y-4">
                  <div className="h-16 w-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-display font-bold text-2xl mx-auto shadow-md shadow-indigo-600/20">
                    {currentUser.full_name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-base text-slate-900">{currentUser.full_name}</h3>
                    <p className="text-xs text-indigo-700 font-semibold">{currentUser.email}</p>
                    <span className="inline-block mt-2 px-3 py-1 bg-white text-indigo-700 font-bold text-[10px] rounded-full border border-indigo-200">
                      Cuenta Cliente Activa
                    </span>
                  </div>
                  <div className="pt-2">
                    <button
                      onClick={() => setStep(2)}
                      className="btn-primary-purple font-bold px-8 py-3.5 rounded-xl text-xs sm:text-sm shadow-md shadow-indigo-500/20 transition-all flex items-center gap-2 mx-auto"
                    >
                      Continuar con este Perfil <Icon name="ArrowRight" size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="max-w-md mx-auto space-y-5">
                  {/* Tab Switcher */}
                  <div className="flex bg-slate-100 p-1 rounded-2xl">
                    <button
                      type="button"
                      onClick={() => { setAuthMode('register'); setErrorMsg(''); }}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        authMode === 'register' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Soy nuevo cliente (Registro)
                    </button>
                    <button
                      type="button"
                      onClick={() => { setAuthMode('login'); setErrorMsg(''); }}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        authMode === 'login' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Ya tengo cuenta (Iniciar sesión)
                    </button>
                  </div>

                  <form onSubmit={handleAuthSubmit} className="space-y-4 text-xs">
                    {authMode === 'register' && (
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Nombre y Apellidos*</label>
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Ej. Juan Carlos Mendoza"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold text-slate-800 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
                        />
                      </div>
                    )}

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Correo Electrónico*</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="cliente@rapicreditofinance.com"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold text-slate-800 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
                      />
                    </div>

                    {authMode === 'register' && (
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Teléfono / Celular de Contacto*</label>
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+34 600 000 000"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold text-slate-800 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
                        />
                      </div>
                    )}

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Contraseña*</label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-10 py-3 font-semibold text-slate-800 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 focus:outline-none"
                        >
                          <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={18} />
                        </button>
                      </div>
                    </div>

                    {authMode === 'register' && (
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Confirmar Contraseña*</label>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold text-slate-800 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
                        />
                      </div>
                    )}

                    {errorMsg && (
                      <p className="text-xs text-rose-700 font-semibold bg-rose-50 border border-rose-200 p-3 rounded-xl text-center">
                        {errorMsg}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={isAuthenticating}
                      className="w-full btn-primary-purple font-bold py-3.5 rounded-xl text-xs sm:text-sm transition-all shadow-md shadow-indigo-500/20"
                    >
                      {isAuthenticating
                        ? 'Verificando...'
                        : authMode === 'register'
                        ? 'Crear Cuenta y Continuar'
                        : 'Iniciar Sesión y Continuar'}
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* ----------------------------------------------------------------------- */}
          {/* STEP 2: LOAN SIMULATION & PARAMETERS */}
          {/* ----------------------------------------------------------------------- */}
          {step === 2 && (
            <div className="space-y-7 animate-in fade-in duration-300">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="font-display font-bold text-xl sm:text-2xl text-slate-900">
                  Condiciones del Préstamo
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Ajusta la cantidad requerida y el plazo en meses según tu capacidad mensual.
                </p>
              </div>

              <div className="space-y-6">
                {/* Amount Slider */}
                <div className="bg-slate-50/70 p-5 rounded-3xl border border-slate-100 space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Monto a Solicitar</span>
                      <span className="text-[11px] text-slate-400">Rango: {loanType.min_amount.toLocaleString()} € - {loanType.max_amount.toLocaleString()} €</span>
                    </div>
                    <span className="font-display font-extrabold text-2xl sm:text-3xl text-indigo-600">
                      {reqAmount.toLocaleString()} €
                    </span>
                  </div>

                  <input
                    type="range"
                    min={loanType.min_amount}
                    max={loanType.max_amount}
                    step={loanType.slug.includes('emergencia') ? 50 : 250}
                    value={reqAmount}
                    onChange={(e) => setReqAmount(Number(e.target.value))}
                    className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />

                  {/* Quick Preset Buttons */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setReqAmount(loanType.min_amount)}
                      className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-[10px] font-bold text-slate-600 hover:border-indigo-600 hover:text-indigo-600 transition-colors"
                    >
                      Mínimo ({loanType.min_amount.toLocaleString()} €)
                    </button>
                    <button
                      type="button"
                      onClick={() => setReqAmount(Math.round((loanType.min_amount + loanType.max_amount) / 2))}
                      className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-[10px] font-bold text-slate-600 hover:border-indigo-600 hover:text-indigo-600 transition-colors"
                    >
                      Medio ({Math.round((loanType.min_amount + loanType.max_amount) / 2).toLocaleString()} €)
                    </button>
                    <button
                      type="button"
                      onClick={() => setReqAmount(loanType.max_amount)}
                      className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-[10px] font-bold text-slate-600 hover:border-indigo-600 hover:text-indigo-600 transition-colors"
                    >
                      Máximo ({loanType.max_amount.toLocaleString()} €)
                    </button>
                  </div>
                </div>

                {/* Duration Slider */}
                <div className="bg-slate-50/70 p-5 rounded-3xl border border-slate-100 space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Plazo de Devolución</span>
                      <span className="text-[11px] text-slate-400">Rango: {loanType.min_duration_months} - {loanType.max_duration_months} meses</span>
                    </div>
                    <span className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900">
                      {reqMonths} <span className="text-sm font-semibold text-slate-500">meses</span>
                    </span>
                  </div>

                  <input
                    type="range"
                    min={loanType.min_duration_months}
                    max={loanType.max_duration_months}
                    step={loanType.slug.includes('hogar') ? 6 : 1}
                    value={reqMonths}
                    onChange={(e) => setReqMonths(Number(e.target.value))}
                    className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />

                  {/* Preset Duration Chips */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {[6, 12, 24, 36, 48, 60, 72].filter(m => m >= loanType.min_duration_months && m <= loanType.max_duration_months).map(m => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setReqMonths(m)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                          reqMonths === m
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'bg-white border border-slate-200 text-slate-600 hover:border-indigo-600'
                        }`}
                      >
                        {m} meses
                      </button>
                    ))}
                  </div>
                </div>

                {/* Purpose of Loan Selector */}
                <div>
                  <label className="font-bold text-xs text-slate-700 block mb-2">Destino / Propósito de los Fondos</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                    {[
                      { label: 'Libre inversión / Préstamo personal', icon: 'Sparkles' },
                      { label: 'Compra de vehículo o motocicleta', icon: 'Car' },
                      { label: 'Remodelación / Reformas del hogar', icon: 'Home' },
                      { label: 'Consolidación o unificación de deudas', icon: 'PieChart' },
                      { label: 'Gastos médicos / Imprevisto urgente', icon: 'Zap' },
                      { label: 'Estudios universitarios / Formación', icon: 'BookOpen' },
                      { label: 'Capital para negocio / Emprendimiento', icon: 'TrendingUp' }
                    ].map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setPurpose(p.label)}
                        className={`p-3 rounded-2xl text-left font-semibold border flex items-center gap-3 transition-all ${
                          purpose === p.label
                            ? 'bg-indigo-50 border-indigo-600 text-indigo-900 shadow-sm'
                            : 'bg-slate-50 border-slate-200/80 text-slate-600 hover:bg-slate-100/70'
                        }`}
                      >
                        <div className={`p-2 rounded-xl shrink-0 ${purpose === p.label ? 'bg-indigo-600 text-white' : 'bg-white text-slate-500'}`}>
                          <Icon name={p.icon} size={15} />
                        </div>
                        <span className="text-xs leading-snug">{p.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-colors"
                >
                  Atrás
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="btn-primary-purple font-bold px-8 py-3 rounded-xl text-xs shadow-md shadow-indigo-500/20 transition-all flex items-center gap-2"
                >
                  Siguiente: Datos Financieros <Icon name="ArrowRight" size={15} />
                </button>
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------------- */}
          {/* STEP 3: FINANCIAL DATA & RESIDENCE */}
          {/* ----------------------------------------------------------------------- */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="font-display font-bold text-xl sm:text-2xl text-slate-900">
                  Situación Financiera y Domicilio
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Esta información nos permite formalizar tu contrato y adaptar tu plan de cuotas.
                </p>
              </div>

              <div className="space-y-4 text-xs">
                {/* Monthly Net Income */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Ingresos Netos Mensuales Estimados (€)*
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min={300}
                      value={monthlyIncome}
                      onChange={(e) => setMonthlyIncome(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="Ej. 1800"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white text-base"
                    />
                    <span className="absolute right-4 top-3.5 text-slate-400 font-bold">€ / mes</span>
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Incluye salario, rentas, pensión o facturación estimada si eres independiente.
                  </span>
                </div>

                {/* Employment Status */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Situación Laboral Actual*</label>
                  <select
                    value={employmentStatus}
                    onChange={(e) => setEmploymentStatus(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold text-slate-800 focus:outline-none focus:border-indigo-600 focus:bg-white"
                  >
                    <option>Empleado por cuenta ajena (Contrato Indefinido)</option>
                    <option>Empleado por cuenta ajena (Contrato Temporal)</option>
                    <option>Autónomo / Profesional Independiente</option>
                    <option>Funcionario Público</option>
                    <option>Pensionista / Jubilado</option>
                    <option>Otro tipo de ingresos</option>
                  </select>
                </div>

                {/* Phone & Contact */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Teléfono Móvil de Contacto*</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+34 600 000 000"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold text-slate-800 focus:outline-none focus:border-indigo-600 focus:bg-white"
                  />
                </div>

                {/* Full Address */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Dirección de Residencia Completa*</label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Calle / Avenida, Número, Piso, Puerta"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold text-slate-800 focus:outline-none focus:border-indigo-600 focus:bg-white"
                  />
                </div>

                {/* City & Postal Code */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Ciudad / Municipio</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Ej. Madrid, Lima, Quito, Bogotá..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold text-slate-800 focus:outline-none focus:border-indigo-600 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Código Postal</label>
                    <input
                      type="text"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="28001"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold text-slate-800 focus:outline-none focus:border-indigo-600 focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              {errorMsg && (
                <p className="text-xs text-rose-700 font-semibold bg-rose-50 border border-rose-200 p-3 rounded-xl text-center">
                  {errorMsg}
                </p>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => { setErrorMsg(''); setStep(2); }}
                  className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-colors"
                >
                  Atrás
                </button>
                <button
                  type="button"
                  onClick={handleStep3Next}
                  className="btn-primary-purple font-bold px-8 py-3 rounded-xl text-xs shadow-md shadow-indigo-500/20 transition-all flex items-center gap-2"
                >
                  Siguiente: Documentación <Icon name="ArrowRight" size={15} />
                </button>
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------------- */}
          {/* STEP 4: DOCUMENT UPLOADS (ONLY ID & SELFIE) */}
          {/* ----------------------------------------------------------------------- */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="font-display font-bold text-xl sm:text-2xl text-slate-900">
                  Verificación de Identidad
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Solo requerimos tu documento de identidad y un selfie para aprobar tu crédito de forma express en 15 minutos sin burocracia.
                </p>
              </div>

              <div className="space-y-5">
                {/* 1. ID Document */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-bold text-slate-700 flex items-center gap-1.5">
                      <span className="h-5 w-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold">1</span>
                      Documento de Identidad (DNI / NIE / Pasaporte / Cédula)
                    </label>
                    {idDoc && <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1"><Icon name="Check" size={12} /> Cargado</span>}
                  </div>

                  {idDoc ? (
                    <div className="flex items-center justify-between p-3.5 bg-indigo-50/50 border border-indigo-100 rounded-2xl text-xs">
                      <div className="flex items-center gap-3 text-slate-800 min-w-0">
                        <div className="h-10 w-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shrink-0">
                          <Icon name="UserCheck" size={20} />
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold truncate block">{idDoc.name}</span>
                          <span className="text-[10px] text-slate-400 block font-semibold">{Math.round(idDoc.size / 1024)} KB</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIdDoc(null)}
                        className="text-rose-500 hover:text-rose-700 p-2 font-bold hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Icon name="Trash" size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-slate-200 hover:border-indigo-500 rounded-2xl p-5 text-center transition-all relative bg-slate-50/50 hover:bg-white cursor-pointer group">
                      <input
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg"
                        onChange={(e) => handleFileUpload('id', e)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={uploadProgress.id}
                      />
                      <div className="space-y-1.5">
                        <div className="h-10 w-10 bg-white group-hover:bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mx-auto shadow-2xs border border-slate-100">
                          <Icon name="UploadCloud" size={20} />
                        </div>
                        <p className="text-xs font-bold text-slate-700">
                          {uploadProgress.id ? 'Subiendo archivo...' : 'Arrastra o haz clic para subir tu documento de identidad'}
                        </p>
                        <p className="text-[10px] text-slate-400">Anverso y reverso visibles, nítidos y sin reflejos</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Selfie with ID */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-bold text-slate-700 flex items-center gap-1.5">
                      <span className="h-5 w-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold">2</span>
                      Foto Selfie Sosteniendo tu Documento
                    </label>
                    {selfieDoc && <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1"><Icon name="Check" size={12} /> Cargado</span>}
                  </div>

                  {selfieDoc ? (
                    <div className="flex items-center justify-between p-3.5 bg-indigo-50/50 border border-indigo-100 rounded-2xl text-xs">
                      <div className="flex items-center gap-3 text-slate-800 min-w-0">
                        <div className="h-10 w-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shrink-0">
                          <Icon name="Camera" size={20} />
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold truncate block">{selfieDoc.name}</span>
                          <span className="text-[10px] text-slate-400 block font-semibold">{Math.round(selfieDoc.size / 1024)} KB</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelfieDoc(null)}
                        className="text-rose-500 hover:text-rose-700 p-2 font-bold hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Icon name="Trash" size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-slate-200 hover:border-indigo-500 rounded-2xl p-5 text-center transition-all relative bg-slate-50/50 hover:bg-white cursor-pointer group">
                      <input
                        type="file"
                        accept=".png,.jpg,.jpeg"
                        onChange={(e) => handleFileUpload('selfie', e)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={uploadProgress.selfie}
                      />
                      <div className="space-y-1.5">
                        <div className="h-10 w-10 bg-white group-hover:bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mx-auto shadow-2xs border border-slate-100">
                          <Icon name="Camera" size={20} />
                        </div>
                        <p className="text-xs font-bold text-slate-700">
                          {uploadProgress.selfie ? 'Subiendo selfie...' : 'Sube una foto clara de tu rostro junto a tu documento'}
                        </p>
                        <p className="text-[10px] text-slate-400">Garantiza la protección y titularidad contra suplantación</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Recap Summary Box */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-3 text-xs">
                  <h3 className="font-display font-bold text-slate-900">Resumen Final de tu Solicitud</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
                    <div>
                      <span className="text-slate-400 block">Tipo:</span>
                      <strong className="text-slate-800">{loanType.name}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Monto Solicitado:</span>
                      <strong className="text-indigo-600 font-bold">{reqAmount.toLocaleString()} €</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Plazo:</span>
                      <strong className="text-slate-800">{reqMonths} meses</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Cuota Mensual:</span>
                      <strong className="text-emerald-600 font-bold">{monthly.toLocaleString()} €</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-colors"
                >
                  Atrás
                </button>
                <button
                  type="button"
                  onClick={handleFinalSubmit}
                  disabled={isSubmitting || !idDoc || !selfieDoc}
                  className={`btn-primary-purple font-bold px-8 py-3.5 rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 ${
                    (!idDoc || !selfieDoc) ? 'opacity-60 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? (
                    'Enviando expediente digital...'
                  ) : (
                    <>
                      Enviar y Confirmar Solicitud <Icon name="CheckCircle" size={16} />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------------- */}
          {/* STEP 5: SUCCESS / CONFIRMATION */}
          {/* ----------------------------------------------------------------------- */}
          {step === 5 && (
            <div className="text-center space-y-6 py-8 animate-in zoom-in-95 duration-300">
              <div className="h-20 w-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-md shadow-emerald-500/10 animate-bounce">
                <Icon name="CheckCircle" size={40} />
              </div>

              <div className="space-y-2">
                <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-full border border-emerald-200">
                  Solicitud Recibida Correctamente
                </span>
                <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-950">
                  ¡Felicidades, tu Solicitud está en Evaluación!
                </h2>
                <p className="text-slate-500 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
                  Hemos generado tu expediente oficial bajo el código de referencia:
                </p>
                <div className="font-mono font-extrabold text-lg text-indigo-700 bg-indigo-50 py-2.5 px-6 rounded-2xl inline-block border border-indigo-200">
                  {generatedRefCode || 'REQ-2026-98421'}
                </div>
              </div>

              {/* Steps timeline preview */}
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 max-w-md mx-auto text-left space-y-3 text-xs">
                <h4 className="font-bold text-slate-900">Próximos Pasos del Proceso:</h4>
                <div className="space-y-2.5">
                  <div className="flex items-start gap-3">
                    <div className="h-5 w-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      ✓
                    </div>
                    <p className="text-slate-600">
                      <strong className="text-slate-800">1. Revisión de Documentos (15 min):</strong> Nuestro equipo verifica tu documento ID y selfie.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-5 w-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      2
                    </div>
                    <p className="text-slate-600">
                      <strong className="text-slate-800">2. Firma Digital del Contrato:</strong> Recibirás la notificación en tu portal de cliente.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-5 w-5 rounded-full bg-slate-300 text-slate-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      3
                    </div>
                    <p className="text-slate-600">
                      <strong className="text-slate-800">3. Desembolso Inmediato:</strong> Transferencia directa a tu cuenta bancaria registrada.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
                <Link
                  to="/app/prestamos"
                  className="btn-primary-purple font-bold px-7 py-3.5 rounded-xl text-xs shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <Icon name="FileText" size={16} /> Ver Mis Préstamos en Curso
                </Link>
                <Link
                  to="/app/dashboard"
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-6 py-3.5 rounded-xl text-xs transition-colors"
                >
                  Ir al Portal de Cliente
                </Link>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
