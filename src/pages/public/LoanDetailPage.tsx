/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { dataService } from '../../lib/supabase';
import { calculateMonthlyPayment } from '../../lib/payment';
import { LoanType } from '../../types';
import Icon from '../../components/Icons';

interface LoanExtendedDetails {
  subtitle: string;
  advantages: { title: string; desc: string; icon: string }[];
  requiredDocs: string[];
  faqs: { q: string; a: string }[];
  useCases: string[];
}

const EXTENDED_DETAILS: Record<string, LoanExtendedDetails> = {
  'microcredito-express': {
    subtitle: "Solución de emergencia para imprevistos con desembolso directo en 15 minutos.",
    advantages: [
      { title: "Procesamiento ultrarrápido", desc: "Aprobación y desembolso en solo 15 minutos.", icon: "Zap" },
      { title: "Documentación mínima", desc: "Solo necesitas tu documento de identidad y comprobante básico.", icon: "FileText" },
      { title: "Sin avales", desc: "No requieres de fiador ni codeudor para la aprobación.", icon: "Shield" },
      { title: "Totalmente transparente", desc: "Tasa de interés fija sin cobros ni comisiones ocultas.", icon: "Eye" }
    ],
    requiredDocs: [
      "Documento de identidad oficial vigente (ambas caras)",
      "Cuenta bancaria personal activa para la transferencia inmediata",
      "Comprobante o extracto bancario reciente como respaldo de ingresos"
    ],
    useCases: [
      "Reparaciones urgentes en el hogar o vehículo",
      "Gastos médicos o medicamentos imprevistos",
      "Pago de servicios o recibos pendientes antes del cobro de nómina"
    ],
    faqs: [
      { q: "¿Puedo pagar mi microcrédito antes del plazo?", a: "¡Sí! El pago anticipado es completamente gratuito y sin penalizaciones." },
      { q: "¿Qué sucede si me retraso en un pago?", a: "Te recomendamos contactarnos a través de tu portal de cliente para acordar una extensión o reestructuración." }
    ]
  },
  'prestamo-personal': {
    subtitle: "Préstamo de libre inversión flexible para realizar cualquier proyecto personal.",
    advantages: [
      { title: "Libre destino", desc: "Utiliza el dinero para lo que necesites sin justificar gastos.", icon: "Sliders" },
      { title: "Consolidación de deudas", desc: "Ideal para unificar deudas de tarjetas de crédito con menor tasa.", icon: "CheckSquare" },
      { title: "Cuota mensual fija", desc: "El mismo monto de cuota durante todo el periodo de reembolso.", icon: "Calendar" },
      { title: "Financiación hasta 25.000 €", desc: "Cubre proyectos de mayor envergadura con facilidad.", icon: "TrendingUp" }
    ],
    requiredDocs: [
      "Documento de identidad vigente",
      "Últimos 3 recibos de nómina o comprobantes de ingresos",
      "Extracto bancario de los últimos 3 meses en PDF"
    ],
    useCases: [
      "Consolidación de deudas y tarjetas de crédito",
      "Renovación o equipamiento de tu hogar",
      "Viajes familiares, celebraciones o compras de tecnología"
    ],
    faqs: [
      { q: "¿Cuál es la diferencia entre la tasa nominal y la tasa efectiva?", a: "La tasa nominal es la tasa base de interés y la efectiva incluye costos adicionales. En RapiCredito no cobramos comisión de apertura." },
      { q: "¿Puedo solicitarlo si tengo contrato temporal?", a: "Sí, siempre que la duración de tu contrato cubra la vigencia del préstamo o según evaluación de riesgo." }
    ]
  },
  'credito-hogar': {
    subtitle: "Financiación a largo plazo para compra, reforma o remodelación completa de tu vivienda.",
    advantages: [
      { title: "Tasa preferencial", desc: "Tasa de interés desde 3.25% fija para tranquilidad familiar.", icon: "TrendingDown" },
      { title: "Amplios plazos", desc: "Hasta 120 meses para pagar cómodamente.", icon: "Clock" },
      { title: "Asesoría personalizada", desc: "Un asesor te acompañará en cada paso del proceso.", icon: "Users" },
      { title: "Evaluación ágil", desc: "Proceso digital rápido comparado con la banca tradicional.", icon: "Smile" }
    ],
    requiredDocs: [
      "Documento de identidad del solicitante",
      "Certificado laboral e ingresos comprobables",
      "Presupuesto de obras o documento de la propiedad a intervenir"
    ],
    useCases: [
      "Remodelación integral y mejoras de eficiencia energética",
      "Compra de vivienda o terreno",
      "Ampliación o terminación de obras"
    ],
    faqs: [
      { q: "¿Es obligatoria una hipoteca?", a: "Para montos menores de reforma no se requiere hipoteca. Para compra de vivienda sí es necesaria la garantía real." },
      { q: "¿La tasa de interés puede subir?", a: "No, la tasa se mantiene fija al 3.25% durante todo el plazo de reembolso." }
    ]
  },
  'credito-vehicular': {
    subtitle: "Conduce tu coche nuevo o usado con la financiación más rápida y flexible.",
    advantages: [
      { title: "Para todo tipo de vehículo", desc: "Financiamos automóviles nuevos, usados, motos o vehículos de trabajo.", icon: "Car" },
      { title: "Sin seguro obligatorio costoso", desc: "No exigimos condicionados de seguro todo riesgo para montos bajos.", icon: "CheckCircle" },
      { title: "Tasa fija preferencial", desc: "Tasa desde 4.25% fija para conducir con tranquilidad.", icon: "Lock" },
      { title: "Plazo hasta 7 años", desc: "Ajusta la cuota mensual a tu presupuesto con hasta 84 meses.", icon: "Calendar" }
    ],
    requiredDocs: [
      "Documento de identidad y permiso de conducción",
      "Últimos 3 recibos de ingresos",
      "Proforma o contrato de compraventa del vehículo"
    ],
    useCases: [
      "Compra de vehículo nuevo en concesionario",
      "Adquisición de coche usado a particular o profesional",
      "Financiación de motocicleta o scooter"
    ],
    faqs: [
      { q: "¿Debo comprar el coche solo en concesionarios autorizados?", a: "No, puedes comprarlo a particulares o comercios con contrato de compraventa válido." },
      { q: "¿A quién se realiza el pago?", a: "El desembolso se realiza directamente a la cuenta acordada previa verificación." }
    ]
  },
  'credito-educativo': {
    subtitle: "Invierte en tu educación y futuro profesional con tasas reducidas y periodo de gracia.",
    advantages: [
      { title: "Tasa especial reducida", desc: "Solo 2.99% de interés adaptado al presupuesto estudiantil.", icon: "Percent" },
      { title: "Periodo de gracia", desc: "Opción de pagar solo intereses mientras completas tus estudios.", icon: "Coffee" },
      { title: "Todas tus necesidades", desc: "Cubre matrículas, alojamiento, equipos o material académico.", icon: "BookOpen" },
      { title: "Trámite 100% online", desc: "Solicita sin desplazarte a ninguna oficina.", icon: "Monitor" }
    ],
    requiredDocs: [
      "Documento de identidad del estudiante",
      "Matrícula o resguardo de inscripción universitaria",
      "Comprobante de ingresos de avalista (padres o tutores si aplica)"
    ],
    useCases: [
      "Pago de matrículas universitarias o posgrados",
      "Alojamiento y gastos de manutención académica",
      "Equipamiento tecnológico (portátiles, licencias, herramientas)"
    ],
    faqs: [
      { q: "¿Quién puede actuar como avalista?", a: "Padres, tutores o cualquier familiar con ingresos regulares." },
      { q: "¿Aplica para estudios en el extranjero?", a: "Sí, cubre instituciones acreditadas a nivel internacional." }
    ]
  },
  'credito-libre-inversion': {
    subtitle: "Desarrolla tus metas personales con desembolso rápido y cuotas adaptadas.",
    advantages: [
      { title: "Disponibilidad inmediata", desc: "Aprobación rápida sin trámites innecesarios.", icon: "Palmtree" },
      { title: "Gestión flexible", desc: "Elige las fechas de pago que mejor convengan a tu flujo de ingresos.", icon: "Umbrella" },
      { title: "Desembolso directo", desc: "Recibe los fondos directamente en tu cuenta bancaria.", icon: "Zap" },
      { title: "Control total", desc: "Monitorea tu plan de pagos en tiempo real desde la plataforma.", icon: "Award" }
    ],
    requiredDocs: [
      "Documento de identidad oficial",
      "Comprobante de ingresos periódicos",
      "Extracto bancario de tu cuenta principal"
    ],
    useCases: [
      "Inversión en emprendimientos o proyectos personales",
      "Compra de equipamiento profesional o personal",
      "Viajes y experiencias"
    ],
    faqs: [
      { q: "¿Puedo realizar pagos parciales anticipados?", a: "Sí, puedes realizar abonos a capital en cualquier momento sin recargos." },
      { q: "¿Cómo monitoreo mis pagos?", a: "Desde tu panel de usuario de RapiCredito podrás revisar tu historial de cuotas y fechas de vencimiento." }
    ]
  }
};

