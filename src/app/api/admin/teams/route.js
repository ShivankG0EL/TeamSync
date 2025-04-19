import { NextResponse } from 'next/server';
import connectDB from "@/lib/dbConfig";
import Team from '@/lib/dbmodels/teams';
import Leader from '@/lib/dbmodels/leader';
import Member from '@/lib/dbmodels/member'; // We need to import the Member model
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import bcrypt from 'bcrypt'; // For hashing password if needed

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
    const { name, description, memberId } = data;

    if (!name) {
      return NextResponse.json({ 
        error: 'Team name is required' 
      }, { status: 400 });
    }

    if (!memberId) {
      return NextResponse.json({ 
        error: 'Team leader selection is required' 
      }, { status: 400 });
    }

    // Find the member who will become a leader
    const member = await Member.findById(memberId);
    if (!member) {
      return NextResponse.json({ 
        error: 'Selected member not found' 
      }, { status: 404 });
    }

    // Check if this member already exists as a leader
    let leader = await Leader.findOne({ email: member.email });
    
    // If not, create a new leader entry from the member data
    if (!leader) {
      leader = await Leader.create({
        name: member.name,
        email: member.email,
        position: member.position || 'Team Leader',
        company: member.company,
        password: member.password, // Copy password if exists
        phone: member.phone,
        isActive: true,
        isVerified: member.isVerified || true,
        status: 'active',
        joinedAt: new Date()
      });
    }

    // Create the team with the leader's email
    const team = await Team.create({
      name,
      description,
      leader: member.email, // Store email instead of ID
      members: [memberId], // Include the original member in the team
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Update the leader's teams array if needed
    if (leader._id) {
      await Leader.findByIdAndUpdate(
        leader._id, 
        { $push: { teams: team._id } }
      );
    }

    return NextResponse.json({ 
      success: true, 
      team,
      message: 'Team created successfully and member promoted to leader'
    });
  } catch (error) {
    console.error('Create team error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
