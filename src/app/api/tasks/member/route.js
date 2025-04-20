import { NextResponse } from "next/server";
import connectDB from "../../../../lib/dbConfig";
import Task from "../../../../lib/dbmodels/task";
import Member from "../../../../lib/dbmodels/member";

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
    
    // Find tasks assigned to this member
    const tasks = await Task.find({ assignedTo: member._id })
      .populate('assignedBy', 'name email')
      .populate('team', 'name')
      .sort({ dueDate: 1 }); // Sort by due date ascending
    
    return NextResponse.json({
      tasks
    });
  } catch (error) {
    console.error("Error fetching member's tasks:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
