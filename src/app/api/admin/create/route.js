import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import connectDB from '@/lib/dbConfig';
import Admin from '@/lib/dbmodels/admin';

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, password, role = 'admin', superAdminKey } = body;
    
    // Basic validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }
    
    // Verify super admin key for security
    if (superAdminKey !== process.env.SUPER_ADMIN_KEY) {
      return NextResponse.json(
        { error: 'Unauthorized. Invalid super admin key' },
        { status: 401 }
      );
    }
    
    // Connect to database
    await connectDB();
    
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return NextResponse.json(
        { error: 'Admin with this email already exists' },
        { status: 409 }
      );
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create new admin
    const newAdmin = await Admin.create({
      name,
      email,
      password: hashedPassword,
      role: role === 'super-admin' ? 'super-admin' : 'admin',
      isActive: true,
      status: 'active',
      isVerified: true,
      createdAt: new Date()
    });
    
    // Return success response without sensitive data
    return NextResponse.json({
      success: true,
      admin: {
        id: newAdmin._id,
        name: newAdmin.name,
        email: newAdmin.email,
        role: newAdmin.role,
        createdAt: newAdmin.createdAt
      }
    }, { status: 201 });
    
  } catch (error) {
    console.error('Admin creation error:', error);
    return NextResponse.json(
      { error: 'An error occurred during admin creation', details: error.message },
      { status: 500 }
    );
  }
}
