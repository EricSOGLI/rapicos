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

export function ApplicationFormPage() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState<SessionUser | null>(null);
  const [loanType, setLoanType] = useState<LoanType | null>(null);
  
  // Steps: 1. Auth/Welcome, 2. Personal, 3. Loan parameters, 4. Financials/Documents, 5. Success
  const [step, setStep] = useState(1);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Auth Form
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  // Application Parameters
  const [reqAmount, setReqAmount] = useState(5000);
  const [reqMonths, setReqMonths] = useState(24);
  const [purpose, setPurpose] = useState('Libre inversión / Préstamo personal');
  const [monthlyIncome, setMonthlyIncome] = useState(1200);
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  
  // Document simulated uploads for 3 specific files
  const [paySlipDoc, setPaySlipDoc] = useState<{ name: string; size: number; url: string; uploadedAt: string } | null>(null);
  const [idDoc, setIdDoc] = useState<{ name: string; size: number; url: string; uploadedAt: string } | null>(null);
  const [selfieDoc, setSelfieDoc] = useState<{ name: string; size: number; url: string; uploadedAt: string } | null>(null);
  const [uploadProgress, setUploadProgress] = useState<{ payslip: boolean; id: boolean; selfie: boolean }>({
    payslip: false,
    id: false,
    selfie: false
  });

  useEffect(() => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);
    
    // Redirect to secure layout if logged in but on public route
    if (user && !window.location.pathname.startsWith('/app/')) {
      navigate(`/app/solicitud/${slug}${window.location.search}`, { replace: true });
      return;
    }

    if (user && step === 1) {
      setStep(2);
    }
    
    const types = dataService.getLoanTypes();
    const found = types.find(t => t.slug === slug);
    if (found) {
      setLoanType(found);
      
      // Pre-fill parameters from url query params if present
      const amt = Number(searchParams.get('monto') || searchParams.get('iznos'));
      const mth = Number(searchParams.get('meses') || searchParams.get('mjeseci'));
      if (amt && amt >= found.min_amount && amt <= found.max_amount) setReqAmount(amt);
      else setReqAmount(Math.round((found.min_amount + found.max_amount) / 2));
      
      if (mth && mth >= found.min_duration_months && mth <= found.max_duration_months) setReqMonths(mth);
      else setReqMonths(found.min_duration_months + 12);
    } else {
      navigate('/prestamos');
    }
  }, [slug, searchParams, step, navigate]);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Email format regex validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMsg('Formato de correo electrónico no válido.');
      return;
    }

    if (isRegistering) {
      if (password.length < 6) {
        setErrorMsg('La contraseña debe tener al menos 6 caracteres.');
        return;
      }
      if (!fullName.trim()) {
        setErrorMsg('El nombre completo es obligatorio.');
        return;
      }
      const { data, error } = await authService.signUp(email, password, fullName);
      if (error) {
        setErrorMsg(error);
      } else if (data) {
        setCurrentUser(data);
        navigate(`/app/solicitud/${slug}${window.location.search}`, { replace: true });
      }
    } else {
      if (!password) {
        setErrorMsg('La contraseña es obligatoria.');
        return;
      }
      const { data, error } = await authService.signIn(email, password);
      if (error) {
        setErrorMsg(error);
      } else if (data) {
        setCurrentUser(data);
        navigate(`/app/solicitud/${slug}${window.location.search}`, { replace: true });
      }
    }
  };

  const handleStep3Next = () => {
    setErrorMsg('');
    if (!monthlyIncome || monthlyIncome <= 0) {
      setErrorMsg('Ingresa un ingreso mensual válido.');
      return;
    }
    if (!phone.trim()) {
      setErrorMsg('El número de teléfono es obligatorio.');
      return;
    }
    if (!address.trim()) {
      setErrorMsg('La dirección de residencia es obligatoria.');
      return;
    }
    setStep(4);
  };

  const handleFileUpload = async (type: 'payslip' | 'id' | 'selfie', e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploadProgress(prev => ({ ...prev, [type]: true }));
    const file = e.target.files[0];
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${currentUser?.id || 'guest'}_${type}_${Date.now()}.${fileExt}`;
      
      // Upload to 'loan-documents' bucket
      const uploadedUrl = await mediaService.uploadFile('loan-documents', fileName, file);
      
      const newDoc = {
        name: file.name,
        size: file.size,
        url: uploadedUrl,
        uploadedAt: new Date().toISOString()
      };
      
      if (type === 'payslip') setPaySlipDoc(newDoc);
      else if (type === 'id') setIdDoc(newDoc);
      else if (type === 'selfie') setSelfieDoc(newDoc);
    } catch (err: any) {
      console.error('File upload error:', err);
      setErrorMsg(`Error al cargar el documento: ${err.message || 'La conexión con la base de datos falló.'}`);
    } finally {
      setUploadProgress(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleFinalSubmit = async () => {
    if (!currentUser || !loanType) return;
    
    // Update user profile with latest phone/address
    await authService.updateProfile(currentUser.id, {
      phone,
      address,
      full_name: currentUser.full_name
    });

    const finalDocs = [];
    if (paySlipDoc) finalDocs.push({ ...paySlipDoc, name: `Comprobante: ${paySlipDoc.name}` });
    if (idDoc) finalDocs.push({ ...idDoc, name: `ID: ${idDoc.name}` });
    if (selfieDoc) finalDocs.push({ ...selfieDoc, name: `Selfie con ID: ${selfieDoc.name}` });

    // Create loan request
    dataService.createLoanRequest({
      user_id: currentUser.id,
      loan_type_id: loanType.id,
      amount_requested: reqAmount,
      duration_months: reqMonths,
      purpose,
      monthly_income: monthlyIncome,
      documents: finalDocs
    });

    setStep(5);
  };

  if (!loanType) return <div className="text-center py-20 font-sans text-slate-500">Cargando...</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-sans">
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-100 shadow-xl space-y-8">
        
        {/* PROGRESS INDICATOR */}
        {step < 5 && (
          <div className="flex items-center justify-between border-b border-slate-50 pb-6 text-xs text-slate-400 font-semibold uppercase tracking-wider">
            <span className={step >= 1 ? 'text-brand-600 font-bold' : ''}>1. Perfil</span>
            <Icon name="ChevronRight" size={12} />
            <span className={step >= 2 ? 'text-brand-600 font-bold' : ''}>2. Condiciones</span>
            <Icon name="ChevronRight" size={12} />
            <span className={step >= 3 ? 'text-brand-600 font-bold' : ''}>3. Ingresos</span>
            <Icon name="ChevronRight" size={12} />
            <span className={step >= 4 ? 'text-brand-600 font-bold' : ''}>4. Documentación</span>
          </div>
        )}

        {/* STEP 1: AUTH OR INVITE */}
        {step === 1 && (
          <div className="space-y-6">
            {!currentUser ? (
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <h2 className="font-display font-bold text-2xl text-slate-950">Solicitud de Préstamo</h2>
                  <p className="text-slate-500 text-sm">
                    Debes crear una cuenta o iniciar sesión para enviar tu solicitud.
                  </p>
                </div>

                <form onSubmit={handleAuthSubmit} className="space-y-4 max-w-sm mx-auto">
                  {isRegistering && (
                    <div>
                      <label className="text-xs font-bold text-slate-500 block mb-1">Nombre y Apellidos</label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500"
                        placeholder="Ej. Juan Pérez"
                      />
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1">Correo Electrónico / Usuario</label>
                    <input
                      type="text"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500"
                      placeholder="Ej. cliente@rapicredito.com"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1">Contraseña</label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500"
                      placeholder="••••••••"
                    />
                  </div>

                  {errorMsg && <p className="text-xs text-rose-500 font-semibold">{errorMsg}</p>}

                  <button
                    type="submit"
                    className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-2.5 rounded-xl text-sm transition-all shadow-sm"
                  >
                    {isRegistering ? 'Registrarse y continuar' : 'Iniciar sesión y continuar'}
                  </button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setIsRegistering(!isRegistering)}
                      className="text-xs text-slate-500 hover:text-brand-600 font-semibold"
                    >
                      {isRegistering ? '¿Ya tienes cuenta? Inicia sesión' : '¿Eres nuevo usuario? Regístrate'}
                    </button>
                  </div>
                </form>

                <div className="border-t border-slate-100 pt-4 text-center">
                  <p className="text-xs text-slate-400">
                    Cuentas de prueba: usa <strong className="text-slate-600">cliente@rapicredito.com</strong> o <strong className="text-slate-600">admin</strong> para acceso rápido.
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-4 py-6">
                <div className="h-12 w-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <Icon name="Check" size={24} />
                </div>
                <h2 className="font-display font-semibold text-xl text-slate-900">
                  Sesión iniciada como: {currentUser.full_name}
                </h2>
                <p className="text-slate-500 text-xs">
                  El sistema vinculará tu solicitud a tu perfil de cliente.
                </p>
                <button
                  onClick={() => setStep(2)}
                  className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-all"
                >
                  Continuar al siguiente paso
                </button>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: LOAN SLIDERS / PARAMS */}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="font-display font-bold text-xl text-slate-900">Ajusta los parámetros del préstamo</h2>
            <p className="text-xs text-slate-500">Asegúrate de que los valores estén dentro de los límites del modelo.</p>

            <div className="space-y-6">
              {/* Amount slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-500 uppercase">Monto</span>
                  <span className="text-base font-extrabold text-brand-600">{reqAmount.toLocaleString()} €</span>
                </div>
                <input
                  type="range"
                  min={loanType.min_amount}
                  max={loanType.max_amount}
                  step={loanType.slug.includes('emergencia') ? 100 : 500}
                  value={reqAmount}
                  onChange={(e) => setReqAmount(Number(e.target.value))}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-brand-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                  <span>Mín: {loanType.min_amount.toLocaleString()} €</span>
                  <span>Máx: {loanType.max_amount.toLocaleString()} €</span>
                </div>
              </div>

              {/* Duration Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-500 uppercase">Duración</span>
                  <span className="text-base font-extrabold text-slate-800">{reqMonths} meses</span>
                </div>
                <input
                  type="range"
                  min={loanType.min_duration_months}
                  max={loanType.max_duration_months}
                  step={loanType.slug.includes('hogar') ? 12 : 3}
                  value={reqMonths}
                  onChange={(e) => setReqMonths(Number(e.target.value))}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-brand-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                  <span>Mín: {loanType.min_duration_months} m.</span>
                  <span>Máx: {loanType.max_duration_months} m.</span>
                </div>
              </div>

              {/* Purpose selector */}
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Propósito del préstamo</label>
                <select
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 font-medium text-slate-700"
                >
                  <option>Libre inversión / Préstamo personal</option>
                  <option>Compra de vehículo / motocicleta</option>
                  <option>Remodelación / Mejoras en el hogar</option>
                  <option>Consolidación de deudas</option>
                  <option>Gastos de emergencia</option>
                  <option>Educación / Formación</option>
                </select>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button
                onClick={() => setStep(1)}
                className="px-5 py-2.5 rounded-xl border border-slate-100 text-slate-500 text-xs font-bold hover:bg-slate-50"
              >
                Atrás
              </button>
              <button
                onClick={() => setStep(3)}
                className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-sm"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: FINANCIALS / USER STATS */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="font-display font-bold text-xl text-slate-900">Datos financieros</h2>
            <p className="text-xs text-slate-500">Ingresa información real comprobable mediante recibos.</p>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Ingreso neto mensual promedio (€)</label>
                <input
                  type="number"
                  value={monthlyIncome}
                  onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                  required
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 font-semibold"
                  placeholder="Ej. 1200"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Número de teléfono</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500"
                  placeholder="Ej. +34 600 000 000"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Dirección completa</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500"
                  placeholder="Ej. Calle Falsa 123, Madrid"
                />
              </div>
            </div>

            {errorMsg && <p className="text-xs text-rose-500 font-semibold">{errorMsg}</p>}

            <div className="flex justify-between pt-4">
              <button
                onClick={() => { setErrorMsg(''); setStep(2); }}
                className="px-5 py-2.5 rounded-xl border border-slate-100 text-slate-500 text-xs font-bold hover:bg-slate-50"
              >
                Atrás
              </button>
              <button
                onClick={handleStep3Next}
                className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-sm"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: FILE UPLOAD SIMULATOR */}
        {step === 4 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="space-y-2">
              <h2 className="font-display font-bold text-xl text-slate-900">Carga los documentos obligatorios</h2>
              <p className="text-xs text-slate-500">Por favor, adjunta los tres archivos solicitados para la evaluación.</p>
            </div>

            <div className="space-y-5">
              {/* Pay Slip Section */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 block uppercase">1. Recibo de nómina</label>
                {paySlipDoc ? (
                  <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs">
                    <div className="flex items-center gap-3 text-slate-700 min-w-0">
                      {paySlipDoc.url && !paySlipDoc.name.toLowerCase().endsWith('.pdf') ? (
                        <img src={paySlipDoc.url} className="h-10 w-10 object-cover rounded-lg border border-slate-200 bg-white" alt="Nómina" />
                      ) : (
                        <Icon name="File" size={20} className="text-brand-600 shrink-0" />
                      )}
                      <div className="min-w-0">
                        <span className="font-semibold truncate block">{paySlipDoc.name}</span>
                        <span className="text-[10px] text-slate-400 font-sans block">({Math.round(paySlipDoc.size / 1024)} KB)</span>
                      </div>
                    </div>
                    <button onClick={() => setPaySlipDoc(null)} className="text-rose-500 hover:text-rose-600 p-1 shrink-0">
                      <Icon name="Trash" size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center hover:border-brand-500 transition-all relative">
                    <input
                      type="file"
                      onChange={(e) => handleFileUpload('payslip', e)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={uploadProgress.payslip}
                    />
                    <div className="space-y-1">
                      <div className="h-8 w-8 bg-slate-50 rounded-lg flex items-center justify-center mx-auto text-slate-400">
                        <Icon name="UploadCloud" size={18} />
                      </div>
                      <div className="text-xs font-semibold text-slate-650">
                        {uploadProgress.payslip ? 'Cargando...' : 'Subir nómina'}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ID Document Section */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 block uppercase">2. Documento de identidad</label>
                {idDoc ? (
                  <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs">
                    <div className="flex items-center gap-3 text-slate-700 min-w-0">
                      {idDoc.url && !idDoc.name.toLowerCase().endsWith('.pdf') ? (
                        <img src={idDoc.url} className="h-10 w-10 object-cover rounded-lg border border-slate-200 bg-white" alt="Identidad" />
                      ) : (
                        <Icon name="File" size={20} className="text-brand-600 shrink-0" />
                      )}
                      <div className="min-w-0">
                        <span className="font-semibold truncate block">{idDoc.name}</span>
                        <span className="text-[10px] text-slate-400 font-sans block">({Math.round(idDoc.size / 1024)} KB)</span>
                      </div>
                    </div>
                    <button onClick={() => setIdDoc(null)} className="text-rose-500 hover:text-rose-600 p-1 shrink-0">
                      <Icon name="Trash" size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center hover:border-brand-500 transition-all relative">
                    <input
                      type="file"
                      onChange={(e) => handleFileUpload('id', e)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={uploadProgress.id}
                    />
                    <div className="space-y-1">
                      <div className="h-8 w-8 bg-slate-50 rounded-lg flex items-center justify-center mx-auto text-slate-400">
                        <Icon name="UploadCloud" size={18} />
                      </div>
                      <div className="text-xs font-semibold text-slate-650">
                        {uploadProgress.id ? 'Cargando...' : 'Subir documento ID'}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Selfie with ID Section */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 block uppercase">3. Selfie con documento</label>
                {selfieDoc ? (
                  <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs">
                    <div className="flex items-center gap-3 text-slate-700 min-w-0">
                      {selfieDoc.url && !selfieDoc.name.toLowerCase().endsWith('.pdf') ? (
                        <img src={selfieDoc.url} className="h-10 w-10 object-cover rounded-lg border border-slate-200 bg-white" alt="Selfie" />
                      ) : (
                        <Icon name="File" size={20} className="text-brand-600 shrink-0" />
                      )}
                      <div className="min-w-0">
                        <span className="font-semibold truncate block">{selfieDoc.name}</span>
                        <span className="text-[10px] text-slate-400 font-sans block">({Math.round(selfieDoc.size / 1024)} KB)</span>
                      </div>
                    </div>
                    <button onClick={() => setSelfieDoc(null)} className="text-rose-500 hover:text-rose-600 p-1 shrink-0">
                      <Icon name="Trash" size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center hover:border-brand-500 transition-all relative">
                    <input
                      type="file"
                      onChange={(e) => handleFileUpload('selfie', e)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={uploadProgress.selfie}
                    />
                    <div className="space-y-1">
                      <div className="h-8 w-8 bg-slate-50 rounded-lg flex items-center justify-center mx-auto text-slate-400">
                        <Icon name="UploadCloud" size={18} />
                      </div>
                      <div className="text-xs font-semibold text-slate-650">
                        {uploadProgress.selfie ? 'Cargando...' : 'Subir selfie'}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* RECAP PREVIEW */}
              <div className="border-t border-slate-100 pt-6 space-y-4">
                <h3 className="font-display font-bold text-sm text-slate-900 uppercase tracking-wide">Resumen:</h3>
                <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 text-xs space-y-2">
                  <div className="flex justify-between text-slate-500">
                    <span>Modelo:</span>
                    <strong className="text-slate-800">{loanType.name}</strong>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Monto:</span>
                    <strong className="text-slate-800">{reqAmount.toLocaleString()} €</strong>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Plazo:</span>
                    <strong className="text-slate-800">{reqMonths} meses</strong>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Cuota mensual:</span>
                    <strong className="text-brand-600">{calculateMonthlyPayment(reqAmount, reqMonths, loanType.interest_rate).monthly} €</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button
                onClick={() => { setErrorMsg(''); setStep(3); }}
                className="px-5 py-2.5 rounded-xl border border-slate-100 text-slate-500 text-xs font-bold hover:bg-slate-50 transition-colors"
              >
                Atrás
              </button>
              <button
                onClick={handleFinalSubmit}
                disabled={!paySlipDoc || !idDoc || !selfieDoc}
                className={`px-6 py-2.5 rounded-xl text-xs font-bold shadow-sm text-white transition-all ${
                  (!paySlipDoc || !idDoc || !selfieDoc)
                    ? 'bg-slate-300 cursor-not-allowed shadow-none'
                    : 'bg-brand-600 hover:bg-brand-700'
                }`}
              >
                Enviar solicitud
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: SUCCESS PREVIEW */}
        {step === 5 && (
          <div className="text-center space-y-6 py-10 font-sans">
            <div className="h-16 w-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <Icon name="Check" size={32} />
            </div>

            <div className="space-y-2">
              <h2 className="font-display font-bold text-2xl text-slate-950">¡Solicitud enviada con éxito!</h2>
              <p className="text-slate-500 text-sm max-w-md mx-auto">
                Tu solicitud de <strong className="text-slate-800">{reqAmount.toLocaleString()} €</strong> ha sido recibida con el código <strong className="text-slate-800">REQ-{Math.round(Math.random()*100000)}</strong>.
              </p>
            </div>

            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-normal">
              Analizaremos tus documentos y te notificaremos en un plazo de 15 minutos vía correo electrónico o a través de tu portal de usuario.
            </p>

            <div className="pt-6 flex flex-col sm:flex-row gap-3 justify-center max-w-sm mx-auto">
              <Link
                to="/app/dashboard"
                className="bg-brand-600 hover:bg-brand-700 text-white font-semibold px-6 py-3 rounded-xl text-xs shadow-sm shadow-brand-500/10 transition-colors"
              >
                Portal de usuario
              </Link>
              <Link
                to="/"
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-6 py-3 rounded-xl text-xs transition-colors"
              >
                Inicio
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
