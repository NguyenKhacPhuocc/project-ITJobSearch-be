import { Request, Response } from "express";


export const imagePost = async (req: Request, res: Response) => {
  res.json({
    location: req?.file?.path,
    // trả về đường dẫn của hình ảnh đã tải lên
    // liên quan đến tài liệu của tinyMCE
  })
}