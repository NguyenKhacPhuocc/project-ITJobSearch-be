import { Router } from "express";
import * as companyController from "../controllers/company.controller";
import * as companyValidate from "../validates/company.validate"
import multer from "multer";
import * as authMiddleware from "../middlewares/auth.middleware";
import { storage } from "../helpers/cloudinary.helper";

const router = Router();

const upload = multer({ storage: storage })

router.post('/register',
  companyValidate.registerPost, companyController.registerPost
);

router.post('/login', companyController.loginPost)

router.patch('/profile',
  authMiddleware.verifyTokenCompany,
  upload.single("logo"),
  companyValidate.updateProfile,
  companyController.profilePatch
)

router.post('/job/create',
  authMiddleware.verifyTokenCompany,
  upload.array('images', 8),
  companyValidate.createJob,
  companyController.createJobPost
)

router.get('/job/list',
  authMiddleware.verifyTokenCompany,
  companyController.getJobList
)

router.get('/job/total-pages',
  authMiddleware.verifyTokenCompany,
  companyController.getTotalPageJobList
)

router.get('/job/edit/:id',
  authMiddleware.verifyTokenCompany,
  companyController.getJobEdit
)

router.patch('/job/edit/:id',
  authMiddleware.verifyTokenCompany,
  upload.array('images', 8),
  companyValidate.createJob,
  companyController.JobEditPatch
)


router.delete('/job/delete/:id',
  authMiddleware.verifyTokenCompany,
  companyController.jobDelete
)
router.get('/api/list', companyController.list);

router.get('/list', companyController.getCompanyList)
router.get('/list/total-page',companyController.getTotalPageCompanyList)

export default router;