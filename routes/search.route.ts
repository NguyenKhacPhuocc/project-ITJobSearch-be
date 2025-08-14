import { Router } from "express";
import * as searchController from "../controllers/search.controller";

const router = Router();

router.get('/', searchController.search);

router.get('/total-pages', searchController.searchTotalPages);

export default router;