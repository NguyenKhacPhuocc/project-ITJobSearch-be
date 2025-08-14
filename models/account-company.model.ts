import mongoose from "mongoose";
const slug = require('mongoose-slug-updater')
mongoose.plugin(slug)

const schema = new mongoose.Schema(
  {
    companyName: String,
    email: String,
    password: String,
    city: String,
    address: String,
    companyModel: String,
    companyEmployees: String,
    workingTime: String,
    workOvertime: String,
    description: String,
    logo: String,
    phone: String,
    slug: {
      type: String,
      slug: "companyName",
      unique: true
    },
  },
  {
    timestamps: true, // Tự động sinh ra trường createdAt và updatedAt
  }
);

const AccountCompany = mongoose.model('AccountCompany', schema, "accounts-company");

export default AccountCompany;
