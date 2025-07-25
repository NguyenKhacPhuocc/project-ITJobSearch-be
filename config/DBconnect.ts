import mongoose = require('mongoose');

export const connectDB = async () => {
  try {
    await mongoose.connect(`${process.env.DATABASE}`);
    console.log("kết nối DB thành công! ehehehe");
  } catch (error) {
    console.log("kết nối DB thất bại!", error);
  }
};