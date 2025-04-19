import { NextResponse } from 'next/server';
import connectDB from '@/lib/dbConfig';
import Member from '@/lib/dbmodels/member';
import Leader from '@/lib/dbmodels/leader';
import Admin from '@/lib/dbmodels/admin';
import Team from '@/lib/dbmodels/teams';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';

export async function PUT(request, { params }) {
  try {
    // Check authorization
    // const session = await getServerSession(authOptions);
    // if (!session || session.user.role !== 'admin') {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }
    
    await connectDB();
    const data = await request.json();
    const { action, role, email, teamId, userId } = data;
    
    if (!action || !role || !email) {
      return NextResponse.json({ 
        error: 'Action, role, and email are required' 
      }, { status: 400 });
    }
    
    if (action !== 'add' && action !== 'remove') {
      return NextResponse.json({ 
        error: 'Action must be either "add" or "remove"' 
      }, { status: 400 });
    }
    
    // Find user by email to get data for potential new role creation
    let userData = {};
    let existingAdmin = await Admin.findOne({ email });
    let existingLeader = await Leader.findOne({ email });
    let existingMember = await Member.findOne({ email });
    
    if (existingAdmin) {
      userData = {
        name: existingAdmin.name,
        email: existingAdmin.email,
        password: existingAdmin.password,
        status: 'active',
        isActive: true
      };
    } else if (existingLeader) {
      userData = {
        name: existingLeader.name,
        email: existingLeader.email,
        password: existingLeader.password,
        status: 'active',
        isActive: true
      };
    } else if (existingMember) {
      userData = {
        name: existingMember.name,
        email: existingMember.email,
        password: existingMember.password,
        status: 'active',
        isActive: true
      };
    } else if (action === 'add') {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Handle adding a role
    if (action === 'add') {
      if (role === 'admin' && !existingAdmin) {
        await Admin.create({
          ...userData,
          role: 'admin',
          createdAt: new Date()
        });
      } 
      
      else if (role === 'leader' && !existingLeader) {
        const leader = await Leader.create({
          ...userData,
          position: 'Team Leader',
          teams: teamId ? [teamId] : [],
          joinedAt: new Date()
        });
        
        // Update team with leader reference if specified
        if (teamId) {
          await Team.findByIdAndUpdate(teamId, { leader: leader._id });
        }
      } 
      
      else if (role === 'member' && !existingMember) {
        const member = await Member.create({
          ...userData,
          role: 'member',
          team: teamId || null,
          joinedAt: new Date()
        });
        
        // Add member to team if specified
        if (teamId) {
          await Team.findByIdAndUpdate(teamId, {
            $push: { members: member._id }
          });
        }
      }
    }
    // Handle removing a role
    else if (action === 'remove') {
      if (role === 'admin' && existingAdmin) {
        // Check if this is the user's only role
        if (!existingLeader && !existingMember) {
          return NextResponse.json({ 
            error: 'Cannot remove the only role from a user'
          }, { status: 400 });
        }
        await Admin.findOneAndDelete({ email });
      } 
      
      else if (role === 'leader' && existingLeader) {
        // Check if this is the user's only role
        if (!existingAdmin && !existingMember) {
          return NextResponse.json({ 
            error: 'Cannot remove the only role from a user'
          }, { status: 400 });
        }
        
        // Handle team relationships
        const teams = await Team.find({ leader: existingLeader._id });
        for (const team of teams) {
          await Team.findByIdAndUpdate(team._id, { $unset: { leader: "" } });
        }
        
        await Leader.findOneAndDelete({ email });
      } 
      
      else if (role === 'member' && existingMember) {
        // Check if this is the user's only role
        if (!existingAdmin && !existingLeader) {
          return NextResponse.json({ 
            error: 'Cannot remove the only role from a user'
          }, { status: 400 });
        }
        
        // Remove member from their team if they belong to one
        if (existingMember.team) {
          await Team.findByIdAndUpdate(existingMember.team, {
            $pull: { members: existingMember._id }
          });
        }
        
        await Member.findOneAndDelete({ email });
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `User role ${action === 'add' ? 'added' : 'removed'} successfully`
    });
  } catch (error) {
    console.error('Update roles error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
