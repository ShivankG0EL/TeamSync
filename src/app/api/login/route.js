import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { checkUserLoginType, findUserByEmail, generateToken, sendPasswordSetupEmail } from '@/lib/db/userModel';
import { signIn } from 'next-auth/react';
import { generateToken as genEmailToken, sendPasswordSetupEmail as sendEmail } from '@/utils/emailService';

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Phase 1: Just check if email exists
    if (body.email && !body.password) {
      const { exists, type } = await checkUserLoginType(body.email);
      
      if (!exists) {
        return NextResponse.json({
          error: 'No account found with this email',
          success: false
        });
      }
      
      if (type !== 'Manual') {
        return NextResponse.json({
          redirect: `/?error=wrong_provider&provider=${type}&email=${encodeURIComponent(body.email)}`
        });
      }

      // Email exists and is a manual login account
      const user = await findUserByEmail(body.email);
      
      if (!user.isVerified) {
        // Generate new verification token and send email
        try {
          const token = await genEmailToken(body.email, 'verification');
          await sendEmail(body.email, token);
          
          return NextResponse.json({
            error: 'Email not verified. A new verification link has been sent to your email.',
            success: false
          });
        } catch (error) {
          console.error('Failed to send verification email:', error);
          return NextResponse.json({
            error: 'Email not verified. Please contact support.',
            success: false
          });
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Email verified'
      });
    }

    // Phase 2: Check credentials and log in
    const { email, password } = body;
    
    if (!email || !password) {
      return NextResponse.json({
        error: 'Email and password are required',
        success: false
      }, { status: 400 });
    }

    const user = await findUserByEmail(email);
    
    if (!user) {
      return NextResponse.json({
        error: 'Invalid credentials',
        success: false
      });
    }

    if (!user.isVerified) {
      return NextResponse.json({
        error: 'Email not verified',
        success: false
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return NextResponse.json({
        error: 'Invalid credentials',
        success: false
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Login successful'
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred during login' },
      { status: 500 }
    );
  }
}
