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
    const { userId } = params;
    
    // Check authorization
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized - Not signed in' }, { status: 401 });
    }
    
    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 403 });
    }

    await connectDB();
    const data = await request.json();
    const { currentRole, newRole, teamId } = data;

    if (!currentRole || !newRole) {
      return NextResponse.json({ 
        error: 'Current role and new role are required' 
      }, { status: 400 });
    }

    // Find the user in the current role collection
    let user;
    if (currentRole === 'member') {
      user = await Member.findById(userId);
    } else if (currentRole === 'leader') {
      user = await Leader.findById(userId);
    } else if (currentRole === 'admin') {
      user = await Admin.findById(userId);
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Create user in the new role collection
    let newUser;
    const userData = {
      name: user.name,
      email: user.email,
      password: user.password,
      phone: user.phone,
      isActive: true,
      status: 'active'
    };

    if (newRole === 'member') {
      newUser = await Member.create({
        ...userData,
        role: 'member',
        team: teamId || user.team,
        joinedAt: new Date()
      });

      // Update team members if team exists
      if (teamId) {
        await Team.findByIdAndUpdate(teamId, {
          $push: { members: newUser._id }
        });
      }
    } else if (newRole === 'leader') {
      newUser = await Leader.create({
        ...userData,
        position: 'Team Leader',
        teams: teamId ? [teamId] : [],
        joinedAt: new Date()
      });

      // Update team leader if team exists
      if (teamId) {
        await Team.findByIdAndUpdate(teamId, {
          leader: newUser._id
        });
      }
    } else if (newRole === 'admin') {
      newUser = await Admin.create({
        ...userData,
        role: 'admin',
        createdAt: new Date()
      });
    }

    // Handle team relationships when member is promoted to leader
    if (currentRole === 'member' && newRole === 'leader' && user.team) {
      // Add team to leader's teams array if not specified in request
      if (!teamId) {
        await Leader.findByIdAndUpdate(newUser._id, {
          $push: { teams: user.team }
        });
      }
    }

    // Handle team relationships when leader is demoted to member
    if (currentRole === 'leader' && newRole === 'member') {
      // Find all teams led by this leader
      const teams = await Team.find({ leader: userId });
      
      // Remove leader from these teams
      for (const team of teams) {
        await Team.findByIdAndUpdate(team._id, {
          $unset: { leader: "" }
        });
      }
    }

    // Delete user from the old role collection
    if (currentRole === 'member') {
      await Member.findByIdAndDelete(userId);
    } else if (currentRole === 'leader') {
      await Leader.findByIdAndDelete(userId);
    } else if (currentRole === 'admin') {
      await Admin.findByIdAndDelete(userId);
    }

    return NextResponse.json({ 
      success: true, 
      message: `User role changed from ${currentRole} to ${newRole}`,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newRole
      }
    });
  } catch (error) {
    console.error('Change role error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
