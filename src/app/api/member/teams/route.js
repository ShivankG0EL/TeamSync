import { NextResponse } from "next/server";
import connectDB from "../../../../lib/dbConfig";
import Member from "../../../../lib/dbmodels/member";
import Team from "../../../../lib/dbmodels/teams";

export async function GET(request) {
  try {
    await connectDB();
    
    // Get email from query params
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
    
    // Find teams that include this member
    const teams = await Team.find({ 
      members: member._id 
    }).select('_id name description createdAt');
    
    return NextResponse.json({ teams });
  } catch (error) {
    console.error("Error fetching member teams:", error);
    return NextResponse.json(
      { error: error.message }, 
      { status: 500 }
    );
  }
}
