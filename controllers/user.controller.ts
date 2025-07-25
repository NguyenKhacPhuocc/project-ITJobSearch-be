import { Request, Response } from "express";
import AccountUser from "../models/account-user.model";
import bcrypt from "bcryptjs";
import jwt  from "jsonwebtoken";

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

export const loginPost = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const existingUser = await AccountUser.findOne({
    email: email
  });

  if (!existingUser) {
    res.json({
      code: "error",
      message: "Email không tồn tại!"
    });
    return;
  }

  // so sánh mật khẩu người dùng nhập vào với mật khẩu đã mã hóa trong cơ sở dữ liệu
  const isPasswordValid = await bcrypt.compare(password, `${existingUser.password}`);
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
      id: existingUser.id,
      email: existingUser.email
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