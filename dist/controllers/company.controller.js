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
exports.deleteCv = exports.changeStatusCVPatch = exports.getDetailedCV = exports.getTotalPageCVList = exports.getCVList = exports.getJobsInCompany = exports.getDetailedCompany = exports.getTotalPageCompanyList = exports.getCompanyList = exports.list = exports.jobDelete = exports.JobEditPatch = exports.getJobEdit = exports.getTotalPageJobList = exports.getJobList = exports.createJobPost = exports.profilePatch = exports.loginPost = exports.registerPost = void 0;
const account_company_model_1 = __importDefault(require("../models/account-company.model"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const job_model_1 = __importDefault(require("../models/job.model"));
const city_model_1 = __importDefault(require("../models/city.model"));
const cv_model_1 = __importDefault(require("../models/cv.model"));
const registerPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { companyName, email, password } = req.body;
    const existingCompany = yield account_company_model_1.default.findOne({
        email: email
    });
    if (existingCompany) {
        res.json({
            code: "error",
            message: "Email đã được sử dụng!"
        });
        return;
    }
    // mã hóa mật khẩu với bcrypt
    const salt = yield bcryptjs_1.default.genSalt(10); // tạo ra chuỗi ngẫu nhiên có 10 kí tự
    const hashPassword = yield bcryptjs_1.default.hash(password, salt);
    const newAccountCompany = new account_company_model_1.default({
        companyName: companyName,
        email: email,
        password: hashPassword
    });
    yield newAccountCompany.save();
    res.json({
        code: "success",
        message: "Đăng ký thành công"
    });
});
exports.registerPost = registerPost;
const loginPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const existingCompany = yield account_company_model_1.default.findOne({
        email: email
    });
    if (!existingCompany) {
        res.json({
            code: "error",
            message: "Email không tồn tại! ??"
        });
        return;
    }
    // so sánh mật khẩu người dùng nhập vào với mật khẩu đã mã hóa trong cơ sở dữ liệu
    const isPasswordValid = yield bcryptjs_1.default.compare(password, `${existingCompany.password}`);
    if (!isPasswordValid) {
        res.json({
            code: "error",
            message: "Mật khẩu không đúng!"
        });
        return;
    }
    // tạo token JWT
    const token = jsonwebtoken_1.default.sign({
        id: existingCompany.id,
        email: existingCompany.email
    }, `${process.env.JWT_SECRET}`, // mã bí mật để mã hóa token
    {
        expiresIn: "1d" // token có hiệu lực trong 1 ngày
    });
    // lưu token vào cookie
    res.cookie("token", token, {
        maxAge: (24 * 60 * 60 * 1000), // token có hiệu lực trong vòng 30 hoac 1 ngày
        httpOnly: true,
        secure: process.env.NODE_ENV === "production" ? true : false, // chỉ gửi cookie qua https trong môi trường sản xuất
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // Cho phép gửi cookie giữa các domain khác nhau
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
        req.body.logo = req.file.path;
    }
    else if (typeof req.body.logo === "string" && req.body.logo === "") {
        // Trường hợp chuỗi rỗng => xóa ảnh
        req.body.logo = "";
    }
    else {
        // Không có gì gửi => không cập nhật avatar
        delete req.body.logo;
    }
    yield account_company_model_1.default.updateOne({
        _id: req.account.id
    }, req.body);
    res.json({
        code: "success",
        message: "Cập nhật thành công",
    });
});
exports.profilePatch = profilePatch;
const createJobPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    req.body.companyId = req.account.id;
    req.body.salaryMin = req.body.salaryMin ? parseInt(req.body.salaryMin) : 0;
    req.body.salaryMax = req.body.salaryMax ? parseInt(req.body.salaryMax) : 0;
    req.body.skills = req.body.skills ? req.body.skills.split(', ') : [];
    req.body.images = [];
    // Xử lý mảng images
    if (req.files) {
        for (const file of req.files) {
            req.body.images.push(file.path);
        }
    }
    const newJob = new job_model_1.default(req.body);
    yield newJob.save();
    res.json({
        code: "success",
        message: "Cập nhật thành công",
    });
});
exports.createJobPost = createJobPost;
const getJobList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    // Chỉ lấy 'vi' hoặc 'en', nếu không thì mặc định là 'en'
    const rawLocale = req.headers['accept-language'];
    const locale = rawLocale === 'vi' ? 'vi' : 'en';
    const find = {
        companyId: req.account.id
    };
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
    const jobList = yield job_model_1.default
        .find(find)
        .sort({
        createdAt: "desc"
    })
        .skip((page - 1) * limit)
        .limit(limit);
    const dataFinal = [];
    const city = yield city_model_1.default.findOne({
        _id: req.account.city
    });
    for (const item of jobList) {
        dataFinal.push({
            id: item.id,
            companyLogo: req.account.logo,
            title: item.title,
            companyName: req.account.companyName,
            salaryMin: item.salaryMin,
            salaryMax: item.salaryMax,
            level: item.level,
            workingForm: item.workingForm,
            companyCity: (_d = (_b = (_a = city === null || city === void 0 ? void 0 : city.name) === null || _a === void 0 ? void 0 : _a[locale]) !== null && _b !== void 0 ? _b : (_c = city === null || city === void 0 ? void 0 : city.name) === null || _c === void 0 ? void 0 : _c['en']) !== null && _d !== void 0 ? _d : '',
            skills: item.skills,
            expertise: item.expertise,
            slug: item.slug
        });
    }
    res.json({
        code: "success",
        jobList: dataFinal,
    });
});
exports.getJobList = getJobList;
const getTotalPageJobList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const find = {
        companyId: req.account.id
    };
    // phân trang
    let limit = 3;
    let page = 1;
    const totalRecord = yield job_model_1.default.countDocuments(find);
    const totalPage = Math.ceil(totalRecord / limit);
    if (page > totalPage && totalPage != 0) {
        page = totalPage;
    }
    // phân trang end
    res.json({
        code: "success",
        totalPage: totalPage,
    });
});
exports.getTotalPageJobList = getTotalPageJobList;
const getJobEdit = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const slug = req.params.slug;
        const jobDetail = yield job_model_1.default.findOne({
            slug: slug,
            companyId: req.account.id
        });
        if (!jobDetail) {
            res.json({
                code: "error",
                message: "id-invalid"
            });
            return;
        }
        res.json({
            code: "success",
            jobDetail: jobDetail,
        });
    }
    catch (error) {
        console.log(error);
        res.json({
            code: "error",
            message: "id-invalid"
        });
    }
});
exports.getJobEdit = getJobEdit;
const JobEditPatch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const slug = req.params.slug;
        const jobDetail = yield job_model_1.default.findOne({
            slug: slug,
            companyId: req.account.id
        });
        if (!jobDetail) {
            res.json({
                code: "error",
                message: "Id không hợp lệ"
            });
            return;
        }
        req.body.companyId = req.account.id;
        req.body.salaryMin = req.body.salaryMin ? parseInt(req.body.salaryMin) : 0;
        req.body.salaryMax = req.body.salaryMax ? parseInt(req.body.salaryMax) : 0;
        req.body.skills = req.body.skills ? req.body.skills.split(', ') : [];
        req.body.images = [];
        // Xử lý mảng images
        if (req.files) {
            for (const file of req.files) {
                req.body.images.push(file.path);
            }
        }
        yield job_model_1.default.updateOne({
            slug: slug,
            companyId: req.account.id
        }, req.body);
        res.json({
            code: "success",
            message: "Cập nhật thành công!",
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
exports.JobEditPatch = JobEditPatch;
const jobDelete = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const jobDetail = yield job_model_1.default.findOne({
            _id: id,
            companyId: req.account.id
        });
        if (!jobDetail) {
            res.json({
                code: "error",
                message: "Id không hợp lệ"
            });
            return;
        }
        yield job_model_1.default.deleteOne({
            _id: id,
            companyId: req.account.id,
        });
        res.json({
            code: "success",
            message: "Đã xóa công việc!",
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
exports.jobDelete = jobDelete;
const list = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const companyList = yield account_company_model_1.default
        .find({});
    const copanyDataFinal = [];
    for (const item of companyList) {
        copanyDataFinal.push({
            id: item.id,
            logo: item.logo,
            companyName: item.companyName,
            slug: item.slug
        });
    }
    res.json({
        code: "success",
        companies: copanyDataFinal
    });
});
exports.list = list;
const getCompanyList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let limit = 9;
    let page = 1;
    if (req.query.page) {
        const currentPage = parseInt(`${req.query.page}`);
        if (currentPage > 0) {
            page = currentPage;
        }
    }
    const companyList = yield account_company_model_1.default
        .find({})
        .skip((page - 1) * limit)
        .limit(limit);
    const copanyDataFinal = [];
    for (const item of companyList) {
        const city = yield city_model_1.default.findOne({
            _id: item.city
        });
        const totalJobInCompany = yield job_model_1.default.countDocuments({
            companyId: item.id,
        });
        copanyDataFinal.push({
            id: item.id,
            logo: item.logo,
            companyName: item.companyName,
            cityName: city === null || city === void 0 ? void 0 : city.name,
            totalJob: totalJobInCompany ? totalJobInCompany : 0,
            slug: item.slug
        });
    }
    res.json({
        code: "success",
        companyList: copanyDataFinal
    });
});
exports.getCompanyList = getCompanyList;
const getTotalPageCompanyList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // phân trang
    let limit = 9;
    let page = 1;
    const totalRecord = yield account_company_model_1.default.countDocuments({});
    const totalPage = Math.ceil(totalRecord / limit);
    if (page > totalPage && totalPage != 0) {
        page = totalPage;
    }
    // phân trang end
    res.json({
        code: "success",
        totalPage: totalPage,
    });
});
exports.getTotalPageCompanyList = getTotalPageCompanyList;
const getDetailedCompany = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const slug = req.params.slug;
        const company = yield account_company_model_1.default.findOne({
            slug: slug
        });
        if (!company) {
            res.json({
                code: "error",
                detailedCompany: {}
            });
            return;
        }
        const detailedCompany = {
            id: company.id,
            logo: company.logo,
            companyName: company.companyName,
            address: company.address,
            companyModel: company.companyModel,
            companyEmployees: company.companyEmployees,
            workingTime: company.workingTime,
            workOvertime: company.workOvertime,
            description: company.description,
        };
        res.json({
            code: "success",
            detailedCompany: detailedCompany
        });
    }
    catch (error) {
        console.log(error);
        res.json({
            code: "error"
        });
    }
});
exports.getDetailedCompany = getDetailedCompany;
const getJobsInCompany = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const slug = req.params.slug;
        const company = yield account_company_model_1.default.findOne({
            slug: slug
        });
        if (!company) {
            res.json({
                code: "error",
                jobs: []
            });
            return;
        }
        const jobs = yield job_model_1.default.find({
            companyId: company.id
        });
        const dataFinal = [];
        const city = yield city_model_1.default.findOne({
            _id: company.city
        });
        for (const item of jobs) {
            dataFinal.push({
                id: item.id,
                slug: item.slug,
                companyLogo: company.logo,
                title: item.title,
                companyName: company.companyName,
                salaryMin: item.salaryMin,
                salaryMax: item.salaryMax,
                level: item.level,
                workingForm: item.workingForm,
                companyCity: (city === null || city === void 0 ? void 0 : city.name) || { vi: "", en: "" },
                skills: item.skills,
                expertise: item.expertise,
            });
        }
        res.json({
            code: "success",
            jobs: dataFinal
        });
    }
    catch (error) {
        console.log(error);
        res.json({
            code: "error"
        });
    }
});
exports.getJobsInCompany = getJobsInCompany;
const getCVList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const companyId = req.account.id;
    const JobsInCompany = yield job_model_1.default.find({
        companyId: companyId
    });
    const JobIdList = JobsInCompany.map(item => item.id);
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
        jobId: { $in: JobIdList }
    })
        .skip((page - 1) * limit)
        .limit(limit);
    const dataFinal = [];
    for (const item of cvList) {
        const job = yield job_model_1.default.findOne({
            _id: item.jobId
        });
        const dataItemFinal = {
            id: item.id,
            jobName: (job === null || job === void 0 ? void 0 : job.title) || "",
            fullName: item.fullName,
            phone: item.phone,
            email: item.email,
            jobSalaryMin: (job === null || job === void 0 ? void 0 : job.salaryMin) || 0,
            jobSalaryMax: (job === null || job === void 0 ? void 0 : job.salaryMax) || 0,
            jobLevel: (job === null || job === void 0 ? void 0 : job.level) || "",
            jobWorkingForm: (job === null || job === void 0 ? void 0 : job.workingForm) || "",
            viewed: item.viewed,
            status: item.status,
        };
        dataFinal.push(dataItemFinal);
    }
    res.json({
        code: "success",
        cvList: dataFinal
    });
});
exports.getCVList = getCVList;
const getTotalPageCVList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const companyId = req.account.id;
    const JobsInCompany = yield job_model_1.default.find({
        companyId: companyId
    });
    const JobIdList = JobsInCompany.map(item => item.id);
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
        jobId: { $in: JobIdList }
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
const getDetailedCV = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const idCV = req.params.id;
        const companyId = req.account.id;
        const detailedCV = yield cv_model_1.default.findOne({
            _id: idCV,
        }).select("fullName jobId email phone fileCV");
        if (!detailedCV) {
            res.json({
                code: "error",
                message: "Id không hợp lệ!"
            });
            return;
        }
        const jobInfo = yield job_model_1.default.findOne({
            _id: detailedCV.jobId,
            companyId: companyId
        }).select("title salaryMin salaryMax level workingForm skills slug");
        if (!jobInfo) {
            res.json({
                code: "error",
                message: "Không có quyền truy cập!"
            });
            return;
        }
        // cập nhật lại trang thái đã xem cv
        yield cv_model_1.default.updateOne({
            _id: idCV
        }, {
            viewed: true
        });
        res.json({
            code: "success",
            detailedCV: detailedCV,
            jobInfo: jobInfo
        });
    }
    catch (error) {
        console.log(error);
        res.json({
            code: "error",
        });
    }
});
exports.getDetailedCV = getDetailedCV;
const changeStatusCVPatch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const companyId = req.account.id;
        const status = req.body.action;
        const cvId = req.body.id;
        const infoCV = yield cv_model_1.default.findOne({
            _id: cvId
        });
        if (!infoCV) {
            res.json({
                code: "error",
                message: "Id không hợp lệ!"
            });
            return;
        }
        const infoJob = yield job_model_1.default.findOne({
            _id: infoCV.jobId,
            companyId: companyId
        });
        if (!infoJob) {
            res.json({
                code: "error",
                message: "Không có quyền truy cập!"
            });
            return;
        }
        yield cv_model_1.default.updateOne({
            _id: cvId
        }, {
            status: status
        });
        res.json({
            code: "success",
            message: "Thành công!"
        });
    }
    catch (error) {
        console.log(error);
        res.json({
            code: "error",
            message: "Id không hợp lệ!"
        });
    }
});
exports.changeStatusCVPatch = changeStatusCVPatch;
const deleteCv = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const companyId = req.account.id;
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
        const infoJob = yield job_model_1.default.findOne({
            _id: cv.jobId,
            companyId: companyId
        });
        if (!infoJob) {
            res.json({
                code: "error",
                message: "Không có quyền truy cập!"
            });
            return;
        }
        yield cv_model_1.default.deleteOne({
            _id: id,
        });
        res.json({
            code: "success",
            message: "Đã xóa công việc!",
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
exports.deleteCv = deleteCv;
