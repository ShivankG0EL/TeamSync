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
    console.log("Users API called");
    
    // Check authorization
    const session = await getServerSession(authOptions);
    console.log("Session in users API:", session);
    
    await connectDB();
    
    // Get users from all collections
    const members = await Member.find({}, 'name email role status joinedAt team');
    const leaders = await Leader.find({}, 'name email position status joinedAt teams');
    const admins = await Admin.find({}, 'name email role status createdAt');
    
    // Create a map to track unique users by email
    const userMap = new Map();
    
    // Process members
    members.forEach(member => {
      const email = member.email;
      if (!userMap.has(email)) {
        userMap.set(email, {
          _id: member._id,
          name: member.name,
          email: member.email,
          roles: [{ type: 'member', id: member._id }],
          status: member.status,
          createdAt: member.joinedAt,
          team: member.team
        });
      } else {
        const user = userMap.get(email);
        user.roles.push({ type: 'member', id: member._id });
      }
    });
    
    // Process leaders
    leaders.forEach(leader => {
      const email = leader.email;
      if (!userMap.has(email)) {
        userMap.set(email, {
          _id: leader._id,
          name: leader.name,
          email: leader.email,
          roles: [{ type: 'leader', id: leader._id }],
          status: leader.status,
          createdAt: leader.joinedAt,
          teams: leader.teams
        });
      } else {
        const user = userMap.get(email);
        user.roles.push({ type: 'leader', id: leader._id });
      }
    });
    
    // Process admins
    admins.forEach(admin => {
      const email = admin.email;
      if (!userMap.has(email)) {
        userMap.set(email, {
          _id: admin._id,
          name: admin.name,
          email: admin.email,
          roles: [{ type: 'admin', id: admin._id, adminRole: admin.role || 'admin' }],
          status: admin.status,
          createdAt: admin.createdAt,
        });
      } else {
        const user = userMap.get(email);
        user.roles.push({ type: 'admin', id: admin._id, adminRole: admin.role || 'admin' });
      }
    });
    
    // Convert map to array
    const users = Array.from(userMap.values());
    
    console.log(`Found ${users.length} unique users with multiple roles`);
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
    const { name, email, roles, password, teamId } = data;

    if (!name || !email || !roles || !roles.length) {
      return NextResponse.json({ 
        error: 'Name, email, and at least one role are required' 
      }, { status: 400 });
    }

    // Hash password if provided
    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;
    
    // Create user records for each role
    const createdUsers = [];
    const baseUserData = {
      name,
      email,
      password: hashedPassword,
      status: 'active',
      isActive: true
    };

    // Check for existing users with this email in any collection
    const existingAdmin = await Admin.findOne({ email });
    const existingLeader = await Leader.findOne({ email });
    const existingMember = await Member.findOne({ email });

    // For each role, create or update the user in appropriate collection
    for (const role of roles) {
      if (role === 'admin') {
        if (existingAdmin) {
          createdUsers.push({ type: 'admin', id: existingAdmin._id });
        } else {
          const admin = await Admin.create({
            ...baseUserData,
            role: 'admin',
            createdAt: new Date()
          });
          createdUsers.push({ type: 'admin', id: admin._id });
        }
      } 
      
      else if (role === 'leader') {
        if (existingLeader) {
          createdUsers.push({ type: 'leader', id: existingLeader._id });
          
          // Add team to existing leader if specified
          if (teamId && !existingLeader.teams.includes(teamId)) {
            await Leader.findByIdAndUpdate(existingLeader._id, {
              $push: { teams: teamId }
            });
            
            // Update team with leader reference
            await Team.findByIdAndUpdate(teamId, {
              leader: existingLeader._id
            });
          }
        } else {
          const leader = await Leader.create({
            ...baseUserData,
            position: 'Team Leader',
            teams: teamId ? [teamId] : [],
            joinedAt: new Date()
          });
          createdUsers.push({ type: 'leader', id: leader._id });
          
          // Update team with leader reference
          if (teamId) {
            await Team.findByIdAndUpdate(teamId, {
              leader: leader._id
            });
          }
        }
      } 
      
      else if (role === 'member') {
        if (existingMember) {
          createdUsers.push({ type: 'member', id: existingMember._id });
          
          // Add team to existing member if specified
          if (teamId && existingMember.team !== teamId) {
            await Member.findByIdAndUpdate(existingMember._id, {
              team: teamId
            });
            
            // Add member to team
            await Team.findByIdAndUpdate(teamId, {
              $push: { members: existingMember._id }
            });
          }
        } else {
          const member = await Member.create({
            ...baseUserData,
            role: 'member',
            team: teamId || null,
            joinedAt: new Date()
          });
          createdUsers.push({ type: 'member', id: member._id });
          
          // Add member to team
          if (teamId) {
            await Team.findByIdAndUpdate(teamId, {
              $push: { members: member._id }
            });
          }
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      user: {
        name,
        email,
        roles: createdUsers
      }
    });
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
