import mongoose from "mongoose";

const schema = new mongoose.Schema({
  companyId: String,
  title: String,
  salaryMin: Number,
  salaryMax: Number,
  level: String,
  workingForm: String,
  skills: Array,
  expertise: String,
  description: String,
  images: Array
},
  {
    timestamps: true // auto generate createdAt field and updateAt field
  });

const Job = mongoose.model('Job', schema, "jobs");

export default Job