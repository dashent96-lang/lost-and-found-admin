import { User, Post, Message, UserRole, PostStatus, PostType } from "../types";

const STORAGE_KEYS = {
  USERS: 'unifound_v2_users',
  POSTS: 'unifound_v2_posts',
  MESSAGES: 'unifound_v2_messages',
  CURRENT_USER: 'unifound_v2_session'
};

const DEFAULT_ADMIN: User = {
  id: 'admin_primary',
  name: 'AAU Property Office',
  email: 'admin@aauekpoma.edu.ng',
  role: UserRole.ADMIN,
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin&backgroundColor=4f46e5'
};

const getStorage = <T,>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (e) {
    console.error(`Storage Access Error [${key}]:`, e);
    return defaultValue;
  }
};

const setStorage = <T,>(key: string, data: T) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Storage Sync Error [${key}]:`, e);
  }
};

export const MockApi = {
  async init() {
    // No-op on client, initialization handled by API routes
  },

  async getCurrentUser(): Promise<User | null> {
    if (typeof window === 'undefined') return null;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error("Failed to parse user session:", e);
      return null;
    }
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
      console.warn("API login failed, falling back to local storage:", e);
    }

    // Fallback: Check if it's the admin or a known user in local storage
    if (email === DEFAULT_ADMIN.email) {
      setStorage(STORAGE_KEYS.CURRENT_USER, DEFAULT_ADMIN);
      return DEFAULT_ADMIN;
    }

    // Create a mock user for other emails
    const mockUser: User = {
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
        if (Array.isArray(posts)) {
          const mapped = posts.map((p: any) => ({ ...p, id: p._id }));
          setStorage(STORAGE_KEYS.POSTS, mapped); // Sync local storage
          return mapped;
        }
      }
    } catch (e) {
      console.warn("API fetch failed, falling back to local storage:", e);
    }

    // Fallback to local storage
    const localPosts = getStorage<Post[]>(STORAGE_KEYS.POSTS, []);
    if (role === UserRole.ADMIN) return localPosts;
    if (userId) return localPosts.filter(p => p.userId === userId);
    return localPosts.filter(p => p.status === PostStatus.APPROVED);
  },

  async createPost(postData: Omit<Post, 'id' | 'createdAt' | 'status'>): Promise<Post> {
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData)
      });
      if (res.ok) {
        const post = await res.json();
        return { ...post, id: post._id };
      }
    } catch (e) {
      console.warn("API create failed, falling back to local storage:", e);
    }

    // Fallback
    const localPosts = getStorage<Post[]>(STORAGE_KEYS.POSTS, []);
    const newPost: Post = {
      ...postData,
      id: `local_${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: PostStatus.PENDING
    };
    setStorage(STORAGE_KEYS.POSTS, [...localPosts, newPost]);
    return newPost;
  },

  async updatePostStatus(postId: string, status: PostStatus): Promise<void> {
    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) return;
    } catch (e) {
      console.warn("API update status failed, falling back to local storage:", e);
    }

    const localPosts = getStorage<Post[]>(STORAGE_KEYS.POSTS, []);
    const updated = localPosts.map(p => p.id === postId ? { ...p, status } : p);
    setStorage(STORAGE_KEYS.POSTS, updated);
  },

  async deletePost(postId: string): Promise<void> {
    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE'
      });
      if (res.ok) return;
    } catch (e) {
      console.warn("API delete failed, falling back to local storage:", e);
    }

    const localPosts = getStorage<Post[]>(STORAGE_KEYS.POSTS, []);
    const filtered = localPosts.filter(p => p.id !== postId);
    setStorage(STORAGE_KEYS.POSTS, filtered);
  },

  async getMessages(postId: string, userId?: string): Promise<Message[]> {
    try {
      const params = new URLSearchParams({ postId });
      if (userId) params.append('userId', userId);
      
      const res = await fetch(`/api/messages?${params.toString()}`);
      if (res.ok) {
        const messages = await res.json();
        if (Array.isArray(messages)) {
          const mapped = messages.map((m: any) => ({ ...m, id: m._id }));
          // We don't easily sync all messages to one key, but we can try
          return mapped;
        }
      }
    } catch (e) {
      console.warn("API fetch messages failed, falling back to local storage:", e);
    }

    const localMessages = getStorage<Message[]>(STORAGE_KEYS.MESSAGES, []);
    return localMessages.filter(m => m.postId === postId);
  },

  async getAdminInbox(): Promise<any[]> {
    let messages: Message[] = [];
    let posts: Post[] = [];

    try {
      const resMsgs = await fetch('/api/messages');
      const resPosts = await fetch('/api/posts?role=ADMIN');
      
      if (resMsgs.ok && resPosts.ok) {
        const rawMessages = await resMsgs.json();
        const rawPosts = await resPosts.json();
        messages = (Array.isArray(rawMessages) ? rawMessages : []).map((m: any) => ({ ...m, id: m._id }));
        posts = (Array.isArray(rawPosts) ? rawPosts : []).map((p: any) => ({ ...p, id: p._id }));
      } else {
        throw new Error('Failed to fetch inbox from API');
      }
    } catch (e) {
      console.warn("MockApi.getAdminInbox API failed, falling back to local storage:", e);
      messages = getStorage<Message[]>(STORAGE_KEYS.MESSAGES, []);
      posts = getStorage<Post[]>(STORAGE_KEYS.POSTS, []);
    }
    
    const threads = new Map<string, any>();
    
    messages.forEach(m => {
      const studentId = m.isAdmin ? m.recipientId : m.senderId;
      const key = `${m.postId}_${studentId}`;
      const post = posts.find(p => p.id === m.postId);
      if (!post) return;

      const current = threads.get(key);
      const mTime = new Date(m.timestamp).getTime();
      const cTime = current ? new Date(current.lastMessage.timestamp).getTime() : 0;

      if (!current || mTime > cTime) {
        threads.set(key, {
          post,
          lastMessage: m,
          user: { id: studentId, name: m.isAdmin ? 'Student Registry User' : m.senderName }
        });
      }
    });

    return Array.from(threads.values()).sort((a, b) => 
      new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime()
    );
  },

  async getUserInbox(userId: string): Promise<any[]> {
    let messages: Message[] = [];
    let posts: Post[] = [];

    try {
      const resMsgs = await fetch(`/api/messages?userId=${userId}`);
      const resPosts = await fetch('/api/posts'); // Public posts
      
      if (resMsgs.ok && resPosts.ok) {
        const rawMessages = await resMsgs.json();
        const rawPosts = await resPosts.json();
        messages = (Array.isArray(rawMessages) ? rawMessages : []).map((m: any) => ({ ...m, id: m._id }));
        posts = (Array.isArray(rawPosts) ? rawPosts : []).map((p: any) => ({ ...p, id: p._id }));
      } else {
        throw new Error('Failed to fetch user inbox from API');
      }
    } catch (e) {
      console.warn("MockApi.getUserInbox API failed, falling back to local storage:", e);
      const allMessages = getStorage<Message[]>(STORAGE_KEYS.MESSAGES, []);
      messages = allMessages.filter(m => m.senderId === userId || m.recipientId === userId);
      posts = getStorage<Post[]>(STORAGE_KEYS.POSTS, []);
    }
    
    const userThreadPostIds = new Set(messages.map(m => m.postId));
    const conversations: any[] = [];

    userThreadPostIds.forEach(pid => {
      const postMessages = messages
        .filter(m => m.postId === pid)
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      
      const post = posts.find(p => p.id === pid);
      if (post && postMessages.length > 0) {
        conversations.push({
          post,
          lastMessage: postMessages[postMessages.length - 1]
        });
      }
    });

    return conversations.sort((a, b) => 
      new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime()
    );
  },

  async sendMessage(msgData: any): Promise<Message> {
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(msgData)
      });
      if (res.ok) {
        const msg = await res.json();
        return { ...msg, id: msg._id };
      }
    } catch (e) {
      console.warn("API send message failed, falling back to local storage:", e);
    }

    const localMessages = getStorage<Message[]>(STORAGE_KEYS.MESSAGES, []);
    const newMessage: Message = {
      ...msgData,
      id: `msg_${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    setStorage(STORAGE_KEYS.MESSAGES, [...localMessages, newMessage]);
    return newMessage;
  },

  async updateUserProfile(userId: string, data: Partial<User>): Promise<User> {
    // We don't have a dedicated user update route yet, but we can add one if needed
    // For now, let's just update the local session if it's the same user
    const currentSession = await this.getCurrentUser();
    if (currentSession?.id === userId) {
      const updatedUser = { ...currentSession, ...data };
      setStorage(STORAGE_KEYS.CURRENT_USER, updatedUser);
      return updatedUser;
    }
    return currentSession!;
  }
};
