import { Router } from "express";
import * as AIController from "../controllers/ai.controller";

const router = Router();

router.get('/recommend-jobs', AIController.recommendedJobList);


export default router;