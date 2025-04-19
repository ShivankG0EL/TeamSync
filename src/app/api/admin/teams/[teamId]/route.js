import { NextResponse } from 'next/server';
import connectDB from '@/lib/dbConfig';
import Team from '@/lib/dbmodels/teams';
import Leader from '@/lib/dbmodels/leader';
import Member from '@/lib/dbmodels/member';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';

// Get team details
export async function GET(request, { params }) {
  try {
    const { teamId } = params;
    
    // Check authorization
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized - Not signed in' }, { status: 401 });
    }
    
    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 403 });
    }

    await connectDB();
    
    // Get team details with populated leader and members
    const team = await Team.findById(teamId)
      .populate('leader', 'name email')
      .populate('members', 'name email');
    
    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }
    
    return NextResponse.json({ team });
  } catch (error) {
    console.error('Fetch team error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Update team
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

    // Find the team
    const team = await Team.findById(teamId);
    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    // Update team document
    const updatedTeam = await Team.findByIdAndUpdate(
      teamId,
      {
        name: name || team.name,
        description: description !== undefined ? description : team.description,
        leader: leaderId !== undefined ? (leaderId || null) : team.leader,
        members: memberIds || team.members,
        updatedAt: new Date()
      },
      { new: true }
    ).populate('leader', 'name email')
     .populate('members', 'name email');

    return NextResponse.json({ 
      success: true, 
      team: updatedTeam
    });
  } catch (error) {
    console.error('Update team error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Delete team
export async function DELETE(request, { params }) {
  try {
    const { teamId } = params;
    
    // Check authorization
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    // Find the team
    const team = await Team.findById(teamId);
    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
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
