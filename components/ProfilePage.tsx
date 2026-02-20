import React, { useState, useEffect, useRef } from 'react';
import { User, Post, Message, PostStatus, PostType } from '../types';
import { MockApi } from '../services/mockApi';

interface ProfilePageProps {
  user: User;
  onUpdateUser: (updatedUser: User) => void;
  onNavigateToInbox: () => void;
  onViewPostDetails: (post: Post) => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ user, onUpdateUser, onNavigateToInbox, onViewPostDetails }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: user.name, avatar: user.avatar || '' });
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadUserData = async () => {
      const [posts, inbox] = await Promise.all([
        MockApi.getPosts(user.role, user.id),
        MockApi.getUserInbox(user.id)
      ]);
      setUserPosts(posts);
      setConversations(inbox);
      setIsLoading(false);
    };
    loadUserData();
  }, [user]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updated = await MockApi.updateUserProfile(user.id, formData);
      onUpdateUser(updated);
      setIsEditing(false);
    } catch (error) {
      alert("Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Image size should be less than 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const inputClasses = "w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 focus:bg-white outline-none transition-all font-bold text-slate-900 placeholder:text-slate-300";
  const labelClasses = "block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 ml-1";

  if (isLoading) return (
    <div className="py-20 flex flex-col items-center justify-center">
      <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-2xl animate-spin mb-4"></div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading Account Data...</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      {/* Profile Header */}
      <div className="bg-white rounded-[3rem] p-8 md:p-14 shadow-2xl shadow-indigo-100/30 border border-slate-100 relative overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-50 rounded-full -mr-48 -mt-48 blur-[100px] opacity-60"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-50 rounded-full -ml-32 -mb-32 blur-[80px] opacity-40"></div>
        
        <div className="relative z-10 flex flex-col lg:flex-row gap-12 items-center lg:items-start">
          {/* Avatar Section */}
          <div className="relative group shrink-0">
            <div className="w-40 h-40 md:w-48 md:h-48 rounded-[3.5rem] overflow-hidden ring-8 ring-white shadow-2xl transition-all duration-500 group-hover:scale-[1.02] bg-slate-100">
              <img 
                src={isEditing ? formData.avatar : user.avatar} 
                alt={user.name} 
                className="w-full h-full object-cover" 
              />
            </div>
            {isEditing && (
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] rounded-[3.5rem] flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 border-4 border-white/20"
              >
                <svg className="w-8 h-8 text-white mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <p className="text-white text-[9px] font-black uppercase tracking-[0.2em]">Update Photo</p>
              </button>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              className="sr-only" 
              accept="image/*" 
              onChange={handleFileChange}
            />
          </div>

          <div className="flex-1 text-center lg:text-left pt-2">
            {isEditing ? (
              <form onSubmit={handleUpdate} className="space-y-6 max-w-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClasses}>Legal Identity Name</label>
                    <input 
                      className={inputClasses}
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      placeholder="e.g. John Doe"
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClasses}>Avatar Resource URL</label>
                    <input 
                      className={inputClasses}
                      value={formData.avatar}
                      onChange={e => setFormData({...formData, avatar: e.target.value})}
                      placeholder="https://..."
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                  <button 
                    type="submit" 
                    disabled={isSaving}
                    className="bg-indigo-600 text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 flex items-center gap-3"
                  >
                    {isSaving ? 'Synchronizing...' : 'Save Profile Changes'}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => { setIsEditing(false); setFormData({name: user.name, avatar: user.avatar || ''}); }}
                    className="bg-slate-100 text-slate-500 px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-200 transition-all"
                  >
                    Discard
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center gap-6 justify-center lg:justify-start">
                  <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-none">{user.name}</h1>
                  <button 
                    onClick={() => setIsEditing(true)} 
                    className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all flex items-center justify-center border border-slate-100 shadow-sm"
                    title="Edit Profile"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  </button>
                </div>
                <div className="flex flex-wrap gap-6 justify-center lg:justify-start">
                  <div className="flex items-center gap-3 text-slate-500">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    </div>
                    <span className="text-sm font-bold">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-500">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Verified AAU {user.role}</span>
                  </div>
                </div>
                <div className="flex gap-3 justify-center lg:justify-start">
                  <span className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100">Portal ID: {user.id.slice(-8).toUpperCase()}</span>
                  <span className="bg-slate-900 text-white px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-slate-100">Status: Active</span>
                </div>
              </div>
            )}
          </div>

          {/* Stats Section */}
          <div className="flex gap-6 lg:flex-col shrink-0 w-full lg:w-auto">
            <div className="flex-1 bg-white p-8 rounded-[2rem] text-center border border-slate-100 shadow-xl shadow-slate-100/50 min-w-[140px]">
              <p className="text-4xl font-black text-slate-900 tracking-tight">{userPosts.length}</p>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2">Total Reports</p>
            </div>
            <div className="flex-1 bg-white p-8 rounded-[2rem] text-center border border-slate-100 shadow-xl shadow-slate-100/50 min-w-[140px]">
              <p className="text-4xl font-black text-slate-900 tracking-tight">{conversations.length}</p>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2">Active Chats</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column: Post History */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between px-4">
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none">Report Archives</h2>
              <p className="text-slate-400 text-xs font-medium mt-2">Your historical property interactions</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-300">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            </div>
          </div>
          
          {userPosts.length === 0 ? (
            <div className="py-24 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-center px-10">
              <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-200 mb-6">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">Registry is Empty</h3>
              <p className="text-slate-400 font-medium max-w-xs leading-relaxed">Submit a report to begin tracking lost or found items on campus.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {userPosts.map(post => (
                <div 
                  key={post.id} 
                  onClick={() => onViewPostDetails(post)}
                  className="group bg-white p-6 rounded-[2.5rem] shadow-sm hover:shadow-2xl transition-all duration-500 border border-slate-100 flex gap-6 items-center cursor-pointer"
                >
                  <div className="w-24 h-24 rounded-3xl overflow-hidden bg-slate-50 shrink-0 border border-slate-50">
                    {post.image ? (
                      <img src={post.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-200 italic font-black text-2xl">AAU</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-sm ${post.status === PostStatus.APPROVED ? 'bg-emerald-500 text-white' : post.status === PostStatus.PENDING ? 'bg-amber-500 text-white' : 'bg-slate-500 text-white'}`}>
                        {post.status}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest bg-slate-100 text-slate-400`}>
                        {post.type}
                      </span>
                    </div>
                    <h3 className="text-xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors truncate">{post.title}</h3>
                    <div className="flex items-center gap-2 mt-2 text-slate-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                      <span className="text-xs font-bold truncate">{post.location}</span>
                    </div>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shrink-0">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Active Inquiries */}
        <div className="space-y-8">
          <div className="flex items-center justify-between px-4">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Active Inquiries</h2>
            <button 
              onClick={onNavigateToInbox} 
              className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline underline-offset-4 flex items-center gap-2"
            >
              Full Inbox
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </button>
          </div>

          <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-100/50 overflow-hidden">
            {conversations.length === 0 ? (
              <div className="p-12 text-center space-y-4">
                <div className="w-20 h-20 bg-slate-50 rounded-3xl mx-auto flex items-center justify-center text-slate-200">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                </div>
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No active chats</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {conversations.slice(0, 5).map((conv, i) => (
                  <button 
                    key={i} 
                    onClick={onNavigateToInbox}
                    className="w-full p-6 text-left hover:bg-slate-50 transition-all flex gap-4 items-center group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest truncate">{conv.post.title}</p>
                      <p className="text-xs text-slate-500 truncate mt-1 font-medium italic">"{conv.lastMessage.content}"</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Security & Verification Card */}
          <div className="bg-slate-900 text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group">
             <div className="absolute bottom-0 right-0 w-48 h-48 bg-indigo-600 rounded-full blur-[80px] opacity-40 -mb-24 -mr-24 transition-all duration-700 group-hover:scale-125"></div>
             <div className="absolute top-0 left-0 w-24 h-24 bg-rose-500 rounded-full blur-[60px] opacity-20 -mt-12 -ml-12"></div>
             
             <h4 className="text-2xl font-black mb-3 relative z-10 tracking-tight">Recovery Token</h4>
             <p className="text-slate-400 text-xs leading-relaxed mb-8 relative z-10 font-medium">Verify your identity with this secure token when reclaiming assets at the Campus Security Headquarters.</p>
             
             <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 text-center relative z-10 group-hover:bg-white/15 transition-colors">
               <span className="text-4xl font-black tracking-[0.4em] font-mono text-indigo-400">{user.id.slice(0, 4).toUpperCase()}</span>
               <div className="mt-4 pt-4 border-t border-white/5">
                 <p className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-500">Security Clearance Level 1</p>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;