import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  image: { type: String },
  isGoogle: { type: Boolean, default: false },
  isGithub: { type: Boolean, default: false },
  provider: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const User =
  mongoose.models.User || mongoose.model("User", userSchema);

export { User };