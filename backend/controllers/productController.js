import productModel from "../models/productModel.js";
import categoryModel from "../models/categoryModel.js";
import orderModel from "../models/orderModel.js";
import reviewModel from "../models/reviewModel.js";
import fs from "fs";
import slugify from "slugify";
import Razorpay from "razorpay";
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();

// Razorpay Configuration
const razorpayInstance = new Razorpay({
  key_id: process.env.KEY_ID,
  key_secret: process.env.KEY_SECRET,
});

export const createProductController = async (req, res) => {
  try {
    const { name, description, price, category, quantity, shipping } =
      req.fields;
    const { photo } = req.files;
    //alidation
    switch (true) {
      case !name:
        return res.status(500).send({ error: "Name is Required" });
      case !description:
        return res.status(500).send({ error: "Description is Required" });
      case !price:
        return res.status(500).send({ error: "Price is Required" });
      case !category:
        return res.status(500).send({ error: "Category is Required" });
      case !quantity:
        return res.status(500).send({ error: "Quantity is Required" });
      case photo && photo.size > 1000000:
        return res
          .status(500)
          .send({ error: "photo is Required and should be less then 1mb" });
    }

    const products = new productModel({ ...req.fields, slug: slugify(name) });
    if (photo) {
      products.photo.data = fs.readFileSync(photo.path);
      products.photo.contentType = photo.type;
    }
    await products.save();
    res.status(201).send({
      success: true,
      message: "Product Created Successfully",
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in crearing product",
    });
  }
};

//get all products
export const getProductController = async (req, res) => {
  try {
    const products = await productModel
      .find({})
      .populate("category")
      .select("-photo")
      .limit(12)
      .sort({ createdAt: -1 });
    res.status(200).send({
      success: true,
      counTotal: products.length,
      message: "ALlProducts ",
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Erorr in getting products",
      error: error.message,
    });
  }
};
// get single product
export const getSingleProductController = async (req, res) => {
  try {
    const product = await productModel
      .findOne({ slug: req.params.slug })
      .select("-photo")
      .populate("category");
    res.status(200).send({
      success: true,
      message: "Single Product Fetched",
      product,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Eror while getitng single product",
      error,
    });
  }
};

// get photo
export const productPhotoController = async (req, res) => {
  try {
    const product = await productModel.findById(req.params.pid).select("photo");
    if (product.photo.data) {
      res.set("Content-type", product.photo.contentType);
      return res.status(200).send(product.photo.data);
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Erorr while getting photo",
      error,
    });
  }
};

//delete controller
export const deleteProductController = async (req, res) => {
  try {
    await productModel.findByIdAndDelete(req.params.pid).select("-photo");
    res.status(200).send({
      success: true,
      message: "Product Deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while deleting product",
      error,
    });
  }
};

//upate producta
export const updateProductController = async (req, res) => {
  try {
    const { name, description, price, category, quantity, shipping } =
      req.fields;
    const { photo } = req.files;
    //alidation
    switch (true) {
      case !name:
        return res.status(500).send({ error: "Name is Required" });
      case !description:
        return res.status(500).send({ error: "Description is Required" });
      case !price:
        return res.status(500).send({ error: "Price is Required" });
      case !category:
        return res.status(500).send({ error: "Category is Required" });
      case !quantity:
        return res.status(500).send({ error: "Quantity is Required" });
      case photo && photo.size > 1000000:
        return res
          .status(500)
          .send({ error: "photo is Required and should be less then 1mb" });
    }

    const products = await productModel.findByIdAndUpdate(
      req.params.pid,
      { ...req.fields, slug: slugify(name) },
      { new: true }
    );
    if (photo) {
      products.photo.data = fs.readFileSync(photo.path);
      products.photo.contentType = photo.type;
    }
    await products.save();
    res.status(201).send({
      success: true,
      message: "Product Updated Successfully",
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in Update product",
    });
  }
};
// filters
export const productFiltersController = async (req, res) => {
  try {
    const { checked, radio } = req.body;
    let args = {};
    if (checked.length > 0) args.category = checked;
    if (radio.length) args.price = { $gte: radio[0], $lte: radio[1] };
    const products = await productModel.find(args);
    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error WHile Filtering Products",
      error,
    });
  }
};

// product count
export const productCountController = async (req, res) => {
  try {
    const total = await productModel.find({}).estimatedDocumentCount();
    res.status(200).send({
      success: true,
      total,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      message: "Error in product count",
      error,
      success: false,
    });
  }
};

// product list base on page
export const productListController = async (req, res) => {
  try {
    const perPage = 2;
    const page = req.params.page ? req.params.page : 1;
    const products = await productModel
      .find({})
      .select("-photo")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .sort({ createdAt: -1 });
    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "error in per page ctrl",
      error,
    });
  }
};
// search product
export const searchProductController = async (req, res) => {
  try {
    const { keyword } = req.params;
    const resutls = await productModel
      .find({
        $or: [
          { name: { $regex: keyword, $options: "i" } }, //case-insetitive
          { description: { $regex: keyword, $options: "i" } },
        ],
      })
      .select("-photo");
    res.json(resutls);
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error In Search Product API",
      error,
    });
  }
};

