/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import Icon from '../../components/Icons';

export function LegalInfoPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-sans space-y-8 bg-white p-6 sm:p-10 rounded-3xl border border-slate-100 mt-6 mb-12 shadow-sm animate-in fade-in duration-300">
      <div className="border-b border-slate-100 pb-6 space-y-2">
        <span className="text-xs font-bold text-accent-700 bg-accent-50 px-3 py-1 rounded-full uppercase tracking-wider inline-block">
          Información legal
        </span>
        <h1 className="font-display font-bold text-3xl text-slate-900">Información Legal y Datos Corporativos</h1>
        <p className="text-xs text-slate-400">Versión: Julio 2026</p>
      </div>
      
      <div className="text-slate-600 text-sm leading-relaxed space-y-8">
        
        {/* Impressum Card */}
        <div className="space-y-4">
          <h3 className="font-display font-bold text-lg text-slate-900 flex items-center gap-2">
            <Icon name="Briefcase" size={18} className="text-brand-600" />
            Datos de la empresa (RapiCredito)
          </h3>
          <div className="bg-slate-50 border border-slate-100 p-6 rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-slate-600 font-medium">
            <div className="space-y-2">
              <p><strong className="text-slate-800">Denominación social:</strong> RapiCredito Finanzas S.L.</p>
              <p><strong className="text-slate-800">Sitio Web:</strong> rapicredito.com</p>
              <p><strong className="text-slate-800">Dirección fiscal:</strong> Paseo de la Castellana 95, Madrid, España</p>
              <p><strong className="text-slate-800">NIF / NIF-IVA:</strong> ESB-88123456</p>
            </div>
            <div className="space-y-2">
              <p><strong className="text-slate-800">Registro mercantil:</strong> Registro Mercantil de Madrid, Tomo 34500, Folio 12</p>
              <p><strong className="text-slate-800">Contacto general:</strong> contacto@rapicredito.com</p>
              <p><strong className="text-slate-800">Soporte al cliente:</strong> soporte@rapicredito.com</p>
              <p><strong className="text-slate-800">Asuntos legales:</strong> legal@rapicredito.com</p>
            </div>
          </div>
        </div>

        {/* Nadzorno Tijelo */}
        <div className="space-y-3">
          <h3 className="font-display font-bold text-lg text-slate-900 flex items-center gap-2">
            <Icon name="Shield" size={18} className="text-brand-600" />
            Supervisión y regulación
          </h3>
          <p>
            RapiCredito Finanzas S.L. ópera como intermediario de crédito digital registrado y cumple con las normativas de transparencia y protección al consumidor en operaciones de crédito en línea.
          </p>
        </div>

        {/* Podnošenje prigovora */}
        <div className="space-y-3">
          <h3 className="font-display font-bold text-lg text-slate-900 flex items-center gap-2">
            <Icon name="Mail" size={18} className="text-brand-600" />
            Atención al cliente y reclamaciones
          </h3>
          <p>
            Los usuarios pueden presentar consultas, sugerencias o reclamaciones a través de los siguientes canales:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-xs font-medium text-slate-550">
            <li>Correo electrónico: <strong className="text-slate-800">soporte@rapicredito.com</strong></li>
            <li>Dirección postal: <strong className="text-slate-800">RapiCredito Finanzas S.L., Paseo de la Castellana 95, Madrid</strong></li>
          </ul>
          <p className="text-xs text-slate-500">
            Todas las solicitudes escritas serán atendidas en un plazo máximo de 15 días hábiles.
          </p>
        </div>

        {/* Izračuni i rizici */}
        <div className="space-y-3 border-t border-slate-100 pt-6">
          <h3 className="font-display font-bold text-lg text-slate-900 flex items-center gap-2">
            <Icon name="AlertTriangle" size={18} className="text-brand-600" />
            Advertencia de riesgo y responsabilidad
          </h3>
          <p>
            Los resultados ofrecidos en nuestro simulador son ilustrativos. Las condiciones definitivas se establecen tras el análisis de la solicitud.
          </p>
          <div className="bg-amber-50/50 border border-amber-100 p-5 rounded-2xl text-xs text-slate-700 font-medium leading-relaxed">
            <strong className="text-slate-900 block mb-1">⚠️ Advertencia sobre préstamos:</strong>
            Antes de solicitar un préstamo, evalúa responsablemente tu capacidad de reembolso. El endeudamiento desproporcionado puede generar recargos e incidir negativamente en tu historial crediticio.
          </div>
        </div>
      </div>
    </div>
  );
}

