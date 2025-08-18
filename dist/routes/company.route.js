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
const companyController = __importStar(require("../controllers/company.controller"));
const companyValidate = __importStar(require("../validates/company.validate"));
const multer_1 = __importDefault(require("multer"));
const authMiddleware = __importStar(require("../middlewares/auth.middleware"));
const cloudinary_helper_1 = require("../helpers/cloudinary.helper");
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({ storage: cloudinary_helper_1.storage });
router.post('/register', companyValidate.registerPost, companyController.registerPost);
router.post('/login', companyController.loginPost);
router.patch('/profile', authMiddleware.verifyTokenCompany, upload.single("logo"), companyValidate.updateProfile, companyController.profilePatch);
router.post('/job/create', authMiddleware.verifyTokenCompany, upload.array('images', 8), companyValidate.createJob, companyController.createJobPost);
router.get('/job/list', authMiddleware.verifyTokenCompany, companyController.getJobList);
router.get('/job/total-pages', authMiddleware.verifyTokenCompany, companyController.getTotalPageJobList);
router.get('/job/edit/:slug', authMiddleware.verifyTokenCompany, companyController.getJobEdit);
router.patch('/job/edit/:slug', authMiddleware.verifyTokenCompany, upload.array('images', 8), companyValidate.createJob, companyController.JobEditPatch);
router.delete('/job/delete/:id', authMiddleware.verifyTokenCompany, companyController.jobDelete);
router.get('/api/list', companyController.list);
router.get('/list', companyController.getCompanyList);
router.get('/list/total-page', companyController.getTotalPageCompanyList);
router.get('/detail/:slug', companyController.getDetailedCompany);
router.get('/:slug/jobs', companyController.getJobsInCompany);
router.get('/cv/list', authMiddleware.verifyTokenCompany, companyController.getCVList);
router.get('/cv/total-page', authMiddleware.verifyTokenCompany, companyController.getTotalPageCVList);
router.get('/cv/detail/:id', authMiddleware.verifyTokenCompany, companyController.getDetailedCV);
router.patch('/cv/change-status', authMiddleware.verifyTokenCompany, companyController.changeStatusCVPatch);
router.delete('/cv/delete/:id', authMiddleware.verifyTokenCompany, companyController.deleteCv);
exports.default = router;
