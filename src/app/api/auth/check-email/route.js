import { NextResponse } from 'next/server';
import { checkUserLoginType, findUserByEmail } from '@/lib/db/userModel';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email } = body;
    
    if (!email) {
      return NextResponse.json({
        error: 'Email is required',
        success: false
      }, { status: 400 });
    }

    // Check if the email exists
    const { exists, type } = await checkUserLoginType(email);
    
    if (!exists) {
      return NextResponse.json({
        error: 'No account found with this email',
        success: false
      });
    }
    
    if (type !== 'Manual') {
      return NextResponse.json({
        redirect: `/?error=wrong_provider&provider=${type}&email=${encodeURIComponent(email)}`
      });
    }

    // User exists and is a manual login account, check verification
    const user = await findUserByEmail(email);
    
    if (!user.isVerified) {
      return NextResponse.json({
        error: 'Email not verified',
        notVerified: true,
        success: false
      });
    }

    // Email is verified, ready for password entry
    return NextResponse.json({
      success: true,
      message: 'Email verified'
    });
  } catch (error) {
    console.error('Error checking email:', error);
    return NextResponse.json(
      { error: 'An error occurred while checking email' },
      { status: 500 }
    );
  }
}
