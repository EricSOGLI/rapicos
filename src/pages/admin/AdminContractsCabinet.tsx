/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { dataService, initializeApplication } from '../../lib/supabase';
import { Contract } from '../../types';
import Icon from '../../components/Icons';
import ResponsiveTable, { TableColumn } from '../../components/ResponsiveTable';

export function AdminContractsCabinet() {
  const [contracts, setContracts] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<{ contract: Contract; loanRequest: any; loanType: any } | null>(null);
  
  // Modal Preview state
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  // Editor States
  const [contractContent, setContractContent] = useState('');
  const [attachments, setAttachments] = useState<string[]>([]);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [msg, setMsg] = useState('');

  const refreshContracts = () => {
    setContracts(dataService.getContracts());
  };

  useEffect(() => {
    const fetchContracts = async () => {
      await initializeApplication();
      refreshContracts();
    };
    fetchContracts();
  }, []);

  const handleSelectContract = (item: any) => {
    setSelectedItem(item);
    
    // Default standard contract clauses template if empty
    const defaultText = item.contract.content || 
`CONTRATO DE PRÉSTAMO Y CONDICIONES GENERALES
RapiCredito Servicios Financieros Digitales S.L.

1. PARTES CONTRATANTES
PRESTAMISTA: RapiCredito Digital S.L., con CIF B-88741209 y domicilio social en España.
PRESTATARIO: ${item.loanRequest?.user?.name || 'Cliente RapiCredito'}, con NIF/NIE/DNI indicado en el registro y cuenta bancaria verificada.

2. OBJETO DEL PRÉSTAMO
El Prestamista concede al Prestatario un préstamo personal y exclusivo por el importe de ${item.loanRequest?.amount_requested || 0} € (Euros), para la modalidad "${item.loanType?.name || 'Crédito Digital'}", amortizable en un plazo de ${item.loanRequest?.duration_months || 12} mensualidades consecutivas.

3. TIPO DE INTERÉS Y CONDICIONES ECONÓMICAS
- Tipo de Interés Nominal (TIN): ${item.loanType?.interest_rate || 5.0}% anual fijo.
- Tasa Anual Equivalente (TAE): Calculada y fija durante toda la vigencia del contrato.
- Comisión de estudio o apertura: 0,00 € (Exenta).

4. AMORTIZACIÓN Y FORMA DE PAGO
Las cuotas mensuales serán debitadas en las fechas pactadas a través de domiciliación bancaria o transferencia directa.

5. POLÍTICA DE PRIVACIDAD Y LEY APLICABLE
El presente contrato se rige por la legislación aplicable en materia de crédito al consumo y protección de datos (RGPD).`;

    setContractContent(defaultText);
    setAttachments(item.contract.attachments || []);
    setMsg('');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    dataService.updateContract(selectedItem.contract.id, contractContent, attachments);
    setMsg('¡El contrato ha sido guardado y actualizado con éxito!');
    refreshContracts();
    setTimeout(() => setMsg(''), 3000);
  };

  const handleSendToClient = () => {
    if (!selectedItem) return;
    dataService.updateContract(selectedItem.contract.id, contractContent, attachments, 'sent');
    setMsg('¡El contrato ha sido validado y enviado al cliente con éxito!');
    refreshContracts();
    setTimeout(() => {
      setMsg('');
      setSelectedItem(null);
    }, 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsUploadingFile(true);
    const file = e.target.files[0];

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setAttachments(prev => [...prev, base64String]);
      setIsUploadingFile(false);
      e.target.value = '';
    };
    reader.onerror = () => {
      alert("Error al leer el archivo. Inténtalo con otro documento.");
      setIsUploadingFile(false);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAttachment = (idx: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== idx));
  };

  const isPdfData = (url: string) => {
    return url.startsWith('data:application/pdf') || url.toLowerCase().includes('.pdf');
  };

  const handlePrintOrDownloadPDF = () => {
    window.print();
  };

  const columns: TableColumn<any>[] = [
    {
      header: 'ID de Contrato',
      render: ({ contract }) => (
        <div className="space-y-0.5">
          <span className="font-mono text-slate-800 font-bold text-xs">{contract.id.slice(0, 8).toUpperCase()}</span>
          <span className={`block text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full w-max ${
            contract.signed_at 
              ? 'bg-emerald-100 text-emerald-800' 
              : contract.status === 'sent'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-amber-100 text-amber-800'
          }`}>
            {contract.signed_at ? '✓ Firmado' : contract.status === 'sent' ? 'Enviado' : 'Borrador'}
          </span>
        </div>
      )
    },
    {
      header: 'Cliente & Préstamo',
      render: ({ loanRequest, loanType }) => (
        <div>
          <span className="font-bold text-slate-900 block text-xs">
            {loanType?.name || 'Préstamo'}
          </span>
          <span className="text-slate-500 text-[11px] font-semibold">
            {loanRequest?.amount_requested?.toLocaleString('es-ES')} € • {loanRequest?.duration_months} meses
          </span>
        </div>
      )
    },
    {
      header: 'Documentos',
      render: ({ contract }) => (
        <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
          <Icon name="Paperclip" size={13} className="text-indigo-600" />
          <span>{contract.attachments?.length || 0} anexo(s)</span>
        </span>
      )
    },
    {
      header: 'Fecha Firma',
      render: ({ contract }) => (
        <span>
          {contract.signed_at ? (
            <span className="text-emerald-700 font-bold text-xs">
              {new Date(contract.signed_at).toLocaleDateString('es-ES')}
            </span>
          ) : (
            <span className="text-amber-600 font-semibold text-xs">Pendiente</span>
          )}
        </span>
      )
    },
    {
      header: 'Gestión',
      className: 'text-right',
      render: (item) => (
        <div className="flex justify-end gap-2">
          <button
            onClick={() => handleSelectContract(item)}
            className="btn-primary-purple px-3 py-1.5 rounded-xl font-bold text-xs shadow-sm flex items-center gap-1 cursor-pointer"
          >
            <Icon name="Edit3" size={13} />
            <span>Editar y Validar</span>
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 sm:space-y-8 pb-10 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 leading-tight">
            Gestión y Validación de Contratos
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Revisa, modifica, adjunta PDFs o contratos externos y valida los documentos antes del envío final al cliente.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        
        {/* Table of Contracts */}
        <div className={selectedItem ? "lg:col-span-6" : "lg:col-span-12"}>
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-sm space-y-4">
            <h2 className="font-display font-bold text-base text-slate-900 flex items-center justify-between">
              <span>Listado de Contratos</span>
              <span className="text-xs font-normal text-slate-400">{contracts.length} total</span>
            </h2>
            <ResponsiveTable
              columns={columns}
              data={contracts}
              keyExtractor={({ contract }) => contract.id}
              emptyMessage="Actualmente no hay contratos generados en el sistema."
            />
          </div>
        </div>

        {/* Contract Editor & Attachment Panel */}
        {selectedItem && (
          <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-md space-y-6 animate-in fade-in duration-200">
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-bold text-base text-slate-900">
                    Editor de Contrato Oficial
                  </h3>
                  <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-extrabold uppercase tracking-wider ${
                    selectedItem.contract.signed_at 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : selectedItem.contract.status === 'sent'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                  }`}>
                    {selectedItem.contract.signed_at ? 'Firmado' : selectedItem.contract.status === 'sent' ? 'Enviado al Cliente' : 'Borrador Editable'}
                  </span>
                </div>
                <span className="font-mono text-[10px] text-slate-400 block mt-0.5">
                  Contrato ID: {selectedItem.contract.id.toUpperCase()} • Préstamo: {selectedItem.loanRequest?.amount_requested} €
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPreviewModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 font-bold text-xs hover:bg-indigo-100 flex items-center gap-1 transition-colors cursor-pointer"
                  title="Vista Previa de Impresión"
                >
                  <Icon name="Eye" size={14} />
                  <span>Aperçu</span>
                </button>
                <button 
                  onClick={() => setSelectedItem(null)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
                >
                  <Icon name="X" size={18} />
                </button>
              </div>
            </div>

            {selectedItem.contract.signed_at && (
              <div className="p-3.5 bg-emerald-50 text-emerald-900 rounded-2xl text-xs font-semibold flex items-center gap-2.5 border border-emerald-200">
                <Icon name="CheckCircle" size={18} className="text-emerald-600 shrink-0" />
                <span>Este contrato ya ha sido firmado digitalmente por el cliente el {new Date(selectedItem.contract.signed_at).toLocaleDateString('es-ES')}.</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-5 text-xs font-semibold text-slate-600">
              
              {/* Contract Text Clauses Editor */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="block text-slate-700 font-bold">Cláusulas y Términos del Contrato</label>
                  <span className="text-[10px] text-slate-400 font-normal">Totalmente editable por el administrador</span>
                </div>
                <textarea
                  value={contractContent}
                  onChange={(e) => setContractContent(e.target.value)}
                  disabled={!!selectedItem.contract.signed_at}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-mono leading-relaxed focus:outline-none focus:border-indigo-600 focus:bg-white h-72 text-slate-800 disabled:opacity-75 disabled:cursor-not-allowed transition-all"
                  placeholder="Escribe o modifica las cláusulas del contrato..."
                />
              </div>

              {/* Attachments Section: Custom PDF, Scans or Images */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex justify-between items-center">
                  <label className="block text-slate-700 font-bold">
                    Documentos Anexos, PDFs & Contratos Externos ({attachments.length})
                  </label>
                  <span className="text-[10px] text-indigo-600 font-bold">PDF, PNG, JPG</span>
                </div>
                
                {/* List of Attached Documents */}
                {attachments.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {attachments.map((docUrl, idx) => {
                      const isPdf = isPdfData(docUrl);
                      return (
                        <div key={idx} className="relative group rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 p-3 flex items-center justify-between gap-2 hover:border-indigo-300 transition-all">
                          <div className="flex items-center gap-2.5 overflow-hidden">
                            <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${
                              isPdf ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'
                            }`}>
                              <Icon name={isPdf ? 'FileText' : 'Image'} size={18} />
                            </div>
                            <div className="truncate">
                              <span className="text-xs font-bold text-slate-800 block truncate">
                                {isPdf ? `Documento PDF #${idx + 1}` : `Anexo Imagen #${idx + 1}`}
                              </span>
                              <a
                                href={docUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[10px] text-indigo-600 hover:underline font-semibold"
                              >
                                Ver / Descargar
                              </a>
                            </div>
                          </div>

                          {!selectedItem.contract.signed_at && (
                            <button
                              type="button"
                              onClick={() => handleRemoveAttachment(idx)}
                              className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-lg transition-colors cursor-pointer"
                              title="Eliminar documento"
                            >
                              <Icon name="Trash" size={13} />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Upload New Custom PDF or Image Attachment */}
                {!selectedItem.contract.signed_at && (
                  <div className="border-2 border-dashed border-slate-200 hover:border-indigo-500 rounded-2xl p-4 text-center transition-all relative bg-slate-50/50 hover:bg-indigo-50/20">
                    <input
                      type="file"
                      accept="application/pdf,image/*"
                      onChange={handleFileUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={isUploadingFile}
                    />
                    <div className="space-y-1">
                      <div className="h-9 w-9 bg-white shadow-sm rounded-xl flex items-center justify-center mx-auto text-indigo-600">
                        <Icon name="UploadCloud" size={20} />
                      </div>
                      <div className="text-xs font-bold text-slate-700">
                        {isUploadingFile ? 'Cargando documento...' : 'Subir Documento PDF o Imagen (Contrato Personalizado / Anexos)'}
                      </div>
                      <p className="text-[10px] text-slate-400 font-normal">
                        Haz clic para seleccionar o arrastra un archivo PDF o imagen desde tu ordenador
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {msg && (
                <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-center text-xs font-bold animate-in fade-in">
                  {msg}
                </div>
              )}

              {/* Actions Footer */}
              <div className="flex flex-col sm:flex-row gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-600 py-3 rounded-xl font-bold transition-colors text-center cursor-pointer"
                >
                  Cerrar
                </button>
                
                {!selectedItem.contract.signed_at && (
                  <>
                    <button
                      type="submit"
                      className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 py-3 rounded-xl font-bold transition-colors shadow-sm cursor-pointer"
                    >
                      Guardar Borrador
                    </button>
                    <button
                      type="button"
                      onClick={handleSendToClient}
                      className="flex-1 btn-primary-purple py-3 rounded-xl font-bold transition-all shadow-md shadow-indigo-500/20 text-center cursor-pointer"
                    >
                      Validar y Enviar al Cliente →
                    </button>
                  </>
                )}
              </div>

            </form>
          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* FULL CONTRACT PREVIEW & PRINT MODAL */}
      {/* ========================================================================= */}
      {isPreviewModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-10 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-6 relative">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-4 print:hidden">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                  <Icon name="FileText" size={20} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-slate-900">
                    Vista Oficial del Contrato de Crédito
                  </h3>
                  <span className="text-xs text-slate-400">RapiCredito Servicios Financieros</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintOrDownloadPDF}
                  className="btn-primary-purple px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Icon name="Printer" size={15} />
                  <span>Imprimir / Guardar PDF</span>
                </button>
                <button
                  onClick={() => setIsPreviewModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                >
                  <Icon name="X" size={20} />
                </button>
              </div>
            </div>

            {/* Official Printable Contract Sheet */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 text-slate-800 font-sans">
              
              <div className="flex justify-between items-start border-b border-slate-200 pb-4">
                <div>
                  <h2 className="font-display font-extrabold text-xl text-indigo-900">RAPICREDITO DIGITAL</h2>
                  <span className="text-xs text-slate-500 block">Plataforma Financiera 100% Digital</span>
                </div>
                <div className="text-right font-mono text-xs text-slate-500">
                  <span>N° Contrato: {selectedItem.contract.id.slice(0, 12).toUpperCase()}</span>
                  <span className="block text-[11px] text-slate-400">Fecha: {new Date(selectedItem.contract.created_at).toLocaleDateString('es-ES')}</span>
                </div>
              </div>

              {/* Loan Summary Badge Table */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-4 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Capital Prestado</span>
                  <span className="font-bold text-slate-900 text-sm">{selectedItem.loanRequest?.amount_requested?.toLocaleString('es-ES')} €</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Plazo</span>
                  <span className="font-bold text-slate-900 text-sm">{selectedItem.loanRequest?.duration_months} Meses</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Tipo Interés (TIN)</span>
                  <span className="font-bold text-slate-900 text-sm">{selectedItem.loanType?.interest_rate || 5.0}%</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Estado</span>
                  <span className="font-bold text-emerald-600 text-sm">
                    {selectedItem.contract.signed_at ? 'Firmado' : 'Aprobado para Firma'}
                  </span>
                </div>
              </div>

              {/* Text Body */}
              <div className="text-xs leading-relaxed whitespace-pre-line font-mono bg-white p-5 rounded-xl border border-slate-200 text-slate-700">
                {contractContent}
              </div>

              {/* Signatures Area */}
              <div className="grid grid-cols-2 gap-6 pt-6 border-t border-slate-200">
                <div className="space-y-4">
                  <span className="text-xs font-bold text-slate-600 block">Por el Prestamista:</span>
                  <div className="h-16 border-b border-slate-400 flex items-center justify-center text-xs font-serif italic text-indigo-800">
                    RapiCredito Legal S.L. [Firma Digital Validada]
                  </div>
                  <span className="text-[10px] text-slate-400 block">Certificado Electrónico eIDAS</span>
                </div>

                <div className="space-y-4">
                  <span className="text-xs font-bold text-slate-600 block">Por el Prestatario:</span>
                  <div className="h-16 border-b border-slate-400 flex items-center justify-center text-xs font-serif italic text-slate-800">
                    {selectedItem.contract.signed_at ? `Firmado digitalmente el ${new Date(selectedItem.contract.signed_at).toLocaleDateString('es-ES')}` : 'Pendiente de firma digital del cliente'}
                  </div>
                  <span className="text-[10px] text-slate-400 block">Consentimiento Expreso del Titular</span>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 print:hidden">
              <button
                onClick={() => setIsPreviewModalOpen(false)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 cursor-pointer"
              >
                Cerrar Vista Previa
              </button>
              {!selectedItem.contract.signed_at && selectedItem.contract.status !== 'sent' && (
                <button
                  onClick={() => {
                    handleSendToClient();
                    setIsPreviewModalOpen(false);
                  }}
                  className="btn-primary-purple px-6 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Validar y Enviar al Cliente →
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
