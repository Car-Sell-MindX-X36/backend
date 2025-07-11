import { Customer } from "../models/Customers.js";
import bcrypt from "bcryptjs";

// 📌 [POST] /customer/register
export const RegisterCustomers = async (req, res) => {
  try {
    const { name, email, phone, password, confirmPassword, dob, gender } = req.body;

    // Kiểm tra thiếu trường
    if (!name || !email || !phone || !password || !confirmPassword || !dob || !gender) {
      return res.status(400).json({ message: "Vui lòng điền đầy đủ thông tin" });
    }

    // Kiểm tra mật khẩu khớp
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Mật khẩu xác nhận không khớp" });
    }

    // Kiểm tra email hoặc phone đã tồn tại
    const existing = await Customer.findOne({
      $or: [{ email }, { phone }],
    });

    if (existing) {
      return res.status(400).json({
        message: "Email hoặc số điện thoại đã được sử dụng",
      });
    }

    // Kiểm tra tuổi
    const birthDate = new Date(dob);
    const now = new Date();
    const age = now.getFullYear() - birthDate.getFullYear();
    const birthdayThisYear = new Date(now.getFullYear(), birthDate.getMonth(), birthDate.getDate());

    const isTooYoung = age < 18 || (age === 18 && now < birthdayThisYear);
    const isTooOld = age >= 75 || (age === 74 && now >= birthdayThisYear);

    if (isTooYoung || isTooOld) {
      return res.status(400).json({ message: "Khách hàng phải từ 18 đến dưới 75 tuổi" });
    }

    // Mã hóa mật khẩu
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Tạo customer
    const newCustomer = new Customer({
      name,
      email,
      phone,
      password: hashedPassword,
      dob,
      gender,
    });

    await newCustomer.save();

    return res.status(201).json({ message: "Đăng ký thành công" });
  } catch (error) {
    console.error("❌ Lỗi đăng ký customer:", error);
    return res.status(500).json({ message: "Lỗi server" });
  }
};
