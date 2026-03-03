import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import User from '@/models/User';
import { UserRole } from '@/types';

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    let user = await User.findOne({ email });

    if (!user) {
      // Auto-register for demo purposes
      const name = email.split('@')[0];
      const role = email.includes('admin') ? UserRole.ADMIN : UserRole.USER;
      user = await User.create({
        name,
        email,
        role,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
      });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Login API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
