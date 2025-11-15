import express from "express";
import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js";
import {
  getOverviewController,
  getDailySalesController,
  getMonthlySalesController,
  getTopProductsController,
} from "../controllers/analyticsController.js";

const router = express.Router();

// Get overview analytics
router.get("/overview", requireSignIn, isAdmin, getOverviewController);

// Get daily sales
router.get("/daily-sales", requireSignIn, isAdmin, getDailySalesController);

// Get monthly sales
router.get("/monthly-sales", requireSignIn, isAdmin, getMonthlySalesController);

// Get top products
router.get("/top-products", requireSignIn, isAdmin, getTopProductsController);

export default router;
