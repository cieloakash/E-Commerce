import { Cart } from "../models/cart.model.js";
import { Order } from "../models/order.model.js";
import { Product } from "../models/product.model.js";
import { OrderService } from "../utils/sendOrder.js";

export const newOrderCod = async (req, res) => {
  try {
    const { method, phone, address } = req.body;
    const cart = await Cart.find({ user: req.user_id }).populate({
      path: "product",
      select: "title price",
    });

    if (!cart.length) {
      return res.status(400).json({ message: "Cart is empty." });
    }
    let subtotal = 0;
    const item = cart.map((i) => {
      const itemSubtotal = i.product.price * i.quantity;
      subtotal += itemSubtotal;

      return {
        product: i.product._id,
        name: i.product.price,
        price: i.product.price,
        quantity: i.quantity,
      };
    });
    const order = await Order.create({
      items: item,
      user: req.user._id,
      method,
      phone,
      address,
      paidAt,
      subTotal: subtotal,
    });
    await order.save();

    //afterer reducing the stock of product in product database
    for (let i in order.items) {
      const product = await Product.findById(i.product);
      if (product) {
        product.stock -= i.quantity;
        product.sold += i.quantity;
        await product.save();
      }
    }

    await Cart.deleteMany({ user: req.user._id });
    await OrderService({
      email: req.user.email,
      subject: "Order confirmation detail",
      orderId: order._id,
      products: item,
      totalAmount: subtotal,
    });
    res
      .status(200)
      .json({ success: true, message: "Order created successfully.", order });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getAllOrder = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id });
    res.json({ orders: orders.reverse() });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getAllOrderAdmin = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Un-auhorized" });
    }
    const orders = await Order.find().populate("user").sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getMyOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("items.product")
      .populate("user");
    res.json(order);
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const updateStatus = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Un-auhorized" });
    }

    const order = await Order.findById(req.params.id);
    const { status } = req.body;
    order.status = status;

    await order.save();
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const get_Stats = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Un-auhorized" });
    }
    const cod = await Order.find({ method: "cod" }).countDocuments();
    const online = await Order.find({ method: "online" }).countDocuments();
    const product = await Product.find();

    const prodData = product.map((prod) => ({
      name: prod.title,
      sold: prod.sold,
    }));
    res.json({
      cod,
      online,
      prodData,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};
