import { NextResponse } from 'next/server';
import { generateToken, sendVerificationEmail } from '@/utils/emailService';
import { findUserByEmail, createOrUpdateUser } from '@/lib/db/userModel';

export async function POST(request) {
  try {
    console.log('Received request to send verification email');
    const body = await request.json();
    const { email, name } = body;
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required', success: false },
        { status: 400 }
      );
    }
    
    // Check if user exists
    let user = await findUserByEmail(email);
    
    if (!user && name) {
      console.log(`Creating new user: ${email}, ${name}`);
      user = await createOrUpdateUser({
        email,
        name,
        isVerified: false
      });
    } else if (!user) {
      return NextResponse.json(
        { error: 'User not found', success: false },
        { status: 404 }
      );
    }
    
    // Generate token
    const token = await generateToken(email, 'verification');
    
    // Send verification email
    await sendVerificationEmail(email, token, name);
    
    return NextResponse.json({ 
      success: true,
      message: 'Verification email sent successfully'
    });
  } catch (error) {
    console.error('Error sending verification email:', error);
    return NextResponse.json(
      { error: 'Failed to send verification email', success: false },
      { status: 500 }
    );
  }
}
