import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import connectDB from "../../../../lib/dbConfig";
import Task from "../../../../lib/dbmodels/task";
import Member from "../../../../lib/dbmodels/member";
import formidable from "formidable";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

// Configure body parser to handle multipart/form-data
export const config = {
  api: {
    bodyParser: false,
  },
};

const parseForm = async (req) => {
  const form = formidable({
    keepExtensions: true,
    maxFileSize: 10 * 1024 * 1024, // 10MB limit
  });
  
  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });
};

const saveFile = async (file, taskId) => {
  // Create uploads directory if it doesn't exist
  const uploadsDir = path.join(process.cwd(), "public", "uploads", "tasks", taskId);
  await mkdir(uploadsDir, { recursive: true });
  
  // Generate unique filename
  const timestamp = Date.now();
  const filename = `${timestamp}-${file.originalFilename}`;
  const filepath = path.join(uploadsDir, filename);
  
  // Save the file
  await writeFile(filepath, Buffer.from(await file.arrayBuffer()));
  
  // Return file info for database
  return {
    filename: file.originalFilename,
    path: `/uploads/tasks/${taskId}/${filename}`,
    mimetype: file.mimetype,
    size: file.size
  };
};

export async function POST(request) {
  try {
    await connectDB();
    
    // Parse the formdata content
    const formData = await request.formData();
    
    // Extract fields
    const taskId = formData.get("taskId");
    const status = formData.get("status");
    const comment = formData.get("comment");
    
    if (!taskId) {
      return NextResponse.json(
        { error: "Task ID is required" },
        { status: 400 }
      );
    }
    
    // Find the task
    const task = await Task.findById(taskId);
    if (!task) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }
    
    // Update task status if provided
    if (status && ["pending", "in-progress", "completed", "on-hold"].includes(status)) {
      task.status = status;
    }
    
    // Add comment if provided
    if (comment && comment.trim() !== "") {
      task.comments = task.comments || [];
      task.comments.push({
        text: comment,
        date: new Date()
      });
    }
    
    // Handle file uploads
    const files = formData.getAll("files");
    if (files && files.length > 0) {
      task.files = task.files || [];
      
      for (const file of files) {
        if (file && file.size > 0) {
          // Save file and get file info
          try {
            const savedFile = await saveFile(file, taskId);
            task.files.push(savedFile);
          } catch (fileError) {
            console.error("Error saving file:", fileError);
            // Continue with other files
          }
        }
      }
    }
    
    // Update the timestamp
    task.updatedAt = new Date();
    
    // Save the updated task
    await task.save();
    
    // Revalidate paths to update UI
    revalidatePath("/member/dashboard");
    revalidatePath(`/member/task/${taskId}`);
    
    return NextResponse.json({
      success: true,
      message: "Task updated successfully",
      task: {
        _id: task._id,
        title: task.title,
        status: task.status,
        updatedAt: task.updatedAt
      }
    });
    
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
