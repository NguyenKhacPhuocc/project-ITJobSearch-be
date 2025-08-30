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
// Khởi tạo client Google Gemini
const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");
const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: { responseMimeType: "application/json" }, // Yêu cầu trả về JSON
});
const recommendedJobList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const dataFinal = [];
        const { userId } = req.body;
        // Lấy thông tin user
        const user = yield account_user_model_1.default.findById(userId);
        if (!user)
            return res.status(404).json({ error: "User not found" });
        // Lấy danh sách job (bỏ description cho nhẹ)
        const jobs = yield job_model_1.default.find({}, "-description");
        for (const item of jobs) {
            const company = yield account_company_model_1.default.findOne({ _id: item.companyId });
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
                city: company === null || company === void 0 ? void 0 : company.city,
            };
            if (company) {
                const city = yield city_model_1.default.findOne({ _id: company.city });
                itemFinal.companyCity = {
                    vi: ((_a = city === null || city === void 0 ? void 0 : city.name) === null || _a === void 0 ? void 0 : _a.vi) || "",
                    en: ((_b = city === null || city === void 0 ? void 0 : city.name) === null || _b === void 0 ? void 0 : _b.en) || "",
                };
            }
            dataFinal.push(itemFinal);
        }
        const { recentClicks, recentSearches, preferredLocations } = user;
        // Rút gọn dữ liệu gửi cho AI
        const jobsForAI = dataFinal.map((job) => ({
            id: job.id,
            title: job.title,
            skills: job.skills,
            level: job.level,
            city: job.city,
            expertise: job.expertise,
        }));
        // Prompt gửi cho AI
        const prompt = `
      Danh sách job:
      ${JSON.stringify(jobsForAI)}

      Lịch sử người dùng:
      - Recent Clicks: ${recentClicks.join(", ")}
      - Recent Searches: ${recentSearches.join(", ")}
      - Recent Location(city): ${preferredLocations.join(", ")}

      Hãy chọn ra 9 job phù hợp nhất và trả về JSON dạng:
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
