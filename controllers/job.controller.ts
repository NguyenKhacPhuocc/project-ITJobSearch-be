import { Request, Response } from "express";
import Job from "../models/job.model";
import AccountCompany from "../models/account-company.model";
import CV from "../models/cv.model";
import City from "../models/city.model";
import { expertises, skills } from "../config/variable";
import AccountUser from "../models/account-user.model";
import jwt from "jsonwebtoken";
import { AccountRequest } from "../interfaces/request.interface";


export const detailJob = async (req: Request, res: Response) => {
  try {
    const slug = req.params.slug
    const job = await Job.findOne({
      slug: slug
    })
    if (!job) {
      res.json({
        code: "error",
        detailedJob: []
      })
      return;
    }
    const company = await AccountCompany.findOne({
      _id: job.companyId
    })
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
        companyName: company?.companyName || "",
        logo: company?.logo || "",
        slug: company?.slug || "",
        address: company?.address || "",
        companyModel: company?.companyModel || "",
        companyEmployees: company?.companyEmployees || "",
        workingTime: company?.workingTime || "",
        workOvertime: company?.workOvertime || "",
      }
    };

    res.json({
      code: "success",
      detailedJob: detailedJob
    })
  } catch (error) {
    console.log(error)
    res.json({
      code: "error"
    })
  }
}

export const clickJob = async (req: AccountRequest, res: Response) => {
  const token = req.cookies["token"];
  if (token) {
    const slug = req.params.slug
    const job = await Job.findOne({
      slug: slug
    })
    if (job) {
      const company = await AccountCompany.findOne({
        _id: job.companyId
      })
      const decoded = jwt.verify(token, `${process.env.JWT_SECRET}`) as jwt.JwtPayload; // Giải mã token
      const { id, email } = decoded;


      // lưu vị trí gần đây
      await AccountUser.findByIdAndUpdate(id, {
        $pull: { preferredLocations: company?.city } // xoá trước nếu đã tồn tại đảm bảo chỉ lưu những id khác nhau vào recentClick
      });

      await AccountUser.findByIdAndUpdate(id, {
        $push: {
          preferredLocations: {
            $each: [company?.city], // thêm mới
            $position: 0,         // thêm vào đầu mảng (mới nhất trước)
            $slice: 5            // giữ lại 5 phần tử
          }
        }
      });

      // lưu cách lượt click gần đây 
      await AccountUser.findByIdAndUpdate(id, {
        $pull: { recentClicks: job.id } // xoá trước nếu đã tồn tại đảm bảo chỉ lưu những id khác nhau vào recentClick
      });

      await AccountUser.findByIdAndUpdate(id, {
        $push: {
          recentClicks: {
            $each: [job.id], // thêm mới
            $position: 0,         // thêm vào đầu mảng (mới nhất trước)
            $slice: 5            // giữ lại 5 phần tử
          }
        }
      });
    }
  }
}

export const applyCV = async (req: Request, res: Response) => {
  req.body.fileCV = req.file?.path || "";

  const newRecord = new CV(req.body)
  await newRecord.save();

  res.json({
    code: "success",
    message: "apply_success"
  })
}

export const getTotalJob = async (req: Request, res: Response) => {

  const totalJob = await Job.countDocuments({})

  res.json({
    code: "success",
    totalJob: totalJob
  })
}

export const getJobByCity = async (req: Request, res: Response) => {
  const slug = req.params.slug;
  const find: any = {}
  const dataFinal = []

  const city = await City.findOne({
    slug: slug
  })
  if (!city) {
    return res.json({
      code: "error",
      message: "Thành phố không hợp lệ!",
    })
  }
  const companies = await AccountCompany.find({
    city: city.id,
  })
  const companyIds = companies.map(item => item.id)

  if (companyIds.length === 0) {
    return res.json({
      code: "success",
      jobs: []
    })
  }

  find.companyId = { $in: companyIds };

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

  res.json({
    code: "success",
    jobs: dataFinal,
  })
}

export const getTotalPageJobByCity = async (req: Request, res: Response) => {
  const slug = req.params.slug;
  const find: any = {}
  let totalPage = 0;
  let totalRecord = 0;

  const city = await City.findOne({
    slug: slug
  })
  if (!city) {
    return res.json({
      code: "error",
      message: "Thành phố không hợp lệ!",
    })
  }
  const companies = await AccountCompany.find({
    city: city.id,
  })
  const companyIds = companies.map(item => item.id)
  if (companyIds.length === 0) {
    return res.json({
      code: "success",
      totalRecord: totalRecord,
      totalPage: totalPage,
    })
  }

  find.companyId = { $in: companyIds };

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

  res.json({
    code: "success",
    totalRecord: totalRecord,
    totalPage: totalPage,
  })
}

type Locale = 'vi' | 'en';
export const getJobByExpertise = async (req: Request, res: Response) => {
  const locale = req.query.locale as Locale;
  const slug = req.params.slug;
  const find: any = {}
  const dataFinal: any = []
  const expertise = expertises.find(e => e.slug[locale] === slug);

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

  res.json({
    code: "success",
    jobs: dataFinal,
  })
}

export const getTotalPageJobByExpertise = async (req: Request, res: Response) => {
  const locale = req.query.locale as Locale;
  const slug = req.params.slug;
  const find: any = {}
  let totalPage = 0;
  let totalRecord = 0;

  const expertise = expertises.find(e => e.slug[locale] === slug);

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

  res.json({
    code: "success",
    totalRecord: totalRecord,
    totalPage: totalPage,
  })
}

export const getJobBySkill = async (req: Request, res: Response) => {
  const slug = req.params.slug;
  const find: any = {}
  const dataFinal: any = []
  const skill = skills.find(e => e.slug === slug);

  if (!skill) {
    return res.status(400).json({
      code: "error",
      message: "Kĩ năng không hợp lệ!"
    });
  }

  find.skills = { $regex: new RegExp(`^${skill.name}$`, "i") };

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

  res.json({
    code: "success",
    jobs: dataFinal,
  })
}

export const getTotalPageJobBySkill = async (req: Request, res: Response) => {
  const slug = req.params.slug;
  const find: any = {}
  let totalPage = 0;
  let totalRecord = 0;

  const skill = skills.find(e => e.slug === slug);

  if (!skill) {
    return res.status(400).json({
      code: "error",
      message: "Kĩ năng không hợp lệ!"
    });
  }

  find.skills = { $regex: new RegExp(`^${skill.name}$`, "i") };

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

  res.json({
    code: "success",
    totalRecord: totalRecord,
    totalPage: totalPage,
  })
}