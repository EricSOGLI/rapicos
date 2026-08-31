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
  
  // Editor States
  const [contractContent, setContractContent] = useState('');
  const [attachments, setAttachments] = useState<string[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
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
    setContractContent(item.contract.content || '');
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
    setMsg('¡El contrato ha sido enviado al cliente con éxito!');
    refreshContracts();
    setTimeout(() => {
      setMsg('');
      setSelectedItem(null);
    }, 2000);
  };

  const handleLocalImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsUploadingImage(true);
    const file = e.target.files[0];

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setAttachments(prev => [...prev, base64String]);
      setIsUploadingImage(false);
      // Reset input element
      e.target.value = '';
    };
    reader.onerror = () => {
      alert("Error al leer el archivo de imagen.");
      setIsUploadingImage(false);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAttachment = (idx: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== idx));
  };

  const columns: TableColumn<any>[] = [
    {
      header: 'ID de Contrato',
      render: ({ contract }) => <span className="font-mono text-slate-400 text-[10px]">{contract.id.toUpperCase()}</span>
    },
    {
      header: 'Tipo de Préstamo',
      render: ({ loanRequest, loanType }) => (
        <span className="font-semibold text-slate-900">
          {loanType.name} ({loanRequest.amount_requested} €)
        </span>
      )
    },
    {
      header: 'Fecha de Firma',
      render: ({ contract }) => (
        <span>
          {contract.signed_at ? (
            new Date(contract.signed_at).toLocaleDateString('es-ES')
          ) : (
            <span className="text-amber-600 font-bold">Pendiente de firma</span>
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
            className="bg-brand-50 hover:bg-brand-100 text-brand-700 px-3 py-1.5 rounded-xl font-bold text-xs transition-colors"
          >
            Leer y editar
          </button>
          <button
            onClick={() => alert('Descargando PDF...')}
            className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors"
            title="Descargar PDF"
          >
            <Icon name="Download" size={15} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 sm:space-y-8 pb-10 font-sans">
      <div>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 leading-tight">Contratos de Préstamo</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">Genera, revisa y personaliza los contratos de crédito antes de la firma del cliente.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Table of Contracts */}
        <div className="lg:col-span-7">
          <ResponsiveTable
            columns={columns}
            data={contracts}
            keyExtractor={({ contract }) => contract.id}
            emptyMessage="Actualmente no hay contratos guardados."
          />
        </div>

        {/* Contract Editor Panel */}
        {selectedItem && (
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6 animate-in fade-in duration-200">
            <div className="flex justify-between items-center border-b border-slate-50 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-bold text-base text-slate-900">
                    Edición del Contrato
                  </h3>
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                    selectedItem.contract.status === 'sent' 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {selectedItem.contract.status === 'sent' ? 'Enviado' : 'Borrador'}
                  </span>
                </div>
                <span className="font-mono text-[9px] text-slate-400 block mt-0.5">ID: {selectedItem.contract.id.toUpperCase()}</span>
              </div>
              <button 
                onClick={() => setSelectedItem(null)}
                className="text-slate-400 hover:text-slate-650 p-1 rounded-lg"
              >
                <Icon name="X" size={18} />
              </button>
            </div>

            {selectedItem.contract.signed_at && (
              <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 border border-emerald-100">
                <Icon name="CheckCircle" size={15} className="text-emerald-600" />
                <span>El cliente ya ha firmado este contrato. Las modificaciones están deshabilitadas.</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4 text-xs font-semibold text-slate-600">
              {/* Contract Terms Textarea */}
              <div className="space-y-1.5">
                <label className="block text-slate-500">Términos y condiciones del contrato</label>
                <textarea
                  value={contractContent}
                  onChange={(e) => setContractContent(e.target.value)}
                  disabled={!!selectedItem.contract.signed_at}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-xs leading-relaxed focus:outline-none focus:border-brand-500 h-64 font-mono disabled:opacity-75 disabled:cursor-not-allowed text-slate-800"
                  placeholder="Introduce las cláusulas del contrato..."
                />
              </div>

              {/* Attachments Section */}
              <div className="space-y-3 pt-3 border-t border-slate-50">
                <label className="block text-slate-500">Anexos e imágenes ({attachments.length})</label>
                
                {/* Attachment list */}
                {attachments.length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {attachments.map((url, idx) => (
                      <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-100 bg-slate-50 aspect-video flex items-center justify-center">
                        <img src={url} alt={`Anexo ${idx + 1}`} className="w-full h-full object-cover" />
                        {!selectedItem.contract.signed_at && (
                          <button
                            type="button"
                            onClick={() => handleRemoveAttachment(idx)}
                            className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-lg opacity-90 hover:opacity-100 shadow-sm"
                          >
                            <Icon name="Trash" size={12} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Add new attachment local file upload */}
                {!selectedItem.contract.signed_at && (
                  <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center hover:border-brand-500 transition-all relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLocalImageUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={isUploadingImage}
                    />
                    <div className="space-y-1">
                      <div className="h-8 w-8 bg-slate-50 rounded-lg flex items-center justify-center mx-auto text-slate-400">
                        <Icon name="Image" size={18} />
                      </div>
                      <div className="text-[10px] font-semibold text-slate-650">
                        {isUploadingImage ? 'Subiendo imagen...' : 'Subir imagen desde el ordenador'}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {msg && (
                <p className="text-xs text-brand-600 bg-brand-50 p-2.5 rounded-xl text-center font-bold animate-pulse">
                  {msg}
                </p>
              )}

              <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-slate-50">
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="flex-1 border border-slate-100 hover:bg-slate-50 text-slate-500 py-3 rounded-xl font-bold transition-colors text-center"
                >
                  Cerrar
                </button>
                {!selectedItem.contract.signed_at && (
                  <>
                    <button
                      type="submit"
                      className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 py-3 rounded-xl font-bold transition-colors shadow-sm"
                    >
                      Guardar borrador
                    </button>
                    {selectedItem.contract.status !== 'sent' && (
                      <button
                        type="button"
                        onClick={handleSendToClient}
                        className="flex-1 bg-brand-600 hover:bg-brand-700 text-white py-3 rounded-xl font-bold transition-colors shadow-sm"
                      >
                        Enviar al cliente
                      </button>
                    )}
                  </>
                )}
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
