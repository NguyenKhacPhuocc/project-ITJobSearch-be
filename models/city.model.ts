import mongoose from "mongoose";

const schema = new mongoose.Schema({
  name: {
    vi: String,
    en: String
  },
},
  {
    timestamps: true // auto generate createdAt field and updateAt field
  });

const City = mongoose.model('City', schema, "cities"); // tạo model City từ Tour

export default City