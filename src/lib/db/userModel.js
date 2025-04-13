import mongoose from "mongoose";
import { connect } from "../dbConfig";
import bcrypt from "bcryptjs";

// Schema definition
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  image: { type: String },
  isGoogle: { type: Boolean, default: false },
  isGithub: { type: Boolean, default: false },
  provider: { type: String },
  role: { type: String, enum: ['user', 'manager', 'admin'], default: 'user' },
  isVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Initialize model
const User = mongoose.models.User || mongoose.model("User", userSchema);

// Export user operations
export async function createOrUpdateUser(userData) {
  try {
    await connect();
    
    const { email, name, image, provider, role, password, isVerified } = userData;
    
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      const updates = {
        name,
        image,
        ...(provider && { [`is${provider}`]: true, provider }),
        // Don't override role if already set and not provided
        ...(role && { role }),
        ...(isVerified !== undefined && { isVerified }),
        ...(password && { password: await bcrypt.hash(password, 10) }),
        updatedAt: new Date()
      };
      
      return await User.findOneAndUpdate(
        { email },
        updates,
        { new: true }
      );
    }

    // For new users
    const newUserData = {
      email,
      name,
      image,
      isVerified: isVerified ?? false,
      ...(provider && { [`is${provider}`]: true, provider }),
      ...(role && { role: role }),
      ...(password && { password: await bcrypt.hash(password, 10) }),
    };

    const newUser = new User(newUserData);
    return await newUser.save();
  } catch (error) {
    console.error('Error in createOrUpdateUser:', error);
    throw error;
  }
}

export async function checkUserLoginType(email) {
  try {
    await connect();
    const user = await User.findOne({ email });
    
    if (!user) return { exists: false };
    
    if (user.isGoogle) return { exists: true, type: 'Google' };
    if (user.isGithub) return { exists: true, type: 'Github' };
    if (user.password) return { exists: true, type: 'Manual' };
    
    return { exists: true, type: 'Unknown' };
  } catch (error) {
    console.error('Error checking user login type:', error);
    throw error;
  }
}

export async function getUserRole(email) {
  try {
    await connect();
    const user = await User.findOne({ email });
    return user ? user.role : null;
  } catch (error) {
    console.error('Error getting user role:', error);
    throw error;
  }
}

export async function updateUserRole(email, newRole) {
  try {
    await connect();
    
    if (!['user', 'manager', 'admin'].includes(newRole)) {
      throw new Error('Invalid role specified');
    }
    
    return await User.findOneAndUpdate(
      { email },
      { role: newRole, updatedAt: new Date() },
      { new: true }
    );
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
}

export async function getAllUsers() {
  try {
    await connect();
    return await User.find({}, 'name email role createdAt image');
  } catch (error) {
    console.error('Error fetching all users:', error);
    throw error;
  }
}

export async function verifyUserEmail(email) {
  try {
    await connect();
    return await User.findOneAndUpdate(
      { email },
      { isVerified: true, updatedAt: new Date() },
      { new: true }
    );
  } catch (error) {
    console.error('Error verifying user email:', error);
    throw error;
  }
}

export async function setUserPassword(email, password) {
  try {
    await connect();
    const hashedPassword = await bcrypt.hash(password, 10);
    return await User.findOneAndUpdate(
      { email },
      { password: hashedPassword, updatedAt: new Date() },
      { new: true }
    );
  } catch (error) {
    console.error('Error setting user password:', error);
    throw error;
  }
}

export async function findUserByEmail(email) {
  try {
    await connect();
    return await User.findOne({ email });
  } catch (error) {
    console.error('Error finding user by email:', error);
    throw error;
  }
}

// Export User model directly
export { User };
