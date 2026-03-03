import { User, Post, Message, UserRole, PostStatus } from '@/types';

const STORAGE_KEYS = {
  CURRENT_USER: 'aau_unifound_user',
  POSTS: 'aau_unifound_posts',
  MESSAGES: 'aau_unifound_messages'
};

const DEFAULT_ADMIN: User = {
  id: 'admin_primary',
  name: 'AAU Security Office',
  email: 'security@aauekpoma.edu.ng',
  role: UserRole.ADMIN,
  avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=AAU'
};

const getStorage = <T>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback;
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : fallback;
};

const setStorage = (key: string, data: any) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(data));
  }
};

export const MockApi = {
  async getCurrentUser(): Promise<User | null> {
    return getStorage<User | null>(STORAGE_KEYS.CURRENT_USER, null);
  },

  async login(email: string): Promise<User> {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (res.ok) {
        const user = await res.json();
        const mappedUser = { ...user, id: user._id };
        setStorage(STORAGE_KEYS.CURRENT_USER, mappedUser);
        return mappedUser;
      }
    } catch (e) {
      console.warn("API login failed, falling back to mock:", e);
    }

    // Mock fallback
    const mockUser: User = email.includes('admin') ? DEFAULT_ADMIN : {
      id: `user_${Date.now()}`,
      name: email.split('@')[0],
      email: email,
      role: UserRole.USER,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
    };
    setStorage(STORAGE_KEYS.CURRENT_USER, mockUser);
    return mockUser;
  },

  async logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  },

  async getPosts(role: UserRole, userId?: string): Promise<Post[]> {
    try {
      const params = new URLSearchParams();
      if (role) params.append('role', role);
      if (userId) params.append('userId', userId);
      
      const res = await fetch(`/api/posts?${params.toString()}`);
      if (res.ok) {
        const posts = await res.json();
        return posts.map((p: any) => ({ ...p, id: p._id }));
      }
    } catch (e) {
      console.warn("API fetch posts failed:", e);
    }
    return [];
  },

  async createPost(postData: any): Promise<Post> {
    const user = await this.getCurrentUser();
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...postData,
          userAvatar: user?.avatar
        })
      });
      if (res.ok) {
        const post = await res.json();
        return { ...post, id: post._id };
      }
    } catch (e) {
      console.warn("API create post failed:", e);
    }
    throw new Error("Failed to create post");
  },

  async updatePostStatus(postId: string, status: PostStatus): Promise<void> {
    try {
      await fetch(`/api/posts/${postId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
    } catch (e) {
      console.warn("API update post failed:", e);
    }
  },

  async deletePost(postId: string): Promise<void> {
    try {
      await fetch(`/api/posts/${postId}`, {
        method: 'DELETE'
      });
    } catch (e) {
      console.warn("API delete post failed:", e);
    }
  },

  async getMessages(postId: string, userId?: string, role?: string): Promise<Message[]> {
    try {
      const params = new URLSearchParams({ postId });
      if (userId) params.append('userId', userId);
      if (role) params.append('role', role);
      const res = await fetch(`/api/messages?${params.toString()}`);
      if (res.ok) {
        const msgs = await res.json();
        return msgs.map((m: any) => ({ ...m, id: m._id }));
      }
    } catch (e) {
      console.warn("API fetch messages failed:", e);
    }
    return [];
  },

  async sendMessage(msgData: any): Promise<Message> {
    const user = await this.getCurrentUser();
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...msgData,
          senderAvatar: user?.avatar
        })
      });
      if (res.ok) {
        const msg = await res.json();
        return { ...msg, id: msg._id };
      }
    } catch (e) {
      console.warn("API send message failed:", e);
    }
    throw new Error("Failed to send message");
  },

  async getUserInbox(userId: string, role?: string): Promise<any[]> {
    try {
      const res = await fetch(`/api/messages?userId=${userId}${role ? `&role=${role}` : ''}`);
      if (res.ok) {
        const messages = await res.json();
        const mappedMessages = messages.map((m: any) => ({ ...m, id: m._id }));
        
        // Fetch posts to get titles
        const posts = await this.getPosts(role as UserRole);
        const postMap = new Map(posts.map(p => [p.id, p]));

        // Group by postId and user to get unique conversations
        const conversations = new Map<string, any>();
        for (const m of mappedMessages) {
          const isMe = m.senderId === userId || (role === 'ADMIN' && m.senderId === 'admin_primary');
          const otherUserId = isMe ? m.recipientId : m.senderId;
          const convKey = `${m.postId}_${otherUserId}`;
          const post = postMap.get(m.postId) || { id: m.postId, title: 'Property Inquiry' };

          if (!conversations.has(convKey)) {
            conversations.set(convKey, { 
              lastMessage: m, 
              post: post,
              otherUser: { 
                id: otherUserId, 
                name: !isMe ? m.senderName : 'Campus User',
                avatar: !isMe ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${m.senderId}` : 'https://api.dicebear.com/7.x/bottts/svg?seed=AAU'
              }
            });
          } else {
            const current = conversations.get(convKey);
            if (new Date(m.timestamp) > new Date(current.lastMessage.timestamp)) {
              const updatedName = !isMe ? m.senderName : current.otherUser.name;
              conversations.set(convKey, { 
                ...current, 
                lastMessage: m,
                otherUser: { ...current.otherUser, name: updatedName }
              });
            } else if (!isMe) {
              conversations.set(convKey, { 
                ...current, 
                otherUser: { ...current.otherUser, name: m.senderName }
              });
            }
          }
        }
        return Array.from(conversations.values());
      }
    } catch (e) {
      console.warn("API fetch inbox failed:", e);
    }
    return [];
  },

  async updateUserProfile(userId: string, data: Partial<User>): Promise<User> {
    // Mock update
    const current = await this.getCurrentUser();
    if (current && current.id === userId) {
      const updated = { ...current, ...data };
      setStorage(STORAGE_KEYS.CURRENT_USER, updated);
      return updated;
    }
    throw new Error("User not found");
  },

  async updatePresence(userId: string): Promise<void> {
    try {
      await fetch('/api/users/presence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
    } catch (e) {
      console.warn("Presence update failed:", e);
    }
  },

  async getUserPresence(userId: string): Promise<{ isOnline: boolean; lastSeen?: string }> {
    try {
      const res = await fetch(`/api/users/presence?userId=${userId}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn("Presence fetch failed:", e);
    }
    return { isOnline: false };
  }
};