export function LoanDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [loanType, setLoanType] = useState<LoanType | null>(null);
  const navigate = useNavigate();

  // Interactive calculator states
  const [calcAmount, setCalcAmount] = useState<number>(5000);
  const [calcMonths, setCalcMonths] = useState<number>(24);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  useEffect(() => {
    if (slug) {
      const found = dataService.getLoanTypeBySlug(slug);
      if (found) {
        setLoanType(found);
        // Set realistic initial values based on actual limit boundaries
        const middleAmount = Math.round((found.min_amount + found.max_amount) / 2);
        const stepAmount = Math.round(middleAmount / 500) * 500;
        setCalcAmount(Math.min(found.max_amount, Math.max(found.min_amount, stepAmount)));
        setCalcMonths(Math.min(found.max_duration_months, Math.max(found.min_duration_months, found.min_duration_months + 12)));
      } else {
        navigate('/prestamos');
      }
    }
  }, [slug, navigate]);

  if (!loanType) return <div className="text-center py-20 font-sans text-slate-500">Cargando...</div>;

  const ext = EXTENDED_DETAILS[loanType.slug] || {
    subtitle: "Financiación segura y transparente adaptada a tus necesidades actuales.",
    advantages: [
      { title: "Realización rápida", desc: "Proceso de solicitud sencillo y respuesta el mismo día.", icon: "Zap" },
      { title: "Condiciones claras", desc: "Tasas competitivas sin gastos administrativos ocultos.", icon: "TrendingDown" }
    ],
    requiredDocs: [
      "Documento de identidad del solicitante",
      "Comprobante de ingresos mensuales (recibo de nómina o extracto)"
    ],
    useCases: [
      "Cubrir imprevistos cotidianos",
      "Proyectos personales o crecimiento"
    ],
    faqs: [
      { q: "¿Cómo se efectúa el desembolso?", a: "Una vez firmado digitalmente el contrato, el dinero se transfiere de inmediato a tu cuenta bancaria." },
      { q: "¿Puedo solicitar más de un préstamo?", a: "Según tu capacidad de endeudamiento e ingresos, es posible contar con una operación activa o solicitar refinanciación." }
    ]
  };

  // Perform dynamic calculations using the helper
  const calcResult = calculateMonthlyPayment(calcAmount, calcMonths, loanType.interest_rate);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 font-sans">
      {/* Navigation Breadcrumb */}
      <Link to="/prestamos" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors">
        <Icon name="ArrowLeft" size={16} /> Volver a todos los préstamos
      </Link>

      {/* Hero Header Presentation */}
      <div className="relative rounded-3xl overflow-hidden shadow-lg border border-slate-100 bg-slate-900 text-white">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-transparent z-10" />
        <img
          src={loanType.image_url || 'https://images.unsplash.com/photo-1434626881859-194d67b2b86f?auto=format&fit=crop&w=1200&q=80'}
          alt={loanType.name}
          className="absolute inset-0 w-full h-full object-cover object-center opacity-40"
          referrerPolicy="no-referrer"
        />
        <div className="relative z-20 p-8 sm:p-12 lg:p-16 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 bg-brand-500/20 text-brand-300 border border-brand-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <Icon name={loanType.icon} size={14} /> modelo RapiCredito
          </div>
          <h1 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-white leading-tight">
            {loanType.name}
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            {ext.subtitle}
          </p>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Extensive specifications */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Detailed description and overview */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-4">
            <h2 className="font-display font-semibold text-xl text-slate-950">Descripción y finalidad</h2>
            <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
              {loanType.description} Nuestra plataforma ofrece una experiencia totalmente digital, sin desplazamientos a oficinas, garantizando la máxima transparencia.
            </p>
          </div>

          {/* Advantages Cards */}
          <div className="space-y-4">
            <h2 className="font-display font-semibold text-xl text-slate-950 px-1">Ventajas principales</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {ext.advantages.map((adv, index) => (
                <div key={index} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex gap-4 items-start hover:border-brand-100 hover:shadow-md transition-all">
                  <div className="p-2.5 rounded-xl bg-brand-50 text-brand-600">
                    <Icon name={adv.icon} size={20} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-slate-900 text-sm">{adv.title}</h3>
                    <p className="text-slate-500 text-xs leading-relaxed">{adv.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Core loan parameters information box */}
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-6 border border-slate-200/50 space-y-4">
            <h3 className="font-display font-semibold text-base text-slate-900">Rangos de financiación</h3>
            <div className="grid grid-cols-3 gap-4 text-center divide-x divide-slate-200">
              <div className="px-1">
                <span className="text-[10px] text-slate-400 block uppercase tracking-wider mb-1">Monto</span>
                <span className="text-slate-800 font-extrabold text-xs sm:text-sm">
                  {loanType.min_amount.toLocaleString()} - {loanType.max_amount.toLocaleString()} €
                </span>
              </div>
              <div className="px-1">
                <span className="text-[10px] text-slate-400 block uppercase tracking-wider mb-1">Tasa anual (TIN)</span>
                <span className="text-brand-600 font-extrabold text-xs sm:text-sm">
                  {loanType.interest_rate}% fija
                </span>
              </div>
              <div className="px-1">
                <span className="text-[10px] text-slate-400 block uppercase tracking-wider mb-1">Plazo</span>
                <span className="text-slate-800 font-extrabold text-xs sm:text-sm">
                  {loanType.min_duration_months} - {loanType.max_duration_months} meses
                </span>
              </div>
            </div>
          </div>

          {/* Use cases bullet highlights */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
            <h2 className="font-display font-semibold text-lg text-slate-900">Casos de uso frecuentes:</h2>
            <div className="grid grid-cols-1 gap-2.5">
              {ext.useCases.map((use, index) => (
                <div key={index} className="flex items-center gap-3 text-slate-600 text-sm">
                  <div className="h-5 w-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                    <Icon name="Check" size={12} className="stroke-[3]" />
                  </div>
                  <span>{use}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Required documents check-list */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                <Icon name="FileText" size={20} />
              </div>
              <div>
                <h2 className="font-display font-semibold text-lg text-slate-900">Documentación requerida</h2>
                <p className="text-xs text-slate-400">Ten a mano estos documentos para acelerar la aprobación</p>
              </div>
            </div>
            <div className="space-y-3">
              {ext.requiredDocs.map((doc, idx) => (
                <div key={idx} className="flex gap-3 items-start text-xs sm:text-sm text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <Icon name="CheckCircle" size={18} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span>{doc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Custom collapsible FAQ accordions */}
          <div className="space-y-4">
            <h2 className="font-display font-semibold text-xl text-slate-950 px-1">Preguntas frecuentes</h2>
            <div className="space-y-2">
              {ext.faqs.map((faq, index) => {
                const isOpen = activeFaq === index;
                return (
                  <div key={index} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden transition-all duration-300">
                    <button
                      onClick={() => setActiveFaq(isOpen ? null : index)}
                      className="w-full text-left p-5 flex justify-between items-center gap-4 hover:bg-slate-50/50 transition-colors"
                    >
                      <span className="font-semibold text-slate-800 text-sm sm:text-base">{faq.q}</span>
                      <span className={`transform transition-transform text-slate-400 ${isOpen ? 'rotate-180' : ''}`}>
                        <Icon name="ChevronDown" size={20} />
                      </span>
                    </button>
                    {isOpen && (
                      <div className="p-5 pt-0 border-t border-slate-50 text-xs sm:text-sm text-slate-500 leading-relaxed bg-slate-50/30">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Column (Sticky on Desktop): Interactive Calculator Widget */}
        <div className="lg:col-span-5 lg:sticky lg:top-6 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-100 shadow-md shadow-brand-500/5 space-y-6">
            <div className="space-y-1">
              <h2 className="font-display font-bold text-xl text-slate-950">Calcula tu cuota</h2>
              <p className="text-xs text-slate-400">Ajusta los parámetros para ver el desglose en tiempo real</p>
            </div>

            {/* Interactive Sliders */}
            <div className="space-y-6">
              {/* Range Amount */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-500">Monto:</span>
                  <span className="text-brand-600 font-bold text-sm bg-brand-50 px-2.5 py-0.5 rounded-full">{calcAmount.toLocaleString()} €</span>
                </div>
                <input
                  type="range"
                  min={loanType.min_amount}
                  max={loanType.max_amount}
                  step={loanType.slug.includes('emergencia') ? 100 : 500}
                  value={calcAmount}
                  onChange={(e) => setCalcAmount(Number(e.target.value))}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-brand-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>{loanType.min_amount.toLocaleString()} €</span>
                  <span>{loanType.max_amount.toLocaleString()} €</span>
                </div>
              </div>

              {/* Range Duration */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-500">Plazo de pago:</span>
                  <span className="text-brand-600 font-bold text-sm bg-brand-50 px-2.5 py-0.5 rounded-full">{calcMonths} meses</span>
                </div>
                <input
                  type="range"
                  min={loanType.min_duration_months}
                  max={loanType.max_duration_months}
                  step={loanType.slug.includes('emergencia') ? 1 : 6}
                  value={calcMonths}
                  onChange={(e) => setCalcMonths(Number(e.target.value))}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-brand-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>{loanType.min_duration_months} meses</span>
                  <span>{loanType.max_duration_months} meses</span>
                </div>
              </div>
            </div>

            {/* Calculations Panel */}
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-slate-500">Cuota mensual estimada:</span>
                <span className="text-2xl font-extrabold text-brand-600">
                  {calcResult.monthly.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                </span>
              </div>
              
              <div className="border-t border-slate-200/60 pt-3 space-y-2 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Tasa anual:</span>
                  <span className="font-semibold text-slate-800">{loanType.interest_rate}% TIN</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Total a devolver:</span>
                  <span className="font-semibold text-slate-800">{calcResult.totalCost.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Total intereses:</span>
                  <span className="font-semibold text-slate-800">{calcResult.totalInterest.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Comisión de estudio:</span>
                  <span className="font-bold text-emerald-600 uppercase">0 € (Gratis)</span>
                </div>
              </div>
            </div>

            {/* Action CTAs */}
            <div className="flex flex-col gap-2">
              <Link
                to={`/solicitud/${loanType.slug}?monto=${calcAmount}&meses=${calcMonths}`}
                className="w-full text-center block btn-primary-green font-bold py-3.5 rounded-xl text-sm transition-all shadow-md active:scale-[0.98]"
              >
                Solicitar con este cálculo
              </Link>
              
              <Link
                to={`/simulador?tip=${loanType.slug}&monto=${calcAmount}&meses=${calcMonths}`}
                className="w-full text-center block bg-slate-50 hover:bg-slate-100 text-slate-600 font-semibold py-3 rounded-xl text-xs sm:text-sm transition-all"
              >
                Abrir en el simulador avanzado
              </Link>
            </div>
          </div>

          {/* Secure process note badge */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex gap-3 items-start">
            <Icon name="Lock" size={18} className="text-emerald-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-slate-800">Seguridad y confidencialidad</h4>
              <p className="text-[10px] text-slate-500 leading-relaxed">Tus datos están protegidos con cifrado de grado bancario SSL y normativas de privacidad RGPD.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
