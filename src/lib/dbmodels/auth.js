import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const authSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  userType: { 
    type: String, 
    enum: ['member', 'leader', 'admin'],
    required: true 
  },
  token: { type: String, required: true },
  device: String,
  ipAddress: String,
  isValid: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true }
});

authSchema.statics.generateToken = async function(user, userType) {
  const token = jwt.sign(
    { id: user._id, type: userType },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  const auth = new this({
    userId: user._id,
    userType,
    token,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  });

  await auth.save();
  return token;
};

authSchema.statics.verifyToken = async function(token) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const auth = await this.findOne({ 
      token, 
      userId: decoded.id,
      userType: decoded.type,
      isValid: true,
      expiresAt: { $gt: new Date() }
    });
    return auth ? decoded : null;
  } catch (error) {
    return null;
  }
};

const Auth = mongoose.model('Auth', authSchema);
export default Auth;
