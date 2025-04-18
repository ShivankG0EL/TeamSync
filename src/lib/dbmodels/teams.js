import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  leader: { type: mongoose.Schema.Types.ObjectId, ref: 'Leader' },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Member' }],
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Team = mongoose.model('Team', teamSchema);
export default Team;
