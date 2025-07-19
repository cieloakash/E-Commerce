import express from "express";
import { protectRoute } from "../middleware/auth.middleware";
import {
  addToCart,
  fetchData,
  removeItemFromCart,
  updateCart,
} from "../controller/cart.controller.js";

const cartRoute = express.Router();

cartRoute.post("/add", protectRoute, addToCart);
cartRoute.get("/delete/:id", protectRoute, removeItemFromCart);
cartRoute.post("/update", protectRoute, updateCart);
cartRoute.get('/all',protectRoute,fetchData)
export default cartRoute;
