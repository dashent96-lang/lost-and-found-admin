import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Message from '@/models/Message';
import Post from '@/models/Post';
import { PostType } from '@/types';

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');
    const userId = searchParams.get('userId');
    const role = searchParams.get('role');

    let query: any = {};
    if (postId) query.postId = postId;
    
    if (userId) {
      const isAdmin = role === 'ADMIN' || userId === 'admin_primary' || userId.includes('admin');
      
      if (isAdmin) {
        // Admin sees all messages to/from them, OR any message sent to the generic 'admin_primary' address
        query.$or = [
          { senderId: userId }, 
          { recipientId: userId }, 
          { recipientId: 'admin_primary' },
          { senderId: 'admin_primary' }
        ];
      } else {
        // Regular user sees only their own messages
        query.$or = [{ senderId: userId }, { recipientId: userId }];
      }
    }

    const messages = await Message.find(query).sort({ timestamp: 1 });
    return NextResponse.json(messages);
  } catch (error) {
    console.error('Messages GET API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const msgData = await request.json();

    // 1️⃣ Save the user's message
    const message = await Message.create({
      ...msgData,
      timestamp: new Date()
    });

    // 2️⃣ Only trigger auto-reply if sender is NOT admin
    if (!msgData.isAdmin) {

      // 3️⃣ Check if admin already auto-replied to this user for this post
      const existingAdminReply = await Message.findOne({
        postId: msgData.postId,
        recipientId: msgData.senderId,
        isAdmin: true
      });

      if (!existingAdminReply) {

        const post = await Post.findById(msgData.postId);

        if (post) {
          let autoReplyText = "";

          // 4️⃣ Use ENUM safely
          if (post.type === PostType.FOUND) {
            autoReplyText =
              "If this item is yours, please come to the Lost and Found Office to initiate a claim and bring proof of ownership.";
          }

          if (post.type === PostType.LOST) {
            autoReplyText =
              "Please, if you have seen or currently have this item in your possession, kindly return it to the Lost and Found Office so the owner can initiate a claim.";
          }

          // 5️⃣ Create automated admin reply
          await Message.create({
            postId: msgData.postId,
            senderId: "admin_primary",
            recipientId: msgData.senderId,
            senderName: "Admin",
            content: autoReplyText,
            timestamp: new Date(),
            isAdmin: true
          });
        }
      }
    }

    return NextResponse.json(message);

  } catch (error) {
    console.error('Messages POST API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
