import { Staff } from "../models/Staffs.js";

export const createStaff = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      confirmPassword,
      gender,
      dob,
      role,
    } = req.body;

    // ✅ Kiểm tra thiếu field nào không (phòng bypass Joi)
    if (!name || !email || !phone || !password || !confirmPassword || !gender || !dob || !role) {
      return res.status(400).json({
        message: "Vui lòng nhập đầy đủ các trường bắt buộc",
      });
    }

    // ❗ Kiểm tra password và confirmPassword khớp nhau
    if (password !== confirmPassword) {
      return res.status(400).json({
        message: "Mật khẩu không trùng khớp",
      });
    }

    // 🔍 Kiểm tra trùng email hoặc số điện thoại
    const existingStaff = await Staff.findOne({
      $or: [{ email }, { phone }],
    });

    if (existingStaff) {
      return res.status(409).json({
        message: "Email hoặc số điện thoại đã được sử dụng",
      });
    }

    //Lưu Data vào MongoDB
    const staffData = {
      name,
      email,
      phone,
      password,
      gender,
      dob,
      role,
    };

    const newStaff = await Staff.create(staffData);

    return res.status(201).json({
      message: "Tạo tài khoản thành công",
      data: {
        _id: newStaff._id,
        name: newStaff.name,
        email: newStaff.email,
        role: newStaff.role,
      },
    });
  } catch (err) {
    console.error("CreateStaff error:", err);
    return res.status(500).json({
      message: "Lỗi server",
      error: err.message,
    });
  }
};
