import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const adminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { 
    type: String, 
    enum: ['super-admin', 'admin'],
    default: 'admin'
  },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  createdAt: { type: Date, default: Date.now },
  lastLogin: Date,
  password: { type: String },
  isActive: { type: Boolean, default: false },
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

adminSchema.methods.comparePassword = async function(password) {
  if (!this.password) return false;
  return await bcrypt.compare(password, this.password);
};

const Admin = mongoose.models.Admin || mongoose.model('Admin', adminSchema);
export default Admin;
