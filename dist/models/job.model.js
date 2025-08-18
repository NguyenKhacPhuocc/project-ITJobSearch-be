"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const slug = require('mongoose-slug-updater');
mongoose_1.default.plugin(slug);
const schema = new mongoose_1.default.Schema({
    companyId: String,
    title: String,
    salaryMin: Number,
    salaryMax: Number,
    level: String,
    workingForm: String,
    skills: Array,
    expertise: String,
    description: String,
    images: Array,
    slug: {
        type: String,
        slug: "title",
        unique: true
    },
}, {
    timestamps: true // auto generate createdAt field and updateAt field
});
const Job = mongoose_1.default.model('Job', schema, "jobs");
exports.default = Job;
