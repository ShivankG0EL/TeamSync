import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { checkUserLoginType } from '@/lib/db/models/userModel';
import { User } from '@/lib/db/userSchema';
import { connect } from '@/lib/dbConfig';

export async function POST(request) {
  try {
    const body = await request.json();
    
    // If only email is provided, check if it exists
    if (body.email && !body.password) {
      const { exists, type } = await checkUserLoginType(body.email);
      
      if (exists && type !== 'Manual') {
        return NextResponse.json({
          redirect: `/?error=wrong_provider&provider=${type}&email=${encodeURIComponent(body.email)}`
        });
      }

      if (exists && type === 'Manual') {
        return NextResponse.json({
          error: 'User already exists',
          success: false
        });
      }

      return NextResponse.json({
        message: "Email available",
        success: true
      });
    }

    // Handle full registration
    const { email, password, name } = body;
    
    const { exists, type } = await checkUserLoginType(email);
    
    if (exists && type !== 'Manual') {
      return NextResponse.json({
        redirect: `/?error=wrong_provider&provider=${type}&email=${encodeURIComponent(email)}`
      });
    }

    if (exists && type === 'Manual') {
      return NextResponse.json({
        error: 'User already exists',
        success: false
      });
    }

    await connect();
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      email,
      name,
      password: hashedPassword
    });

    await newUser.save();
    
    return NextResponse.json({
      message: "User created successfully",
      success: true
    });

  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
