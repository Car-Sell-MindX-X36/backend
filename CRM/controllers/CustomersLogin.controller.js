import { Customer } from "../models/Customers.js";
import jwt from "jsonwebtoken";

// Tạo access token
const generateAccessToken = (customer) => {
  return jwt.sign(
    { id: customer._id },
    process.env.JWT_ACCESS_TOKEN_SECRET,
    { expiresIn: "1h" }
  );
};

// Tạo refresh token
const generateRefreshToken = (customer) => {
  return jwt.sign(
    { id: customer._id },
    process.env.JWT_REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );
};

// 📌 [POST] /customer-login
export const loginCustomer = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    // Kiểm tra đầu vào
    if (!identifier || !password) {
      return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin" });
    }

    // Phân loại identifier là email hay phone
    const emailRegex = /^[\w.+-]+@gmail\.com$/;
    const phoneRegex = /^0\d{9}$/;

    let query = {};
    if (emailRegex.test(identifier)) {
      query.email = identifier;
    } else if (phoneRegex.test(identifier)) {
      query.phone = identifier;
    } else {
      return res.status(400).json({ message: "Định dạng email hoặc số điện thoại không hợp lệ" });
    }

    // Tìm khách hàng theo email hoặc phone
    const customer = await Customer.findOne(query);
    if (!customer) {
      return res.status(401).json({ message: "Thông tin đăng nhập không chính xác" });
    }

    // So sánh password
    const isMatch = await customer.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Thông tin đăng nhập không chính xác" });
    }

    // Tạo token
    const accessToken = generateAccessToken(customer);
    const refreshToken = generateRefreshToken(customer);

    return res.status(200).json({
      message: "Đăng nhập thành công",
      accessToken,
      refreshToken,
    });

  } catch (error) {
    return res.status(500).json({ message: "Lỗi server" });
  }
};
//Hàm refresh token
export const refreshAccessToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;
    
        // Kiểm tra token
        if (!refreshToken) {
        return res.status(401).json({ message: "Vui lòng cung cấp refresh token" });
        }
    
        // Xác thực token
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN_SECRET);
        const customer = await Customer.findById(decoded.id).select("-password");
    
        if (!customer) {
        return res.status(404).json({ message: "Khách hàng không tồn tại" });
        }
    
        // Tạo access token mới
        const newAccessToken = generateAccessToken(customer);
    
        return res.status(200).json({
        message: "Làm mới access token thành công",
        accessToken: newAccessToken,
        });
    
    } catch (error) {
        console.error("❌ Lỗi làm mới access token:", error);
        return res.status(500).json({ message: "Lỗi server" });
    }
    }