export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN'
}

export enum PostStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  DECLINED = 'DECLINED',
  CLEARED = 'CLEARED'
}

export enum PostType {
  LOST = 'LOST',
  FOUND = 'FOUND'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface Post {
  id: string;
  userId: string;
  userName: string;
  title: string;
  description: string;
  category: string;
  location: string;
  date: string;
  type: PostType;
  status: PostStatus;
  image?: string;
  createdAt: string;
}

export interface Message {
  id: string;
  postId: string;
  senderId: string;
  recipientId: string;
  senderName: string;
  content: string;
  timestamp: string;
  isAdmin: boolean;
}

/**
 * Helper types for the Messaging System (Inbox)
 */
export interface AdminConversation {
  post: Post;
  lastMessage: Message;
  user: {
    id: string;
    name: string;
  };
}

export interface UserConversation {
  post: Post;
  lastMessage: Message;
}

/**
 * Union type for all possible application views
 */
export type AppView = 'home' | 'submit' | 'admin' | 'my-posts' | 'about' | 'login' | 'messages' | 'profile';
