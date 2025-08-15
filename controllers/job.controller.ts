import { Request, Response } from "express";
import Job from "../models/job.model";
import AccountCompany from "../models/account-company.model";


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