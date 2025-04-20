import { NextResponse } from "next/server";
import connectDB from "../../../../lib/dbConfig";
import Task from "../../../../lib/dbmodels/task";
import Team from "../../../../lib/dbmodels/teams";
import Member from "../../../../lib/dbmodels/member";
import Leader from "../../../../lib/dbmodels/leader";
import { sendTaskAssignmentEmail } from "../../../../lib/emailUtils";

export async function POST(request) {
  try {
    await connectDB();
    
    const { title, description, priority, status, teamId, memberId, dueDate } = await request.json();
    
    // Validate required fields
    if (!title || !teamId || !memberId || !dueDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    // Validate that team and member exist
    const team = await Team.findById(teamId);
    if (!team) {
      return NextResponse.json(
        { error: "Team not found" },
        { status: 404 }
      );
    }
    
    const member = await Member.findById(memberId);
    if (!member) {
      return NextResponse.json(
        { error: "Member not found" },
        { status: 404 }
      );
    }
    
    // Find the leader by email (assuming it's stored in the team)
    const leader = await Leader.findOne({ email: team.leader });
    
    // Create the new task
    const newTask = new Task({
      title,
      description,
      priority,
      status,
      assignedTo: memberId,
      assignedBy: leader?._id,
      team: teamId,
      dueDate: new Date(dueDate),
    });
    
    await newTask.save();
    
    // Update the member's tasks array
    await Member.findByIdAndUpdate(memberId, {
      $push: { tasks: newTask._id }
    });
    
    // Populate the response with member and team information
    const populatedTask = await Task.findById(newTask._id)
      .populate('assignedTo', 'name email role')
      .populate('team', 'name');
    
    // Send email notification to the member
    if (member.email) {
      await sendTaskAssignmentEmail({
        email: member.email,
        name: member.name,
        task: {
          ...newTask.toObject(),
          title,
          description,
          priority,
          status,
          dueDate
        },
        leaderName: leader ? leader.name : 'Your team leader'
      });
    }
    
    return NextResponse.json({
      message: "Task created successfully",
      task: populatedTask
    });
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
