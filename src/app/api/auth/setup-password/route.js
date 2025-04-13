import { NextResponse } from 'next/server';
import { verifyToken, deleteToken } from '@/utils/emailService';
import { setUserPassword } from '@/lib/db/userModel';

export async function POST(request) {
  try {
    const body = await request.json();
    const { token, password } = body;
    
    console.log('Setting password with token:', token ? token.substring(0, 8) + '...' : 'none');
    
    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token and password are required' },
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
    
    // Set the user password
    await setUserPassword(tokenData.email, password);
    console.log('Password set successfully for:', tokenData.email);
    
    // Delete the used token
    await deleteToken(token);
    
    return NextResponse.json({ 
      success: true,
      message: 'Password set successfully',
      email: tokenData.email
    });
  } catch (error) {
    console.error('Error setting password:', error);
    return NextResponse.json(
      { error: 'Failed to set password' },
      { status: 500 }
    );
  }
}
