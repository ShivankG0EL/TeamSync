import { NextResponse } from 'next/server';
import connectDB from "@/lib/dbConfig";
import Member from '@/lib/dbmodels/member';
import Leader from '@/lib/dbmodels/leader';
import Admin from '@/lib/dbmodels/admin';
import Team from '@/lib/dbmodels/teams';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import bcrypt from 'bcrypt';

// Get all users
export async function GET(request) {
  try {
    // Check authorization
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    // Get users from all collections
    const members = await Member.find({}, 'name email role status joinedAt team');
    const leaders = await Leader.find({}, 'name email position status joinedAt teams');
    const admins = await Admin.find({}, 'name email role status createdAt');
    
    // Prepare response
    const users = [
      ...members.map(member => ({
        ...member.toObject(),
        userType: 'member',
        createdAt: member.joinedAt
      })),
      ...leaders.map(leader => ({
        ...leader.toObject(),
        userType: 'leader',
        role: 'leader',
        createdAt: leader.joinedAt
      })),
      ...admins.map(admin => ({
        ...admin.toObject(),
        userType: 'admin',
        role: admin.role || 'admin'
      }))
    ];
    
    return NextResponse.json({ users });
  } catch (error) {
    console.error('Fetch users error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Create a new user
export async function POST(request) {
  try {
    // Check authorization
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const data = await request.json();
    const { name, email, role, password, teamId } = data;

    if (!name || !email || !role) {
      return NextResponse.json({ 
        error: 'Name, email, and role are required' 
      }, { status: 400 });
    }

    // Check if user already exists in any collection
    const existingMember = await Member.findOne({ email });
    const existingLeader = await Leader.findOne({ email });
    const existingAdmin = await Admin.findOne({ email });

    if (existingMember || existingLeader || existingAdmin) {
      return NextResponse.json({ 
        error: 'User with this email already exists' 
      }, { status: 409 });
    }

    let user;
    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

    // Create user based on role
    if (role === 'member') {
      user = await Member.create({
        name,
        email,
        role: 'member',
        password: hashedPassword,
        team: teamId || null,
        status: 'active',
        isActive: true,
        joinedAt: new Date()
      });
      
      // Add member to team if specified
      if (teamId) {
        await Team.findByIdAndUpdate(teamId, {
          $push: { members: user._id }
        });
      }
    } else if (role === 'leader') {
      user = await Leader.create({
        name,
        email,
        position: data.position || 'Team Leader',
        password: hashedPassword,
        teams: teamId ? [teamId] : [],
        status: 'active',
        isActive: true,
        joinedAt: new Date()
      });
      
      // Update team with leader if specified
      if (teamId) {
        await Team.findByIdAndUpdate(teamId, {
          leader: user._id
        });
      }
    } else if (role === 'admin') {
      user = await Admin.create({
        name,
        email,
        role: 'admin',
        password: hashedPassword,
        status: 'active',
        isActive: true,
        createdAt: new Date()
      });
    }

    return NextResponse.json({ 
      success: true, 
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: role
      }
    });
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
