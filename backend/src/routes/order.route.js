import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  get_Stats,
  getAllOrder,
  getAllOrderAdmin,
  getMyOrder,
  newOrderCod,
  updateStatus,
} from "../controller/order.controller.js";

const orderRoute = express.Router();

orderRoute.post("/order/new/cod", protectRoute, newOrderCod);
orderRoute.get("/order/all", protectRoute, getAllOrder);
orderRoute.get("/order/admin/all", protectRoute, getAllOrderAdmin);
orderRoute.get("/order/:id", protectRoute, getMyOrder);
orderRoute.post("/order/:id", protectRoute, updateStatus);
orderRoute.get("/stats", protectRoute, get_Stats);

export default orderRoute;
