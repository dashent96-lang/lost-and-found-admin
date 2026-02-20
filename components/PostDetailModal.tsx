import React from 'react';
import { Post, User, PostStatus, PostType, UserRole } from '../types';

interface PostDetailModalProps {
  post: Post;
  currentUser: User;
  onClose: () => void;
  onAction?: (postId: string, status: PostStatus) => void;
  onDelete?: (postId: string) => void;
  onMessageOffice: (post: Post) => void;
}

const PostDetailModal: React.FC<PostDetailModalProps> = ({ 
  post, 
  currentUser, 
  onClose, 
  onAction, 
  onDelete, 
  onMessageOffice 
}) => {
  const isAdmin = currentUser.role === UserRole.ADMIN;
  const isOwner = currentUser.id === post.userId;

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-5xl rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row h-full max-h-[90vh] overflow-hidden relative animate-in zoom-in-95 duration-300">
        
        {/* Close Button Mobile */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 z-50 p-2 bg-white/20 backdrop-blur-md rounded-full text-white md:hidden"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        {/* Left Side: Image Viewer */}
        <div className="md:w-1/2 h-64 md:h-auto bg-slate-100 relative group">
          {post.image ? (
            <img 
              src={post.image} 
              alt={post.title} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
              <svg className="w-24 h-24 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              <p className="text-sm font-black uppercase tracking-widest">No Image Provided</p>
            </div>
          )}
          <div className="absolute top-6 left-6 flex gap-2">
            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-xl ${post.type === PostType.LOST ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'}`}>
              {post.type}
            </span>
            <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-xl bg-white text-slate-900">
              {post.status}
            </span>
          </div>
        </div>

        {/* Right Side: Details */}
        <div className="flex-1 flex flex-col bg-white overflow-y-auto">
          {/* Header */}
          <div className="p-8 md:p-12 border-b border-slate-50 relative">
            <button 
              onClick={onClose} 
              className="hidden md:block absolute top-12 right-12 text-slate-300 hover:text-slate-900 transition-colors"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            
            <p className="text-indigo-600 text-[10px] font-black uppercase tracking-[0.3em] mb-3">{post.category}</p>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-none mb-6">{post.title}</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex items-center gap-4 text-slate-500">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-indigo-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Location</p>
                  <p className="text-sm font-bold text-slate-700">{post.location}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-slate-500">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-indigo-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Date Reported</p>
                  <p className="text-sm font-bold text-slate-700">{new Date(post.date).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="p-8 md:p-12 space-y-8 flex-1">
            <div className="space-y-4">
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Full Description</h3>
              <p className="text-slate-600 leading-relaxed text-lg font-medium whitespace-pre-wrap">
                {post.description}
              </p>
            </div>

            <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm border border-slate-100">
                <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Reported By</p>
                <p className="text-sm font-bold text-slate-900">{isOwner ? 'You (Me)' : post.userName}</p>
              </div>
            </div>
          </div>

          {/* Actions Footer */}
          <div className="p-8 md:p-12 bg-slate-50/50 border-t border-slate-100 flex flex-wrap gap-4 items-center">
            {isAdmin ? (
              <>
                {post.status === PostStatus.PENDING ? (
                  <>
                    <button 
                      onClick={() => { if(onAction) onAction(post.id, PostStatus.APPROVED); onClose(); }}
                      className="flex-1 bg-emerald-600 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-95"
                    >
                      Approve Listing
                    </button>
                    <button 
                      onClick={() => { if(onAction) onAction(post.id, PostStatus.DECLINED); onClose(); }}
                      className="flex-1 bg-rose-500 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-rose-100 hover:bg-rose-600 transition-all active:scale-95"
                    >
                      Reject Report
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={() => { if(onDelete) onDelete(post.id); onClose(); }}
                    className="flex-1 bg-rose-500 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-rose-100 hover:bg-rose-600 transition-all active:scale-95"
                  >
                    Delete Permanently
                  </button>
                )}
              </>
            ) : (
              <>
                {!isOwner && (
                  <button 
                    onClick={() => onMessageOffice(post)}
                    className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 flex items-center justify-center gap-3"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                    Message Office About This
                  </button>
                )}
                {isOwner && post.status === PostStatus.PENDING && (
                  <div className="flex-1 text-center py-4 bg-amber-50 rounded-2xl border border-amber-100">
                    <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Awaiting Security Review</p>
                  </div>
                )}
                {isOwner && post.status === PostStatus.APPROVED && (
                  <button 
                    onClick={() => { if(onAction) onAction(post.id, PostStatus.CLEARED); onClose(); }}
                    className="flex-1 bg-slate-900 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-slate-800 transition-all active:scale-95"
                  >
                    Mark as Recovered / Closed
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetailModal;