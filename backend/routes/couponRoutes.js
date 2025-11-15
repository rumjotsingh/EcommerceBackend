import express from "express";
import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js";
import {
  createCouponController,
  getAllCouponsController,
  applyCouponController,
  deleteCouponController,
  updateCouponController,
  toggleCouponStatusController,
} from "../controllers/couponController.js";

const router = express.Router();

// Create coupon (Admin)
router.post("/create", requireSignIn, isAdmin, createCouponController);

// Get all coupons
router.get("/all", getAllCouponsController);

// Apply coupon (User)
router.post("/apply", requireSignIn, applyCouponController);

// Delete coupon (Admin)
router.delete("/delete/:id", requireSignIn, isAdmin, deleteCouponController);

// Update coupon (Admin)
router.put("/update/:id", requireSignIn, isAdmin, updateCouponController);

// Toggle coupon status (Admin)
router.put("/toggle/:id", requireSignIn, isAdmin, toggleCouponStatusController);

export default router;
