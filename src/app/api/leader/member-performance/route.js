import { NextResponse } from "next/server";
import connectDB from "../../../../lib/dbConfig";
import Team from "../../../../lib/dbmodels/teams";
import Member from "../../../../lib/dbmodels/member";
import Task from "../../../../lib/dbmodels/task";

export async function GET(request) {
  try {
    await connectDB();
    
    const teamId = request.nextUrl.searchParams.get('teamId');
    
    if (!teamId) {
      return NextResponse.json(
        { error: "Team ID parameter is required" }, 
        { status: 400 }
      );
    }
    
    // Find team with its members
    const team = await Team.findById(teamId);
    if (!team) {
      return NextResponse.json(
        { error: "Team not found" }, 
        { status: 404 }
      );
    }
    
    // Find all members in the team
    const members = await Member.find({ _id: { $in: team.members } })
      .select('_id name email role status');
    
    // Get all tasks for this team
    const tasks = await Task.find({ team: teamId });
    
    // Calculate performance metrics for each member
    const memberPerformance = await Promise.all(members.map(async (member) => {
      // Find tasks assigned to this member
      const memberTasks = tasks.filter(task => 
        task.assignedTo && task.assignedTo.toString() === member._id.toString()
      );
      
      const totalTasks = memberTasks.length;
      const completedTasks = memberTasks.filter(task => task.status === 'completed').length;
      const overdueTasks = memberTasks.filter(task => {
        const dueDate = new Date(task.dueDate);
        return dueDate < new Date() && task.status !== 'completed';
      }).length;
      
      // Calculate success rate
      const successRate = totalTasks > 0 
        ? Math.round((completedTasks / totalTasks) * 100) 
        : 0;
      
      return {
        memberId: member._id,
        name: member.name,
        email: member.email,
        role: member.role,
        status: member.status,
        totalTasks,
        completedTasks,
        pendingTasks: totalTasks - completedTasks,
        overdueTasks,
        successRate
      };
    }));
    
    // Sort by completion rate (highest first)
    memberPerformance.sort((a, b) => b.successRate - a.successRate);
    
    return NextResponse.json({ memberPerformance });
  } catch (error) {
    console.error("Error fetching member performance:", error);
    return NextResponse.json(
      { error: error.message }, 
      { status: 500 }
    );
  }
}
