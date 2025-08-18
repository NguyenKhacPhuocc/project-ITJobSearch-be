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
exports.deleteUserCV = exports.getTotalPageCVList = exports.getCVList = exports.profilePatch = exports.loginPost = exports.registerPost = void 0;
const account_user_model_1 = __importDefault(require("../models/account-user.model"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const account_company_model_1 = __importDefault(require("../models/account-company.model"));
const cv_model_1 = __importDefault(require("../models/cv.model"));
const job_model_1 = __importDefault(require("../models/job.model"));
const registerPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { fullName, email, password } = req.body;
    const existingUser = yield account_user_model_1.default.findOne({
        email: email
    });
    if (existingUser) {
        res.json({
            code: "error",
            message: "Email đã được sử dụng!"
        });
        return;
    }
    // mã hóa mật khẩu với bcrypt
    const salt = yield bcryptjs_1.default.genSalt(10); // tạo ra chuỗi ngẫu nhiên có 10 kí tự
    const hashPassword = yield bcryptjs_1.default.hash(password, salt);
    const newUser = new account_user_model_1.default({
        fullName: fullName,
        email: email,
        password: hashPassword
    });
    yield newUser.save();
    res.json({
        code: "success",
        message: "Đăng ký thành công"
    });
});
exports.registerPost = registerPost;
const loginPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const existingUser = yield account_user_model_1.default.findOne({
        email: email
    });
    if (!existingUser) {
        res.json({
            code: "error",
            message: "Email không tồn tại!"
        });
        return;
    }
    // so sánh mật khẩu người dùng nhập vào với mật khẩu đã mã hóa trong cơ sở dữ liệu
    const isPasswordValid = yield bcryptjs_1.default.compare(password, `${existingUser.password}`);
    if (!isPasswordValid) {
        res.json({
            code: "error",
            message: "Mật khẩu không đúng!"
        });
        return;
    }
    // tạo token JWT
    const token = jsonwebtoken_1.default.sign({
        id: existingUser.id,
        email: existingUser.email
    }, `${process.env.JWT_SECRET}`, // mã bí mật để mã hóa token
    {
        expiresIn: "1d" // token có hiệu lực trong 1 ngày
    });
    // lưu token vào cookie
    res.cookie("token", token, {
        maxAge: (24 * 60 * 60 * 1000), // token có hiệu lực trong vòng 30 hoac 1 ngày
        httpOnly: true,
        secure: process.env.NODE_ENV === "production" ? true : false, // chỉ gửi cookie qua https trong môi trường sản xuất
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax" // Cho phép gửi cookie giữa các domain khác nhau
    });
    res.json({
        code: "success",
        message: "Đăng nhập thành công!"
    });
});
exports.loginPost = loginPost;
const profilePatch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.file) {
        // Trường hợp có file => cập nhật ảnh mới
        req.body.avatar = req.file.path;
    }
    else if (typeof req.body.avatar === "string" && req.body.avatar === "") {
        // Trường hợp chuỗi rỗng => xóa ảnh
        req.body.avatar = "";
    }
    else {
        // Không có gì gửi => không cập nhật avatar
        delete req.body.avatar;
    }
    yield account_user_model_1.default.updateOne({
        _id: req.account.id
    }, req.body);
    res.json({
        code: "success",
        message: "update-successfull",
    });
});
exports.profilePatch = profilePatch;
const getCVList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const email = req.account.email;
    // phân trang
    let limit = 3;
    let page = 1;
    if (req.query.page) {
        const currentPage = parseInt(`${req.query.page}`);
        if (currentPage > 0) {
            page = currentPage;
        }
    }
    // phân trang end
    const cvList = yield cv_model_1.default
        .find({
        email: email
    })
        .skip((page - 1) * limit)
        .limit(limit);
    const dataFinal = [];
    for (const item of cvList) {
        const job = yield job_model_1.default.findOne({
            _id: item.jobId
        });
        if (job) {
            const company = yield account_company_model_1.default.findOne({
                _id: job.companyId
            });
            const dataItemFinal = {
                id: item.id,
                fullName: item.fullName,
                email: item.email,
                phone: item.phone,
                fileCV: item.fileCV,
                companyName: (company === null || company === void 0 ? void 0 : company.companyName) || "",
                jobName: (job === null || job === void 0 ? void 0 : job.title) || "",
                jobSalaryMin: (job === null || job === void 0 ? void 0 : job.salaryMin) || 0,
                jobSalaryMax: (job === null || job === void 0 ? void 0 : job.salaryMax) || 0,
                expertise: (job === null || job === void 0 ? void 0 : job.expertise) || "",
                jobLevel: (job === null || job === void 0 ? void 0 : job.level) || "",
                jobSkills: job === null || job === void 0 ? void 0 : job.skills,
                jobWorkingForm: (job === null || job === void 0 ? void 0 : job.workingForm) || "",
                status: item.status,
                jobSlug: job === null || job === void 0 ? void 0 : job.slug
            };
            dataFinal.push(dataItemFinal);
        }
    }
    res.json({
        code: "success",
        cvList: dataFinal
    });
});
exports.getCVList = getCVList;
const getTotalPageCVList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const email = req.account.email;
    // phân trang
    let limit = 3;
    let page = 1;
    if (req.query.page) {
        const currentPage = parseInt(`${req.query.page}`);
        if (currentPage > 0) {
            page = currentPage;
        }
    }
    const totalRecord = yield cv_model_1.default.countDocuments({
        email: email
    });
    const totalPage = Math.ceil(totalRecord / limit);
    if (page > totalPage && totalPage != 0) {
        page = totalPage;
    }
    // phân trang end
    res.json({
        code: "success",
        totalPage: totalPage
    });
});
exports.getTotalPageCVList = getTotalPageCVList;
const deleteUserCV = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const cv = yield cv_model_1.default.findOne({
            _id: id,
        });
        if (!cv) {
            res.json({
                code: "error",
                message: "Id không hợp lệ"
            });
            return;
        }
        yield cv_model_1.default.deleteOne({
            _id: id,
        });
        res.json({
            code: "success",
            message: "Đã xóa CV!",
        });
    }
    catch (error) {
        console.log(error);
        res.json({
            code: "error",
            message: "Id không hợp lệ"
        });
    }
});
exports.deleteUserCV = deleteUserCV;
