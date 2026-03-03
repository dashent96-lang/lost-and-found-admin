import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage {
  _id: string;
  postId: string;
  senderId: string;
  recipientId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: Date;
  isAdmin: boolean;
}

const MessageSchema: Schema = new Schema({
  _id: { type: String, default: () => `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` },
  postId: { type: String, required: true },
  senderId: { type: String, required: true },
  recipientId: { type: String, required: true },
  senderName: { type: String, required: true },
  senderAvatar: { type: String },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  isAdmin: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema);
