import { Request, Response } from "express";
import AccountUser from "../models/account-user.model";
import jwt from "jsonwebtoken";

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

    const existingUser = await AccountUser.findOne({
      _id: id,
      email: email
    });

    if (!existingUser) {
      res.clearCookie("token");
      res.json({
        code: "error",
        message: "Token không hợp lệ"
      });
      return;
    }

    const infoUser = {
      id: existingUser.id,
      fullName: existingUser.fullName,
      email: existingUser.email
    };

    res.json({
      code: "success",
      message: "Token hợp lệ",
      infoUser: infoUser
    });
  } catch (error) {
    res.clearCookie("token");
    res.json({
      code: "error",
      message: "Token không hợp lệ"
    });
  }
}