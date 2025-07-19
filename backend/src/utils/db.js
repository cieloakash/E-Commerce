import mongoose from "mongoose";

export const connectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGOOSE_URL,{
        dbName:"ecommerce"
    });
    console.log("connected to db");
    
  } catch (error) {
    console.error("MongoDB connection error", error);
  }
};
