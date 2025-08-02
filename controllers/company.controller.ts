import { Request, Response } from "express";
import AccountCompany from "../models/account-company.model";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AccountRequest } from "../interfaces/request.interface";

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