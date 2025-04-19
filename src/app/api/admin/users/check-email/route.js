import { NextResponse } from 'next/server';
import connectDB from '@/lib/dbConfig';
import Member from '@/lib/dbmodels/member';
import Leader from '@/lib/dbmodels/leader';
import Admin from '@/lib/dbmodels/admin';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';

export async function GET(request) {
  try {
    // Check authorization
    // const session = await getServerSession(authOptions);
    // if (!session || session.user.role !== 'admin') {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    // Get the email from query parameters
    const url = new URL(request.url);
    const email = url.searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email parameter is required' }, { status: 400 });
    }

    await connectDB();

    // Check if email exists in any collection
    const existingAdmin = await Admin.findOne({ email });
    const existingLeader = await Leader.findOne({ email });
    const existingMember = await Member.findOne({ email });

    // Determine user roles based on which collections contain the email
    const roles = [];
    
    if (existingAdmin) roles.push({ type: 'admin', id: existingAdmin._id });
    if (existingLeader) roles.push({ type: 'leader', id: existingLeader._id });
    if (existingMember) roles.push({ type: 'member', id: existingMember._id });
    
    const exists = roles.length > 0;
    
    // If user exists, return basic user info
    let user = null;
    if (exists) {
      // Use the first record found to get the name
      const userData = existingAdmin || existingLeader || existingMember;
      
      user = {
        name: userData.name,
        email: userData.email,
        roles: roles
      };
    }
    
    return NextResponse.json({ 
      exists, 
      user
    });
  } catch (error) {
    console.error('Check email error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
