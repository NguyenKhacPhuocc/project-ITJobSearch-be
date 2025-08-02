import { Router } from "express";
import * as cityController from "../controllers/city.controller";

const router = Router();

router.get('/api/list', cityController.list);


export default router;