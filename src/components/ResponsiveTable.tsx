/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export interface TableColumn<T> {
  header: string;
  render: (item: T) => React.ReactNode;
  className?: string;
}

interface ResponsiveTableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  keyExtractor: (item: T) => string | number;
  emptyMessage?: string;
}

export default function ResponsiveTable<T>({
  columns,
  data,
  keyExtractor,
  emptyMessage = 'No hay elementos disponibles.',
}: ResponsiveTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400 text-xs font-medium bg-white rounded-3xl border border-slate-50 shadow-sm">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Mobile View: Card-based rendering (< md) */}
      <div className="md:hidden space-y-4">
        {data.map((item) => (
          <div
            key={keyExtractor(item)}
            className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-4"
          >
            {columns.map((col, index) => {
              const isAction = col.header.toLowerCase().includes('acción') || col.header.toLowerCase().includes('acciones') || col.header.toLowerCase().includes('gestión') || col.header.toLowerCase().includes('action') || col.header.toLowerCase().includes('aperçu');
              
              return (
                <div
                  key={index}
                  className={`flex ${
                    isAction ? 'flex-col items-stretch pt-2 border-t border-slate-50' : 'justify-between items-center'
                  } gap-2 text-xs font-semibold`}
                >
                  {!isAction && (
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">
                      {col.header}
                    </span>
                  )}
                  <div className={`${isAction ? 'w-full' : 'text-right font-medium text-slate-700'}`}>
                    {col.render(item)}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Desktop/Tablet View: Table-based rendering with overflow scroll (>= md) */}
      <div className="hidden md:block bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider bg-slate-50/50">
                {columns.map((col, index) => (
                  <th key={index} className={`py-4 px-6 font-semibold ${col.className || ''}`}>
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 font-sans text-slate-700">
              {data.map((item) => (
                <tr key={keyExtractor(item)} className="hover:bg-slate-50/30 transition-colors">
                  {columns.map((col, index) => (
                    <td key={index} className={`py-4 px-6 ${col.className || ''}`}>
                      {col.render(item)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
