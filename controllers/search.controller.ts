import { Request, Response } from "express";
import Job from "../models/job.model";
import AccountCompany from "../models/account-company.model";
import City from "../models/city.model";
import { AccountRequest } from "../interfaces/request.interface";
import AccountUser from "../models/account-user.model";
import jwt from "jsonwebtoken";

export const search = async (req: Request, res: Response) => {
  const dataFinal = []
  let companyInfo: any = null;

  if (Object.keys(req.query).length > 0) {
    const find: any = {}

    // skill
    if (req.query.skill) {
      find.skills = { $regex: new RegExp(`^${req.query.skill}$`, 'i') };
    }

    //city
    if (req.query.city) {
      const city = await City.findOne({
        $or: [
          { "name.en": req.query.city },
          { "name.vi": req.query.city }
        ]
      })
      if (city) {
        const companies = await AccountCompany.find({
          city: city.id,
        })
        const companyIds = companies.map(item => item.id)
        if (companyIds.length > 0) {
          find.companyId = { $in: companyIds };
        }
      }
    }

    // keysearch
    if (req.query.keysearch) {
      const regex = new RegExp(`${req.query.keysearch}`, "i");
      companyInfo = await AccountCompany.findOne({
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
      } else {
        find.$or = [
          { title: regex },
          { skills: regex }
        ];
      }
    }

    // theo level
    if (req.query.level) {
      find.level = req.query.level
    }

    // theo workingForm
    if (req.query.workingForm) {
      find.workingForm = req.query.workingForm
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

    const jobs = await Job
      .find(find)
      .sort({
        createdAt: "desc"
      })
      .skip((page - 1) * limit)
      .limit(limit);

    for (const item of jobs) {
      const company = await AccountCompany.findOne({
        _id: item.companyId,
      })
      const itemFinal = {
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
      };
      if (company) {
        const city = await City.findOne({
          _id: company.city,
        })
        itemFinal.companyCity = {
          vi: city?.name?.vi || "",
          en: city?.name?.en || "",
        };
      }
      dataFinal.push(itemFinal);
    }
  }
  res.json({
    code: "success",
    jobs: dataFinal,
    companyInfo: companyInfo
  })
}

export const recentSearch = async (req: AccountRequest, res: Response) => {
  const token = req.cookies["token"];
  if (token) {
    const keysearch = req.query.keysearch
    if (keysearch) {
      const decoded = jwt.verify(token, `${process.env.JWT_SECRET}`) as jwt.JwtPayload; // Giải mã token
      const { id, email } = decoded;

      await AccountUser.findByIdAndUpdate(id, {
        $pull: { recentSearches: keysearch } // xoá trước nếu đã tồn tại
      });

      await AccountUser.findByIdAndUpdate(id, {
        $push: {
          recentSearches: {
            $each: [keysearch], // thêm mới
            $position: 0,         // thêm vào đầu mảng (mới nhất trước)
            $slice: 5            // giữ lại 5 phần tử
          }
        }
      });
    }
  }
}


export const searchTotalPages = async (req: Request, res: Response) => {
  let companyInfo: any = null;
  let totalPage = 0;
  let totalRecord = 0;

  if (Object.keys(req.query).length > 0) {
    const find: any = {}

    //city
    if (req.query.city) {
      const city = await City.findOne({
        $or: [
          { "name.en": req.query.city },
          { "name.vi": req.query.city }
        ]
      })
      if (city) {
        const companies = await AccountCompany.find({
          city: city.id,
        })
        const companyIds = companies.map(item => item.id)
        if (companyIds.length > 0) {
          find.companyId = { $in: companyIds };
        }
      }
    }

    // keysearch
    if (req.query.keysearch) {
      const regex = new RegExp(`${req.query.keysearch}`, "i");
      companyInfo = await AccountCompany.findOne({
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
      } else {
        find.$or = [
          { title: regex },
          { skills: regex }
        ];
      }
    }

    // theo level
    if (req.query.level) {
      find.level = req.query.level
    }

    // theo workingForm
    if (req.query.workingForm) {
      find.workingForm = req.query.workingForm
    }

    // phân trang
    let limit = 6;
    let page = 1;
    totalRecord = await Job.countDocuments(find);
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
  })
}