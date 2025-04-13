import { NextResponse } from 'next/server';
import { verifyToken } from '@/utils/emailService';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const type = searchParams.get('type') || 'verification';
    
    if (!token) {
      return NextResponse.json(
        { valid: false, error: 'Token is required' },
        { status: 400 }
      );
    }
    
    const tokenData = await verifyToken(token, type);
    
    if (!tokenData.valid) {
      return NextResponse.json(
        { valid: false, error: 'Invalid or expired token' },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ 
      valid: true,
      email: tokenData.email,
      createdAt: tokenData.createdAt
    });
  } catch (error) {
    console.error('Error verifying token:', error);
    return NextResponse.json(
      { valid: false, error: 'Failed to verify token' },
      { status: 500 }
    );
  }
}
