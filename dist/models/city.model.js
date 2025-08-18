"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const schema = new mongoose_1.default.Schema({
    name: {
        vi: String,
        en: String
    },
}, {
    timestamps: true // auto generate createdAt field and updateAt field
});
const City = mongoose_1.default.model('City', schema, "cities"); // tạo model City từ Tour
exports.default = City;
