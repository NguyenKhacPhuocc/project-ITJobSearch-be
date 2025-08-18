import { Request, Response } from "express";
import AccountUser from "../models/account-user.model";
import jwt from "jsonwebtoken";
import AccountCompany from "../models/account-company.model";

export const checkLogin = async (req: Request, res: Response) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      res.json({
        code: "error",
        message: "Token không hợp lệ"
      });
      return;
    }

    // giải mã token
    const decoded = jwt.verify(token, `${process.env.JWT_SECRET}`) as jwt.JwtPayload; // giải mã token
    const { id, email } = decoded;

    // tìm tài khoản ứng viên
    const existingUser = await AccountUser.findOne({
      _id: id,
      email: email
    });
    if (existingUser) {
      const info = {
        id: existingUser.id,
        fullName: existingUser.fullName,
        email: existingUser.email,
        avatar: existingUser.avatar,
        phone: existingUser.phone,

        role: "user",
      };
      res.json({
        code: "success",
        message: "Token hợp lệ",
        info: info
      });
      return;
    }

    // tìm tài khoản company
    const existingCompany = await AccountCompany.findOne({
      _id: id,
      email: email
    });
    if (existingCompany) {
      const info = {
        id: existingCompany.id,
        companyName: existingCompany.companyName,
        email: existingCompany.email,
        city: existingCompany.city,
        address: existingCompany.address,
        companyModel: existingCompany.companyModel,
        companyEmployees: existingCompany.companyEmployees,
        workingTime: existingCompany.workingTime,
        workOvertime: existingCompany.workOvertime,
        description: existingCompany.description,
        logo: existingCompany.logo,
        phone: existingCompany.phone,
        role: "company",
      };
      res.json({
        code: "success",
        message: "Token hợp lệ",
        info: info
      });
      return;
    }

    if (!existingUser && !existingCompany) {
      res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
      });
      res.json({
        code: "error",
        message: "Token không hợp lệ"
      });
    }
  } catch (error) {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
    });
    res.json({
      code: "error",
      message: "Token không hợp lệ"
    });
  }
}


export const logout = (req: Request, res: Response) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
  });

  res.json({
    code: "success",
    message: "Đăng xuất thành công"
  });
};