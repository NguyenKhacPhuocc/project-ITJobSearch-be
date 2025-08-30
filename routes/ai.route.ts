import { Router } from "express";
import * as AIController from "../controllers/ai.controller";

const router = Router();

router.post('/recommend-jobs', AIController.recommendedJobList);


export default router;