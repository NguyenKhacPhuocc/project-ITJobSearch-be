import { Router } from "express";
import * as authController from "../controllers/auth.controller";

const router = Router();

router.get('/check-login', authController.checkLogin);

export default router;