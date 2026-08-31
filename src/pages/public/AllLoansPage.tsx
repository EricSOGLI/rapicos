/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { dataService } from '../../lib/supabase';
import { LoanType } from '../../types';
import LoanCard from '../../components/LoanCard';
import Icon from '../../components/Icons';

export function AllLoansPage() {
  const [loanTypes, setLoanTypes] = useState<LoanType[]>([]);
  const [activeFilter, setActiveFilter] = useState('sve');

  useEffect(() => {
    setLoanTypes(dataService.getLoanTypes());
  }, []);

  const filteredLoans = loanTypes.filter(type => {
    if (activeFilter === 'sve') return true;
    if (activeFilter === 'hitno') {
      return type.slug.includes('emergencia') || type.slug.includes('personal') || type.slug === 'mikrokredit' || type.slug === 'osobni-kredit';
    }
    if (activeFilter === 'namjenski') {
      return !type.slug.includes('emergencia') && !type.slug.includes('personal') && type.slug !== 'mikrokredit' && type.slug !== 'osobni-kredit';
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Header and Brand Presentation */}
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <span className="text-xs font-bold text-accent-700 bg-accent-50 px-4 py-1.5 rounded-full uppercase tracking-wider inline-block">
          Oferta RapiCredito
        </span>
        <h1 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-slate-900 tracking-tight">
          Catálogo completo de préstamos digitales
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm leading-relaxed max-w-xl mx-auto">
          Compara nuestras opciones personales, vehículo, remodelación o microcréditos de emergencia y elige las condiciones que mejor se adapten a tu perfil con tramitación 100% digital.
        </p>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap justify-center gap-3 border-b border-slate-100 pb-8 max-w-3xl mx-auto">
        {[
          { id: 'sve', label: 'Todos los modelos', count: loanTypes.length },
          { id: 'hitno', label: 'Express y Personales', count: 2 },
          { id: 'namjenski', label: 'Proyectos y Vehicular', count: 4 },
        ].map((btn) => (
          <button
            key={btn.id}
            onClick={() => setActiveFilter(btn.id)}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 border ${
              activeFilter === btn.id
                ? 'bg-slate-950 border-slate-950 text-white shadow-sm'
                : 'bg-white border-slate-200 text-slate-650 hover:bg-slate-50 hover:border-slate-300'
            }`}
          >
            <span>{btn.label}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${
              activeFilter === btn.id
                ? 'bg-white/20 text-white'
                : 'bg-slate-100 text-slate-500'
            }`}>
              {btn.count}
            </span>
          </button>
        ))}
      </div>

      {/* Dynamic Loans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {filteredLoans.map((type) => (
          <LoanCard key={type.id} loanType={type} />
        ))}
      </div>

      {/* HOW IT WORKS */}
      <div className="border-t border-slate-100 pt-16 space-y-12">
        <div className="text-center space-y-3 max-w-xl mx-auto">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-50 text-brand-600 gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-600"></span>
            PROCESO RÁPIDO
          </span>
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 tracking-tight">
            ¿Cómo funciona RapiCredito?
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
            Estás a solo unos simples pasos online de obtener tu desembolso de dinero.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            {
              step: "01",
              title: "Selecciona monto y plazo",
              desc: "Usa el simulador para establecer la cantidad necesaria y la duración. Visualiza de inmediato la cuota resultante.",
              icon: "Sliders"
            },
            {
              step: "02",
              title: "Envía tu solicitud",
              desc: "Llena el formulario con tus datos y adjunta la imagen de tu documento de identidad sin complicaciones.",
              icon: "FileText"
            },
            {
              step: "03",
              title: "Recibe tu desembolso",
              desc: "Con la aprobación y tu firma virtual, el monto se acredita inmediatamente en tu cuenta bancaria.",
              icon: "Zap"
            }
          ].map((item, idx) => (
            <div key={idx} className="bg-slate-50/50 rounded-[24px] p-6 border border-slate-100 hover:border-brand-100 shadow-sm transition-all duration-300 flex flex-col justify-between min-h-[220px]">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="h-10 w-10 bg-brand-50 rounded-xl flex items-center justify-center text-brand-600">
                    <Icon name={item.icon} size={20} />
                  </div>
                  <span className="text-3xl font-display font-black text-slate-200">
                    {item.step}
                  </span>
                </div>
                <h3 className="font-display font-bold text-base text-slate-900">{item.title}</h3>
                <p className="text-slate-500 text-xs leading-relaxed font-medium">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ SECTION */}
      <div className="border-t border-slate-100 pt-16 pb-12 space-y-12">
        <div className="text-center space-y-3 max-w-xl mx-auto">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-50 text-brand-600 gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-600"></span>
            SOPORTE Y AYUDA
          </span>
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 tracking-tight">
            Preguntas frecuentes
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
            Resuelve tus dudas sobre los modelos de préstamo RapiCredito.
          </p>
        </div>

        <div className="space-y-4 max-w-3xl mx-auto">
          {[
            {
              q: "¿Quién puede solicitar un préstamo en RapiCredito?",
              a: "Personas mayores de edad con documento de identidad oficial e ingresos comprobables mediante su cuenta bancaria."
            },
            {
              q: "¿Qué documentación es necesaria?",
              a: "Documento de identidad vigente y comprobante de ingresos (nómina o extracto bancario). Sin trámites presenciales."
            },
            {
              q: "¿Cuándo se desembolsa el dinero?",
              a: "Tras la verificación de documentos y la firma del contrato digital, la transferencia se ejecuta inmediatamente."
            }
          ].map((faq, idx) => (
            <div key={idx} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-2">
              <h4 className="font-display font-bold text-sm text-slate-900 flex items-center gap-2">
                <Icon name="HelpCircle" size={16} className="text-brand-600" />
                {faq.q}
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed font-medium pl-6">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
