import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getTaskById, updateTaskById, deleteTaskById } from '@/lib/db/taskModel';
import { authOptions } from '@/lib/auth/authOptions';

// Helper function to verify task ownership
async function verifyTaskAccess(taskId, session) {
  if (!session?.user) {
    return false;
  }
  
  // Use id or sub property depending on how it's stored in your session
  const userId = session.user.id || session.user.sub;
  
  if (!userId) {
    console.error('User ID not found in session:', session);
    return false;
  }
  
  const task = await getTaskById(taskId);
  if (!task || task.userId !== userId) {
    return false;
  }
  
  return task;
}

// GET a specific task
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    const taskId = params.taskId;
    
    const task = await verifyTaskAccess(taskId, session);
    if (!task) {
      return NextResponse.json({ error: 'Unauthorized or task not found' }, { status: 404 });
    }
    
    return NextResponse.json(task);
  } catch (error) {
    console.error(`Error in GET /api/tasks/${params.taskId}:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT update a task
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    const taskId = params.taskId;
    
    const task = await verifyTaskAccess(taskId, session);
    if (!task) {
      return NextResponse.json({ error: 'Unauthorized or task not found' }, { status: 404 });
    }
    
    const updates = await request.json();
    // Ensure userId cannot be changed
    delete updates.userId;
    
    const updatedTask = await updateTaskById(taskId, updates);
    
    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error(`Error in PUT /api/tasks/${params.taskId}:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE a task
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    const taskId = params.taskId;
    
    const task = await verifyTaskAccess(taskId, session);
    if (!task) {
      return NextResponse.json({ error: 'Unauthorized or task not found' }, { status: 404 });
    }
    
    await deleteTaskById(taskId);
    return NextResponse.json({ message: 'Task deleted successfully', id: taskId });
  } catch (error) {
    console.error(`Error in DELETE /api/tasks/${params.taskId}:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
