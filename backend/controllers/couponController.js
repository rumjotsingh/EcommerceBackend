import couponModel from "../models/couponModel.js";

// Create coupon (Admin)
export const createCouponController = async (req, res) => {
  try {
    const {
      code,
      discountType,
      discountValue,
      minPurchase,
      maxDiscount,
      expiryDate,
      usageLimit,
    } = req.body;

    // Validation
    if (!code || !discountType || !discountValue || !expiryDate) {
      return res.status(400).send({
        success: false,
        message: "Code, discount type, value, and expiry date are required",
      });
    }

    // Check if coupon code already exists
    const existingCoupon = await couponModel.findOne({
      code: code.toUpperCase(),
    });
    if (existingCoupon) {
      return res.status(400).send({
        success: false,
        message: "Coupon code already exists",
      });
    }

    // Validate discount value
    if (discountType === "percentage" && discountValue > 100) {
      return res.status(400).send({
        success: false,
        message: "Percentage discount cannot exceed 100%",
      });
    }

    // Create coupon
    const coupon = await new couponModel({
      code: code.toUpperCase(),
      discountType,
      discountValue,
      minPurchase: minPurchase || 0,
      maxDiscount: maxDiscount || null,
      expiryDate,
      usageLimit: usageLimit || null,
    }).save();

    res.status(201).send({
      success: true,
      message: "Coupon created successfully",
      coupon,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error creating coupon",
      error: error.message,
    });
  }
};

// Get all coupons
export const getAllCouponsController = async (req, res) => {
  try {
    const coupons = await couponModel.find({}).sort({ createdAt: -1 });

    res.status(200).send({
      success: true,
      count: coupons.length,
      coupons,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error fetching coupons",
      error: error.message,
    });
  }
};

// Apply coupon and calculate discount
export const applyCouponController = async (req, res) => {
  try {
    const { code, totalAmount } = req.body;

    if (!code || !totalAmount) {
      return res.status(400).send({
        success: false,
        message: "Coupon code and total amount are required",
      });
    }

    // Find coupon
    const coupon = await couponModel.findOne({ code: code.toUpperCase() });

    if (!coupon) {
      return res.status(404).send({
        success: false,
        message: "Invalid coupon code",
      });
    }

    // Check if coupon is active
    if (!coupon.isActive) {
      return res.status(400).send({
        success: false,
        message: "Coupon is not active",
      });
    }

    // Check expiry date
    if (new Date() > new Date(coupon.expiryDate)) {
      return res.status(400).send({
        success: false,
        message: "Coupon has expired",
      });
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).send({
        success: false,
        message: "Coupon usage limit reached",
      });
    }

    // Check minimum purchase
    if (totalAmount < coupon.minPurchase) {
      return res.status(400).send({
        success: false,
        message: `Minimum purchase amount is ₹${coupon.minPurchase}`,
      });
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discountType === "percentage") {
      discountAmount = (totalAmount * coupon.discountValue) / 100;
      // Apply max discount limit if set
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else {
      // Fixed discount
      discountAmount = coupon.discountValue;
    }

    // Calculate final amount
    const finalAmount = totalAmount - discountAmount;

    // Increment usage count
    await couponModel.findByIdAndUpdate(coupon._id, {
      $inc: { usedCount: 1 },
    });

    res.status(200).send({
      success: true,
      message: "Coupon applied successfully",
      data: {
        originalAmount: totalAmount,
        discountAmount: discountAmount.toFixed(2),
        finalAmount: finalAmount.toFixed(2),
        couponCode: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error applying coupon",
      error: error.message,
    });
  }
};

// Delete coupon (Admin)
export const deleteCouponController = async (req, res) => {
  try {
    const { id } = req.params;

    const coupon = await couponModel.findByIdAndDelete(id);

    if (!coupon) {
      return res.status(404).send({
        success: false,
        message: "Coupon not found",
      });
    }

    res.status(200).send({
      success: true,
      message: "Coupon deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error deleting coupon",
      error: error.message,
    });
  }
};

// Update coupon (Admin)
export const updateCouponController = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // If code is being updated, convert to uppercase
    if (updateData.code) {
      updateData.code = updateData.code.toUpperCase();
    }

    // Validate percentage discount
    if (
      updateData.discountType === "percentage" &&
      updateData.discountValue > 100
    ) {
      return res.status(400).send({
        success: false,
        message: "Percentage discount cannot exceed 100%",
      });
    }

    const coupon = await couponModel.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!coupon) {
      return res.status(404).send({
        success: false,
        message: "Coupon not found",
      });
    }

    res.status(200).send({
      success: true,
      message: "Coupon updated successfully",
      coupon,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error updating coupon",
      error: error.message,
    });
  }
};

// Toggle coupon status (Admin)
export const toggleCouponStatusController = async (req, res) => {
  try {
    const { id } = req.params;

    const coupon = await couponModel.findById(id);

    if (!coupon) {
      return res.status(404).send({
        success: false,
        message: "Coupon not found",
      });
    }

    coupon.isActive = !coupon.isActive;
    await coupon.save();

    res.status(200).send({
      success: true,
      message: `Coupon ${
        coupon.isActive ? "activated" : "deactivated"
      } successfully`,
      coupon,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error toggling coupon status",
      error: error.message,
    });
  }
};
