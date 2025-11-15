import orderModel from "../models/orderModel.js";
import productModel from "../models/productModel.js";

// Get overview analytics
export const getOverviewController = async (req, res) => {
  try {
    // Get total revenue - populate products to access prices
    const orders = await orderModel
      .find({ status: { $ne: "Cancelled" } })
      .populate("products", "price");

    let totalRevenue = 0;
    orders.forEach((order) => {
      if (order.products && order.products.length > 0) {
        order.products.forEach((product) => {
          if (product && product.price) {
            totalRevenue += product.price;
          }
        });
      }
    });

    // Get total orders
    const totalOrders = orders.length;

    // Get total products
    const totalProducts = await productModel.countDocuments();

    // Get pending orders
    const pendingOrders = await orderModel.countDocuments({
      status: "Not Process",
    });

    res.status(200).send({
      success: true,
      data: {
        totalRevenue: totalRevenue.toFixed(2),
        totalOrders,
        totalProducts,
        pendingOrders,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error fetching overview analytics",
      error: error.message,
    });
  }
};

// Get daily sales
export const getDailySalesController = async (req, res) => {
  try {
    const { days = 7 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const orders = await orderModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: { $ne: "Cancelled" },
        },
      },
      {
        $unwind: "$products",
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          totalSales: { $sum: "$products.price" },
          orderCount: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    res.status(200).send({
      success: true,
      data: orders.map((item) => ({
        date: item._id,
        sales: item.totalSales,
        orders: item.orderCount,
      })),
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error fetching daily sales",
      error: error.message,
    });
  }
};

// Get monthly sales
export const getMonthlySalesController = async (req, res) => {
  try {
    const { months = 6 } = req.query;

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - parseInt(months));

    const orders = await orderModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: { $ne: "Cancelled" },
        },
      },
      {
        $unwind: "$products",
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m", date: "$createdAt" },
          },
          totalSales: { $sum: "$products.price" },
          orderCount: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    res.status(200).send({
      success: true,
      data: orders.map((item) => ({
        month: item._id,
        sales: item.totalSales,
        orders: item.orderCount,
      })),
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error fetching monthly sales",
      error: error.message,
    });
  }
};

// Get top products
export const getTopProductsController = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const topProducts = await orderModel.aggregate([
      {
        $match: {
          status: { $ne: "Cancelled" },
        },
      },
      {
        $unwind: "$products",
      },
      {
        $lookup: {
          from: "products",
          localField: "products",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      {
        $unwind: "$productDetails",
      },
      {
        $group: {
          _id: "$products",
          totalSold: { $sum: 1 },
          totalRevenue: { $sum: "$productDetails.price" },
          productName: { $first: "$productDetails.name" },
        },
      },
      {
        $sort: { totalSold: -1 },
      },
      {
        $limit: parseInt(limit),
      },
    ]);

    res.status(200).send({
      success: true,
      data: topProducts.map((item) => ({
        productId: item._id,
        name: item.productName,
        totalSold: item.totalSold,
        revenue: item.totalRevenue ? item.totalRevenue.toFixed(2) : "0.00",
      })),
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error fetching top products",
      error: error.message,
    });
  }
};
