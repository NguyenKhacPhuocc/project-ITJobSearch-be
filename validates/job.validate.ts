import { Request, Response, NextFunction } from "express";
import Joi from "joi";

export const applyCV = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    jobId: Joi.string()
      .required()
      .messages({
        "string.empty": "jobid_not_found"
      }),
    fullName: Joi.string()
      .min(5)
      .max(50)
      .required()
      .messages({
        'string.base': 'fullName_required',
        'string.empty': 'fullName_required',
        'string.min': 'fullName_minLength',
        'string.max': 'fullName_maxLength',
        'any.required': 'fullName_required',
      }),
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'email_invalid',
        'string.empty': 'email_required',
        'any.required': 'email_required',
      }),
    phone: Joi.string()
      .pattern(/^(84|0[3|5|7|8|9])[0-9]{8}$/)
      .required()
      .messages({
        'string.pattern.base': 'phone_invalid',
        'string.empty': 'phone_required',
        'any.required': 'phone_required',
      }),
    // CV file sẽ check riêng qua middleware multer, nhưng có thể check type & size
    fileCV: Joi.object({
      fieldname: Joi.string(),
      originalname: Joi.string(),
      encoding: Joi.string(),
      mimetype: Joi.string().valid('application/pdf').required().messages({
        'any.only': 'cv_pdf_only',
        'any.required': 'cv_required'
      }),
      size: Joi.number().max(5 * 1024 * 1024).required().messages({
        'number.max': 'cv_max_size',
        'any.required': 'cv_required'
      }),
      destination: Joi.string(),
      filename: Joi.string(),
      path: Joi.string()
    }).required().messages({
      'any.required': 'cv_required'
    })
  });

  const { error } = schema.validate({
    ...req.body,
    fileCV: req.file
  });

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