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
        
        // Find teams where leader's email matches
        const teams = await Team.find({ leader: email });
        
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
            
            return teamObj;
        }));
        
        return NextResponse.json({ teams: teamsWithMembers });
    } catch (error) {
        console.error("Error fetching team:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}