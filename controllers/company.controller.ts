import { Request, Response } from "express";
import AccountCompany from "../models/account-company.model";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AccountRequest } from "../interfaces/request.interface";
import Job from "../models/job.model";
import { title } from "process";
import City from "../models/city.model";
import CV from "../models/cv.model";

export const registerPost = async (req: Request, res: Response) => {
  const { companyName, email, password } = req.body;

  const existingCompany = await AccountCompany.findOne({
    email: email
  });

  if (existingCompany) {
    res.json({
      code: "error",
      message: "Email đã được sử dụng!"
    });
    return;
  }

  // mã hóa mật khẩu với bcrypt
  const salt = await bcrypt.genSalt(10); // tạo ra chuỗi ngẫu nhiên có 10 kí tự
  const hashPassword = await bcrypt.hash(password, salt);

  const newAccountCompany = new AccountCompany({
    companyName: companyName,
    email: email,
    password: hashPassword
  });

  await newAccountCompany.save();

  res.json({
    code: "success",
    message: "Đăng ký thành công"
  })
}

export const loginPost = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const existingCompany = await AccountCompany.findOne({
    email: email
  });

  if (!existingCompany) {
    res.json({
      code: "error",
      message: "Email không tồn tại! ??"
    });
    return;
  }

  // so sánh mật khẩu người dùng nhập vào với mật khẩu đã mã hóa trong cơ sở dữ liệu
  const isPasswordValid = await bcrypt.compare(password, `${existingCompany.password}`);
  if (!isPasswordValid) {
    res.json({
      code: "error",
      message: "Mật khẩu không đúng!"
    })
    return;
  }

  // tạo token JWT
  const token = jwt.sign(
    {
      id: existingCompany.id,
      email: existingCompany.email
    },
    `${process.env.JWT_SECRET}`, // mã bí mật để mã hóa token
    {
      expiresIn: "1d" // token có hiệu lực trong 1 ngày
    }
  )

  // lưu token vào cookie
  res.cookie("token", token, {
    maxAge: (24 * 60 * 60 * 1000), // token có hiệu lực trong vòng 30 hoac 1 ngày
    httpOnly: true,
    secure: process.env.NODE_ENV === "production" ? true : false, // chỉ gửi cookie qua https trong môi trường sản xuất
    sameSite: "lax" // Cho phép gửi cookie giữa các domain khác nhau
  })


  res.json({
    code: "success",
    message: "Đăng nhập thành công!"
  })
}

export const profilePatch = async (req: AccountRequest, res: Response) => {
  if (req.file) {
    // Trường hợp có file => cập nhật ảnh mới
    req.body.logo = req.file.path;
  } else if (typeof req.body.logo === "string" && req.body.logo === "") {
    // Trường hợp chuỗi rỗng => xóa ảnh
    req.body.logo = "";
  } else {
    // Không có gì gửi => không cập nhật avatar
    delete req.body.logo;
  }

  await AccountCompany.updateOne({
    _id: req.account.id
  }, req.body)

  res.json({
    code: "success",
    message: "Cập nhật thành công",
  })
}

export const createJobPost = async (req: AccountRequest, res: Response) => {
  req.body.companyId = req.account.id;
  req.body.salaryMin = req.body.salaryMin ? parseInt(req.body.salaryMin) : 0;
  req.body.salaryMax = req.body.salaryMax ? parseInt(req.body.salaryMax) : 0;
  req.body.skills = req.body.skills ? req.body.skills.split(', ') : [];
  req.body.images = [];

  // Xử lý mảng images
  if (req.files) {
    for (const file of req.files as any[]) {
      req.body.images.push(file.path);
    }
  }

  const newJob = new Job(req.body);
  await newJob.save();

  res.json({
    code: "success",
    message: "Cập nhật thành công",
  })
}

// Xác định rõ kiểu Locale
type Locale = 'vi' | 'en';
export const getJobList = async (req: AccountRequest, res: Response) => {
  // Chỉ lấy 'vi' hoặc 'en', nếu không thì mặc định là 'en'
  const rawLocale = req.headers['accept-language'];
  const locale: Locale = rawLocale === 'vi' ? 'vi' : 'en';

  const find = {
    companyId: req.account.id
  };

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

  const jobList = await Job
    .find(find)
    .sort({
      createdAt: "desc"
    })
    .skip((page - 1) * limit)
    .limit(limit);

  const dataFinal = [];

  const city = await City.findOne({
    _id: req.account.city
  });

  for (const item of jobList) {
    dataFinal.push({
      id: item.id,
      companyLogo: req.account.logo,
      title: item.title,
      companyName: req.account.companyName,
      salaryMin: item.salaryMin,
      salaryMax: item.salaryMax,
      level: item.level,
      workingForm: item.workingForm,
      companyCity: city?.name?.[locale] ?? city?.name?.['en'] ?? '',
      skills: item.skills,
      expertise: item.expertise,
    })
  }

  res.json({
    code: "success",
    jobList: dataFinal,
  })
}

