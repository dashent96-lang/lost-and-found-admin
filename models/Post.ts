import { PostStatus, PostType } from '../types';

/**
 * Post Schema Definition
 * status: PENDING, APPROVED, CLEARED
 * type: LOST, FOUND
 */
export const PostSchema = {
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  location: { type: String, required: true },
  date: { type: Date, required: true },
  type: { type: String, enum: Object.values(PostType), required: true },
  status: { type: String, enum: Object.values(PostStatus), default: PostStatus.PENDING },
  image: String,
  createdAt: { type: Date, default: Date.now }
};