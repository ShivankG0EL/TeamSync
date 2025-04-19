import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  leader: { type: String }, // Store leader's email instead of ObjectId reference
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Member' }],
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Use mongoose.models to check if the model already exists
// This prevents "Cannot overwrite model" errors
const Team = mongoose.models.Team || mongoose.model('Team', teamSchema);
export default Team;
