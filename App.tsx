import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import PostForm from './components/PostForm';
import AdminPanel from './components/AdminPanel';
import ChatWindow from './components/ChatWindow';
import AboutPage from './components/AboutPage';
import Inbox from './components/Inbox';
import ProfilePage from './components/ProfilePage';
import PostDetailModal from './components/PostDetailModal';
import { User, Post, PostStatus, PostType, UserRole, AppView } from './types';
import { MockApi } from './services/mockApi';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<AppView>('home');
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false); // Hydration Guard
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [detailedPost, setDetailedPost] = useState<Post | null>(null);
  const [filter, setFilter] = useState<{ type: PostType | 'ALL', search: string }>({ type: 'ALL', search: '' });

  // 1. Hydration Guard: Ensure component is mounted before rendering client-specific logic
  useEffect(() => {
    setIsMounted(true);
    const init = async () => {
      await MockApi.init();
      const u = await MockApi.getCurrentUser();
      setUser(u);
      refreshPosts(u?.role);
      setIsLoading(false);
    };
    init();
  }, []);

  const refreshPosts = async (role?: UserRole) => {
    try {
      const p = await MockApi.getPosts(role || UserRole.USER);
      setPosts(p);
    } catch (err) {
      console.error("Failed to fetch posts:", err);
    }
  };

  const navigateTo = (v: AppView) => {
    if ((v === 'submit' || v === 'messages' || v === 'profile') && !user) setView('login');
    else setView(v);
    window.scrollTo(0, 0);
  };

  const handleLogin = async (email: string) => {
    setIsLoading(true);
    try {
      const u = await MockApi.login(email);
      setUser(u);
      refreshPosts(u.role);
      setView('home');
    } catch (err) {
      alert("Login failed. Check server logs.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await MockApi.logout();
    setUser(null);
    setView('home');
    refreshPosts();
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const handlePostSubmit = async (data: any) => {
    if (!user) return;
    setIsLoading(true);
    try {
      await MockApi.createPost({
        ...data,
        userId: user.id,
        userName: user.name,
        category: 'AAU Campus Property'
      });
      setView('profile');
      refreshPosts(user.role);
      alert("Report submitted! The AAU Property Office will review it before it appears publicly.");
    } catch (err) {
      alert("Failed to submit report.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePostAction = async (postId: string, status: PostStatus) => {
    if (status === PostStatus.DECLINED) {
      await MockApi.deletePost(postId);
    } else {
      await MockApi.updatePostStatus(postId, status);
    }
    refreshPosts(user?.role);
  };

  const handleDeletePost = async (postId: string) => {
    if (confirm("Are you sure you want to permanently delete this report from AAU records?")) {
      await MockApi.deletePost(postId);
      refreshPosts(user?.role);
    }
  };

  // Prevent rendering until mounted to avoid hydration mismatch blank screens
  if (!isMounted) return null;

  const filteredPosts = posts.filter(p => {
    const matchType = filter.type === 'ALL' || p.type === filter.type;
    const matchSearch = p.title.toLowerCase().includes(filter.search.toLowerCase()) || 
                       p.description.toLowerCase().includes(filter.search.toLowerCase());
    return matchType && matchSearch && p.status === PostStatus.APPROVED;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-2xl animate-spin mb-4"></div>
          <p className="text-slate-500 font-black uppercase tracking-[0.2em] text-[10px]">Synchronizing AAU Registry...</p>
        </div>
      </div>
    );
  }

  const MobileNav = () => (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-200 px-6 py-3 flex items-center justify-between z-[60] shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.1)]">
      <button onClick={() => navigateTo('home')} className={`flex flex-col items-center gap-1 transition-all ${view === 'home' ? 'text-indigo-600 scale-110' : 'text-slate-400'}`}>
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
        <span className="text-[9px] font-black uppercase tracking-widest">Registry</span>
      </button>
      <button onClick={() => navigateTo('about')} className={`flex flex-col items-center gap-1 transition-all ${view === 'about' ? 'text-indigo-600 scale-110' : 'text-slate-400'}`}>
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <span className="text-[9px] font-black uppercase tracking-widest">About</span>
      </button>
      <div className="relative -mt-10">
        <button onClick={() => navigateTo('submit')} className={`w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-200 border-4 border-white transition-transform active:scale-90 ${view === 'submit' ? 'bg-indigo-700' : ''}`}>
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
        </button>
      </div>
      <button onClick={() => navigateTo('messages')} className={`flex flex-col items-center gap-1 transition-all ${view === 'messages' ? 'text-indigo-600 scale-110' : 'text-slate-400'}`}>
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
        <span className="text-[9px] font-black uppercase tracking-widest">Inbox</span>
      </button>
      <button onClick={() => navigateTo('profile')} className={`flex flex-col items-center gap-1 transition-all ${view === 'profile' ? 'text-indigo-600 scale-110' : 'text-slate-400'}`}>
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
        <span className="text-[9px] font-black uppercase tracking-widest">Profile</span>
      </button>
    </nav>
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#F9FAFC] selection:bg-indigo-100 selection:text-indigo-700">
      <Header user={user} onLogout={handleLogout} onNavigate={navigateTo} />
      <main className="max-w-7xl mx-auto px-4 py-8 md:py-12 w-full flex-1 mb-20 md:mb-0">
        {view === 'login' && !user && (
          <div className="max-w-md mx-auto mt-4 md:mt-16 bg-white p-10 md:p-14 rounded-[3rem] shadow-2xl shadow-indigo-100/50 border border-slate-100 animate-in fade-in zoom-in-95 duration-500">
            <div className="text-center mb-10">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-200">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" /></svg>
              </div>
              <h2 className="text-4xl font-black text-slate-900 leading-tight tracking-tight">AAU Gateway</h2>
              <p className="text-slate-400 mt-3 text-sm font-medium px-4">Secure authentication for the official Ambrose Alli University Property Registry.</p>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const email = (e.currentTarget.elements.namedItem('email') as HTMLInputElement).value;
              handleLogin(email);
            }} className="space-y-8">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 ml-1">Official AAU Email</label>
                <input required name="email" type="email" placeholder="name@aauekpoma.edu.ng" className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-[1.5rem] focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 focus:bg-white outline-none transition-all font-bold text-slate-900 placeholder:text-slate-300" />
              </div>
              <button type="submit" className="w-full bg-slate-900 text-white font-black py-5 rounded-[1.5rem] shadow-2xl shadow-indigo-100 hover:bg-indigo-600 transition-all active:scale-[0.98] uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-3 group">
                <span>Authorize Access</span>
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </button>
            </form>
          </div>
        )}

        {view === 'about' && <AboutPage onGetStarted={() => navigateTo(user ? 'home' : 'login')} />}
        {view === 'messages' && user && <div className="max-w-6xl mx-auto"><Inbox currentUser={user} /></div>}
        {view === 'profile' && user && <ProfilePage user={user} onUpdateUser={handleUpdateUser} onNavigateToInbox={() => navigateTo('messages')} onViewPostDetails={(post) => setDetailedPost(post)} />}

        {view === 'home' && (
          <div className="space-y-12">
            <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-end justify-between">
              <div>
                <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-lg mb-4">Official Registry</span>
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-none">Campus Assets</h1>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                <div className="flex bg-white rounded-2xl p-1.5 shadow-sm border border-slate-200 w-full sm:w-auto">
                  <button onClick={() => setFilter({...filter, type: 'ALL'})} className={`flex-1 sm:px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter.type === 'ALL' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>All</button>
                  <button onClick={() => setFilter({...filter, type: PostType.LOST})} className={`flex-1 sm:px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter.type === PostType.LOST ? 'bg-rose-500 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>Lost</button>
                  <button onClick={() => setFilter({...filter, type: PostType.FOUND})} className={`flex-1 sm:px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter.type === PostType.FOUND ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>Found</button>
                </div>
              </div>
            </div>
            {filteredPosts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {filteredPosts.map(post => (
                  <div key={post.id} onClick={() => setDetailedPost(post)} className="group bg-white rounded-[2.5rem] shadow-sm hover:shadow-2xl transition-all duration-500 border border-slate-100 overflow-hidden flex flex-col h-full cursor-pointer">
                    <div className="relative h-56 overflow-hidden bg-slate-50">
                      {post.image ? <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" /> : <div className="w-full h-full flex items-center justify-center text-slate-200 italic font-black text-4xl">AAU</div>}
                    </div>
                    <div className="p-8 flex-1 flex flex-col">
                      <h3 className="text-xl font-black text-slate-900 mb-2 line-clamp-1 tracking-tight">{post.title}</h3>
                      <p className="text-sm text-slate-500 line-clamp-2 mb-8 flex-1 leading-relaxed font-medium">{post.description}</p>
                      <button onClick={(e) => { e.stopPropagation(); if (!user) navigateTo('login'); else setSelectedPost(post); }} className="w-full bg-slate-900 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all hover:bg-indigo-600 active:scale-95 shadow-xl shadow-slate-100 flex items-center justify-center gap-2">Initiate Claim</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-32 flex flex-col items-center text-center bg-white rounded-[3rem] border border-slate-100 shadow-sm px-6">
                <h3 className="text-2xl font-black text-slate-900">Registry is Quiet</h3>
              </div>
            )}
          </div>
        )}

        {view === 'submit' && <div className="max-w-4xl mx-auto"><PostForm onSubmit={handlePostSubmit} onCancel={() => navigateTo('home')} isSubmitting={isLoading} /></div>}
        {view === 'admin' && user?.role === UserRole.ADMIN && (
          <div className="space-y-8">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">AAU Admin Control</h1>
            <AdminPanel posts={posts} onAction={handlePostAction} onDelete={handleDeletePost} onViewDetails={(post) => setDetailedPost(post)} />
          </div>
        )}
      </main>

      {detailedPost && <PostDetailModal post={detailedPost} currentUser={user || { id: '', name: 'Guest', email: '', role: UserRole.USER }} onClose={() => setDetailedPost(null)} onAction={handlePostAction} onDelete={handleDeletePost} onMessageOffice={(post) => { setDetailedPost(null); if (!user) navigateTo('login'); else setSelectedPost(post); }} />}
      {selectedPost && user && <ChatWindow post={selectedPost} currentUser={user} onClose={() => setSelectedPost(null)} />}
      <footer className="mt-auto py-12 text-center text-slate-400 text-[9px] font-black uppercase tracking-[0.5em] bg-white border-t border-slate-100 mb-16 md:mb-0">
        <p>&copy; {new Date().getFullYear()} Ambrose Alli University (AAU) Property Office</p>
      </footer>
      <MobileNav />
    </div>
  );
};

export default App;