"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfile = exports.registerPost = void 0;
const joi_1 = __importDefault(require("joi"));
const registerPost = (req, res, next) => {
    const schema = joi_1.default.object({
        fullName: joi_1.default.string()
            .required()
            .min(5)
            .max(50)
            .messages({
            "string.empty": "fullName_required",
            "string.min": "fullName_minLength",
            "string.max": "fullName_maxLength"
        }),
        email: joi_1.default.string()
            .required()
            .email()
            .messages({
            "string.empty": "email_required",
            "string.email": "email_invalid"
        }),
        password: joi_1.default.string()
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
};
exports.registerPost = registerPost;
const updateProfile = (req, res, next) => {
    const schema = joi_1.default.object({
        fullName: joi_1.default.string()
            .required()
            .min(5)
            .max(50)
            .messages({
            "string.empty": "fullName_required",
            "string.min": "fullName_minLength",
            "string.max": "fullName_maxLength"
        }),
        email: joi_1.default.string()
            .required()
            .email()
            .messages({
            "string.empty": "email_required",
            "string.email": "email_invalid"
        }),
        avatar: joi_1.default.string().allow(""),
        phone: joi_1.default.string()
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
};
exports.updateProfile = updateProfile;
