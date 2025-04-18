import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/dbConfig';
import Member from '@/lib/dbmodels/member';
import { sendWelcomeEmail } from '@/lib/emailUtils';

export async function POST(request) {
  try {
    const body = await request.json();
    const { token, password } = body;
    
    if (!token || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Password validation
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }
    
    // Verify and decode the token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }
    
    const { userId } = decoded;
    
    await connectDB();
    
    // Find user
    const user = await Member.findById(userId);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Hash password and update user
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.isActive = true;
    user.status = 'active';
    await user.save();
    
    // Send welcome email
    await sendWelcomeEmail({
      email: user.email,
      name: user.name
    });
    
    return NextResponse.json({
      success: true,
      message: 'Password set successfully. Your account is now active.',
      userId: user._id
    });
    
  } catch (error) {
    console.error('Set password error:', error);
    return NextResponse.json(
      { error: 'An error occurred while setting password' },
      { status: 500 }
    );
  }
}
