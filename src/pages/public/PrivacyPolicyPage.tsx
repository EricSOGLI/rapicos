import React from 'react';
import Icon from '../../components/Icons';

export function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-sans space-y-8 bg-white p-6 sm:p-10 rounded-3xl border border-slate-100 mt-6 mb-12 shadow-sm animate-in fade-in duration-300">
      <div className="border-b border-slate-100 pb-6 space-y-2">
        <span className="text-xs font-bold text-accent-700 bg-accent-50 px-3 py-1 rounded-full uppercase tracking-wider inline-block">
          Conformidad RGPD
        </span>
        <h1 className="font-display font-bold text-3xl sm:text-4xl text-slate-900 tracking-tight">Política de Privacidad y RGPD</h1>
        <p className="text-xs text-slate-400">Última actualización: Julio 2026 • Versión 2.4</p>
      </div>

      <div className="text-slate-600 text-sm leading-relaxed space-y-8">
        <p className="font-medium text-slate-700">
          En <strong>RapiCredito</strong> (en adelante "RapiCredito"), valoramos profundamente tu privacidad y nos comprometemos a proteger tus datos personales conforme al Reglamento General de Protección de Datos (RGPD).
        </p>

        {/* 1. Datos que recopilamos */}
        <div className="space-y-4">
          <h3 className="font-display font-bold text-lg text-slate-900 flex items-center gap-2">
            <span className="h-6 w-6 rounded-lg bg-brand-50 text-brand-650 flex items-center justify-center font-bold text-xs">1</span>
            ¿Qué datos recopilamos y procesamos?
          </h3>
          <p>
            Para evaluar tu solvencia y aprobar tu préstamo en línea, recopilamos y procesamos las siguientes categorías de datos:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
              <span className="font-bold text-slate-950 block text-xs flex items-center gap-1.5">
                <Icon name="User" size={14} className="text-brand-600" /> Datos de identificación
              </span>
              <p className="text-[11px] text-slate-500 font-medium">
                Nombre, apellidos, número de documento de identidad oficial, fotografía del documento y selfie de validación para prevenir suplantación de identidad.
              </p>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
              <span className="font-bold text-slate-950 block text-xs flex items-center gap-1.5">
                <Icon name="Phone" size={14} className="text-brand-600" /> Datos de contacto
              </span>
              <p className="text-[11px] text-slate-500 font-medium">
                Dirección de residencia, correo electrónico y teléfono celular para el envío de contratos y notificaciones del servicio.
              </p>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
              <span className="font-bold text-slate-950 block text-xs flex items-center gap-1.5">
                <Icon name="TrendingUp" size={14} className="text-brand-600" /> Datos financieros
              </span>
              <p className="text-[11px] text-slate-500 font-medium">
                Ingresos mensuales promedio, recibos de nómina, cuenta bancaria (IBAN) e historial de transacciones para determinar la capacidad de pago.
              </p>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
              <span className="font-bold text-slate-950 block text-xs flex items-center gap-1.5">
                <Icon name="Activity" size={14} className="text-brand-600" /> Datos técnicos
              </span>
              <p className="text-[11px] text-slate-500 font-medium">
                Dirección IP, navegador, sistema operativo y cookies esenciales para garantizar la seguridad de la sesión y prevenir fraude.
              </p>
            </div>
          </div>
        </div>

        {/* 2. Finalidad */}
        <div className="space-y-4">
          <h3 className="font-display font-bold text-lg text-slate-900 flex items-center gap-2">
            <span className="h-6 w-6 rounded-lg bg-brand-50 text-brand-650 flex items-center justify-center font-bold text-xs">2</span>
            Finalidad y base legal del tratamiento
          </h3>
          <p>
            Procesamos tus datos personales de acuerdo con las siguientes bases legales:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-xs font-medium text-slate-500">
            <li><strong className="text-slate-800">Ejecución del contrato:</strong> Necesario para la evaluación, emisión y ejecución del contrato de préstamo (Art. 6.1.b RGPD).</li>
            <li><strong className="text-slate-800">Obligación legal:</strong> Cumplimiento de normativas de prevención de blanqueo de capitales y crédito al consumo (Art. 6.1.c RGPD).</li>
            <li><strong className="text-slate-800">Interés legítimo:</strong> Protección de las operaciones financieras y gestión del riesgo crediticio.</li>
            <li><strong className="text-slate-800">Consentimiento:</strong> Envío de novedades o boletines previa autorización explícita (Art. 6.1.a RGPD).</li>
          </ul>
        </div>

        {/* 3. Seguridad */}
        <div className="space-y-4">
          <h3 className="font-display font-bold text-lg text-slate-900 flex items-center gap-2">
            <span className="h-6 w-6 rounded-lg bg-brand-50 text-brand-650 flex items-center justify-center font-bold text-xs">3</span>
            Seguridad y protección de datos
          </h3>
          <p>
            Aplicamos estándares de seguridad avanzados para evitar accesos no autorizados o filtraciones:
          </p>
          <div className="bg-brand-50/40 border border-brand-100 p-5 rounded-2xl space-y-2">
            <span className="font-bold text-brand-950 block text-xs flex items-center gap-1.5">
              <Icon name="Shield" size={14} className="text-brand-600" /> Cifrado avanzado
            </span>
            <p className="text-[11px] text-slate-650 leading-relaxed font-medium">
              Toda la transmisión de datos está protegida mediante cifrado SSL/TLS de 256 bits. Los documentos se almacenan en servidores seguros dentro de la Unión Europea.
            </p>
          </div>
        </div>

        {/* 4. Derechos */}
        <div className="space-y-4">
          <h3 className="font-display font-bold text-lg text-slate-900 flex items-center gap-2">
            <span className="h-6 w-6 rounded-lg bg-brand-50 text-brand-650 flex items-center justify-center font-bold text-xs">4</span>
            Tus derechos bajo el RGPD
          </h3>
          <p>
            Puedes ejercer tus derechos de acceso, rectificación, supresión, limitación, portabilidad y oposición escribiendo a nuestro delegado de protección de datos:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-center text-xs font-bold text-slate-800">
            <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100/80">
              Derecho de acceso a los datos
            </div>
            <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100/80">
              Derecho de rectificación
            </div>
            <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100/80">
              Derecho de supresión ("olvido")*
            </div>
            <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100/80">
              Derecho a la limitación
            </div>
            <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100/80">
              Derecho a la portabilidad
            </div>
            <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100/80">
              Derecho de oposición
            </div>
          </div>
          <p className="text-[11px] text-slate-400 italic">
            *Nota: El derecho de supresión puede estar sujeto a las obligaciones legales de retención de contratos de préstamo e información tributaria.
          </p>
        </div>

        {/* 5. Conservación */}
        <div className="space-y-4">
          <h3 className="font-display font-bold text-lg text-slate-900 flex items-center gap-2">
            <span className="h-6 w-6 rounded-lg bg-brand-50 text-brand-650 flex items-center justify-center font-bold text-xs">5</span>
            Periodo de conservación
          </h3>
          <p>
            Los contratos financieros y documentos asociados se conservan durante el plazo legal obligatorio aplicable a las entidades de crédito.
          </p>
        </div>

        {/* 6. Contacto DPO */}
        <div className="space-y-4 border-t border-slate-100 pt-6">
          <h3 className="font-display font-bold text-lg text-slate-900 flex items-center gap-2">
            <span className="h-6 w-6 rounded-lg bg-brand-50 text-brand-650 flex items-center justify-center font-bold text-xs">6</span>
            Delegado de Protección de Datos (DPO)
          </h3>
          <p>
            Para cualquier consulta sobre esta Política de Privacidad, ponte en contacto con nuestro DPO:
          </p>
          <div className="flex items-center gap-2 bg-slate-50 px-4 py-3 rounded-xl border border-slate-100 w-fit">
            <Icon name="Mail" size={16} className="text-brand-600" />
            <span className="font-bold text-slate-800 text-xs">contacto@rapicreditofinance.com</span>
          </div>
        </div>
      </div>
    </div>
  );
}

