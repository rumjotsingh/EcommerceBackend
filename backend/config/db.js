import mongoose from "mongoose";

import colors from "colors";

const connectDb = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URL);
    console.log("connected to database".bgBlue);
  } catch (error) {
    console.log(error.bgRed);
  }
};
export default connectDb;
