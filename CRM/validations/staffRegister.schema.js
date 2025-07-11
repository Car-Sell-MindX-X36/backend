import Joi from "joi";

const nameRegex = /^([A-ZÀ-Ỹ][a-zà-ỹ]*)(\s[A-ZÀ-Ỹ][a-zà-ỹ]*)+$/u;
const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s;])[^\s\n;]{5,32}$/;
const phoneRegex = /^0\d{9}$/;
const emailRegex = /^[\w.+-]+@gmail\.com$/;
const noNewLine = /^[^\n\r]*$/;

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

export const staffRegisterSchema = Joi.object({
  name: Joi.string()
    .pattern(nameRegex)
    .pattern(noNewLine)
    .required()
    .messages({
      "string.empty": "Tên không được để trống",
      "string.pattern.base":
        "Tên phải viết hoa chữ cái đầu mỗi từ, không có số/ký tự đặc biệt và không xuống dòng",
    }),

  email: Joi.string()
    .pattern(emailRegex)
    .pattern(noNewLine)
    .required()
    .messages({
      "string.empty": "Email không được để trống",
      "string.pattern.base": "Chỉ cho phép email @gmail.com và không xuống dòng",
    }),

  phone: Joi.string()
    .pattern(phoneRegex)
    .pattern(noNewLine)
    .required()
    .messages({
      "string.empty": "Số điện thoại không được để trống",
      "string.pattern.base":
        "Số điện thoại phải có 10 chữ số, bắt đầu bằng 0 và không xuống dòng",
    }),

  password: Joi.string()
    .pattern(passwordRegex)
    .pattern(noNewLine)
    .required()
    .messages({
      "string.empty": "Mật khẩu không được để trống",
      "string.pattern.base":
        "Mật khẩu 5–32 ký tự, có 1 chữ hoa, 1 số, 1 ký tự đặc biệt (không chứa dấu ;, không khoảng trắng, không xuống dòng)",
    }),

  confirmPassword: Joi.string()
    .valid(Joi.ref("password"))
    .pattern(noNewLine)
    .required()
    .messages({
      "any.only": "Mật khẩu không khớp",
      "string.empty": "Xác nhận mật khẩu không được để trống",
      "string.pattern.base": "Không được xuống dòng",
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

  gender: Joi.string()
    .valid("male", "female", "other")
    .required()
    .messages({
      "any.only": "Giới tính phải là male, female hoặc other",
      "string.empty": "Giới tính không được để trống",
    }),

  role: Joi.string()
    .valid("manager", "agent")
    .required()
    .messages({
      "any.only": "Vai trò phải là manager hoặc agent",
      "string.empty": "Vai trò là bắt buộc",
    }),
});
