import { Request, Response } from "express";
import AccountUser from "../models/account-user.model";
import Job from "../models/job.model";
import AccountCompany from "../models/account-company.model";
import City from "../models/city.model";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Redis from "ioredis";

// Khởi tạo client Google Gemini
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  generationConfig: { responseMimeType: "application/json" }, // Yêu cầu trả về JSON
});

// Khởi tạo Redis
const redis = new Redis(`${process.env.REDIS_URL}`);

export const recommendedJobList = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;

    // Kiểm tra cache
    const cacheKey = `recommended_jobs:${userId}`;
    const cachedResult = await redis.get(cacheKey);
    const ttl = await redis.ttl(cacheKey);
    console.log(`Remaining TTL for ${cacheKey}: ${ttl} seconds`);
    if (cachedResult) {
      return res.json({
        code: "success",
        recommendedJobList: JSON.parse(cachedResult),
      });
    }

    // Lấy thông tin user
    const user = await AccountUser.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Lấy danh sách job
    const regexArray = user.recentSearches.map((term: string) =>
      new RegExp(term, "i") // "i" = không phân biệt hoa thường
    );
    const jobs = await Job.find(
      {
        $or: [
          { skills: { $in: user.recentSearches } },
          { title: { $in: regexArray } },   // ✅ dùng regex thay cho $in string
          { city: { $in: user.preferredLocations } },
          { _id: { $in: user.recentClicks } },
        ],
      },
      "-description"
    )
      .limit(50);

    // Lấy tất cả company và city liên quan một lần
    const companyIds = jobs.map((job) => job.companyId);
    const companies = await AccountCompany.find({ _id: { $in: companyIds } });
    const cityIds = companies.map((company) => company.city);
    const cities = await City.find({ _id: { $in: cityIds } });
    // Tạo map để truy xuất nhanh
    const companyMap = new Map(companies.map((company) => [company.id.toString(), company]));
    const cityMap = new Map(cities.map((city) => [city.id.toString(), city]));

    // Chuyển đổi dữ liệu
    const dataFinal = jobs.map((item: any) => {
      const company = companyMap.get(item.companyId.toString());
      const city = company ? cityMap.get(company.city?.toString()) : null;
      return {
        id: item._id.toString(),
        companyLogo: company?.logo || "",
        title: item.title,
        companyName: company?.companyName || "",
        salaryMin: item.salaryMin,
        salaryMax: item.salaryMax,
        level: item.level,
        workingForm: item.workingForm,
        companyCity: {
          vi: city?.name?.vi || "",
          en: city?.name?.en || "",
        },
        skills: item.skills,
        slug: item.slug,
        expertise: item.expertise,
        city: company?.city || "",
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

    // Prompt gửi cho AI
    const prompt = `
      Danh sách job:
      ${JSON.stringify(jobsForAI)}
      Lịch sử người dùng:
      - Recent Clicks: ${user.recentClicks.join(", ")}
      - Recent Searches: ${user.recentSearches.join(", ")}
      - Recent Location(city): ${user.preferredLocations.join(", ")}
      Hãy chọn ra tối đa 9 (có thể ít hơn, <= danh sách job) job phù hợp nhất (chỉ lấy các job khác nhau) và trả về JSON dạng:
      [{ "id": string, "title": string, "reason": string }]
    `;

    // Gọi Gemini API
    const result = await model.generateContent(prompt);
    const aiResult = JSON.parse(result.response.text() || "[]");

    // Map từ id AI trả về -> job full
    const recommendedJobs = aiResult.map((rec: any) => {
      const fullJob = dataFinal.find((job) => job.id === rec.id);
      return {
        ...fullJob,
        reason: rec.reason, // giữ reason do AI trả
      };
    });

    // Lưu vào cache
    await redis.set(cacheKey, JSON.stringify(recommendedJobs), "EX", 300);
    res.json({
      code: "success",
      recommendedJobList: recommendedJobs
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Something went wrong"
    });
  }
};