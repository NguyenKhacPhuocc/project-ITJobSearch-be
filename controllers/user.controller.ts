import { Request, Response } from "express";
import AccountUser from "../models/account-user.model";
import bcrypt from "bcryptjs";

export const registerPost = async (req: Request, res: Response) => {
  const { fullName, email, password } = req.body;

  const existingUser = await AccountUser.findOne({
    email: email
  });

  if (existingUser) {
    res.json({
      code: "error",
      message: "Email đã được sử dụng!"
    });
    return;
  }

  // mã hóa mật khẩu với bcrypt
  const salt = await bcrypt.genSalt(10); // tạo ra chuỗi ngẫu nhiên có 10 kí tự
  const hashPassword = await bcrypt.hash(password, salt);

  const newUser = new AccountUser({
    fullName: fullName,
    email: email,
    password: hashPassword
  });

  await newUser.save();

  res.json({
    code: "success",
    message: "Đăng ký thành công"
  })
}