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
exports.getTotalPageJobBySkill = exports.getJobBySkill = exports.getTotalPageJobByExpertise = exports.getJobByExpertise = exports.getTotalPageJobByCity = exports.getJobByCity = exports.getTotalJob = exports.applyCV = exports.detailJob = void 0;
const job_model_1 = __importDefault(require("../models/job.model"));
const account_company_model_1 = __importDefault(require("../models/account-company.model"));
const cv_model_1 = __importDefault(require("../models/cv.model"));
const city_model_1 = __importDefault(require("../models/city.model"));
const variable_1 = require("../config/variable");
const detailJob = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const slug = req.params.slug;
        const job = yield job_model_1.default.findOne({
            slug: slug
        });
        if (!job) {
            res.json({
                code: "error",
                detailedJob: []
            });
            return;
        }
        const company = yield account_company_model_1.default.findOne({
            _id: job.companyId
        });
        const detailedJob = {
            id: job.id,
            title: job.title,
            salaryMin: job.salaryMin,
            salaryMax: job.salaryMax,
            images: job.images,
            level: job.level,
            workingForm: job.workingForm,
            skills: job.skills,
            slug: job.slug,
            description: job.description,
            company: {
                companyName: (company === null || company === void 0 ? void 0 : company.companyName) || "",
                logo: (company === null || company === void 0 ? void 0 : company.logo) || "",
                slug: (company === null || company === void 0 ? void 0 : company.slug) || "",
                address: (company === null || company === void 0 ? void 0 : company.address) || "",
                companyModel: (company === null || company === void 0 ? void 0 : company.companyModel) || "",
                companyEmployees: (company === null || company === void 0 ? void 0 : company.companyEmployees) || "",
                workingTime: (company === null || company === void 0 ? void 0 : company.workingTime) || "",
                workOvertime: (company === null || company === void 0 ? void 0 : company.workOvertime) || "",
            }
        };
        res.json({
            code: "success",
            detailedJob: detailedJob
        });
    }
    catch (error) {
        console.log(error);
        res.json({
            code: "error"
        });
    }
});
exports.detailJob = detailJob;
const applyCV = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    req.body.fileCV = ((_a = req.file) === null || _a === void 0 ? void 0 : _a.path) || "";
    const newRecord = new cv_model_1.default(req.body);
    yield newRecord.save();
    res.json({
        code: "success",
        message: "apply_success"
    });
});
exports.applyCV = applyCV;
const getTotalJob = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const totalJob = yield job_model_1.default.countDocuments({});
    res.json({
        code: "success",
        totalJob: totalJob
    });
});
exports.getTotalJob = getTotalJob;
const getJobByCity = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const slug = req.params.slug;
    const find = {};
    const dataFinal = [];
    const city = yield city_model_1.default.findOne({
        slug: slug
    });
    if (!city) {
        return res.json({
            code: "error",
            message: "Thành phố không hợp lệ!",
        });
    }
    const companies = yield account_company_model_1.default.find({
        city: city.id,
    });
    const companyIds = companies.map(item => item.id);
    if (companyIds.length === 0) {
        return res.json({
            code: "success",
            jobs: []
        });
    }
    find.companyId = { $in: companyIds };
    // theo level
    if (req.query.level) {
        find.level = req.query.level;
    }
    // theo workingForm
    if (req.query.workingForm) {
        find.workingForm = req.query.workingForm;
    }
    // phân trang
    let limit = 6;
    let page = 1;
    if (req.query.page) {
        const currentPage = parseInt(`${req.query.page}`);
        if (currentPage > 0) {
            page = currentPage;
        }
    }
    // phân trang end
    const jobs = yield job_model_1.default
        .find(find)
        .sort({
        createdAt: "desc"
    })
        .skip((page - 1) * limit)
        .limit(limit);
    for (const item of jobs) {
        const company = yield account_company_model_1.default.findOne({
            _id: item.companyId,
        });
        const itemFinal = {
            id: item.id,
            companyLogo: (company === null || company === void 0 ? void 0 : company.logo) || "",
            title: item.title,
            companyName: (company === null || company === void 0 ? void 0 : company.companyName) || "",
            salaryMin: item.salaryMin,
            salaryMax: item.salaryMax,
            level: item.level,
            workingForm: item.workingForm,
            companyCity: { vi: "", en: "" },
            skills: item.skills,
            slug: item.slug,
            expertise: item.expertise,
        };
        if (company) {
            const city = yield city_model_1.default.findOne({
                _id: company.city,
            });
            itemFinal.companyCity = {
                vi: ((_a = city === null || city === void 0 ? void 0 : city.name) === null || _a === void 0 ? void 0 : _a.vi) || "",
                en: ((_b = city === null || city === void 0 ? void 0 : city.name) === null || _b === void 0 ? void 0 : _b.en) || "",
            };
        }
        dataFinal.push(itemFinal);
    }
    res.json({
        code: "success",
        jobs: dataFinal,
    });
});
exports.getJobByCity = getJobByCity;
const getTotalPageJobByCity = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const slug = req.params.slug;
    const find = {};
    let totalPage = 0;
    let totalRecord = 0;
    const city = yield city_model_1.default.findOne({
        slug: slug
    });
    if (!city) {
        return res.json({
            code: "error",
            message: "Thành phố không hợp lệ!",
        });
    }
    const companies = yield account_company_model_1.default.find({
        city: city.id,
    });
    const companyIds = companies.map(item => item.id);
    if (companyIds.length === 0) {
        return res.json({
            code: "success",
            totalRecord: totalRecord,
            totalPage: totalPage,
        });
    }
    find.companyId = { $in: companyIds };
    // theo level
    if (req.query.level) {
        find.level = req.query.level;
    }
    // theo workingForm
    if (req.query.workingForm) {
        find.workingForm = req.query.workingForm;
    }
    // phân trang
    let limit = 6;
    let page = 1;
    totalRecord = yield job_model_1.default.countDocuments(find);
    totalPage = Math.ceil(totalRecord / limit);
    if (page > totalPage && totalPage != 0) {
        page = totalPage;
    }
    // phân trang end
    res.json({
        code: "success",
        totalRecord: totalRecord,
        totalPage: totalPage,
    });
});
exports.getTotalPageJobByCity = getTotalPageJobByCity;
const getJobByExpertise = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const locale = req.query.locale;
    const slug = req.params.slug;
    const find = {};
    const dataFinal = [];
    const expertise = variable_1.expertises.find(e => e.slug[locale] === slug);
    if (!expertise) {
        return res.status(400).json({
            code: "error",
            message: "Chuyên môn không hợp lệ!"
        });
    }
    find.$or = [
        { expertise: { $regex: new RegExp(`^${expertise.name.en}$`, "i") } },
        { expertise: { $regex: new RegExp(`^${expertise.name.vi}$`, "i") } }
    ];
    // theo level
    if (req.query.level) {
        find.level = req.query.level;
    }
    // theo workingForm
    if (req.query.workingForm) {
        find.workingForm = req.query.workingForm;
    }
    // phân trang
    let limit = 6;
    let page = 1;
    if (req.query.page) {
        const currentPage = parseInt(`${req.query.page}`);
        if (currentPage > 0) {
            page = currentPage;
        }
    }
    // phân trang end
    const jobs = yield job_model_1.default
        .find(find)
        .sort({
        createdAt: "desc"
    })
        .skip((page - 1) * limit)
        .limit(limit);
    for (const item of jobs) {
        const company = yield account_company_model_1.default.findOne({
            _id: item.companyId,
        });
        const itemFinal = {
            id: item.id,
            companyLogo: (company === null || company === void 0 ? void 0 : company.logo) || "",
            title: item.title,
            companyName: (company === null || company === void 0 ? void 0 : company.companyName) || "",
            salaryMin: item.salaryMin,
            salaryMax: item.salaryMax,
            level: item.level,
            workingForm: item.workingForm,
            companyCity: { vi: "", en: "" },
            skills: item.skills,
            slug: item.slug,
            expertise: item.expertise,
        };
        if (company) {
            const city = yield city_model_1.default.findOne({
                _id: company.city,
            });
            itemFinal.companyCity = {
                vi: ((_a = city === null || city === void 0 ? void 0 : city.name) === null || _a === void 0 ? void 0 : _a.vi) || "",
                en: ((_b = city === null || city === void 0 ? void 0 : city.name) === null || _b === void 0 ? void 0 : _b.en) || "",
            };
        }
        dataFinal.push(itemFinal);
    }
    res.json({
        code: "success",
        jobs: dataFinal,
    });
});
exports.getJobByExpertise = getJobByExpertise;
const getTotalPageJobByExpertise = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const locale = req.query.locale;
    const slug = req.params.slug;
    const find = {};
    let totalPage = 0;
    let totalRecord = 0;
    const expertise = variable_1.expertises.find(e => e.slug[locale] === slug);
    if (!expertise) {
        return res.status(400).json({
            code: "error",
            message: "Chuyên môn không hợp lệ!"
        });
    }
    find.$or = [
        { expertise: { $regex: new RegExp(`^${expertise.name.en}$`, "i") } },
        { expertise: { $regex: new RegExp(`^${expertise.name.vi}$`, "i") } }
    ];
    // theo level
    if (req.query.level) {
        find.level = req.query.level;
    }
    // theo workingForm
    if (req.query.workingForm) {
        find.workingForm = req.query.workingForm;
    }
    // phân trang
    let limit = 6;
    let page = 1;
    totalRecord = yield job_model_1.default.countDocuments(find);
    totalPage = Math.ceil(totalRecord / limit);
    if (page > totalPage && totalPage != 0) {
        page = totalPage;
    }
    // phân trang end
    res.json({
        code: "success",
        totalRecord: totalRecord,
        totalPage: totalPage,
    });
});
exports.getTotalPageJobByExpertise = getTotalPageJobByExpertise;
const getJobBySkill = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const slug = req.params.slug;
    const find = {};
    const dataFinal = [];
    const skill = variable_1.skills.find(e => e.slug === slug);
    if (!skill) {
        return res.status(400).json({
            code: "error",
            message: "Kĩ năng không hợp lệ!"
        });
    }
    find.skills = { $regex: new RegExp(`^${skill.name}$`, "i") };
    // theo level
    if (req.query.level) {
        find.level = req.query.level;
    }
    // theo workingForm
    if (req.query.workingForm) {
        find.workingForm = req.query.workingForm;
    }
    // phân trang
    let limit = 6;
    let page = 1;
    if (req.query.page) {
        const currentPage = parseInt(`${req.query.page}`);
        if (currentPage > 0) {
            page = currentPage;
        }
    }
    // phân trang end
    const jobs = yield job_model_1.default
        .find(find)
        .sort({
        createdAt: "desc"
    })
        .skip((page - 1) * limit)
        .limit(limit);
    for (const item of jobs) {
        const company = yield account_company_model_1.default.findOne({
            _id: item.companyId,
        });
        const itemFinal = {
            id: item.id,
            companyLogo: (company === null || company === void 0 ? void 0 : company.logo) || "",
            title: item.title,
            companyName: (company === null || company === void 0 ? void 0 : company.companyName) || "",
            salaryMin: item.salaryMin,
            salaryMax: item.salaryMax,
            level: item.level,
            workingForm: item.workingForm,
            companyCity: { vi: "", en: "" },
            skills: item.skills,
            slug: item.slug,
            expertise: item.expertise,
        };
        if (company) {
            const city = yield city_model_1.default.findOne({
                _id: company.city,
            });
            itemFinal.companyCity = {
                vi: ((_a = city === null || city === void 0 ? void 0 : city.name) === null || _a === void 0 ? void 0 : _a.vi) || "",
                en: ((_b = city === null || city === void 0 ? void 0 : city.name) === null || _b === void 0 ? void 0 : _b.en) || "",
            };
        }
        dataFinal.push(itemFinal);
    }
    res.json({
        code: "success",
        jobs: dataFinal,
    });
});
exports.getJobBySkill = getJobBySkill;
const getTotalPageJobBySkill = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const slug = req.params.slug;
    const find = {};
    let totalPage = 0;
    let totalRecord = 0;
    const skill = variable_1.skills.find(e => e.slug === slug);
    if (!skill) {
        return res.status(400).json({
            code: "error",
            message: "Kĩ năng không hợp lệ!"
        });
    }
    find.skills = { $regex: new RegExp(`^${skill.name}$`, "i") };
    // theo level
    if (req.query.level) {
        find.level = req.query.level;
    }
    // theo workingForm
    if (req.query.workingForm) {
        find.workingForm = req.query.workingForm;
    }
    // phân trang
    let limit = 6;
    let page = 1;
    totalRecord = yield job_model_1.default.countDocuments(find);
    totalPage = Math.ceil(totalRecord / limit);
    if (page > totalPage && totalPage != 0) {
        page = totalPage;
    }
    // phân trang end
    res.json({
        code: "success",
        totalRecord: totalRecord,
        totalPage: totalPage,
    });
});
exports.getTotalPageJobBySkill = getTotalPageJobBySkill;
