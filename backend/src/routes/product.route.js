import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  createProduct,
  getAllProduct,
  getSingleProduct,
  updateImg,
  updateProduct,
} from "../controller/product.controller.js";
import { uploadFiles } from "../middleware/multer.js";

const productRoute = express.Router();

productRoute.post("/list", protectRoute, uploadFiles, createProduct);
productRoute.get("/all", getAllProduct);
productRoute.get("/:id", getSingleProduct);
productRoute.put("/:id", protectRoute, updateProduct);
productRoute.post("/:id", protectRoute, uploadFiles, updateImg);

export default productRoute;
