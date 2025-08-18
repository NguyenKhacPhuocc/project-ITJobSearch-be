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
exports.getTotalJob = exports.applyCV = exports.detailJob = void 0;
const job_model_1 = __importDefault(require("../models/job.model"));
const account_company_model_1 = __importDefault(require("../models/account-company.model"));
const cv_model_1 = __importDefault(require("../models/cv.model"));
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
