import { UserRole } from '../types';

/**
 * User Schema Definition
 * In a real backend, this would be wrapped in `mongoose.model('User', UserSchema)`
 */
export const UserSchema = {
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  role: { type: String, enum: Object.values(UserRole), default: UserRole.USER },
  avatar: String,
  createdAt: { type: Date, default: Date.now }
};