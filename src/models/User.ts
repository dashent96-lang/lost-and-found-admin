import mongoose, { Schema, Document } from 'mongoose';
import { UserRole } from '@/types';

export interface IUser {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  lastSeen?: Date;
}

const UserSchema: Schema = new Schema({
  _id: { type: String, default: () => `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: Object.values(UserRole), default: UserRole.USER },
  avatar: { type: String },
  lastSeen: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
