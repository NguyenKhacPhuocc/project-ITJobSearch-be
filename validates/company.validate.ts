import { Request, Response, NextFunction } from "express";
import Joi from "joi";

export const registerPost = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    companyName: Joi.string()
      .required()
      .max(200)
      .messages({
        "string.empty": "Vui lòng nhập tên công ty!",
        "string.max": "Tên công ty không được vượt quá 200 ký tự!"
      }),
    email: Joi.string()
      .required()
      .email()
      .messages({
        "string.empty": "Vui lòng nhập email của công ty!",
        "string.email": "Email không đúng định dạng!"
      }),
    password: Joi.string()
      .required()
      .min(8) // Ít nhất 8 ký tự
      .custom((value, helpers) => {
        if (!/[A-Z]/.test(value)) {
          return helpers.error("password.uppercase"); // Ít nhất một chữ cái in hoa
        }
        if (!/[a-z]/.test(value)) {
          return helpers.error("password.lowercase"); // Ít nhất một chữ cái thường
        }
        if (!/\d/.test(value)) {
          return helpers.error("password.number"); // Ít nhất một chữ số
        }
        if (!/[@$!%*?&]/.test(value)) {
          return helpers.error("password.special"); // Ít nhất một ký tự đặc biệt
        }
        return value; // Nếu tất cả điều kiện đều đúng
      })
      .messages({
        "string.empty": "Vui lòng nhập mật khẩu!",
        "string.min": "Mật khẩu phải chứa ít nhất 8 ký tự!",
        "password.uppercase": "Mật khẩu phải chứa ít nhất một chữ cái in hoa!",
        "password.lowercase": "Mật khẩu phải chứa ít nhất một chữ cái thường!",
        "password.number": "Mật khẩu phải chứa ít nhất một chữ số!",
        "password.special": "Mật khẩu phải chứa ít nhất một ký tự đặc biệt!",
      }),
  });

  const { error } = schema.validate(req.body);

  if (error) {
    const errorMessage = error.details[0].message;

    res.json({
      code: "error",
      message: errorMessage
    });
    return;
  }

  return next();
}


export const updateProfile = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    companyName: Joi.string()
      .required()
      .max(200)
      .messages({
        "string.empty": "Vui lòng nhập tên công ty!",
        "string.max": "Tên công ty không được vượt quá 200 ký tự!"
      }),
    city: Joi.string()
      .required()
      .messages({
        "string.empty": "Vui lòng chọn thành phố!",
      }),
    address: Joi.string().allow(""),
    companyModel: Joi.string().allow(""),
    companyEmployees: Joi.string().allow(""),
    workingTime: Joi.string().allow(""),
    workOvertime: Joi.string().allow(""),
    description: Joi.string().allow(""),
    email: Joi.string()
      .required()
      .email()
      .messages({
        "string.empty": "Vui lòng nhập email của công ty!",
        "string.email": "Email không đúng định dạng!"
      }),
    logo: Joi.string().allow(""),
    phone: Joi.string()
      .allow('', null) // Cho phép chuỗi rỗng hoặc null
      .pattern(/^(84|0[3|5|7|8|9])[0-9]{8}$/)
      .messages({
        "string.pattern.base": "Số điện thoại không đúng định dạng",
      }),
  });

  const { error } = schema.validate(req.body);

  if (error) {
    const errorMessage = error.details[0].message;

    res.json({
      code: "error",
      message: errorMessage
    });
    return;
  }

  return next();
}


export const createJob = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    title: Joi.string()
      .required()
      .messages({
        "string.empty": "Vui lòng nhập tên công việc!",
      }),
    salaryMin: Joi.number()
      .min(0)
      .messages({
        "string.empty": "Vui lòng nhập mức lương >= 0!",
      }),
    salaryMax: Joi.number()
      .min(0)
      .messages({
        "string.empty": "Vui lòng nhập mức lương >= 0!",
      }),
    level: Joi.string()
      .required()
      .messages({
        "string.empty": "Vui lòng cấp bậc của công việc!",
      }),
    workingForm: Joi.string()
      .required()
      .messages({
        "string.empty": "Vui lòng chọn hình thức làm việc!",
      }),
    skills: Joi.string().allow(""),
    expertise: Joi.string().allow(""),
    images: Joi.string().allow(""),
    description: Joi.string().allow(""),
  });

  const { error } = schema.validate(req.body);

  if (error) {
    const errorMessage = error.details[0].message;

    res.json({
      code: "error",
      message: errorMessage
    });
    return;
  }

  return next();
}
