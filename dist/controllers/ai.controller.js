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
exports.recommendedJobList = void 0;
const account_user_model_1 = __importDefault(require("../models/account-user.model"));
const job_model_1 = __importDefault(require("../models/job.model"));
const account_company_model_1 = __importDefault(require("../models/account-company.model"));
const city_model_1 = __importDefault(require("../models/city.model"));
const generative_ai_1 = require("@google/generative-ai");
const ioredis_1 = __importDefault(require("ioredis"));
// Khởi tạo client Google Gemini
const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");
const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: { responseMimeType: "application/json" }, // Yêu cầu trả về JSON
});
// Khởi tạo Redis
const redis = new ioredis_1.default(`${process.env.REDIS_URL}`);
const recommendedJobList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { userId } = req.body;
        // Kiểm tra cache
        const cacheKey = `recommended_jobs:${userId}`;
        const cachedResult = yield redis.get(cacheKey);
        const ttl = yield redis.ttl(cacheKey);
        console.log(`Remaining TTL for ${cacheKey}: ${ttl} seconds`);
        if (cachedResult) {
            return res.json({
                code: "success",
                recommendedJobList: JSON.parse(cachedResult),
            });
        }
        // Lấy thông tin user
        const user = yield account_user_model_1.default.findById(userId);
        if (!user)
            return res.status(404).json({ error: "User not found" });
        // Kiểm tra nếu cả 3 thuộc tính đều rỗng
        const hasRecentClicks = user.recentClicks && user.recentClicks.length > 0;
        const hasRecentSearches = user.recentSearches && user.recentSearches.length > 0;
        const hasPreferredLocations = user.preferredLocations && user.preferredLocations.length > 0;
        let jobs;
        if (!hasRecentSearches && !hasPreferredLocations) {
            // Nếu cả 3 đều rỗng, lấy tất cả job
            jobs = yield job_model_1.default.find({}, "-description").limit(15);
        }
        else {
            // Nếu có ít nhất 1 thuộc tính có dữ liệu, query như bình thường
            const regexArray = ((_a = user.recentSearches) === null || _a === void 0 ? void 0 : _a.map((term) => new RegExp(term, "i"))) || [];
            const queryConditions = [];
            if (hasRecentSearches) {
                queryConditions.push({ skills: { $in: user.recentSearches } }, { title: { $in: regexArray } });
            }
            if (hasPreferredLocations) {
                queryConditions.push({ city: { $in: user.preferredLocations } });
            }
            if (hasRecentClicks) {
                queryConditions.push({ _id: { $in: user.recentClicks } });
            }
            jobs = yield job_model_1.default.find({
                $or: queryConditions.length > 0 ? queryConditions : [{}]
            }, "-description").limit(50);
        }
        // Lấy tất cả company và city liên quan một lần
        const companyIds = jobs.map((job) => job.companyId);
        const companies = yield account_company_model_1.default.find({ _id: { $in: companyIds } });
        const cityIds = companies.map((company) => company.city);
        const cities = yield city_model_1.default.find({ _id: { $in: cityIds } });
        // Tạo map để truy xuất nhanh
        const companyMap = new Map(companies.map((company) => [company.id.toString(), company]));
        const cityMap = new Map(cities.map((city) => [city.id.toString(), city]));
        // Chuyển đổi dữ liệu
        const dataFinal = jobs.map((item) => {
            var _a, _b, _c;
            const company = companyMap.get(item.companyId.toString());
            const city = company ? cityMap.get((_a = company.city) === null || _a === void 0 ? void 0 : _a.toString()) : null;
            return {
                id: item._id.toString(),
                companyLogo: (company === null || company === void 0 ? void 0 : company.logo) || "",
                title: item.title,
                companyName: (company === null || company === void 0 ? void 0 : company.companyName) || "",
                salaryMin: item.salaryMin,
                salaryMax: item.salaryMax,
                level: item.level,
                workingForm: item.workingForm,
                companyCity: {
                    vi: ((_b = city === null || city === void 0 ? void 0 : city.name) === null || _b === void 0 ? void 0 : _b.vi) || "",
                    en: ((_c = city === null || city === void 0 ? void 0 : city.name) === null || _c === void 0 ? void 0 : _c.en) || "",
                },
                skills: item.skills,
                slug: item.slug,
                expertise: item.expertise,
                city: (company === null || company === void 0 ? void 0 : company.city) || "",
            };
        });
        // Rút gọn dữ liệu gửi cho AI
        const jobsForAI = dataFinal.map((job) => ({
            id: job.id,
            title: job.title,
            skills: job.skills,
            level: job.level,
            city: job.city,
            expertise: job.expertise,
        }));
        // Prompt gửi cho AI - cập nhật để xử lý trường hợp không có lịch sử
        console.log(jobsForAI);
        const prompt = `
      Danh sách job:
      ${JSON.stringify(jobsForAI)}
      Lịch sử người dùng:
      - Recent Clicks: ${hasRecentClicks ? user.recentClicks.join(", ") : "Không có"}
      - Recent Searches: ${hasRecentSearches ? user.recentSearches.join(", ") : "Không có"}
      - Recent Location(city): ${hasPreferredLocations ? user.preferredLocations.join(", ") : "Không có"}
      ${(!hasRecentClicks && !hasRecentSearches && !hasPreferredLocations)
            ? "Người dùng chưa có lịch sử tương tác, hãy chọn ra 9 job ngẫu nhiên phù hợp nhất."
            : "Hãy chọn ra tối đa 9 job phù hợp nhất dựa trên lịch sử người dùng."}
      Trả về JSON dạng:
      [{ "id": string, "title": string, "reason": string }]
    `;
        // Gọi Gemini API
        const result = yield model.generateContent(prompt);
        const aiResult = JSON.parse(result.response.text() || "[]");
        // Map từ id AI trả về -> job full
        const recommendedJobs = aiResult.map((rec) => {
            const fullJob = dataFinal.find((job) => job.id === rec.id);
            return Object.assign(Object.assign({}, fullJob), { reason: rec.reason });
        });
        // Lưu vào cache
        yield redis.set(cacheKey, JSON.stringify(recommendedJobs), "EX", 300);
        res.json({
            code: "success",
            recommendedJobList: recommendedJobs
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Something went wrong"
        });
    }
});
exports.recommendedJobList = recommendedJobList;
