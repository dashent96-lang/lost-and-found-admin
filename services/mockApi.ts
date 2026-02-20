import { User, Post, Message, UserRole, PostStatus, PostType } from "../types";
import { connectToDatabase } from "../lib/db";

const STORAGE_KEYS = {
  USERS: 'unifound_v2_users',
  POSTS: 'unifound_v2_posts',
  MESSAGES: 'unifound_v2_messages',
  CURRENT_USER: 'unifound_v2_session'
};

const DEFAULT_ADMIN: User = {
  id: 'admin_primary',
  name: 'Campus Property Office',
  email: 'admin@uni.edu',
  role: UserRole.ADMIN,
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin&backgroundColor=b6e3f4'
};

const getStorage = <T,>(key: string, defaultValue: T): T => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultValue;
};

const setStorage = <T,>(key: string, data: T) => {
  localStorage.setItem(key, JSON.stringify(data));
};

/**
 * Service Layer Bridge
 * Note: In a true Next.js App Router environment, these methods would be 
 * implemented as Server Actions in separate files calling the Database directly.
 */
export const MockApi = {
  async init() {
    try {
      await connectToDatabase();
    } catch (err) {
      console.warn("Database initialization failed. Falling back to local state.", err);
    }
  },

  async getCurrentUser(): Promise<User | null> {
    return getStorage<User | null>(STORAGE_KEYS.CURRENT_USER, null);
  },

  async login(email: string): Promise<User> {
    const users = getStorage<User[]>(STORAGE_KEYS.USERS, [DEFAULT_ADMIN]);
    let user = users.find(u => u.email === email);
    
    if (!user) {
      user = {
        id: 'u_' + Math.random().toString(36).substr(2, 9),
        name: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1),
        email,
        role: email.includes('admin') ? UserRole.ADMIN : UserRole.USER,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
      };
      users.push(user);
      setStorage(STORAGE_KEYS.USERS, users);
    }
    
    setStorage(STORAGE_KEYS.CURRENT_USER, user);
    return user;
  },

  async updateUserProfile(userId: string, data: Partial<User>): Promise<User> {
    const users = getStorage<User[]>(STORAGE_KEYS.USERS, [DEFAULT_ADMIN]);
    const idx = users.findIndex(u => u.id === userId);
    if (idx === -1) throw new Error("User not found");
    
    const updatedUser = { ...users[idx], ...data };
    users[idx] = updatedUser;
    setStorage(STORAGE_KEYS.USERS, users);
    setStorage(STORAGE_KEYS.CURRENT_USER, updatedUser);
    return updatedUser;
  },

  async logout() {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  },

  async getPosts(role: UserRole, userId?: string): Promise<Post[]> {
    const posts = getStorage<Post[]>(STORAGE_KEYS.POSTS, []);
    if (userId) return posts.filter(p => p.userId === userId);
    if (role === UserRole.ADMIN) return posts;
    return posts.filter(p => p.status === PostStatus.APPROVED);
  },

  async createPost(postData: Omit<Post, 'id' | 'createdAt' | 'status'>): Promise<Post> {
    const posts = getStorage<Post[]>(STORAGE_KEYS.POSTS, []);
    const newPost: Post = {
      ...postData,
      id: 'p_' + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      status: PostStatus.PENDING
    };
    posts.unshift(newPost);
    setStorage(STORAGE_KEYS.POSTS, posts);
    return newPost;
  },

  async updatePostStatus(postId: string, status: PostStatus): Promise<void> {
    const posts = getStorage<Post[]>(STORAGE_KEYS.POSTS, []);
    const idx = posts.findIndex(p => p.id === postId);
    if (idx !== -1) {
      posts[idx].status = status;
      setStorage(STORAGE_KEYS.POSTS, posts);
    }
  },

  async deletePost(postId: string): Promise<void> {
    const posts = getStorage<Post[]>(STORAGE_KEYS.POSTS, []);
    setStorage(STORAGE_KEYS.POSTS, posts.filter(p => p.id !== postId));
  },

  async getMessages(postId: string, userId?: string): Promise<Message[]> {
    const messages = getStorage<Message[]>(STORAGE_KEYS.MESSAGES, []);
    return messages.filter(m => m.postId === postId && (userId ? (m.senderId === userId || m.recipientId === userId) : true));
  },

  async getAdminInbox(): Promise<{post: Post, lastMessage: Message, user: {id: string, name: string}}[]> {
    const messages = getStorage<Message[]>(STORAGE_KEYS.MESSAGES, []);
    const posts = getStorage<Post[]>(STORAGE_KEYS.POSTS, []);
    const threads = new Map<string, {post: Post, lastMessage: Message, user: {id: string, name: string}}>();
    
    messages.forEach(m => {
      const studentId = m.isAdmin ? m.recipientId : m.senderId;
      const key = `${m.postId}_${studentId}`;
      const post = posts.find(p => p.id === m.postId);
      if (!post) return;

      const current = threads.get(key);
      if (!current || new Date(m.timestamp) > new Date(current.lastMessage.timestamp)) {
        threads.set(key, {
          post,
          lastMessage: m,
          user: { id: studentId, name: m.isAdmin ? 'Student' : m.senderName }
        });
      }
    });

    return Array.from(threads.values()).sort((a, b) => 
      new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime()
    );
  },

  async getUserInbox(userId: string): Promise<{post: Post, lastMessage: Message}[]> {
    const messages = getStorage<Message[]>(STORAGE_KEYS.MESSAGES, []);
    const posts = getStorage<Post[]>(STORAGE_KEYS.POSTS, []);
    const userThreadPostIds = new Set(messages.filter(m => m.senderId === userId || m.recipientId === userId).map(m => m.postId));
    const conversations: {post: Post, lastMessage: Message}[] = [];

    userThreadPostIds.forEach(pid => {
      const postMessages = messages.filter(m => m.postId === pid && (m.senderId === userId || m.recipientId === userId));
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

  async sendMessage(msgData: {postId: string, senderId: string, senderName: string, recipientId: string, content: string, isAdmin: boolean}): Promise<Message> {
    const messages = getStorage<Message[]>(STORAGE_KEYS.MESSAGES, []);
    const newMsg: Message = {
      ...msgData,
      id: 'm_' + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString()
    };
    messages.push(newMsg);
    setStorage(STORAGE_KEYS.MESSAGES, messages);
    return newMsg;
  }
};