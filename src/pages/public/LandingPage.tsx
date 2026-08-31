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
import heroImg from '../../../assets/hero_smiling_professional.png';

export function LandingPage() {
  const [loanTypes, setLoanTypes] = useState<LoanType[]>([]);
  const [showcase, setShowcase] = useState<ApprovedClientShowcase[]>([]);
  const [blogTeasers, setBlogTeasers] = useState<BlogPost[]>([]);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterMessage, setNewsletterMessage] = useState('');
  
  // Dynamic mini slider calculator
  const [selectedType, setSelectedType] = useState<LoanType | null>(null);
  const [amount, setAmount] = useState(5000);
  const [months, setMonths] = useState(36);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  useEffect(() => {
    const lts = dataService.getLoanTypes();
    setLoanTypes(lts);
    if (lts.length > 0) {
      setSelectedType(lts[1] || lts[0]); // default to personal loan
    }
    setShowcase(dataService.getShowcaseClients());
    setBlogTeasers(dataService.getBlogPosts().slice(0, 3));
  }, []);

  // Update slider limits based on type
  useEffect(() => {
    if (selectedType) {
      setAmount(Math.max(selectedType.min_amount, Math.min(selectedType.max_amount, amount)));
      setMonths(Math.max(selectedType.min_duration_months, Math.min(selectedType.max_duration_months, months)));
    }
  }, [selectedType]);

  const { monthly, totalCost, totalInterest } = calculateMonthlyPayment(
    amount,
    months,
    selectedType?.interest_rate || 5.0
  );

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = dataService.subscribeNewsletter(newsletterEmail);
    setNewsletterMessage(res.message);
    if (res.success) setNewsletterEmail('');
  };

  return (
    <div className="space-y-0 pb-0 bg-[#fafaf9]">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-2 pb-16 md:pt-4 md:pb-20 bg-white border-b border-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column */}
          <div className="col-span-1 lg:col-span-6 space-y-5 animate-in fade-in slide-in-from-left duration-700">
            <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold bg-accent-50 text-accent-700 border border-accent-100 gap-1.5 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-accent-500"></span>
              ⚡ Desembolso en tu cuenta en 15 minutos
            </span>
            
            <h1 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-slate-900 tracking-tight leading-tight">
              Préstamos digitales<br className="hidden xs:block" />
              rápidos al instante<br />
              <span className="text-brand-600">100% online</span>
            </h1>
            
            <p className="text-slate-500 text-sm sm:text-base leading-relaxed max-w-lg font-medium">
              Elige el monto y plazo de pago, sube tus documentos desde el móvil y firma tu contrato digitalmente. Proceso 100% seguro sin ir al banco y sin costos ocultos.
            </p>
            
            <div className="flex flex-wrap gap-3 sm:gap-4 pt-2 font-sans">
              <Link
                to="/simulador"
                className="btn-primary-green font-bold px-6 sm:px-8 py-3.5 rounded-full text-xs shadow-md transition-all flex items-center gap-1.5"
              >
                Simulador de Préstamos <Icon name="ChevronRight" size={14} />
              </Link>
              <Link
                to="/prestamos"
                className="text-slate-650 hover:text-slate-950 font-bold text-xs py-3.5 flex items-center gap-1 transition-colors"
              >
                Ver préstamos disponibles <Icon name="ChevronRight" size={14} className="text-slate-400" />
              </Link>
            </div>
          </div>
          
          {/* Right Column with Mockup elements */}
          <div className="col-span-1 lg:col-span-6 relative flex items-center justify-center animate-in fade-in slide-in-from-right duration-700">
            <div className="relative w-full max-w-md flex items-center justify-center p-4">
              
              {/* Decorative green dot */}
              <div className="absolute left-2 top-12 h-5 w-5 rounded-full bg-emerald-500 border-4 border-white shadow-md z-20"></div>
              
              {/* Decorative metallic sphere */}
              <div className="absolute right-4 top-4 h-8 w-8 rounded-full bg-gradient-to-br from-slate-200 to-slate-400 shadow-inner z-20"></div>
              
              <img
                src={heroImg}
                alt="RapiCredito Profesionales"
                className="w-full h-auto object-cover rounded-[32px] relative z-10 shadow-lg hover:scale-[1.02] transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              
              {/* Floating Balance Widget */}
              <div className="absolute -left-6 bottom-8 z-20 bg-white border border-slate-100 rounded-2xl p-3 w-40 sm:w-48 shadow-xl hover:-translate-y-1 transition-transform duration-300">
                <span className="text-slate-400 text-[8px] sm:text-[9px] font-bold uppercase tracking-wider block">Monto Aprobado</span>
                <span className="text-slate-900 font-display font-bold text-xs sm:text-lg block mt-0.5">15.000,00 €</span>
                
                {/* Sub widget */}
                <div className="bg-slate-50 rounded-xl p-1.5 mt-2 flex items-center justify-between border border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <div className="h-5 w-5 bg-slate-200 rounded flex items-center justify-center">
                      <Icon name="CreditCard" size={10} className="text-slate-600" />
                    </div>
                    <div>
                      <span className="text-slate-950 font-bold text-[8px] block">RapiCredito</span>
                      <span className="text-accent-600 font-bold text-[6px] block">Desembolso veloz</span>
                    </div>
                  </div>
                  <Icon name="ChevronRight" size={10} className="text-slate-400" />
                </div>
              </div>
              
              {/* Floating Lime Card Widget */}
              <div className="absolute -right-4 top-24 z-20 bg-[#a3e635] text-slate-950 rounded-xl p-3 w-28 sm:w-36 shadow-xl rotate-[6deg] hover:rotate-0 transition-all duration-300">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[6px] font-bold uppercase tracking-wider opacity-60 block">RapiCard</span>
                    <span className="font-mono text-[8px] sm:text-[10px] font-bold block mt-0.5">**** 8789</span>
                  </div>
                  <Icon name="Activity" size={10} className="text-slate-950" />
                </div>
                
                <div className="flex items-center justify-between mt-3">
                  <span className="text-[8px] font-bold font-mono">VISA</span>
                  <div className="h-3 w-4 bg-slate-950 rounded-sm"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. LOGO SHOWCASE / PARTNERS */}
      <section className="py-12 bg-white/40 border-y border-slate-100/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <p className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">
            Integración segura y respaldo con tecnología financiera de vanguardia
          </p>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20">
            <div className="flex items-center gap-2 text-slate-500 font-bold font-display text-sm md:text-base">
              <Icon name="Shield" size={18} className="text-emerald-500" />
              <span>Regulación Financiera</span>
            </div>
            <div className="flex items-center gap-2 text-slate-500 font-bold font-display text-sm md:text-base">
              <Icon name="Activity" size={18} className="text-brand-600" />
              <span>Encriptación SSL 256-bit</span>
            </div>
            <div className="flex items-center gap-2 text-slate-500 font-bold font-display text-sm md:text-base">
              <Icon name="Percent" size={18} className="text-emerald-500" />
              <span>Sin comisiones ocultas</span>
            </div>
            <div className="flex items-center gap-2 text-slate-500 font-bold font-display text-sm md:text-base">
              <Icon name="Eye" size={18} className="text-brand-600" />
              <span>Transparencia Garantizada</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS SECTION */}
      <section className="py-12 md:py-20 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center space-y-4 max-w-xl mx-auto">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-50 text-brand-600 gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-600"></span>
              PROCESO RÁPIDO
            </span>
            <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-slate-900 tracking-tight">
              ¿Cómo funciona RapiCredito?
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
              Obtener tus recursos financieros es fácil y cómodo, en solo unos simples pasos online.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto relative">
            {[
              {
                step: "01",
                title: "Elige tu monto y plazo",
                desc: "Usa nuestro simulador interactivo para seleccionar el monto y el número de meses. Verás inmediatamente el desglose transparente de tu cuota mensual.",
                icon: "Sliders"
              },
              {
                step: "02",
                title: "Completa la solicitud",
                desc: "Ingresa tus datos personales y sube la foto de tu documento de identidad desde tu smartphone o computadora. El proceso tarda menos de 5 minutos.",
                icon: "FileText"
              },
              {
                step: "03",
                title: "Desembolso inmediato",
                desc: "Tras la validación automática y tu firma digital del contrato, los fondos se transfieren directamente a tu cuenta bancaria en 15 minutos.",
                icon: "Zap"
              }
            ].map((item, idx) => (
              <div key={idx} className="bg-slate-50/50 rounded-[24px] sm:rounded-[32px] p-6 xs:p-8 border border-slate-100 hover:border-brand-100 shadow-sm transition-all duration-300 relative group flex flex-col justify-between min-h-[260px] sm:min-h-[280px]">
                <div className="space-y-6">
                  <div className="flex justify-between items-start">
                    <div className="h-12 w-12 bg-brand-50 rounded-2xl flex items-center justify-center text-brand-600 group-hover:scale-110 transition-transform">
                      <Icon name={item.icon} size={24} />
                    </div>
                    <span className="text-4xl font-display font-black text-slate-200 group-hover:text-brand-200 transition-colors">
                      {item.step}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-display font-bold text-lg text-slate-900">{item.title}</h3>
                    <p className="text-slate-500 text-xs leading-relaxed font-medium">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. OPTIMIZE YOUR BUDGET & SIMULATOR */}
      <section className="bg-slate-50/50 py-12 md:py-20 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          {/* Left Column */}
          <div className="lg:col-span-5 space-y-8">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-50 text-brand-600 gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-600"></span>
              CÁLCULO INFORMATIVO
            </span>
            
            <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-slate-900 tracking-tight leading-tight">
              Calcula la cuota de tu préstamo fácil y rápido.
            </h2>
            
            <p className="text-slate-500 text-sm leading-relaxed max-w-md font-medium">
              Usa nuestro simulador veloz para conocer tus cuotas mensuales, tasas de interés y el monto total de devolución sin sorpresas ni costos ocultos.
            </p>

            {/* Circular concentric percentages */}
            <div className="p-6 bg-white border border-slate-100 rounded-3xl flex items-center gap-6 shadow-sm">
              <div className="relative h-20 w-20 flex items-center justify-center">
                <svg className="absolute inset-0 h-full w-full rotate-[-90deg]">
                  <circle cx="40" cy="40" r="32" className="stroke-slate-100 fill-none" strokeWidth="6" />
                  <circle cx="40" cy="40" r="32" className="stroke-accent-500 fill-none" strokeWidth="6" strokeDasharray={`${2 * Math.PI * 32}`} strokeDashoffset={`${2 * Math.PI * 32 * (1 - 0.75)}`} />
                </svg>
                <span className="text-slate-900 font-bold text-xs">100%</span>
              </div>
              <div className="space-y-1">
                <span className="text-slate-900 font-bold text-sm block">Seguridad Transparente</span>
                <span className="text-slate-400 text-xs font-semibold block">Protección total de tus datos personales mediante cifrado de nivel bancario.</span>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-12 gap-6 items-start">
            
            {/* Live Calculator Widget */}
            <div className="sm:col-span-6 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
              <span className="text-slate-900 font-bold text-sm block border-b border-slate-50 pb-2">Calculadora de Préstamos</span>
              
              <div className="space-y-4 font-sans text-xs">
                <div>
                  <label className="flex justify-between font-bold text-slate-600 mb-1">
                    <span>Monto del préstamo</span>
                    <span className="text-brand-600">{amount.toLocaleString()} €</span>
                  </label>
                  <input
                    type="range"
                    min="1000"
                    max="15000"
                    step="500"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full accent-brand-600"
                  />
                </div>
                
                <div>
                  <label className="flex justify-between font-bold text-slate-600 mb-1">
                    <span>Plazo de pago</span>
                    <span className="text-brand-600">{months} meses</span>
                  </label>
                  <input
                    type="range"
                    min="6"
                    max="60"
                    step="6"
                    value={months}
                    onChange={(e) => setMonths(Number(e.target.value))}
                    className="w-full accent-brand-600"
                  />
                </div>

                <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 space-y-2 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Cuota mensual:</span>
                    <span className="font-bold text-slate-900">{monthly} €</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total a pagar:</span>
                    <span className="font-bold text-slate-900">{totalCost} €</span>
                  </div>
                </div>

                <Link
                  to={selectedType ? `/solicitud/${selectedType.slug}` : '/login'}
                  className="w-full btn-primary-green font-bold py-2.5 rounded-xl text-center block transition-all mt-2"
                >
                  Iniciar solicitud online
                </Link>
              </div>
            </div>

            {/* Bar Chart Spending Widget */}
            <div className="sm:col-span-6 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Plan de amortización</span>
                  <span className="text-slate-900 font-display font-bold text-xl mt-1 block">Aprobación Veloz</span>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-xl px-2.5 py-1 flex items-center gap-1">
                  <span className="text-slate-600 text-[9px] font-bold">Informativo</span>
                  <Icon name="ChevronDown" size={10} className="text-slate-400" />
                </div>
              </div>

              {/* Custom HTML/Tailwind Bar Chart */}
              <div className="h-40 flex items-end justify-between gap-2.5 pt-4">
                <div className="flex flex-col items-center flex-1 gap-2">
                  <div className="w-full bg-slate-100 rounded-lg h-[45%] hover:bg-slate-200 transition-colors"></div>
                  <span className="text-slate-400 text-[9px] font-bold uppercase">Ene</span>
                </div>
                <div className="flex flex-col items-center flex-1 gap-2 h-full justify-end">
                  <div className="bg-brand-600 rounded-lg w-full h-[85%] hover:bg-brand-700 transition-colors relative flex justify-center">
                    <div className="absolute -top-6 bg-slate-950 text-white text-[8px] font-bold py-0.5 px-1.5 rounded shadow-sm">
                      Desembolso
                    </div>
                  </div>
                  <span className="text-slate-900 text-[9px] font-black uppercase">Feb</span>
                </div>
                <div className="flex flex-col items-center flex-1 gap-2">
                  <div className="w-full bg-slate-100 rounded-lg h-[60%] hover:bg-slate-200 transition-colors"></div>
                  <span className="text-slate-400 text-[9px] font-bold uppercase">Mar</span>
                </div>
                <div className="flex flex-col items-center flex-1 gap-2">
                  <div className="w-full bg-slate-100 rounded-lg h-[50%] hover:bg-slate-200 transition-colors"></div>
                  <span className="text-slate-400 text-[9px] font-bold uppercase">Abr</span>
                </div>
                <div className="flex flex-col items-center flex-1 gap-2">
                  <div className="w-full bg-slate-100 rounded-lg h-[70%] hover:bg-slate-200 transition-colors"></div>
                  <span className="text-slate-400 text-[9px] font-bold uppercase">May</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 5. FEATURES GRID */}
      <section id="solutions" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 space-y-12 sm:space-y-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-end">
          <div className="col-span-1 md:col-span-7 space-y-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-50 text-brand-600 gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-600"></span>
              LÍNEAS FLEXIBLES DE CRÉDITO
            </span>
            <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-slate-900 tracking-tight max-w-lg leading-tight">
              Modelos diseñados para ajustarse a cada objetivo.
            </h2>
          </div>
          <div className="col-span-1 md:col-span-5">
            <p className="text-slate-500 text-xs sm:text-sm leading-relaxed max-w-md md:ml-auto">
              Ya sea que requieras un microcrédito exprés para una emergencia o financiamiento a largo plazo, RapiCredito tiene la solución ideal.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {loanTypes.slice(0, 3).map((type, idx) => {
            const isSpecial = idx === 1;
            const highlightTag = 
              type.slug === 'microcredito-emergencia' || type.slug === 'mikrokredit' ? 'Aprobación Inmediata' :
              type.slug === 'prestamo-personal' || type.slug === 'osobni-kredit' ? 'Opción Más Popular' :
              type.slug === 'prestamo-hogar' || type.slug === 'stambeni-kredit' ? 'Tasa Preferencial' : 'Recomendado';
            
            const iconName = 
              type.slug === 'microcredito-emergencia' || type.slug === 'mikrokredit' ? 'Zap' :
              type.slug === 'prestamo-personal' || type.slug === 'osobni-kredit' ? 'CreditCard' : 'Home';

            return (
              <div 
                key={type.id} 
                className={`rounded-[28px] sm:rounded-[36px] p-5 shadow-md relative overflow-hidden group hover:scale-[1.01] hover:shadow-lg transition-all duration-300 flex flex-col justify-between border ${
                  isSpecial 
                    ? 'bg-brand-600 text-white border-transparent' 
                    : 'bg-white text-slate-900 border-slate-100 hover:border-brand-100'
                }`}
              >
                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div>
                    {/* Image Header */}
                    <div className="h-44 w-full overflow-hidden rounded-2xl relative mb-6 border border-slate-100/50">
                      <img 
                        src={type.image_url} 
                        alt={type.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                      {/* Floating Tag */}
                      <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider backdrop-blur-md shadow-sm ${
                        isSpecial 
                          ? 'bg-white text-brand-600' 
                          : 'bg-slate-950 text-white'
                      }`}>
                        {highlightTag}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mb-4">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform ${
                        isSpecial ? 'bg-white/20 text-white' : 'bg-brand-50 text-brand-600'
                      }`}>
                        <Icon name={iconName} size={20} />
                      </div>
                      <h3 className="font-display font-bold text-lg sm:text-xl leading-tight">{type.name}</h3>
                    </div>

                    <p className={`text-xs leading-relaxed font-medium mb-6 ${isSpecial ? 'text-brand-100' : 'text-slate-500'}`}>
                      {type.description}
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div className={`h-[1px] ${isSpecial ? 'bg-white/20' : 'bg-slate-100'}`}></div>

                    <div className="space-y-3 font-sans text-xs">
                      <div className="flex justify-between">
                        <span className={isSpecial ? 'text-brand-100' : 'text-slate-500'}>Monto máximo:</span>
                        <span className="font-bold">{type.max_amount.toLocaleString()} €</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={isSpecial ? 'text-brand-100' : 'text-slate-500'}>Tasa de interés:</span>
                        <span className="font-bold">{type.interest_rate}% fija</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={isSpecial ? 'text-brand-100' : 'text-slate-500'}>Plazo de pago:</span>
                        <span className="font-bold">{type.min_duration_months} - {type.max_duration_months} meses</span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <Link
                        to={`/solicitud/${type.slug}`}
                        className={`w-full py-3.5 rounded-full text-xs font-bold transition-all text-center block shadow-sm ${
                          isSpecial 
                            ? 'bg-accent-500 hover:bg-accent-600 text-white' 
                            : 'bg-slate-950 hover:bg-slate-800 text-white'
                        }`}
                      >
                        Solicitar ahora <Icon name="ChevronRight" size={14} className="inline-block ml-1" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. EXPERT SOLUTIONS SECTION (SOBRE NOSOTROS) */}
      <section className="bg-white py-12 md:py-20 border-t border-slate-100/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          {/* Left Column (Image & Testimonial Badging) */}
          <div className="lg:col-span-6 relative">
            <div className="rounded-[24px] sm:rounded-[40px] overflow-hidden shadow-md border border-slate-100">
              <img
                src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=600&h=480&q=80"
                alt="Soluciones financieras tecnológicas RapiCredito"
                className="w-full h-auto object-cover hover:scale-[1.02] transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
            </div>
            
            {/* Overlapping Badge */}
            <div className="relative mt-6 sm:absolute sm:mt-0 sm:-bottom-6 sm:-right-4 max-w-full sm:max-w-xs bg-white border border-slate-100 rounded-3xl p-5 shadow-lg space-y-3 z-20">
              <p className="text-slate-800 text-xs font-bold leading-relaxed">
                "¡Únete a los miles de clientes satisfechos que confían diariamente en RapiCredito para impulsar sus metas!"
              </p>
              <div className="flex items-center gap-1.5 text-accent-600 text-xs font-bold pt-2 border-t border-slate-50">
                <Icon name="CheckCircle" size={14} className="text-accent-600" />
                <span>Verificado y Seguro</span>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-6 space-y-8">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-50 text-brand-600 gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-600"></span>
              SOBRE NOSOTROS
            </span>
            
            <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-slate-900 tracking-tight leading-tight">
              Soluciones fintech especializadas para tu tranquilidad
            </h2>
            
            <p className="text-slate-500 text-sm leading-relaxed max-w-md font-medium">
              Nuestra plataforma vanguardista ofrece un proceso online sin filas ni papeleos interminables. Todo se resuelve de forma digital con los estándares más estrictos de seguridad.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                '100% online y seguro',
                '98% nivel de satisfacción',
                'Desembolso directo a tu cuenta',
                'Soporte al cliente 24/7',
              ].map((text, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <div className="h-5 w-5 rounded-full bg-accent-50 text-accent-600 flex items-center justify-center">
                    <Icon name="Check" size={12} className="text-accent-600" />
                  </div>
                  <span className="text-slate-800 text-xs font-semibold">{text}</span>
                </div>
              ))}
            </div>
            
            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-8">
              <Link
                to="/simulador"
                className="btn-primary-green font-bold px-8 py-3.5 rounded-full text-xs shadow-md transition-all"
              >
                Probar simulador
              </Link>
              
              <div className="flex gap-8">
                <div>
                  <span className="font-display font-bold text-xl text-slate-900 block">25K+</span>
                  <span className="text-slate-400 text-[10px] font-bold block mt-0.5">Clientes satisfechos</span>
                </div>
                <div>
                  <span className="font-display font-bold text-xl text-slate-900 block">15 min</span>
                  <span className="text-slate-400 text-[10px] font-bold block mt-0.5">Desembolso promedio</span>
                </div>
                <div>
                  <span className="font-display font-bold text-xl text-slate-900 block">100%</span>
                  <span className="text-slate-400 text-[10px] font-bold block mt-0.5">Firma digital</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6.5 SMART FINANCIAL SOLUTIONS ROW */}
      <section className="bg-slate-50 py-10 md:py-16 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6">
            <h2 className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl text-slate-900 tracking-tight leading-snug">
              Soluciones inteligentes y transparentes<br />para tu futuro financiero
            </h2>
          </div>
          <div className="lg:col-span-6">
            <p className="text-slate-500 text-xs sm:text-sm leading-relaxed max-w-lg font-medium">
              Somos la plataforma fintech comprometida con simplificar los préstamos en línea. Nuestro objetivo es ofrecerte una experiencia ágil, confidencial y confiable en todo momento.
            </p>
          </div>
        </div>
      </section>

      {/* 7. DYNAMIC BLOG TEASERS */}
      <section id="blog" className="py-12 md:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
        <div className="text-center space-y-4 max-w-xl mx-auto">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-50 text-brand-600 gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-600"></span>
            EDUCACIÓN Y CONSEJOS
          </span>
          <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-slate-900 tracking-tight">
            Consejos Financieros & Noticias
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
            Descubre cómo administrar tu presupuesto, elegir la mejor línea de crédito y lograr estabilidad financiera.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto font-sans">
          {blogTeasers.map((post) => (
            <article key={post.id} className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-slate-100 flex flex-col h-full hover:shadow-md hover:border-brand-100 transition-all duration-300 group">
              <div className="overflow-hidden h-48 w-full relative">
                <img
                  src={post.cover_image}
                  alt={post.title}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="p-6 flex flex-col flex-grow justify-between">
                <div>
                  <span className="text-[10px] font-bold text-brand-600 uppercase tracking-wider block mb-2">
                    {post.category}
                  </span>
                  <h3 className="font-display font-semibold text-lg text-slate-900 mb-2 leading-snug hover:text-brand-600 transition-colors line-clamp-2">
                    <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                  </h3>
                  <p className="text-slate-500 text-xs leading-relaxed mb-4 line-clamp-3 font-medium">
                    {post.excerpt}
                  </p>
                </div>
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
                  <span className="text-[10px] text-slate-400 font-medium">
                    {new Date(post.published_at!).toLocaleDateString('es-ES')}
                  </span>
                  <Link
                    to={`/blog/${post.slug}`}
                    className="text-xs font-bold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
                  >
                    Leer artículo <Icon name="ChevronRight" size={14} />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 7.5 FAQ SECTION */}
      <section className="py-12 md:py-20 bg-slate-50/50 border-t border-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center space-y-4 max-w-xl mx-auto">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-50 text-brand-600 gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-600"></span>
              PREGUNTAS FRECUENTES
            </span>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-slate-900 tracking-tight">
              ¿Tienes dudas? FAQ
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
              Encuentra las respuestas a las inquietudes más comunes sobre nuestros préstamos en línea y el proceso de desembolso.
            </p>
          </div>

          <div className="space-y-4 max-w-3xl mx-auto">
            {[
              {
                q: "¿Quién puede solicitar un préstamo en RapiCredito?",
                a: "Cualquier persona mayor de edad con ingresos regulares comprobables y una cuenta bancaria activa a su nombre."
              },
              {
                q: "¿Qué documentación se requiere para la solicitud?",
                a: "¡Eliminamos por completo el papeleo innecesario! Solo requieres tu documento de identidad vigente y un comprobante de ingresos o extracto bancario. No necesitas ir a ninguna sucursal física."
              },
              {
                q: "¿Qué tan rápido se desembolsa el préstamo aprobado?",
                a: "Una vez que completas tu solicitud y firmas el contrato digital, nuestro sistema procesa la transferencia de inmediato. El dinero suele reflejarse en tu cuenta en unos 15 minutos."
              },
              {
                q: "¿Existen cobros ocultos o comisiones extra?",
                a: "No, la plataforma RapiCredito opera con transparencia absoluta. El simulador te muestra la tasa de interés y las cuotas fijas desde antes de iniciar tu solicitud."
              },
              {
                q: "¿Puedo realizar pagos anticipados o saldar mi crédito antes?",
                a: "¡Por supuesto! Puedes realizar abonos extraordinarios o cancelar tu préstamo de forma anticipada en cualquier momento sin penalizaciones ni comisiones adicionales."
              }
            ].map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div 
                  key={idx} 
                  className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden transition-all duration-300 hover:border-brand-100"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full text-left px-6 py-5 flex justify-between items-center gap-4 hover:bg-slate-50/50 transition-colors focus:outline-none"
                  >
                    <span className="font-display font-bold text-sm sm:text-base text-slate-900 leading-snug">
                      {faq.q}
                    </span>
                    <div className={`h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-brand-600 bg-brand-50' : ''}`}>
                      <Icon name="ChevronDown" size={16} />
                    </div>
                  </button>
                  
                  {isOpen && (
                    <div className="px-6 pb-5 text-xs sm:text-sm text-slate-500 leading-relaxed font-medium animate-in fade-in slide-in-from-top-2 duration-300 border-t border-slate-50 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 8. NEWSLETTER SIGN UP */}
      <section id="contact" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="bg-slate-900 rounded-[48px] p-8 sm:p-16 text-center text-white relative overflow-hidden shadow-lg font-sans">
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/10 text-accent-500 gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-accent-500"></span>
              Boletín Informativo
            </span>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-white tracking-tight leading-tight">
              Suscríbete al boletín de RapiCredito
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              Mantente al día con los mejores consejos de finanzas personales, ofertas de tasas preferenciales y novedades financieras.
            </p>
            
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto pt-4">
              <input
                type="email"
                placeholder="Ingresa tu correo electrónico"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                required
                className="flex-grow bg-white/5 border border-white/10 rounded-full px-5 py-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500/50"
              />
              <button
                type="submit"
                className="btn-primary-green font-bold px-8 py-3.5 rounded-full text-xs transition-all shadow-md"
              >
                Suscribirse
              </button>
            </form>

            {newsletterMessage && (
              <p className="text-xs text-accent-500 mt-3 font-semibold animate-pulse">
                {newsletterMessage}
              </p>
            )}
          </div>
          
          {/* Decorative gradients */}
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-brand-600 rounded-full blur-3xl opacity-10"></div>
          <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-accent-500 rounded-full blur-3xl opacity-10"></div>
        </div>
      </section>
    </div>
  );
}
