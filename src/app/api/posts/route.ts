import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Post from '@/models/Post';
import { PostStatus, UserRole } from '@/types';

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const userId = searchParams.get('userId');

    let query: any = {};

    if (role === UserRole.ADMIN) {
      // Admin sees everything
    } else if (userId) {
      // User sees their own posts
      query.userId = userId;
    } else {
      // Public sees only approved posts
      query.status = PostStatus.APPROVED;
    }

    const posts = await Post.find(query).sort({ createdAt: -1 });
    return NextResponse.json(posts);
  } catch (error) {
    console.error('Posts GET API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const postData = await request.json();

    const post = await Post.create({
      ...postData,
      status: PostStatus.PENDING,
      createdAt: new Date()
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error('Posts POST API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
