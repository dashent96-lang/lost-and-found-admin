import React from 'react';
import { User, UserRole, AppView } from '../types';

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
  onNavigate: (view: AppView) => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout, onNavigate }) => {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div 
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => onNavigate('home')}
        >
          <div className="bg-indigo-600 p-2 rounded-lg group-hover:bg-indigo-700 transition-colors">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent leading-none">
              AAU UniFound
            </span>
            <span className="text-[7px] font-black text-slate-400 uppercase tracking-[0.2em] mt-0.5">Ambrose Alli Univ.</span>
          </div>
        </div>

        {/* Desktop Navigation - Hidden on Mobile */}
        <nav className="hidden md:flex items-center gap-6">
          <button onClick={() => onNavigate('home')} className="text-[10px] font-black text-slate-400 hover:text-indigo-600 uppercase tracking-widest transition-colors">Registry</button>
          <button onClick={() => onNavigate('about')} className="text-[10px] font-black text-slate-400 hover:text-indigo-600 uppercase tracking-widest transition-colors">About</button>
          {user && (
            <>
              <button onClick={() => onNavigate('submit')} className="text-[10px] font-black text-slate-400 hover:text-indigo-600 uppercase tracking-widest transition-colors">Report Item</button>
              <button onClick={() => onNavigate('messages')} className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg uppercase tracking-widest hover:bg-indigo-100 transition-all">Inbox</button>
              {user.role === UserRole.ADMIN && (
                <button onClick={() => onNavigate('admin')} className="text-[10px] font-black text-rose-600 bg-rose-50 px-3 py-1.5 rounded-lg uppercase tracking-widest hover:bg-rose-100 transition-all">Admin</button>
              )}
            </>
          )}
        </nav>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Mobile Admin Toggle - Visible only on mobile for Admins */}
              {user.role === UserRole.ADMIN && (
                <button 
                  onClick={() => onNavigate('admin')}
                  className="md:hidden flex items-center justify-center p-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-all border border-rose-100"
                  title="Admin Dashboard"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              )}

              <div 
                className="flex items-center gap-2 sm:gap-3 cursor-pointer p-1 rounded-2xl hover:bg-slate-50 transition-colors"
                onClick={() => onNavigate('profile')}
              >
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-slate-900 leading-tight">{user.name}</p>
                  <p className="text-[8px] text-indigo-500 font-black uppercase tracking-widest">My Profile</p>
                </div>
                <img src={user.avatar} alt={user.name} className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl ring-2 ring-indigo-50 shadow-sm" />
              </div>
              
              <button 
                onClick={onLogout}
                className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                title="Logout"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          ) : (
            <button 
              onClick={() => onNavigate('login')} 
              className="bg-indigo-600 text-white px-5 sm:px-8 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95"
            >
              Login
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;