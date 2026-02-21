
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { User, Post, Message, UserRole } from '../types';
import { MockApi } from '../services/mockApi';

interface InboxProps {
  currentUser: User;
}

const Inbox: React.FC<InboxProps> = ({ currentUser }) => {
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedThread, setSelectedThread] = useState<any | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchInbox = async () => {
    let data = [];
    if (currentUser.role === UserRole.ADMIN) {
      data = await MockApi.getAdminInbox();
    } else {
      data = await MockApi.getUserInbox(currentUser.id);
    }
    setConversations(data);
    setLoading(false);
  };

  const fetchMessages = async () => {
    if (!selectedThread) return;
    const userId = currentUser.role === UserRole.ADMIN ? selectedThread.user.id : currentUser.id;
    const msgs = await MockApi.getMessages(selectedThread.post.id, userId);
    setMessages(msgs);
  };

  useEffect(() => {
    fetchInbox();
    const interval = setInterval(fetchInbox, 5000);
    return () => clearInterval(interval);
  }, [currentUser]);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [selectedThread]);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedThread) return;

    const recipientId = currentUser.role === UserRole.ADMIN 
      ? selectedThread.user.id 
      : 'admin_primary';

    const msg = await MockApi.sendMessage({
      postId: selectedThread.post.id,
      senderId: currentUser.id,
      senderName: currentUser.name,
      recipientId: recipientId,
      content: newMessage,
      isAdmin: currentUser.role === UserRole.ADMIN
    });

    setMessages([...messages, msg]);
    setNewMessage('');
    fetchInbox();
  };

  if (loading) return <div className="h-96 flex items-center justify-center"><div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden flex h-[700px]">
      {/* Sidebar */}
      <div className="w-80 border-r border-slate-100 flex flex-col bg-slate-50">
        <div className="p-6 border-b border-slate-200 bg-white">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
            Inbox
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-slate-400 text-sm">No active messages</p>
            </div>
          ) : (
            conversations.map((conv, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedThread(conv)}
                className={`w-full p-4 text-left hover:bg-white border-b border-slate-100 transition-colors flex gap-3 ${selectedThread?.post.id === conv.post.id && (selectedThread?.user?.id === conv.user?.id) ? 'bg-white ring-2 ring-inset ring-indigo-500' : ''}`}
              >
                <div className="w-12 h-12 rounded-xl bg-slate-200 flex-shrink-0 overflow-hidden">
                  {conv.post.image ? <img src={conv.post.image} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-400">?</div>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <p className="text-xs font-bold text-indigo-600 truncate">{conv.post.title}</p>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap">{new Date(conv.lastMessage.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {currentUser.role === UserRole.ADMIN ? conv.user.name : 'Campus Admin'}
                  </p>
                  <p className="text-xs text-slate-500 truncate mt-0.5">{conv.lastMessage.content}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedThread ? (
          <>
            <div className="p-4 border-b border-slate-100 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 leading-none">
                    {currentUser.role === UserRole.ADMIN ? selectedThread.user.name : 'Campus Property Office'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">Re: {selectedThread.post.title}</p>
                </div>
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
              {messages.map((m) => {
                const isMe = m.senderId === currentUser.id;
                return (
                  <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] rounded-2xl px-4 py-3 shadow-sm ${isMe ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'}`}>
                      {!isMe && <p className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-50">{m.senderName}</p>}
                      <p className="text-sm leading-relaxed">{m.content}</p>
                      <p className={`text-[10px] mt-2 ${isMe ? 'text-indigo-200 text-right' : 'text-slate-400'}`}>
                        {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <form onSubmit={handleSend} className="p-4 border-t border-slate-200 bg-white">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ask a question or provide item details..."
                  className="flex-1 px-4 py-3 bg-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                />
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg active:scale-95"
                >
                  Send
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-12">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <svg className="w-12 h-12 opacity-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800">Your Conversations</h3>
            <p className="text-center mt-2 max-w-xs text-sm">Select a message from the sidebar to start discussing a property report with campus administration.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inbox;
