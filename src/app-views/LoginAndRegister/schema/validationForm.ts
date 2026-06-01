import * as Yup from "yup";

// 🔥 Regex mới: Chấp nhận mọi email hợp lệ (vd: admin@foodapp.com)
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const loginSchema = Yup.object().shape({
  email: Yup.string()
    .required("Email cannot be blank")
    .matches(emailRegex, "Email must be a valid format"),
  password: Yup.string()
    .required("Password cannot be blank")
    .min(6, "Password must be at least 6 characters"),
});

export const registerSchema = Yup.object().shape({
  name: Yup.string().required("Name cannot be blank"),
  email: Yup.string()
    .required("Email cannot be blank")
    .matches(emailRegex, "Email must be a valid format"),
  phone: Yup.string().required("Vui lòng nhập số ĐT"),
  password: Yup.string()
    .required("Password cannot be blank")
    .min(6, "Password must be at least 6 characters"),
});
