import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const memberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: String,
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
  joinedAt: { type: Date, default: Date.now },
  password: { type: String },
  isActive: { type: Boolean, default: false },
  lastLogin: Date,
  authTokens: [{
    token: String,
    device: String,
    createdAt: { type: Date, default: Date.now }
  }],
  phone: String,
  status: {
    type: String,
    enum: ['pending', 'active', 'suspended'],
    default: 'pending'
  }
});

memberSchema.methods.comparePassword = async function(password) {
  if (!this.password) return false;
  return await bcrypt.compare(password, this.password);
};

const Member = mongoose.models.Member || mongoose.model('Member', memberSchema);
export default Member;