export const getTotalPageJobList = async (req: AccountRequest, res: Response) => {
  const find = {
    companyId: req.account.id
  };

  // phân trang
  let limit = 3;
  let page = 1;
  const totalRecord = await Job.countDocuments(find);
  const totalPage = Math.ceil(totalRecord / limit);
  if (page > totalPage && totalPage != 0) {
    page = totalPage;
  }
  // phân trang end

  res.json({
    code: "success",
    totalPage: totalPage,
  })
}

export const getJobEdit = async (req: AccountRequest, res: Response) => {
  try {
    const slug = req.params.slug;

    const jobDetail = await Job.findOne({
      slug: slug,
      companyId: req.account.id
    })

    if (!jobDetail) {
      res.json({
        code: "error",
        message: "Id không hợp lệ"
      })
      return;
    }

    res.json({
      code: "success",
      jobDetail: jobDetail,
    })
  } catch (error) {
    console.log(error)
    res.json({
      code: "error",
      message: "Id không hợp lệ"
    })
  }
}

export const JobEditPatch = async (req: AccountRequest, res: Response) => {
  try {
    const slug = req.params.slug;

    const jobDetail = await Job.findOne({
      slug: slug,
      companyId: req.account.id
    })

    if (!jobDetail) {
      res.json({
        code: "error",
        message: "Id không hợp lệ"
      })
      return;
    }

    req.body.companyId = req.account.id;
    req.body.salaryMin = req.body.salaryMin ? parseInt(req.body.salaryMin) : 0;
    req.body.salaryMax = req.body.salaryMax ? parseInt(req.body.salaryMax) : 0;
    req.body.skills = req.body.skills ? req.body.skills.split(', ') : [];
    req.body.images = [];

    // Xử lý mảng images
    if (req.files) {
      for (const file of req.files as any[]) {
        req.body.images.push(file.path);
      }
    }

    await Job.updateOne({
      slug: slug,
      companyId: req.account.id
    }, req.body)

    res.json({
      code: "success",
      message: "Cập nhật thành công!",
    })
  } catch (error) {
    console.log(error)
    res.json({
      code: "error",
      message: "Id không hợp lệ"
    })
  }
}

export const jobDelete = async (req: AccountRequest, res: Response) => {
  try {
    const id = req.params.id;

    const jobDetail = await Job.findOne({
      _id: id,
      companyId: req.account.id
    })

    if (!jobDetail) {
      res.json({
        code: "error",
        message: "Id không hợp lệ"
      })
      return;
    }

    await Job.deleteOne({
      _id: id,
      companyId: req.account.id,
    })

    res.json({
      code: "success",
      message: "Đã xóa công việc!",
    })
  } catch (error) {
    console.log(error)
    res.json({
      code: "error",
      message: "Id không hợp lệ"
    })
  }
}

export const list = async (req: Request, res: Response) => {
  const companyList = await AccountCompany
    .find({})

  const copanyDataFinal = [];

  for (const item of companyList) {
    copanyDataFinal.push({
      id: item.id,
      logo: item.logo,
      companyName: item.companyName,
      slug: item.slug
    })
  }

  res.json({
    code: "success",
    companies: copanyDataFinal
  })
}

export const getCompanyList = async (req: Request, res: Response) => {
  let limit = 9;
  let page = 1;
  if (req.query.page) {
    const currentPage = parseInt(`${req.query.page}`);
    if (currentPage > 0) {
      page = currentPage;
    }
  }

  const companyList = await AccountCompany
    .find({})
    .skip((page - 1) * limit)
    .limit(limit);

  const copanyDataFinal = [];

  for (const item of companyList) {
    const city = await City.findOne({
      _id: item.city
    });

    const totalJobInCompany = await Job.countDocuments({
      companyId: item.id,
    })

    copanyDataFinal.push({
      id: item.id,
      logo: item.logo,
      companyName: item.companyName,
      cityName: city?.name,
      totalJob: totalJobInCompany ? totalJobInCompany : 0,
      slug: item.slug
    })
  }

  res.json({
    code: "success",
    companyList: copanyDataFinal
  })
}

export const getTotalPageCompanyList = async (req: Request, res: Response) => {

  // phân trang
  let limit = 9;
  let page = 1;
  const totalRecord = await AccountCompany.countDocuments({});
  const totalPage = Math.ceil(totalRecord / limit);
  if (page > totalPage && totalPage != 0) {
    page = totalPage;
  }
  // phân trang end

  res.json({
    code: "success",
    totalPage: totalPage,
  })
}

