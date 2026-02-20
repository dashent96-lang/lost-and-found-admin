
import React, { useState, useEffect, useRef } from 'react';
import { Post, Message, User, UserRole } from '../types';
import { MockApi } from '../services/mockApi';

interface ChatWindowProps {
  post: Post;
  currentUser: User;
  onClose: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ post, currentUser, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      // For a user, they only see their thread with the admin about this post
      const msgs = await MockApi.getMessages(post.id, currentUser.role === UserRole.ADMIN ? undefined : currentUser.id);
      setMessages(msgs);
    };
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [post.id, currentUser]);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    // Users always message the admin.
    const recipientId = currentUser.role === UserRole.ADMIN 
      ? post.userId // Admin replies to the person who reported it
      : 'admin_primary';
    
    const msg = await MockApi.sendMessage({
      postId: post.id,
      senderId: currentUser.id,
      senderName: currentUser.name,
      recipientId: recipientId,
      content: newMessage,
      isAdmin: currentUser.role === UserRole.ADMIN
    });
    
    setMessages([...messages, msg]);
    setNewMessage('');
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl flex flex-col h-[650px] overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-indigo-600 text-white flex justify-between items-center shadow-lg">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center border border-white/10">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
            </div>
            <div>
              <h3 className="text-xl font-black leading-tight truncate max-w-[280px]">{post.title}</h3>
              <p className="text-indigo-100 text-xs font-bold uppercase tracking-wider mt-1 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Chatting with {currentUser.role === UserRole.ADMIN ? 'User' : 'Administrator'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2.5 hover:bg-white/20 rounded-2xl transition-all active:scale-90">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-5 bg-slate-50/50">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-slate-300 space-y-4">
              <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-sm">
                <svg className="w-10 h-10 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>
              </div>
              <p className="text-sm font-bold uppercase tracking-widest">No history yet</p>
            </div>
          )}
          {messages.map((m) => {
            const isMe = m.senderId === currentUser.id;
            return (
              <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-[1.5rem] px-5 py-3 shadow-md ${isMe ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'}`}>
                  {!isMe && <p className="text-[10px] font-black uppercase tracking-widest mb-1.5 text-indigo-500">{m.senderName}</p>}
                  <p className="text-[15px] leading-relaxed font-medium">{m.content}</p>
                  <p className={`text-[10px] font-bold mt-2 ${isMe ? 'text-indigo-200 text-right' : 'text-slate-400'}`}>
                    {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <form onSubmit={handleSend} className="p-6 border-t border-slate-100 bg-white">
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Send a message..."
              className="flex-1 px-5 py-4 bg-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-medium"
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
            />
            <button
              type="submit"
              className="bg-indigo-600 text-white w-14 h-14 rounded-2xl flex items-center justify-center hover:bg-indigo-700 transition-all active:scale-90 shadow-xl"
            >
              <svg className="w-6 h-6 transform rotate-90" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
