import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/dbConfig';
import Member from '@/lib/dbmodels/member';
import Leader from '@/lib/dbmodels/leader';
import Admin from '@/lib/dbmodels/admin';
import Auth from '@/lib/dbmodels/auth';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password, role } = body;
    
    // Basic validation
    if (!email || !password || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Connect to database
    await connectDB();
    
    // Find user based on role
    let user;
    let userType = role;
    
    if (role === 'member') {
      user = await Member.findOne({ email });
    } else if (role === 'leader') {
      user = await Leader.findOne({ email });
    } else if (role === 'admin') {
      user = await Admin.findOne({ email });
    } else {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }
    
    // Check if user exists
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    // Generate authentication token
    const token = await Auth.generateToken(user, userType);
    
    // Update last login time
    user.lastLogin = new Date();
    await user.save();
    
    // Return user info and token
    return NextResponse.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: userType,
        company: user.company
      },
      token
    });
    
  } catch (error) {
    console.error('Signin error:', error);
    return NextResponse.json(
      { error: 'An error occurred during sign in' },
      { status: 500 }
    );
  }
}

// For handling OPTIONS requests (CORS preflight)
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}
