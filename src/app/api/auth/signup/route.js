import { NextResponse } from 'next/server';
import connectDB from '@/lib/dbConfig';
import Member from '@/lib/dbmodels/member';
import Leader from '@/lib/dbmodels/leader';
import Admin from '@/lib/dbmodels/admin';
import { sendSetupPasswordEmail } from '@/lib/emailUtils';
import jwt from 'jsonwebtoken';

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, resendVerification = false } = body;
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }
    
    await connectDB();
    
    // Check if email exists in any user collection
    const existingMember = await Member.findOne({ email });
    const existingLeader = await Leader.findOne({ email });
    const existingAdmin = await Admin.findOne({ email });
    
    // Determine if user exists anywhere
    const existingUser = existingMember || existingLeader || existingAdmin;
    
    // If resending verification for a pending member
    if (existingMember && existingMember.status === 'pending' && resendVerification) {
      const setupToken = jwt.sign(
        { userId: existingMember._id },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
      
      await sendSetupPasswordEmail({
        email,
        name: existingMember.name,
        token: setupToken
      });
      
      return NextResponse.json(
        { 
          success: true,
          message: 'Verification link has been resent to your email',
        },
        { status: 200 }
      );
    }
    
    // User exists in any collection
    if (existingUser) {
      // For pending member allow resending verification
      if (existingMember && existingMember.status === 'pending') {
        return NextResponse.json(
          { 
            error: 'Account exists but is not verified',
            pendingVerification: true,
            userId: existingMember._id
          },
          { status: 409 }
        );
      } else {
        // User exists in some form
        return NextResponse.json(
          { error: 'User with this email already exists' },
          { status: 409 }
        );
      }
    }
    
    // Input validation for new signup
    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }
    
    // Create new user
    const newUser = await Member.create({
      name,
      email,
      role: 'member',
      isActive: false,
      status: 'pending'
    });

    // Generate setup token
    const setupToken = jwt.sign(
      { userId: newUser._id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Send setup password email
    await sendSetupPasswordEmail({
      email,
      name,
      token: setupToken
    });
    
    return NextResponse.json(
      { 
        success: true,
        message: 'Password setup link has been sent to your email',
        userId: newUser._id
      },
      { status: 201 }
    );
    
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'An error occurred during signup' },
      { status: 500 }
    );
  }
}
