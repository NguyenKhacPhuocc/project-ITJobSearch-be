import { Request, Response, NextFunction } from "express";
import Joi from "joi";

export const registerPost = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    companyName: Joi.string()
      .required()
      .max(200)
      .messages({
        "string.empty": "companyName_required",
        "string.max": "companyName_maxLength"
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

  return next();
}


export const updateProfile = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    companyName: Joi.string()
      .required()
      .max(200)
      .messages({
        "string.empty": "company-name-required",
        "string.max": "company-name-max-length"
      }),
    city: Joi.string()
      .required()
      .messages({
        "string.empty": "city-required",
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
        "string.empty": "company-email-required",
        "string.email": "company-email-invalid"
      }),
    logo: Joi.string().allow(""),
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

  return next();
}


export const createJob = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    title: Joi.string()
      .required()
      .messages({
        "string.empty": "job-name-required",
      }),
    salaryMin: Joi.number()
      .min(0)
      .messages({
        "string.empty": "salary-valid",
      }),
    salaryMax: Joi.number()
      .min(0)
      .messages({
        "string.empty": "salary-valid",
      }),
    level: Joi.string()
      .required()
      .messages({
        "string.empty": "job-level-required",
      }),
    workingForm: Joi.string()
      .required()
      .messages({
        "string.empty": "working-form-required",
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
