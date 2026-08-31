import React from 'react';
import Icon from '../../components/Icons';

export function TermsOfUsePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-sans space-y-8 bg-white p-6 sm:p-10 rounded-3xl border border-slate-100 mt-6 mb-12 shadow-sm animate-in fade-in duration-300">
      <div className="border-b border-slate-100 pb-6 space-y-2">
        <span className="text-xs font-bold text-accent-700 bg-accent-50 px-3 py-1 rounded-full uppercase tracking-wider inline-block">
          Términos de uso
        </span>
        <h1 className="font-display font-bold text-3xl text-slate-900 border-b border-slate-100 pb-4">Términos y Condiciones Generales</h1>
        <p className="text-xs text-slate-400">Última actualización: Julio 2026 • Versión 3.1</p>
      </div>

      <div className="text-slate-600 text-sm leading-relaxed space-y-6">
        <p className="font-medium text-slate-700">
          Bienvenido a <strong>RapiCredito</strong>. Al acceder y utilizar este sitio web y sus servicios digitales, aceptas estar sujeto a estos Términos y Condiciones Generales. Si no estás de acuerdo con alguna parte, por favor abstente de utilizar nuestros servicios.
        </p>

        {/* 1. Requisitos */}
        <div className="space-y-3">
          <h3 className="font-display font-bold text-lg text-slate-900 flex items-center gap-2">
            <Icon name="CheckCircle" size={18} className="text-brand-600" />
            1. Requisitos para solicitar un préstamo
          </h3>
          <p>
            Para solicitar financiación en la plataforma RapiCredito, debes cumplir los siguientes requisitos:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-xs font-medium text-slate-500">
            <li>Ser mayor de edad (mínimo 18 años).</li>
            <li>Tener residencia legal vigente.</li>
            <li>Contar con ingresos mensuales regulares demostrables (nómina, pensión o extracto bancario).</li>
            <li>Poseer una cuenta bancaria personal activa con código IBAN.</li>
          </ul>
        </div>

        {/* 2. Veracidad */}
        <div className="space-y-3">
          <h3 className="font-display font-bold text-lg text-slate-900 flex items-center gap-2">
            <Icon name="AlertTriangle" size={18} className="text-brand-600" />
            2. Veracidad de la información y responsabilidad
          </h3>
          <p>
            El usuario garantiza bajo su responsabilidad que toda la información ingresada en el simulador, formulario de solicitud y documentos adjuntos es veraz, exacta y de su exclusiva titularidad.
          </p>
          <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl text-rose-800 text-xs font-semibold">
            Cualquier intento de suplantación de identidad o falsificación documental se notificará de inmediato a las autoridades competentes.
          </div>
        </div>

        {/* 3. Simulador */}
        <div className="space-y-3">
          <h3 className="font-display font-bold text-lg text-slate-900 flex items-center gap-2">
            <Icon name="Info" size={18} className="text-brand-600" />
            3. Carácter informativo del simulador
          </h3>
          <p>
            Todos los cálculos mostrados en el simulador son de carácter meramente informativo y no constituyen una oferta vinculante. La oferta formal se genera únicamente tras la verificación de los documentos y la aprobación de la solicitud.
          </p>
        </div>

        {/* 4. Propiedad Intelectual */}
        <div className="space-y-3">
          <h3 className="font-display font-bold text-lg text-slate-900 flex items-center gap-2">
            <Icon name="FileText" size={18} className="text-brand-600" />
            4. Propiedad intelectual
          </h3>
          <p>
            Todo el contenido de la plataforma RapiCredito (textos, gráficos, logotipos, diseño de interfaz y código) es propiedad exclusiva de RapiCredito y está protegido por las leyes de propiedad intelectual.
          </p>
        </div>

        {/* 5. Legislación */}
        <div className="space-y-3 border-t border-slate-100 pt-6">
          <h3 className="font-display font-bold text-lg text-slate-900 flex items-center gap-2">
            <Icon name="HelpCircle" size={18} className="text-brand-600" />
            5. Legislación aplicable y jurisdicción
          </h3>
          <p>
            Estos términos se rigen por la legislación vigente. En caso de controversia, las partes se someterán a los juzgados y tribunales competentes.
          </p>
        </div>
      </div>
    </div>
  );
}

