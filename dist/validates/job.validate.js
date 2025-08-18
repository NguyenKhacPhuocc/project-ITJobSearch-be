"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyCV = void 0;
const joi_1 = __importDefault(require("joi"));
const applyCV = (req, res, next) => {
    const schema = joi_1.default.object({
        jobId: joi_1.default.string()
            .required()
            .messages({
            "string.empty": "jobid_not_found"
        }),
        fullName: joi_1.default.string()
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
        email: joi_1.default.string()
            .email()
            .required()
            .messages({
            'string.email': 'email_invalid',
            'string.empty': 'email_required',
            'any.required': 'email_required',
        }),
        phone: joi_1.default.string()
            .pattern(/^(84|0[3|5|7|8|9])[0-9]{8}$/)
            .required()
            .messages({
            'string.pattern.base': 'phone_invalid',
            'string.empty': 'phone_required',
            'any.required': 'phone_required',
        }),
        // CV file sẽ check riêng qua middleware multer, nhưng có thể check type & size
        fileCV: joi_1.default.object({
            fieldname: joi_1.default.string(),
            originalname: joi_1.default.string(),
            encoding: joi_1.default.string(),
            mimetype: joi_1.default.string().valid('application/pdf').required().messages({
                'any.only': 'cv_pdf_only',
                'any.required': 'cv_required'
            }),
            size: joi_1.default.number().max(5 * 1024 * 1024).required().messages({
                'number.max': 'cv_max_size',
                'any.required': 'cv_required'
            }),
            destination: joi_1.default.string(),
            filename: joi_1.default.string(),
            path: joi_1.default.string()
        }).required().messages({
            'any.required': 'cv_required'
        })
    });
    const { error } = schema.validate(Object.assign(Object.assign({}, req.body), { fileCV: req.file }));
    if (error) {
        const errorMessage = error.details[0].message;
        res.json({
            code: "error",
            message: errorMessage
        });
        return;
    }
    next();
};
exports.applyCV = applyCV;
