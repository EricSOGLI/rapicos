/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { dataService, realtimeService, initializeApplication, SessionUser } from '../../lib/supabase';
import { Message } from '../../types';
import Icon from '../../components/Icons';

export function ClientMessengerPage({ user }: { user: SessionUser }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchChatMessages = async () => {
    await initializeApplication();
    const list = dataService.getMessagesBetween(user.id, 'user-admin-1');
    setMessages(list);
  };

  useEffect(() => {
    fetchChatMessages();

    const unsubscribe = realtimeService.subscribe(`chat_${user.id}_user-admin-1`, fetchChatMessages);
    const unsubscribeSupport = realtimeService.subscribe(`chat_user-admin-1_${user.id}`, fetchChatMessages);

    return () => {
      unsubscribe();
      unsubscribeSupport();
    };
  }, [user.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    dataService.sendMessage(user.id, 'user-admin-1', text.trim(), false);
    setText('');
    fetchChatMessages();
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col h-[calc(100vh-160px)] md:h-[calc(100vh-120px)] font-sans overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/20">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-brand-600 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-sm shadow-brand-500/10">
            RC
          </div>
          <div>
            <h3 className="font-display font-semibold text-slate-900 text-sm">Asesor Financiero RapiCredito</h3>
            <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span> En línea
            </span>
          </div>
        </div>
      </div>

      {/* Message history */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-400 text-xs font-medium text-center px-4">
            Inicia una conversación con nuestro agente. Aquí puedes realizar cualquier consulta sobre tu préstamo.
          </div>
        ) : (
          messages.map(msg => {
            const isMe = msg.sender_id === user.id;
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] sm:max-w-sm px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
                  isMe
                    ? 'bg-brand-600 text-white rounded-tr-none'
                    : 'bg-slate-50 border border-slate-100 text-slate-700 rounded-tl-none'
                }`}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  <span className={`text-[9px] block text-right mt-1.5 ${isMe ? 'text-brand-200' : 'text-slate-450'}`}>
                    {new Date(msg.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Message typing input */}
      <form onSubmit={handleSend} className="p-4 border-t border-slate-50 bg-slate-50/30 flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escribe tu mensaje aquí..."
          className="flex-grow bg-white border border-slate-100 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-brand-500 font-sans"
        />
        <button
          type="submit"
          className="bg-emerald-600 hover:bg-emerald-700 text-white p-2.5 rounded-xl transition-colors shadow-sm focus:outline-none flex items-center justify-center shrink-0"
        >
          <Icon name="Send" size={16} />
        </button>
      </form>
    </div>
  );
}
