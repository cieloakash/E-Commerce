import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { connectDb } from "./src/utils/db.js";
import userRoute from "./src/routes/user.route.js";
import productRoute from "./src/routes/product.route.js";
import cartRoute from "./src/routes/cart.route.js";
import addressRoute from "./src/routes/address.route.js";
import orderRoute from "./src/routes/order.route.js";
dotenv.config();
const app = express();
app.use(express.json());
app.use(cookieParser());

app.use("/api", userRoute);
app.use("/api/product", productRoute);
app.use("/api/cart", cartRoute);
app.use("/api/address", addressRoute);
app.use("/api/order", orderRoute);

app.listen(process.env.PORT, () => {
  connectDb();
  console.log(`Server running at ${process.env.PORT}`);
});
