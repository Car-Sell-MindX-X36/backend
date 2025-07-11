import jwt from 'jsonwebtoken';
import { Staff } from '../models/Staffs.js';
const generateAccessToken = (staff) => {
    return jwt.sign(
        {id: staff._id, role: staff.role},
        process.env.JWT_ACCESS_TOKEN_SECRET,
        {expiresIn: "3h"}
    );
};
const generateRefreshToken = (staff) => {
    return jwt.sign(
        {id: staff._id, role: staff.role},
        process.env.JWT_REFRESH_TOKEN_SECRET,
        {expiresIn: "7d"}
    );
};
// Hàm đăng nhập
export const loginStaff = async(req , res) => {
    const {email , password , role} = req.body;
    if (!email || !password || !role) {
        return res.status(400).json({message: "Vui lòng nhập đầy đủ thông tin"});
    }
    const staff = await Staff.findOne({email, role});
    if (!staff) {
        return res.status(404).json({message: "Nhân viên không tồn tại"});
    }
    const isMatch = await staff.comparePassword(password);
    if (!isMatch) {
        return res.status(401).json({message: "Mật khẩu không đúng"});
    }
    const accessToken = generateAccessToken(staff);
    const refreshToken = generateRefreshToken(staff);
    //Trả accessToken và refreshToken về client
    return res.status(200).json({
        message: "Đăng nhập thành công",
        accessToken,
        refreshToken,
    });
};
// Hàm làm mới accessToken
export const refreshAccessToken = async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(401).json({ message: "Thiếu refresh token" });
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN_SECRET);
        const staff = await Staff.findById(decoded.id);
        if (!staff) {
            return res.status(404).json({ message: "Không tìm thấy nhân viên" });
        }

        const newAccessToken = generateAccessToken(staff);

        return res.status(200).json({
            message: "Cấp lại access token thành công",
            accessToken: newAccessToken,
        });
    } catch (error) {
        return res.status(403).json({ message: "Refresh token không hợp lệ hoặc đã hết hạn" });
    }
};

