import { Request, Response } from "express";
import AccountUser from "../models/account-user.model";
import Job from "../models/job.model";
import AccountCompany from "../models/account-company.model";
import City from "../models/city.model";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Khởi tạo client Google Gemini
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  generationConfig: { responseMimeType: "application/json" }, // Yêu cầu trả về JSON
});

export const recommendedJobList = async (req: Request, res: Response) => {
  try {
    const dataFinal: any[] = [];
    const { userId } = req.body;

    // Lấy thông tin user
    const user = await AccountUser.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Lấy danh sách job (bỏ description cho nhẹ)
    const jobs = await Job.find({}, "-description");

    for (const item of jobs) {
      const company = await AccountCompany.findOne({ _id: item.companyId });
      const itemFinal: any = {
        id: item.id,
        companyLogo: company?.logo || "",
        title: item.title,
        companyName: company?.companyName || "",
        salaryMin: item.salaryMin,
        salaryMax: item.salaryMax,
        level: item.level,
        workingForm: item.workingForm,
        companyCity: { vi: "", en: "" },
        skills: item.skills,
        slug: item.slug,
        expertise: item.expertise,
        city: company?.city,
      };

      if (company) {
        const city = await City.findOne({ _id: company.city });
        itemFinal.companyCity = {
          vi: city?.name?.vi || "",
          en: city?.name?.en || "",
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