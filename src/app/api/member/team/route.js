import { NextResponse } from "next/server";
import connectDB from "../../../../lib/dbConfig";
import Member from "../../../../lib/dbmodels/member";
import Team from "../../../../lib/dbmodels/teams";

export async function GET(request) {
  try {
    await connectDB();
    const email = request.nextUrl.searchParams.get('email');
    
    if (!email) {
      return NextResponse.json(
        { error: "Email parameter is required" }, 
        { status: 400 }
      );
    }
    
    // Find member by email
    const member = await Member.findOne({ email });
    
    if (!member) {
      return NextResponse.json(
        { error: "Member not found" }, 
        { status: 404 }
      );
    }
    
    // If member doesn't have a team
    if (!member.team) {
      return NextResponse.json({ teams: null });
    }
    
    // Find member's team with populated member data
    const team = await Team.findById(member.team);
    
    if (!team) {
      return NextResponse.json(
        { error: "Team not found" }, 
        { status: 404 }
      );
    }
    
    // Fetch all members for this team
    const memberIds = team.members || [];
    const members = await Member.find({ _id: { $in: memberIds } }).select('name email role status');
    
    // Add members to team object
    const teamWithMembers = team.toObject();
    teamWithMembers.members = members;
    
    return NextResponse.json({ teams: teamWithMembers });
  } catch (error) {
    console.error("Error fetching member's team:", error);
    return NextResponse.json(
      { error: error.message }, 
      { status: 500 }
    );
  }
}
