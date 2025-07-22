import jwt from 'jsonwebtoken';
import {Customer} from '../models/Customers.js';

export const authCustomer = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // ⚠️ Không có token
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: '🚫 Không có token truy cập' });
    }

    const token = authHeader.split(' ')[1];

    // ✅ Xác minh token
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET);
    const customer = await Customer.findById(decoded.id);

    // ⚠️ Không tìm thấy customer
    if (!customer) {
      return res.status(401).json({ message: '🚫 Token không hợp lệ hoặc tài khoản không tồn tại' });
    }

    // ✅ Gắn customer vào request để route phía sau dùng
    req.customer = customer;
    next();
  } catch (error) {
    console.error('❌ Lỗi xác thực customer:', error);
    return res.status(401).json({ message: '🚫 Token hết hạn hoặc không hợp lệ' });
  }
};
