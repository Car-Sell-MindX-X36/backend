import Joi from "joi";

// Regex tên: Viết hoa mỗi từ, không số, không ký tự đặc biệt, không xuống dòng
const nameRegex = /^([A-ZÀ-Ỹ][a-zà-ỹ]+)(\s[A-ZÀ-Ỹ][a-zà-ỹ]+)*$/u;

// Regex password: 5–32 ký tự, ít nhất 1 số, 1 chữ hoa, 1 ký tự đặc biệt (trừ dấu `;`), không khoảng trắng
const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s;])[^\s\n;]{5,32}$/;

// Regex phone: 10 số bắt đầu bằng 0
const phoneRegex = /^0\d{9}$/;

// Regex email: chỉ nhận @gmail.com
const emailRegex = /^[\w.+-]+@gmail\.com$/;

// DOB >= 18 và < 60 tuổi
const calculateMinDOB = () => {
  const now = new Date();
  now.setFullYear(now.getFullYear() - 18);
  return now;
};

const calculateMaxDOB = () => {
  const now = new Date();
  now.setFullYear(now.getFullYear() - 60);
  return now;
};

export const userRegisterSchema = Joi.object({
  name: Joi.string().pattern(nameRegex).required().messages({
    "string.empty": "Tên không được để trống",
    "string.pattern.base": "Tên phải viết hoa chữ cái đầu mỗi từ, không có số/ký tự đặc biệt",
  }),

  email: Joi.string().pattern(emailRegex).required().messages({
    "string.empty": "Email không được để trống",
    "string.pattern.base": "Chỉ cho phép email @gmail.com",
  }),

  phone: Joi.string().pattern(phoneRegex).required().messages({
    "string.empty": "Số điện thoại không được để trống",
    "string.pattern.base": "Số điện thoại phải có 10 chữ số và bắt đầu bằng 0",
  }),

  password: Joi.string().pattern(passwordRegex).required().messages({
    "string.empty": "Mật khẩu không được để trống",
    "string.pattern.base":
      "Mật khẩu 5–32 ký tự, chứa ít nhất 1 chữ hoa, 1 số, 1 ký tự đặc biệt (không chứa dấu ;, không khoảng trắng)",
  }),

  employeeId: Joi.alternatives().conditional("role", {
    is: Joi.valid("agent", "manager"),
    then: Joi.string().required().messages({
      "string.empty": "Mã nhân viên là bắt buộc với agent và manager",
    }),
    otherwise: Joi.forbidden(),
  }),

  gender: Joi.string().valid("male", "female", "other").required().messages({
    "any.only": "Giới tính phải là male, female hoặc other",
    "string.empty": "Giới tính không được để trống",
  }),

  dob: Joi.date()
    .less(calculateMinDOB())
    .greater(calculateMaxDOB())
    .required()
    .messages({
      "date.base": "Ngày sinh không hợp lệ",
      "date.less": "Người dùng phải từ 18 tuổi trở lên",
      "date.greater": "Người dùng phải dưới 60 tuổi",
    }),

  address: Joi.string().required().messages({
    "string.empty": "Địa chỉ không được để trống",
  }),

  role: Joi.string().valid("hr", "manager", "agent").required().messages({
    "any.only": "Vai trò phải là hr, manager hoặc agent",
    "string.empty": "Vai trò là bắt buộc",
  }),

  createdBy: Joi.alternatives().conditional("role", {
    is: "hr",
    then: Joi.forbidden(), // HR tự tạo
    otherwise: Joi.string().required().messages({
      "string.empty": "createdBy là bắt buộc nếu không phải là HR",
    }),
  }),

  managerId: Joi.alternatives().conditional("role", {
    is: "agent",
    then: Joi.string().required().messages({
      "string.empty": "managerId là bắt buộc với agent",
    }),
    otherwise: Joi.forbidden(),
  }),

  note: Joi.string().allow("").optional(),

  avatarUrl: Joi.string().uri().optional(),

  position: Joi.string().optional(),
});
