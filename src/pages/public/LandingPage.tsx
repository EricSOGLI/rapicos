/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dataService } from '../../lib/supabase';
import { calculateMonthlyPayment } from '../../lib/payment';
import { LoanType, BlogPost, ApprovedClientShowcase } from '../../types';
import Icon from '../../components/Icons';
import paykkoHeroBg from '../../../assets/paykko_hero_bg.jpg';

export function LandingPage() {
  const [loanTypes, setLoanTypes] = useState<LoanType[]>([]);
  const [showcase, setShowcase] = useState<ApprovedClientShowcase[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  
  // Consultation Form State
  const [consultName, setConsultName] = useState('');
  const [consultEmail, setConsultEmail] = useState('');
  const [consultPhone, setConsultPhone] = useState('');
  const [consultLoanType, setConsultLoanType] = useState('prestamo-personal');
  const [consultSuccess, setConsultSuccess] = useState(false);
  const [isSubmittingConsult, setIsSubmittingConsult] = useState(false);

  // Video Tour Modal State
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  // Dynamic Simulator State
  const [selectedType, setSelectedType] = useState<LoanType | null>(null);
  const [amount, setAmount] = useState(5000);
  const [months, setMonths] = useState(24);

  useEffect(() => {
    const lts = dataService.getLoanTypes();
    setLoanTypes(lts);
    if (lts.length > 0) {
      setSelectedType(lts[1] || lts[0]);
    }
    setShowcase(dataService.getShowcaseClients());
    setBlogPosts(dataService.getBlogPosts().slice(0, 3));
  }, []);

  useEffect(() => {
    if (selectedType) {
      setAmount(Math.max(selectedType.min_amount, Math.min(selectedType.max_amount, amount)));
      setMonths(Math.max(selectedType.min_duration_months, Math.min(selectedType.max_duration_months, months)));
    }
  }, [selectedType]);

  const { monthly, totalCost } = calculateMonthlyPayment(
    amount,
    months,
    selectedType?.interest_rate || 5.0
  );

  const scrollToConsultation = (e: React.MouseEvent) => {
    e.preventDefault();
    const elem = document.getElementById('formulario-consulta');
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => {
        const input = elem.querySelector('input');
        if (input) input.focus();
      }, 500);
    }
  };

  const handleConsultSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!consultName || !consultEmail) return;

    setIsSubmittingConsult(true);
    setTimeout(() => {
      dataService.createConsultationLead({
        full_name: consultName,
        email: consultEmail,
        phone: consultPhone || '+34 600 000 000',
        loan_type: consultLoanType
      });
      dataService.subscribeNewsletter(consultEmail);

      setIsSubmittingConsult(false);
      setConsultSuccess(true);
    }, 600);
  };

  return (
    <div className="bg-white font-sans text-slate-800 overflow-hidden">
      {/* ========================================================================= */}
      {/* 1. HERO SECTION: RESTORED MOBILE SWIPE CARDS + SLEEK DESKTOP CARDS */}
      {/* ========================================================================= */}
      <section className="relative isolate w-full overflow-hidden bg-[#0a0618] min-h-[90vh] lg:min-h-screen flex flex-col justify-end text-white">
        
        {/* Full-Bleed Background Image (Faces 100% visible at top) */}
        <div className="absolute inset-0 z-0">
          <img
            src={paykkoHeroBg}
            alt="RapiCredito Experiencia Financiera"
            className="w-full h-full object-cover object-[75%_15%] sm:object-[center_18%] brightness-[0.92]"
          />
        </div>

        {/* Deep Bottom Linear Gradient Mask */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 z-1 h-[70%] sm:h-[62%] pointer-events-none"
          style={{
            background: 'linear-gradient(180deg, rgba(10, 6, 24, 0) 0%, rgba(10, 6, 24, 0.72) 42%, #070417 88%)'
          }}
        ></div>

        {/* Hero Content Container */}
        <div className="relative z-10 flex w-full flex-col justify-end pt-44 sm:pt-56 md:pt-64 pb-8 sm:pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-6 sm:space-y-8">
            
            {/* =================================================================== */}
            {/* DESKTOP VIEW: 3-COLUMN COMPACT FINTECH CARDS */}
            {/* =================================================================== */}
            <div className="hidden md:grid md:grid-cols-3 gap-4 lg:gap-6 xl:gap-8 items-end">
              
              {/* Card 1: Préstamo Personal */}
              <div className="rounded-2xl p-4 sm:p-5 bg-[#4f46e5]/95 border border-indigo-400/30 shadow-xl backdrop-blur-md flex flex-col justify-between gap-3 group hover:scale-[1.02] transition-all">
                <div className="flex justify-between items-center text-xs font-bold text-white/90 uppercase tracking-wide">
                  <span>Préstamo Personal</span>
                  <Icon name="Eye" size={15} className="text-white/80" />
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl lg:text-3xl font-display font-extrabold text-white tracking-tight">15.000</span>
                  <span className="text-sm font-semibold text-white/70">€</span>
                </div>
                <Link
                  to="/simulador?tip=prestamo-personal&monto=15000&meses=24"
                  className="w-full text-center py-2.5 rounded-full bg-white text-[#4f46e5] font-bold text-xs shadow-sm hover:bg-slate-50 transition-colors"
                >
                  Simular Préstamo
                </Link>
              </div>

              {/* Card 2: Microcrédito 15 min */}
              <div className="rounded-2xl p-4 sm:p-5 bg-[#10b981]/95 border border-emerald-300/40 shadow-xl backdrop-blur-md flex flex-col justify-between gap-3 group hover:scale-[1.02] transition-all">
                <div className="flex justify-between items-center text-xs font-bold text-white/90 uppercase tracking-wide">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-white animate-ping"></span>
                    Microcrédito 15 min
                  </span>
                  <Icon name="Zap" size={15} className="text-amber-300" />
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl lg:text-3xl font-display font-extrabold text-white tracking-tight">3.000</span>
                  <span className="text-sm font-semibold text-white/70">€</span>
                </div>
                <Link
                  to="/simulador?tip=microcredito-emergencia&monto=3000&meses=6"
                  className="w-full text-center py-2.5 rounded-full bg-amber-300 text-emerald-950 font-bold text-xs shadow-sm hover:bg-amber-200 transition-colors"
                >
                  Simular Microcrédito
                </Link>
              </div>

              {/* Card 3: Reforma Hogar */}
              <div className="rounded-2xl p-4 sm:p-5 bg-[#7c3aed]/95 border border-purple-400/30 shadow-xl backdrop-blur-md flex flex-col justify-between gap-3 group hover:scale-[1.02] transition-all">
                <div className="flex justify-between items-center text-xs font-bold text-white/90 uppercase tracking-wide">
                  <span>Reforma Hogar</span>
                  <Icon name="Home" size={15} className="text-white/80" />
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl lg:text-3xl font-display font-extrabold text-white tracking-tight">28.500</span>
                  <span className="text-sm font-semibold text-white/70">€</span>
                </div>
                <Link
                  to="/simulador?tip=prestamo-hogar&monto=28500&meses=48"
                  className="w-full text-center py-2.5 rounded-full bg-white text-[#7c3aed] font-bold text-xs shadow-sm hover:bg-slate-50 transition-colors"
                >
                  Simular Reforma
                </Link>
              </div>

            </div>

            {/* =================================================================== */}
            {/* MOBILE VIEW: SWIPEABLE CARDS ROW (RESTORED CLEAN MOBILE DESIGN) */}
            {/* =================================================================== */}
            <div className="md:hidden flex gap-3 overflow-x-auto scrollbar-none pb-1 pt-1 -mx-4 px-4">
              
              {/* Mobile Card 1 */}
              <div className="min-w-[240px] flex-1 rounded-2xl p-4 bg-[#4f46e5]/95 border border-indigo-400/30 shadow-xl flex flex-col justify-between gap-2.5">
                <div className="flex justify-between items-center text-[11px] font-bold text-white/90 uppercase">
                  <span>Préstamo Personal</span>
                  <Icon name="Eye" size={14} className="text-white/80" />
                </div>
                <span className="text-2xl font-display font-bold text-white">15.000 €</span>
                <Link to="/simulador?tip=prestamo-personal&monto=15000&meses=24" className="w-full text-center py-2 rounded-full bg-white text-[#4f46e5] font-bold text-[11px]">
                  Simular Préstamo
                </Link>
              </div>

              {/* Mobile Card 2 */}
              <div className="min-w-[240px] flex-1 rounded-2xl p-4 bg-[#10b981]/95 border border-emerald-300/40 shadow-xl flex flex-col justify-between gap-2.5">
                <div className="flex justify-between items-center text-[11px] font-bold text-white/90 uppercase">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-white animate-ping"></span>
                    Microcrédito 15 min
                  </span>
                  <Icon name="Zap" size={14} className="text-amber-300" />
                </div>
                <span className="text-2xl font-display font-bold text-white">3.000 €</span>
                <Link to="/simulador?tip=microcredito-emergencia&monto=3000&meses=6" className="w-full text-center py-2 rounded-full bg-amber-300 text-emerald-950 font-bold text-[11px]">
                  Simular Microcrédito
                </Link>
              </div>

              {/* Mobile Card 3 */}
              <div className="min-w-[240px] flex-1 rounded-2xl p-4 bg-[#7c3aed]/95 border border-purple-400/30 shadow-xl flex flex-col justify-between gap-2.5">
                <div className="flex justify-between items-center text-[11px] font-bold text-white/90 uppercase">
                  <span>Reforma Hogar</span>
                  <Icon name="Home" size={14} className="text-white/80" />
                </div>
                <span className="text-2xl font-display font-bold text-white">28.500 €</span>
                <Link to="/simulador?tip=prestamo-hogar&monto=28500&meses=48" className="w-full text-center py-2 rounded-full bg-white text-[#7c3aed] font-bold text-[11px]">
                  Simular Reforma
                </Link>
              </div>

            </div>

            {/* =================================================================== */}
            {/* CLEAN 2-LINE TITLE & SIDE-BY-SIDE BUTTONS */}
            {/* =================================================================== */}
            <div className="flex flex-col gap-4 sm:gap-6 max-w-2xl pt-2">
              
              {/* Paykko 2-Line Headline */}
              <h1 className="font-display font-extrabold text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-[1.12]">
                <span className="block">Mejor Estrategia.</span>
                <span className="block text-indigo-400">Mayor Crecimiento.</span>
              </h1>

              {/* Action Buttons (Strictly Side by Side on Mobile & Desktop) */}
              <div className="grid grid-cols-2 gap-2.5 sm:flex sm:flex-wrap sm:gap-4 pt-1 w-full max-w-md sm:max-w-none">
                <button
                  onClick={scrollToConsultation}
                  className="btn-primary-purple font-bold px-3 sm:px-8 py-3.5 sm:py-4 rounded-2xl text-[11px] sm:text-sm shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer text-center"
                >
                  <span className="sm:hidden">Consulta Gratis</span>
                  <span className="hidden sm:inline">Solicitar Consulta Gratis</span>
                  <Icon name="ArrowRight" size={15} className="shrink-0" />
                </button>
                <Link
                  to="/simulador"
                  className="bg-white/15 hover:bg-white/25 text-white font-bold px-3 sm:px-8 py-3.5 sm:py-4 rounded-2xl text-[11px] sm:text-sm border border-white/20 backdrop-blur-md transition-all flex items-center justify-center gap-1.5 sm:gap-2 shadow-sm text-center"
                >
                  <Icon name="Sliders" size={15} className="shrink-0 text-indigo-300" />
                  <span className="sm:hidden">Simular Préstamo</span>
                  <span className="hidden sm:inline">Pedir un Préstamo (Simular)</span>
                </Link>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. 4-FEATURE PILLARS RIBBON (Matching designe.jpg) */}
      {/* ========================================================================= */}
      <section className="py-8 bg-slate-50/60 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Feature 1 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all space-y-3">
              <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <Icon name="TrendingUp" size={20} />
              </div>
              <h3 className="font-display font-bold text-sm sm:text-base text-slate-900">Planificación Estratégica</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Estrategias financieras orientadas a tus objetivos personales y comerciales.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all space-y-3">
              <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <Icon name="Sliders" size={20} />
              </div>
              <h3 className="font-display font-bold text-sm sm:text-base text-slate-900">Proceso 100% Digital</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Optimiza tus operaciones y obtén financiamiento rápido sin desplazarte al banco.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all space-y-3">
              <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Icon name="PieChart" size={20} />
              </div>
              <h3 className="font-display font-bold text-sm sm:text-base text-slate-900">Transparencia Total</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Condiciones fijas, análisis claro de tasas de interés y cuotas sin costos ocultos.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all space-y-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <Icon name="Zap" size={20} />
              </div>
              <h3 className="font-display font-bold text-sm sm:text-base text-slate-900">Crecimiento Sostenible</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Construye valor financiero duradero con desembolsos ágiles y seguros.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. "BOOK A FREE CONSULTATION" / LEAD FORM (Matching designe.jpg) */}
      {/* ========================================================================= */}
      <section id="formulario-consulta" className="py-16 md:py-20 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#f8f7ff] rounded-3xl p-6 sm:p-10 lg:p-14 border border-indigo-100/70 shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              
              {/* Left Column Description */}
              <div className="lg:col-span-5 space-y-6">
                <div className="space-y-3">
                  <h2 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 leading-tight">
                    Solicita tu Asesoría o Préstamo Rápido
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
                    Cuéntanos sobre tus necesidades de financiamiento y te ayudaremos a estructurar tu préstamo ideal en cuestión de minutos.
                  </p>
                </div>

                <div className="space-y-3.5 pt-2">
                  <div className="flex items-center gap-3 text-xs sm:text-sm font-semibold text-slate-700">
                    <div className="h-6 w-6 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                      <Icon name="Check" size={14} />
                    </div>
                    <span>Sin compromiso ni cobros por estudio previo</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs sm:text-sm font-semibold text-slate-700">
                    <div className="h-6 w-6 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                      <Icon name="Check" size={14} />
                    </div>
                    <span>Asesoría personalizada y experta</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs sm:text-sm font-semibold text-slate-700">
                    <div className="h-6 w-6 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                      <Icon name="Check" size={14} />
                    </div>
                    <span>Soluciones adaptadas a tu capacidad de pago</span>
                  </div>
                </div>
              </div>

              {/* Right Column Consultation Form Card */}
              <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-md space-y-5">
                {consultSuccess ? (
                  <div className="text-center py-8 space-y-4 animate-in fade-in duration-300">
                    <div className="h-14 w-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                      <Icon name="CheckCircle" size={28} />
                    </div>
                    <h3 className="font-display font-bold text-lg text-slate-900">¡Solicitud Recibida con Éxito!</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                      Gracias, <strong className="text-slate-800">{consultName}</strong>. Uno de nuestros asesores financieros se pondrá en contacto contigo a la brevedad.
                    </p>
                    <Link
                      to={`/solicitud/${consultLoanType}`}
                      className="inline-block btn-primary-purple font-semibold px-6 py-2.5 rounded-xl text-xs shadow-md shadow-indigo-500/20"
                    >
                      Continuar a la solicitud formal digital →
                    </Link>
                  </div>
                ) : (
                  <form onSubmit={handleConsultSubmit} className="space-y-4">
                    <div>
                      <input
                        type="text"
                        required
                        placeholder="Nombre y Apellidos*"
                        value={consultName}
                        onChange={(e) => setConsultName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-3 text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
                      />
                    </div>

                    <div>
                      <input
                        type="email"
                        required
                        placeholder="Correo Electrónico*"
                        value={consultEmail}
                        onChange={(e) => setConsultEmail(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-3 text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
                      />
                    </div>

                    <div>
                      <input
                        type="tel"
                        required
                        placeholder="Teléfono de Contacto*"
                        value={consultPhone}
                        onChange={(e) => setConsultPhone(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-3 text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
                      />
                    </div>

                    <div>
                      <select
                        value={consultLoanType}
                        onChange={(e) => setConsultLoanType(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-3 text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
                      >
                        <option value="prestamo-personal">Préstamo Personal Rápido (2.000 € - 15.000 €)</option>
                        <option value="microcredito-emergencia">Microcrédito de Emergencia (500 € - 3.000 €)</option>
                        <option value="prestamo-hogar">Préstamo Remodelación de Hogar (5.000 € - 40.000 €)</option>
                        <option value="prestamo-vehiculo">Préstamo Vehicular (3.000 € - 25.000 €)</option>
                        <option value="prestamo-educativo">Préstamo Educativo (1.000 € - 15.000 €)</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingConsult}
                      className="w-full btn-primary-purple font-bold py-3.5 rounded-xl text-xs sm:text-sm transition-all shadow-md shadow-indigo-500/20 cursor-pointer"
                    >
                      {isSubmittingConsult ? 'Enviando solicitud...' : 'Solicitar Consulta Gratuita'}
                    </button>
                  </form>
                )}
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. "WHAT WE DO / OUR SERVICES" (Matching designe.jpg) */}
      {/* ========================================================================= */}
      <section className="py-16 md:py-20 bg-slate-50/50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <span className="text-[11px] font-bold uppercase tracking-widest text-indigo-600">Nuestros Servicios</span>
            <h2 className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl text-slate-900">
              Lo Que Hacemos Por Ti
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            
            {/* Service 1 */}
            <div className="bg-white p-7 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Icon name="Zap" size={22} />
                </div>
                <h3 className="font-display font-bold text-base text-slate-900">Microcréditos Express</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Soluciones urgentes de liquidez en 15 minutos para cubrir imprevistos con mínimos requisitos.
                </p>
              </div>
              <Link
                to="/simulador?tip=microcredito-emergencia"
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 group"
              >
                Saber más <span className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
            </div>

            {/* Service 2 */}
            <div className="bg-white p-7 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Icon name="CreditCard" size={22} />
                </div>
                <h3 className="font-display font-bold text-base text-slate-900">Préstamos Personales</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Financiamiento flexible de libre inversión para tus proyectos, viajes o compras importantes.
                </p>
              </div>
              <Link
                to="/simulador?tip=prestamo-personal"
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 group"
              >
                Saber más <span className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
            </div>

            {/* Service 3 */}
            <div className="bg-white p-7 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Icon name="Home" size={22} />
                </div>
                <h3 className="font-display font-bold text-base text-slate-900">Remodelación de Hogar</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Créditos preferenciales para obras, reformas, eficiencia energética y mobiliario.
                </p>
              </div>
              <Link
                to="/simulador?tip=prestamo-hogar"
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 group"
              >
                Saber más <span className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
            </div>

            {/* Service 4 */}
            <div className="bg-white p-7 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Icon name="Car" size={22} />
                </div>
                <h3 className="font-display font-bold text-base text-slate-900">Crédito Vehicular</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Compra tu vehículo nuevo o de ocasión con cuotas mensuales fijas y tasa preferencial.
                </p>
              </div>
              <Link
                to="/simulador?tip=prestamo-vehiculo"
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 group"
              >
                Saber más <span className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. "WHY WORK WITH US?" + 4 KPI NUMBERS (Matching designe.jpg) */}
      {/* ========================================================================= */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Heading & Button */}
            <div className="lg:col-span-5 space-y-6">
              <h2 className="font-display font-bold text-3xl sm:text-4xl text-slate-900 leading-tight">
                ¿Por Qué Trabajar Con Nosotros?
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
                Combinamos tecnología financiera de vanguardia, experiencia y un compromiso total de transparencia para ofrecer resultados excepcionales a cada cliente.
              </p>
              <div>
                <Link
                  to="/simulador"
                  className="inline-block btn-primary-purple font-semibold px-6 py-3 rounded-xl text-xs transition-all shadow-sm"
                >
                  Simular Mi Préstamo Ahora →
                </Link>
              </div>
            </div>

            {/* Right Column: 2x2 Stats Grid */}
            <div className="lg:col-span-7 grid grid-cols-2 gap-8 sm:gap-10">
              <div className="space-y-1">
                <span className="font-display font-extrabold text-4xl sm:text-5xl text-indigo-600 block">15+</span>
                <span className="text-xs sm:text-sm font-bold text-slate-800 block">Años de Trayectoria</span>
              </div>

              <div className="space-y-1">
                <span className="font-display font-extrabold text-4xl sm:text-5xl text-indigo-600 block">300+</span>
                <span className="text-xs sm:text-sm font-bold text-slate-800 block">Millones € Financiados</span>
              </div>

              <div className="space-y-1">
                <span className="font-display font-extrabold text-4xl sm:text-5xl text-indigo-600 block">98%</span>
                <span className="text-xs sm:text-sm font-bold text-slate-800 block">Satisfacción de Clientes</span>
              </div>

              <div className="space-y-1">
                <span className="font-display font-extrabold text-4xl sm:text-5xl text-indigo-600 block">50+</span>
                <span className="text-xs sm:text-sm font-bold text-slate-800 block">Tipos de Proyectos Atendidos</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. "SUCCESS STORIES / CASE STUDIES" (Matching designe.jpg) */}
      {/* ========================================================================= */}
      <section className="py-16 md:py-20 bg-slate-50/60 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-indigo-600 block mb-1">Casos de Estudio</span>
              <h2 className="font-display font-bold text-2xl sm:text-3xl text-slate-900">
                Historias de Éxito Reales
              </h2>
            </div>
            <Link
              to="/blog"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 self-start sm:self-auto"
            >
              Ver todos los casos →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Story 1 */}
            <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <img
                  src="https://images.unsplash.com/photo-1556742049-0a67e55722c0?auto=format&fit=crop&w=600&q=80"
                  alt="Fintech Growth"
                  className="h-44 w-full object-cover"
                />
                <div className="p-5 space-y-2">
                  <span className="text-[10px] font-bold text-indigo-600 uppercase">Comercio & Retail</span>
                  <h3 className="font-display font-bold text-sm text-slate-900 leading-snug">
                    Ampliación de Inventario y Ventas +120%
                  </h3>
                </div>
              </div>
              <div className="px-5 pb-5 pt-1">
                <Link to="/simulador?tip=prestamo-personal" className="text-[11px] font-bold text-indigo-600 hover:underline">
                  Simular este caso →
                </Link>
              </div>
            </div>

            {/* Story 2 */}
            <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <img
                  src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80"
                  alt="Medical clinic"
                  className="h-44 w-full object-cover"
                />
                <div className="p-5 space-y-2">
                  <span className="text-[10px] font-bold text-indigo-600 uppercase">Salud & Servicios</span>
                  <h3 className="font-display font-bold text-sm text-slate-900 leading-snug">
                    Eficiencia Operativa Incrementada al 60%
                  </h3>
                </div>
              </div>
              <div className="px-5 pb-5 pt-1">
                <Link to="/simulador?tip=microcredito-emergencia" className="text-[11px] font-bold text-indigo-600 hover:underline">
                  Simular este caso →
                </Link>
              </div>
            </div>

            {/* Story 3 */}
            <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <img
                  src="https://images.unsplash.com/photo-1556740738-b6a63e27c4df?auto=format&fit=crop&w=600&q=80"
                  alt="E-commerce store"
                  className="h-44 w-full object-cover"
                />
                <div className="p-5 space-y-2">
                  <span className="text-[10px] font-bold text-indigo-600 uppercase">E-Commerce & Digital</span>
                  <h3 className="font-display font-bold text-sm text-slate-900 leading-snug">
                    Crecimiento de Ingresos del 150% en 6 Meses
                  </h3>
                </div>
              </div>
              <div className="px-5 pb-5 pt-1">
                <Link to="/simulador?tip=prestamo-personal" className="text-[11px] font-bold text-indigo-600 hover:underline">
                  Simular este caso →
                </Link>
              </div>
            </div>

            {/* Story 4 */}
            <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <img
                  src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80"
                  alt="SaaS Platform"
                  className="h-44 w-full object-cover"
                />
                <div className="p-5 space-y-2">
                  <span className="text-[10px] font-bold text-indigo-600 uppercase">Hogar & Proyectos</span>
                  <h3 className="font-display font-bold text-sm text-slate-900 leading-snug">
                    Reforma Completa con Tasa Preferencial
                  </h3>
                </div>
              </div>
              <div className="px-5 pb-5 pt-1">
                <Link to="/simulador?tip=prestamo-hogar" className="text-[11px] font-bold text-indigo-600 hover:underline">
                  Simular este caso →
                </Link>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. "DELIVERING RESULTS THAT MATTER" DARK BANNER (Top-right of designe.jpg) */}
      {/* ========================================================================= */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#19133b] text-white rounded-3xl p-8 sm:p-12 lg:p-16 relative overflow-hidden shadow-xl">
            
            {/* Background glowing gradients */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 space-y-12">
              
              {/* Header row with Play Video button */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">Impacto Comprobado</span>
                  <h2 className="font-display font-bold text-3xl sm:text-4xl text-white leading-tight">
                    Resultados Reales Que Marcan la Diferencia
                  </h2>
                </div>

                <button
                  onClick={() => setIsVideoModalOpen(true)}
                  className="h-16 w-16 rounded-full bg-white text-indigo-900 flex items-center justify-center hover:scale-110 transition-transform shadow-lg shrink-0 self-start md:self-auto group cursor-pointer"
                  aria-label="Ver video tour"
                >
                  <Icon name="Play" size={24} className="ml-1 text-indigo-600 group-hover:text-indigo-700 transition-colors" />
                </button>
              </div>

              {/* 4 KPI Metrics in a row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-8 border-t border-indigo-900/60">
                <div className="space-y-1">
                  <span className="font-display font-extrabold text-3xl sm:text-4xl text-white block">16+</span>
                  <span className="text-xs sm:text-sm text-indigo-200 block">Años de Trayectoria</span>
                </div>
                <div className="space-y-1">
                  <span className="font-display font-extrabold text-3xl sm:text-4xl text-white block">250+</span>
                  <span className="text-xs sm:text-sm text-indigo-200 block">Asesores Expertos</span>
                </div>
                <div className="space-y-1">
                  <span className="font-display font-extrabold text-3xl sm:text-4xl text-white block">500+</span>
                  <span className="text-xs sm:text-sm text-indigo-200 block">Proyectos Financiados / Mes</span>
                </div>
                <div className="space-y-1">
                  <span className="font-display font-extrabold text-3xl sm:text-4xl text-white block">30+</span>
                  <span className="text-xs sm:text-sm text-indigo-200 block">Regiones Atendidas</span>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. "THOSE WHO MADE A CHANGE" (Testimonials from designe.jpg) */}
      {/* ========================================================================= */}
      <section className="py-16 md:py-20 bg-slate-50/50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-indigo-600 block mb-1">Personas Que Inspiran</span>
              <h2 className="font-display font-bold text-2xl sm:text-3xl text-slate-900">
                Historias de Quienes Alcanzaron Sus Metas
              </h2>
            </div>
            <Link
              to="/blog"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 self-start sm:self-auto"
            >
              Ver todas las historias →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Testimonial 1 */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=500&q=80"
                  alt="Elena Martínez"
                  className="h-56 w-full object-cover rounded-2xl"
                />
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                  "Logramos incrementar las ventas de nuestra cadena retail un 120% gracias a la rápida inyección de liquidez de RapiCredito."
                </p>
              </div>
              <div className="border-t border-slate-50 pt-3">
                <h4 className="font-display font-bold text-xs text-slate-900">Elena Martínez</h4>
                <span className="text-[10px] text-slate-400 font-semibold block">CEO, RetailCo</span>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <img
                  src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=500&q=80"
                  alt="Alejandro Gómez"
                  className="h-56 w-full object-cover rounded-2xl"
                />
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                  "Estructuramos un financiamiento escalable que redujo costos operativos un 35% y nos dio total tranquilidad."
                </p>
              </div>
              <div className="border-t border-slate-50 pt-3">
                <h4 className="font-display font-bold text-xs text-slate-900">Alejandro Gómez</h4>
                <span className="text-[10px] text-slate-400 font-semibold block">COO, TechFlow</span>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <img
                  src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=500&q=80"
                  alt="Roberto Silva"
                  className="h-56 w-full object-cover rounded-2xl"
                />
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                  "Transformamos nuestra estrategia comercial logrando triplicar clientes calificados con total transparencia de cuotas."
                </p>
              </div>
              <div className="border-t border-slate-50 pt-3">
                <h4 className="font-display font-bold text-xs text-slate-900">Roberto Silva</h4>
                <span className="text-[10px] text-slate-400 font-semibold block">CMO, GrowthLabs</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 9. GIANT QUOTE HIGHLIGHT (Matching designe.jpg) */}
      {/* ========================================================================= */}
      <section className="py-20 md:py-28 bg-white text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 relative z-10">
          
          {/* Giant Quote Icon */}
          <div className="flex justify-center text-indigo-600 text-7xl font-serif select-none leading-none">
            “
          </div>

          <blockquote className="font-display font-bold text-xl sm:text-2xl lg:text-3xl text-slate-900 leading-snug">
            "RapiCredito no es solo una plataforma de crédito: fueron el socio clave que nos acompañó en cada etapa con liquidez inmediata y un trato humano excepcional."
          </blockquote>

          <div className="flex items-center justify-center gap-3 pt-2">
            <img
              src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&h=120&q=80"
              alt="María Rodríguez"
              className="h-10 w-10 rounded-full object-cover ring-2 ring-indigo-100"
            />
            <div className="text-left">
              <h4 className="font-bold text-xs text-slate-900">María Rodríguez</h4>
              <span className="text-[10px] text-slate-400 font-medium">Fundadora & Cliente RapiCredito</span>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 10. "INSIGHTS & EXPERTISE TO MOVE FORWARD" / TABLET MOCKUP (designe.jpg) */}
      {/* ========================================================================= */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#ede9fe]/60 rounded-3xl p-8 sm:p-12 lg:p-16 border border-purple-100">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              <div className="lg:col-span-6 space-y-6">
                <span className="text-[11px] font-bold uppercase tracking-widest text-indigo-700 block">Nuevas Perspectivas, Mejores Decisiones</span>
                <h2 className="font-display font-bold text-3xl sm:text-4xl text-slate-900 leading-tight">
                  Tecnología y Asesoría Para Impulsar tu Futuro
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                  Monitorea tus préstamos, consulta simulaciones interactivas y realiza pagos o retiros instantáneos directamente desde tu teléfono móvil.
                </p>
                <div>
                  <Link
                    to="/simulador"
                    className="inline-block btn-primary-purple font-bold px-7 py-3 rounded-xl text-xs shadow-md shadow-indigo-500/20"
                  >
                    Probar Simulador Interactivo →
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-6 flex justify-center">
                <img
                  src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=700&q=80"
                  alt="Tablet Financial Analytics"
                  className="rounded-2xl shadow-xl w-full max-w-md object-cover border border-white"
                />
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 11. "LATEST INSIGHTS / BLOG" (Matching designe.jpg) */}
      {/* ========================================================================= */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-indigo-600 block mb-1">Últimos Artículos</span>
              <h2 className="font-display font-bold text-2xl sm:text-3xl text-slate-900">
                Consejos Financieros Para Crecer
              </h2>
            </div>
            <Link
              to="/blog"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 self-start sm:self-auto"
            >
              Ver todos los artículos →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {blogPosts.length > 0 ? (
              blogPosts.map((post) => (
                <div key={post.id} className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                  <div>
                    <img
                      src={post.cover_image || 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80'}
                      alt={post.title}
                      className="h-48 w-full object-cover"
                    />
                    <div className="p-6 space-y-3">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700">
                        {post.category || 'Estrategia'}
                      </span>
                      <h3 className="font-display font-bold text-base text-slate-900 leading-snug">
                        {post.title}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {post.excerpt}
                      </p>
                    </div>
                  </div>
                  <div className="px-6 pb-6 pt-0 flex items-center justify-between text-[11px] text-slate-400 font-semibold border-t border-slate-50 mt-2">
                    <span>{new Date(post.published_at || post.created_at).toLocaleDateString('es-ES')}</span>
                    <Link to={`/blog/${post.slug}`} className="text-indigo-600 font-bold hover:underline">
                      Leer artículo →
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <>
                <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm p-6 space-y-3">
                  <span className="text-[10px] font-bold text-indigo-600 uppercase">Estrategia</span>
                  <h3 className="font-bold text-base text-slate-900">5 Estrategias para Gestionar tu Presupuesto</h3>
                  <p className="text-xs text-slate-500">Aprende a planificar tus ingresos y gastos para alcanzar tus objetivos.</p>
                </div>
              </>
            )}
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 12. "READY TO ACHIEVE MORE?" BOTTOM CTA BANNER (designe.jpg) */}
      {/* ========================================================================= */}
      <section className="py-12 pb-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-700 text-white rounded-3xl p-8 sm:p-12 lg:p-16 relative overflow-hidden shadow-xl">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
              
              <div className="lg:col-span-7 space-y-6">
                <h2 className="font-display font-bold text-3xl sm:text-4xl text-white leading-tight">
                  ¿Listo Para Alcanzar Más?
                </h2>
                <p className="text-xs sm:text-sm text-indigo-100 leading-relaxed font-medium max-w-lg">
                  Construyamos juntos el futuro financiero de tus proyectos. Solicita tu préstamo 100% en línea y recibe respuesta express hoy mismo.
                </p>
                
                {/* BOTTOM BUTTONS: SIDE BY SIDE ON MOBILE */}
                <div className="grid grid-cols-2 gap-2.5 sm:flex sm:flex-wrap sm:gap-4 pt-2 w-full max-w-md sm:max-w-none">
                  <button
                    onClick={scrollToConsultation}
                    className="bg-white hover:bg-slate-50 text-indigo-900 font-bold px-3 sm:px-7 py-3 sm:py-3.5 rounded-xl text-[11px] sm:text-sm shadow-md transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer text-center"
                  >
                    <span className="sm:hidden">Hablar Asesor</span>
                    <span className="hidden sm:inline">Hablar con un Asesor</span>
                    <Icon name="ArrowRight" size={15} className="shrink-0" />
                  </button>
                  <Link
                    to="/simulador"
                    className="bg-indigo-800/80 hover:bg-indigo-900 text-white font-bold px-3 sm:px-7 py-3 sm:py-3.5 rounded-xl text-[11px] sm:text-sm border border-indigo-400/40 transition-colors flex items-center justify-center text-center"
                  >
                    <span className="sm:hidden">Simulador</span>
                    <span className="hidden sm:inline">Simulador de Préstamos</span>
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-5 flex justify-center lg:justify-end">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&h=450&q=80"
                  alt="Asesor Financiero RapiCredito"
                  className="rounded-2xl max-h-72 object-cover border-2 border-white/20 shadow-2xl"
                />
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* VIDEO MODAL (Interactive Demo Preview) */}
      {/* ========================================================================= */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-6 relative">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-display font-bold text-lg text-slate-900">RapiCredito en Acción</h3>
                <p className="text-xs text-slate-400">Cómo funciona el proceso de aprobación y desembolso digital.</p>
              </div>
              <button
                onClick={() => setIsVideoModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <Icon name="X" size={20} />
              </button>
            </div>

            <div className="aspect-video bg-slate-950 rounded-2xl flex flex-col items-center justify-center text-white p-6 space-y-4 relative overflow-hidden">
              <div className="h-16 w-16 rounded-full bg-indigo-600 flex items-center justify-center shadow-lg animate-pulse">
                <Icon name="CheckCircle" size={32} />
              </div>
              <div className="text-center space-y-1">
                <h4 className="font-bold text-sm sm:text-base">Proceso 100% Online y Seguro</h4>
                <p className="text-xs text-slate-300 max-w-sm">
                  1. Completa el formulario • 2. Valida tu identidad • 3. Recibe los fondos directamente en tu IBAN en 15 minutos.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setIsVideoModalOpen(false)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 cursor-pointer"
              >
                Cerrar
              </button>
              <Link
                to="/simulador"
                className="btn-primary-purple font-bold px-6 py-2.5 rounded-xl text-xs"
              >
                Solicitar Préstamo Ahora →
              </Link>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
