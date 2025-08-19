"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verify = exports.logout = exports.checkLogin = void 0;
const account_user_model_1 = __importDefault(require("../models/account-user.model"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const account_company_model_1 = __importDefault(require("../models/account-company.model"));
const checkLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = req.cookies.token;
        if (!token) {
            res.json({
                code: "error",
                message: "Token không hợp lệ"
            });
            return;
        }
        // giải mã token
        const decoded = jsonwebtoken_1.default.verify(token, `${process.env.JWT_SECRET}`); // giải mã token
        const { id, email } = decoded;
        // tìm tài khoản ứng viên
        const existingUser = yield account_user_model_1.default.findOne({
            _id: id,
            email: email
        });
        if (existingUser) {
            const info = {
                id: existingUser.id,
                fullName: existingUser.fullName,
                email: existingUser.email,
                avatar: existingUser.avatar,
                phone: existingUser.phone,
                role: "user",
            };
            res.json({
                code: "success",
                message: "Token hợp lệ",
                info: info
            });
            return;
        }
        // tìm tài khoản company
        const existingCompany = yield account_company_model_1.default.findOne({
            _id: id,
            email: email
        });
        if (existingCompany) {
            const info = {
                id: existingCompany.id,
                companyName: existingCompany.companyName,
                email: existingCompany.email,
                city: existingCompany.city,
                address: existingCompany.address,
                companyModel: existingCompany.companyModel,
                companyEmployees: existingCompany.companyEmployees,
                workingTime: existingCompany.workingTime,
                workOvertime: existingCompany.workOvertime,
                description: existingCompany.description,
                logo: existingCompany.logo,
                phone: existingCompany.phone,
                role: "company",
            };
            res.json({
                code: "success",
                message: "Token hợp lệ",
                info: info
            });
            return;
        }
        if (!existingUser && !existingCompany) {
            res.clearCookie("token", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
            });
            res.json({
                code: "error",
                message: "Token không hợp lệ"
            });
        }
    }
    catch (error) {
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
        });
        res.json({
            code: "error",
            message: "Token không hợp lệ"
        });
    }
});
exports.checkLogin = checkLogin;
const logout = (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
    });
    res.json({
        code: "success",
        message: "Đăng xuất thành công"
    });
};
exports.logout = logout;
const verify = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = req.cookies.token;
        if (!token) {
            res.json({
                code: "error",
                message: "Token không hợp lệ"
            });
            return;
        }
        // giải mã token
        const decoded = jsonwebtoken_1.default.verify(token, `${process.env.JWT_SECRET}`); // giải mã token
        const { id, email } = decoded;
        // 3. Kiểm tra trong cả 2 bảng User và Company
        const [user, company] = yield Promise.all([
            account_user_model_1.default.findOne({ _id: id, email: email }),
            account_company_model_1.default.findOne({ _id: id, email: email })
        ]);
        // 4. Trả về thông tin tương ứng
        if (user) {
            return res.json({
                code: "success",
                info: {
                    id: user._id,
                    fullName: user.fullName,
                    email: user.email,
                    avatar: user.avatar,
                    phone: user.phone,
                    role: "user"
                }
            });
        }
        if (company) {
            return res.json({
                code: "success",
                info: {
                    id: company._id,
                    companyName: company.companyName,
                    email: company.email,
                    logo: company.logo,
                    phone: company.phone,
                    role: "company"
                    // Thêm các trường khác nếu cần
                }
            });
        }
        // 5. Nếu không tìm thấy ở cả 2 bảng
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
        });
        return res.status(401).json({
            code: "error",
            message: "Token không hợp lệ"
        });
    }
    catch (error) {
        console.error("Lỗi xác thực token:", error);
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
        });
        res.json({
            code: "error",
            message: "Token không hợp lệ"
        });
    }
});
exports.verify = verify;
