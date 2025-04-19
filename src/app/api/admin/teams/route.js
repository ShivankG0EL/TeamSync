import { NextResponse } from 'next/server';
import connectDB from '@/lib/dbConfig';
import Team from '@/lib/dbmodels/teams';
import Leader from '@/lib/dbmodels/leader';
import Member from '@/lib/dbmodels/member';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';

// Create a new team
export async function POST(request) {
  try {
    // Check authorization
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const data = await request.json();
    const { name, description, leaderId, memberIds = [] } = data;

    if (!name) {
      return NextResponse.json({ error: 'Team name is required' }, { status: 400 });
    }

    // Create the team
    const team = await Team.create({
      name,
      description,
      leader: leaderId,
      members: memberIds,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Update the leader with this team
    if (leaderId) {
      await Leader.findByIdAndUpdate(leaderId, {
        $push: { teams: team._id }
      });
    }

    // Update all members with this team
    if (memberIds.length > 0) {
      await Member.updateMany(
        { _id: { $in: memberIds } },
        { $set: { team: team._id } }
      );
    }

    return NextResponse.json({ 
      success: true, 
      team 
    });
  } catch (error) {
    console.error('Team creation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Get all teams
export async function GET(request) {
  try {
    // Check authorization
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const teams = await Team.find({})
      .populate('leader', 'name email')
      .populate('members', 'name email');
    
    return NextResponse.json({ teams });
  } catch (error) {
    console.error('Fetch teams error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
