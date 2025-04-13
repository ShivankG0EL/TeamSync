import mongoose from "mongoose";
import { connect } from "../dbConfig";

// Schema definition
const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  dueDate: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ['upcoming', 'completed', 'overdue'], 
    default: 'upcoming' 
  },
  userId: { type: String, required: true }, // To associate tasks with users
  files: [{
    name: String,
    url: String,
    type: String
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Initialize model 
const Task = mongoose.models.Task || mongoose.model("Task", taskSchema);

// Task operations
export async function createTask(taskData) {
  try {
    await connect();
    const newTask = new Task(taskData);
    return await newTask.save();
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
}

export async function updateTaskById(id, updates) {
  try {
    await connect();
    return await Task.findByIdAndUpdate(
      id, 
      { ...updates, updatedAt: new Date() },
      { new: true }
    );
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
}

export async function deleteTaskById(id) {
  try {
    await connect();
    return await Task.findByIdAndDelete(id);
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
}

export async function getAllTasksByUserId(userId) {
  try {
    await connect();
    return await Task.find({ userId });
  } catch (error) {
    console.error('Error fetching tasks by user ID:', error);
    throw error;
  }
}

export async function getTaskById(id) {
  try {
    await connect();
    return await Task.findById(id);
  } catch (error) {
    console.error('Error fetching task by ID:', error);
    throw error;
  }
}

export { Task };
