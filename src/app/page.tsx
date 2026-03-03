'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import AboutPage from '@/components/AboutPage';
import PostForm from '@/components/PostForm';
import AdminPanel from '@/components/AdminPanel';
import ProfilePage from '@/components/ProfilePage';
import PostDetailModal from '@/components/PostDetailModal';
import ChatWindow from '@/components/ChatWindow';
import LoginModal from '@/components/LoginModal';
import InboxPage from '@/components/InboxPage';
import Image from 'next/image';
import { User, Post, AppView, PostStatus, UserRole } from '@/types';
import { MockApi } from '@/services/mockApi';

export default function Home() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [activeChatPost, setActiveChatPost] = useState<Post | null>(null);
  const [activeChatTarget, setActiveChatTarget] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const loadPosts = useCallback(async () => {
    if (currentUser?.role === UserRole.ADMIN) {
      const allPosts = await MockApi.getPosts(UserRole.ADMIN);
      setPosts(allPosts);
    } else {
      const approvedPosts = await MockApi.getPosts(UserRole.USER);
      setPosts(approvedPosts);
    }
  }, [currentUser]);

  useEffect(() => {
    const init = async () => {
      const user = await MockApi.getCurrentUser();
      setCurrentUser(user);
      setIsLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      loadPosts();
    }
  }, [isLoading, loadPosts]);

  useEffect(() => {
    if (currentUser) {
      const heartbeat = async () => {
        await MockApi.updatePresence(currentUser.id);
      };
      heartbeat();
      const interval = setInterval(heartbeat, 30000);
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setCurrentView('home');
    setIsLoginModalOpen(false);
  };

  const handleLogout = async () => {
    await MockApi.logout();
    setCurrentUser(null);
    setCurrentView('home');
  };

  const handleCreatePost = async (data: any) => {
    if (!currentUser) return;
    setIsSubmitting(true);
    try {
      await MockApi.createPost({
        ...data,
        userId: currentUser.id,
        userName: currentUser.name,
        category: 'General'
      });
      await loadPosts();
      setCurrentView('home');
    } catch (error) {
      alert("Failed to create report.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePostAction = async (postId: string, status: PostStatus) => {
    await MockApi.updatePostStatus(postId, status);
    await loadPosts();
  };

  const handleDeletePost = async (postId: string) => {
    if (confirm("Are you sure you want to delete this report permanently?")) {
      await MockApi.deletePost(postId);
      await loadPosts();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-2xl animate-spin"></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Initializing Registry...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header 
        user={currentUser} 
        onLogout={handleLogout} 
        onNavigate={(view) => {
          if (view === 'login') setIsLoginModalOpen(true);
          else setCurrentView(view);
        }} 
      />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        {currentView === 'home' && (
          <div className="space-y-12">
            <section className="text-center space-y-4 py-12">
              <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight">
                AAU Campus <span className="text-indigo-600">Registry</span>
              </h1>
              <p className="text-slate-500 font-medium text-lg max-w-2xl mx-auto">
                Official property recovery system for Ambrose Alli University.
                Browse verified lost and found items.
              </p>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts
                .filter(post => post.status === PostStatus.APPROVED)
                .map(post => (
                <div 
                  key={post.id}
                  onClick={() => setSelectedPost(post)}
                  className="bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer group"
                >
                  <div className="h-64 bg-slate-100 relative overflow-hidden">
                    {post.image ? (
                      <Image 
                        src={post.image}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-200 italic font-black text-4xl">
                        AAU
                      </div>
                    )}
                    <div className="absolute top-6 left-6">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl ${
                        post.type === 'LOST'
                          ? 'bg-rose-500 text-white'
                          : 'bg-emerald-500 text-white'
                      }`}>
                        {post.type}
                      </span>
                    </div>
                  </div>

                  <div className="p-8 space-y-4">
                    <h3 className="text-2xl font-black text-slate-900 truncate">
                      {post.title}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
