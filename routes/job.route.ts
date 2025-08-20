import { Router } from "express";
import * as jobController from "../controllers/job.controller";
import multer from "multer";
import { storage } from "../helpers/cloudinary.helper";
import * as jobValidate from "../validates/job.validate"


const router = Router();

// cấu hình Multer để validate ngay từ đầu: reject file ngay từ đầu nếu không đúng yêu cầu, trước khi chúng được upload lên Cloudinary.
const upload = multer({
  storage: storage,
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

router.post(
  '/apply',
  upload.single('fileCV'),
  jobValidate.applyCV,
  jobController.applyCV
);

router.get('/total-job', jobController.getTotalJob)

router.get('/job-by-city/:slug', jobController.getJobByCity)
router.get('/job-by-city/total-pages/:slug', jobController.getTotalPageJobByCity)

router.get('/job-by-expertise/:slug', jobController.getJobByExpertise)
router.get('/job-by-expertise/total-pages/:slug', jobController.getTotalPageJobByExpertise)

router.get('/job-by-skill/:slug', jobController.getJobBySkill)
router.get('/job-by-skill/total-pages/:slug', jobController.getTotalPageJobBySkill)

export default router;