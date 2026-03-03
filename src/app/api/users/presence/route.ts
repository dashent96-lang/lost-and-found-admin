import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import User from '@/models/User';

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const { userId } = await req.json();
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    let user;
    if (userId === 'admin_primary') {
      user = await User.findOneAndUpdate(
        { role: 'ADMIN' },
        { lastSeen: new Date() },
        { new: true }
      );
    } else {
      user = await User.findByIdAndUpdate(
        userId,
        { lastSeen: new Date() },
        { new: true }
      );
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, lastSeen: user.lastSeen });
  } catch (error) {
    console.error('Presence update error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    let user;
    if (userId === 'admin_primary') {
      user = await User.findOne({ role: 'ADMIN' }).select('lastSeen');
    } else {
      user = await User.findById(userId).select('lastSeen');
    }
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const isOnline = user.lastSeen && (new Date().getTime() - new Date(user.lastSeen).getTime() < 60000); // Online if seen in last 60s

    return NextResponse.json({ 
      userId, 
      lastSeen: user.lastSeen,
      isOnline: !!isOnline
    });
  } catch (error) {
    console.error('Presence fetch error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
