import { Router } from "express";
import userRoutes from "./user.route";
import authRoutes from "./auth.route";
import companyRouter from "./company.route";


const router = Router();

router.use('/user', userRoutes);
router.use('/auth', authRoutes);
router.use('/company', companyRouter);

export default router;