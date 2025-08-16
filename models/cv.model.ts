import mongoose from "mongoose";

const schema = new mongoose.Schema({
  jobId: String,
  fullName: String,
  email: String,
  phone: String,
  fileCV: String,
  viewed: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    default: "initial"
  }
},
  {
    timestamps: true // auto generate createdAt field and updateAt field
  });

const CV = mongoose.model('CV', schema, "cvs"); // tạo model City từ Tour

export default CV