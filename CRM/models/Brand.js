import mongoose from "mongoose";

const brandSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,   // ✔️ Bắt buộc có tên hãng
    unique: true,     // ✔️ Không trùng tên hãng
  }
});

const Brand = mongoose.model("Brand", brandSchema);

export default Brand;
