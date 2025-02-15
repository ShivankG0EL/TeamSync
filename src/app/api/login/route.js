import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connect } from '@/lib/dbConfig';
import { User } from '@/lib/db/userSchema';
import { checkUserLoginType } from '@/lib/db/models/userModel';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;
    
    // If only email is provided, check login type
    if (email && !password) {
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

      return NextResponse.json({
        message: "Email verified",
        success: true
      });
    }

    // If both email and password are provided, verify credentials
    if (email && password) {
      await connect();
      
      const user = await User.findOne({ email });
      
      if (!user) {
        return NextResponse.json({
          error: 'Invalid credentials',
          success: false
        });
      }

      const isPasswordMatch = await bcrypt.compare(password, user.password);
      
      if (!isPasswordMatch) {
        return NextResponse.json({
          error: 'Invalid credentials',
          success: false
        });
      }

      return NextResponse.json({
        message: "Login successful",
        success: true
      });
    }

    return NextResponse.json({
      error: 'Invalid request',
      success: false
    });

  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
