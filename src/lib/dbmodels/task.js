import mongoose from 'mongoose';

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
  updatedAt: { type: Date, default: Date.now }
});

// Check if model exists before creating
const Task = mongoose.models.Task || mongoose.model('Task', taskSchema);
export default Task;
