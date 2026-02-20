import React from 'react';
import { Post, PostStatus, PostType } from '../types';

interface AdminPanelProps {
  posts: Post[];
  onAction: (postId: string, status: PostStatus) => void;
  onDelete: (postId: string) => void;
  onViewDetails: (post: Post) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ posts, onAction, onDelete, onViewDetails }) => {
  const pending = posts.filter(p => p.status === PostStatus.PENDING);
  const others = posts.filter(p => p.status !== PostStatus.PENDING);

  const StatusBadge = ({ status }: { status: PostStatus }) => {
    const colors = {
      [PostStatus.PENDING]: 'bg-amber-100 text-amber-700',
      [PostStatus.APPROVED]: 'bg-green-100 text-green-700',
      [PostStatus.DECLINED]: 'bg-rose-100 text-rose-700',
      [PostStatus.CLEARED]: 'bg-slate-100 text-slate-700'
    };
    return <span className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest ${colors[status]}`}>{status}</span>;
  };

  const PostRow = ({ post }: { post: Post }) => (
    <tr 
      onClick={() => onViewDetails(post)}
      className="hover:bg-slate-50 border-b border-slate-100 transition-colors cursor-pointer group"
    >
      <td className="py-4 pl-4 pr-3">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 flex-shrink-0 bg-slate-100 rounded-xl flex items-center justify-center overflow-hidden border border-slate-100 shadow-sm">
            {post.image ? <img src={post.image} className="h-full w-full object-cover group-hover:scale-110 transition-transform" /> : <div className="text-[10px] font-black text-slate-300 italic">AAU</div>}
          </div>
          <div>
            <div className="font-bold text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors">{post.title}</div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{post.userName}</div>
          </div>
        </div>
      </td>
      <td className="py-4 px-3 text-[10px] font-black uppercase tracking-widest">
        <span className={`${post.type === PostType.LOST ? 'text-rose-500' : 'text-emerald-500'}`}>
          {post.type}
        </span>
      </td>
      <td className="py-4 px-3 text-[10px] text-slate-400 font-bold uppercase tracking-widest">{new Date(post.date).toLocaleDateString()}</td>
      <td className="py-4 px-3"><StatusBadge status={post.status} /></td>
      <td className="py-4 pl-3 pr-4 text-right">
        <div className="flex justify-end gap-2" onClick={e => e.stopPropagation()}>
          {post.status === PostStatus.PENDING ? (
            <>
              <button 
                onClick={() => onAction(post.id, PostStatus.APPROVED)}
                className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                title="Approve"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
              </button>
              <button 
                onClick={() => onAction(post.id, PostStatus.DECLINED)}
                className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                title="Decline"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </>
          ) : (
            <button 
              onClick={() => onDelete(post.id)}
              className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
              title="Delete Permanently"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          )}
        </div>
      </td>
    </tr>
  );

  return (
    <div className="space-y-12">
      <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden">
        <div className="p-6 bg-amber-50/50 border-b border-amber-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <div>
              <h3 className="font-black text-slate-900 tracking-tight">Review Queue</h3>
              <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">{pending.length} Reports Awaiting Moderation</p>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-slate-50/50 text-left text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
                <th className="py-4 pl-4 pr-3">Property Item</th>
                <th className="py-4 px-3">Modality</th>
                <th className="py-4 px-3">Registry Date</th>
                <th className="py-4 px-3">Moderation</th>
                <th className="py-4 pl-3 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {pending.length > 0 ? pending.map(p => <PostRow key={p.id} post={p} />) : (
                <tr><td colSpan={5} className="py-20 text-center">
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">AAU Registry is Clean</p>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden">
        <div className="p-6 bg-slate-50 border-b border-slate-100">
          <h3 className="font-black text-slate-900 tracking-tight">Post Archive</h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active and Cleared Listings</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-slate-50/50 text-left text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
                <th className="py-4 pl-4 pr-3">Property Item</th>
                <th className="py-4 px-3">Modality</th>
                <th className="py-4 px-3">Registry Date</th>
                <th className="py-4 px-3">Moderation</th>
                <th className="py-4 pl-3 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {others.map(p => <PostRow key={p.id} post={p} />)}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;