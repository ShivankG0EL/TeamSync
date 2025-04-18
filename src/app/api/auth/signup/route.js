import { NextResponse } from 'next/server';
import connectDB from '@/lib/dbConfig';
import Member from '@/lib/dbmodels/member';
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
    
    const existingUser = await Member.findOne({ email });
    
    // Check if user exists but is pending
    if (existingUser && existingUser.status === 'pending') {
      // If resendVerification flag is true, regenerate token and send email
      if (resendVerification) {
        const setupToken = jwt.sign(
          { userId: existingUser._id },
          process.env.JWT_SECRET,
          { expiresIn: '1h' }
        );
        
        await sendSetupPasswordEmail({
          email,
          name: existingUser.name,
          token: setupToken
        });
        
        return NextResponse.json(
          { 
            success: true,
            message: 'Verification link has been resent to your email',
          },
          { status: 200 }
        );
      } else {
        // If not resending, inform that account exists but is pending
        return NextResponse.json(
          { 
            error: 'Account exists but is not verified',
            pendingVerification: true,
            userId: existingUser._id
          },
          { status: 409 }
        );
      }
    } else if (existingUser) {
      // User exists and is not pending
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
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
