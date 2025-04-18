import { NextResponse } from 'next/server';
import Auth from '@/lib/dbmodels/auth';
import connectDB from '@/lib/dbConfig';

export async function POST(request) {
  try {
    await connectDB();
    
    // Get token from request body
    const { token } = await request.json();
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Token is required' },
        { status: 400 }
      );
    }
    
    // Find and invalidate the token in database
    const result = await Auth.findOneAndUpdate(
      { token: token },
      { isValid: false },
      { new: true } // Return the updated document
    );
    
    console.log('Token invalidation result:', result);
    
    if (!result) {
      return NextResponse.json(
        { success: false, message: 'Token not found or already invalidated' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { success: true, message: 'Logged out successfully', tokenId: result._id },
      { status: 200 }
    );
  } catch (error) {
    console.error('Signout error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred during sign out', error: error.message },
      { status: 500 }
    );
  }
}
