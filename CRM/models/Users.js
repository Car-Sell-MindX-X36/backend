import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
  // 🧑‍💼 Thông tin cá nhân
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

  employeeId: {
    type: String,
    required: true,
    unique: true,
  },

  gender: {
    type: String,
    enum: ["male", "female", "other"],
    required: true,
  },

  dob: {
    type: Date,
    required: true,
  },

  address: {
    type: String,
    required: true,
  },

  note: {
    type: String,
    default: "",
  },

  // 🔐 Phân quyền
  role: {
    type: String,
    enum: ["hr", "manager", "agent"],
    required: true,
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },

  managerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },

  // ⚙️ Trạng thái tài khoản
  isActive: {
    type: Boolean,
    default: true,
  },

  status: {
    type: String,
    enum: ["active", "banned"],
    default: "active",
  },

  avatarUrl: {
    type: String,
    default: "",
  },

  position: {
    type: String,
    default: "",
  },

  lastLogin: {
    type: Date,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  updatedAt: {
    type: Date,
    default: Date.now,
  },
});


// ✅ Cập nhật thời gian mỗi khi lưu
userSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

// ✅ Hash password trước khi lưu
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// ✅ Method để kiểm tra mật khẩu khi login
userSchema.methods.comparePassword = async function (plainPassword) {
  return await bcrypt.compare(plainPassword, this.password);
};

export const User = mongoose.model("User", userSchema);
