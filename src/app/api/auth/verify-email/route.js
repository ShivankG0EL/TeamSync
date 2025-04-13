import { NextResponse } from 'next/server';
import { verifyToken, deleteToken } from '@/utils/emailService';
import { verifyUserEmail } from '@/lib/db/userModel';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    
    console.log('Verifying token:', token ? token.substring(0, 8) + '...' : 'none');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }
    
    // Verify the token
    const tokenData = await verifyToken(token, 'verification');
    
    if (!tokenData.valid) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 400 }
      );
    }
    
    // Verify the user email but don't delete the token yet, as it will be used for password setup
    await verifyUserEmail(tokenData.email);
    console.log('Email verified for:', tokenData.email);
    
    return NextResponse.json({ 
      success: true,
      message: 'Email verified successfully',
      email: tokenData.email
    });
  } catch (error) {
    console.error('Error verifying email:', error);
    return NextResponse.json(
      { error: 'Failed to verify email' },
      { status: 500 }
    );
  }
}
