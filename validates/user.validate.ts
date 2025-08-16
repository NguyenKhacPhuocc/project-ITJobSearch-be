import { Request, Response, NextFunction } from "express";
import Joi from "joi";

export const registerPost = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    fullName: Joi.string()
      .required()
      .min(5)
      .max(50)
      .messages({
        "string.empty": "fullName_required",
        "string.min": "fullName_minLength",
        "string.max": "fullName_maxLength"
      }),
    email: Joi.string()
      .required()
      .email()
      .messages({
        "string.empty": "email_required",
        "string.email": "email_invalid"
      }),
    password: Joi.string()
      .required()
      .min(8) // Ít nhất 8 ký tự
      .custom((value, helpers) => {
        if (!/[A-Z]/.test(value)) {
          return helpers.error("password.uppercase");
        }
        if (!/[a-z]/.test(value)) {
          return helpers.error("password.lowercase");
        }
        if (!/\d/.test(value)) {
          return helpers.error("password.number");
        }
        if (!/[@$!%*?&]/.test(value)) {
          return helpers.error("password.special");
        }
        return value;
      })
      .messages({
        "string.empty": "password_required",
        "string.min": "password_minLength",
        "password.uppercase": "password_uppercase",
        "password.lowercase": "password_lowercase",
        "password.number": "password_number",
        "password.special": "password_special"
      })
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

  next();
}


export const updateProfile = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    fullName: Joi.string()
      .required()
      .min(5)
      .max(50)
      .messages({
        "string.empty": "fullName_required",
        "string.min": "fullName_minLength",
        "string.max": "fullName_maxLength"
      }),
    email: Joi.string()
      .required()
      .email()
      .messages({
        "string.empty": "email_required",
        "string.email": "email_invalid"
      }),
    avatar: Joi.string().allow(""),
    phone: Joi.string()
      .allow('', null) // Cho phép chuỗi rỗng hoặc null
      .pattern(/^(84|0[3|5|7|8|9])[0-9]{8}$/)
      .messages({
        "string.pattern.base": "phone-invalid",
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

  next();
}
