import { Cart } from "../models/cart.model.js";
import { Product } from "../models/product.model.js";

export const addToCart = async (req, res) => {
  try {
    const { product } = req.body;
    const userId = req.user._id;

    // First check product stock
    const productDoc = await Product.findById(product);
    if (!productDoc) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (productDoc.stock === 0) {
      return res.status(400).json({ message: "Out of Stock" });
    }

    // Check if product already in cart
    let cart = await Cart.findOne({
      product: product,
      user: userId,
    }).populate("product");

    if (cart) {
      // Check if we can add more to cart
      if (cart.product.stock <= cart.quantity) {
        return res.status(400).json({ message: "Maximum quantity reached" });
      }

      // Increment quantity
      cart.quantity += 1;
      await cart.save();
      return res.status(200).json({
        message: "Quantity increased in cart",
        cart,
      });
    }

    // Product not in cart - create new cart item
    cart = await Cart.create({
      quantity: 1,
      product: product,
      user: userId,
    });

    // Populate product details in response
    const populatedCart = await Cart.findById(cart._id).populate("product");

    res.status(201).json({
      message: "Added to Cart",
      cart: populatedCart,
    });
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const removeItemFromCart = async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.id);
    await cart.deleteOne();
    res.json({ message: "Removed from cart" });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const updateCart = async (req, res) => {
  try {
    const { action } = res.query;
    if (action === "inc") {
      const { id } = req.body;
      const cart = await Cart.findById(id).populate("product");
      if (cart.quantity < cart.product.stock) {
        cart.quantity += 1;
        await cart.save();
      } else {
        return res.status(400).json({ message: "Out of Stock." });
      }
      res.status(200).json({ message: "cart updated." });
    }
    if (action === "dec") {
      const { id } = req.body;
      const cart = await Cart.findById(id).populate("product");
      if (cart.quantity > 1) {
        cart.quantity -= 1;
        await cart.save();
      } else {
        return res.status(400).json({ message: "Only one Item." });
      }
      res.status(200).json({ message: "cart updated." });
    }
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

// sumtotal
export const fetchData = async (req, res) => {
  try {
    const cart = await Cart.find({ user: req.user._id }).populate("product");
    const sumofQuantity = cart.reduce(
      (total, item) => total + item.quantity,
      0
    );
    let subtotal = 0;
    cart.forEach((i) => {
      const itemSubTotal = i.product.price * i.quantity;
      subtotal += itemSubTotal;
    });
    res.json({ cart, sumofQuantity, subtotal });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};
