"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const jobController = __importStar(require("../controllers/job.controller"));
const multer_1 = __importDefault(require("multer"));
const cloudinary_helper_1 = require("../helpers/cloudinary.helper");
const jobValidate = __importStar(require("../validates/job.validate"));
const router = (0, express_1.Router)();
// cấu hình Multer để validate ngay từ đầu: reject file ngay từ đầu nếu không đúng yêu cầu, trước khi chúng được upload lên Cloudinary.
const upload = (0, multer_1.default)({
    storage: cloudinary_helper_1.storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype !== 'application/pdf') {
            return cb(new Error('cv_pdf_only'));
        }
        cb(null, true);
    },
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    }
});
router.get('/detail/:slug', jobController.detailJob);
router.post('/apply', upload.single('fileCV'), jobValidate.applyCV, jobController.applyCV);
router.get('/total-job', jobController.getTotalJob);
router.get('/job-by-city/:slug', jobController.getJobByCity);
router.get('/job-by-city/total-pages/:slug', jobController.getTotalPageJobByCity);
router.get('/job-by-expertise/:slug', jobController.getJobByExpertise);
router.get('/job-by-expertise/total-pages/:slug', jobController.getTotalPageJobByExpertise);
router.get('/job-by-skill/:slug', jobController.getJobBySkill);
router.get('/job-by-skill/total-pages/:slug', jobController.getTotalPageJobBySkill);
exports.default = router;
