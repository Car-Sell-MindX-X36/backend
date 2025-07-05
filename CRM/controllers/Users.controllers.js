import { User } from "../models/Users.js";

const createPermission = {
  hr: ["hr", "manager", "agent"], // ✅ HR được phép tạo cả agent
  manager: ["agent"],
};

export const createUser = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      employeeId,
      gender,
      dob,
      address,
      note,
      role,
      avatarUrl,
      position,
    } = req.body;

    const currentUser = req.user;

    if (!currentUser) {
      return res.status(401).json({ message: "Người dùng chưa đăng nhập" });
    }

    // 🔐 PHÂN QUYỀN TẠO
    const allowedRoles = createPermission[currentUser.role] || [];
    if (!allowedRoles.includes(role)) {
      return res.status(403).json({
        message: `${currentUser.role.toUpperCase()} không được phép tạo ${role.toUpperCase()}`,
      });
    }

    // 🔍 KIỂM TRA TRÙNG DỮ LIỆU
    const query = [];
    if (email) query.push({ email });
    if (phone) query.push({ phone });
    if (employeeId) query.push({ employeeId });

    if (query.length > 0) {
      const exists = await User.findOne({ $or: query });
      if (exists) {
        return res.status(409).json({
          message: "Email, số điện thoại hoặc mã nhân viên đã tồn tại",
        });
      }
    }

    // 📌 BUILD OBJECT
    const newUserData = {
      name,
      email,
      phone,
      password,
      gender,
      dob,
      address,
      note,
      role,
      avatarUrl,
      position,
    };

    if (role !== "hr" && employeeId) {
      newUserData.employeeId = employeeId;
    }

    if (role !== "hr") {
      newUserData.createdBy = currentUser._id;
    }

    if (role === "agent") {
      newUserData.managerId = currentUser._id;
    }

    const createdUser = await User.create(newUserData);

    return res.status(201).json({
      message: "Tạo tài khoản thành công",
      data: {
        _id: createdUser._id,
        name: createdUser.name,
        email: createdUser.email,
        role: createdUser.role,
      },
    });
  } catch (err) {
    console.error("CreateUser error:", err);
    return res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};
