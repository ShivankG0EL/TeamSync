import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { checkUserLoginType, createOrUpdateUser, findUserByEmail } from '@/lib/db/userModel';
import { connect } from '@/lib/dbConfig';
import { generateToken, sendVerificationEmail } from '@/utils/emailService';

export async function POST(request) {
  try {
    const body = await request.json();
    console.log('Register API called with body:', { 
      email: body.email, 
      name: body.name ? 'provided' : 'not provided',
      password: body.password ? 'provided' : 'not provided'
    });
    
    // If only email is provided, check if it exists
    if (body.email && !body.name && !body.password) {
      console.log('Checking if email exists:', body.email);
      const { exists, type } = await checkUserLoginType(body.email);
      
      if (exists && type !== 'Manual') {
        console.log('Email exists with different provider:', type);
        return NextResponse.json({
          redirect: `/?error=wrong_provider&provider=${type}&email=${encodeURIComponent(body.email)}`
        });
      }

      if (exists && type === 'Manual') {
        console.log('Email already exists with manual login');
        return NextResponse.json({
          error: 'User already exists',
          success: false
        });
      }

      console.log('Email is available for registration');
      return NextResponse.json({
        message: "Email available",
        success: true
      });
    }

    // Handle full registration
    const { email, password, name } = body;
    
    if (!email || !name) {
      console.log('Missing required fields');
      return NextResponse.json({
        error: 'Email and name are required',
        success: false
      }, { status: 400 });
    }
    
    const { exists, type } = await checkUserLoginType(email);
    
    if (exists && type !== 'Manual') {
      console.log('Email exists with different provider during registration:', type);
      return NextResponse.json({
        redirect: `/?error=wrong_provider&provider=${type}&email=${encodeURIComponent(email)}`
      });
    }

    if (exists && type === 'Manual') {
      console.log('Email already exists during registration');
      return NextResponse.json({
        error: 'User already exists',
        success: false
      });
    }

    await connect();
    
    // Create user with unverified status
    console.log('Creating new user:', { email, name });
    await createOrUpdateUser({
      email,
      name,
      password: password || null, // Only set password if provided
      isVerified: false
    });
    
    // Generate verification token and send email
    try {
      console.log('Generating verification token for new registration');
      const token = await generateToken(email, 'verification');
      
      console.log('Sending verification email for new registration');
      await sendVerificationEmail(email, token);
      console.log('Verification email sent successfully');
    } catch (error) {
      console.error('Failed to send verification email:', error);
      // Continue with user creation even if email sending fails
    }
    
    return NextResponse.json({
      message: "User created successfully. Check your email for verification.",
      success: true
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred during registration' },
      { status: 500 }
    );
  }
}
