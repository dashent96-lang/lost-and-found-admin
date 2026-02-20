/**
 * Message Schema Definition
 * Conversations are grouped by PostId and UserIds
 */
export const MessageSchema = {
  postId: { type: String, required: true },
  senderId: { type: String, required: true },
  recipientId: { type: String, required: true },
  senderName: { type: String, required: true },
  content: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now }
};