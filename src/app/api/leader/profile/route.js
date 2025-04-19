import { NextResponse } from "next/server";
import connectDB from "../../../../lib/dbConfig";
import Leader from "../../../../lib/dbmodels/leader";
import Team from "../../../../lib/dbmodels/teams"; // Import Team model to register schema

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
    
    // Find leader by email
    const leader = await Leader.findOne({ email });
    
    if (!leader) {
      return NextResponse.json(
        { error: "Leader not found" }, 
        { status: 404 }
      );
    }
    
    // Remove sensitive information before sending response
    const leaderData = leader.toObject();
    delete leaderData.password;
    delete leaderData.authTokens;
    delete leaderData.verificationCode;
    delete leaderData.verificationExpires;
    
    return NextResponse.json({ leader: leaderData });
  } catch (error) {
    console.error("Error fetching leader profile:", error);
    return NextResponse.json(
      { error: error.message }, 
      { status: 500 }
    );
  }
}
