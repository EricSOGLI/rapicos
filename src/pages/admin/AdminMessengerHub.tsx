/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { dataService, realtimeService, initializeApplication } from '../../lib/supabase';
import { Profile } from '../../types';
import Icon from '../../components/Icons';

export function AdminMessengerHub() {
  const [conversations, setConversations] = useState<{ user: Profile; lastMessage: any }[]>([]);
  const [activeUser, setActiveUser] = useState<Profile | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');

  const refreshConversations = () => {
    setConversations(dataService.getAllActiveConversationsAdmin());
  };

  const fetchChatWithUser = () => {
    if (!activeUser) return;
    const list = dataService.getMessagesBetween('user-admin-1', activeUser.id);
    setMessages(list);
  };

  useEffect(() => {
    const init = async () => {
      await initializeApplication();
      refreshConversations();
      fetchChatWithUser();
    };
    init();

    const sub = realtimeService.subscribe('chat_activity', () => {
      refreshConversations();
      fetchChatWithUser();
    });
    return () => sub();
  }, [activeUser?.id]);

  useEffect(() => {
    fetchChatWithUser();
  }, [activeUser]);

  const handleSendResponse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !activeUser) return;

    const newMsg = dataService.sendMessage('user-admin-1', activeUser.id, text.trim(), true);
    setText('');
    setMessages(prev => [...prev, newMsg]);
    refreshConversations();
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm flex h-[calc(100vh-140px)] md:h-[calc(100vh-120px)] font-sans overflow-hidden">
      {/* List of active users conversations */}
      <div className={`${activeUser ? 'hidden md:flex' : 'flex w-full'} md:w-80 lg:w-96 border-r border-slate-100 flex-col shrink-0`}>
        <div className="p-4 border-b border-slate-50 bg-slate-50/20">
          <h3 className="font-display font-bold text-slate-800 text-sm">Conversaciones con clientes</h3>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
          {conversations.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs font-medium">No hay conversaciones activas.</div>
          ) : (
            conversations.map(({ user, lastMessage }) => (
              <button
                key={user.id}
                onClick={() => setActiveUser(user)}
                className={`w-full text-left p-4 hover:bg-slate-50/60 transition-colors flex items-start gap-3 ${
                  activeUser?.id === user.id ? 'bg-slate-50' : ''
                }`}
              >
                <img
                  src={user.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(user.full_name)}`}
                  className="h-9 w-9 rounded-full bg-slate-100 object-cover mt-0.5"
                  alt={user.full_name}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <h4 className="font-semibold text-slate-800 text-xs truncate">{user.full_name}</h4>
                    <span className="text-[9px] text-slate-400 font-mono">
                      {new Date(lastMessage.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px] truncate mt-1">{lastMessage.content}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Message workspace */}
      <div className={`${!activeUser ? 'hidden md:flex' : 'flex'} flex-grow flex-col bg-slate-50/30 min-w-0`}>
        {activeUser ? (
          <div className="flex-grow flex flex-col justify-between h-full overflow-hidden">
            {/* Active user header */}
            <div className="p-4 border-b border-slate-50 bg-white flex items-center justify-between">
              <div className="flex items-center min-w-0">
                <button
                  onClick={() => setActiveUser(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-650 md:hidden mr-2 focus:outline-none shrink-0"
                >
                  <Icon name="ArrowLeft" size={18} />
                </button>
                <img
                  src={activeUser.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(activeUser.full_name)}`}
                  className="h-8 w-8 rounded-full object-cover bg-slate-100 mr-2.5 shrink-0"
                  alt={activeUser.full_name}
                />
                <h4 className="font-semibold text-slate-900 text-xs truncate">{activeUser.full_name}</h4>
              </div>
            </div>

            {/* Message items */}
            <div className="flex-grow overflow-y-auto p-4 space-y-3">
              {messages.map(msg => {
                const isAdminMsg = msg.is_from_admin;
                return (
                  <div key={msg.id} className={`flex ${isAdminMsg ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] sm:max-w-sm px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
                      isAdminMsg
                        ? 'bg-slate-900 text-white rounded-tr-none'
                        : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none'
                    }`}>
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                      <span className={`text-[8px] block text-right mt-1.5 ${isAdminMsg ? 'text-slate-400' : 'text-slate-400'}`}>
                        {new Date(msg.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input message form */}
            <form onSubmit={handleSendResponse} className="p-4 border-t border-slate-50 bg-white flex gap-2">
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Escribe tu respuesta..."
                className="flex-grow border border-slate-100 bg-slate-50 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-brand-500 text-slate-800"
              />
              <button
                type="submit"
                className="bg-brand-600 hover:bg-brand-700 text-white px-4 rounded-xl text-xs font-bold transition-colors"
              >
                Enviar
              </button>
            </form>
          </div>
        ) : (
          <div className="flex-grow flex items-center justify-center text-slate-400 text-xs font-medium">
            Selecciona una conversación a la izquierda para ver el historial y responder al cliente.
          </div>
        )}
      </div>
    </div>
  );
}
