import { Router } from "express";
import userRoutes from "./user.route";
import authRoutes from "./auth.route";
import companyRouter from "./company.route";
import cityRouter from "./city.route";
import uploadRouter from "./upload.route";
import searchRouter from "./search.route";
import jobRouter from "./job.route";
import aiRouter from "./ai.route";


const router = Router();

router.use('/user', userRoutes);
router.use('/auth', authRoutes);
router.use('/company', companyRouter);
router.use('/city', cityRouter)
router.use('/upload', uploadRouter)
router.use('/search', searchRouter)
router.use('/job', jobRouter)
router.use('/ai', aiRouter)

export default router;