import JWT from 'jsonwebtoken';
import { Staff } from '../models/Staffs.js'; 


// Middleware để xác thực token
export const protect = async (req, res , next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: "Chưa đăng nhập hoặc token không hợp lệ" });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = JWT.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET);
    const staff = await Staff.findById(decoded.id).select("-password");

    if (!staff) {
      return res.status(404).json({ message: "Nhân viên không tồn tại" });
    }

    req.staff = staff;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token không hợp lệ hoặc đã hết hạn" });
  }
};

// Middleware để kiểm tra quyền truy cập
export const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.staff.role)) {
      return res.status(403).json({ message: "Không có quyền truy cập" });
    }
    next();
  };
};
