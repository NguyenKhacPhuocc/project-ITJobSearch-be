import { Router } from "express";
import * as authController from "../controllers/auth.controller";

const router = Router();

router.get('/check-login', authController.checkLogin);
router.get('/logout', authController.logout);
router.get('/verify', authController.verify);

export default router;