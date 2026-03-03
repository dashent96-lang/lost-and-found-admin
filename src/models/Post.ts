import mongoose, { Schema, Document } from 'mongoose';
import { PostStatus, PostType } from '@/types';

export interface IPost {
  _id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  title: string;
  description: string;
  category: string;
  location: string;
  date: string;
  type: PostType;
  status: PostStatus;
  image?: string;
  createdAt: Date;
}

const PostSchema: Schema = new Schema({
  _id: { type: String, default: () => `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` },
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  userAvatar: { type: String },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  location: { type: String, required: true },
  date: { type: String, required: true },
  type: { type: String, enum: Object.values(PostType), required: true },
  status: { type: String, enum: Object.values(PostStatus), default: PostStatus.PENDING },
  image: { type: String },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.models.Post || mongoose.model<IPost>('Post', PostSchema);
