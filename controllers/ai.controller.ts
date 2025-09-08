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

    // Kiểm tra nếu cả 3 thuộc tính đều rỗng
    const hasRecentClicks = user.recentClicks && user.recentClicks.length > 0;
    const hasRecentSearches = user.recentSearches && user.recentSearches.length > 0;
    const hasPreferredLocations = user.preferredLocations && user.preferredLocations.length > 0;

    let jobs;

    if (!hasRecentClicks && !hasRecentSearches && !hasPreferredLocations) {
      // Nếu cả 3 đều rỗng, lấy tất cả job
      jobs = await Job.find({}, "-description").limit(15);
    } else {
      // Nếu có ít nhất 1 thuộc tính có dữ liệu, query như bình thường
      const regexArray = user.recentSearches?.map((term: string) =>
        new RegExp(term, "i")
      ) || [];

      const queryConditions: any[] = [];

      if (hasRecentSearches) {
        queryConditions.push(
          { skills: { $in: user.recentSearches } },
          { title: { $in: regexArray } }
        );
      }

      if (hasPreferredLocations) {
        queryConditions.push({ city: { $in: user.preferredLocations } });
      }

      if (hasRecentClicks) {
        queryConditions.push({ _id: { $in: user.recentClicks } });
      }

      jobs = await Job.find(
        {
          $or: queryConditions.length > 0 ? queryConditions : [{}]
        },
        "-description"
      ).limit(50);
    }

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

    // Prompt gửi cho AI - cập nhật để xử lý trường hợp không có lịch sử
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