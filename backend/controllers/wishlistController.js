import userModel from "../models/userModel.js";
import productModel from "../models/productModel.js";

// Add product to wishlist
export const addToWishlistController = async (req, res) => {
  try {
    const { pid } = req.params;
    const userId = req.user._id;

    // Check if product exists
    const product = await productModel.findById(pid);
    if (!product) {
      return res.status(404).send({
        success: false,
        message: "Product not found",
      });
    }

    // Find user and update wishlist
    const user = await userModel.findById(userId);

    // Check if product already in wishlist
    if (user.wishlist && user.wishlist.includes(pid)) {
      return res.status(400).send({
        success: false,
        message: "Product already in wishlist",
      });
    }

    // Add to wishlist
    await userModel.findByIdAndUpdate(
      userId,
      { $addToSet: { wishlist: pid } },
      { new: true }
    );

    res.status(200).send({
      success: true,
      message: "Product added to wishlist",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error adding to wishlist",
      error: error.message,
    });
  }
};

// Remove product from wishlist
export const removeFromWishlistController = async (req, res) => {
  try {
    const { pid } = req.params;
    const userId = req.user._id;

    await userModel.findByIdAndUpdate(
      userId,
      { $pull: { wishlist: pid } },
      { new: true }
    );

    res.status(200).send({
      success: true,
      message: "Product removed from wishlist",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error removing from wishlist",
      error: error.message,
    });
  }
};

// Get user wishlist
export const getWishlistController = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await userModel.findById(userId).populate({
      path: "wishlist",
      select: "-photo",
      populate: { path: "category", select: "name" },
    });

    res.status(200).send({
      success: true,
      wishlist: user.wishlist || [],
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error fetching wishlist",
      error: error.message,
    });
  }
};

// Get wishlist count
export const getWishlistCountController = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await userModel.findById(userId);
    const count = user.wishlist ? user.wishlist.length : 0;

    res.status(200).send({
      success: true,
      count,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error fetching wishlist count",
      error: error.message,
    });
  }
};
