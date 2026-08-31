/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { dataService, initializeApplication, SessionUser } from '../../lib/supabase';
import { LoanRequest, Contract, LoanType, LoanStatus } from '../../types';
import Icon from '../../components/Icons';
import StatusBadge from '../../components/StatusBadge';
import { calculateMonthlyPayment } from '../../lib/payment';

const getStepsForLoan = (status: LoanStatus) => {
  const steps = [
    {
      id: 1,
      name: 'Solicitud recibida',
      description: 'La solicitud fue enviada y recibida con éxito.',
      icon: 'CheckCircle',
      status: 'completed' as 'completed' | 'active' | 'upcoming' | 'error'
    },
    {
      id: 2,
      name: 'Verificación de documentos',
      description: 'Analizamos los documentos y la capacidad crediticia.',
      icon: 'FileText',
      status: 'upcoming' as 'completed' | 'active' | 'upcoming' | 'error'
    },
    {
      id: 3,
      name: 'Decisión de aprobación',
      description: 'Evaluación final para la aprobación del préstamo.',
      icon: 'ThumbsUp',
      status: 'upcoming' as 'completed' | 'active' | 'upcoming' | 'error'
    },
    {
      id: 4,
      name: 'Desembolso de fondos',
      description: 'Los fondos se transfieren a tu saldo disponible.',
      icon: 'Wallet',
      status: 'upcoming' as 'completed' | 'active' | 'upcoming' | 'error'
    }
  ];

  if (status === 'pending') {
    steps[0].status = 'active';
  } else if (status === 'under_review') {
    steps[0].status = 'completed';
    steps[1].status = 'active';
  } else if (status === 'approved') {
    steps[0].status = 'completed';
    steps[1].status = 'completed';
    steps[2].status = 'active';
  } else if (status === 'disbursed') {
    steps[0].status = 'completed';
    steps[1].status = 'completed';
    steps[2].status = 'completed';
    steps[3].status = 'completed';
  } else if (status === 'rejected') {
    steps[0].status = 'completed';
    steps[1].status = 'completed';
    steps[2].status = 'error';
    steps[2].name = 'Solicitud rechazada';
    steps[2].description = 'Lamentablemente tu solicitud no cumple con los criterios.';
    steps[2].icon = 'XCircle';
  }

  return steps;
};

