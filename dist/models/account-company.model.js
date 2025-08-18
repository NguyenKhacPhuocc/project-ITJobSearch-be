"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const slug = require('mongoose-slug-updater');
mongoose_1.default.plugin(slug);
const schema = new mongoose_1.default.Schema({
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
}, {
    timestamps: true, // Tự động sinh ra trường createdAt và updatedAt
});
const AccountCompany = mongoose_1.default.model('AccountCompany', schema, "accounts-company");
exports.default = AccountCompany;
