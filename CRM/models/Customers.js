import mongoose from "mongoose";
import bcrypt from "bcrypt";

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: /^[\w.+-]+@gmail\.com$/, 
    },

    phone: {
      type: String,
      required: true,
      match: /^0\d{9}$/,
    },

    password: {
      type: String,
      required: true,
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

    created_At: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, 
  }
);

// Hash password trước khi lưu
customerSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  // Nếu password đã hash rồi (bắt đầu bằng $2b$), bỏ qua hash lại
  if (this.password.startsWith("$2b$")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Hàm kiểm tra mật khẩu
customerSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export const Customer = mongoose.model("Customer", customerSchema);
