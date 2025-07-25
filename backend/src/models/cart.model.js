import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
  quantity: {
    type: Number,
    required,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

export const Cart = mongoose.model("Cart", cartSchema);
