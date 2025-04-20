import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  text: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'Member' },
  date: { type: Date, default: Date.now }
});

const fileSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  path: { type: String, required: true },
  mimetype: String,
  size: Number,
  uploadDate: { type: Date, default: Date.now }
});

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  status: { 
    type: String, 
    enum: ['pending', 'in-progress', 'completed', 'on-hold'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Member' },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Leader' },
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
  dueDate: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  comments: [commentSchema],
  files: [fileSchema]
});

// Check if model exists before creating
const Task = mongoose.models.Task || mongoose.model('Task', taskSchema);
export default Task;
