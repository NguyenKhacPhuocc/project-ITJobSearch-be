import { Request, Response } from "express";
import City from "../models/city.model"


export const list = async (req: Request, res: Response) => {
  const cities = await City.find({});

  res.json({
    cities: cities,
  })
}