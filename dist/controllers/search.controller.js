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
exports.searchTotalPages = exports.search = void 0;
const job_model_1 = __importDefault(require("../models/job.model"));
const account_company_model_1 = __importDefault(require("../models/account-company.model"));
const city_model_1 = __importDefault(require("../models/city.model"));
const search = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const dataFinal = [];
    let companyInfo = null;
    let totalPage = 1;
    if (Object.keys(req.query).length > 0) {
        const find = {};
        // skill
        if (req.query.skill) {
            find.skills = { $regex: new RegExp(`^${req.query.skill}$`, 'i') };
        }
        //city
        if (req.query.city) {
            const city = yield city_model_1.default.findOne({
                $or: [
                    { "name.en": req.query.city },
                    { "name.vi": req.query.city }
                ]
            });
            if (city) {
                const companies = yield account_company_model_1.default.find({
                    city: city.id,
                });
                const companyIds = companies.map(item => item.id);
                if (companyIds.length > 0) {
                    find.companyId = { $in: companyIds };
                }
            }
        }
        // keysearch
        if (req.query.keysearch) {
            const regex = new RegExp(`${req.query.keysearch}`, "i");
            companyInfo = yield account_company_model_1.default.findOne({
                companyName: regex
            }).select("_id companyName slug logo address");
            if (companyInfo) {
                companyInfo = {
                    id: companyInfo._id,
                    companyName: companyInfo.companyName,
                    slug: companyInfo.slug,
                    logo: companyInfo.logo,
                    address: companyInfo.address
                };
                find.$or = [
                    { title: regex },
                    { skills: regex },
                    { companyId: `${companyInfo.id}` }
                ];
            }
            else {
                find.$or = [
                    { title: regex },
                    { skills: regex }
                ];
            }
        }
        // theo level
        if (req.query.level) {
            find.level = req.query.level;
        }
        // theo workingForm
        if (req.query.workingForm) {
            find.workingForm = req.query.workingForm;
        }
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
    }
    res.json({
        code: "success",
        jobs: dataFinal,
        companyInfo: companyInfo
    });
});
exports.search = search;
const searchTotalPages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let companyInfo = null;
    let totalPage = 0;
    let totalRecord = 0;
    if (Object.keys(req.query).length > 0) {
        const find = {};
        // skill
        if (req.query.skill) {
            find.skills = { $regex: new RegExp(`^${req.query.skill}$`, 'i') };
        }
        //city
        if (req.query.city) {
            const city = yield city_model_1.default.findOne({
                $or: [
                    { "name.en": req.query.city },
                    { "name.vi": req.query.city }
                ]
            });
            if (city) {
                const companies = yield account_company_model_1.default.find({
                    city: city.id,
                });
                const companyIds = companies.map(item => item.id);
                if (companyIds.length > 0) {
                    find.companyId = { $in: companyIds };
                }
            }
        }
        // keysearch
        if (req.query.keysearch) {
            const regex = new RegExp(`${req.query.keysearch}`, "i");
            companyInfo = yield account_company_model_1.default.findOne({
                companyName: regex
            }).select("_id companyName slug logo address");
            if (companyInfo) {
                companyInfo = {
                    id: companyInfo._id,
                    companyName: companyInfo.companyName,
                    slug: companyInfo.slug,
                    logo: companyInfo.logo,
                    address: companyInfo.address
                };
                find.$or = [
                    { title: regex },
                    { skills: regex },
                    { companyId: `${companyInfo.id}` }
                ];
            }
            else {
                find.$or = [
                    { title: regex },
                    { skills: regex }
                ];
            }
        }
        // theo level
        if (req.query.level) {
            find.level = req.query.level;
        }
        // theo workingForm
        if (req.query.workingForm) {
            find.workingForm = req.query.workingForm;
        }
        // phân trang
        let limit = 3;
        let page = 1;
        totalRecord = yield job_model_1.default.countDocuments(find);
        totalPage = Math.ceil(totalRecord / limit);
        if (page > totalPage && totalPage != 0) {
            page = totalPage;
        }
        // phân trang end
    }
    res.json({
        code: "success",
        totalRecord: totalRecord,
        totalPage: totalPage,
    });
});
exports.searchTotalPages = searchTotalPages;
