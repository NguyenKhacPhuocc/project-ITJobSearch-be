import { Router } from "express";
import userRoutes from "./user.route";
import authRoutes from "./auth.route";
import companyRouter from "./company.route";
import cityRouter from "./city.route";
import uploadRouter from "./upload.route";


const router = Router();

router.use('/user', userRoutes);
router.use('/auth', authRoutes);
router.use('/company', companyRouter);
router.use('/city', cityRouter)
router.use('/upload', uploadRouter)

export default router;