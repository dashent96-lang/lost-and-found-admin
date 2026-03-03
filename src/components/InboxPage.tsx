'use client';

import React, { useState, useEffect } from 'react';
import { User, UserRole, Post, Message } from '@/types';
import { MockApi } from '@/services/mockApi';
import Image from 'next/image';

interface InboxPageProps {
  user: User;
  onOpenChat: (post: Post, targetUserId?: string) => void;
}

const InboxPage: React.FC<InboxPageProps> = ({ user, onOpenChat }) => {
  const [conversations, setConversations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchInbox = async () => {
    const inbox = await MockApi.getUserInbox(user.id, user.role);
    setConversations(inbox);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchInbox();
    const interval = setInterval(fetchInbox, 10000);
    return () => clearInterval(interval);
  }, [user]);

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-2xl animate-spin mb-4"></div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Opening Secure Inbox...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">AAU Registry Inbox</h2>
          <p className="text-slate-500 font-medium mt-2">
            {user.role === UserRole.ADMIN 
              ? "Manage official inquiries and property recovery coordination."
              : "Track your active conversations with the AAU Property Office."}
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Connection Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {conversations.length === 0 ? (
          <div className="bg-white rounded-[3rem] p-20 text-center border border-slate-100 shadow-xl">
            <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-200 mx-auto mb-6">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
            </div>
            <h3 className="text-2xl font-black text-slate-900">No Active Inquiries</h3>
            <p className="text-slate-400 mt-2 max-w-sm mx-auto font-medium">When you message the office or receive a response about a report, it will appear here.</p>
          </div>
        ) : (
          conversations.map((conv, i) => (
            <button 
              key={i} 
              onClick={() => onOpenChat(conv.post, conv.otherUser?.id)}
              className="group bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-lg hover:shadow-2xl hover:border-indigo-100 transition-all text-left flex flex-col md:flex-row md:items-center gap-8 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="w-20 h-20 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-all shrink-0 shadow-inner overflow-hidden">
                {conv.otherUser?.avatar ? (
                  <Image src={conv.otherUser.avatar} alt={conv.otherUser.name} width={80} height={80} referrerPolicy="no-referrer" />
                ) : (
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                )}
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-3 mb-1">
                  <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[9px] font-black uppercase tracking-widest">
                    {conv.post.title}
                  </span>
                  <span className="text-[10px] text-slate-300 font-bold">
                    {new Date(conv.lastMessage.timestamp).toLocaleDateString()}
                  </span>
                </div>
                <h4 className="text-xl font-black text-slate-900 truncate">
                  {user.role === UserRole.ADMIN ? `Inquiry from ${conv.otherUser.name}` : "AAU Property Office"}
                </h4>
                <p className="text-slate-500 font-medium line-clamp-1 italic">
                  &ldquo;{conv.lastMessage.content}&rdquo;
                </p>
              </div>

              <div className="shrink-0 flex items-center gap-4">
                <div className="text-right hidden md:block">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                  <p className="text-xs font-bold text-emerald-500 flex items-center gap-1.5 justify-end">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Active Thread
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
                </div>
              </div>
            </button>
          ))
        )}
      </div>

      <div className="bg-slate-900 rounded-[3rem] p-12 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-2xl font-black tracking-tight">Need Immediate Assistance?</h3>
            <p className="text-indigo-200 font-medium">Visit the AAU Security Office located at the Main Campus Gate.</p>
          </div>
          <div className="flex flex-col items-center md:items-end gap-2">
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Office Hours</p>
            <p className="text-lg font-bold">08:00 AM - 04:00 PM</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InboxPage;
