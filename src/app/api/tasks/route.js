import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { createTask, getAllTasksByUserId } from '@/lib/db/taskModel';
import { authOptions } from '@/lib/auth/authOptions';

// GET all tasks for the current user
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Use id or sub property depending on how it's stored in your session
    const userId = session.user.id || session.user.sub;
    
    if (!userId) {
      console.error('User ID not found in session:', session);
      return NextResponse.json({ error: 'User ID not found in session' }, { status: 500 });
    }
    
    const tasks = await getAllTasksByUserId(userId);
    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error in GET /api/tasks:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST create a new task
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Use id or sub property depending on how it's stored in your session
    const userId = session.user.id || session.user.sub;
    
    if (!userId) {
      console.error('User ID not found in session:', session);
      return NextResponse.json({ error: 'User ID not found in session' }, { status: 500 });
    }
    
    const taskData = await request.json();
    console.log('Creating task with userId:', userId);
    
    const newTask = await createTask({
      ...taskData,
      userId: userId
    });
    
    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/tasks:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
