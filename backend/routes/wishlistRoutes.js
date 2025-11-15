import express from "express";
import { requireSignIn } from "../middlewares/authMiddleware.js";
import {
  addToWishlistController,
  removeFromWishlistController,
  getWishlistController,
  getWishlistCountController,
} from "../controllers/wishlistController.js";

const router = express.Router();

// Add to wishlist
router.post("/add/:pid", requireSignIn, addToWishlistController);

// Remove from wishlist
router.delete("/remove/:pid", requireSignIn, removeFromWishlistController);

// Get wishlist
router.get("/get", requireSignIn, getWishlistController);

// Get wishlist count
router.get("/count", requireSignIn, getWishlistCountController);

export default router;