export function ClientLoanDetailPage({ user }: { user: SessionUser }) {
  const { id } = useParams<{ id: string }>();
  const [request, setRequest] = useState<LoanRequest | null>(null);
  const [loanType, setLoanType] = useState<LoanType | null>(null);
  const [contracts, setContracts] = useState<{ contract: Contract }[]>([]);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const navigate = useNavigate();

  const fetchLoanData = async () => {
    if (!id) return;
    await initializeApplication();
    const req = dataService.getLoanRequestById(id);
    if (req && req.user_id === user.id) {
      setRequest(req);
      const allTypes = dataService.getLoanTypes();
      setLoanType(allTypes.find(t => t.id === req.loan_type_id) || null);
      
      const cts = dataService.getContracts(user.id);
      setContracts(cts.filter(c => c.contract.loan_request_id === id));
    } else {
      navigate('/app/prestamos');
    }
  };

  useEffect(() => {
    fetchLoanData();
  }, [id]);

  const handleSignContract = async (contractId: string) => {
    dataService.signContract(contractId);
    await fetchLoanData();
  };

  if (!request || !loanType) return <div className="text-center py-20 font-sans text-slate-500">Cargando...</div>;

  // Simple amortization schedule calculation for display
  const { monthly } = calculateMonthlyPayment(
    request.amount_requested,
    request.duration_months,
    loanType.interest_rate
  );

  const scheduleRows = [];
  let remainingPrincipal = request.amount_requested;
  const monthlyRate = (loanType.interest_rate / 100) / 12;

  for (let i = 1; i <= Math.min(6, request.duration_months); i++) {
    const interestPayment = remainingPrincipal * monthlyRate;
    const principalPayment = monthly - interestPayment;
    remainingPrincipal -= principalPayment;
    
    scheduleRows.push({
      month: i,
      monthly,
      interest: Math.max(0, Math.round(interestPayment * 100) / 100),
      principal: Math.max(0, Math.round(principalPayment * 100) / 100),
      remaining: Math.max(0, Math.round(remainingPrincipal * 100) / 100)
    });
  }

  return (
    <div className="space-y-8 pb-10 font-sans">
      <Link to="/app/prestamos" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700">
        <Icon name="ArrowLeft" size={16} /> Volver a préstamos
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Core Loan summary card with Step-by-Step progress indicator */}
        <div className="lg:col-span-8 space-y-6">
          {/* Status Tracker Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
            <h3 className="font-display font-semibold text-base text-slate-900 flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-brand-600 animate-pulse"></span>
              Estado de tramitación de la solicitud
            </h3>
            
            {/* Desktop progress timeline */}
            <div className="hidden md:flex items-start justify-between relative pt-2">
              {/* Connector line behind */}
              <div className="absolute top-7 left-[10%] right-[10%] h-0.5 bg-slate-100 -z-10" />
              {/* Active connector line */}
              <div 
                className="absolute top-7 left-[10%] h-0.5 bg-brand-500 transition-all duration-500 -z-10"
                style={{ 
                  width: request.status === 'pending' ? '0%' : 
                         request.status === 'under_review' ? '40%' : 
                         request.status === 'approved' || request.status === 'rejected' ? '80%' : 
                         request.status === 'disbursed' ? '80%' : '0%' 
                }} 
              />

              {getStepsForLoan(request.status).map((step) => {
                let circleClass = "bg-slate-50 border-2 border-slate-200 text-slate-400";
                let textClass = "text-slate-400";
                
                if (step.status === 'completed') {
                  circleClass = "bg-brand-600 border-2 border-brand-600 text-white shadow-md shadow-brand-500/20";
                  textClass = "text-slate-800 font-semibold";
                } else if (step.status === 'active') {
                  circleClass = "bg-white border-2 border-brand-500 text-brand-600 ring-4 ring-brand-50 shadow-sm";
                  textClass = "text-brand-600 font-bold";
                } else if (step.status === 'error') {
                  circleClass = "bg-rose-600 border-2 border-rose-600 text-white shadow-md shadow-rose-500/20";
                  textClass = "text-rose-600 font-bold";
                }

                return (
                  <div key={step.id} className="flex-1 flex flex-col items-center text-center px-1">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center transition-all duration-300 ${circleClass}`}>
                      {step.status === 'completed' ? (
                        <Icon name="Check" size={16} className="stroke-[3]" />
                      ) : (
                        <Icon name={step.icon} size={16} />
                      )}
                    </div>
                    <span className={`text-xs mt-3 block ${textClass}`}>{step.name}</span>
                    <span className="text-[10px] text-slate-400 mt-1 block max-w-[140px] leading-relaxed">
                      {step.description}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Mobile progress list (vertical stepper) */}
            <div className="md:hidden space-y-6 relative pl-2 before:absolute before:top-2 before:bottom-2 before:left-[1.65rem] before:w-0.5 before:bg-slate-100">
              {getStepsForLoan(request.status).map((step) => {
                let circleClass = "bg-slate-50 border-2 border-slate-200 text-slate-400";
                let textClass = "text-slate-400";
                let descClass = "text-slate-400";
                
                if (step.status === 'completed') {
                  circleClass = "bg-brand-600 border-2 border-brand-600 text-white shadow-md shadow-brand-500/20";
                  textClass = "text-slate-800 font-semibold";
                  descClass = "text-slate-500";
                } else if (step.status === 'active') {
                  circleClass = "bg-white border-2 border-brand-500 text-brand-600 ring-4 ring-brand-50 shadow-sm";
                  textClass = "text-brand-600 font-bold";
                  descClass = "text-slate-600";
                } else if (step.status === 'error') {
                  circleClass = "bg-rose-600 border-2 border-rose-600 text-white shadow-md shadow-rose-500/20";
                  textClass = "text-rose-600 font-bold";
                  descClass = "text-rose-500";
                }

                return (
                  <div key={step.id} className="flex items-start gap-4 relative z-10">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${circleClass}`}>
                      {step.status === 'completed' ? (
                        <Icon name="Check" size={16} className="stroke-[3]" />
                      ) : (
                        <Icon name={step.icon} size={16} />
                      )}
                    </div>
                    <div className="space-y-0.5 pt-1">
                      <h4 className={`text-xs ${textClass}`}>{step.name}</h4>
                      <p className={`text-[10px] leading-relaxed ${descClass}`}>{step.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-50 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-brand-50 rounded-xl flex items-center justify-center text-brand-600">
                  <Icon name={loanType.icon} size={20} />
                </div>
                <div>
                  <h2 className="font-display font-semibold text-slate-900 text-lg">{loanType.name}</h2>
                  <span className="text-[10px] text-slate-400 block font-mono mt-0.5">Código: {request.id.toUpperCase()}</span>
                </div>
              </div>
              <StatusBadge status={request.status} />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-xs">
              <div>
                <span className="text-slate-400 block mb-1">Monto solicitado:</span>
                <span className="text-base font-bold text-slate-800">{request.amount_requested.toLocaleString()} €</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Plazo de pago:</span>
                <span className="text-base font-bold text-slate-800">{request.duration_months} meses</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Tasa de interés:</span>
                <span className="text-base font-bold text-brand-600">{loanType.interest_rate}% TIN</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Cuota mensual:</span>
                <span className="text-base font-bold text-slate-800">{monthly} €</span>
              </div>
            </div>

            {request.admin_note && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
                <span className="font-bold text-slate-700 block mb-1">Nota del administrador:</span>
                <p className="text-slate-500 leading-relaxed">{request.admin_note}</p>
              </div>
            )}
          </div>

          {/* Amortization schedule preview */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-display font-bold text-base text-slate-900">Plan de pago (Primeros 6 meses)</h3>
            
            {/* Mobile Cards view */}
            <div className="space-y-3 md:hidden text-xs">
              {scheduleRows.map(row => (
                <div key={row.month} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/20 space-y-2">
                  <div className="flex justify-between items-center border-b border-slate-100/50 pb-2">
                    <span className="font-bold text-slate-800">Cuota {row.month}</span>
                    <span className="font-semibold text-slate-900">{row.monthly.toLocaleString()} €</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500">
                    <div>
                      <span className="text-slate-400 block">Interés:</span>
                      <span className="font-medium text-rose-500">{row.interest.toLocaleString()} €</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Capital:</span>
                      <span className="font-medium text-slate-700">{row.principal.toLocaleString()} €</span>
                    </div>
                    <div className="col-span-2 pt-1 border-t border-slate-100/30 flex justify-between">
                      <span className="text-slate-400">Deuda restante:</span>
                      <span className="font-mono font-medium text-slate-600">{row.remaining.toLocaleString()} €</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table view */}
            <div className="hidden md:block overflow-x-auto text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="py-2">Mes</th>
                    <th className="py-2">Cuota mensual</th>
                    <th className="py-2">Interés</th>
                    <th className="py-2">Capital</th>
                    <th className="py-2">Deuda restante</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 font-sans text-slate-600">
                  {scheduleRows.map(row => (
                    <tr key={row.month} className="hover:bg-slate-50/50">
                      <td className="py-2.5 font-bold">Cuota {row.month}</td>
                      <td className="py-2.5 font-semibold text-slate-800">{row.monthly.toLocaleString()} €</td>
                      <td className="py-2.5 text-rose-500">{row.interest.toLocaleString()} €</td>
                      <td className="py-2.5 text-slate-600">{row.principal.toLocaleString()} €</td>
                      <td className="py-2.5 font-mono">{row.remaining.toLocaleString()} €</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {request.duration_months > 6 && (
              <p className="text-[10px] text-slate-400 italic pt-2">El plan muestra solo las primeras cuotas. Puedes consultar el plan completo en el documento del contrato.</p>
            )}
          </div>
        </div>

        {/* Digital Contract Signing Widget */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-display font-bold text-base text-slate-900">Contrato de préstamo</h3>
            
            {contracts.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs">
                El contrato estará disponible una vez que el administrador apruebe la solicitud.
              </div>
            ) : (
              contracts.map(({ contract }) => (
                <div key={contract.id} className="space-y-4">
                  <div className="p-4 bg-blue-50/40 border border-blue-100 rounded-2xl flex items-start gap-3 text-xs">
                    <Icon name="FileText" className="text-brand-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-bold text-slate-800 block">Contrato_Prestamo_{request.id.substring(3, 8).toUpperCase()}.pdf</span>
                      <span className="text-[10px] text-slate-400 block mt-1">Listo para firma digital</span>
                    </div>
                  </div>

                  {/* Custom Contract clauses if defined */}
                  {contract.content && (
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-[11px] text-slate-650 font-medium leading-relaxed max-h-56 overflow-y-auto whitespace-pre-wrap font-sans space-y-3">
                      <p>{contract.content}</p>
                      
                      {contract.attachments && contract.attachments.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-200/50 space-y-2">
                          <span className="block font-bold text-slate-700 uppercase tracking-wider text-[9px]">Documentos adjuntos:</span>
                          <div className="grid grid-cols-1 gap-2">
                            {contract.attachments.map((url, i) => (
                              <img
                                key={i}
                                src={url}
                                alt={`Adjunto ${i + 1}`}
                                className="w-full h-auto rounded-xl border border-slate-100 object-cover bg-white shadow-sm"
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {contract.signed_at ? (
                    <div className="space-y-3">
                      <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-semibold flex items-center gap-2 border border-emerald-100">
                        <Icon name="CheckCircle" size={16} /> Firmado digitalmente
                      </div>
                      <span className="text-[10px] text-slate-400 block text-center">
                        Firmado el: {new Date(contract.signed_at).toLocaleString('es-ES')}
                      </span>
                      <a
                        href="#"
                        onClick={(e) => { e.preventDefault(); alert('Descargando contrato en formato PDF...'); }}
                        className="w-full block text-center border border-slate-200 hover:bg-slate-50 text-slate-650 font-semibold py-2.5 rounded-xl text-xs transition-colors"
                      >
                        Descargar contrato (PDF)
                      </a>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Read verification checkbox */}
                      <label className="flex items-start gap-2.5 cursor-pointer select-none text-[11px] font-semibold text-slate-655">
                        <input
                          type="checkbox"
                          checked={acceptedTerms}
                          onChange={(e) => setAcceptedTerms(e.target.checked)}
                          className="mt-0.5 h-4 w-4 rounded border-slate-200 text-brand-600 focus:ring-brand-500 cursor-pointer"
                        />
                        <span>Confirmo que he leído detenidamente y acepto las condiciones de este contrato.</span>
                      </label>

                      <p className="text-[10px] text-slate-400 leading-normal">
                        Por favor lee con atención las condiciones anteriores. Una vez marcada la casilla de aceptación, podrás firmar digitalmente el contrato.
                      </p>
                      <button
                        onClick={() => handleSignContract(contract.id)}
                        disabled={!acceptedTerms}
                        className={`w-full font-semibold py-3 rounded-xl text-xs transition-all shadow-sm flex items-center justify-center gap-1.5 text-white ${
                          !acceptedTerms
                            ? 'bg-slate-300 cursor-not-allowed shadow-none'
                            : 'btn-primary-green'
                        }`}
                      >
                        <Icon name="Signature" size={14} /> Firmar contrato digitalmente
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
