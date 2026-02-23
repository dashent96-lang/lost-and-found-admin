import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  postId: string;
  senderId: string;
  recipientId: string;
  senderName: string;
  content: string;
  timestamp: Date;
  isAdmin: boolean;
}

const MessageSchema: Schema = new Schema({
  postId: { type: String, required: true },
  senderId: { type: String, required: true },
  recipientId: { type: String, required: true },
  senderName: { type: String, required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  isAdmin: { type: Boolean, default: false }
});

export default mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema);
