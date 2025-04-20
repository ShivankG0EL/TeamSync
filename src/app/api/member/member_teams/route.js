import { NextResponse } from "next/server"
import connectDB from "../../../../lib/dbConfig"
import Team from "../../../../lib/dbmodels/teams"
import Member from "../../../../lib/dbmodels/member"

export async function GET(request) {
    try {
        await connectDB()
        const email = request.nextUrl.searchParams.get('email');
        
        if (!email) {
            return NextResponse.json(
                { error: "Email parameter is required" }, 
                { status: 400 }
            );
        }
        
        // Find the member by email first
        const member = await Member.findOne({ email: email });
        
        if (!member) {
            return NextResponse.json(
                { error: "Member not found" }, 
                { status: 404 }
            );
        }
        
        // Find teams that contain this member's ID
        const teams = await Team.find({ members: member._id });
        
        // Populate member data for each team
        const teamsWithMembers = await Promise.all(teams.map(async (team) => {
            const teamObj = team.toObject();
            
            // Fetch members for this team
            if (team.members && team.members.length > 0) {
                const members = await Member.find({
                    _id: { $in: team.members }
                }).select('name email role status');
                
                teamObj.members = members;
            } else {
                teamObj.members = [];
            }
            
            // Add leader information
            if (team.leader) {
                const leaderInfo = await Member.findOne({ email: team.leader }).select('name email');
                teamObj.leaderInfo = leaderInfo || { name: team.leader, email: team.leader };
            }
            
            return teamObj;
        }));
        
        return NextResponse.json({ teams: teamsWithMembers });
    } catch (error) {
        console.error("Error fetching teams for member:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
