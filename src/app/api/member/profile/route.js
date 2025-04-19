import { NextResponse } from "next/server";
import connectDB from "../../../../lib/dbConfig";
import Member from "../../../../lib/dbmodels/member";

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
    
    // Find member by email and populate team
    const member = await Member.findOne({ email }).populate('team');
    
    if (!member) {
      return NextResponse.json(
        { error: "Member not found" }, 
        { status: 404 }
      );
    }
    
    // Remove sensitive information before sending response
    const memberData = member.toObject();
    delete memberData.password;
    delete memberData.authTokens;
    
    return NextResponse.json({ member: memberData });
  } catch (error) {
    console.error("Error fetching member profile:", error);
    return NextResponse.json(
      { error: error.message }, 
      { status: 500 }
    );
  }
}
