import { NextResponse } from 'next/server';
import connectDB from "@/lib/dbConfig";
import Team from '@/lib/dbmodels/teams';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';

export async function GET(request) {
  try {
    console.log("Teams API called");
    
    // Check authorization
    const session = await getServerSession(authOptions);
    console.log("Session in teams API:", session);
    
    // For debugging - temporarily return teams regardless of session
    // In production, you would enforce proper authorization
    await connectDB();
    const teams = await Team.find({})
      .populate('leader', 'name email')
      .populate('members', 'name email');
    
    console.log(`Found ${teams.length} teams`);
    return NextResponse.json({ teams });
    
    // Uncomment this for proper authorization
    /*
    if (!session) {
      console.log("No session found in teams route");
      return NextResponse.json({ error: 'Unauthorized - Not signed in' }, { status: 401 });
    }
    
    if (session.user?.role !== 'admin') {
      console.log("Not admin role in teams route:", session.user?.role);
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 403 });
    }

    await connectDB();
    const teams = await Team.find({})
      .populate('leader', 'name email')
      .populate('members', 'name email');
    
    return NextResponse.json({ teams });
    */
  } catch (error) {
    console.error('Fetch teams error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Create a new team
export async function POST(request) {
  try {
    // Check authorization (temporarily disabled for testing)
    const session = await getServerSession(authOptions);
    /*
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    */

    await connectDB();
    const data = await request.json();
    const { name, description, leaderId, memberIds } = data;

    if (!name) {
      return NextResponse.json({ 
        error: 'Team name is required' 
      }, { status: 400 });
    }

    // Create the team
    const team = await Team.create({
      name,
      description,
      leader: leaderId || null,
      members: memberIds || [],
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return NextResponse.json({ 
      success: true, 
      team
    });
  } catch (error) {
    console.error('Create team error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
