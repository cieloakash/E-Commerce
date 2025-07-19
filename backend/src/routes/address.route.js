import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  addAddress,
  deleteAddress,
  getAllAddress,
  getSingleAddress,
} from "../controller/address.controller.js";

const addressRoute = express.Router();

addressRoute.post("/new", protectRoute, addAddress);
addressRoute.get("/all", protectRoute, getAllAddress);
addressRoute.get("/:id", protectRoute, getSingleAddress);
addressRoute.delete("/:id", protectRoute, deleteAddress);
export default addressRoute;
