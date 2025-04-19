import { NextResponse } from "next/server";
import connectDB from "../../../../lib/dbConfig";
import Task from "../../../../lib/dbmodels/task";
import Leader from "../../../../lib/dbmodels/leader";

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
    
    // Find leader by email
    const leader = await Leader.findOne({ email });
    if (!leader) {
      return NextResponse.json(
        { error: "Leader not found" },
        { status: 404 }
      );
    }
    
    // Find teams led by this leader
    const tasks = await Task.find({ assignedBy: leader._id })
      .populate('assignedTo', 'name email role')
      .populate('team', 'name')
      .sort({ createdAt: -1 }); // Most recent first
    
    return NextResponse.json({
      tasks
    });
  } catch (error) {
    console.error("Error fetching leader's tasks:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