export const getDetailedCompany = async (req: Request, res: Response) => {
  try {
    const slug = req.params.slug
    const company = await AccountCompany.findOne({
      slug: slug
    })
    if (!company) {
      res.json({
        code: "error",
        detailedCompany: {}
      })
      return;
    }
    const detailedCompany = {
      id: company.id,
      logo: company.logo,
      companyName: company.companyName,
      address: company.address,
      companyModel: company.companyModel,
      companyEmployees: company.companyEmployees,
      workingTime: company.workingTime,
      workOvertime: company.workOvertime,
      description: company.description,
    };

    res.json({
      code: "success",
      detailedCompany: detailedCompany
    })
  } catch (error) {
    console.log(error)
    res.json({
      code: "error"
    })
  }
}

export const getJobsInCompany = async (req: Request, res: Response) => {
  try {
    const slug = req.params.slug
    const company = await AccountCompany.findOne({
      slug: slug
    })
    if (!company) {
      res.json({
        code: "error",
        jobs: []
      })
      return;
    }
    const jobs = await Job.find({
      companyId: company.id
    })
    const dataFinal = [];

    const city = await City.findOne({
      _id: company.city
    });

    for (const item of jobs) {
      dataFinal.push({
        id: item.id,
        slug: item.slug,
        companyLogo: company.logo,
        title: item.title,
        companyName: company.companyName,
        salaryMin: item.salaryMin,
        salaryMax: item.salaryMax,
        level: item.level,
        workingForm: item.workingForm,
        companyCity: city?.name || { vi: "", en: "" },
        skills: item.skills,
        expertise: item.expertise,
      })
    }
    res.json({
      code: "success",
      jobs: dataFinal
    })
  } catch (error) {
    console.log(error)
    res.json({
      code: "error"
    })
  }
}

export const getCVList = async (req: AccountRequest, res: Response) => {
  const companyId = req.account.id;

  const JobsInCompany = await Job.find({
    companyId: companyId
  })

  const JobIdList = JobsInCompany.map(item => item.id);

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

  const cvList = await CV
    .find({
      jobId: { $in: JobIdList }
    })
    .skip((page - 1) * limit)
    .limit(limit);

  const dataFinal = [];

  for (const item of cvList) {
    const job = await Job.findOne({
      _id: item.jobId
    })

    const dataItemFinal = {
      id: item.id,
      jobName: job?.title || "",
      fullName: item.fullName,
      phone: item.phone,
      email: item.email,
      jobSalaryMin: job?.salaryMin || 0,
      jobSalaryMax: job?.salaryMax || 0,
      jobLevel: job?.level || "",
      jobWorkingForm: job?.workingForm || "",
      viewed: item.viewed,
      status: item.status,
    }

    dataFinal.push(dataItemFinal)
  }
  res.json({
    code: "success",
    cvList: dataFinal
  })
}

export const getTotalPageCVList = async (req: AccountRequest, res: Response) => {
  const companyId = req.account.id;

  const JobsInCompany = await Job.find({
    companyId: companyId
  })

  const JobIdList = JobsInCompany.map(item => item.id);

  // phân trang
  let limit = 3;
  let page = 1;
  if (req.query.page) {
    const currentPage = parseInt(`${req.query.page}`);
    if (currentPage > 0) {
      page = currentPage;
    }
  }
  const totalRecord = await CV.countDocuments({
    jobId: { $in: JobIdList }
  });
  const totalPage = Math.ceil(totalRecord / limit);
  if (page > totalPage && totalPage != 0) {
    page = totalPage;
  }
  // phân trang end

  res.json({
    code: "success",
    totalPage: totalPage
  })
}

export const getDetailedCV = async (req: AccountRequest, res: Response) => {
  try {
    const idCV = req.params.id
    const companyId = req.account.id;
    const detailedCV = await CV.findOne({
      _id: idCV,
    }).select("fullName email phone fileCV")

    if (!detailedCV) {
      res.json({
        code: "error",
        message: "Id không hợp lệ!"
      })
      return
    }

    const jobInfo = await Job.findOne({
      id: detailedCV.jobId,
      companyId: companyId
    }).select("title salaryMin salaryMax level workingForm skills slug")

    if (!jobInfo) {
      res.json({
        code: "error",
        message: "Không có quyền truy cập!"
      })
      return
    }

    // cập nhật lại trang thái đã xem cv
    await CV.updateOne({
      _id: idCV
    }, {
      viewed: true
    })

    res.json({
      code: "success",
      detailedCV: detailedCV,
      jobInfo: jobInfo
    })
  } catch (error) {
    console.log(error)
    res.json({
      code: "error",
    })
  }
}