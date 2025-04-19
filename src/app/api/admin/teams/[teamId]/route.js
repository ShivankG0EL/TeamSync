import { NextResponse } from 'next/server';
import connectDB from '@/lib/dbConfig';
import Team from '@/lib/dbmodels/teams';
import Leader from '@/lib/dbmodels/leader';
import Member from '@/lib/dbmodels/member';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';

// Get a specific team
export async function GET(request, { params }) {
  try {
    const { teamId } = params;
    // Check authorization
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const team = await Team.findById(teamId)
      .populate('leader', 'name email')
      .populate('members', 'name email role');
    
    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }
    
    return NextResponse.json({ team });
  } catch (error) {
    console.error('Fetch team error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Update a team
export async function PUT(request, { params }) {
  try {
    const { teamId } = params;
    // Check authorization
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const data = await request.json();
    const { name, description, leaderId, memberIds } = data;

    const team = await Team.findById(teamId);
    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    // Handle leader change
    if (leaderId && leaderId !== team.leader?.toString()) {
      // Remove team from previous leader if exists
      if (team.leader) {
        await Leader.findByIdAndUpdate(team.leader, {
          $pull: { teams: teamId }
        });
      }
      
      // Add team to new leader
      await Leader.findByIdAndUpdate(leaderId, {
        $push: { teams: teamId }
      });
    }

    // Handle members change
    if (memberIds) {
      // Get current members to find removed ones
      const currentMembers = team.members.map(id => id.toString());
      const removedMembers = currentMembers.filter(id => !memberIds.includes(id));
      
      // Remove team from removed members
      if (removedMembers.length > 0) {
        await Member.updateMany(
          { _id: { $in: removedMembers } },
          { $unset: { team: "" } }
        );
      }
      
      // Add team to new members
      const newMembers = memberIds.filter(id => !currentMembers.includes(id));
      if (newMembers.length > 0) {
        await Member.updateMany(
          { _id: { $in: newMembers } },
          { $set: { team: teamId } }
        );
      }
    }

    // Update team
    const updatedTeam = await Team.findByIdAndUpdate(
      teamId,
      {
        name: name || team.name,
        description: description !== undefined ? description : team.description,
        leader: leaderId || team.leader,
        members: memberIds || team.members,
        updatedAt: new Date()
      },
      { new: true }
    ).populate('leader', 'name email')
      .populate('members', 'name email role');

    return NextResponse.json({ 
      success: true, 
      team: updatedTeam 
    });
  } catch (error) {
    console.error('Update team error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Delete a team
export async function DELETE(request, { params }) {
  try {
    const { teamId } = params;
    // Check authorization
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const team = await Team.findById(teamId);
    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    // Remove team from leader
    if (team.leader) {
      await Leader.findByIdAndUpdate(team.leader, {
        $pull: { teams: teamId }
      });
    }

    // Remove team from all members
    if (team.members.length > 0) {
      await Member.updateMany(
        { _id: { $in: team.members } },
        { $unset: { team: "" } }
      );
    }

    // Delete the team
    await Team.findByIdAndDelete(teamId);

    return NextResponse.json({ 
      success: true, 
      message: 'Team deleted successfully' 
    });
  } catch (error) {
    console.error('Delete team error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