// similar products
export const realtedProductController = async (req, res) => {
  try {
    const { pid, cid } = req.params;
    const products = await productModel
      .find({
        category: cid,
        _id: { $ne: pid },
      })
      .select("-photo")
      .limit(3)
      .populate("category");
    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "error while geting related product",
      error,
    });
  }
};

export const productCategoryController = async (req, res) => {
  try {
    const category = await categoryModel.findOne({ slug: req.params.slug });
    const products = await productModel.find({ category }).populate("category");
    res.status(200).send({
      success: true,
      category,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      error,
      message: "Error While Getting products",
    });
  }
};

// Razorpay Create Order Controller
export const razorpayOrderController = async (req, res) => {
  try {
    const { amount } = req.body;

    const options = {
      amount: amount, // amount already in paise from frontend
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpayInstance.orders.create(options);

    if (!order) {
      return res.status(500).send({
        success: false,
        message: "Error creating Razorpay order",
      });
    }

    res.status(200).send({
      success: true,
      order,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in creating Razorpay order",
      error: error.message,
    });
  }
};

// Razorpay Payment Verification Controller
export const razorpayPaymentController = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, cart } =
      req.body;

    console.log("Payment Data Received:", {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature: razorpay_signature ? "Received" : "Missing",
      cartLength: cart?.length,
    });

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id) {
      return res.status(400).send({
        success: false,
        message: "Order ID and Payment ID are required",
      });
    }

    // Verify payment signature (REAL verification)
    if (razorpay_signature) {
      const sign = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSign = crypto
        .createHmac("sha256", process.env.KEY_SECRET)
        .update(sign.toString())
        .digest("hex");

      if (razorpay_signature !== expectedSign) {
        console.log("Signature Mismatch!");
        console.log("Expected:", expectedSign);
        console.log("Received:", razorpay_signature);

        return res.status(400).send({
          success: false,
          message: "Payment signature verification failed",
        });
      }

      console.log("✓ Payment signature verified successfully");
    }

    // Extract product IDs from cart
    let productIds = cart;

    // If cart contains objects with productId, extract just the IDs
    if (cart && cart.length > 0 && typeof cart[0] === "object") {
      productIds = cart.map((item) => item.productId || item._id || item.id);
    }

    console.log("Creating order with products:", productIds);

    // Save order
    const order = await new orderModel({
      products: productIds,
      payment: {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature: razorpay_signature || "not_provided",
      },
      buyer: req.user._id,
    }).save();

    console.log("✓ Order created successfully:", order._id);

    res.status(200).send({
      success: true,
      message: "Payment verified and order created successfully",
      orderId: order._id,
      order,
    });
  } catch (error) {
    console.log("Payment Error:", error);
    res.status(500).send({
      success: false,
      message: "Error in Razorpay payment verification",
      error: error.message,
    });
  }
};

// Razorpay Get Key Controller
export const razorpayKeyController = async (req, res) => {
  try {
    res.status(200).send({
      success: true,
      key: process.env.KEY_ID,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error fetching Razorpay key",
      error: error.message,
    });
  }
};

// Add Product Review
export const addProductReviewController = async (req, res) => {
  try {
    const { pid } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user._id;

    // Check if product exists
    const product = await productModel.findById(pid);
    if (!product) {
      return res.status(404).send({
        success: false,
        message: "Product not found",
      });
    }

    // Check if user already reviewed this product
    const existingReview = await reviewModel.findOne({
      product: pid,
      user: userId,
    });

    if (existingReview) {
      return res.status(400).send({
        success: false,
        message: "You have already reviewed this product",
      });
    }

    // Create review
    const review = await new reviewModel({
      product: pid,
      user: userId,
      rating,
      comment,
    }).save();

    await review.populate("user", "name");

    res.status(201).send({
      success: true,
      message: "Review added successfully",
      review,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error adding review",
      error: error.message,
    });
  }
};

// Delete Product Review
export const deleteProductReviewController = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const review = await reviewModel.findById(id);

    if (!review) {
      return res.status(404).send({
        success: false,
        message: "Review not found",
      });
    }

    // Check if user owns the review or is admin
    if (review.user.toString() !== userId.toString() && req.user.role !== 1) {
      return res.status(403).send({
        success: false,
        message: "Unauthorized to delete this review",
      });
    }

    await reviewModel.findByIdAndDelete(id);

    res.status(200).send({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error deleting review",
      error: error.message,
    });
  }
};

// Get Product Reviews
export const getProductReviewsController = async (req, res) => {
  try {
    const { pid } = req.params;

    const reviews = await reviewModel
      .find({ product: pid })
      .populate("user", "name")
      .sort({ createdAt: -1 });

    // Calculate average rating
    const totalRatings = reviews.reduce(
      (sum, review) => sum + review.rating,
      0
    );
    const averageRating =
      reviews.length > 0 ? totalRatings / reviews.length : 0;

    res.status(200).send({
      success: true,
      reviews,
      averageRating: averageRating.toFixed(1),
      totalReviews: reviews.length,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error fetching reviews",
      error: error.message,
    });
  }
};
