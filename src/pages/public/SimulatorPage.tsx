/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { dataService } from '../../lib/supabase';
import { calculateMonthlyPayment } from '../../lib/payment';
import { LoanType } from '../../types';
import Icon from '../../components/Icons';

export function SimulatorPage() {
  const [searchParams] = useSearchParams();
  const [loanTypes, setLoanTypes] = useState<LoanType[]>([]);
  const [selectedType, setSelectedType] = useState<LoanType | null>(null);
  const [amount, setAmount] = useState(10000);
  const [months, setMonths] = useState(48);

  useEffect(() => {
    const all = dataService.getLoanTypes();
    setLoanTypes(all);
    
    // Check url search parameters (e.g. ?tip=prestamo-personal)
    const urlSlug = searchParams.get('tip');
    if (urlSlug) {
      const matched = all.find(l => l.slug === urlSlug);
      if (matched) {
        setSelectedType(matched);
        return;
      }
    }
    
    // Default fallback
    if (all.length > 0) {
      setSelectedType(all[1] || all[0]);
    }
  }, [searchParams]);

  // Adjust sliders on type change
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

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 font-sans">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold text-accent-700 bg-accent-50 px-4 py-1.5 rounded-full uppercase tracking-widest inline-block">Simulator RapiCredito</span>
        <h1 className="font-display font-bold text-3xl sm:text-4xl text-slate-900 tracking-tight">Calculadora de cuota mensual</h1>
        <p className="text-slate-500 text-sm leading-relaxed">
          Ajusta los deslizadores para conocer tu cuota mensual exacta e intereses, sin tarifas ocultas ni sorpresas.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-100 shadow-xl grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        <div className="md:col-span-7 space-y-6">
          {/* Select Loan Type */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">1. Elige el tipo de préstamo</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {loanTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type)}
                  className={`py-3 px-2 text-center rounded-xl text-xs font-bold border transition-all ${
                    selectedType?.id === type.id
                      ? 'bg-brand-50 border-brand-300 text-brand-700 font-bold shadow-sm'
                      : 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  {type.slug.includes('emergencia') || type.slug === 'mikrokredit' ? 'Microcrédito' :
                   type.slug.includes('personal') || type.slug === 'osobni-kredit' ? 'Personal' :
                   type.slug.includes('hogar') || type.slug === 'stambeni-kredit' ? 'Hogar' :
                   type.slug.includes('vehiculo') || type.slug === 'auto-kredit' ? 'Vehicular' :
                   type.slug.includes('educativo') || type.slug === 'studentski-kredit' ? 'Educativo' :
                   type.slug.includes('inversion') || type.slug === 'turisticki-kredit' ? 'Libre inversión' : type.name}
                </button>
              ))}
            </div>
          </div>

          {selectedType && (
            <div className="space-y-6">
              {/* Amount slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">2. Monto del préstamo</span>
                  <span className="text-xl font-bold text-brand-600">{amount.toLocaleString()} €</span>
                </div>
                <input
                  type="range"
                  min={selectedType.min_amount}
                  max={selectedType.max_amount}
                  step={selectedType.slug.includes('emergencia') ? 100 : 500}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full h-2.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-brand-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                  <span>{selectedType.min_amount.toLocaleString()} €</span>
                  <span>{selectedType.max_amount.toLocaleString()} €</span>
                </div>
              </div>

              {/* Months Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">3. Plazo de pago</span>
                  <span className="text-xl font-bold text-slate-800">{months} meses</span>
                </div>
                <input
                  type="range"
                  min={selectedType.min_duration_months}
                  max={selectedType.max_duration_months}
                  step={selectedType.slug.includes('hogar') ? 12 : 3}
                  value={months}
                  onChange={(e) => setMonths(Number(e.target.value))}
                  className="w-full h-2.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-brand-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                  <span>{selectedType.min_duration_months} meses</span>
                  <span>{selectedType.max_duration_months} meses</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Calculation results */}
        <div className="md:col-span-5 bg-slate-50 border border-slate-100 p-6 sm:p-8 rounded-2xl flex flex-col justify-between h-full space-y-6">
          <div className="space-y-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Cálculo informativo</span>
            <div>
              <span className="text-xs text-slate-400 block font-medium">Cuota mensual:</span>
              <span className="text-4xl font-extrabold text-slate-900 font-display block mt-1">
                {monthly.toLocaleString()} €
              </span>
            </div>
            
            <div className="border-t border-slate-200/60 pt-4 space-y-2 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Monto principal:</span>
                <span className="font-semibold text-slate-800">{amount.toLocaleString()} €</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Tasa de interés anual:</span>
                <span className="font-semibold text-brand-600">{selectedType?.interest_rate}%</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Total intereses:</span>
                <span className="font-semibold text-slate-800">{totalInterest.toLocaleString()} €</span>
              </div>
              <div className="flex justify-between text-slate-600 font-bold border-t border-dashed border-slate-200 pt-2 text-sm">
                <span>Devolución total:</span>
                <span>{totalCost.toLocaleString()} €</span>
              </div>
            </div>
          </div>

          {selectedType && (
            <Link
              to={`/solicitud/${selectedType.slug}?monto=${amount}&meses=${months}`}
              className="w-full block text-center btn-primary-green font-semibold py-3 rounded-xl text-sm transition-all shadow-sm"
            >
              Continuar con la solicitud
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
