import JWT from "jsonwebtoken";
import userModel from "../models/userModel.js";
//protected routes token base
export const requireSignIn = async (req, res, next) => {
  try {
    let token = req.headers.authorization;

    if (!token) {
      return res.status(401).send({
        success: false,
        message: "Authorization token is required",
      });
    }

    // Handle Bearer token format
    if (token.startsWith("Bearer ")) {
      token = token.slice(7, token.length);
    }

    const decode = JWT.verify(token, process.env.JWT_SECRET);
    req.user = decode;
    next();
  } catch (error) {
    console.log(error);
    return res.status(401).send({
      success: false,
      message: "Invalid or expired token",
      error: error.message,
    });
  }
};
//adim users
export const isAdmin = async (req, res, next) => {
  try {
    const user = await userModel.findById(req.user._id);
    if (user.role !== 1) {
      return res.send({
        success: true,
        message: "only admin can add new products",
      });
    } else {
      next();
    }
  } catch (error) {
    console.log(error);
    res.status(401).send({
      success: false,
      message: "Error in admin middleware",
    });
  }
};
