import { Request, Response } from "express";
import AccountUser from "../models/account-user.model";
import jwt from "jsonwebtoken";
import AccountCompany from "../models/account-company.model";

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

export const verify = async (req: Request, res: Response) => {
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

    // 3. Kiểm tra trong cả 2 bảng User và Company
    const [user, company] = await Promise.all([
      AccountUser.findOne({ _id: id, email: email }),
      AccountCompany.findOne({ _id: id, email: email })
    ]);

    // 4. Trả về thông tin tương ứng
    if (user) {
      return res.json({
        code: "success",
        info: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          avatar: user.avatar,
          phone: user.phone,
          role: "user"
        }
      });
    }

    if (company) {
      return res.json({
        code: "success",
        info: {
          id: company.id,
          companyName: company.companyName,
          email: company.email,
          city: company.city,
          address: company.address,
          companyModel: company.companyModel,
          companyEmployees: company.companyEmployees,
          workingTime: company.workingTime,
          workOvertime: company.workOvertime,
          description: company.description,
          logo: company.logo,
          phone: company.phone,
          role: "company",
        }
      });
    }

    // 5. Nếu không tìm thấy ở cả 2 bảng
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
    });
    return res.status(401).json({
      code: "error",
      message: "Token không hợp lệ"
    });

  } catch (error) {
    console.error("Lỗi xác thực token:", error);
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
};