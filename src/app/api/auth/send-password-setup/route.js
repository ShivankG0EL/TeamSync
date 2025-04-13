import { NextResponse } from 'next/server';
import { generateToken, sendPasswordSetupEmail } from '@/utils/emailService';
import { findUserByEmail } from '@/lib/db/userModel';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email } = body;
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }
    
    // Check if user exists
    const user = await findUserByEmail(email);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Generate a password setup token
    const token = await generateToken(email, 'password-setup');
    
    // Send password setup email
    await sendPasswordSetupEmail(email, token);
    
    return NextResponse.json({ 
      success: true,
      message: 'Password setup email sent successfully'
    });
  } catch (error) {
    console.error('Error sending password setup email:', error);
    return NextResponse.json(
      { error: 'Failed to send password setup email' },
      { status: 500 }
    );
  }
}
