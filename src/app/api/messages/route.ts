import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Message from '@/models/Message';

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

    const message = await Message.create({
      ...msgData,
      timestamp: new Date()
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error('Messages POST API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
