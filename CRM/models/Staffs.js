import mongoose from "mongoose";
import bcrypt from "bcrypt";

const staffSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 3,
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },

  phone: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 32,
  },

  dob: {
    type: Date,
    required: true,
  },

  gender: {
    type: String,
    enum: ["male", "female", "other"],
    required: true,
  },

  role: {
    type: String,
    enum: ["manager", "agent"],
    required: true,
  },

  created_At: {
    type: Date,
    default: Date.now,
  },
});

// Hash password
staffSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Compare password
staffSchema.methods.comparePassword = async function (plainPassword) {
  return await bcrypt.compare(plainPassword, this.password);
};

export const Staff = mongoose.model("Staff", staffSchema);
