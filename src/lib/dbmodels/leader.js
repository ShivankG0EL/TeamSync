import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const leaderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  position: String,
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  teams: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Team' }],
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
  verificationCode: String,
  verificationExpires: Date,
  isVerified: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ['pending', 'verified', 'active', 'suspended'],
    default: 'pending'
  }
});

leaderSchema.methods.comparePassword = async function(password) {
  if (!this.password) return false;
  return await bcrypt.compare(password, this.password);
};

const Leader = mongoose.models.Leader || mongoose.model('Leader', leaderSchema);
export default Leader;
