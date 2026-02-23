import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import User from '@/models/User';
import { UserRole } from '@/types';

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const { email } = await request.json();
    
    let user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      const isNewAdmin = email.toLowerCase().includes('admin');
      user = await User.create({
        name: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1),
        email: email.toLowerCase(),
        role: isNewAdmin ? UserRole.ADMIN : UserRole.USER,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`
      });
    }
    
    return NextResponse.json(user);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
